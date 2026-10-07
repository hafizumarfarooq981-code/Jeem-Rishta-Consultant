import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  Search, 
  ShieldBan, 
  ShieldCheck, 
  Trash2, 
  Eye, 
  Phone, 
  Calendar, 
  AlertCircle,
  X,
  FileText
} from 'lucide-react';
import { adminApi } from '../api/client';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userProfiles, setUserProfiles] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const loadUsers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;

      const res = await adminApi.getUsers(params);
      if (res.success) {
        setUsers(res.data.users);
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: err.message || 'Failed to load users', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    loadUsers();
  };

  const handleToggleStatus = async (user) => {
    const nextStatus = user.status === 'blocked' ? 'active' : 'blocked';
    if (!window.confirm(`Are you sure you want to ${nextStatus === 'blocked' ? 'BLOCK' : 'UNBLOCK'} user ${user.mobile_number}?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await adminApi.setUserStatus(user.id, nextStatus);
      if (res.success) {
        setMessage({ text: res.message, type: 'success' });
        loadUsers();
      }
    } catch (err) {
      setMessage({ text: err.message || 'Action failed', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`PERMANENT WARNING: Deleting user ${user.mobile_number} will permanently erase their account and all their matrimonial profiles. Proceed?`)) {
      return;
    }

    try {
      setActionLoading(true);
      const res = await adminApi.deleteUser(user.id);
      if (res.success) {
        setMessage({ text: res.message, type: 'success' });
        if (selectedUser?.id === user.id) setSelectedUser(null);
        loadUsers();
      }
    } catch (err) {
      setMessage({ text: err.message || 'Failed to delete user', type: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewUser = async (user) => {
    setSelectedUser(user);
    try {
      setProfilesLoading(true);
      const res = await adminApi.getUserProfiles(user.id);
      if (res.success) {
        setUserProfiles(res.profiles);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setProfilesLoading(false);
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
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user by mobile number or ID..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Search
          </button>
          {search && (
            <button
              type="button"
              onClick={() => { setSearch(''); loadUsers(); }}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold rounded-lg transition-colors"
            >
              Clear
            </button>
          )}
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="text-xs font-medium text-slate-600 whitespace-nowrap">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active Accounts</option>
            <option value="blocked">Blocked Accounts</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-5 py-3.5">User ID</th>
                <th className="px-5 py-3.5">Mobile Number</th>
                <th className="px-5 py-3.5">Profiles Submitted</th>
                <th className="px-5 py-3.5">Registered Date</th>
                <th className="px-5 py-3.5">Last Login</th>
                <th className="px-5 py-3.5">Account Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-5 py-10 text-center text-slate-400">
                    <div className="inline-block w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mr-2" />
                    Loading registered accounts...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-5 py-8 text-center text-slate-400">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-900">#{u.id}</td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{u.mobile_number}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-800">
                        {u.profile_count} {u.profile_count === 1 ? 'Profile' : 'Profiles'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-slate-500">
                      {u.last_login_at ? new Date(u.last_login_at).toLocaleDateString() : 'Never'}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        u.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {u.status === 'active' ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewUser(u)}
                          title="View submitted profiles"
                          className="p-1.5 rounded-lg text-slate-600 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(u)}
                          disabled={actionLoading}
                          title={u.status === 'blocked' ? 'Unblock User' : 'Block User'}
                          className={`p-1.5 rounded-lg transition-colors ${
                            u.status === 'blocked'
                              ? 'text-emerald-600 hover:bg-emerald-50'
                              : 'text-amber-600 hover:bg-amber-50'
                          }`}
                        >
                          {u.status === 'blocked' ? <ShieldCheck className="w-4 h-4" /> : <ShieldBan className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleDeleteUser(u)}
                          disabled={actionLoading}
                          title="Permanently Delete User"
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* User Details & Rishta Profiles Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  User Account: {selectedUser.mobile_number}
                </h3>
                <p className="text-xs text-slate-500">
                  User #{selectedUser.id} • Registered {new Date(selectedUser.created_at).toLocaleDateString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Submitted Rishta Proposals ({userProfiles.length})
              </h4>

              {profilesLoading ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading user profiles...</div>
              ) : userProfiles.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  This user has not submitted any rishta proposals yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {userProfiles.map((p) => (
                    <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-700 text-sm">{p.profile_id}</span>
                          <span className="text-xs font-medium text-slate-500">• {p.relationship_for}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            p.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {p.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-700 mt-1">
                          {p.gender}, {p.age} yrs • {p.religion} ({p.sect || 'General'}) • {p.education} • {p.city}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          Profession: {p.profession}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex justify-end">
              <button
                onClick={() => setSelectedUser(null)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
