import React from 'react';
import {
  HelpCircle,
  FileQuestion,
  FileText,
  RotateCcw,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Search,
  Scale,
  Brain,
} from 'lucide-react';
import type { NavTab } from './Header';
import type { Subject, StudyMode } from '../types';

interface HomeViewProps {
  onNavigate: (tab: NavTab) => void;
  onSelectPrompt: (question: string, subject: Subject, mode: StudyMode) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onSelectPrompt }) => {
  const curatedDoubts: {
    question: string;
    subject: Subject;
    mode: StudyMode;
    tag: string;
  }[] = [
    {
      question: 'Why does Article 32 itself constitute a Fundamental Right, unlike ordinary legal remedies?',
      subject: 'Polity',
      mode: 'normal',
      tag: 'Constitutional Law',
    },
    {
      question: 'What is the precise difference between a Money Bill (Article 110) and a Financial Bill (I & II)?',
      subject: 'Polity',
      mode: 'prelims',
      tag: 'Prelims Elimination',
    },
    {
      question: 'Explain Western Disturbances: why do they produce winter rainfall in Northwest India and benefit Rabi crops?',
      subject: 'Geography',
      mode: 'zero_level',
      tag: 'Core Concept',
    },
    {
      question: 'If Fiscal Deficit is high but Primary Deficit is zero, what does it signify about government borrowings?',
      subject: 'Economy',
      mode: 'mains',
      tag: 'Mains Dimension',
    },
  ];

  return (
    <div id="home-view-container" className="space-y-12 py-6">
      {/* Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4 pt-6 pb-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold mb-6">
          <Scale className="w-3.5 h-3.5 text-amber-700" />
          <span>Independent Educational Platform for UPSC CSE Aspirants</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-serif font-bold text-slate-900 tracking-tight leading-tight mb-4">
          Clear your UPSC doubts. <br />
          <span className="text-amber-700">Build your reasoning.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
          Understand concepts, challenge your reasoning, verify important facts and prepare for UPSC CSE with an AI study companion.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            id="home-primary-cta"
            onClick={() => onNavigate('doubt-solver')}
            className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer transition-all"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
            <span>Ask a Doubt</span>
            <ArrowRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            id="home-pyq-cta"
            onClick={() => onNavigate('pyq-lab')}
            className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-sm shadow-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <FileQuestion className="w-4 h-4 text-amber-600" />
            <span>Explore PYQ Lab</span>
          </button>

          <button
            id="home-mains-cta"
            onClick={() => onNavigate('mains-lab')}
            className="px-5 py-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-semibold text-sm shadow-xs flex items-center gap-2 cursor-pointer transition-all"
          >
            <FileText className="w-4 h-4 text-slate-700" />
            <span>Mains Answer Lab</span>
          </button>
        </div>
      </section>

      {/* Core Pedagogical Flow */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-slate-50 rounded-2xl border border-slate-200/80 p-6 md:p-8">
          <div className="text-center mb-6">
            <span className="text-[11px] uppercase tracking-widest font-bold text-amber-700">The Pedagogical Standard</span>
            <h2 className="text-xl md:text-2xl font-serif font-bold text-slate-900 mt-1">
              How UPSC Mentor Operates
            </h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              The goal is not simply to give answers. We help you understand concepts deeply enough to solve new UPSC questions independently.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {[
              { step: '01', title: 'Accuracy', desc: 'Factual fidelity over guesswork', icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" /> },
              { step: '02', title: 'Verification', desc: 'Primary sources & Constitution', icon: <Search className="w-4 h-4 text-blue-600" /> },
              { step: '03', title: 'Understanding', desc: 'Simple Hinglish + deep Why/How', icon: <BookOpen className="w-4 h-4 text-amber-600" /> },
              { step: '04', title: 'Reasoning', desc: 'Exposing common traps & biases', icon: <Brain className="w-4 h-4 text-purple-600" /> },
              { step: '05', title: 'Practice', desc: 'PYQ diagnostic & Mains rubric', icon: <FileQuestion className="w-4 h-4 text-indigo-600" /> },
              { step: '06', title: 'Revision', desc: 'Active recall & saved cards', icon: <RotateCcw className="w-4 h-4 text-teal-600" /> },
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs text-center flex flex-col items-center">
                <span className="text-[10px] font-bold text-slate-400 mb-1">{item.step}</span>
                <div className="p-2 rounded-lg bg-slate-50 mb-2">{item.icon}</div>
                <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 1-Click Practice Launchers */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-slate-900">Explore High-Yield UPSC Queries</h2>
            <p className="text-xs text-slate-500">Click any doubt to test the live reasoning engine immediately:</p>
          </div>
          <button
            onClick={() => onNavigate('doubt-solver')}
            className="text-xs text-amber-700 font-semibold hover:underline flex items-center gap-1 cursor-pointer"
          >
            Custom Doubt <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {curatedDoubts.map((doubt, idx) => (
            <div
              key={idx}
              onClick={() => onSelectPrompt(doubt.question, doubt.subject, doubt.mode)}
              className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-400/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                      {doubt.subject}
                    </span>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200/60">
                      {doubt.mode.replace('_', ' ').toUpperCase()} MODE
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">{doubt.tag}</span>
                </div>
                <p className="text-sm font-medium text-slate-800 group-hover:text-slate-900 leading-snug">
                  "{doubt.question}"
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-amber-700 font-semibold">
                <span>Launch Analysis</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Visible Trust & Accuracy Architecture Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="bg-amber-50/70 border border-amber-200/90 rounded-2xl p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-600 text-white rounded-xl shadow-xs shrink-0 mt-0.5">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-[11px] uppercase font-bold tracking-wider text-amber-900">Guiding Covenant</span>
                <h2 className="text-xl font-serif font-bold text-slate-900">
                  AI is your assistant, not your final authority.
                </h2>
              </div>

              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                UPSC CSE demands extreme precision. A single misremembered constitutional amendment or factual confusion can cost negative marks in Prelims or weaken a Mains answer. We adhere to these strict rules:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs text-slate-700">
                <div className="flex items-start gap-2 bg-white/80 p-3 rounded-lg border border-amber-200/60">
                  <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>AI can make mistakes:</strong> Do not blindly accept any AI output without active critical reflection.
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-white/80 p-3 rounded-lg border border-amber-200/60">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Primary sources prioritized:</strong> Constitution of India, Supreme Court judgments, India Code, PIB, Economic Survey, NCERT.
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-white/80 p-3 rounded-lg border border-amber-200/60">
                  <Search className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Uncertainty is explicitly identified:</strong> When evidence is split, ambiguous, or unverifiable, we say so directly.
                  </div>
                </div>

                <div className="flex items-start gap-2 bg-white/80 p-3 rounded-lg border border-amber-200/60">
                  <Brain className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Independent understanding is paramount:</strong> We train your conceptual framework so you can answer unfamiliar UPSC questions in the exam hall.
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  id="trust-view-full-policy-btn"
                  onClick={() => onNavigate('about')}
                  className="text-xs font-bold text-amber-900 hover:text-amber-950 underline cursor-pointer"
                >
                  Read our complete Trust, Accuracy & Disclaimer Policy →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
