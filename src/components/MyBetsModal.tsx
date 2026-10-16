import React, { useState } from 'react';
import { X, Receipt, CheckCircle, XCircle, Clock, ArrowRight, Zap } from 'lucide-react';
import { BetTicket } from '../types/sportsbook';
import { Language, getTranslation } from '../utils/i18n';

interface MyBetsModalProps {
  tickets: (BetTicket & { cashoutValue?: number | null })[];
  onCashout: (ticketId: string) => Promise<void>;
  onClose: () => void;
  language: Language;
}

export const MyBetsModal: React.FC<MyBetsModalProps> = ({
  tickets,
  onCashout,
  onClose,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'OPEN' | 'SETTLED'>('OPEN');
  const [cashingOutId, setCashingOutId] = useState<string | null>(null);

  const t = (k: string) => getTranslation(k, language);

  const openTickets = tickets.filter(t => t.status === 'PENDING');
  const settledTickets = tickets.filter(t => t.status !== 'PENDING');

  const displayedTickets = activeTab === 'OPEN' ? openTickets : settledTickets;

  const handleCashoutClick = async (ticketId: string) => {
    setCashingOutId(ticketId);
    try {
      await onCashout(ticketId);
    } finally {
      setCashingOutId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#0b1018] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[85vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#0d1420]">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {t('my_bets')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection (Active vs Settled) */}
        <div className="p-3 border-b border-slate-800 bg-[#0c121c] flex gap-2">
          <button
            onClick={() => setActiveTab('OPEN')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'OPEN'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t('open_bets')} ({openTickets.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('SETTLED')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'SETTLED'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{t('settled_bets')} ({settledTickets.length})</span>
          </button>
        </div>

        {/* Tickets List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1">
          {displayedTickets.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-xs">
              No {activeTab.toLowerCase()} tickets found.
            </div>
          ) : (
            displayedTickets.map(ticket => {
              const isWon = ticket.status === 'WON';
              const isLost = ticket.status === 'LOST';
              const isPending = ticket.status === 'PENDING';

              return (
                <div
                  key={ticket.id}
                  className="bg-[#0e1522] border border-slate-800 rounded-xl p-4 space-y-3 transition-all"
                >
                  {/* Ticket Header */}
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800/80">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">#{ticket.ticketNumber}</span>
                      <span className="text-[10px] text-slate-400 uppercase bg-slate-800/80 px-2 py-0.5 rounded">
                        {ticket.betType}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="flex items-center gap-1">
                      {isWon && (
                        <span className="text-emerald-400 text-xs font-bold flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded">
                          <CheckCircle className="w-3.5 h-3.5" /> WON
                        </span>
                      )}
                      {isLost && (
                        <span className="text-rose-400 text-xs font-bold flex items-center gap-1 bg-rose-500/10 px-2 py-0.5 rounded">
                          <XCircle className="w-3.5 h-3.5" /> LOST
                        </span>
                      )}
                      {isPending && (
                        <span className="text-amber-400 text-xs font-bold flex items-center gap-1 bg-amber-500/10 px-2 py-0.5 rounded">
                          <Clock className="w-3.5 h-3.5" /> IN PROGRESS
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Selections breakdown */}
                  <div className="space-y-2">
                    {ticket.selections.map(sel => (
                      <div
                        key={sel.selectionId}
                        className="flex items-center justify-between text-xs bg-slate-900/40 p-2 rounded-lg"
                      >
                        <div className="truncate mr-2">
                          <div className="font-medium text-slate-300 truncate">{sel.fixtureName}</div>
                          <div className="text-[10px] text-slate-500">{sel.marketName}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-emerald-400 font-semibold">{sel.selectionLabel}</span>
                          <span className="ml-1.5 font-mono text-white font-bold">@{sel.oddsAtPlacement.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Financial Numbers & Cashout Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center gap-4 text-slate-400">
                      <div>
                        <span>Stake: </span>
                        <strong className="text-white font-mono">{ticket.stake} ETB</strong>
                      </div>
                      <div>
                        <span>Combined Odds: </span>
                        <strong className="text-emerald-400 font-mono">{ticket.combinedOdds.toFixed(2)}</strong>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] text-slate-400 uppercase">
                        {isWon ? 'Payout Credited' : 'Potential Return'}
                      </div>
                      <div className="font-mono text-sm font-black text-white">
                        {(isWon ? ticket.payoutAmount || ticket.potentialPayout : ticket.potentialPayout).toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                      </div>
                    </div>
                  </div>

                  {/* Cash Out Button if eligible */}
                  {isPending && ticket.cashoutValue && ticket.cashoutValue > 0 && (
                    <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between">
                      <div className="text-xs text-amber-300 flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>Live Cash Out Available</span>
                      </div>
                      <button
                        disabled={cashingOutId === ticket.id}
                        onClick={() => handleCashoutClick(ticket.id)}
                        className="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        {cashingOutId === ticket.id ? (
                          <span>Processing...</span>
                        ) : (
                          <>
                            <span>Cash Out</span>
                            <span className="font-mono font-black">{ticket.cashoutValue.toFixed(2)} ETB</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {ticket.settlementNotes && (
                    <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded border border-slate-800/60 font-mono">
                      {ticket.settlementNotes}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
