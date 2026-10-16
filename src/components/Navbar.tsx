import React from 'react';
import { ShieldAlert, Wallet, User as UserIcon, Settings, Globe, Plus, Ticket } from 'lucide-react';
import { UserAccount } from '../types/sportsbook';
import { Language, getTranslation } from '../utils/i18n';

interface NavbarProps {
  user: UserAccount | null;
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onOpenWallet: () => void;
  onOpenMyBets: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: () => void;
  onOpenRG: () => void;
  onOpenBetSlip: () => void;
  activeBetsCount: number;
  betSlipCount: number;
  currentTab: string;
  onTabChange: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  language,
  onLanguageChange,
  onOpenWallet,
  onOpenMyBets,
  onOpenAdmin,
  onOpenAuth,
  onOpenRG,
  onOpenBetSlip,
  activeBetsCount,
  betSlipCount,
  currentTab,
  onTabChange,
}) => {
  const t = (k: string) => getTranslation(k, language);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080d14]/95 backdrop-blur-md border-b border-slate-800/80">
      {/* Sandbox Regulatory Notice Banner */}
      <div className="bg-amber-950/70 border-b border-amber-500/20 px-3 py-1 text-center text-[11px] text-amber-300/90 font-medium flex items-center justify-center gap-1.5">
        <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span className="truncate">
          <strong className="text-amber-400">{t('demo_mode_badge')}:</strong> {t('demo_mode_desc')}
        </span>
      </div>

      {/* Main Top Bar - Follows strict 3-zone contract */}
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-6">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onTabChange('home')}
            className="flex items-center gap-2 group text-left cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-900/30 text-white font-extrabold text-base">
              D
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-wider text-white flex items-center gap-1">
                DADA <span className="text-emerald-400">BET</span>
              </span>
            </div>
          </button>
        </div>

        {/* Zone 2: Navigation Links (single line, no wrap) */}
        <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
          <button
            onClick={() => onTabChange('home')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer hover:text-white ${
              currentTab === 'home' ? 'text-emerald-400 border-b-2 border-emerald-400' : ''
            }`}
          >
            {t('home')}
          </button>
          <button
            onClick={() => onTabChange('live')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer hover:text-white flex items-center gap-1.5 ${
              currentTab === 'live' ? 'text-emerald-400 border-b-2 border-emerald-400' : ''
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            {t('live')}
          </button>
          <button
            onClick={onOpenMyBets}
            className="whitespace-nowrap transition-colors py-1 cursor-pointer hover:text-white flex items-center gap-1"
          >
            {t('my_bets')}
            {activeBetsCount > 0 && (
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {activeBetsCount}
              </span>
            )}
          </button>
          <button
            onClick={() => onTabChange('promotions')}
            className={`whitespace-nowrap transition-colors py-1 cursor-pointer hover:text-white ${
              currentTab === 'promotions' ? 'text-emerald-400 border-b-2 border-emerald-400' : ''
            }`}
          >
            {t('promotions')}
          </button>
          <button
            onClick={onOpenAdmin}
            className="whitespace-nowrap transition-colors py-1 cursor-pointer hover:text-amber-400 text-amber-300/80 flex items-center gap-1"
          >
            <Settings className="w-3.5 h-3.5" />
            {t('admin')}
          </button>
          <button
            onClick={onOpenRG}
            className="whitespace-nowrap transition-colors py-1 cursor-pointer hover:text-slate-100 text-slate-400"
          >
            {t('help')}
          </button>
        </nav>

        {/* Zone 3: Wallet & User Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Language Toggle */}
          <button
            onClick={() => onLanguageChange(language === 'en' ? 'am' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/80 rounded-md transition-colors border border-slate-700/50 cursor-pointer"
            title="Toggle English / አማርኛ"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-mono uppercase">{language}</span>
          </button>

          {/* User & Wallet */}
          {user ? (
            <div className="flex items-center gap-2">
              {/* Demo Balance Display */}
              <button
                onClick={onOpenWallet}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/70 rounded-lg transition-all group cursor-pointer"
                title="Click to view Demo Ledger & Reload Funds"
              >
                <Wallet className="w-4 h-4 text-emerald-400 group-hover:scale-105 transition-transform" />
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-mono tracking-wider leading-none">
                    Demo {user.currency}
                  </div>
                  <div className="text-xs font-bold text-white font-mono tabular-nums leading-tight">
                    {user.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-colors ml-0.5">
                  <Plus className="w-3 h-3" />
                </div>
              </button>

              {/* Profile icon */}
              <button
                onClick={onOpenRG}
                className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
                title={`${user.username} (${user.kycLevel})`}
              >
                <UserIcon className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold text-xs rounded-lg transition-colors cursor-pointer shadow-md shadow-emerald-500/20"
            >
              Sign In
            </button>
          )}

          {/* Bet Slip trigger on desktop if items exist */}
          <button
            onClick={onOpenBetSlip}
            className="relative lg:hidden p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 cursor-pointer"
            aria-label="Open Bet Slip"
          >
            <Ticket className="w-4 h-4" />
            {betSlipCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                {betSlipCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
