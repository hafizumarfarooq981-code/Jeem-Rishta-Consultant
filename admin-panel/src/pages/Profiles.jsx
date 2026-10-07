import React, { useState, useEffect } from 'react';
import { 
  HeartHandshake, 
  Search, 
  Filter, 
  Eye, 
  ShieldCheck, 
  ShieldAlert, 
  Trash2, 
  MapPin, 
  Lock, 
  Phone, 
  MessageSquare, 
  User, 
  CheckCircle2, 
  X,
  AlertCircle,
  Clock
} from 'lucide-react';
import { adminApi } from '../api/client';

export default function Profiles() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [activeTab, setActiveTab] = useState('matrimonial'); // matrimonial, family, partner, private
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const params = {};
      if (searchId) params.profileId = searchId;
      if (genderFilter) params.gender = genderFilter;
      if (statusFilter) params.status = statusFilter;
      if (cityFilter) params.city = cityFilter;

      const res = await adminApi.getProfiles(params);
      if (res.success) {
        setProfiles(res.data.profiles);
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: err.message || 'Failed to load profiles', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
  }, [genderFilter, statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadProfiles();
  };

  const handleOpenDetail = async (p) => {
    setSelectedProfile(p);
    setActiveTab('matrimonial');
    try {
      setDetailLoading(true);
      const res = await adminApi.getProfileDetails(p.profile_id);
      if (res.success) {
        setDetailData(res.data);
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to load full profile details', type: 'error' });
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusChange = async (profileId, newStatus) => {
    try {
      setActionLoading(true);
      const res = await adminApi.setProfileStatus(profileId, newStatus);
      if (res.success) {
        setMessage({ text: res.message, type: 'success' });
        loadProfiles();
        if (selectedProfile && selectedProfile.profile_id === profileId) {
          setSelectedProfile({ ...selectedProfile, status: newStatus });
        }
      }
    } catch (err) {
      setMessage({ text: err.message || 'Failed to update status', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Alert banner */}
      {message.text && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
          message.type === 'error' 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage({ text: '', type: '' })} className="text-xs font-bold underline">Dismiss</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="Search Profile ID (e.g. JRC-10001)..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <input
            type="text"
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            placeholder="City (e.g. Lahore)..."
            className="w-36 px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Filter
          </button>
          {(searchId || cityFilter) && (
            <button
              type="button"
              onClick={() => { setSearchId(''); setCityFilter(''); loadProfiles(); }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors"
            >
              Reset
            </button>
          )}
        </form>

        <div className="flex items-center gap-3 w-full lg:w-auto">
          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="">All Genders</option>
            <option value="Male">Male Candidates</option>
            <option value="Female">Female Candidates</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active (Public)</option>
            <option value="blocked">Blocked</option>
            <option value="removed">Removed</option>
          </select>
        </div>
      </div>

      {/* Profiles Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">Profile ID</th>
                <th className="px-5 py-3.5">Candidate Details</th>
                <th className="px-5 py-3.5">Religion & Sect</th>
                <th className="px-5 py-3.5">Education & Profession</th>
                <th className="px-5 py-3.5">City</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-10 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-2" />
                    Loading rishta proposals...
                  </td>
                </tr>
              ) : profiles.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400">
                    No rishta profiles found matching criteria.
                  </td>
                </tr>
              ) : (
                profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-emerald-700">
                      {p.profile_id}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-semibold text-slate-900">
                        {p.gender}, {p.age} years
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {p.marital_status} • {p.relationship_for}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-800">{p.religion}</div>
                      <div className="text-[11px] text-slate-500">{p.sect || 'General'}</div>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-slate-800">{p.education}</div>
                      <div className="text-[11px] text-slate-500">{p.profession}</div>
                    </td>
                    <td className="px-5 py-3.5 font-medium text-slate-700">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.city}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        p.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : p.status === 'blocked'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {p.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenDetail(p)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-xs flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Full</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL PROFILE REVIEW MODAL (INCLUDES PRIVATE DETAILS) */}
      {selectedProfile && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                  {selectedProfile.profile_id.replace('JRC-', '#')}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{selectedProfile.profile_id}</h3>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedProfile.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {selectedProfile.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Candidate for: {selectedProfile.relationship_for} • Account Mobile: {selectedProfile.user_mobile || 'Registered User'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setSelectedProfile(null); setDetailData(null); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-slate-200 px-6 bg-white gap-2">
              <button
                onClick={() => setActiveTab('matrimonial')}
                className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
                  activeTab === 'matrimonial'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Matrimonial Details
              </button>
              <button
                onClick={() => setActiveTab('family')}
                className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
                  activeTab === 'family'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Family Structure
              </button>
              <button
                onClick={() => setActiveTab('partner')}
                className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all ${
                  activeTab === 'partner'
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                Partner Requirements
              </button>
              <button
                onClick={() => setActiveTab('private')}
                className={`py-3 px-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1 ${
                  activeTab === 'private'
                    ? 'border-rose-600 text-rose-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-rose-500" />
                <span>Private Contact Details</span>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {detailLoading || !detailData ? (
                <div className="py-12 text-center text-xs text-slate-400">Loading complete dossier...</div>
              ) : (
                <>
                  {/* TAB 1: Matrimonial */}
                  {activeTab === 'matrimonial' && (
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 font-medium">Gender & Age:</span>
                        <p className="font-bold text-slate-800 text-sm mt-0.5">{detailData.profile.gender}, {detailData.profile.age} Years Old</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 font-medium">Marital Status:</span>
                        <p className="font-bold text-slate-800 text-sm mt-0.5">{detailData.profile.marital_status}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 font-medium">Religion & Sect:</span>
                        <p className="font-bold text-slate-800 text-sm mt-0.5">{detailData.profile.religion} ({detailData.profile.sect || 'General'})</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 font-medium">Public City:</span>
                        <p className="font-bold text-slate-800 text-sm mt-0.5">{detailData.profile.city}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 font-medium">Education Level:</span>
                        <p className="font-bold text-slate-800 text-sm mt-0.5">
                          {detailData.profile.education} {detailData.profile.custom_education ? `(${detailData.profile.custom_education})` : ''}
                        </p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 font-medium">Profession / Job:</span>
                        <p className="font-bold text-slate-800 text-sm mt-0.5">{detailData.profile.profession}</p>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: Family */}
                  {activeTab === 'family' && (
                    <div className="space-y-4 text-xs">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 font-medium">Father / Guardian:</span>
                          <p className="font-bold text-slate-800 text-sm mt-0.5">{detailData.family.father_guardian_name || 'Not specified'}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 font-medium">Mother Name:</span>
                          <p className="font-bold text-slate-800 text-sm mt-0.5">{detailData.family.mother_name || 'Not specified'}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-3 text-center">
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 block">Brothers</span>
                          <span className="font-bold text-base text-slate-800">{detailData.family.brothers_count || 0}</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 block">Married Brothers</span>
                          <span className="font-bold text-base text-slate-800">{detailData.family.married_brothers_count || 0}</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 block">Sisters</span>
                          <span className="font-bold text-base text-slate-800">{detailData.family.sisters_count || 0}</span>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 block">Married Sisters</span>
                          <span className="font-bold text-base text-slate-800">{detailData.family.married_sisters_count || 0}</span>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 font-semibold block mb-1">Family Background & Community:</span>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {detailData.family.family_background || 'No additional family background provided.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: Partner Requirements */}
                  {activeTab === 'partner' && (
                    <div className="space-y-4 text-xs">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 font-medium">Preferred Gender & Age:</span>
                          <p className="font-bold text-slate-800 text-sm mt-0.5">
                            {detailData.partner_requirements.preferred_gender || 'Any'} ({detailData.partner_requirements.preferred_min_age || 18} - {detailData.partner_requirements.preferred_max_age || 50} yrs)
                          </p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 font-medium">Preferred Religion & Sect:</span>
                          <p className="font-bold text-slate-800 text-sm mt-0.5">
                            {detailData.partner_requirements.preferred_religion || 'Any'} ({detailData.partner_requirements.preferred_sect || 'Any'})
                          </p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 font-medium">Preferred Marital Status:</span>
                          <p className="font-bold text-slate-800 text-sm mt-0.5">{detailData.partner_requirements.preferred_marital_status || 'Any'}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 font-medium">Preferred Education:</span>
                          <p className="font-bold text-slate-800 text-sm mt-0.5">{detailData.partner_requirements.preferred_education || 'Any'}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 font-medium">Preferred Profession:</span>
                          <p className="font-bold text-slate-800 text-sm mt-0.5">{detailData.partner_requirements.preferred_profession || 'Any'}</p>
                        </div>
                        <div className="p-3 bg-slate-50 rounded-xl">
                          <span className="text-slate-400 font-medium">Preferred City:</span>
                          <p className="font-bold text-slate-800 text-sm mt-0.5">{detailData.partner_requirements.preferred_city || 'Any'}</p>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl">
                        <span className="text-slate-400 font-semibold block mb-1">Additional Requirements:</span>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                          {detailData.partner_requirements.other_requirements || 'No specific additional partner requirements stated.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: STRICTLY PRIVATE DETAILS (Clause 25) */}
                  {activeTab === 'private' && (
                    <div className="space-y-4 text-xs">
                      <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 flex items-center gap-2">
                        <Lock className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>
                          <strong>Confidential Data:</strong> This private contact and location information is restricted to authorized consultants and is never returned in public APIs.
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-slate-400 font-semibold block">Guardian / Contact Name:</span>
                          <p className="font-bold text-slate-900 text-sm mt-1">{detailData.private_details.guardian_contact_name || 'N/A'}</p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-slate-400 font-semibold block">Contact Mobile Number:</span>
                          <p className="font-bold text-slate-900 text-sm mt-1 flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{detailData.private_details.contact_mobile || 'N/A'}</span>
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-slate-400 font-semibold block">WhatsApp Number:</span>
                          <p className="font-bold text-slate-900 text-sm mt-1 flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{detailData.private_details.whatsapp_number || 'N/A'}</span>
                          </p>
                        </div>
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-slate-400 font-semibold block">Province / Area:</span>
                          <p className="font-bold text-slate-900 text-sm mt-1">
                            {detailData.private_details.province || 'N/A'} • {detailData.private_details.area || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-slate-400 font-semibold block mb-1">Complete Physical Street Address:</span>
                        <p className="font-semibold text-slate-800 leading-relaxed text-sm">
                          {detailData.private_details.complete_address || 'N/A'}
                        </p>
                      </div>

                      {detailData.private_details.other_private_notes && (
                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <span className="text-slate-400 font-semibold block mb-1">Private Consultant Notes:</span>
                          <p className="text-slate-700 leading-relaxed">
                            {detailData.private_details.other_private_notes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Modal Footer / Administrative Controls */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Change Status:</span>
                <button
                  onClick={() => handleStatusChange(selectedProfile.profile_id, 'active')}
                  disabled={actionLoading || selectedProfile.status === 'active'}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-colors"
                >
                  Active
                </button>
                <button
                  onClick={() => handleStatusChange(selectedProfile.profile_id, 'blocked')}
                  disabled={actionLoading || selectedProfile.status === 'blocked'}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40 transition-colors"
                >
                  Block
                </button>
                <button
                  onClick={() => handleStatusChange(selectedProfile.profile_id, 'removed')}
                  disabled={actionLoading || selectedProfile.status === 'removed'}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-40 transition-colors"
                >
                  Remove
                </button>
              </div>

              <button
                onClick={() => { setSelectedProfile(null); setDetailData(null); }}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
