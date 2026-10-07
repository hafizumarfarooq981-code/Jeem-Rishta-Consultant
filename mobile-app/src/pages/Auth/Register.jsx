import React, { useState } from 'react';
import { Phone, Lock, ArrowRight, Loader2, AlertCircle, Shield, CheckSquare, Square, X } from 'lucide-react';
import { api } from '../../api/client';
import { t } from '../../i18n/strings';

export default function Register({ onRegisterSuccess, onGoToLogin, onClose }) {
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!mobile.trim()) {
      setError('Please enter your mobile number.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and confirmation do not match.');
      return;
    }

    if (!acceptTerms) {
      setError('You must accept the Terms of Service & Privacy Policy.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.register({
        mobile_number: mobile,
        password,
        confirm_password: confirmPassword,
        accept_terms: acceptTerms
      });

      if (res.success) {
        onRegisterSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6 relative">
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-white rounded-full shadow-xs active:scale-95 transition-all z-20"
          title="Browse as Guest"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Top Header */}
      <div className="pt-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold text-2xl mx-auto shadow-md shadow-emerald-800/30">
          ج
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mt-3">
          {t('registerTitle')}
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          {t('registerSubtitle')}
        </p>
      </div>

      {/* Register Card */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200/80 my-4">
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
                placeholder="03001234567"
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
                placeholder="At least 6 characters"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              {t('confirmPassword')}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none transition-colors"
              />
            </div>
          </div>

          {/* Accept Terms Checkbox */}
          <div 
            onClick={() => setAcceptTerms(!acceptTerms)}
            className="flex items-start gap-2 pt-1 cursor-pointer select-none"
          >
            {acceptTerms ? (
              <CheckSquare className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
            ) : (
              <Square className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
            )}
            <span className="text-[11px] text-slate-600 leading-tight">
              {t('agreeTerms')}
            </span>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3 bg-emerald-700 hover:bg-emerald-600 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-800/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>{t('signUpBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="mt-5 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            {t('alreadyAccountPrompt')}{' '}
            <button
              onClick={onGoToLogin}
              className="text-emerald-700 font-bold hover:underline"
            >
              {t('signInBtn')}
            </button>
          </p>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="text-center py-2 text-[11px] text-slate-400 flex items-center justify-center gap-1.5">
        <Shield className="w-3.5 h-3.5 text-emerald-700" />
        <span>Strict Privacy & Discretion Assured</span>
      </div>
    </div>
  );
}
