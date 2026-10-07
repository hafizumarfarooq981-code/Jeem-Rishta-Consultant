import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Lock, 
  ShieldCheck, 
  Loader2, 
  AlertCircle, 
  HeartHandshake,
  Sparkles
} from 'lucide-react';
import { api } from '../../api/client';
import { t } from '../../i18n/strings';

export default function AddRishtaWizard({ onFinished, onCancel }) {
  const [step, setStep] = useState(1);
  const totalSteps = 7;
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [createdProfileId, setCreatedProfileId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1
    relationship_for: 'My Son',
    // Step 2
    gender: 'Male',
    age: '',
    marital_status: 'Never Married',
    // Step 3
    religion: 'Muslim',
    sect: 'Sunni',
    // Step 4
    education: 'Bachelor',
    custom_education: '',
    profession: '',
    city: '',
    // Step 5: Family
    father_guardian_name: '',
    mother_name: '',
    brothers_count: 0,
    sisters_count: 0,
    married_brothers_count: 0,
    married_sisters_count: 0,
    family_background: '',
    // Step 6: Private Contact
    guardian_contact_name: '',
    contact_mobile: '',
    whatsapp_number: '',
    country: 'Pakistan',
    province: 'Punjab',
    area: '',
    complete_address: '',
    other_private_notes: '',
    // Step 7: Partner Requirements
    preferred_gender: 'Female',
    preferred_min_age: '',
    preferred_max_age: '',
    preferred_religion: 'Muslim',
    preferred_sect: 'Sunni',
    preferred_marital_status: 'Never Married',
    preferred_education: 'Bachelor',
    preferred_profession: '',
    preferred_city: '',
    other_requirements: ''
  });

  const updateField = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // Step Validation
  const validateCurrentStep = () => {
    setError('');

    if (step === 1) {
      if (!formData.relationship_for) {
        setError('Please select who this rishta proposal is for.');
        return false;
      }
    }

    if (step === 2) {
      const ageNum = parseInt(formData.age, 10);
      if (isNaN(ageNum) || ageNum < 18 || ageNum > 90) {
        setError('Please enter a valid age between 18 and 90.');
        return false;
      }
    }

    if (step === 3) {
      if (!formData.religion) {
        setError('Please select a religion.');
        return false;
      }
    }

    if (step === 4) {
      if (!formData.education) {
        setError('Please select education level.');
        return false;
      }
      if (!formData.profession.trim()) {
        setError('Please enter occupation / profession.');
        return false;
      }
      if (!formData.city.trim()) {
        setError('Please specify candidate public city.');
        return false;
      }
    }

    if (step === 5) {
      // Family background is optional or recommended
    }

    if (step === 6) {
      if (!formData.guardian_contact_name.trim()) {
        setError('Guardian or Contact person name is required.');
        return false;
      }
      if (!formData.contact_mobile.trim() || formData.contact_mobile.length < 10) {
        setError('Valid contact mobile number is required.');
        return false;
      }
      if (!formData.whatsapp_number.trim() || formData.whatsapp_number.length < 10) {
        setError('Valid WhatsApp number is required.');
        return false;
      }
      if (!formData.province.trim()) {
        setError('Province is required.');
        return false;
      }
      if (!formData.complete_address.trim()) {
        setError('Complete address is required for confidential administrative records.');
        return false;
      }
    }

    return true;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (step < totalSteps) {
        setStep(s => s + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setError('');
      setStep(s => s - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onCancel();
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError('');
      const res = await api.createProfile(formData);
      if (res.success) {
        setCreatedProfileId(res.profile_id);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  // SUCCESS SCREEN
  if (createdProfileId) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4 animate-bounce">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Proposal Published!</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs leading-relaxed">
          Your matrimonial proposal has been assigned a permanent unique Profile ID and is now active.
        </p>

        <div className="my-6 p-4 bg-white border-2 border-emerald-500/40 rounded-2xl shadow-sm w-full max-w-xs">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Official Profile ID</span>
          <span className="text-2xl font-black text-emerald-800 mt-1 block">{createdProfileId}</span>
          <span className="text-[11px] text-emerald-700 font-medium mt-1 block">Status: Active & Verified</span>
        </div>

        <button
          onClick={onFinished}
          className="w-full max-w-xs py-3.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-98"
        >
          Go to My Submitted Proposals
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-28">
      {/* Wizard Header */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-slate-100 flex items-center justify-between">
        <button
          onClick={handleBack}
          className="p-1 -ml-1 text-slate-700 hover:text-emerald-700 active:scale-95"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="text-center">
          <span className="font-extrabold text-xs text-slate-900">
            {t('wizardTitle')}
          </span>
          <p className="text-[10px] text-emerald-700 font-semibold">
            Step {step} of {totalSteps}
          </p>
        </div>

        <button
          onClick={onCancel}
          className="text-xs font-bold text-slate-400 hover:text-slate-600"
        >
          Cancel
        </button>
      </div>

      {/* Step Progress Bar */}
      <div className="w-full bg-slate-200 h-1">
        <div 
          className="bg-emerald-600 h-1 transition-all duration-300"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      <div className="p-4 sm:p-6 space-y-6 max-w-2xl mx-auto">
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: Relationship For */}
        {step === 1 && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('step1Title')}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{t('step1Desc')}</p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                'Myself',
                'My Son',
                'My Daughter',
                'My Brother',
                'My Sister',
                'Other Relative'
              ].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    updateField('relationship_for', opt);
                    // Automatically auto-set default gender suggestion
                    if (opt === 'My Son' || opt === 'My Brother') {
                      updateField('gender', 'Male');
                      updateField('preferred_gender', 'Female');
                    } else if (opt === 'My Daughter' || opt === 'My Sister') {
                      updateField('gender', 'Female');
                      updateField('preferred_gender', 'Male');
                    }
                  }}
                  className={`p-3 rounded-2xl text-xs font-bold border transition-all text-left flex items-center justify-between ${
                    formData.relationship_for === opt
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/20'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{opt}</span>
                  {formData.relationship_for === opt && <Check className="w-4 h-4 text-emerald-700" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: Basic Information */}
        {step === 2 && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('step2Title')}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{t('step2Desc')}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Candidate Gender</label>
              <div className="grid grid-cols-2 gap-2.5">
                {['Male', 'Female'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => {
                      updateField('gender', g);
                      updateField('preferred_gender', g === 'Male' ? 'Female' : 'Male');
                    }}
                    className={`py-3 rounded-2xl text-xs font-bold border transition-all ${
                      formData.gender === g
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900 ring-2 ring-emerald-600/20'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    {g === 'Male' ? 'Groom (Male)' : 'Bride (Female)'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Candidate Numeric Age (Years)
              </label>
              <input
                type="number"
                min="18"
                max="90"
                required
                placeholder="e.g. 25"
                value={formData.age}
                onChange={(e) => updateField('age', e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">Numeric age only (Date of birth is not required in Version 1.0)</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Marital Status</label>
              <select
                value={formData.marital_status}
                onChange={(e) => updateField('marital_status', e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="Never Married">Never Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 3: Religion & Sect */}
        {step === 3 && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('step3Title')}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{t('step3Desc')}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Religion</label>
              <select
                value={formData.religion}
                onChange={(e) => updateField('religion', e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
                <option value="Muslim">Muslim</option>
                <option value="Christian">Christian</option>
                <option value="Hindu">Hindu</option>
                <option value="Sikh">Sikh</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {formData.religion === 'Muslim' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Sect / Denomination</label>
                <select
                  value={formData.sect}
                  onChange={(e) => updateField('sect', e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                >
                  <option value="Sunni">Sunni</option>
                  <option value="Barelvi">Barelvi</option>
                  <option value="Deobandi">Deobandi</option>
                  <option value="Ahl-e-Hadith">Ahl-e-Hadith</option>
                  <option value="Shia">Shia</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Education & Profession */}
        {step === 4 && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('step4Title')}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{t('step4Desc')}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Highest Education Level</label>
              <select
                value={formData.education}
                onChange={(e) => updateField('education', e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              >
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

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Degree Details (Optional)</label>
              <input
                type="text"
                placeholder="e.g. BS Software Engineering, MBBS, ACCA"
                value={formData.custom_education}
                onChange={(e) => updateField('custom_education', e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Profession / Occupation</label>
              <input
                type="text"
                required
                placeholder="e.g. Software Engineer, Doctor, Teacher, Business"
                value={formData.profession}
                onChange={(e) => updateField('profession', e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Candidate City (Publicly Displayed)</label>
              <input
                type="text"
                required
                placeholder="e.g. Sahiwal, Lahore, Karachi, Islamabad"
                value={formData.city}
                onChange={(e) => updateField('city', e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-600 focus:outline-none"
              />
              <p className="text-[10px] text-slate-400 mt-1">Only the city name is shown publicly. Complete address is strictly private.</p>
            </div>
          </div>
        )}

        {/* STEP 5: Family Information */}
        {step === 5 && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('step5Title')}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{t('step5Desc')}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Father / Guardian Name</label>
                <input
                  type="text"
                  placeholder="e.g. M. Aslam"
                  value={formData.father_guardian_name}
                  onChange={(e) => updateField('father_guardian_name', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mother Name</label>
                <input
                  type="text"
                  placeholder="e.g. Parveen"
                  value={formData.mother_name}
                  onChange={(e) => updateField('mother_name', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Total Brothers</label>
                <input
                  type="number"
                  min="0"
                  value={formData.brothers_count}
                  onChange={(e) => updateField('brothers_count', e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Married Brothers</label>
                <input
                  type="number"
                  min="0"
                  value={formData.married_brothers_count}
                  onChange={(e) => updateField('married_brothers_count', e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Total Sisters</label>
                <input
                  type="number"
                  min="0"
                  value={formData.sisters_count}
                  onChange={(e) => updateField('sisters_count', e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Married Sisters</label>
                <input
                  type="number"
                  min="0"
                  value={formData.married_sisters_count}
                  onChange={(e) => updateField('married_sisters_count', e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Family Background / Additional Details
              </label>
              <textarea
                rows={3}
                placeholder="Mention cast, family roots, values, lifestyle..."
                value={formData.family_background}
                onChange={(e) => updateField('family_background', e.target.value)}
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900"
              />
            </div>
          </div>
        )}

        {/* STEP 6: STRICTLY PRIVATE CONTACT INFORMATION (Clauses 10, 11) */}
        {step === 6 && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5">
              <Lock className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-rose-950">Strict Privacy Enforcement</h4>
                <p className="text-[11px] text-rose-900/90 mt-0.5 leading-relaxed">
                  {t('strictlyPrivateBadge')}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Guardian / Contact Person Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Muhammad Tariq (Brother/Father)"
                value={formData.guardian_contact_name}
                onChange={(e) => updateField('guardian_contact_name', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Mobile *</label>
                <input
                  type="tel"
                  required
                  placeholder="03001234567"
                  value={formData.contact_mobile}
                  onChange={(e) => updateField('contact_mobile', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="03001234567"
                  value={formData.whatsapp_number}
                  onChange={(e) => updateField('whatsapp_number', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Province *</label>
                <select
                  value={formData.province}
                  onChange={(e) => updateField('province', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value="Punjab">Punjab</option>
                  <option value="Sindh">Sindh</option>
                  <option value="KPK">Khyber Pakhtunkhwa</option>
                  <option value="Balochistan">Balochistan</option>
                  <option value="Islamabad">Islamabad Capital</option>
                  <option value="AJK">Azad Kashmir</option>
                  <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Area / Neighborhood</label>
                <input
                  type="text"
                  placeholder="e.g. Farid Town"
                  value={formData.area}
                  onChange={(e) => updateField('area', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Complete Street Address (Private) *
              </label>
              <textarea
                rows={2}
                required
                placeholder="House #, Street, Sector, City..."
                value={formData.complete_address}
                onChange={(e) => updateField('complete_address', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>
        )}

        {/* STEP 7: Partner Requirements */}
        {step === 7 && (
          <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">{t('step7Title')}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{t('step7Desc')}</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Min Age</label>
                <input
                  type="number"
                  placeholder="e.g. 22"
                  value={formData.preferred_min_age}
                  onChange={(e) => updateField('preferred_min_age', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Max Age</label>
                <input
                  type="number"
                  placeholder="e.g. 28"
                  value={formData.preferred_max_age}
                  onChange={(e) => updateField('preferred_max_age', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Religion</label>
                <input
                  type="text"
                  placeholder="e.g. Muslim"
                  value={formData.preferred_religion}
                  onChange={(e) => updateField('preferred_religion', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Sect</label>
                <input
                  type="text"
                  placeholder="e.g. Sunni, Any"
                  value={formData.preferred_sect}
                  onChange={(e) => updateField('preferred_sect', e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Preferred Cities / Location</label>
              <input
                type="text"
                placeholder="e.g. Sahiwal, Lahore, Islamabad"
                value={formData.preferred_city}
                onChange={(e) => updateField('preferred_city', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Other Desired Requirements</label>
              <textarea
                rows={3}
                placeholder="Family background, character, values, educational preferences..."
                value={formData.other_requirements}
                onChange={(e) => updateField('other_requirements', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>
        )}
      </div>

      {/* Wizard Fixed Navigation Bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white/95 backdrop-blur-md border-t sm:border border-slate-200 sm:rounded-2xl sm:bottom-4 p-4 z-40 flex items-center justify-between gap-3 shadow-xl">
        <button
          type="button"
          onClick={handleBack}
          className="px-5 py-3 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-xl text-xs font-bold transition-transform"
        >
          {step === 1 ? 'Cancel' : t('prevStep')}
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={submitting}
          className="flex-1 py-3 bg-emerald-700 hover:bg-emerald-600 active:scale-98 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-800/20 transition-transform disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Publishing Proposal...</span>
            </>
          ) : step === totalSteps ? (
            <span>{t('submitProfile')}</span>
          ) : (
            <>
              <span>{t('nextStep')}</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
