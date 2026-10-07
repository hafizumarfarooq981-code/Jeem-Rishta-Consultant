import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  MapPin, 
  GraduationCap, 
  Briefcase, 
  Users, 
  Heart, 
  Lock, 
  MessageSquare, 
  ShieldCheck, 
  Share2,
  AlertCircle,
  Clock,
  PhoneCall,
  CheckCircle2
} from 'lucide-react';
import { api } from '../../api/client';
import { t } from '../../i18n/strings';

export default function ProfileDetail({ profileId, onBack }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contacting, setContacting] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadDetail() {
      try {
        setLoading(true);
        setError('');
        const res = await api.getPublicProfile(profileId);
        if (res.success) {
          setData(res.data);
        }
      } catch (err) {
        setError(err.message || 'Failed to load profile details.');
      } finally {
        setLoading(false);
      }
    }
    if (profileId) {
      loadDetail();
    }
  }, [profileId]);

  const handleContactAdmin = async () => {
    if (!data?.profile) return;
    setContacting(true);
    await api.contactAdminWhatsApp(data.profile);
    setContacting(false);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Jeem Rishta Proposal - ${data?.profile?.profile_id}`,
        text: `Check out matrimonial proposal ${data?.profile?.profile_id} on Jeem Rishta Consultant`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading proposal dossier...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-[70vh] p-6 flex flex-col items-center justify-center text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
        <h3 className="text-base font-bold text-slate-800">Proposal Unavailable</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">{error || 'This proposal is no longer available or has been removed.'}</p>
        <button
          onClick={onBack}
          className="mt-5 px-5 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-xs"
        >
          Return to Proposals
        </button>
      </div>
    );
  }

  const { profile, family, partner_requirements: partner } = data;
  const isFemale = profile.gender === 'Female';

  return (
    <div className="min-h-screen bg-slate-50 pb-28 lg:pb-16 pt-3 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation Bar / Breadcrumb */}
        <div className="flex items-center justify-between py-3 mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-emerald-700 font-bold text-xs py-1.5 px-3 rounded-xl bg-white border border-slate-200 shadow-2xs transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Proposals</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-slate-600 hover:text-slate-900 font-semibold text-xs py-1.5 px-3 rounded-xl bg-white border border-slate-200 shadow-2xs transition-colors"
            >
              <Share2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>
            <span className="text-xs font-bold text-slate-400">ID: {profile.profile_id}</span>
          </div>
        </div>

        {/* 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Info Column (Spans 2 cols on Desktop) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Candidate Banner Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-2 ${
                isFemale ? 'bg-pink-500' : 'bg-emerald-600'
              }`} />

              <div className="flex flex-wrap items-center justify-between gap-2 mt-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-100">
                    {profile.profile_id}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                    {profile.relationship_for}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Proposal</span>
                </div>
              </div>

              <div className="mt-4">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
                  {profile.gender}, {profile.age} Years Old
                </h1>
                <p className="text-sm text-slate-500 font-semibold mt-1 flex items-center gap-2">
                  <span>{profile.religion}{profile.sect ? ` (${profile.sect})` : ''}</span>
                  <span>•</span>
                  <span>{profile.marital_status}</span>
                </p>
              </div>

              {/* Grid of Key Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-100 text-xs">
                <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white text-slate-500 shadow-2xs flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Education</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {profile.education} {profile.custom_education ? `(${profile.custom_education})` : ''}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white text-slate-500 shadow-2xs flex items-center justify-center shrink-0">
                    <Briefcase className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Profession</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {profile.profession || 'Not Specified'}
                    </span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-white text-slate-500 shadow-2xs flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4 text-emerald-700" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-semibold uppercase block">Location</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {profile.city}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Family Structure Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <span>{t('familyInfo')}</span>
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">{t('brothers')}</span>
                  <span className="font-black text-slate-800 text-lg mt-0.5 block">
                    {family.brothers_count || 0}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Total</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Married Brothers</span>
                  <span className="font-black text-slate-800 text-lg mt-0.5 block">
                    {family.married_brothers_count || 0}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Married</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">{t('sisters')}</span>
                  <span className="font-black text-slate-800 text-lg mt-0.5 block">
                    {family.sisters_count || 0}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Total</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Married Sisters</span>
                  <span className="font-black text-slate-800 text-lg mt-0.5 block">
                    {family.married_sisters_count || 0}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">Married</span>
                </div>
              </div>

              {family.family_background && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-600 block mb-1.5">Family Background & Caste:</span>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {family.family_background}
                  </p>
                </div>
              )}
            </div>

            {/* Partner Requirements Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Heart className="w-4 h-4 text-emerald-700" />
                <span>{t('partnerReqs')}</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-2xl">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Preferred Gender & Age</span>
                  <span className="font-bold text-slate-800 text-sm mt-1 block">
                    {partner.preferred_gender || 'Any'} ({partner.preferred_min_age || 18} - {partner.preferred_max_age || 50} yrs)
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Religion & Sect</span>
                  <span className="font-bold text-slate-800 text-sm mt-1 block">
                    {partner.preferred_religion || 'Any'} ({partner.preferred_sect || 'Any'})
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Marital Status</span>
                  <span className="font-bold text-slate-800 text-sm mt-1 block">
                    {partner.preferred_marital_status || 'Any'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Education & Profession</span>
                  <span className="font-bold text-slate-800 text-sm mt-1 block truncate">
                    {partner.preferred_education || 'Any'} • {partner.preferred_profession || 'Any'}
                  </span>
                </div>

                <div className="sm:col-span-2 p-3.5 bg-slate-50 rounded-2xl">
                  <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Preferred City / Region</span>
                  <span className="font-bold text-slate-800 text-sm mt-1 block">
                    {partner.preferred_city || 'Any City in Pakistan or Overseas'}
                  </span>
                </div>
              </div>

              {partner.other_requirements && (
                <div className="pt-2">
                  <span className="text-xs font-bold text-slate-600 block mb-1.5">Additional Criteria:</span>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    {partner.other_requirements}
                  </p>
                </div>
              )}
            </div>

            {/* Privacy Shield Notice (Clause 14, 17) */}
            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-200/80 text-xs text-emerald-950 leading-relaxed flex items-start gap-3">
              <Lock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold block text-emerald-950 text-sm">Strict Contact Privacy Protected (Clause 14)</span>
                Direct candidate contact information and home addresses are never published publicly to preserve dignity and safeguard family privacy. All family introductions are coordinated respectfully through our verified consultant.
              </div>
            </div>
          </div>

          {/* Right Column: Desktop Contact Card (Sticky) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="border-b border-slate-100 pb-4">
                <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  Official Matchmaking Service
                </span>
                <h3 className="text-lg font-black text-slate-900 mt-2">Interested in this Rishta?</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Our professional consultant will introduce both families respectfully after mutual consent.
                </p>
              </div>

              {/* Main Desktop Contact Button */}
              <button
                onClick={handleContactAdmin}
                disabled={contacting}
                className="w-full py-4 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-700/25 transition-all disabled:opacity-50"
              >
                <MessageSquare className="w-5 h-5" />
                <span>{contacting ? 'Opening WhatsApp...' : 'Contact via WhatsApp'}</span>
              </button>

              <div className="space-y-3 pt-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Proposal ID: <strong className="text-slate-900">{profile.profile_id}</strong> automatically attached</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>100% Free consultation & guidance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Respectful, verified background checks</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={handleShare}
                  className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>{copied ? 'Proposal Link Copied!' : 'Share Proposal with Family'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE-ONLY FIXED BOTTOM ACTION BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-4 z-40 shadow-xl pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleContactAdmin}
            disabled={contacting}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white rounded-2xl font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-700/30 transition-transform disabled:opacity-50"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{contacting ? 'Opening WhatsApp...' : t('contactAdminBtn')}</span>
          </button>
          <p className="text-[10px] text-center text-slate-400 mt-1.5 font-medium">
            Opens WhatsApp with proposal ID ({profile.profile_id}) for Admin coordination
          </p>
        </div>
      </div>
    </div>
  );
}
