import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { api } from '../services/api';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [healthData, setHealthData] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Fetch initial health and analytics
    api.getHealth()
      .then(setHealthData)
      .catch((err) => console.warn('Health check error:', err));

    api.getAnalytics()
      .then(setStats)
      .catch((err) => console.warn('Analytics fetch error:', err));
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Decorative Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-grid-pattern opacity-40" />
      </div>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:pl-64 z-10">
        <Navbar
          onMenuClick={() => setSidebarOpen(true)}
          healthData={healthData}
          stats={stats}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ refreshStats: () => api.getAnalytics().then(setStats) }} />
        </main>

        <footer className="py-6 px-4 md:px-8 border-t border-slate-900/80 text-center text-xs text-slate-400">
          <p>
            AI Interview Practice Assistant • College Generative AI Project • Group 11
          </p>
          <p className="mt-1 text-[11px] text-slate-400">
            Supportive educational feedback platform. Not a predictor of actual hiring decisions.
          </p>
        </footer>
      </div>
    </div>
  );
}
