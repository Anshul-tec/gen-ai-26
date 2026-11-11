import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  History as HistoryIcon,
  Trash2,
  ExternalLink,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  Search,
  AlertTriangle,
  X,
  PlayCircle,
  BookOpen
} from 'lucide-react';
import { api } from '../services/api';
import ScoreGauge from '../components/ScoreGauge';

export default function History() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selectedSessionDetail, setSelectedSessionDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const data = await api.getSessions();
      setSessions(data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (sessionId) => {
    setDeleting(true);
    try {
      await api.deleteSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
      if (selectedSessionDetail?.session_id === sessionId) {
        setSelectedSessionDetail(null);
      }
      setDeleteConfirmId(null);
    } catch (err) {
      console.error('Error deleting session:', err);
    } finally {
      setDeleting(false);
    }
  };

  const handleOpenDetailModal = async (sessionId) => {
    setLoadingDetail(true);
    try {
      const data = await api.getSessionDetail(sessionId);
      setSelectedSessionDetail(data);
    } catch (err) {
      console.error('Error fetching session details:', err);
    } finally {
      setLoadingDetail(false);
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      s.topic.toLowerCase().includes(term) ||
      s.difficulty.toLowerCase().includes(term) ||
      s.interview_type.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2">
            <HistoryIcon className="w-3.5 h-3.5" /> Practice Records & SQLite Archive
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-heading">
            Practice History
          </h1>
          <p className="text-xs text-slate-400">
            Review past interview sessions, questions attempted, scores, and detailed AI evaluations.
          </p>
        </div>

        <button
          onClick={() => navigate('/interview')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition self-start sm:self-auto"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Start New Practice</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="glass-panel p-4 rounded-2xl flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter practice sessions by topic, difficulty, or interview type..."
          className="w-full bg-transparent text-white text-xs placeholder-slate-500 focus:outline-none"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-slate-400 hover:text-white"
          >
            Clear
          </button>
        )}
      </div>

      {/* Sessions Table / Cards */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-xs text-slate-400">Loading stored sessions...</span>
        </div>
      ) : filteredSessions.length > 0 ? (
        <div className="glass-panel rounded-2xl overflow-hidden border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Date & Time</th>
                  <th className="py-3.5 px-4">Topic</th>
                  <th className="py-3.5 px-4">Difficulty</th>
                  <th className="py-3.5 px-4">Interview Type</th>
                  <th className="py-3.5 px-4">Questions</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredSessions.map((s) => {
                  const dateStr = new Date(s.created_at).toLocaleString([], {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  });
                  return (
                    <tr key={s.session_id} className="hover:bg-slate-800/40 transition">
                      <td className="py-4 px-4 font-mono text-slate-400 text-[11px]">
                        {dateStr}
                      </td>
                      <td className="py-4 px-4 font-semibold text-white">
                        {s.topic}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          s.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          s.difficulty === 'Intermediate' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                          'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                        }`}>
                          {s.difficulty}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-400">{s.interview_type}</td>
                      <td className="py-4 px-4 font-mono text-slate-300">
                        {s.questions_attempted} / {s.total_questions}
                      </td>
                      <td className="py-4 px-4">
                        {s.average_score > 0 ? (
                          <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                            {s.average_score}/10
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          s.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenDetailModal(s.session_id)}
                            className="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 font-medium transition flex items-center gap-1"
                            title="Quick view questions and feedback"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Review</span>
                          </button>
                          <button
                            onClick={() => navigate(`/interview/session/${s.session_id}`)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="Open in interview workspace"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(s.session_id)}
                            className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition"
                            title="Delete practice session"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-4">
          <HistoryIcon className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white font-heading">
            {searchTerm ? 'No matching practice sessions' : 'No practice history yet'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchTerm
              ? 'Try modifying your search query or clear the filter.'
              : 'Complete your first practice session to start building your personal interview archive.'}
          </p>
          {!searchTerm && (
            <button
              onClick={() => navigate('/interview')}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
            >
              Start an Interview
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-sm p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl text-left space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Delete Practice Session?</h3>
            </div>
            <p className="text-xs text-slate-300">
              This will permanently delete this practice record and all submitted answers and AI scores. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Session Review Modal */}
      {selectedSessionDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl flex flex-col my-6 text-left">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
                  <span>{selectedSessionDetail.topic}</span>
                  <span>•</span>
                  <span>{selectedSessionDetail.difficulty}</span>
                </div>
                <h3 className="text-lg font-bold text-white font-heading">
                  Session Evaluation Report
                </h3>
              </div>
              <button
                onClick={() => setSelectedSessionDetail(null)}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scroll Content */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Session Overview Stats */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center">
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold">Average Score</span>
                  <div className="text-xl font-bold text-indigo-400 mt-0.5">
                    {selectedSessionDetail.average_score > 0 ? `${selectedSessionDetail.average_score}/10` : '—'}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold">Attempted</span>
                  <div className="text-xl font-bold text-white mt-0.5">
                    {selectedSessionDetail.questions_attempted} of {selectedSessionDetail.total_questions}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold">Status</span>
                  <div className="text-xs font-semibold text-emerald-400 mt-2">
                    {selectedSessionDetail.status}
                  </div>
                </div>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Questions & Evaluated Feedback
                </h4>

                {selectedSessionDetail.questions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-xs font-bold text-indigo-400">
                        Q{idx + 1}: {q.question_text}
                      </span>
                      {q.overall_score !== null && (
                        <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-bold text-xs shrink-0">
                          {q.overall_score}/10
                        </span>
                      )}
                    </div>

                    {q.user_answer ? (
                      <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 space-y-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase block">Your Answer:</span>
                        <p className="leading-relaxed font-mono">{q.user_answer}</p>
                      </div>
                    ) : (
                      <p className="text-xs italic text-slate-500">Not attempted</p>
                    )}

                    {q.is_evaluated && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs pt-1">
                        {q.what_went_well && (
                          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-slate-200 border border-emerald-500/20">
                            <span className="text-emerald-400 font-bold block mb-0.5">Praise:</span>
                            {q.what_went_well}
                          </div>
                        )}
                        {q.areas_to_improve && (
                          <div className="p-2.5 rounded-lg bg-amber-500/10 text-slate-200 border border-amber-500/20">
                            <span className="text-amber-400 font-bold block mb-0.5">Improve:</span>
                            {q.areas_to_improve}
                          </div>
                        )}
                        {q.corrected_explanation && (
                          <div className="p-2.5 rounded-lg bg-blue-500/10 text-slate-200 border border-blue-500/20 md:col-span-2">
                            <span className="text-blue-400 font-bold block mb-0.5">Conceptual Correction:</span>
                            {q.corrected_explanation}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}

              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 flex justify-end gap-2">
              <button
                onClick={() => setSelectedSessionDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
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
