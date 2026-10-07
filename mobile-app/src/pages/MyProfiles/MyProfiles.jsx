import React, { useState, useEffect } from 'react';
import { 
  FolderHeart, 
  PlusCircle, 
  Eye, 
  Trash2, 
  Edit3, 
  Calendar, 
  Clock, 
  ShieldAlert, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { api } from '../../api/client';
import { t } from '../../i18n/strings';

export default function MyProfiles({ onAddNew, onSelectProfile }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const loadMyProfiles = async () => {
    try {
      setLoading(true);
      const res = await api.getMyProfiles();
      if (res.success) {
        setProfiles(res.profiles);
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to load your profiles.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyProfiles();
  }, []);

  const handleDelete = async (profileId) => {
    if (!window.confirm(t('deleteConfirm'))) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.deleteProfile(profileId);
      if (res.success) {
        setMessage({ text: 'Profile removed successfully.', type: 'success' });
        loadMyProfiles();
      }
    } catch (err) {
      setMessage({ text: err.message || 'Failed to delete profile.', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="pb-24 px-4 sm:px-6 lg:px-8 pt-4 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">{t('myProfilesTitle')}</h2>
          <p className="text-[11px] text-slate-500">
            {profiles.length} {profiles.length === 1 ? 'Proposal' : 'Proposals'} Submitted
          </p>
        </div>

        <button
          onClick={onAddNew}
          className="py-2 px-3 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-transform"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>{t('addNewRishtaBtn')}</span>
        </button>
      </div>

      {message.text && (
        <div className={`p-3.5 rounded-2xl border text-xs flex items-center justify-between ${
          message.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <span>{message.text}</span>
          <button onClick={() => setMessage({ text: '', type: '' })} className="font-bold underline">Dismiss</button>
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-xs text-slate-400">Loading your submitted proposals...</div>
      ) : profiles.length === 0 ? (
        <div className="py-12 px-6 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FolderHeart className="w-6 h-6" />
          </div>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            {t('myProfilesEmpty')}
          </p>
          <button
            onClick={onAddNew}
            className="px-4 py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs active:scale-95 transition-transform"
          >
            {t('addNewRishtaBtn')}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {profiles.map((p) => (
            <div key={p.profile_id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-black text-xs text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    {p.profile_id}
                  </span>
                  <span className="text-xs font-bold text-slate-800">
                    {p.relationship_for}
                  </span>
                </div>

                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  p.status === 'active'
                    ? 'bg-emerald-100 text-emerald-800'
                    : p.status === 'blocked'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}>
                  {p.status === 'active' ? t('statusActive') : p.status === 'blocked' ? t('statusBlocked') : t('statusRemoved')}
                </span>
              </div>

              <div className="text-xs text-slate-700">
                <p className="font-semibold">{p.gender}, {p.age} yrs • {p.marital_status}</p>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  {p.religion} ({p.sect || 'General'}) • {p.education} • {p.profession}
                </p>
                <p className="text-slate-500 text-[11px]">Location: {p.city}</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                <span>Submitted: {new Date(p.created_at).toLocaleDateString()}</span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSelectProfile(p.profile_id)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-slate-100"
                    title="View public profile"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.profile_id)}
                    disabled={actionLoading}
                    className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50"
                    title="Delete proposal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
