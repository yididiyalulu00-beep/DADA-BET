import React from 'react';
import { Home, Radio, Receipt, Ticket, ShieldCheck } from 'lucide-react';
import { Language, getTranslation } from '../utils/i18n';

interface BottomNavProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  onOpenBetSlip: () => void;
  onOpenMyBets: () => void;
  onOpenRG: () => void;
  activeBetsCount: number;
  betSlipCount: number;
  language: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  onOpenBetSlip,
  onOpenMyBets,
  onOpenRG,
  activeBetsCount,
  betSlipCount,
  language,
}) => {
  const t = (k: string) => getTranslation(k, language);

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#080d14]/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1 safe-area-bottom">
      <div className="grid grid-cols-5 items-center h-14">
        {/* Home */}
        <button
          onClick={() => onTabChange('home')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-colors cursor-pointer ${
            currentTab === 'home' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-1 truncate max-w-[60px]">{t('home')}</span>
        </button>

        {/* Live */}
        <button
          onClick={() => onTabChange('live')}
          className={`min-h-[44px] flex flex-col items-center justify-center transition-colors cursor-pointer relative ${
            currentTab === 'live' ? 'text-emerald-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <Radio className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          </div>
          <span className="text-[10px] mt-1 truncate max-w-[60px]">{t('live')}</span>
        </button>

        {/* Bet Slip (Center highlighted action) */}
        <button
          onClick={onOpenBetSlip}
          className="min-h-[44px] flex flex-col items-center justify-center relative cursor-pointer group"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-slate-950 shadow-md shadow-emerald-500/30 group-active:scale-95 transition-transform -mt-2">
            <Ticket className="w-5 h-5" />
            {betSlipCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#080d14]">
                {betSlipCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5 font-bold text-emerald-400 truncate max-w-[60px]">
            {t('betslip')}
          </span>
        </button>

        {/* My Bets */}
        <button
          onClick={onOpenMyBets}
          className="min-h-[44px] flex flex-col items-center justify-center transition-colors cursor-pointer relative text-slate-400 hover:text-slate-200"
        >
          <div className="relative">
            <Receipt className="w-5 h-5" />
            {activeBetsCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-emerald-500 text-slate-950 text-[9px] font-bold px-1 rounded-full">
                {activeBetsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-1 truncate max-w-[60px]">{t('my_bets')}</span>
        </button>

        {/* Account & Help */}
        <button
          onClick={onOpenRG}
          className="min-h-[44px] flex flex-col items-center justify-center transition-colors cursor-pointer text-slate-400 hover:text-slate-200"
        >
          <ShieldCheck className="w-5 h-5" />
          <span className="text-[10px] mt-1 truncate max-w-[60px]">{t('account')}</span>
        </button>
      </div>
    </div>
  );
};
