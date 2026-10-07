import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, Filter, X, RotateCcw, SlidersHorizontal, Check } from 'lucide-react';
import { api } from '../../api/client';
import { t } from '../../i18n/strings';
import ProfileCard from '../../components/ProfileCard';

export default function SearchPage({ onSelectProfile }) {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Search Filter State
  const [filters, setFilters] = useState({
    gender: '',
    minAge: '',
    maxAge: '',
    religion: '',
    sect: '',
    marital_status: '',
    education: '',
    profession: '',
    city: ''
  });

  const loadProfiles = async (customFilters = filters) => {
    try {
      setLoading(true);
      const res = await api.searchProfiles(customFilters);
      if (res.success) {
        setProfiles(res.data.profiles);
      }
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, []);

  const handleApplyFilters = (e) => {
    if (e) e.preventDefault();
    setShowFilters(false);
    loadProfiles();
  };

  const handleClearFilters = () => {
    const cleared = {
      gender: '',
      minAge: '',
      maxAge: '',
      religion: '',
      sect: '',
      marital_status: '',
      education: '',
      profession: '',
      city: ''
    };
    setFilters(cleared);
    loadProfiles(cleared);
  };

  const hasActiveFilters = Object.values(filters).some(val => val !== '');

  // Render form controls (shared between desktop sidebar and mobile drawer)
  const renderFilterInputs = () => (
    <>
      {/* Gender */}
      <div>
        <label className="block font-semibold text-slate-700 mb-1">{t('filterGender')}</label>
        <select
          value={filters.gender}
          onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
        >
          <option value="">All Genders</option>
          <option value="Female">Female (Bride)</option>
          <option value="Male">Male (Groom)</option>
        </select>
      </div>

      {/* Age Range */}
      <div>
        <label className="block font-semibold text-slate-700 mb-1">{t('filterAgeRange')}</label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            min="18"
            max="90"
            placeholder="Min Age"
            value={filters.minAge}
            onChange={(e) => setFilters({ ...filters, minAge: e.target.value })}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-emerald-600"
          />
          <input
            type="number"
            min="18"
            max="90"
            placeholder="Max Age"
            value={filters.maxAge}
            onChange={(e) => setFilters({ ...filters, maxAge: e.target.value })}
            className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-emerald-600"
          />
        </div>
      </div>

      {/* Religion & Sect */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
        <div>
          <label className="block font-semibold text-slate-700 mb-1">{t('filterReligion')}</label>
          <select
            value={filters.religion}
            onChange={(e) => setFilters({ ...filters, religion: e.target.value })}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-emerald-600"
          >
            <option value="">Any Religion</option>
            <option value="Muslim">Muslim</option>
            <option value="Christian">Christian</option>
            <option value="Hindu">Hindu</option>
            <option value="Sikh">Sikh</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">{t('filterSect')}</label>
          <select
            value={filters.sect}
            onChange={(e) => setFilters({ ...filters, sect: e.target.value })}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-emerald-600"
          >
            <option value="">Any Sect</option>
            <option value="Sunni">Sunni</option>
            <option value="Barelvi">Barelvi</option>
            <option value="Deobandi">Deobandi</option>
            <option value="Ahl-e-Hadith">Ahl-e-Hadith</option>
            <option value="Shia">Shia</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Marital Status */}
      <div>
        <label className="block font-semibold text-slate-700 mb-1">{t('filterMaritalStatus')}</label>
        <select
          value={filters.marital_status}
          onChange={(e) => setFilters({ ...filters, marital_status: e.target.value })}
          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-emerald-600"
        >
          <option value="">Any Marital Status</option>
          <option value="Never Married">Never Married</option>
          <option value="Divorced">Divorced</option>
          <option value="Widowed">Widowed</option>
        </select>
      </div>

      {/* Education */}
      <div>
        <label className="block font-semibold text-slate-700 mb-1">{t('filterEducation')}</label>
        <select
          value={filters.education}
          onChange={(e) => setFilters({ ...filters, education: e.target.value })}
          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-emerald-600"
        >
          <option value="">Any Education</option>
          <option value="Primary">Primary</option>
          <option value="Matric">Matric</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Bachelor">Bachelor</option>
          <option value="Master">Master</option>
          <option value="MPhil">MPhil</option>
          <option value="PhD">PhD</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Profession */}
      <div>
        <label className="block font-semibold text-slate-700 mb-1">{t('filterProfession')}</label>
        <input
          type="text"
          placeholder="e.g. Engineer, Doctor, Business"
          value={filters.profession}
          onChange={(e) => setFilters({ ...filters, profession: e.target.value })}
          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-emerald-600"
        />
      </div>

      {/* City */}
      <div>
        <label className="block font-semibold text-slate-700 mb-1">{t('filterCity')}</label>
        <input
          type="text"
          placeholder="e.g. Lahore, Karachi, Sahiwal"
          value={filters.city}
          onChange={(e) => setFilters({ ...filters, city: e.target.value })}
          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-emerald-600"
        />
      </div>
    </>
  );

  return (
    <div className="pb-24 px-4 sm:px-6 lg:px-8 pt-4">
      {/* Page Title & Fast Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{t('searchTitle')}</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Discover verified matrimonial matches across Pakistan and abroad ({profiles.length} available)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs"
              title="Clear all filters"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          )}

          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(true)}
            className={`lg:hidden px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-transform active:scale-95 shadow-xs ${
              hasActiveFilters
                ? 'bg-emerald-700 text-white shadow-emerald-800/20'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters {hasActiveFilters ? '• Active' : ''}</span>
          </button>
        </div>
      </div>

      {/* Main Responsive Layout: Sidebar on Desktop + Grid on Right */}
      <div className="flex flex-col lg:flex-row gap-6 mt-6 items-start">
        {/* DESKTOP FILTER SIDEBAR */}
        <aside className="hidden lg:block w-72 shrink-0 bg-white rounded-3xl border border-slate-200 p-5 shadow-xs sticky top-24">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-emerald-700" />
              <span>Search Filters</span>
            </h2>
            {hasActiveFilters && (
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </div>

          <form onSubmit={handleApplyFilters} className="space-y-4 text-xs">
            {renderFilterInputs()}

            <div className="pt-3 flex gap-2">
              <button
                type="button"
                onClick={handleClearFilters}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-colors"
              >
                {t('filterClearBtn')}
              </button>
              <button
                type="submit"
                className="flex-2 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-md shadow-emerald-800/20 transition-all active:scale-98"
              >
                {t('filterApplyBtn')}
              </button>
            </div>
          </form>
        </aside>

        {/* RESULTS CONTENT AREA */}
        <main className="flex-1 min-w-0 w-full space-y-4">
          {/* Quick Gender Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
            <button
              onClick={() => {
                const next = { ...filters, gender: '' };
                setFilters(next);
                loadProfiles(next);
              }}
              className={`px-4 py-2 rounded-xl font-semibold shrink-0 transition-all ${
                filters.gender === '' 
                  ? 'bg-slate-900 text-white shadow-xs' 
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              All Proposals
            </button>
            <button
              onClick={() => {
                const next = { ...filters, gender: 'Female' };
                setFilters(next);
                loadProfiles(next);
              }}
              className={`px-4 py-2 rounded-xl font-semibold shrink-0 transition-all ${
                filters.gender === 'Female' 
                  ? 'bg-pink-600 text-white shadow-xs shadow-pink-600/20' 
                  : 'bg-pink-50 border border-pink-200 text-pink-700 hover:bg-pink-100/60'
              }`}
            >
              👰 Brides (Female)
            </button>
            <button
              onClick={() => {
                const next = { ...filters, gender: 'Male' };
                setFilters(next);
                loadProfiles(next);
              }}
              className={`px-4 py-2 rounded-xl font-semibold shrink-0 transition-all ${
                filters.gender === 'Male' 
                  ? 'bg-emerald-700 text-white shadow-xs shadow-emerald-800/20' 
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100/60'
              }`}
            >
              🤵 Grooms (Male)
            </button>
          </div>

          {/* Profiles Results List / Grid */}
          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400 bg-white rounded-3xl border border-slate-100 shadow-xs">
              <div className="inline-block w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="font-semibold text-slate-600 text-sm">Searching verified matrimonial proposals...</p>
              <p className="text-slate-400 text-xs mt-1">Applying filters to find matching proposals</p>
            </div>
          ) : profiles.length === 0 ? (
            <div className="py-16 px-6 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-xs">
              <p className="text-sm text-slate-600 font-semibold leading-relaxed">
                {t('noProfilesFound')}
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                Try widening your search criteria or resetting filters to view all verified candidates.
              </p>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="mt-4 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl active:scale-95 transition-all shadow-md shadow-emerald-800/20"
                >
                  {t('filterClearBtn')}
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {profiles.map((p) => (
                <ProfileCard
                  key={p.profile_id}
                  profile={p}
                  onViewDetails={onSelectProfile}
                />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* MOBILE FILTER MODAL DRAWER */}
      {showFilters && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 lg:hidden">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-200">
            {/* Drawer Header */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Search Filters</h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter Fields */}
            <form onSubmit={handleApplyFilters} className="p-5 overflow-y-auto space-y-4 text-xs">
              {renderFilterInputs()}

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={handleClearFilters}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold active:scale-98 transition-transform"
                >
                  {t('filterClearBtn')}
                </button>
                <button
                  type="submit"
                  className="flex-2 py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl font-bold shadow-md shadow-emerald-800/20 active:scale-98 transition-transform"
                >
                  {t('filterApplyBtn')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
