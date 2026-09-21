import React from 'react';
import {
  ShieldCheck,
  Scale,
  BookOpen,
  Brain,
  Search,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Sparkles,
  Server,
  Lock,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  return (
    <div id="about-view-container" className="max-w-4xl mx-auto px-4 py-8 space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
          <Scale className="w-3.5 h-3.5 text-amber-700" />
          <span>Independent Educational Project</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-slate-900">
          About UPSC Mentor
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          A pedagogical AI study companion engineered to help Civil Services Examination aspirants build deep conceptual clarity and disciplined reasoning.
        </p>
      </div>

      {/* Core Philosophy Section */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-4">
        <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-amber-600" />
          <span>The Core Philosophy</span>
        </h2>
        <div className="p-3 bg-amber-50/70 border border-amber-200 text-amber-950 font-bold text-center text-sm rounded-xl">
          Accuracy → Verification → Understanding → Reasoning → Practice → Revision
        </div>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          The goal of UPSC Mentor is never to merely hand over a pre-packaged answer or act as a passive search engine. The Civil Services Examination tests an aspirant's ability to apply constitutional principles, economic fundamentals, and multi-dimensional analysis to entirely new situations in the exam hall.
        </p>
        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
          By pairing everyday intuitive analogies (Hinglish context) with rigorous constitutional references, identifying the exact trap in tricky Prelims statements, and evaluating Mains answers on strict dimensional coverage, we guide the student to independently derive and defend conclusions.
        </p>
      </section>

      {/* Trust, Accuracy & Disclaimer Policy */}
      <section className="bg-amber-50/60 border border-amber-200/90 rounded-2xl p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-amber-700" />
          <h2 className="text-xl font-serif font-bold text-slate-900">
            Trust, Accuracy & Verification Policy
          </h2>
        </div>

        <div className="space-y-3 text-xs sm:text-sm text-slate-800 leading-relaxed">
          <div className="p-3.5 bg-white/80 rounded-xl border border-amber-200">
            <strong className="text-slate-900 block mb-1">1. Not Affiliated with UPSC:</strong>
            UPSC Mentor is an independent educational product. It is neither endorsed by nor affiliated with the Union Public Service Commission (UPSC) or any Ministry of the Government of India.
          </div>

          <div className="p-3.5 bg-white/80 rounded-xl border border-amber-200">
            <strong className="text-slate-900 block mb-1">2. No Guarantee of Selection or Official Evaluation:</strong>
            We do not claim 100% factual perfection, nor do we promise selection or rank in the Civil Services Examination. All Mains score estimates and evaluation rubrics are purely indicative learning diagnostics, not official marks.
          </div>

          <div className="p-3.5 bg-white/80 rounded-xl border border-amber-200">
            <strong className="text-slate-900 block mb-1">3. Authoritative Source Hierarchy:</strong>
            Wherever possible, explanations cite primary and official repositories:
            <ul className="list-disc list-inside mt-1.5 space-y-0.5 text-xs text-slate-700">
              <li>Constitution of India (Legislative Department, Ministry of Law & Justice)</li>
              <li>Supreme Court of India Landmark Judgments (SCI / e-SCR)</li>
              <li>India Code Repository (Central & State Acts)</li>
              <li>Press Information Bureau (PIB), PRS Legislative Research</li>
              <li>Economic Survey & Union Budget documents (Ministry of Finance)</li>
              <li>NCERT standard textbooks for foundational concepts</li>
            </ul>
          </div>

          <div className="p-3.5 bg-white/80 rounded-xl border border-amber-200">
            <strong className="text-slate-900 block mb-1">4. Explicit Uncertainty & Conservatism:</strong>
            When legal interpretation is contested (e.g. conflicting judicial precedents, evolving constitutional conventions) or data is subject to multiple interpretations, the AI explicitly declares uncertainty rather than hallucinating consensus.
          </div>
        </div>
      </section>

      {/* Production Architecture & Security */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-2xs space-y-4">
        <h2 className="text-xl font-serif font-bold text-slate-900 flex items-center gap-2">
          <Server className="w-5 h-5 text-slate-700" />
          <span>Architecture & Security</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Full-Stack Security</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              API keys are strictly safeguarded on the server-side inside containerized Express handlers. No API tokens or secrets are ever exposed in client-side bundles.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 mb-1">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Structured Reasoning Schema</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              Every doubt solver response adheres to a strict JSON pedagogical schema, separating direct answers, Hinglish intuition, underlying mechanisms, and common traps.
            </p>
          </div>
        </div>
      </section>

      {/* Future Roadmap */}
      <section className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-serif font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-600" />
            <span>Upcoming Roadmap</span>
          </h2>
          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-200">
            In Progress
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            { title: 'NCERT Grounded Vector Store', desc: 'Direct citation of Class VI–XII NCERT textbook chapters for fundamental doubts.', status: 'Coming Soon' },
            { title: 'PDF / Document Upload', desc: 'Upload coaching test papers or personal notes for contextual doubt solving.', status: 'Coming Soon' },
            { title: 'SuperMemo Spaced Repetition (SM-2)', desc: 'Automated review scheduling based on active recall difficulty ratings.', status: 'Coming Soon' },
            { title: 'Voice Input & Audio Readout', desc: 'Bilingual voice conversations for hands-free study sessions.', status: 'Coming Soon' },
          ].map((feat, idx) => (
            <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <strong className="text-slate-900">{feat.title}</strong>
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                    {feat.status}
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-snug">{feat.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
