import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  MessageSquare, 
  Phone, 
  Mail, 
  ShieldCheck, 
  FileText, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { adminApi } from '../api/client';

export default function Settings() {
  const [settings, setSettings] = useState({
    admin_whatsapp_number: '',
    app_name: '',
    support_email: '',
    support_phone: '',
    terms_and_conditions: '',
    privacy_policy: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getSettings();
      if (res.success) {
        setSettings((prev) => ({ ...prev, ...res.settings }));
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: 'Failed to load system settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setMessage({ text: '', type: '' });
      const res = await adminApi.updateSettings(settings);
      if (res.success) {
        setMessage({ text: 'Settings updated successfully! Mobile application will immediately use these new parameters.', type: 'success' });
      }
    } catch (err) {
      setMessage({ text: err.message || 'Failed to update settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">Loading system parameters...</div>
    );
  }

  return (
    <div className="p-8 max-w-4xl space-y-6">
      {/* Alert banner */}
      {message.text && (
        <div className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
          message.type === 'error' 
            ? 'bg-rose-50 border-rose-200 text-rose-800' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2">
            {message.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage({ text: '', type: '' })} className="text-xs font-bold underline">Dismiss</button>
        </div>
      )}

      {/* Info Card on WhatsApp dynamic routing */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex items-start gap-4">
        <div className="p-2.5 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-emerald-900">Dynamic Consultant WhatsApp Routing</h4>
          <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
            Per the Master Development Specification, the mobile application never hardcodes the admin contact number. 
            When any mobile user taps <strong>"Contact Admin"</strong> on a rishta profile, the application fetches this number in real-time. 
            Changing this number takes effect instantly for all active mobile app users without releasing a Google Play Store update.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* WhatsApp & Communications */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-emerald-600" />
            <span>Consultant WhatsApp Integration</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Admin WhatsApp Number (International format without +)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={settings.admin_whatsapp_number}
                onChange={(e) => handleChange('admin_whatsapp_number', e.target.value)}
                placeholder="e.g. 923001234567"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Example format: <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700">923001234567</code> (starts with country code 92 for Pakistan).
            </p>
          </div>
        </div>

        {/* General Application Configuration */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <SettingsIcon className="w-4 h-4 text-slate-600" />
            <span>Application Identity & Support</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Application Name
              </label>
              <input
                type="text"
                required
                value={settings.app_name}
                onChange={(e) => handleChange('app_name', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Support Helpline Phone
              </label>
              <input
                type="text"
                value={settings.support_phone}
                onChange={(e) => handleChange('support_phone', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Support Official Email
              </label>
              <input
                type="email"
                value={settings.support_email}
                onChange={(e) => handleChange('support_email', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Legal, Terms & Privacy */}
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Legal Declarations (Google Play Ready)</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Terms & Conditions Text
            </label>
            <textarea
              rows={4}
              value={settings.terms_and_conditions}
              onChange={(e) => handleChange('terms_and_conditions', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Privacy Policy Text
            </label>
            <textarea
              rows={4}
              value={settings.privacy_policy}
              onChange={(e) => handleChange('privacy_policy', e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving System Changes...' : 'Save Configuration Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
