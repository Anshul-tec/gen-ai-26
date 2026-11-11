import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Sparkles,
  Bot,
  BrainCircuit,
  Sliders,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  ArrowRight,
  Terminal,
  Code2,
  Database,
  Cpu,
  Globe,
  ShieldCheck,
  TrendingUp,
  Flame,
  Zap,
  Target
} from 'lucide-react';
import { api } from '../services/api';

const TOPIC_OPTIONS = [
  'Python',
  'Java',
  'C Programming',
  'DBMS',
  'Operating Systems',
  'Computer Networks',
  'Data Structures and Algorithms',
  'SQL',
  'HTML and CSS',
  'JavaScript',
  'React',
  'Cybersecurity',
  'Artificial Intelligence',
  'Machine Learning',
];

const DIFFICULTIES = [
  { id: 'Beginner', title: 'Beginner', desc: 'Core definitions, basic syntax, fundamental principles', icon: Zap },
  { id: 'Intermediate', title: 'Intermediate', desc: 'Practical implementations, edge cases, trade-offs', icon: Target },
  { id: 'Advanced', title: 'Advanced', desc: 'System internals, optimization, deep architecture', icon: Flame },
];

const QUESTION_COUNTS = [
  { count: 5, label: '5 Questions', timeEst: '~10 mins' },
  { count: 10, label: '10 Questions', timeEst: '~20 mins' },
  { count: 15, label: '15 Questions', timeEst: '~30 mins' },
];

const INTERVIEW_TYPES = [
  { id: 'Technical Interview', name: 'Technical Interview', desc: 'Standard technical questions focusing on code and mechanics' },
  { id: 'Conceptual Interview', name: 'Conceptual Interview', desc: 'Deep dive into theoretical architecture and principles' },
  { id: 'Coding Fundamentals', name: 'Coding Fundamentals', desc: 'Logic, data structures, algorithms, and syntax execution' },
  { id: 'Mixed Interview', name: 'Mixed Interview', desc: 'Balanced combination of conceptual and practical questions' },
];

export default function StartInterview() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [selectedTopic, setSelectedTopic] = useState('Python');
  const [isCustomTopic, setIsCustomTopic] = useState(false);
  const [customTopicValue, setCustomTopicValue] = useState('');
  const [difficulty, setDifficulty] = useState('Beginner');
  const [numQuestions, setNumQuestions] = useState(5);
  const [interviewType, setInterviewType] = useState('Technical Interview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const topicParam = searchParams.get('topic');
    if (topicParam) {
      if (TOPIC_OPTIONS.includes(topicParam)) {
        setSelectedTopic(topicParam);
        setIsCustomTopic(false);
      } else {
        setIsCustomTopic(true);
        setCustomTopicValue(topicParam);
      }
    }
  }, [searchParams]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    const finalTopic = isCustomTopic ? customTopicValue.trim() : selectedTopic;
    if (!finalTopic) {
      setError('Please specify a technical topic or select one from the list.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.generateInterview({
        topic: finalTopic,
        difficulty,
        num_questions: numQuestions,
        interview_type: interviewType,
      });

      if (response && response.session_id) {
        navigate(`/interview/session/${response.session_id}`);
      } else {
        throw new Error('Failed to create session');
      }
    } catch (err) {
      console.error('Error generating interview:', err);
      setError(err.message || 'Failed to generate interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" /> AI Interview Generation Module
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight font-heading">
          Configure Your Practice Session
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Customize your topic, target difficulty, and question count. Google Gemini AI will dynamically generate customized technical interview questions.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-3 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleGenerate} className="space-y-8">
        {/* Step 1: Select Topic */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">1</span>
              Technical Subject or Topic
            </h2>
            <button
              type="button"
              onClick={() => {
                setIsCustomTopic(!isCustomTopic);
                if (!isCustomTopic) setCustomTopicValue('');
              }}
              className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition"
            >
              {isCustomTopic ? '← Select Standard Topic' : '+ Custom Topic'}
            </button>
          </div>

          {!isCustomTopic ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {TOPIC_OPTIONS.map((topic) => {
                const isSelected = selectedTopic === topic;
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => setSelectedTopic(topic)}
                    className={`p-3 rounded-xl text-xs font-medium text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/50 scale-[1.02]'
                        : 'bg-slate-800/60 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
                    }`}
                  >
                    <span>{topic}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Enter any technology, library, or engineering domain:</label>
              <input
                type="text"
                value={customTopicValue}
                onChange={(e) => setCustomTopicValue(e.target.value)}
                placeholder="e.g. Docker, TypeScript, GraphQL, Spring Boot, Git internals..."
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm"
              />
            </div>
          )}
        </div>

        {/* Step 2: Select Difficulty */}
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">2</span>
            Interview Difficulty Level
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {DIFFICULTIES.map((d) => {
              const Icon = d.icon;
              const isSelected = difficulty === d.id;
              return (
                <div
                  key={d.id}
                  onClick={() => setDifficulty(d.id)}
                  className={`p-4 rounded-xl cursor-pointer border transition-all ${
                    isSelected
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-md shadow-indigo-500/10'
                      : 'bg-slate-800/40 hover:bg-slate-800/70 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-semibold text-white">{d.title}</span>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${isSelected ? 'border-indigo-400 bg-indigo-600' : 'border-slate-600'}`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">{d.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 3: Question Count & Interview Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Question Count */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">3</span>
              Number of Questions
            </h2>

            <div className="grid grid-cols-3 gap-2.5">
              {QUESTION_COUNTS.map((qc) => {
                const isSelected = numQuestions === qc.count;
                return (
                  <button
                    key={qc.count}
                    type="button"
                    onClick={() => setNumQuestions(qc.count)}
                    className={`py-3 px-2 rounded-xl text-center border transition-all ${
                      isSelected
                        ? 'bg-indigo-600 border-indigo-500 text-white font-bold shadow-md shadow-indigo-600/20'
                        : 'bg-slate-800/50 hover:bg-slate-800 border-slate-700/60 text-slate-300'
                    }`}
                  >
                    <div className="text-sm">{qc.label}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{qc.timeEst}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interview Type */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs">4</span>
              Interview Type
            </h2>

            <div className="space-y-2">
              {INTERVIEW_TYPES.map((type) => {
                const isSelected = interviewType === type.id;
                return (
                  <label
                    key={type.id}
                    onClick={() => setInterviewType(type.id)}
                    className={`flex items-start gap-3 p-2.5 rounded-xl border cursor-pointer transition ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500/80 text-white'
                        : 'bg-slate-800/30 hover:bg-slate-800/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <input
                      type="radio"
                      name="interviewType"
                      checked={isSelected}
                      onChange={() => setInterviewType(type.id)}
                      className="mt-0.5 text-indigo-600 focus:ring-indigo-500"
                    />
                    <div>
                      <div className="text-xs font-semibold text-white">{type.name}</div>
                      <div className="text-[11px] text-slate-400">{type.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        {/* Generate Button Card */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border-indigo-500/20">
          <div>
            <h3 className="text-base font-bold text-white">Ready to begin?</h3>
            <p className="text-xs text-slate-400">
              Generating tailored questions for <span className="text-indigo-400 font-semibold">{isCustomTopic ? customTopicValue || 'Custom' : selectedTopic}</span> ({difficulty} • {numQuestions} Qs)
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating AI Interview...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate AI Interview</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
