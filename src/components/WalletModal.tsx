import React, { useState } from 'react';
import { X, Wallet, ArrowDownRight, ArrowUpRight, Plus, RefreshCw, ShieldCheck, QrCode } from 'lucide-react';
import { UserAccount, WalletLedgerEntry } from '../types/sportsbook';
import { Language, getTranslation } from '../utils/i18n';

interface WalletModalProps {
  user: UserAccount | null;
  ledger: WalletLedgerEntry[];
  onClaimCredits: (amount: number) => Promise<void>;
  onTriggerPaymentSandbox: (provider: 'TELEBIRR_SANDBOX' | 'CBE_BIRR_SANDBOX', amount: number) => Promise<void>;
  onClose: () => void;
  language: Language;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  user,
  ledger,
  onClaimCredits,
  onTriggerPaymentSandbox,
  onClose,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'DEPOSIT' | 'LEDGER' | 'PAYMENT_ADAPTERS'>('DEPOSIT');
  const [isClaiming, setIsClaiming] = useState(false);
  const [sandboxAmount, setSandboxAmount] = useState(500);
  const [isProcessingSandbox, setIsProcessingSandbox] = useState(false);

  const t = (k: string) => getTranslation(k, language);

  const handleClaim = async (amount: number) => {
    setIsClaiming(true);
    try {
      await onClaimCredits(amount);
    } finally {
      setIsClaiming(false);
    }
  };

  const handleSandboxSimulate = async (provider: 'TELEBIRR_SANDBOX' | 'CBE_BIRR_SANDBOX') => {
    setIsProcessingSandbox(true);
    try {
      await onTriggerPaymentSandbox(provider, sandboxAmount);
    } finally {
      setIsProcessingSandbox(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-[#0b1018] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#0d1420]">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {t('balance')} & Ledger
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Balance Card Strip */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-emerald-950/20 p-5 border-b border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="text-[11px] font-mono text-emerald-400 uppercase tracking-wider">
              Active Demo Balance
            </div>
            <div className="text-3xl font-black font-mono text-white tabular-nums mt-0.5">
              {user ? user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 }) : '0.00'} <span className="text-emerald-400 text-lg">ETB</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Sandbox Test Funds · Strict Server Authoritative Ledger
            </div>
          </div>

          <button
            disabled={isClaiming}
            onClick={() => handleClaim(1000)}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{isClaiming ? 'Granting...' : '+1,000 ETB Demo Reload'}</span>
          </button>
        </div>

        {/* Tab Selector */}
        <div className="px-5 py-2.5 border-b border-slate-800 bg-[#0c121c] flex gap-2">
          <button
            onClick={() => setActiveTab('DEPOSIT')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'DEPOSIT'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            Reload Test Credits
          </button>
          <button
            onClick={() => setActiveTab('PAYMENT_ADAPTERS')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'PAYMENT_ADAPTERS'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            Payment Provider Sandboxes
          </button>
          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
              activeTab === 'LEDGER'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            Immutable Ledger ({ledger.length})
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'DEPOSIT' && (
            <div className="space-y-4">
              <div className="bg-[#0e1522] border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Instant Sandbox Top-Up
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  DADA BET enforces strict separation between demonstration balances and real financial processing. Use the options below to top-up your simulated balance at any time during QA testing.
                </p>

                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  {[500, 1000, 5000].map(amt => (
                    <button
                      key={amt}
                      disabled={isClaiming}
                      onClick={() => handleClaim(amt)}
                      className="p-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-center cursor-pointer transition-all"
                    >
                      <div className="text-sm font-black font-mono text-emerald-400">+{amt} ETB</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Quick Grant</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-3.5 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-200/90 leading-relaxed">
                  <strong>Regulatory Safety Notice:</strong> Real money payments, credit card processing, and withdrawal gateways will remain disabled until independent jurisdictional compliance, operator licensing, and financial security penetration testing are completed.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'PAYMENT_ADAPTERS' && (
            <div className="space-y-4">
              <div className="bg-[#0e1522] border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Ethiopian Gateway Sandbox Architecture
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Demonstrates the server-side provider adapters for Telebirr and CBE Birr with cryptographically signed webhook simulation and replay protection.
                </p>

                <div className="flex items-center gap-3 pt-2">
                  <div className="text-xs text-slate-300 font-medium">Test Amount:</div>
                  <div className="flex gap-2">
                    {[250, 500, 1000].map(val => (
                      <button
                        key={val}
                        onClick={() => setSandboxAmount(val)}
                        className={`px-3 py-1 text-xs font-mono font-bold rounded-lg border cursor-pointer ${
                          sandboxAmount === val
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                        }`}
                      >
                        {val} ETB
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {/* Telebirr Sandbox */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">Telebirr Sandbox</span>
                      <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        API ADAPTER READY
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Simulates USSD / QR Push notification with HMAC signature validation.
                    </div>
                    <button
                      disabled={isProcessingSandbox}
                      onClick={() => handleSandboxSimulate('TELEBIRR_SANDBOX')}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Simulate Telebirr Webhook ({sandboxAmount} ETB)</span>
                    </button>
                  </div>

                  {/* CBE Birr Sandbox */}
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">CBE Birr Sandbox</span>
                      <span className="text-[10px] text-sky-400 font-mono bg-sky-500/10 px-1.5 py-0.5 rounded">
                        API ADAPTER READY
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Simulates Commercial Bank of Ethiopia merchant checkout & signed IPN.
                    </div>
                    <button
                      disabled={isProcessingSandbox}
                      onClick={() => handleSandboxSimulate('CBE_BIRR_SANDBOX')}
                      className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>Simulate CBE Webhook ({sandboxAmount} ETB)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'LEDGER' && (
            <div className="space-y-2">
              <div className="text-[11px] text-slate-400">
                All balance mutations write an immutable ledger entry on the server.
              </div>

              {ledger.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No ledger transactions recorded yet.
                </div>
              ) : (
                ledger.map(entry => {
                  const isCredit = entry.amount > 0;

                  return (
                    <div
                      key={entry.id}
                      className="bg-[#0e1522] border border-slate-800 rounded-xl p-3 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isCredit
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {isCredit ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{entry.description}</div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            {entry.id} · Ref: {entry.referenceId}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 ml-2">
                        <div
                          className={`font-mono font-bold ${
                            isCredit ? 'text-emerald-400' : 'text-slate-300'
                          }`}
                        >
                          {isCredit ? '+' : ''}{entry.amount.toFixed(2)} ETB
                        </div>
                        <div className="text-[10px] text-slate-500 font-mono">
                          Bal: {entry.balanceAfter.toFixed(2)} ETB
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
