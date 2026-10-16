import React, { useState } from 'react';
import { X, Radio, Clock, BarChart2, Shield, Lock } from 'lucide-react';
import { Fixture, MarketSelection } from '../types/sportsbook';
import { Language, getTranslation } from '../utils/i18n';

interface MatchDetailsModalProps {
  fixture: Fixture;
  selectedSelectionIds: Set<string>;
  onSelectOdds: (fixture: Fixture, marketId: string, selection: MarketSelection) => void;
  onClose: () => void;
  language: Language;
}

export const MatchDetailsModal: React.FC<MatchDetailsModalProps> = ({
  fixture,
  selectedSelectionIds,
  onSelectOdds,
  onClose,
  language,
}) => {
  const [activeMarketTab, setActiveMarketTab] = useState<string>('ALL');
  const t = (k: string) => getTranslation(k, language);

  const isLive = fixture.status === 'LIVE' || fixture.status === 'HALFTIME';
  const homeName = language === 'am' ? fixture.homeTeam.nameAm : fixture.homeTeam.name;
  const awayName = language === 'am' ? fixture.awayTeam.nameAm : fixture.awayTeam.name;

  const marketTabs = [
    { id: 'ALL', label: 'All Markets' },
    { id: '1X2', label: 'Match Result' },
    { id: 'OVER_UNDER', label: 'Goals Over/Under' },
    { id: 'BTTS', label: 'Both to Score' },
    { id: 'DOUBLE_CHANCE', label: 'Double Chance' },
    { id: 'CORRECT_SCORE', label: 'Correct Score' },
  ];

  const filteredMarkets =
    activeMarketTab === 'ALL'
      ? fixture.markets
      : fixture.markets.filter(m => m.type === activeMarketTab);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#0b1018] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[90vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#0d1420]">
          <div className="flex items-center gap-2 text-xs text-slate-400 truncate">
            <span className="font-bold text-slate-200">{fixture.leagueName}</span>
            <span aria-hidden="true">·</span>
            <span>Feed: {fixture.providerId}</span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Match Pitch Visualizer & Score Banner */}
        <div className="relative bg-gradient-to-b from-[#091522] via-[#0d1c2d] to-[#091522] p-6 border-b border-slate-800">
          {/* Status Kicker */}
          <div className="text-center mb-4">
            {isLive ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span>LIVE {fixture.status === 'HALFTIME' ? 'HALFTIME' : `${fixture.minute}'`}</span>
              </div>
            ) : fixture.status === 'FINISHED' ? (
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                FULL TIME RESULT
              </span>
            ) : (
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
                Kickoff: {new Date(fixture.kickoffTime).toLocaleString()}
              </span>
            )}
          </div>

          {/* Teams Header */}
          <div className="grid grid-cols-3 items-center text-center">
            {/* Home Team */}
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl mb-1">{fixture.homeTeam.badgeEmoji}</span>
              <span className="text-sm sm:text-base font-bold text-white max-w-[130px] truncate">
                {homeName}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Home</span>
            </div>

            {/* Score Center */}
            <div className="flex flex-col items-center">
              {isLive || fixture.status === 'FINISHED' ? (
                <div className="text-3xl sm:text-5xl font-black font-mono text-white tracking-wider flex items-center gap-2">
                  <span>{fixture.currentScore.home}</span>
                  <span className="text-emerald-400 font-light">-</span>
                  <span>{fixture.currentScore.away}</span>
                </div>
              ) : (
                <div className="text-xl sm:text-2xl font-bold font-mono text-slate-400">
                  VS
                </div>
              )}
            </div>

            {/* Away Team */}
            <div className="flex flex-col items-center">
              <span className="text-3xl sm:text-4xl mb-1">{fixture.awayTeam.badgeEmoji}</span>
              <span className="text-sm sm:text-base font-bold text-white max-w-[130px] truncate">
                {awayName}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">Away</span>
            </div>
          </div>

          {/* Live Pitch Statistics (Possession, Shots, Corners) */}
          {fixture.stats && (
            <div className="mt-5 pt-4 border-t border-slate-800/80 max-w-md mx-auto space-y-2 text-xs">
              {/* Possession Bar */}
              <div>
                <div className="flex justify-between text-[11px] text-slate-300 font-mono mb-1">
                  <span>{fixture.stats.possession[0]}% Possession</span>
                  <span>{fixture.stats.possession[1]}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${fixture.stats.possession[0]}%` }}
                  />
                  <div
                    className="h-full bg-sky-500 transition-all duration-500"
                    style={{ width: `${fixture.stats.possession[1]}%` }}
                  />
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-2 text-center text-[11px] text-slate-400 pt-1">
                <div>
                  <span className="font-mono text-white font-bold">{fixture.stats.shotsOnTarget[0]} - {fixture.stats.shotsOnTarget[1]}</span>
                  <div className="text-[10px] text-slate-500">Shots on Target</div>
                </div>
                <div>
                  <span className="font-mono text-white font-bold">{fixture.stats.corners[0]} - {fixture.stats.corners[1]}</span>
                  <div className="text-[10px] text-slate-500">Corners</div>
                </div>
                <div>
                  <span className="font-mono text-white font-bold">{fixture.stats.yellowCards[0]} - {fixture.stats.yellowCards[1]}</span>
                  <div className="text-[10px] text-slate-500">Cards (Y/R)</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Market Category Navigation Bar */}
        <div className="px-5 py-2.5 border-b border-slate-800 bg-[#0d1420] overflow-x-auto no-scrollbar flex items-center gap-2">
          {marketTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveMarketTab(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                activeMarketTab === tab.id
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Markets Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {filteredMarkets.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              No markets open in this category.
            </div>
          ) : (
            filteredMarkets.map(market => {
              const isMarketSuspended = market.status === 'SUSPENDED';

              return (
                <div
                  key={market.id}
                  className="bg-[#0e141f] border border-slate-800/80 rounded-xl p-3.5 space-y-2.5"
                >
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                    <span>{language === 'am' ? market.nameAm : market.name}</span>
                    {isMarketSuspended && (
                      <span className="text-[10px] text-amber-400 font-mono uppercase bg-amber-500/10 px-2 py-0.5 rounded">
                        Market Suspended
                      </span>
                    )}
                  </div>

                  <div className={`grid gap-2 ${
                    market.selections.length === 2
                      ? 'grid-cols-2'
                      : market.selections.length === 3
                      ? 'grid-cols-3'
                      : 'grid-cols-2 sm:grid-cols-4'
                  }`}>
                    {market.selections.map(sel => {
                      const isSelected = selectedSelectionIds.has(sel.id);
                      const isSuspended = sel.suspended || isMarketSuspended;

                      return (
                        <button
                          key={sel.id}
                          disabled={isSuspended}
                          onClick={() => onSelectOdds(fixture, market.id, sel)}
                          className={`min-h-[46px] p-2 flex items-center justify-between rounded-lg border transition-all cursor-pointer ${
                            isSuspended
                              ? 'bg-slate-900/30 border-slate-800/50 text-slate-600 cursor-not-allowed'
                              : isSelected
                              ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-md'
                              : 'bg-slate-900/80 hover:bg-slate-800 border-slate-800 hover:border-emerald-500/50 text-slate-300'
                          }`}
                        >
                          <span className={`text-xs font-medium truncate mr-1.5 ${isSelected ? 'text-slate-950' : 'text-slate-300'}`}>
                            {language === 'am' ? sel.labelAm : sel.label}
                          </span>
                          {isSuspended ? (
                            <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                          ) : (
                            <span className={`font-mono text-xs font-bold tabular-nums shrink-0 ${isSelected ? 'text-slate-950 font-black' : 'text-emerald-400'}`}>
                              {sel.odds.toFixed(2)}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
