import React from 'react';
import { Search, Radio, Trophy, Filter, Flame } from 'lucide-react';
import { League, Sport } from '../types/sportsbook';
import { Language, getTranslation } from '../utils/i18n';

interface LeagueFilterProps {
  sports: Sport[];
  leagues: League[];
  selectedSportId: string;
  selectedLeagueId: string;
  selectedStatus: string;
  searchQuery: string;
  onSelectSport: (id: string) => void;
  onSelectLeague: (id: string) => void;
  onSelectStatus: (status: string) => void;
  onSearchChange: (q: string) => void;
  language: Language;
}

export const LeagueFilter: React.FC<LeagueFilterProps> = ({
  sports,
  leagues,
  selectedSportId,
  selectedLeagueId,
  selectedStatus,
  searchQuery,
  onSelectSport,
  onSelectLeague,
  onSelectStatus,
  onSearchChange,
  language,
}) => {
  const t = (k: string) => getTranslation(k, language);

  return (
    <div className="space-y-3">
      {/* Top Row: Sports & Status Filters + Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status segmented buttons */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-xl overflow-x-auto no-scrollbar">
          <button
            onClick={() => onSelectStatus('ALL')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedStatus === 'ALL'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('all_leagues')}
          </button>
          <button
            onClick={() => onSelectStatus('LIVE')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
              selectedStatus === 'LIVE'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-rose-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            {t('live')}
          </button>
          <button
            onClick={() => onSelectStatus('PRE_MATCH')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              selectedStatus === 'PRE_MATCH'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('upcoming')}
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search teams, leagues..."
            className="w-full bg-slate-900/80 border border-slate-800 text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-emerald-500 transition-colors placeholder:text-slate-500"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Leagues Horizontal Scroller Bar */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        <button
          onClick={() => onSelectLeague('ALL')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border whitespace-nowrap transition-colors cursor-pointer ${
            selectedLeagueId === 'ALL'
              ? 'bg-slate-800 border-emerald-500/80 text-emerald-400'
              : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>All Competitions</span>
        </button>

        {leagues.map(league => {
          const isSelected = selectedLeagueId === league.id;
          const label = language === 'am' ? league.nameAm : league.name;
          return (
            <button
              key={league.id}
              onClick={() => onSelectLeague(league.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border whitespace-nowrap transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 font-semibold'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span className="text-xs">{league.countryCode === 'ETH' ? '🇪🇹' : league.countryCode === 'ENG' ? '🏴󠁧󠁢󠁥󠁮󠁧󠁿' : league.countryCode === 'ESP' ? '🇪🇸' : league.countryCode === 'GER' ? '🇩🇪' : league.countryCode === 'ITA' ? '🇮🇹' : '🏆'}</span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
