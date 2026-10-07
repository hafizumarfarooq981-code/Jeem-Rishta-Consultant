import React from 'react';
import { 
  Home, 
  Search, 
  PlusCircle, 
  FolderHeart, 
  Settings 
} from 'lucide-react';
import { t } from '../i18n/strings';

export default function BottomNav({ currentTab, setTab }) {
  const tabs = [
    { id: 'home', label: t('navHome'), icon: Home },
    { id: 'search', label: t('navSearch'), icon: Search },
    { id: 'add', label: t('navAdd'), icon: PlusCircle, isPrimary: true },
    { id: 'my-profiles', label: t('navMyProfiles'), icon: FolderHeart },
    { id: 'settings', label: t('navSettings'), icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white border-t border-slate-200/80 px-2 py-1.5 z-40 shadow-lg pb-[max(0.375rem,env(safe-area-inset-bottom))]">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          if (tab.isPrimary) {
            return (
              <button
                key={tab.id}
                onClick={() => setTab(tab.id)}
                className="flex flex-col items-center group -mt-4 focus:outline-none"
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 ${
                  isActive 
                    ? 'bg-emerald-700 text-white ring-4 ring-emerald-100' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-700/30'
                }`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-semibold mt-1 transition-colors ${
                  isActive ? 'text-emerald-800 font-bold' : 'text-slate-600'
                }`}>
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className="flex flex-col items-center py-1 px-2.5 rounded-lg focus:outline-none transition-colors active:scale-95"
            >
              <Icon className={`w-5 h-5 transition-colors ${
                isActive ? 'text-emerald-700 stroke-[2.5]' : 'text-slate-400 group-hover:text-slate-600'
              }`} />
              <span className={`text-[10px] mt-0.5 transition-colors ${
                isActive ? 'text-emerald-800 font-bold' : 'text-slate-500 font-medium'
              }`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
