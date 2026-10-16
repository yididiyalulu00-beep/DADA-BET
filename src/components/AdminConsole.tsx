import React, { useState } from 'react';
import { X, Settings, Activity, CheckCircle, ShieldAlert, Sliders, RefreshCw, AlertCircle, FileText } from 'lucide-react';
import { Fixture, SystemAuditLog } from '../types/sportsbook';
import { Language, getTranslation } from '../utils/i18n';

interface AdminConsoleProps {
  fixtures: Fixture[];
  auditLogs: SystemAuditLog[];
  metrics: {
    totalBetsPlaced: number;
    totalStakeVolume: number;
    totalPayouts: number;
    grossGamingRevenue: number;
    pendingTickets: number;
    activeUsers: number;
    feedStatus: string;
    environment: string;
  };
  onSettleFixture: (fixtureId: string, homeScore: number, awayScore: number) => Promise<{ success: boolean; settledTicketsCount?: number; totalPayoutAmount?: number; error?: string }>;
  onUpdateOdds: (fixtureId: string, marketId: string, selectionId: string, newOdds: number) => Promise<void>;
  onToggleMarketSuspension: (fixtureId: string, marketId: string, suspended?: boolean) => Promise<void>;
  onUpdateLiveMatch: (fixtureId: string, homeScore: number, awayScore: number, minute: number, status?: Fixture['status']) => Promise<void>;
  onRefreshMetrics: () => Promise<void>;
  onClose: () => void;
  language: Language;
}

export const AdminConsole: React.FC<AdminConsoleProps> = ({
  fixtures,
  auditLogs,
  metrics,
  onSettleFixture,
  onUpdateOdds,
  onToggleMarketSuspension,
  onUpdateLiveMatch,
  onRefreshMetrics,
  onClose,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'SETTLEMENT' | 'FIXTURES' | 'AUDIT'>('SETTLEMENT');
  const [selectedFixtureId, setSelectedFixtureId] = useState<string>(fixtures[0]?.id || '');
  const [settleHome, setSettleHome] = useState<number>(2);
  const [settleAway, setSettleAway] = useState<number>(1);
  const [settleFeedback, setSettleFeedback] = useState<string | null>(null);
  const [isSettling, setIsSettling] = useState(false);

  // Live match control state
  const [liveHome, setLiveHome] = useState<number>(2);
  const [liveAway, setLiveAway] = useState<number>(1);
  const [liveMinute, setLiveMinute] = useState<number>(75);

  const selectedFixture = fixtures.find(f => f.id === selectedFixtureId);

  const handleSettle = async () => {
    if (!selectedFixtureId) return;
    setIsSettling(true);
    setSettleFeedback(null);
    try {
      const res = await onSettleFixture(selectedFixtureId, settleHome, settleAway);
      if (res.success) {
        setSettleFeedback(
          `Settlement Complete: ${res.settledTicketsCount} tickets evaluated, ${res.totalPayoutAmount?.toFixed(2)} ETB paid out to winning users.`
        );
      } else {
        setSettleFeedback(`Error: ${res.error}`);
      }
    } finally {
      setIsSettling(false);
    }
  };

  const handleLiveScoreUpdate = async () => {
    if (!selectedFixtureId) return;
    await onUpdateLiveMatch(selectedFixtureId, liveHome, liveAway, liveMinute, 'LIVE');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-[#0b1018] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#0e1420]">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <span>DADA BET Admin & Risk Console</span>
                <span className="text-[10px] text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded font-mono">
                  STAFF LEVEL ACCESS
                </span>
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* System KPIs Grid */}
        <div className="p-4 bg-[#0d131f] border-b border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-mono">Total Volume</span>
            <div className="font-mono text-base font-black text-white tabular-nums mt-0.5">
              {metrics.totalStakeVolume.toLocaleString()} ETB
            </div>
            <div className="text-[10px] text-slate-500">{metrics.totalBetsPlaced} Tickets Placed</div>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-mono">Total Payouts</span>
            <div className="font-mono text-base font-black text-emerald-400 tabular-nums mt-0.5">
              {metrics.totalPayouts.toLocaleString()} ETB
            </div>
            <div className="text-[10px] text-slate-500">Credited to Users</div>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-mono">Gross Gaming Rev</span>
            <div className={`font-mono text-base font-black tabular-nums mt-0.5 ${metrics.grossGamingRevenue >= 0 ? 'text-amber-400' : 'text-rose-400'}`}>
              {metrics.grossGamingRevenue.toLocaleString()} ETB
            </div>
            <div className="text-[10px] text-slate-500">Net Book Margin</div>
          </div>

          <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[10px] uppercase font-mono">Data Feed Health</span>
            <div className="font-mono text-xs font-bold text-emerald-400 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>FEED ONLINE</span>
            </div>
            <div className="text-[10px] text-slate-500 truncate">{metrics.feedStatus}</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 py-2 border-b border-slate-800 bg-[#0c111a] flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('SETTLEMENT')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'SETTLEMENT'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white'
              }`}
            >
              Result Settlement Console
            </button>
            <button
              onClick={() => setActiveTab('FIXTURES')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'FIXTURES'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white'
              }`}
            >
              Fixture & Odds Controller
            </button>
            <button
              onClick={() => setActiveTab('AUDIT')}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                activeTab === 'AUDIT'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white'
              }`}
            >
              System Audit Logs ({auditLogs.length})
            </button>
          </div>

          <button
            onClick={onRefreshMetrics}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title="Refresh Metrics"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'SETTLEMENT' && (
            <div className="space-y-4">
              <div className="bg-[#0e1522] border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Official Match Settlement Tester
                  </h3>
                  <span className="text-[10px] text-amber-300 font-mono">
                    AUTOMATIC LEDGER PAYOUT DISPATCH
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Select any active fixture, enter the final score, and click Settle. The server will atomically evaluate all 1X2, Over/Under, BTTS, Double Chance, and Correct Score markets, and credit winnings directly to user balances.
                </p>

                {/* Fixture Selector */}
                <div className="space-y-2 pt-2">
                  <label className="text-xs font-semibold text-slate-300">Choose Fixture to Settle:</label>
                  <select
                    value={selectedFixtureId}
                    onChange={e => setSelectedFixtureId(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-xs rounded-xl p-2.5 focus:border-amber-500 focus:outline-none"
                  >
                    {fixtures.map(f => (
                      <option key={f.id} value={f.id}>
                        {f.homeTeam.name} vs {f.awayTeam.name} ({f.leagueName}) - [{f.status}]
                      </option>
                    ))}
                  </select>
                </div>

                {/* Score Input Row */}
                {selectedFixture && (
                  <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 space-y-3">
                    <div className="text-xs font-semibold text-slate-300">Final Official Score:</div>
                    <div className="grid grid-cols-2 gap-4 items-center">
                      <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-xs font-bold text-white truncate mr-2">
                          {selectedFixture.homeTeam.name}
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={settleHome}
                          onChange={e => setSettleHome(Number(e.target.value))}
                          className="w-14 text-center font-mono font-bold text-sm bg-slate-800 rounded py-1 text-white"
                        />
                      </div>

                      <div className="flex items-center justify-between bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <span className="text-xs font-bold text-white truncate mr-2">
                          {selectedFixture.awayTeam.name}
                        </span>
                        <input
                          type="number"
                          min="0"
                          value={settleAway}
                          onChange={e => setSettleAway(Number(e.target.value))}
                          className="w-14 text-center font-mono font-bold text-sm bg-slate-800 rounded py-1 text-white"
                        />
                      </div>
                    </div>

                    <button
                      disabled={isSettling}
                      onClick={handleSettle}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
                    >
                      {isSettling ? 'Settling & Computing Payouts...' : 'Settle Match & Pay Winners'}
                    </button>
                  </div>
                )}

                {settleFeedback && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{settleFeedback}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'FIXTURES' && (
            <div className="space-y-4">
              <div className="bg-[#0e1522] border border-slate-800 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Live Match Simulation & Score Push
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] text-slate-400">Home Goals</label>
                    <input
                      type="number"
                      value={liveHome}
                      onChange={e => setLiveHome(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 text-white font-mono p-2 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Away Goals</label>
                    <input
                      type="number"
                      value={liveAway}
                      onChange={e => setLiveAway(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 text-white font-mono p-2 rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-slate-400">Match Minute</label>
                    <input
                      type="number"
                      value={liveMinute}
                      onChange={e => setLiveMinute(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-800 text-white font-mono p-2 rounded-lg text-xs"
                    />
                  </div>
                </div>

                <button
                  onClick={handleLiveScoreUpdate}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg cursor-pointer"
                >
                  Push Live Match Update
                </button>
              </div>

              {/* Markets Suspension & Odds Shifter */}
              {selectedFixture && (
                <div className="bg-[#0e1522] border border-slate-800 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Markets for {selectedFixture.homeTeam.name} vs {selectedFixture.awayTeam.name}
                  </h3>

                  <div className="space-y-2">
                    {selectedFixture.markets.map(mkt => (
                      <div
                        key={mkt.id}
                        className="bg-slate-900/90 p-3 rounded-lg border border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <div className="text-xs font-semibold text-slate-200">{mkt.name}</div>
                          <div className="text-[10px] text-slate-500">Status: {mkt.status}</div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onToggleMarketSuspension(selectedFixture.id, mkt.id)}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded cursor-pointer ${
                              mkt.status === 'SUSPENDED'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                            }`}
                          >
                            {mkt.status === 'SUSPENDED' ? 'Resume Market' : 'Suspend Market'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'AUDIT' && (
            <div className="space-y-2">
              <div className="text-[11px] text-slate-400">
                Server-side append-only security and risk audit trail:
              </div>

              {auditLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">No audit events recorded.</div>
              ) : (
                auditLogs.map(log => (
                  <div
                    key={log.id}
                    className="bg-[#0e1522] border border-slate-800 rounded-xl p-3 text-xs space-y-1 font-mono"
                  >
                    <div className="flex items-center justify-between text-slate-400 text-[10px]">
                      <span className="text-amber-400 font-bold">{log.action}</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="text-slate-200">{log.details}</div>
                    <div className="text-slate-500 text-[10px]">
                      Actor: {log.actorId} · Entity: {log.entityType} ({log.entityId})
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
