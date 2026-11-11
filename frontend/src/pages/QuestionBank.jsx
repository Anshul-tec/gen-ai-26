import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  Filter,
  Sparkles,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Tag,
  Copy,
  Check
} from 'lucide-react';
import { api } from '../services/api';

const TOPIC_FILTERS = [
  'All',
  'Python',
  'Java',
  'C Programming',
  'Data Structures and Algorithms',
  'DBMS',
  'Operating Systems',
  'Computer Networks',
  'SQL',
  'JavaScript',
  'React',
];

const DIFFICULTY_FILTERS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function QuestionBank() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topicFilter, setTopicFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedAnswers, setExpandedAnswers] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchQuestions();
  }, [topicFilter, difficultyFilter]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const data = await api.getQuestions({
        topic: topicFilter === 'All' ? '' : topicFilter,
        difficulty: difficultyFilter === 'All' ? '' : difficultyFilter,
        search: searchQuery,
      });
      setQuestions(data.questions || []);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  const toggleAnswer = (id) => {
    setExpandedAnswers((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const copyToClipboard = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-2">
            <BookOpen className="w-3.5 h-3.5" /> Curated & Generated Question Bank
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-heading">
            Question Bank
          </h1>
          <p className="text-xs text-slate-400">
            Explore frequently tested technical interview questions, study ideal sample answers, and test yourself.
          </p>
        </div>

        <button
          onClick={() => navigate('/interview')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition self-start sm:self-auto"
        >
          <PlayCircle className="w-4 h-4" />
          <span>Launch AI Interview</span>
        </button>
      </div>

      {/* Filters and Search Bar */}
      <div className="glass-panel p-5 rounded-2xl space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions by concept or keyword (e.g. recursion, deadlock, closure, ACID)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800">
          {/* Topic Pills */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Topic:
            </span>
            {TOPIC_FILTERS.map((t) => (
              <button
                key={t}
                onClick={() => setTopicFilter(t)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition ${
                  topicFilter === t
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Difficulty Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[11px] font-semibold text-slate-400">Difficulty:</span>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
            >
              {DIFFICULTY_FILTERS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Questions List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <span className="text-xs text-slate-400">Loading questions...</span>
        </div>
      ) : questions.length > 0 ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span>Showing {questions.length} questions</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {questions.map((q) => {
              const isExpanded = expandedAnswers[q.id];
              return (
                <div
                  key={q.id}
                  className="glass-panel p-5 rounded-2xl space-y-3 transition border border-slate-800 hover:border-slate-700"
                >
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] font-bold border border-indigo-500/20">
                        {q.topic}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        q.difficulty === 'Beginner' ? 'bg-emerald-500/10 text-emerald-400' :
                        q.difficulty === 'Intermediate' ? 'bg-blue-500/10 text-blue-400' :
                        'bg-purple-500/10 text-purple-400'
                      }`}>
                        {q.difficulty}
                      </span>
                      {q.category && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Tag className="w-3 h-3 text-slate-500" />
                          {q.category}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(q.id, q.question_text)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                        title="Copy question text"
                      >
                        {copiedId === q.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => navigate(`/interview?topic=${encodeURIComponent(q.topic)}`)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-[11px] font-medium transition flex items-center gap-1"
                      >
                        <PlayCircle className="w-3 h-3" />
                        <span>Practice Topic</span>
                      </button>
                    </div>
                  </div>

                  <h3 className="text-sm md:text-base font-semibold text-white leading-relaxed">
                    {q.question_text}
                  </h3>

                  {/* Sample Answer Section */}
                  {q.sample_answer ? (
                    <div className="pt-2">
                      <button
                        onClick={() => toggleAnswer(q.id)}
                        className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition"
                      >
                        <span>{isExpanded ? 'Hide Model Answer' : 'View Model Answer'}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-2.5 p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 leading-relaxed font-sans animate-fadeIn">
                          <div className="font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5" /> Ideal Model Response:
                          </div>
                          {q.sample_answer}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-[11px] text-slate-500 italic">
                      Generate and attempt this question in a practice session to unlock AI ideal answers.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
          <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No questions found</h3>
          <p className="text-xs text-slate-400">
            Try adjusting your search keywords or switching filters.
          </p>
        </div>
      )}
    </div>
  );
}
