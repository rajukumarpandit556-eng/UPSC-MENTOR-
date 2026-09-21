import React, { useState } from 'react';
import {
  FileQuestion,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Brain,
  Search,
} from 'lucide-react';
import type { PYQAnalysisResponse, Subject } from '../types';

export const PYQLabView: React.FC = () => {
  const [pyq, setPyq] = useState('');
  const [year, setYear] = useState('2021');
  const [subject, setSubject] = useState<Subject>('Polity');
  const [examType, setExamType] = useState<'Prelims' | 'Mains'>('Prelims');
  const [selectedOption, setSelectedOption] = useState('');
  const [studentReasoning, setStudentReasoning] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<PYQAnalysisResponse | null>(null);

  const samplePYQs = [
    {
      title: 'UPSC Prelims 2021: Right to Privacy',
      year: '2021',
      subject: 'Polity' as Subject,
      examType: 'Prelims' as const,
      pyq: 'A legislation which confers on the executive or administrative authority an unguided and uncontrolled discretionary power in the matter of the application of law violates which one of the following Articles of the Constitution of India?\n\n(a) Article 14\n(b) Article 28\n(c) Article 32\n(d) Article 44',
      option: 'Article 14',
      reasoning: 'I felt unguided discretion relates to equality before law and non-arbitrariness under Article 14, but I was unsure if it affects judicial review under Article 32.',
    },
    {
      title: 'UPSC Prelims 2020: Money Bill',
      year: '2020',
      subject: 'Polity' as Subject,
      examType: 'Prelims' as const,
      pyq: 'With reference to the Parliament of India, which of the following Parliamentary Committees scrutinizes and reports to the House whether the powers to make regulations, rules, sub-rules, bye-laws, etc. conferred by the Constitution or delegated by Parliament are being properly exercised by the Executive?\n\n(a) Committee on Government Assurances\n(b) Committee on Subordinate Legislation\n(c) Rules Committee\n(d) Business Advisory Committee',
      option: 'Committee on Subordinate Legislation',
      reasoning: 'Delegated legislation refers to rules made by bureaucracy under an Act, hence subordinate legislation seemed the most direct match.',
    },
    {
      title: 'UPSC Prelims 2019: Eco-Sensitive Zones',
      year: '2019',
      subject: 'Environment' as Subject,
      examType: 'Prelims' as const,
      pyq: 'With reference to the Eco-Sensitive Zones (ESZs), which of the following statements is/are correct?\n\n1. Eco-Sensitive Zones are the areas that are declared under the Wildlife (Protection) Act, 1972.\n2. The purpose of the declaration of Eco-Sensitive Zones is to prohibit all kinds of human activities in those zones except agriculture.\n\nSelect the correct answer using the code given below:\n(a) 1 only\n(b) 2 only\n(c) Both 1 and 2\n(d) Neither 1 nor 2',
      option: '(c) Both 1 and 2',
      reasoning: 'I thought Wildlife Protection Act 1972 deals with protected areas, so ESZs must come under it, and agriculture is always exempted.',
    },
  ];

  const handleLoadSample = (sample: (typeof samplePYQs)[0]) => {
    setPyq(sample.pyq);
    setYear(sample.year);
    setSubject(sample.subject);
    setExamType(sample.examType);
    setSelectedOption(sample.option);
    setStudentReasoning(sample.reasoning);
    setAnalysis(null);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pyq.trim()) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/pyq/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pyq,
          year,
          subject,
          examType,
          selectedOption,
          studentReasoning,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to analyze PYQ.');
      }
      setAnalysis(data.analysis);
    } catch (err: any) {
      setError(err?.message || 'Error occurred while contacting PYQ diagnostic service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="pyq-lab-container" className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center text-white">
            <FileQuestion className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-slate-900">UPSC PYQ Diagnostic Lab</h1>
            <p className="text-xs text-slate-500">
              Identify <em>why</em> you picked an option, dissect statement traps, and debug cognitive elimination errors.
            </p>
          </div>
        </div>

        {/* 1-Click Samples */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-600 block mb-2">Load authentic UPSC PYQs:</span>
          <div className="flex flex-wrap gap-2">
            {samplePYQs.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadSample(s)}
                className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 text-slate-700 hover:text-amber-900 text-xs font-medium transition-colors cursor-pointer"
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleAnalyze} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Type</label>
            <div className="flex rounded-lg border border-slate-300 p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => setExamType('Prelims')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  examType === 'Prelims' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Prelims
              </button>
              <button
                type="button"
                onClick={() => setExamType('Mains')}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  examType === 'Mains' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                Mains
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Year</label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. 2023"
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value as Subject)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
            >
              <option value="Polity">Polity</option>
              <option value="History">History</option>
              <option value="Geography">Geography</option>
              <option value="Economy">Economy</option>
              <option value="Environment">Environment</option>
              <option value="Science & Technology">Science & Technology</option>
              <option value="International Relations">International Relations</option>
              <option value="General">General</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Question & Statements <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={5}
            required
            value={pyq}
            onChange={(e) => setPyq(e.target.value)}
            placeholder="Paste the complete UPSC question with all statements and options..."
            className="w-full p-3 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Selected Option / Guess
            </label>
            <input
              type="text"
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
              placeholder="e.g. Option (c) Both 1 and 2"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Your Thought Process / Reasoning
            </label>
            <input
              type="text"
              value={studentReasoning}
              onChange={(e) => setStudentReasoning(e.target.value)}
              placeholder="e.g. Why did you eliminate option A? What made you doubt statement 2?"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || !pyq.trim()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Running Diagnostic Analysis...</span>
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                <span>Diagnose My PYQ Reasoning</span>
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {error}
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <div id="pyq-analysis-results" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Diagnostic Report
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                {examType} {year}
              </span>
            </div>
            <div className="text-xs font-bold text-slate-900">
              Correct Answer:{' '}
              <span className="text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                {analysis.correctAnswer}
              </span>
            </div>
          </div>

          {/* 1. Core Demand & Statement Meaning */}
          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Question Demand & Core Syllabus Theme
              </span>
              <p className="text-xs sm:text-sm font-semibold text-slate-900">{analysis.questionDemand}</p>
            </div>

            {analysis.statementMeaning && analysis.statementMeaning.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Decoded Statement Meaning (Plain Language)
                </span>
                <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                  {analysis.statementMeaning.map((sm, i) => (
                    <li key={i}>{sm}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* 2. Evaluation of Student Reasoning & Exact Mistake */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                Your Reasoning Diagnostic
              </span>
              <p className="text-xs text-slate-800 leading-relaxed">{analysis.studentReasoningEvaluation}</p>
            </div>

            <div className="p-4 rounded-xl bg-red-50/70 border border-red-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-red-900 text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                <span>Exact Cognitive Mistake</span>
              </div>
              <p className="text-xs text-red-950 leading-relaxed">{analysis.exactReasoningMistake}</p>
            </div>
          </div>

          {/* 3. Statement-Wise Proof */}
          {analysis.statementWiseAnalysis && analysis.statementWiseAnalysis.length > 0 && (
            <div>
              <span className="text-xs font-bold text-slate-900 block mb-2">Statement-by-Statement Proof:</span>
              <div className="space-y-2">
                {analysis.statementWiseAnalysis.map((item, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                      item.isCorrect
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-red-50/50 border-red-200'
                    }`}
                  >
                    {item.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-semibold text-slate-900 mb-0.5">
                        {item.statement} —{' '}
                        <span className={item.isCorrect ? 'text-emerald-700' : 'text-red-700'}>
                          {item.isCorrect ? 'CORRECT' : 'INCORRECT'}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{item.reasoning}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Elimination Strategy & Future Trap */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Exam Elimination Technique
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{analysis.optionEliminationStrategy}</p>
            </div>

            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Future Distractor / Trap to Watch For
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{analysis.futureTrapToAvoid}</p>
            </div>
          </div>

          {/* 5. Takeaways */}
          {analysis.upscTakeaway && analysis.upscTakeaway.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-900 text-white">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-2">
                ★ UPSC PYQ Takeaways for Revision
              </span>
              <ul className="space-y-1 text-xs text-slate-200">
                {analysis.upscTakeaway.map((t, tidx) => (
                  <li key={tidx} className="flex items-start gap-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
