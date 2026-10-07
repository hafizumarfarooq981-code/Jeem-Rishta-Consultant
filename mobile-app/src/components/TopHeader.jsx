import React from 'react';
import { 
  ShieldCheck, 
  User, 
  LogIn, 
  Home, 
  Search, 
  PlusCircle, 
  FolderHeart, 
  Settings, 
  LogOut, 
  Shield
} from 'lucide-react';
import { t } from '../i18n/strings';

export default function TopHeader({ 
  title, 
  showBack, 
  onBack, 
  user, 
  onOpenAuth, 
  currentTab, 
  setTab,
  onLogout 
}) {
  const navItems = [
    { id: 'home', label: t('navHome'), icon: Home },
    { id: 'search', label: t('navSearch'), icon: Search },
    { id: 'add', label: t('navAdd'), icon: PlusCircle, isPrimary: true },
    { id: 'my-profiles', label: t('navMyProfiles'), icon: FolderHeart },
    { id: 'settings', label: t('navSettings'), icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              onClick={onBack}
              className="p-1.5 -ml-1 text-slate-700 hover:text-emerald-700 active:scale-95 transition-transform rounded-xl hover:bg-slate-100"
              aria-label="Back"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <div 
              onClick={() => setTab && setTab('home')}
              className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-700 to-teal-800 text-white flex items-center justify-center font-bold text-xl shadow-sm shadow-emerald-800/30 cursor-pointer active:scale-95 transition-transform"
            >
              ج
            </div>
          )}

          <div 
            onClick={() => setTab && setTab('home')}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                {title || t('appName')}
              </h1>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                100% Free
              </span>
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold tracking-wide">
              {t('noDirectContactBadge')}
            </p>
          </div>
        </div>

        {/* Desktop Navigation Links (Visible on Tablet and Desktop) */}
        {setTab && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/60">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setTab(item.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        )}

        {/* Right Action: Admin link, User Status or Login */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Direct Admin Portal link on Desktop */}
          <a
            href="/admin/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition-colors"
            title="Open Admin Portal"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-700" />
            <span>Admin Portal</span>
          </a>

          {user ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/70 text-xs font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-700" />
                <span className="truncate max-w-[100px] sm:max-w-none">{user.mobile_number}</span>
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="hidden md:flex p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-slate-100 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white text-xs font-bold shadow-xs transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login / Register</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
}
