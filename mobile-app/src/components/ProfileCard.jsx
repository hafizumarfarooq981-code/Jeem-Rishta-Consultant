import React from 'react';
import { MapPin, Briefcase, GraduationCap, ArrowRight, User } from 'lucide-react';
import { t } from '../i18n/strings';

export default function ProfileCard({ profile, onViewDetails }) {
  const isFemale = profile.gender === 'Female';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Decorative Accent */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 ${
        isFemale ? 'bg-pink-500' : 'bg-emerald-600'
      }`} />

      {/* Card Header: Profile ID & Relationship */}
      <div className="flex items-center justify-between mt-1 mb-2.5">
        <span className="font-extrabold text-sm tracking-tight text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-100">
          {profile.profile_id}
        </span>
        <span className="text-[11px] font-semibold text-slate-400">
          {profile.relationship_for}
        </span>
      </div>

      {/* Candidate Primary Bio */}
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
          isFemale ? 'bg-pink-100 text-pink-700' : 'bg-emerald-100 text-emerald-800'
        }`}>
          {isFemale ? 'F' : 'M'}
        </div>
        <div>
          <h3 className="text-sm font-bold text-slate-900 leading-tight">
            {profile.gender}, {profile.age} Years Old
          </h3>
          <p className="text-[11px] text-slate-500 font-medium">
            {profile.religion}{profile.sect ? ` (${profile.sect})` : ''} • {profile.marital_status}
          </p>
        </div>
      </div>

      {/* Quick Details Chips */}
      <div className="space-y-1.5 my-3 pt-2 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{profile.education} {profile.custom_education ? `(${profile.custom_education})` : ''}</span>
        </div>
        <div className="flex items-center gap-2">
          <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate font-medium text-slate-800">{profile.profession}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span className="font-semibold text-slate-800">{profile.city}</span>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onViewDetails(profile.profile_id)}
        className="w-full mt-2 py-2 px-3 bg-slate-900 hover:bg-emerald-700 active:scale-98 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-xs"
      >
        <span>{t('viewDetails')}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
