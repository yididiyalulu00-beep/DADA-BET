import React, { useState } from 'react';
import { Trash2, AlertTriangle, CheckCircle2, Ticket, Sparkles, X, ArrowUpRight } from 'lucide-react';
import { BetSlipItem, BetTicket, BetType, UserAccount } from '../types/sportsbook';
import { Language, getTranslation } from '../utils/i18n';

interface BetSlipProps {
  items: BetSlipItem[];
  user: UserAccount | null;
  onRemoveItem: (selectionId: string) => void;
  onClearAll: () => void;
  onPlaceBet: (stake: number, betType: BetType, acceptOddsChanges: boolean) => Promise<{ success: boolean; ticket?: BetTicket; error?: string; changedOdds?: any[] }>;
  isSubmitting: boolean;
  onCloseMobile?: () => void;
  language: Language;
}

export const BetSlip: React.FC<BetSlipProps> = ({
  items,
  user,
  onRemoveItem,
  onClearAll,
  onPlaceBet,
  isSubmitting,
  onCloseMobile,
  language,
}) => {
  const [betType, setBetType] = useState<BetType>('SINGLE');
  const [stake, setStake] = useState<number>(100);
  const [hasOddsChanged, setHasOddsChanged] = useState<boolean>(false);
  const [lastPlacedTicket, setLastPlacedTicket] = useState<BetTicket | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const t = (k: string) => getTranslation(k, language);

  const quickStakes = [50, 100, 250, 500, 1000];

  // Combined odds calculation
  const combinedOdds = items.reduce((acc, item) => acc * item.oddsAtPlacement, 1.0);
  const roundedCombinedOdds = Number(combinedOdds.toFixed(2));
  const estimatedReturn = Number((stake * roundedCombinedOdds).toFixed(2));

  // Acca bonus boost (e.g. 3 legs = +5%, 4 legs = +10%, 5+ legs = +20%)
  const legCount = items.length;
  const accaBonusPercent = legCount >= 5 ? 20 : legCount >= 4 ? 10 : legCount >= 3 ? 5 : 0;
  const accaBonusAmount = accaBonusPercent > 0 ? Number(((estimatedReturn * accaBonusPercent) / 100).toFixed(2)) : 0;
  const finalPayout = estimatedReturn + accaBonusAmount;

  const handlePlaceBetSubmit = async (acceptChanges: boolean = false) => {
    setErrorMessage(null);
    setHasOddsChanged(false);

    if (stake <= 0) {
      setErrorMessage('Stake must be greater than 0');
      return;
    }
    if (user && user.balance < stake) {
      setErrorMessage(`Insufficient demo balance (${user.balance} ETB). Claim more demo credits in your wallet.`);
      return;
    }

    const type = items.length > 1 ? betType : 'SINGLE';
    const result = await onPlaceBet(stake, type, acceptChanges);

    if (result.success && result.ticket) {
      setLastPlacedTicket(result.ticket);
    } else if (result.changedOdds && result.changedOdds.length > 0) {
      setHasOddsChanged(true);
      setErrorMessage(t('odds_changed_alert'));
    } else {
      setErrorMessage(result.error || 'Failed to place bet');
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#0b1018] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Bet Slip Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0e1420]">
        <div className="flex items-center gap-2">
          <Ticket className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            {t('betslip')}
          </span>
          {items.length > 0 && (
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
              {items.length}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {items.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-slate-400 hover:text-rose-400 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
              title="Clear all selections"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t('remove_all')}</span>
            </button>
          )}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              className="lg:hidden w-7 h-7 rounded-lg bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Bet Type Switcher (Single / Accumulator) */}
      {items.length > 1 && (
        <div className="p-2 border-b border-slate-800 bg-[#0d131e] flex gap-1">
          <button
            onClick={() => setBetType('SINGLE')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              betType === 'SINGLE'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
            }`}
          >
            {t('single')} ({items.length})
          </button>
          <button
            onClick={() => setBetType('ACCUMULATOR')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1 ${
              betType === 'ACCUMULATOR'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{t('accumulator')}</span>
            {accaBonusPercent > 0 && (
              <span className="bg-amber-400/20 text-amber-300 text-[10px] px-1 rounded font-mono">
                +{accaBonusPercent}%
              </span>
            )}
          </button>
        </div>
      )}

      {/* Odds Changed Alert Banner */}
      {hasOddsChanged && (
        <div className="bg-amber-500/10 border-b border-amber-500/30 p-3 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200">
            <p className="font-semibold">{t('odds_changed_alert')}</p>
            <button
              onClick={() => handlePlaceBetSubmit(true)}
              className="mt-2 px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded transition-colors cursor-pointer"
            >
              {t('accept_and_bet')}
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {errorMessage && !hasOddsChanged && (
        <div className="bg-rose-500/10 border-b border-rose-500/30 p-2.5 text-xs text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
          <span className="truncate">{errorMessage}</span>
        </div>
      )}

      {/* Items Scrollable List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {items.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center p-4 text-slate-500">
            <Ticket className="w-10 h-10 mb-2 stroke-1 text-slate-600" />
            <p className="text-xs max-w-[200px]">{t('betslip_empty')}</p>
          </div>
        ) : (
          items.map(item => (
            <div
              key={item.selectionId}
              className="bg-[#0e1522] border border-slate-800 rounded-xl p-3 relative group transition-all"
            >
              <button
                onClick={() => onRemoveItem(item.selectionId)}
                className="absolute top-2.5 right-2.5 text-slate-500 hover:text-rose-400 transition-colors cursor-pointer"
                aria-label="Remove selection"
              >
                <X className="w-3.5 h-3.5" />
              </button>

              {/* Match Header */}
              <div className="text-[11px] font-medium text-slate-400 truncate pr-6 mb-1">
                {item.fixtureName}
              </div>

              {/* Market Name */}
              <div className="text-xs font-semibold text-slate-300">
                {item.marketName}
              </div>

              {/* Selection & Odds */}
              <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/80">
                <span className="text-xs font-bold text-emerald-400 truncate max-w-[170px]">
                  {item.selectionLabel}
                </span>
                <span className="font-mono text-xs font-black text-white tabular-nums bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                  {item.oddsAtPlacement.toFixed(2)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Slip Footer / Stake & Action Section */}
      {items.length > 0 && (
        <div className="p-3.5 bg-[#0e1420] border-t border-slate-800 space-y-3">
          {/* Quick Stake Chips */}
          <div className="flex items-center justify-between gap-1">
            {quickStakes.map(s => (
              <button
                key={s}
                onClick={() => setStake(s)}
                className={`flex-1 py-1 text-[11px] font-mono font-bold rounded-lg border transition-colors cursor-pointer ${
                  stake === s
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Stake Input */}
          <div className="flex items-center justify-between bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1.5 focus-within:border-emerald-500 transition-colors">
            <span className="text-xs font-semibold text-slate-400">{t('total_stake')} (ETB)</span>
            <input
              type="number"
              min="1"
              value={stake}
              onChange={e => setStake(Math.max(1, Number(e.target.value)))}
              className="w-24 text-right font-mono font-bold text-sm bg-transparent text-white focus:outline-none"
            />
          </div>

          {/* Odds & Payout Breakdown */}
          <div className="space-y-1 text-xs pt-1">
            <div className="flex items-center justify-between text-slate-400">
              <span>{t('total_odds')}</span>
              <span className="font-mono font-bold text-slate-200 tabular-nums">
                {roundedCombinedOdds.toFixed(2)}
              </span>
            </div>

            {accaBonusPercent > 0 && betType === 'ACCUMULATOR' && (
              <div className="flex items-center justify-between text-amber-400 text-[11px]">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>+{accaBonusPercent}% Acca Bonus</span>
                </span>
                <span className="font-mono font-bold tabular-nums">
                  +{accaBonusAmount.toFixed(2)} ETB
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm font-bold text-emerald-400 pt-1 border-t border-slate-800/80">
              <span>{t('potential_return')}</span>
              <span className="font-mono text-base font-black text-white tabular-nums">
                {finalPayout.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
              </span>
            </div>
          </div>

          {/* Place Bet CTA */}
          <button
            disabled={isSubmitting || items.length === 0}
            onClick={() => handlePlaceBetSubmit(false)}
            className="w-full h-11 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 active:scale-[0.99] disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="animate-pulse">{t('placing_bet')}</span>
            ) : (
              <>
                <Ticket className="w-4 h-4" />
                <span>{t('place_bet')}</span>
              </>
            )}
          </button>

          {/* Regulatory Disclaimer */}
          <div className="text-[10px] text-slate-500 text-center leading-tight">
            Potential return = stake × combined odds. Simulated demo wagering only.
          </div>
        </div>
      )}

      {/* Bet Success Receipt Modal */}
      {lastPlacedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e1522] border border-emerald-500/50 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-bold">Bet Placed Successfully!</span>
              </div>
              <button
                onClick={() => setLastPlacedTicket(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-900/90 rounded-xl p-3 border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>{t('ticket_num')}</span>
                <span className="font-mono font-bold text-white">{lastPlacedTicket.ticketNumber}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Type</span>
                <span className="font-semibold text-slate-200">{lastPlacedTicket.betType}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Stake</span>
                <span className="font-mono font-bold text-white">{lastPlacedTicket.stake} ETB</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Combined Odds</span>
                <span className="font-mono font-bold text-emerald-400">{lastPlacedTicket.combinedOdds.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold pt-2 border-t border-slate-800">
                <span>Est. Return</span>
                <span className="font-mono text-sm text-white font-black">{lastPlacedTicket.potentialPayout.toFixed(2)} ETB</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center">
              Your bet has been recorded on the server ledger. Track live status in <strong>My Bets</strong>.
            </p>

            <button
              onClick={() => setLastPlacedTicket(null)}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
