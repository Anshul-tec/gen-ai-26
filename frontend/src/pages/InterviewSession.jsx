import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Send,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lightbulb,
  Award,
  BookOpen,
  RefreshCw,
  MessageSquare,
  Trophy,
  Compass,
  Check,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  CornerDownRight
} from 'lucide-react';
import { api } from '../services/api';
import ScoreGauge from '../components/ScoreGauge';

export default function InterviewSession() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const outletContext = useOutletContext();

  const [session, setSession] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [evaluating, setEvaluating] = useState(false);
  const [evalResult, setEvalResult] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [error, setError] = useState(null);

  // Follow-up interaction
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  const [followUpSubmitted, setFollowUpSubmitted] = useState(false);
  const [sampleAnswerExpanded, setSampleAnswerExpanded] = useState(false);

  // Final summary state
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [sessionSummary, setSessionSummary] = useState(null);
  const [showSummaryModal, setShowSummaryModal] = useState(false);

  // Elapsed timer for loading feedback
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const submittingRef = useRef(false);

  useEffect(() => {
    loadSession();
  }, [sessionId]);

  // Elapsed-time counter while evaluating
  useEffect(() => {
    if (!evaluating) {
      setElapsedSeconds(0);
      return;
    }
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [evaluating]);

  const loadSession = async () => {
    try {
      setLoadingSession(true);
      setError(null);
      const data = await api.getSessionDetail(sessionId);
      setSession(data);

      // Find first un-evaluated question index
      const firstUnansweredIndex = data.questions.findIndex((q) => !q.is_evaluated);
      const initialIdx = firstUnansweredIndex !== -1 ? firstUnansweredIndex : 0;
      setCurrentIndex(initialIdx);

      // Load initial question state
      if (data.questions[initialIdx]) {
        setUserAnswer(data.questions[initialIdx].user_answer || '');
        if (data.questions[initialIdx].is_evaluated) {
          setEvalResult(data.questions[initialIdx]);
        }
      }
    } catch (err) {
      console.error('Error fetching session:', err);
      setError(err.message || 'Failed to load session details.');
    } finally {
      setLoadingSession(false);
    }
  };

  const currentQuestion = session?.questions?.[currentIndex];
  const totalQuestions = session?.questions?.length || 0;
  const wordCount = userAnswer.trim() ? userAnswer.trim().split(/\s+/).length : 0;

  const handleSelectQuestion = (index) => {
    if (index >= 0 && index < totalQuestions) {
      setCurrentIndex(index);
      const q = session.questions[index];
      setUserAnswer(q.user_answer || '');
      setEvalResult(q.is_evaluated ? q : null);
      setFollowUpAnswer('');
      setFollowUpSubmitted(false);
      setSampleAnswerExpanded(false);
    }
  };

  const handleSubmitAnswer = async (e) => {
    if (e) e.preventDefault();
    if (!currentQuestion) return;
    if (submittingRef.current || evaluating) return; // Block duplicate submissions

    if (!userAnswer.trim()) {
      setError('Please type an answer before submitting for AI evaluation.');
      return;
    }

    submittingRef.current = true;
    setEvaluating(true);
    setError(null);

    try {
      const evaluation = await api.evaluateAnswer({
        session_id: sessionId,
        question_number: currentQuestion.question_number,
        question_text: currentQuestion.question_text,
        user_answer: userAnswer,
        topic: session.topic,
        difficulty: session.difficulty,
      });

      setEvalResult(evaluation);

      // Update question in local state
      const updatedQuestions = [...session.questions];
      updatedQuestions[currentIndex] = {
        ...updatedQuestions[currentIndex],
        ...evaluation,
        user_answer: userAnswer,
        word_count: wordCount,
        is_answered: true,
        is_evaluated: true,
      };

      setSession({
        ...session,
        questions: updatedQuestions,
        questions_attempted: updatedQuestions.filter((q) => q.is_evaluated).length,
      });

      // Refresh navbar stats
      if (outletContext?.refreshStats) {
        outletContext.refreshStats();
      }
    } catch (err) {
      console.error('Error evaluating answer:', err);
      setError(err.message || 'Evaluation failed. Please try again.');
    } finally {
      setEvaluating(false);
      submittingRef.current = false;
    }
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      handleSelectQuestion(currentIndex + 1);
    } else {
      // Completed all questions! Prompt to get final summary
      handleCompleteInterview();
    }
  };

  const handleCompleteInterview = async () => {
    setSummaryLoading(true);
    try {
      const summary = await api.getSessionSummary(sessionId);
      setSessionSummary(summary);
      setShowSummaryModal(true);

      // Confetti celebratory burst
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      if (outletContext?.refreshStats) {
        outletContext.refreshStats();
      }
    } catch (err) {
      console.error('Error completing session:', err);
      setError('Failed to generate final session summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  if (loadingSession) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
        <h3 className="text-lg font-bold text-white">Loading Interview Session...</h3>
        <p className="text-xs text-slate-400">Retrieving question bank and AI workspace</p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Unable to load session</h2>
        <p className="text-xs text-slate-400">{error}</p>
        <button
          onClick={() => navigate('/interview')}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition"
        >
          Return to Interview Setup
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fadeIn">
      {/* Top Header / Progress Bar */}
      <div className="glass-panel p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/history')}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title="Back to Sessions"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                {session?.topic} Practice
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {session?.difficulty}
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">{session?.interview_type}</span>
            </div>
            <h1 className="text-lg font-bold text-white font-heading mt-0.5">
              Question {currentIndex + 1} of {totalQuestions}
            </h1>
          </div>
        </div>

        {/* Question Selector Pills */}
        <div className="flex items-center gap-2 flex-wrap">
          {session?.questions?.map((q, idx) => {
            const isCurrent = idx === currentIndex;
            const isEvaluated = q.is_evaluated;
            return (
              <button
                key={q.question_number}
                onClick={() => handleSelectQuestion(idx)}
                className={`w-8 h-8 rounded-xl text-xs font-bold transition-all flex items-center justify-center ${
                  isCurrent
                    ? 'bg-indigo-600 text-white ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-900 shadow-lg shadow-indigo-600/30'
                    : isEvaluated
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30'
                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 border border-slate-700/60'
                }`}
                title={`Question ${idx + 1}: ${isEvaluated ? 'Evaluated' : 'Not submitted'}`}
              >
                {isEvaluated ? (
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                ) : (
                  idx + 1
                )}
              </button>
            );
          })}

          <button
            onClick={handleCompleteInterview}
            disabled={summaryLoading}
            className="ml-2 px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 text-xs font-semibold flex items-center gap-1.5 transition"
          >
            {summaryLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Trophy className="w-3.5 h-3.5" />
            )}
            <span>Finish Session</span>
          </button>
        </div>
      </div>

      {/* Main Working Area: Question Card & Answer Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Question & Typed Response (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Question Card */}
          <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-indigo-500 relative">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-indigo-400 uppercase tracking-wider">
                Category: {currentQuestion?.category || 'Fundamentals'}
              </span>
              <span className="bg-slate-800/80 px-2 py-0.5 rounded text-[11px]">
                {session?.difficulty} Level
              </span>
            </div>

            <h2 className="text-lg md:text-xl font-bold text-white leading-relaxed font-heading">
              {currentQuestion?.question_text}
            </h2>
          </div>

          {/* Answer Form */}
          <div className="glass-panel p-6 rounded-2xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                Your Technical Answer
              </label>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>{wordCount} words</span>
                <span className="text-slate-600">•</span>
                <span className={wordCount < 15 ? 'text-amber-400' : 'text-emerald-400'}>
                  {wordCount < 15 ? 'Concise' : wordCount < 60 ? 'Good depth' : 'Thorough'}
                </span>
              </div>
            </div>

            <div className="relative">
              <textarea
                rows={9}
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey && evaluating) {
                    e.preventDefault();
                  }
                }}
                disabled={evaluating}
                placeholder="Type your explanation here. Focus on clear definitions, underlying mechanisms, and practical examples..."
                className="w-full p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-sm leading-relaxed resize-y font-mono disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={evaluating || !userAnswer.trim()}
                  className="px-3 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-[11px] font-semibold transition whitespace-nowrap disabled:opacity-40"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="text-[11px] text-slate-400">
                Evaluated on: Technical Accuracy, Conceptual Understanding, Completeness & Clarity.
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={evaluating || !userAnswer.trim()}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {evaluating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Evaluating via Gemini AI{elapsedSeconds > 0 ? ` (${elapsedSeconds}s)` : '...'}</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{evalResult ? 'Re-evaluate Answer' : 'Submit Answer'}</span>
                    </>
                  )}
                </button>

                {currentIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition flex items-center gap-1.5"
                  >
                    <span>Next</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCompleteInterview}
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <span>Finish</span>
                    <Trophy className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Answer Evaluation Card (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {evalResult ? (
            <div className="glass-panel p-6 rounded-2xl space-y-6 animate-fadeIn border-indigo-500/30">
              {/* Header with Overall Score Dial */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-semibold mb-1">
                    <Sparkles className="w-3 h-3" /> AI Evaluation Feedback
                  </div>
                  <h3 className="text-base font-bold text-white font-heading">
                    Performance Breakdown
                  </h3>
                </div>
                <ScoreGauge score={evalResult.overall_score} size="md" label="Overall Score" />
              </div>

              {/* 4 Criterion Progress Bars */}
              <div className="space-y-3">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 block">
                  Evaluation Criteria
                </span>

                {/* Technical Accuracy */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Technical Accuracy</span>
                    <span className="font-bold text-white">{evalResult.technical_accuracy_score}/10</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-500 rounded-full transition-all duration-700"
                      style={{ width: `${(evalResult.technical_accuracy_score / 10) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Conceptual Understanding */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Conceptual Understanding</span>
                    <span className="font-bold text-white">{evalResult.conceptual_understanding_score}/10</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full transition-all duration-700"
                      style={{ width: `${(evalResult.conceptual_understanding_score / 10) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Completeness */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Completeness</span>
                    <span className="font-bold text-white">{evalResult.completeness_score}/10</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full transition-all duration-700"
                      style={{ width: `${(evalResult.completeness_score / 10) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Clarity */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-300">Clarity & Explanation</span>
                    <span className="font-bold text-white">{evalResult.clarity_score}/10</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                      style={{ width: `${(evalResult.clarity_score / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Feedback Points */}
              <div className="space-y-3 text-xs">
                {/* What Went Well */}
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>What You Did Well</span>
                  </div>
                  <p className="leading-relaxed pl-5 text-slate-300">{evalResult.what_went_well}</p>
                </div>

                {/* Areas to Improve */}
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-200 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                    <Lightbulb className="w-4 h-4 shrink-0" />
                    <span>Areas to Improve</span>
                  </div>
                  <p className="leading-relaxed pl-5 text-slate-300">{evalResult.areas_to_improve}</p>
                </div>

                {/* Missing Important Concepts */}
                {evalResult.missing_concepts && (
                  <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-slate-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-purple-400 font-bold">
                      <Compass className="w-4 h-4 shrink-0" />
                      <span>Missing Important Concepts</span>
                    </div>
                    <p className="leading-relaxed pl-5 text-slate-300">{evalResult.missing_concepts}</p>
                  </div>
                )}

                {/* Corrected Explanation */}
                {evalResult.corrected_explanation && (
                  <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-slate-200 space-y-1">
                    <div className="flex items-center gap-1.5 text-blue-400 font-bold">
                      <Sparkles className="w-4 h-4 shrink-0" />
                      <span>Conceptual Correction</span>
                    </div>
                    <p className="leading-relaxed pl-5 text-slate-300">{evalResult.corrected_explanation}</p>
                  </div>
                )}


                {/* Improved Sample Answer (Collapsible / Highlighted) */}
                {evalResult.improved_sample_answer && (
                  <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-slate-200">
                    <button
                      type="button"
                      onClick={() => setSampleAnswerExpanded(!sampleAnswerExpanded)}
                      className="w-full flex items-center justify-between text-left text-indigo-300 font-bold"
                    >
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>Improved Sample Answer</span>
                      </span>
                      {sampleAnswerExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {sampleAnswerExpanded && (
                      <div className="mt-2.5 pt-2 border-t border-indigo-500/20 text-slate-300 leading-relaxed font-sans text-xs bg-slate-950/40 p-3 rounded-lg">
                        {evalResult.improved_sample_answer}
                      </div>
                    )}
                  </div>
                )}

                {/* Personalized Learning Recommendation */}
                {evalResult.personalized_recommendation && (
                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300 space-y-1">
                    <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                      <BrainCircuit className="w-4 h-4 shrink-0" />
                      <span>Personalized Recommendation</span>
                    </div>
                    <p className="leading-relaxed pl-5 text-slate-300">{evalResult.personalized_recommendation}</p>
                  </div>
                )}

                {/* Follow-up Interview Question */}
                {evalResult.follow_up_question && (
                  <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/40 space-y-2">
                    <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                      <CornerDownRight className="w-4 h-4 shrink-0" />
                      <span>AI Follow-up Question</span>
                    </div>
                    <p className="text-white font-medium italic pl-5">
                      "{evalResult.follow_up_question}"
                    </p>

                    {!followUpSubmitted ? (
                      <div className="mt-3 pl-5 space-y-2">
                        <input
                          type="text"
                          value={followUpAnswer}
                          onChange={(e) => setFollowUpAnswer(e.target.value)}
                          placeholder="Quick follow-up response..."
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setFollowUpSubmitted(true)}
                          className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-semibold transition"
                        >
                          Record Follow-up Response
                        </button>
                      </div>
                    ) : (
                      <div className="mt-2 pl-5 text-[11px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Follow-up response recorded for your practice session.</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Empty Evaluation State */
            <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 min-h-[420px] text-slate-400">
              <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="max-w-xs space-y-1.5">
                <h4 className="text-base font-bold text-white font-heading">AI Evaluation Awaiting</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Type your response in the editor and click "Submit Answer" to receive instant multidimensional scores and constructive AI guidance.
                </p>
              </div>
              <div className="text-[11px] text-slate-400 border border-slate-800 rounded-xl p-3 bg-slate-900/40">
                💡 Tip: Explain the concept, mention how it works, and provide a concrete example.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Session Summary Modal / Celebration */}
      {showSummaryModal && sessionSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl p-6 md:p-8 bg-slate-900 border border-indigo-500/40 rounded-3xl shadow-2xl space-y-6 my-8 text-left animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25">
                  <Trophy className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white font-heading">
                    Interview Practice Complete!
                  </h3>
                  <p className="text-xs text-slate-400">
                    Comprehensive AI Mentorship Report • {session?.topic}
                  </p>
                </div>
              </div>
              <ScoreGauge score={sessionSummary.average_score} size="md" label="Average Score" />
            </div>

            {/* Summary Text */}
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs md:text-sm text-slate-200 leading-relaxed">
              {sessionSummary.summary_text}
            </div>

            {/* Strongest & Weakest Areas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-2">
                <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" /> Strongest Areas
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {sessionSummary.strongest_areas?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-2">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4" /> Areas for Revision
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  {sessionSummary.weakest_areas?.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recommendations */}
            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs space-y-2">
              <span className="font-bold text-indigo-400 flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4" /> Actionable Preparation Tips
              </span>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                {sessionSummary.recommendations?.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowSummaryModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
              >
                Review Questions
              </button>
              <button
                onClick={() => navigate('/history')}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/25"
              >
                View in History
              </button>
              <button
                onClick={() => navigate('/')}
                className="px-4 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-xs font-semibold transition"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
