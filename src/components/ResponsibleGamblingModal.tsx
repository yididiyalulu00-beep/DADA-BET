import React, { useState } from 'react';
import { X, ShieldCheck, HeartHandshake, AlertTriangle, Sliders, CheckCircle2, UserCheck } from 'lucide-react';
import { UserAccount } from '../types/sportsbook';
import { Language, getTranslation } from '../utils/i18n';

interface ResponsibleGamblingModalProps {
  user: UserAccount | null;
  onUpdateLimits: (dailyDepositLimit: number, maxSingleStake: number, selfExcluded: boolean) => Promise<void>;
  onClose: () => void;
  language: Language;
}

export const ResponsibleGamblingModal: React.FC<ResponsibleGamblingModalProps> = ({
  user,
  onUpdateLimits,
  onClose,
  language,
}) => {
  const [dailyDepositLimit, setDailyDepositLimit] = useState<number>(
    user?.responsibleGambling.dailyDepositLimit || 5000
  );
  const [maxSingleStake, setMaxSingleStake] = useState<number>(
    user?.responsibleGambling.maxSingleStake || 2000
  );
  const [selfExcluded, setSelfExcluded] = useState<boolean>(
    user?.responsibleGambling.selfExcluded || false
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const t = (k: string) => getTranslation(k, language);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onUpdateLimits(dailyDepositLimit, maxSingleStake, selfExcluded);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-[#0b1018] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#0d1420]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {t('responsible_gambling')} & Profile
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* User Status Card */}
          {user && (
            <div className="bg-[#0e1522] border border-slate-800 rounded-xl p-4 flex items-center justify-between text-xs">
              <div>
                <div className="font-bold text-white text-sm">{user.username}</div>
                <div className="text-slate-400">{user.email} · {user.phone}</div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
                  {user.kycLevel}
                </span>
                <div className="text-[10px] text-slate-500 mt-1">Identity Verified (Demo)</div>
              </div>
            </div>
          )}

          {/* Limits Card */}
          <div className="bg-[#0e1522] border border-slate-800 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-white uppercase tracking-wider">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span>Player Protection Controls</span>
            </div>

            {/* Daily Deposit Limit Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-slate-300">
                <span>{t('deposit_limit')}</span>
                <span className="font-mono font-bold text-emerald-400">{dailyDepositLimit.toLocaleString()} ETB</span>
              </div>
              <input
                type="range"
                min="500"
                max="20000"
                step="500"
                value={dailyDepositLimit}
                onChange={e => setDailyDepositLimit(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>500 ETB</span>
                <span>20,000 ETB</span>
              </div>
            </div>

            {/* Max Single Stake Slider */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
              <div className="flex justify-between text-xs text-slate-300">
                <span>{t('stake_limit')}</span>
                <span className="font-mono font-bold text-emerald-400">{maxSingleStake.toLocaleString()} ETB</span>
              </div>
              <input
                type="range"
                min="100"
                max="10000"
                step="100"
                value={maxSingleStake}
                onChange={e => setMaxSingleStake(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>100 ETB</span>
                <span>10,000 ETB</span>
              </div>
            </div>

            {/* Self Exclusion Toggle */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-slate-200">{t('self_exclusion')}</div>
                <div className="text-[10px] text-slate-500">Temporarily suspend all bet placement</div>
              </div>
              <button
                type="button"
                onClick={() => setSelfExcluded(!selfExcluded)}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  selfExcluded ? 'bg-rose-500' : 'bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                    selfExcluded ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>

            <button
              disabled={isSaving}
              onClick={handleSave}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              {isSaving ? 'Updating Controls...' : t('save_limits')}
            </button>

            {savedSuccess && (
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 justify-center font-medium">
                <CheckCircle2 className="w-4 h-4" />
                <span>Protection limits successfully updated on server!</span>
              </div>
            )}
          </div>

          {/* Problem Gambling Helpline Info */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2 text-white font-semibold">
              <HeartHandshake className="w-4 h-4 text-emerald-400" />
              <span>Need Help or Support?</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Betting should always be entertaining, responsible, and within your means. If you or someone you know is struggling with gambling habits, free confidential help is available:
            </p>
            <ul className="text-[11px] list-disc list-inside space-y-0.5 text-slate-300">
              <li>Ethiopia Mental Health Hotline: <strong>8335</strong></li>
              <li>National Gambling Helpline (International): <strong>+44 808 8020 133</strong></li>
              <li>Web Support: <strong>www.gamcare.org.uk</strong></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
