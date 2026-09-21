import React, { useState } from 'react';
import {
  BookOpen,
  HelpCircle,
  FileQuestion,
  FileText,
  RotateCcw,
  History,
  ShieldCheck,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Compass,
} from 'lucide-react';
import type { User } from '../types';

export type NavTab = 'home' | 'doubt-solver' | 'pyq-lab' | 'mains-lab' | 'revision' | 'history' | 'about';

interface HeaderProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  user: User | null;
  savedDoubtsCount: number;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  user,
  savedDoubtsCount,
  onOpenAuth,
  onLogout,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'home', label: 'Home', icon: <Compass className="w-4 h-4" /> },
    { id: 'doubt-solver', label: 'Doubt Solver', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'pyq-lab', label: 'PYQ Lab', icon: <FileQuestion className="w-4 h-4" /> },
    { id: 'mains-lab', label: 'Mains Lab', icon: <FileText className="w-4 h-4" /> },
    { id: 'revision', label: 'Revision', icon: <RotateCcw className="w-4 h-4" />, badge: savedDoubtsCount },
    { id: 'history', label: 'History', icon: <History className="w-4 h-4" /> },
    { id: 'about', label: 'About & Trust', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    setIsMobileMenuOpen(false);
  };

  return (
    <header id="main-header" className="bg-slate-900 text-slate-100 border-b border-slate-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            id="brand-logo-btn"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center text-slate-900 font-bold shadow-inner group-hover:bg-amber-500 transition-colors">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-lg tracking-wide text-white">UPSC MENTOR</span>
                <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  CSE
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">AI Reasoning & Concept Teacher</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav id="desktop-nav" className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-btn-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer relative ${
                    isActive
                      ? 'bg-slate-800 text-amber-400 font-semibold shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* User Auth Section */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
                <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-slate-200 font-medium max-w-[120px] truncate">{user.name}</span>
                <button
                  id="header-logout-btn"
                  onClick={onLogout}
                  title="Log out"
                  className="text-slate-400 hover:text-red-400 p-1 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                id="header-auth-btn"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 shadow-xs cursor-pointer transition-colors"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In / Demo</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-2">
            {!user && (
              <button
                id="mobile-auth-quick-btn"
                onClick={onOpenAuth}
                className="px-2.5 py-1 text-xs font-medium rounded bg-amber-600 text-slate-950"
              >
                Sign In
              </button>
            )}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div id="mobile-menu-drawer" className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`mobile-nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium ${
                  isActive ? 'bg-slate-800 text-amber-400' : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500 text-slate-950">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {user && (
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 px-3">
              <span>Signed in as <strong>{user.name}</strong></span>
              <button
                id="mobile-logout-btn"
                onClick={() => {
                  onLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="text-red-400 hover:underline flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" /> Logout
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
