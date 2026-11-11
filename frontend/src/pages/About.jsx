import React from 'react';
import {
  Users,
  Award,
  Sparkles,
  BookOpen,
  Cpu,
  Layers,
  ShieldCheck,
  BrainCircuit,
  GraduationCap,
  Code2,
  Database,
  Terminal,
  Compass
} from 'lucide-react';

const TEAM_MEMBERS = [
  {
    name: 'Gaurav Mehta',
    urn: '2481061',
    role: 'Full-Stack & Generative AI Lead',
    initials: 'GM',
  },
  {
    name: 'Akshay Goel',
    urn: '2481031',
    role: 'Backend & Database Architecture',
    initials: 'AG',
  },
  {
    name: 'Jeet Tanwar',
    urn: '2481071',
    role: 'AI Prompt Engineering & Evaluation Rubric',
    initials: 'JT',
  },
  {
    name: 'Anshul Kumar',
    urn: '2481015',
    role: 'Frontend UI/UX & Data Analytics',
    initials: 'AK',
  },
];

export default function About() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fadeIn">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold mb-3">
          <GraduationCap className="w-3.5 h-3.5" /> College Generative AI Capstone Project
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight font-heading">
          About AI Interview Practice Assistant
        </h1>
        <p className="mt-2 text-sm text-slate-400 leading-relaxed">
          Developed as a comprehensive Generative AI web application to bridge the gap between academic computer science knowledge and entry-level technical interview readiness.
        </p>
      </div>

      {/* Group & Team Section */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl space-y-6 border-indigo-500/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Project Team</span>
            <h2 className="text-2xl font-bold text-white font-heading">Group 11</h2>
          </div>
          <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-semibold border border-indigo-500/30 self-start sm:self-auto">
            Academic Year 2024-2026
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {TEAM_MEMBERS.map((member) => (
            <div
              key={member.urn}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4 hover:border-slate-700 transition"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold text-base shadow-md shadow-indigo-600/20 shrink-0">
                {member.initials}
              </div>
              <div className="space-y-0.5">
                <h3 className="text-sm font-bold text-white">{member.name}</h3>
                <div className="text-xs text-indigo-400 font-mono">URN: {member.urn}</div>
                <div className="text-[11px] text-slate-400">{member.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Overview & Objective */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 w-fit">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white font-heading">Project Description</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            An AI-powered interview preparation tool that generates entry-level technical interview questions for selected topics and provides constructive feedback on typed practice answers.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 w-fit">
            <Compass className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white font-heading">Project Objective</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            To help students improve their technical knowledge, answer quality, and interview preparation through Generative AI, transforming intimidating technical interviews into a supportive, structured learning experience.
          </p>
        </div>
      </div>

      {/* Generative AI Technologies Used Section */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 text-white">
            <BrainCircuit className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-heading">
              Generative AI Technologies Used
            </h2>
            <p className="text-xs text-slate-400">
              Role and implementation of Google Gemini Generative AI
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <p>
            The core intelligence of the application is powered by Google Gemini (configured with <code className="text-indigo-400 font-mono">gemini-2.5-flash</code>) via the official Google Gen AI Python SDK. Rather than relying on static scripts, Gemini is invoked across five distinct operational pipelines:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="text-indigo-400 font-bold block">1. Dynamic Question Generation</span>
              <p className="text-slate-400 text-[11px]">
                Prompts enforce curriculum balance across fundamental concepts, preventing repeated questions and tailoring questions to the chosen difficulty level.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="text-indigo-400 font-bold block">2. Multidimensional Evaluation</span>
              <p className="text-slate-400 text-[11px]">
                Analyzes semantic meaning and technical accuracy without penalizing for minor grammar mistakes, providing 4 individual metric scores out of 10.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="text-indigo-400 font-bold block">3. Model Answer Synthesis</span>
              <p className="text-slate-400 text-[11px]">
                Synthesizes ideal answers using the "Definition → Mechanism → Example" pedagogical pattern to clarify misunderstandings.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
              <span className="text-indigo-400 font-bold block">4. Follow-up Question Probing</span>
              <p className="text-slate-400 text-[11px]">
                Contextually interrogates the candidate's specific typed response to simulate real interview conversations and test edge cases.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ethical AI and Educational Guardrails */}
      <div className="glass-panel p-6 rounded-2xl space-y-3 border-l-4 border-l-indigo-500">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          Educational Feedback & Integrity Principles
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          The application strictly acts as an educational coach. System prompts enforce supportive, encouraging feedback. The platform explicitly does not predict actual hiring outcomes, guarantee job selection, or replace human technical assessments.
        </p>
      </div>
    </div>
  );
}
