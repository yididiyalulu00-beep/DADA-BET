import React from 'react';
import { Radio, Clock, ChevronRight, Lock } from 'lucide-react';
import { Fixture, MarketSelection } from '../types/sportsbook';
import { Language, getTranslation } from '../utils/i18n';

interface MatchCardProps {
  fixture: Fixture;
  selectedSelectionIds: Set<string>;
  onSelectOdds: (fixture: Fixture, marketId: string, selection: MarketSelection) => void;
  onOpenDetails: (fixture: Fixture) => void;
  language: Language;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  fixture,
  selectedSelectionIds,
  onSelectOdds,
  onOpenDetails,
  language,
}) => {
  const t = (k: string) => getTranslation(k, language);
  const isLive = fixture.status === 'LIVE' || fixture.status === 'HALFTIME';
  const isFinished = fixture.status === 'FINISHED';

  const matchWinnerMkt = fixture.markets.find(m => m.type === '1X2');
  const totalMarketsCount = fixture.markets.length;

  const homeTeamName = language === 'am' ? fixture.homeTeam.nameAm : fixture.homeTeam.name;
  const awayTeamName = language === 'am' ? fixture.awayTeam.nameAm : fixture.awayTeam.name;
  const leagueName = language === 'am' ? fixture.leagueNameAm : fixture.leagueName;

  // Format kickoff time (e.g. "Today 20:45" or "18 Oct 17:30")
  const kickoffDate = new Date(fixture.kickoffTime);
  const formattedTime = kickoffDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-[#0e141f] hover:bg-[#121a28] border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-3.5 transition-all shadow-sm">
      {/* Top Header Row: Clean unboxed metadata with separators */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2.5">
        <div className="flex items-center gap-1.5 truncate">
          <span className="font-semibold text-slate-300 truncate">{leagueName}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          {isLive ? (
            <div className="flex items-center gap-1 text-rose-400 font-bold shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span>{fixture.status === 'HALFTIME' ? 'HT' : `${fixture.minute}'`}</span>
            </div>
          ) : isFinished ? (
            <span className="text-slate-400 font-medium">FT</span>
          ) : (
            <div className="flex items-center gap-1 text-slate-400 shrink-0">
              <Clock className="w-3 h-3" />
              <span>{formattedTime}</span>
            </div>
          )}
        </div>

        {/* More markets button */}
        <button
          onClick={() => onOpenDetails(fixture)}
          className="text-emerald-400 hover:text-emerald-300 font-medium text-[11px] flex items-center gap-0.5 ml-2 shrink-0 cursor-pointer"
        >
          <span>+{totalMarketsCount} Markets</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Row: Teams & Scores */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        {/* Teams & Score Column (Desktop: 7 cols) */}
        <div
          onClick={() => onOpenDetails(fixture)}
          className="md:col-span-7 cursor-pointer group"
        >
          {/* Home Team */}
          <div className="flex items-center justify-between py-0.5">
            <div className="flex items-center gap-2 truncate">
              <span className="text-base shrink-0">{fixture.homeTeam.badgeEmoji}</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors truncate">
                {homeTeamName}
              </span>
            </div>
            {isLive || isFinished ? (
              <span className="font-mono text-sm sm:text-base font-bold text-white tabular-nums ml-2">
                {fixture.currentScore.home}
              </span>
            ) : null}
          </div>

          {/* Away Team */}
          <div className="flex items-center justify-between py-0.5">
            <div className="flex items-center gap-2 truncate">
              <span className="text-base shrink-0">{fixture.awayTeam.badgeEmoji}</span>
              <span className="text-xs sm:text-sm font-semibold text-slate-200 group-hover:text-emerald-400 transition-colors truncate">
                {awayTeamName}
              </span>
            </div>
            {isLive || isFinished ? (
              <span className="font-mono text-sm sm:text-base font-bold text-white tabular-nums ml-2">
                {fixture.currentScore.away}
              </span>
            ) : null}
          </div>
        </div>

        {/* 1X2 Odds Buttons Column (Desktop: 5 cols) */}
        <div className="md:col-span-5">
          {matchWinnerMkt && (
            <div className="grid grid-cols-3 gap-1.5">
              {matchWinnerMkt.selections.map(sel => {
                const isSelected = selectedSelectionIds.has(sel.id);
                const isSuspended = sel.suspended || matchWinnerMkt.status === 'SUSPENDED';

                return (
                  <button
                    key={sel.id}
                    disabled={isSuspended}
                    onClick={() => onSelectOdds(fixture, matchWinnerMkt.id, sel)}
                    className={`h-11 px-2 flex flex-col items-center justify-center rounded-lg border transition-all cursor-pointer relative group ${
                      isSuspended
                        ? 'bg-slate-900/40 border-slate-800 text-slate-600 cursor-not-allowed'
                        : isSelected
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-sm'
                        : 'bg-slate-900/90 border-slate-800/90 text-slate-300 hover:border-emerald-500/50 hover:bg-slate-800'
                    }`}
                  >
                    {isSuspended ? (
                      <Lock className="w-3.5 h-3.5 text-slate-500" />
                    ) : (
                      <>
                        <span
                          className={`text-[10px] uppercase font-semibold leading-none truncate max-w-full ${
                            isSelected ? 'text-slate-950' : 'text-slate-400 group-hover:text-slate-300'
                          }`}
                        >
                          {sel.outcomeKey === '1' ? '1' : sel.outcomeKey === 'X' ? 'X' : '2'}
                        </span>
                        <span
                          className={`font-mono text-xs font-bold leading-tight mt-0.5 tabular-nums ${
                            isSelected ? 'text-slate-950 font-black' : 'text-emerald-400'
                          }`}
                        >
                          {sel.odds.toFixed(2)}
                        </span>
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
