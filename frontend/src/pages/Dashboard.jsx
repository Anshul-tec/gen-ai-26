import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlayCircle,
  Award,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Code2,
  Database,
  Cpu,
  Globe,
  ShieldCheck,
  Terminal,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { api } from '../services/api';

const RECOMMENDED_TOPICS = [
  { name: 'Python', icon: Terminal, desc: 'Syntax, OOP, GIL, and Data Structures' },
  { name: 'Java', icon: Code2, desc: 'JVM, OOP, Collections, Multithreading' },
  { name: 'C Programming', icon: Cpu, desc: 'Pointers, Memory, Structs, Low-level' },
  { name: 'Data Structures and Algorithms', icon: Layers, desc: 'Arrays, Trees, Graphs, Sorting' },
  { name: 'DBMS', icon: Database, desc: 'ACID, Normalization, Relational Schema' },
  { name: 'Operating Systems', icon: Cpu, desc: 'Processes, Threads, Deadlocks, Paging' },
  { name: 'Computer Networks', icon: Globe, desc: 'TCP/IP, OSI Layers, Sockets, HTTP/S' },
  { name: 'SQL', icon: Database, desc: 'Joins, Indexes, Subqueries, Aggregations' },
  { name: 'HTML and CSS', icon: Globe, desc: 'Semantic HTML, Flexbox, Grid, Box Model' },
  { name: 'JavaScript', icon: Code2, desc: 'Closures, Event Loop, Promises, ES6+' },
  { name: 'React', icon: Code2, desc: 'Hooks, Virtual DOM, State Management' },
  { name: 'Cybersecurity', icon: ShieldCheck, desc: 'OWASP, Cryptography, Auth, Security' },
  { name: 'Artificial Intelligence', icon: Sparkles, desc: 'Search algorithms, Agents, Heuristics' },
  { name: 'Machine Learning', icon: TrendingUp, desc: 'Regression, Classification, Neural Nets' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [analyticsData, sessionsData] = await Promise.all([
          api.getAnalytics(),
          api.getSessions()
        ]);
        setAnalytics(analyticsData);
        setRecentSessions(sessionsData.slice(0, 5));
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleStartTopic = (topicName) => {
    navigate(`/interview?topic=${encodeURIComponent(topicName)}`);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-slate-950 border border-indigo-500/20 p-6 md:p-10 shadow-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Interview Prep
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight font-heading">
            Welcome to AI Interview Practice Assistant
          </h1>
          <p className="mt-3 text-base md:text-lg text-slate-300 font-normal">
            Practice smarter. Improve your technical knowledge. Build interview confidence.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-4">
            <button
              onClick={() => navigate('/interview')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white font-semibold shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <PlayCircle className="w-5 h-5" />
              <span>Start New Interview</span>
            </button>
            <button
              onClick={() => navigate('/questions')}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-200 border border-slate-700 font-medium transition"
            >
              <BookOpen className="w-4 h-4 text-slate-400" />
              <span>Browse Question Bank</span>
            </button>
          </div>
        </div>
        {/* Background Decorative Rings */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/4 pointer-events-none opacity-20">
          <div className="w-96 h-96 rounded-full border border-indigo-500/40" />
          <div className="absolute inset-8 rounded-full border border-purple-500/40" />
          <div className="absolute inset-16 rounded-full border border-blue-500/40" />
        </div>
      </div>

      {/* 4 Key Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Total Sessions */}
        <div className="glass-panel p-6 rounded-2xl glass-panel-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Sessions</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {loading ? '...' : analytics?.total_sessions ?? 0}
            </span>
            <span className="text-xs text-slate-400">sessions</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Completed and active practices</p>
        </div>

        {/* Questions Attempted */}
        <div className="glass-panel p-6 rounded-2xl glass-panel-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Questions Attempted</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {loading ? '...' : analytics?.questions_attempted ?? 0}
            </span>
            <span className="text-xs text-slate-400">evaluated</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">With AI scoring & feedback</p>
        </div>

        {/* Average Score */}
        <div className="glass-panel p-6 rounded-2xl glass-panel-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Average Score</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {loading ? '...' : (analytics?.average_score ?? 0).toFixed(1)}
            </span>
            <span className="text-xs text-amber-400/80 font-medium">/ 10.0</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Real performance average</p>
        </div>

        {/* Topics Practiced */}
        <div className="glass-panel p-6 rounded-2xl glass-panel-hover">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Topics Practiced</span>
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white">
              {loading ? '...' : analytics?.topics_practiced_count ?? 0}
            </span>
            <span className="text-xs text-slate-400">subjects</span>
          </div>
          <p className="mt-2 text-xs text-slate-400">Distinct technical domains</p>
        </div>
      </div>

      {/* Middle Row: Performance Chart + Quick Start Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Overview Chart */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white font-heading">Performance Overview</h2>
              <p className="text-xs text-slate-400">Score progression across previous practice sessions</p>
            </div>
            <button
              onClick={() => navigate('/analytics')}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 transition"
            >
              <span>View Full Analytics</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            {analytics?.session_score_progression && analytics.session_score_progression.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={analytics.session_score_progression}
                  margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
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
                    fill="url(#scoreGradient)"
                    name="Average Score"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                <TrendingUp className="w-8 h-8 mb-2 opacity-40" />
                <span>Complete your first practice session to generate your performance curve</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Start Interview Card */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col justify-between bg-gradient-to-b from-indigo-950/40 to-slate-900 border-indigo-500/20">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Fast AI Setup
            </div>
            <h3 className="text-xl font-bold text-white font-heading">Quick Start Interview</h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Launch an immediate 5-question AI mock interview on Python, Data Structures, or any topic of your choice.
            </p>

            <div className="mt-5 space-y-2">
              <button
                onClick={() => handleStartTopic('Python')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700/60 transition"
              >
                <span className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" /> Python Fundamentals
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => handleStartTopic('Data Structures and Algorithms')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700/60 transition"
              >
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-400" /> Data Structures & Algorithms
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
              <button
                onClick={() => handleStartTopic('DBMS')}
                className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-700/60 transition"
              >
                <span className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" /> DBMS & SQL Basics
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          <button
            onClick={() => navigate('/interview')}
            className="mt-6 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition"
          >
            <span>Custom Interview Setup</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recent Practice Sessions Section */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-white font-heading">Recent Practice Sessions</h2>
            <p className="text-xs text-slate-400">Review your past evaluations and feedback</p>
          </div>
          <button
            onClick={() => navigate('/history')}
            className="text-xs font-medium text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 transition"
          >
            <span>View All History</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentSessions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Topic</th>
                  <th className="py-3 px-4">Difficulty</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Questions</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentSessions.map((session) => (
                  <tr key={session.session_id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3.5 px-4 font-semibold text-white flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-400" />
                      {session.topic}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        session.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        session.difficulty === 'Intermediate' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                        'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                      }`}>
                        {session.difficulty}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">{session.interview_type}</td>
                    <td className="py-3.5 px-4 text-slate-300 font-mono">
                      {session.questions_attempted} / {session.total_questions}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-100">
                        {session.average_score > 0 ? `${session.average_score}/10` : '—'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium ${
                        session.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {session.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => navigate(`/interview/session/${session.session_id}`)}
                        className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 font-medium transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-10 text-center text-slate-400 text-sm">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p>No practice sessions recorded yet. Start your first session above!</p>
          </div>
        )}
      </div>

      {/* Recommended Topics Section (14 Topics) */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-bold text-white font-heading">Recommended Technical Topics</h2>
          <p className="text-xs text-slate-400">Select any foundational subject to immediately spin up an AI interview</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {RECOMMENDED_TOPICS.map((topic) => {
            const Icon = topic.icon;
            return (
              <div
                key={topic.name}
                onClick={() => handleStartTopic(topic.name)}
                className="glass-panel p-4 rounded-xl glass-panel-hover cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-500/10 group-hover:bg-indigo-500/20 text-indigo-400 flex items-center justify-center transition">
                      <Icon className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition" />
                  </div>
                  <h3 className="text-sm font-semibold text-white group-hover:text-indigo-300 transition">
                    {topic.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">
                    {topic.desc}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                  <span>Entry-level Ready</span>
                  <span className="text-indigo-400 font-medium group-hover:underline">Practice &rarr;</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
