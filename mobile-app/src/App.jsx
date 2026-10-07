import React, { useState, useEffect } from 'react';
import TopHeader from './components/TopHeader';
import BottomNav from './components/BottomNav';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Home from './pages/Home/Home';
import SearchPage from './pages/Search/Search';
import AddRishtaWizard from './pages/AddRishta/AddRishtaWizard';
import MyProfiles from './pages/MyProfiles/MyProfiles';
import Settings from './pages/Settings/Settings';
import ProfileDetail from './pages/ProfileDetail/ProfileDetail';
import { api } from './api/client';
import { t } from './i18n/strings';
import { LogIn, PlusCircle, ShieldCheck } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState(null);
  const [authModal, setAuthModal] = useState(null); // 'login' | 'register' | null
  const [currentTab, setTab] = useState('home'); // 'home', 'search', 'add', 'my-profiles', 'settings'
  const [selectedProfileId, setSelectedProfileId] = useState(null);

  useEffect(() => {
    const token = api.getToken();
    const storedUser = api.getUserData();
    if (token && storedUser) {
      setUser(storedUser);
    }

    const handleExpired = () => {
      setUser(null);
      setSelectedProfileId(null);
    };

    window.addEventListener('user-session-expired', handleExpired);
    return () => window.removeEventListener('user-session-expired', handleExpired);
  }, []);

  const handleLogout = () => {
    api.removeToken();
    setUser(null);
    setSelectedProfileId(null);
    setTab('home');
  };

  const handleSelectProfile = (profileId) => {
    setSelectedProfileId(profileId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (newTab) => {
    // If trying to add rishta or view my-profiles without being logged in, prompt auth
    if ((newTab === 'add' || newTab === 'my-profiles') && !user) {
      setAuthModal('register');
      return;
    }
    setSelectedProfileId(null);
    setTab(newTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If viewing Auth Modal
  const renderAuthModal = () => {
    if (!authModal) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          {authModal === 'login' ? (
            <Login
              onLoginSuccess={(u) => {
                setUser(u);
                setAuthModal(null);
              }}
              onGoToRegister={() => setAuthModal('register')}
              onClose={() => setAuthModal(null)}
            />
          ) : (
            <Register
              onRegisterSuccess={(u) => {
                setUser(u);
                setAuthModal(null);
              }}
              onGoToLogin={() => setAuthModal('login')}
              onClose={() => setAuthModal(null)}
            />
          )}
        </div>
      </div>
    );
  };

  // If inspecting a specific public profile dossier
  if (selectedProfileId) {
    return (
      <div className="mobile-viewport flex flex-col min-h-screen">
        <TopHeader
          title={`Profile Dossier • ${selectedProfileId}`}
          showBack={true}
          onBack={() => setSelectedProfileId(null)}
          user={user}
          onOpenAuth={() => setAuthModal('login')}
          currentTab={currentTab}
          setTab={handleTabChange}
          onLogout={handleLogout}
        />
        <div className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <ProfileDetail
            profileId={selectedProfileId}
            onBack={() => setSelectedProfileId(null)}
          />
        </div>
        {renderAuthModal()}
      </div>
    );
  }

  // If in Add Rishta Wizard mode (Logged In)
  if (currentTab === 'add') {
    if (!user) {
      return (
        <div className="mobile-viewport flex flex-col min-h-screen justify-between">
          <TopHeader 
            user={user} 
            onOpenAuth={() => setAuthModal('login')} 
            currentTab={currentTab}
            setTab={handleTabChange}
            onLogout={handleLogout}
          />
          <div className="my-auto text-center space-y-4 bg-white p-8 rounded-3xl border border-slate-200 max-w-md mx-auto shadow-sm">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
              <PlusCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Sign in to Upload Rishta Proposal</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              To keep matrimonial proposals authentic and secure, please create a free account or sign in to submit your profile.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => setAuthModal('register')}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
              >
                Create Free Account
              </button>
              <button
                onClick={() => setAuthModal('login')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Already have an account? Sign In
              </button>
            </div>
          </div>
          <BottomNav currentTab={currentTab} setTab={handleTabChange} />
          {renderAuthModal()}
        </div>
      );
    }

    return (
      <div className="mobile-viewport flex flex-col min-h-screen">
        <TopHeader
          title="Submit Matrimonial Proposal"
          showBack={true}
          onBack={() => setTab('home')}
          user={user}
          onOpenAuth={() => setAuthModal('login')}
          currentTab={currentTab}
          setTab={handleTabChange}
          onLogout={handleLogout}
        />
        <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-6">
          <AddRishtaWizard
            onFinished={() => setTab('my-profiles')}
            onCancel={() => setTab('home')}
          />
        </div>
        {renderAuthModal()}
      </div>
    );
  }

  // Main Tab Navigation Screens
  return (
    <div className="mobile-viewport flex flex-col min-h-screen">
      <TopHeader
        user={user}
        onOpenAuth={() => setAuthModal('login')}
        currentTab={currentTab}
        setTab={handleTabChange}
        onLogout={handleLogout}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {currentTab === 'home' && (
          <Home
            setTab={handleTabChange}
            onSelectProfile={handleSelectProfile}
          />
        )}

        {currentTab === 'search' && (
          <SearchPage
            onSelectProfile={handleSelectProfile}
          />
        )}

        {currentTab === 'my-profiles' && (
          user ? (
            <MyProfiles
              onAddNew={() => setTab('add')}
              onSelectProfile={handleSelectProfile}
            />
          ) : (
            <div className="p-8 text-center space-y-4 my-12 bg-white rounded-3xl border border-slate-200 max-w-md mx-auto shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <LogIn className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Sign In to View Your Proposals</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Please log in to manage, edit, or check status of your submitted matrimonial proposals.
              </p>
              <button
                onClick={() => setAuthModal('login')}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Sign In / Register
              </button>
            </div>
          )
        )}

        {currentTab === 'settings' && (
          user ? (
            <div className="max-w-xl mx-auto">
              <Settings
                user={user}
                onLogout={handleLogout}
              />
            </div>
          ) : (
            <div className="p-8 text-center space-y-4 my-12 bg-white rounded-3xl border border-slate-200 max-w-md mx-auto shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Account & Settings</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Sign in to manage your account security and password.
              </p>
              <button
                onClick={() => setAuthModal('login')}
                className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold"
              >
                Sign In / Register
              </button>
            </div>
          )
        )}
      </main>

      {/* Floating Bottom Nav - Visible ONLY on Mobile screens */}
      <BottomNav
        currentTab={currentTab}
        setTab={handleTabChange}
      />

      {/* Modal Dialog for Auth */}
      {renderAuthModal()}
    </div>
  );
}
