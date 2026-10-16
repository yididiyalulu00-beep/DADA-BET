import React, { useState } from 'react';
import { X, Lock, Mail, User, Shield, Check } from 'lucide-react';
import { UserAccount } from '../types/sportsbook';
import { Language, getTranslation } from '../utils/i18n';

interface AuthModalProps {
  onLogin: (email: string) => Promise<boolean>;
  onRegister: (username: string, email: string, phone: string, ageConfirmed: boolean) => Promise<boolean>;
  onClose: () => void;
  language: Language;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  onLogin,
  onRegister,
  onClose,
  language,
}) => {
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('+251 9');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const t = (k: string) => getTranslation(k, language);

  const handleQuickLogin = async (presetEmail: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const ok = await onLogin(presetEmail);
      if (ok) onClose();
      else setError('Failed to sign in');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (isRegisterMode) {
      if (!ageConfirmed) {
        setError('You must confirm you are 18 years of age or older.');
        return;
      }
      if (!username || !email) {
        setError('Please fill in all required fields.');
        return;
      }
      setIsSubmitting(true);
      try {
        const ok = await onRegister(username, email, phone, ageConfirmed);
        if (ok) onClose();
        else setError('Registration failed');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      if (!email) {
        setError('Please enter your email or username');
        return;
      }
      setIsSubmitting(true);
      try {
        const ok = await onLogin(email);
        if (ok) onClose();
        else setError('User not found');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-[#0b1018] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-[#0d1420]">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              {isRegisterMode ? t('register_title') : t('login_title')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Demo Pre-sets */}
        <div className="p-4 bg-[#0d131f] border-b border-slate-800 space-y-2">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Quick Sandbox Logins:
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('abebe@dadabet.demo')}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-xl text-left cursor-pointer transition-all"
            >
              <div className="text-xs font-bold text-white">Abebe (Player)</div>
              <div className="text-[10px] text-emerald-400 font-mono">2,500 ETB Demo</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@dadabet.com')}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/50 rounded-xl text-left cursor-pointer transition-all"
            >
              <div className="text-xs font-bold text-amber-300">Dada Admin</div>
              <div className="text-[10px] text-amber-400 font-mono">Operator Access</div>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/30 p-2.5 rounded-lg text-xs text-rose-300">
              {error}
            </div>
          )}

          {isRegisterMode && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Username</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. Dawit_Bettor"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Email or Mobile Number</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@domain.com or phone"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {isRegisterMode && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Phone Number (Ethiopia / Global)</label>
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              {/* Age Verification Checkbox */}
              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={e => setAgeConfirmed(e.target.checked)}
                  className="mt-0.5 rounded accent-emerald-500 cursor-pointer"
                />
                <span className="text-xs text-slate-300 leading-snug">
                  {t('age_verification_notice')}
                </span>
              </label>
            </>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md"
          >
            {isSubmitting ? 'Authenticating...' : isRegisterMode ? 'Create Account' : 'Sign In'}
          </button>

          <div className="text-center text-xs text-slate-400 pt-1">
            {isRegisterMode ? (
              <button
                type="button"
                onClick={() => setIsRegisterMode(false)}
                className="text-emerald-400 hover:underline cursor-pointer"
              >
                Already have an account? Sign In
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsRegisterMode(true)}
                className="text-emerald-400 hover:underline cursor-pointer"
              >
                New to DADA BET? Create Demo Account
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
