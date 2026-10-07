import React, { useState } from 'react';
import { 
  Lock, 
  ShieldCheck, 
  FileText, 
  Trash2, 
  LogOut, 
  Phone, 
  AlertTriangle, 
  CheckCircle2, 
  AlertCircle,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { api } from '../../api/client';
import { t } from '../../i18n/strings';

export default function Settings({ user, onLogout }) {
  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState({ text: '', type: '' });

  // Account deletion state (Clause 29)
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmPass, setDeleteConfirmPass] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  // Legal modals
  const [showLegal, setShowLegal] = useState(null); // 'terms' or 'privacy'

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPassMessage({ text: '', type: '' });

    if (newPassword.length < 6) {
      setPassMessage({ text: 'New password must be at least 6 characters.', type: 'error' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPassMessage({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    try {
      setPassLoading(true);
      const res = await api.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      if (res.success) {
        setPassMessage({ text: 'Password updated successfully!', type: 'success' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setShowPasswordModal(false), 1500);
      }
    } catch (err) {
      setPassMessage({ text: err.message || 'Failed to update password.', type: 'error' });
    } finally {
      setPassLoading(false);
    }
  };

  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteError('');

    if (!deleteConfirmPass) {
      setDeleteError('Please enter your password to confirm deletion.');
      return;
    }

    try {
      setDeleteLoading(true);
      const res = await api.deleteAccount(deleteConfirmPass);
      if (res.success) {
        alert('Your account and all matrimonial profiles have been permanently deleted.');
        onLogout();
      }
    } catch (err) {
      setDeleteError(err.message || 'Account deletion failed.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="pb-28 px-4 sm:px-6 lg:px-8 pt-4 space-y-6 max-w-2xl mx-auto">
      <div>
        <h2 className="text-base font-bold text-slate-900">{t('settingsTitle')}</h2>
        <p className="text-[11px] text-slate-500">
          Manage your security preferences and profile privacy
        </p>
      </div>

      {/* Account Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Registered Mobile</span>
            <p className="text-sm font-extrabold text-slate-900 mt-0.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-700" />
              <span>{user?.mobile_number || '03001234567'}</span>
            </p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
            Verified Account
          </span>
        </div>
      </div>

      {/* Security Actions */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100">
        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{t('changePassword')}</p>
              <p className="text-[10px] text-slate-500">Update account password</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setShowLegal('privacy')}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{t('privacyTitle')}</p>
              <p className="text-[10px] text-slate-500">Read our contact protection policy</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={() => setShowLegal('terms')}
          className="w-full px-4 py-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">{t('termsTitle')}</p>
              <p className="text-[10px] text-slate-500">Platform terms of service</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      {/* Danger Zone: Account Deletion (Clause 29) */}
      <div className="bg-rose-50/70 rounded-2xl border border-rose-200/80 p-4 shadow-xs space-y-2.5">
        <h4 className="text-xs font-bold text-rose-950 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-rose-600" />
          <span>{t('dangerZone')}</span>
        </h4>
        <p className="text-[11px] text-rose-900 leading-relaxed">
          {t('deleteAccountWarn')}
        </p>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 active:scale-98 text-white rounded-xl text-xs font-bold transition-all"
        >
          {t('deleteAccountBtn')}
        </button>
      </div>

      {/* Logout Button */}
      <button
        onClick={onLogout}
        className="w-full py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-98 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
      >
        <LogOut className="w-4 h-4 text-slate-500" />
        <span>{t('logout')}</span>
      </button>

      {/* CHANGE PASSWORD MODAL */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-xs w-full shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900">{t('changePassword')}</h3>

            {passMessage.text && (
              <div className={`p-2.5 rounded-xl text-xs flex items-center gap-1.5 ${
                passMessage.type === 'error' ? 'bg-rose-50 text-rose-800' : 'bg-emerald-50 text-emerald-800'
              }`}>
                {passMessage.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                <span>{passMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-3">
              <input
                type="password"
                required
                placeholder={t('currentPassword')}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <input
                type="password"
                required
                placeholder={t('newPassword')}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
              <input
                type="password"
                required
                placeholder={t('confirmPassword')}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={passLoading}
                  className="flex-1 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {passLoading ? 'Saving...' : 'Update'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ACCOUNT DELETION CONFIRMATION MODAL (Clause 29) */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl space-y-4">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Permanently Delete Account?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This action is irreversible. All your submitted rishta profiles, contact details, and records will be deleted immediately.
              </p>
            </div>

            {deleteError && (
              <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{deleteError}</span>
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-3">
              <input
                type="password"
                required
                placeholder="Enter your password to confirm"
                value={deleteConfirmPass}
                onChange={(e) => setDeleteConfirmPass(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleteLoading}
                  className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold disabled:opacity-50"
                >
                  {deleteLoading ? 'Erasing...' : 'Erase Forever'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEGAL DOCUMENT VIEWER */}
      {showLegal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[80vh] flex flex-col">
            <h3 className="text-sm font-bold text-slate-900">
              {showLegal === 'privacy' ? t('privacyTitle') : t('termsTitle')}
            </h3>

            <div className="overflow-y-auto text-xs text-slate-600 leading-relaxed space-y-2 flex-1 pr-1">
              {showLegal === 'privacy' ? (
                <>
                  <p><strong>1. Privacy by Design:</strong> Jeem Rishta Consultant is built specifically to protect matrimonial privacy. Candidate mobile numbers, WhatsApp numbers, guardian contacts, and complete physical addresses are never displayed publicly or returned in public API responses.</p>
                  <p><strong>2. Contact Brokerage:</strong> All communication inquiries are coordinated exclusively through the official Admin WhatsApp channel.</p>
                  <p><strong>3. Data Retention & Deletion:</strong> You have the absolute right to delete your account and all associated profiles at any time. Account deletion permanently erases all personal data from our active database.</p>
                </>
              ) : (
                <>
                  <p><strong>1. Free Service:</strong> Jeem Rishta Consultant is provided 100% free of cost with zero registration charges or matchmaking fees.</p>
                  <p><strong>2. Voluntary Submission:</strong> All information submitted must be accurate and truthful.</p>
                  <p><strong>3. Zero Harassment:</strong> Any inappropriate behavior or harassment will result in immediate permanent blocking of the user account and associated profiles.</p>
                </>
              )}
            </div>

            <button
              onClick={() => setShowLegal(null)}
              className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
