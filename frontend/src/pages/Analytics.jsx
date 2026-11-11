import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  Award,
  CheckCircle2,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  PlayCircle,
  HelpCircle,
  PieChart as PieIcon,
  Layers
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { api } from '../services/api';

const COLORS = ['#6366f1', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#14b8a6'];

export default function Analytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        const data = await api.getAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <span className="text-xs text-slate-400">Loading performance analytics...</span>
      </div>
    );
  }

  const hasData = analytics && analytics.total_sessions > 0;

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2">
            <BarChart3 className="w-3.5 h-3.5" /> Performance Analytics & Insights
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-heading">
            Technical Interview Analytics
          </h1>
          <p className="text-xs text-slate-400">
            Real performance telemetry calculated directly from your stored SQLite interview records.
          </p>
        </div>

        <button
          onClick={() => navigate('/interview')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition self-start sm:self-auto"
        >
          <PlayCircle className="w-4 h-4" />
          <span>New Practice Session</span>
        </button>
      </div>

      {!hasData ? (
        /* Empty State */
        <div className="glass-panel p-16 rounded-3xl text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto">
            <BarChart3 className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white font-heading">No Analytics Records Yet</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your performance curves, domain strengths, and score progressions will automatically populate once you begin taking practice interviews.
          </p>
          <button
            onClick={() => navigate('/interview')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition"
          >
            Start Your First Interview
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top 4 KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Average Score */}
            <div className="glass-panel p-5 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-semibold uppercase tracking-wider">Average Score</span>
                <Award className="w-4 h-4 text-amber-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">
                  {analytics.average_score.toFixed(1)}
                </span>
                <span className="text-xs text-slate-400">/ 10</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Across all evaluated answers</p>
            </div>

            {/* Questions Attempted */}
            <div className="glass-panel p-5 rounded-2xl">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-semibold uppercase tracking-wider">Questions Evaluated</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-white">
                  {analytics.questions_attempted}
                </span>
                <span className="text-xs text-slate-400">questions</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Received multidimensional AI feedback</p>
            </div>

            {/* Strongest Subject */}
            <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-emerald-500">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" /> Strongest Domain
                </span>
              </div>
              <div className="mt-3 text-xl font-bold text-white truncate">
                {analytics.strongest_topic || 'Not available'}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Highest average score attained</p>
            </div>

            {/* Needs Improvement */}
            <div className="glass-panel p-5 rounded-2xl border-l-4 border-l-amber-500">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span className="font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <ArrowDownRight className="w-3.5 h-3.5" /> Needs Attention
                </span>
              </div>
              <div className="mt-3 text-xl font-bold text-white truncate">
                {analytics.weakest_topic || (analytics.strongest_topic ? 'Maintain practice' : '—')}
              </div>
              <p className="mt-1 text-[11px] text-slate-400">Recommended for targeted revision</p>
            </div>
          </div>

          {/* Charts Row 1: Progression Over Time & Difficulty Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Progression Chart */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-4">
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  Score Progression Across Sessions
                </h3>
                <p className="text-xs text-slate-400">
                  Chronological progression of your practice scores over time
                </p>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={analytics.session_score_progression}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="scoreAreaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.45} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="date" stroke="#64748b" fontSize={11} />
                    <YAxis domain={[0, 10]} stroke="#64748b" fontSize={11} ticks={[0, 2, 4, 6, 8, 10]} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                      itemStyle={{ color: '#818cf8' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="average_score"
                      stroke="#6366f1"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#scoreAreaGrad)"
                      name="Score"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Difficulty Breakdown Pie */}
            <div className="glass-panel p-6 rounded-2xl space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-heading">
                  Difficulty Distribution
                </h3>
                <p className="text-xs text-slate-400">
                  Breakdown of completed session levels
                </p>
              </div>

              <div className="h-52 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.difficulty_breakdown}
                      dataKey="count"
                      nameKey="difficulty"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={5}
                    >
                      {analytics.difficulty_breakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="text-[11px] text-slate-400 text-center">
                Balance your prep between Beginner and Intermediate levels
              </div>
            </div>
          </div>

          {/* Charts Row 2: Topic-wise Performance Bar Chart */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white font-heading">
                Topic-wise Performance Comparison
              </h3>
              <p className="text-xs text-slate-400">
                Average score achieved per technical domain (out of 10)
              </p>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={analytics.topic_performance}
                  margin={{ top: 15, right: 20, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="topic" stroke="#94a3b8" fontSize={11} angle={-15} textAnchor="end" />
                  <YAxis domain={[0, 10]} stroke="#64748b" fontSize={11} ticks={[0, 2, 4, 6, 8, 10]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#a855f7' }}
                  />
                  <Bar
                    dataKey="average_score"
                    name="Average Score"
                    fill="#6366f1"
                    radius={[6, 6, 0, 0]}
                  >
                    {analytics.topic_performance.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.average_score >= 8 ? '#10b981' : entry.average_score >= 6 ? '#6366f1' : '#f59e0b'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
