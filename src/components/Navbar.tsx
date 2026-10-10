import React from 'react';
import { BookOpen, Sparkles, User, ShieldCheck, FileText, Database, PlayCircle, LogIn, LogOut, Mic } from 'lucide-react';
import { Member } from '../types';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  currentUser: Member | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onSwitchUser: (user: Member) => void;
  isVoiceActive?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  currentUser,
  onOpenLogin,
  onLogout,
  isVoiceActive
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white border-b border-slate-800 shadow-md backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentTab('catalog')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white">
              <BookOpen className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-serif font-bold text-base sm:text-lg tracking-wide text-white">SNJB COE</span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5 text-emerald-400" /> AI Grounded
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-amber-300 tracking-wider uppercase font-semibold">LIBRARY SYSTEM</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setCurrentTab('catalog')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'catalog'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              Catalog Search
            </button>

            <button
              onClick={() => setCurrentTab('ai-chat')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${
                currentTab === 'ai-chat'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>AI Assistant</span>
              {isVoiceActive && (
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
              )}
            </button>

            <button
              onClick={() => setCurrentTab('student')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'student'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              Student Portal
            </button>

            <button
              onClick={() => setCurrentTab('librarian')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'librarian'
                  ? 'bg-amber-500 text-slate-950 shadow-sm font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
              }`}
            >
              Librarian Desk
            </button>

            <button
              onClick={() => setCurrentTab('policies')}
              className={`px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'policies'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="Library Rules & Hours"
            >
              <FileText className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentTab('database')}
              className={`px-2.5 py-1.5 rounded-lg text-sm font-medium transition-all ${
                currentTab === 'database'
                  ? 'bg-slate-800 text-amber-400'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
              title="MySQL Schema & SQL Setup Script"
            >
              <Database className="w-4 h-4" />
            </button>

            <button
              onClick={() => setCurrentTab('demo')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 border border-amber-500/40 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 rounded-lg transition-all`}
              title="College Project Demonstration Scenarios"
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Demo Walkthrough</span>
            </button>
          </nav>

          {/* User Auth & Actions */}
          <div className="flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-2">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-200">{currentUser.name}</div>
                  <div className="text-[10px] text-amber-400 capitalize flex items-center justify-end gap-1">
                    {currentUser.role === 'librarian' ? (
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <User className="w-3 h-3 text-amber-400" />
                    )}
                    {currentUser.role} ({currentUser.member_id})
                  </div>
                </div>

                <button
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In / Demo</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-slate-800/80 overflow-x-auto text-xs space-x-2">
          <button
            onClick={() => setCurrentTab('catalog')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'catalog' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}
          >
            Catalog
          </button>
          <button
            onClick={() => setCurrentTab('ai-chat')}
            className={`px-2.5 py-1 rounded whitespace-nowrap flex items-center gap-1 ${currentTab === 'ai-chat' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}
          >
            <Sparkles className="w-3 h-3" /> AI Chat
          </button>
          <button
            onClick={() => setCurrentTab('student')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'student' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}
          >
            Student
          </button>
          <button
            onClick={() => setCurrentTab('librarian')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'librarian' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}
          >
            Librarian
          </button>
          <button
            onClick={() => setCurrentTab('database')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${currentTab === 'database' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300'}`}
          >
            SQL Script
          </button>
          <button
            onClick={() => setCurrentTab('demo')}
            className={`px-2.5 py-1 rounded whitespace-nowrap text-amber-300 font-semibold`}
          >
            Demo
          </button>
        </div>
      </div>
    </header>
  );
};
