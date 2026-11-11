import React, { useState } from 'react';
import { Sparkles, Info, X, Key, CheckCircle2 } from 'lucide-react';

export default function AiBadge({ isDemoMode = false, modelName = 'gemini-2.5-flash' }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
          !isDemoMode
            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20'
            : 'bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20'
        }`}
        title="Click to view AI Configuration"
      >
        <Sparkles className={`w-3.5 h-3.5 ${!isDemoMode ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`} />
        <span>{!isDemoMode ? 'Gemini AI Active' : 'Demo Practice Mode'}</span>
        <Info className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-md p-6 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl text-left">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2.5 rounded-xl ${!isDemoMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {!isDemoMode ? 'Google Gemini AI Configured' : 'Demonstration Practice Mode'}
                </h3>
                <p className="text-xs text-slate-400">Current Generative AI Engine Status</p>
              </div>
            </div>

            <div className="space-y-3 text-sm text-slate-300">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="text-slate-400">Target Gemini Model:</span>
                  <span className="font-mono text-indigo-400">{modelName}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Status:</span>
                  <span className={`font-semibold ${!isDemoMode ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {!isDemoMode ? 'Live API Key Connected' : 'Curated Fallback Active'}
                  </span>
                </div>
              </div>

              {isDemoMode ? (
                <div className="space-y-2 text-xs text-slate-400 bg-amber-500/5 border border-amber-500/20 p-3 rounded-xl">
                  <p className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <Key className="w-4 h-4" /> To enable live Gemini AI generation:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 pl-1 text-slate-300">
                    <li>Open file <code className="text-indigo-300 bg-slate-800 px-1 py-0.5 rounded">backend/.env</code></li>
                    <li>Add your Gemini API key: <code className="text-emerald-300 bg-slate-800 px-1 py-0.5 rounded">GEMINI_API_KEY=AIzaSy...</code></li>
                    <li>Get a free key from Google AI Studio (<a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="text-indigo-400 underline">aistudio.google.com</a>)</li>
                    <li>Restart the backend or wait for reload.</li>
                  </ol>
                  <p className="text-[11px] text-slate-400 pt-1">
                    In Demo Mode, all features (interviews, scoring rubrics, sample answers, history, and analytics) are fully operational using curated computer science question banks.
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-300 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>The backend is actively communicating with Google Gemini API to dynamically generate new questions and evaluate answers.</span>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
