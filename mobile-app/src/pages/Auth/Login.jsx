import React, { useState } from 'react';
import { Phone, Lock, ArrowRight, Loader2, AlertCircle, Shield, X, Sparkles } from 'lucide-react';
import { api } from '../../api/client';
import { t } from '../../i18n/strings';

export default function Login({ onLoginSuccess, onGoToRegister, onClose }) {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!mobile.trim() || !password) {
      setError('Please enter your mobile number and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.login(mobile, password);
      if (res.success) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.login('03001112233', 'Pakistan@123');
      if (res.success) {
        onLoginSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6 relative">
      {/* Optional Close / Back to browse button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-white rounded-full shadow-xs active:scale-95 transition-all z-20"
          title="Browse as Guest"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Top Branding */}
      <div className="pt-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-3xl mx-auto shadow-md shadow-emerald-800/30">
          ج
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-3">
          {t('appName')}
        </h2>
        <p className="text-xs text-emerald-700 font-semibold mt-0.5">
          {t('appTagline')}
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 my-auto">
        <div className="mb-4">
          <h3 className="text-base font-bold text-slate-900">{t('loginTitle')}</h3>
          <p className="text-xs text-slate-500 mt-0.5">{t('loginSubtitle')}</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('mobileNumber')}
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="tel"
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder={t('mobilePlaceholder')}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('password')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-emerald-700 hover:bg-emerald-600 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-800/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>{t('signInBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* 1-Tap Quick Test Login */}
        <button
          type="button"
          onClick={handleDemoLogin}
          disabled={loading}
          className="w-full mt-2.5 py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>Quick 1-Tap Login (Demo Account)</span>
        </button>

        <div className="mt-5 pt-4 border-t border-slate-100 text-center space-y-2">
          <p className="text-xs text-slate-500">
            {t('noAccountPrompt')}{' '}
            <button
              onClick={onGoToRegister}
              className="text-emerald-700 font-bold hover:underline"
            >
              {t('signUpBtn')}
            </button>
          </p>

          {onClose && (
            <button
              onClick={onClose}
              className="text-[11px] text-slate-400 hover:text-slate-600 underline font-medium block mx-auto"
            >
              Browse live proposals without signing in →
            </button>
          )}
        </div>
      </div>

      {/* Trust Badge */}
      <div className="text-center py-2 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
        <Shield className="w-3.5 h-3.5 text-emerald-700" />
        <span>Family Contact Privacy Guaranteed</span>
      </div>
    </div>
  );
}
