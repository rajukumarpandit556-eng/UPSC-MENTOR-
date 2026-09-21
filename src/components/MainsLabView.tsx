import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Award,
  AlertCircle,
  CheckCircle,
  Clock,
  Compass,
  Scale,
  BookOpen,
  ArrowRight,
} from 'lucide-react';
import type { MainsEvaluationResponse } from '../types';

export const MainsLabView: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [gsPaper, setGsPaper] = useState<'GS 1' | 'GS 2' | 'GS 3' | 'GS 4' | 'Essay'>('GS 2');
  const [year, setYear] = useState('2024');
  const [wordLimit, setWordLimit] = useState<150 | 250>(250);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [evaluation, setEvaluation] = useState<MainsEvaluationResponse | null>(null);

  // Word count helper
  const wordCount = studentAnswer.trim() === '' ? 0 : studentAnswer.trim().split(/\s+/).length;

  const sampleMainsQuestions = [
    {
      title: 'GS 2: Governor & Federalism (250 words)',
      paper: 'GS 2' as const,
      year: '2023',
      limit: 250 as const,
      question:
        'Critically examine the constitutional position and discretionary powers of the Governor in the federal architecture of India in light of recent Centre-State friction.',
      answer: `Introduction:
The Governor occupies a dual constitutional position: the constitutional head of the State executive (Article 154) and the crucial vital link between the Union and the States. Dr. B.R. Ambedkar envisioned the Governor as an umpire, not an active player in political gameplay.

Constitutional Discretion vs Council of Ministers:
Under Article 163(1), the Governor acts on the aid and advice of the Council of Ministers, except where the Constitution requires discretion. Recent controversies have erupted over:
1. Reservation of State Bills for Presidential assent (Article 200) without defined timeframes, delaying state legislative will.
2. Discretion in inviting Chief Ministers during hung assemblies.
3. Invocation of President's Rule under Article 356.

Judicial Safeguards & Committee Reports:
- S.R. Bommai case (1994): Floor test made mandatory to establish majority; judicial review over proclamation under Art 356 established.
- Nabam Rebia case (2016): Governor cannot summon the assembly without ministerial advice.
- Shamsher Singh case: Governor must adhere to cabinet advice except in extraordinary emergencies.
- Sarkaria Commission (1988) & Punchhi Commission (2010): Recommended that Governors should be eminent persons from outside the state, appointed in consultation with the Chief Minister, and provided fixed tenure.

Way Forward:
Amend Article 200 to establish reasonable statutory time limits for assent on bills. Ensure the office embodies constitutional morality rather than partisan interest, preserving cooperative federalism.`,
    },
    {
      title: 'GS 3: Inclusive Growth & Fiscal Deficit (150 words)',
      paper: 'GS 3' as const,
      year: '2024',
      limit: 150 as const,
      question:
        'Discuss the challenges in achieving inclusive growth while adhering to the fiscal deficit consolidation targets mandated by the FRBM Act.',
      answer: `The FRBM Act aims for fiscal consolidation (3% GDP deficit), while inclusive growth demands heavy public expenditure on social infrastructure (health, education, rural connectivity).

Challenges:
1. Capex vs Welfare trade-off: Fiscal tightening often compresses developmental spending rather than revenue expenditure.
2. Structural inequality: Bottom 50% require subsidized food and employment guarantees (MGNREGA), which strain fiscal space.
3. Revenue mobilization limits: Low tax-to-GDP ratio (~17%) restricts government fiscal capacity.

Way Forward:
Rationalize untargeted subsidies, widen direct tax base, and prioritize high-multiplier capital expenditure to create jobs without widening deficit.`,
    },
  ];

  const handleLoadSample = (sample: (typeof sampleMainsQuestions)[0]) => {
    setQuestion(sample.question);
    setGsPaper(sample.paper);
    setYear(sample.year);
    setWordLimit(sample.limit);
    setStudentAnswer(sample.answer);
    setEvaluation(null);
  };

  const handleEvaluate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !studentAnswer.trim()) return;

    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/mains/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          gsPaper,
          year,
          wordLimit,
          studentAnswer,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Evaluation failed.');
      }
      setEvaluation(data.evaluation);
    } catch (err: any) {
      setError(err?.message || 'Error occurred while contacting Mains evaluation service.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="mains-lab-container" className="max-w-5xl mx-auto px-4 py-6 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white">
            <FileText className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-slate-900">UPSC Mains Answer Writing Lab</h1>
            <p className="text-xs text-slate-500">
              Evaluated against real UPSC standards: directive words, dimensional breadth, constitutional cases, and structure.
            </p>
          </div>
        </div>

        {/* 1-Click Samples */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <span className="text-[11px] font-bold text-slate-600 block mb-2">Load authentic UPSC Mains questions:</span>
          <div className="flex flex-wrap gap-2">
            {sampleMainsQuestions.map((s, idx) => (
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
      <form onSubmit={handleEvaluate} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">GS Paper</label>
            <select
              value={gsPaper}
              onChange={(e) => setGsPaper(e.target.value as any)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
            >
              <option value="GS 1">GS Paper 1 (Heritage, History, Geo, Society)</option>
              <option value="GS 2">GS Paper 2 (Governance, Constitution, Polity, IR)</option>
              <option value="GS 3">GS Paper 3 (Economy, Env, S&T, Security)</option>
              <option value="GS 4">GS Paper 4 (Ethics, Integrity, Aptitude)</option>
              <option value="Essay">Essay Paper</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Word Limit</label>
            <div className="flex rounded-lg border border-slate-300 p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => setWordLimit(150)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  wordLimit === 150 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                150 words (10 marks)
              </button>
              <button
                type="button"
                onClick={() => setWordLimit(250)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                  wordLimit === 250 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                }`}
              >
                250 words (15 marks)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Exam Year Context</label>
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="e.g. 2024"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Mains Question <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Type or paste the Mains question including the directive word (e.g. 'Critically examine...')..."
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-semibold text-slate-700">
              Your Written Answer <span className="text-red-500">*</span>
            </label>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded ${
                wordCount > wordLimit * 1.15
                  ? 'bg-red-50 text-red-700'
                  : wordCount < wordLimit * 0.7
                  ? 'bg-amber-50 text-amber-800'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {wordCount} / {wordLimit} words
            </span>
          </div>
          <textarea
            rows={10}
            required
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            placeholder="Write or paste your complete answer with introduction, body headings, and conclusion..."
            className="w-full p-3 border border-slate-300 rounded-lg text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none leading-relaxed font-sans"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || !question.trim() || !studentAnswer.trim()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                <span>Evaluating Answer against UPSC Rubric...</span>
              </>
            ) : (
              <>
                <Award className="w-4 h-4 text-amber-400" />
                <span>Evaluate My Mains Answer</span>
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

      {/* Comprehensive Evaluation Results */}
      {evaluation && (
        <div id="mains-evaluation-results" className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
          {/* Indicative Score Card Banner */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block">
                Indicative Scorecard
              </span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-3xl font-serif font-bold text-white">
                  {evaluation.indicativeScore?.awardedMarks}
                </span>
                <span className="text-sm text-slate-400">
                  / {evaluation.indicativeScore?.totalMarks} Marks
                </span>
                <span className="ml-2 text-xs font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {evaluation.indicativeScore?.scoreBand}
                </span>
              </div>
            </div>

            <div className="text-right sm:max-w-xs text-[11px] text-slate-400 italic">
              {evaluation.indicativeScore?.disclaimer ||
                'AI-generated indicative assessment — not official UPSC evaluation.'}
            </div>
          </div>

          {/* 1. Directive Word Breakdown & Core Demand */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block">
                Directive Word: "{evaluation.directiveWord?.word}"
              </span>
              <p className="text-xs text-slate-800 leading-relaxed">
                {evaluation.directiveWord?.explanation}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Question Demand & Keywords
              </span>
              <p className="text-xs text-slate-800 font-semibold mb-1">
                {evaluation.questionDemand}
              </p>
              {evaluation.keywordsIdentified && evaluation.keywordsIdentified.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {evaluation.keywordsIdentified.map((kw, i) => (
                    <span key={i} className="text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                      {kw}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 2. Intro & Structure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Introduction Quality
                </span>
                <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[10px]">
                  {evaluation.introductionAssessment?.score}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                {evaluation.introductionAssessment?.feedback}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-slate-200">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Structure & Presentation Flow
              </span>
              <p className="text-slate-700 leading-relaxed">
                {evaluation.structureAndFlow}
              </p>
            </div>
          </div>

          {/* 3. Multi-Dimensional Coverage */}
          {evaluation.dimensionsAddressed && evaluation.dimensionsAddressed.length > 0 && (
            <div>
              <span className="text-xs font-bold text-slate-900 block mb-2">
                Multi-Dimensional Breadth (PESTLE Check):
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {evaluation.dimensionsAddressed.map((dim, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-lg border border-slate-200 bg-slate-50/60 text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <strong className="text-slate-900">{dim.dimension}</strong>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          dim.status === 'Well Addressed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : dim.status === 'Partial'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {dim.status}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-snug">{dim.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Constitutional / Case Law Citations & Missing Dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                Constitutional & Case Citations
              </span>
              {evaluation.constitutionalAndCaseReferences &&
              evaluation.constitutionalAndCaseReferences.length > 0 ? (
                <ul className="space-y-1 text-xs text-slate-700 list-disc list-inside">
                  {evaluation.constitutionalAndCaseReferences.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">None detected. Citing landmark cases elevates GS 2 answers.</p>
              )}
            </div>

            <div className="p-4 rounded-xl bg-red-50/50 border border-red-200/70 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-900 block">
                Critical Missing Dimensions
              </span>
              {evaluation.missingDimensions && evaluation.missingDimensions.length > 0 ? (
                <ul className="space-y-1 text-xs text-red-950 list-disc list-inside">
                  {evaluation.missingDimensions.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">All major dimensions covered reasonably.</p>
              )}
            </div>
          </div>

          {/* 5. Way Forward & Conclusion */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div>
              <strong className="text-slate-900 block mb-0.5">Way Forward / Reforms:</strong>
              <p className="text-slate-700 leading-relaxed">{evaluation.wayForward}</p>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <strong className="text-slate-900 block mb-0.5">Conclusion Evaluation:</strong>
              <p className="text-slate-700 leading-relaxed">{evaluation.conclusionAssessment}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
