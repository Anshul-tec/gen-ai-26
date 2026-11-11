import React from 'react';
import { Menu, User, Award, CheckCircle } from 'lucide-react';
import AiBadge from './AiBadge';

export default function Navbar({ onMenuClick, healthData, stats }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-20 px-4 md:px-8 bg-slate-900/60 border-b border-slate-800/80 backdrop-blur-xl">
      {/* Mobile Toggle & Brand Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 text-slate-400 rounded-lg hover:text-white hover:bg-slate-800 lg:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:block">
          <h1 className="text-lg font-bold text-white tracking-tight font-heading">
            AI Interview Practice Assistant
          </h1>
          <p className="text-xs text-slate-400">
            Intelligent Mock Technical Interviews & Personalized Feedback
          </p>
        </div>
      </div>

      {/* Right side widgets: Quick Stats, AI Status, User Profile */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Quick Stats Pill */}
        {stats && stats.total_sessions > 0 && (
          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full bg-slate-800/60 border border-slate-700/60 text-xs">
            <div className="flex items-center gap-1.5 text-slate-300">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>{stats.questions_attempted} Attempted</span>
            </div>
            <div className="w-px h-3 bg-slate-700" />
            <div className="flex items-center gap-1.5 text-slate-300">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              <span>Avg: <strong className="text-white">{stats.average_score}/10</strong></span>
            </div>
          </div>
        )}

        {/* AI Status Badge */}
        <AiBadge
          isDemoMode={healthData?.is_demo_mode ?? true}
          modelName={healthData?.gemini_model || ''}
        />

        {/* User Profile */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-800">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm ring-2 ring-slate-800">
            <User className="w-4 h-4" />
          </div>
          <div className="hidden xl:flex flex-col text-left">
            <span className="text-xs font-semibold text-white leading-tight">Student Candidate</span>
            <span className="text-[10px] text-slate-400">Technical Prep</span>
          </div>
        </div>
      </div>
    </header>
  );
}
