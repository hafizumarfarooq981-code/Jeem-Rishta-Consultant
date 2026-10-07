import React, { useState, useEffect } from 'react';
import { 
  Users, 
  HeartHandshake, 
  UserCheck, 
  UserX, 
  ShieldAlert, 
  Clock, 
  TrendingUp, 
  CheckCircle2, 
  MessageSquare,
  ArrowRight
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { adminApi } from '../api/client';

export default function Dashboard({ setTab }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminApi.getDashboard();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading && !data) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500 font-medium">Loading platform analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button 
            onClick={loadDashboard}
            className="px-3 py-1 bg-rose-600 text-white text-xs rounded-lg font-medium hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { stats, recentActivity } = data || { stats: {}, recentActivity: [] };

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Live Matrimonial Platform
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Jeem Rishta Consultant Overview
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Manage matrimonial proposals, verify submissions, protect contact privacy, and regulate consultant communications seamlessly.
          </p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => setTab('profiles')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow transition-colors flex items-center gap-1.5"
            >
              <span>Review Profiles</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setTab('settings')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
              <span>Configure WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Users"
          value={stats.totalUsers || 0}
          subtitle={`+${stats.newUsers || 0} new in past 7 days`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Total Proposals"
          value={stats.totalProfiles || 0}
          subtitle={`+${stats.newProfiles || 0} submitted in past 7 days`}
          icon={HeartHandshake}
          color="emerald"
        />
        <StatCard
          title="Active Proposals"
          value={stats.activeProfiles || 0}
          subtitle="Visible in public search"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Blocked Proposals"
          value={stats.blockedProfiles || 0}
          subtitle="Hidden from public access"
          icon={ShieldAlert}
          color="rose"
        />
      </div>

      {/* Secondary Demographic Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Gender Distribution
          </h3>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-sm font-medium text-slate-700">Male Proposals</span>
            <span className="text-sm font-bold text-slate-900">{stats.maleProfiles || 0}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-slate-700">Female Proposals</span>
            <span className="text-sm font-bold text-slate-900">{stats.femaleProfiles || 0}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Platform Security & Status
          </h3>
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-sm font-medium text-slate-700">Removed Profiles</span>
            <span className="text-sm font-bold text-slate-500">{stats.removedProfiles || 0}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm font-medium text-slate-700">Contact Privacy Engine</span>
            <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">Active & Enforced</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button
              onClick={() => setTab('users')}
              className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors flex items-center justify-between"
            >
              <span>Manage Registered Accounts</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <button
              onClick={() => setTab('audit-logs')}
              className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700 transition-colors flex items-center justify-between"
            >
              <span>Inspect Administrator Audit Trail</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="text-sm font-bold text-slate-900">Recent Administrative Activity</h3>
          </div>
          <button
            onClick={() => setTab('audit-logs')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            View Full Audit Log
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {recentActivity && recentActivity.length > 0 ? (
            recentActivity.map((act) => (
              <div key={act.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-slate-800">
                      {act.action} <span className="font-normal text-slate-500">— {act.details || `Target: ${act.target_id}`}</span>
                    </p>
                    <p className="text-[11px] text-slate-400">
                      By {act.admin_name || act.admin_username || 'Superadmin'} ({act.target_type})
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-400 shrink-0">
                  {new Date(act.created_at).toLocaleString()}
                </span>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">
              No recent administrative actions recorded yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
