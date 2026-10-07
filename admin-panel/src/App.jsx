import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Profiles from './pages/Profiles';
import Users from './pages/Users';
import Settings from './pages/Settings';
import AuditLogs from './pages/AuditLogs';
import { adminApi } from './api/client';

export default function App() {
  const [admin, setAdmin] = useState(null);
  const [currentTab, setTab] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const token = adminApi.getToken();
    const storedAdmin = adminApi.getStoredAdmin();
    if (token && storedAdmin) {
      setAdmin(storedAdmin);
    }

    const handleExpired = () => {
      setAdmin(null);
    };

    window.addEventListener('admin-auth-expired', handleExpired);
    return () => window.removeEventListener('admin-auth-expired', handleExpired);
  }, []);

  const handleLogout = () => {
    adminApi.removeToken();
    setAdmin(null);
  };

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  if (!admin) {
    return <Login onLoginSuccess={(adm) => setAdmin(adm)} />;
  }

  const titles = {
    dashboard: { title: 'Administrator Dashboard', subtitle: 'Platform-wide matrimonial analytics and metrics' },
    profiles: { title: 'Rishta Proposals Management', subtitle: 'Review, verify, and moderate submitted profiles' },
    users: { title: 'Registered Users Directory', subtitle: 'Manage member accounts and access permissions' },
    settings: { title: 'System & WhatsApp Settings', subtitle: 'Configure dynamic consultant routing and legal documents' },
    'audit-logs': { title: 'Security & Audit Trail', subtitle: 'Chronological activity stream of administrative events' },
  };

  const currentMeta = titles[currentTab] || titles.dashboard;

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      <Sidebar
        currentTab={currentTab}
        setTab={setTab}
        onLogout={handleLogout}
        admin={admin}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <Header
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
          onRefresh={handleRefresh}
        />

        <main className="flex-1">
          {currentTab === 'dashboard' && <Dashboard key={refreshKey} setTab={setTab} />}
          {currentTab === 'profiles' && <Profiles key={refreshKey} />}
          {currentTab === 'users' && <Users key={refreshKey} />}
          {currentTab === 'settings' && <Settings key={refreshKey} />}
          {currentTab === 'audit-logs' && <AuditLogs key={refreshKey} />}
        </main>
      </div>
    </div>
  );
}
