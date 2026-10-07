import React, { useState, useEffect } from 'react';
import { 
  Search, 
  PlusCircle, 
  FolderHeart, 
  ShieldAlert, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  HeartHandshake,
  Lock,
  MessageSquare,
  Users
} from 'lucide-react';
import { api } from '../../api/client';
import { t } from '../../i18n/strings';
import ProfileCard from '../../components/ProfileCard';

export default function Home({ setTab, onSelectProfile }) {
  const [recentProfiles, setRecentProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadRecent() {
      try {
        setLoading(true);
        const res = await api.searchProfiles({ limit: 8 });
        if (res.success) {
          setRecentProfiles(res.data.profiles);
        }
      } catch (err) {
        console.error('Home load recent error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRecent();
  }, []);

  return (
    <div className="space-y-6 pb-24 md:pb-12">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 rounded-3xl p-6 md:p-10 text-white shadow-md relative overflow-hidden">
        {/* Subtle decorative background circle */}
        <div className="absolute -right-10 -top-10 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-10 w-48 h-48 rounded-full bg-emerald-500/10 blur-xl pointer-events-none" />

        <div className="relative z-10 md:flex md:items-center md:justify-between gap-8">
          <div className="md:max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-emerald-100 text-xs font-bold mb-3 backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>100% Free Trusted Matrimonial Service</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight">
              {t('appName')}
            </h2>

            <p className="text-xs sm:text-sm text-emerald-100 mt-2 sm:mt-3 leading-relaxed font-normal max-w-xl">
              {t('heroDescription')}
            </p>

            {/* Quick Action Buttons */}
            <div className="mt-5 sm:mt-6 flex flex-wrap gap-3">
              <button
                onClick={() => setTab('search')}
                className="py-3 px-5 bg-white hover:bg-emerald-50 active:scale-98 text-emerald-900 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-transform cursor-pointer"
              >
                <Search className="w-4 h-4 text-emerald-700" />
                <span>{t('quickSearchBtn')}</span>
              </button>

              <button
                onClick={() => setTab('add')}
                className="py-3 px-5 bg-emerald-600/90 hover:bg-emerald-600 active:scale-98 text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 border border-white/20 shadow-sm transition-transform cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('quickAddBtn')}</span>
              </button>
            </div>
          </div>

          {/* Desktop Banner Highlight */}
          <div className="hidden lg:flex flex-col gap-3 p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs text-emerald-50 shrink-0 w-72">
            <div className="flex items-center gap-2 font-bold text-white text-sm">
              <ShieldCheck className="w-5 h-5 text-emerald-300" />
              <span>Privacy-First Matching</span>
            </div>
            <p className="text-[11px] leading-relaxed text-emerald-100">
              Personal contact details & home addresses are strictly kept confidential and shared only with consent through our consultant.
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] font-semibold">
              <span>Direct WhatsApp Coordination</span>
              <span className="text-amber-300">Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Safe & Private Communication Card */}
      <div className="bg-emerald-50/80 rounded-2xl p-4 sm:p-5 border border-emerald-200/80 shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-700 text-white shrink-0 shadow-xs">
            <Lock className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs sm:text-sm font-bold text-emerald-950 flex items-center gap-1.5">
              <span>{t('safeNoticeTitle')}</span>
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
            </h3>
            <p className="text-xs text-emerald-800/90 mt-0.5 leading-relaxed">
              {t('safeNoticeDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards: 2 cols on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => setTab('search')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 active:scale-98 transition-all cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center mb-3">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900">Explore Matches</h4>
          <p className="text-[11px] text-slate-500 mt-1">Filter by city, age & sect</p>
        </div>

        <div
          onClick={() => setTab('add')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 active:scale-98 transition-all cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3">
            <PlusCircle className="w-5 h-5" />
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900">Submit Proposal</h4>
          <p className="text-[11px] text-slate-500 mt-1">7-step simple registration</p>
        </div>

        <div
          onClick={() => setTab('my-profiles')}
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 active:scale-98 transition-all cursor-pointer"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mb-3">
            <FolderHeart className="w-5 h-5" />
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900">{t('navMyProfiles')}</h4>
          <p className="text-[11px] text-slate-500 mt-1">View & update your rishtas</p>
        </div>

        <a
          href="/admin/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 active:scale-98 transition-all cursor-pointer block"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3">
            <Users className="w-5 h-5" />
          </div>
          <h4 className="text-xs sm:text-sm font-bold text-slate-900">Consultant Desk</h4>
          <p className="text-[11px] text-slate-500 mt-1">Admin management panel</p>
        </a>
      </div>

      {/* Recent Proposals Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {t('recentProfilesHeader')}
            </h3>
            <p className="text-xs text-slate-500 hidden sm:block">Recently verified matrimonial candidates across Pakistan</p>
          </div>
          <button
            onClick={() => setTab('search')}
            className="text-xs sm:text-sm font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 cursor-pointer"
          >
            <span>View All Profiles</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading active proposals...</div>
        ) : recentProfiles.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl">
            No proposals found.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recentProfiles.map((profile) => (
              <ProfileCard
                key={profile.profile_id}
                profile={profile}
                onViewDetails={onSelectProfile}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
