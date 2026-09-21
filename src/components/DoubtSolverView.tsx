import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  BookOpen,
  RotateCcw,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Bookmark,
  BookmarkCheck,
  Shield,
  HelpCircle,
  Flame,
  Scale,
  Brain,
  MessageSquare,
  PlusCircle,
  Copy,
  Check,
} from 'lucide-react';
import type { Conversation, Message, StructuredDoubtResponse, StudyMode, Subject } from '../types';

interface DoubtSolverViewProps {
  initialQuestion?: string;
  initialSubject?: Subject;
  initialMode?: StudyMode;
  onDoubtSaved?: () => void;
  token?: string | null;
}

export const DoubtSolverView: React.FC<DoubtSolverViewProps> = ({
  initialQuestion = '',
  initialSubject = 'Polity',
  initialMode = 'normal',
  onDoubtSaved,
  token,
}) => {
  const [subject, setSubject] = useState<Subject>(initialSubject);
  const [mode, setMode] = useState<StudyMode>(initialMode);
  const [inputQuestion, setInputQuestion] = useState(initialQuestion);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Active conversation state
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [savedMessageIds, setSavedMessageIds] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const subjects: Subject[] = [
    'Polity',
    'History',
    'Geography',
    'Economy',
    'Environment',
    'Science & Technology',
    'International Relations',
    'Society',
    'Governance',
    'Ethics',
    'Current Affairs',
    'CSAT',
    'General',
  ];

  const modes: { id: StudyMode; label: string; desc: string }[] = [
    { id: 'normal', label: 'Normal Mode', desc: 'Balanced explanation & standard UPSC rigor' },
    { id: 'zero_level', label: 'Zero Level', desc: 'Ground-zero everyday analogies bridging to UPSC' },
    { id: 'prelims', label: 'Prelims Mode', desc: 'Factual statements, elimination & traps' },
    { id: 'mains', label: 'Mains Mode', desc: 'Directive words, dimensions, data & structure' },
    { id: 'revision', label: 'Revision Mode', desc: 'Active recall triggers & concise takeaways' },
    { id: 'socratic', label: 'Socratic Mode', desc: 'Guiding questions to challenge your reasoning' },
    { id: 'no_hallucination', label: 'No-Hallucination', desc: 'Absolute factual conservatism & declared uncertainty' },
  ];

  // Auto-scroll when new message appears
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Handle external prop changes
  useEffect(() => {
    if (initialQuestion && initialQuestion !== inputQuestion) {
      setInputQuestion(initialQuestion);
      if (initialSubject) setSubject(initialSubject);
      if (initialMode) setMode(initialMode);
    }
  }, [initialQuestion, initialSubject, initialMode]);

  const handleAskDoubt = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = inputQuestion.trim();
    if (!q) return;

    setError(null);
    setLoading(true);

    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/doubts/ask', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          question: q,
          subject,
          mode,
          conversationId: activeConversation?.id,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process doubt.');
      }

      if (data.conversation) {
        setActiveConversation(data.conversation);
        setMessages(data.conversation.messages || []);
      }
      setInputQuestion('');
    } catch (err: any) {
      setError(err?.message || 'Failed to connect to UPSC Mentor API.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToRevision = async (msg: Message) => {
    if (!msg.structuredData) return;
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const s = msg.structuredData;
      const res = await fetch('/api/saved-doubts', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          question: messages.find((m) => m.role === 'user')?.content || 'UPSC Doubt',
          subject,
          mode,
          directAnswer: s.directAnswer,
          hinglishExplanation: s.hinglishExplanation,
          technicalExplanation: s.technicalExplanation,
          whyAndHow: s.whyAndHow,
          example: s.example,
          upscConnection: s.upscConnection,
          commonTraps: s.commonTraps,
          upscTakeaway: s.upscTakeaway,
          sources: s.verification?.sources || [],
          conversationId: activeConversation?.id,
        }),
      });

      if (res.ok) {
        setSavedMessageIds((prev) => new Set([...prev, msg.id]));
        if (onDoubtSaved) onDoubtSaved();
      }
    } catch (err) {
      console.error('Failed to save doubt to revision:', err);
    }
  };

  const handleCopySummary = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNewConversation = () => {
    setActiveConversation(null);
    setMessages([]);
    setInputQuestion('');
    setError(null);
  };

  return (
    <div id="doubt-solver-container" className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Top Controls Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-serif font-bold text-slate-900">UPSC Doubt Solver</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                AI Reasoning Engine
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Multi-turn conversational clarity with constitutional & syllabus grounding
            </p>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                id="new-conversation-btn"
                onClick={handleNewConversation}
                className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>New Doubt Thread</span>
              </button>
            )}
          </div>
        </div>

        {/* Parameter Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3">
          {/* Subject Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select UPSC Subject
            </label>
            <select
              id="doubt-subject-select"
              value={subject}
              onChange={(e) => setSubject(e.target.value as Subject)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>

          {/* Study Mode Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Select Study Mode</span>
              <span className="text-[11px] text-amber-800 font-normal">
                {modes.find((m) => m.id === mode)?.desc}
              </span>
            </label>
            <select
              id="doubt-mode-select"
              value={mode}
              onChange={(e) => setMode(e.target.value as StudyMode)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-amber-900 bg-amber-50/50 border-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {modes.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label} ({m.desc})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Conversation Messages Thread */}
      <div id="doubt-messages-thread" className="space-y-6">
        {messages.length === 0 && (
          <div className="bg-slate-50/80 rounded-2xl border border-dashed border-slate-300 p-8 text-center max-w-2xl mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-base font-serif font-bold text-slate-900">What is your UPSC doubt today?</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Ask any conceptual query, confusing prelims trap, or mains directive dilemma. The mentor breaks it down step-by-step.
            </p>

            <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs">
              <button
                onClick={() =>
                  setInputQuestion('Why does Article 32 itself constitute a Fundamental Right, unlike Article 226?')
                }
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-amber-300 text-slate-700 text-[11px] cursor-pointer"
              >
                Article 32 vs Article 226
              </button>
              <button
                onClick={() =>
                  setInputQuestion('Difference between Monetary Policy Transmission and Liquidity Adjustment Facility (LAF)?')
                }
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-amber-300 text-slate-700 text-[11px] cursor-pointer"
              >
                Economy: LAF Transmission
              </button>
              <button
                onClick={() =>
                  setInputQuestion('What are Coral Bleaching mechanisms and how is Degree Heating Weeks (DHW) measured?')
                }
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-amber-300 text-slate-700 text-[11px] cursor-pointer"
              >
                Environment: Coral Bleaching & DHW
              </button>
            </div>
          </div>
        )}

        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id || index}
              id={`message-${msg.id || index}`}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              {isUser ? (
                /* User Question Bubble */
                <div className="max-w-2xl bg-slate-900 text-white rounded-2xl rounded-tr-xs px-4 py-3 shadow-xs text-sm">
                  <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                    <span className="font-semibold text-amber-400">Student Question</span>
                    <span>•</span>
                    <span>{subject}</span>
                  </div>
                  <p className="font-medium whitespace-pre-wrap">{msg.content}</p>
                </div>
              ) : (
                /* Assistant Structured Breakdown Card */
                <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5">
                  {/* Meta Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-amber-600 flex items-center justify-center text-white">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-900">UPSC Mentor Response</span>
                      {msg.doubtType && (
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          {msg.doubtType}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() =>
                          handleCopySummary(
                            `${msg.structuredData?.directAnswer}\n\nKey Takeaways:\n${msg.structuredData?.upscTakeaway.join('\n')}`,
                            msg.id
                          )
                        }
                        title="Copy Summary"
                        className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-xs flex items-center gap-1"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                        <span className="text-[11px] hidden sm:inline">Copy</span>
                      </button>

                      <button
                        onClick={() => handleSaveToRevision(msg)}
                        disabled={savedMessageIds.has(msg.id)}
                        className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                          savedMessageIds.has(msg.id)
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200'
                        }`}
                      >
                        {savedMessageIds.has(msg.id) ? (
                          <>
                            <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Saved in Revision</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3.5 h-3.5 text-amber-700" />
                            <span>Save to Revision</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {msg.structuredData ? (
                    <div className="space-y-4 text-sm text-slate-800">
                      {/* 1. Direct Answer */}
                      <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block mb-1">
                          Direct Answer
                        </span>
                        <p className="font-semibold text-slate-900 leading-relaxed">
                          {msg.structuredData.directAnswer}
                        </p>
                      </div>

                      {/* 2. Simple Hinglish Explanation */}
                      {msg.structuredData.hinglishExplanation && (
                        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block mb-1">
                            Simple Hinglish Explanation (सरल शब्दों में)
                          </span>
                          <p className="text-slate-700 leading-relaxed italic">
                            "{msg.structuredData.hinglishExplanation}"
                          </p>
                        </div>
                      )}

                      {/* 3. UPSC Technical Explanation (Why & How) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                            Technical Explanation
                          </span>
                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                            {msg.structuredData.technicalExplanation}
                          </p>
                        </div>

                        <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                            Why & How (Underlying Mechanics)
                          </span>
                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                            {msg.structuredData.whyAndHow}
                          </p>
                        </div>
                      </div>

                      {/* 4. Real Example / Case */}
                      {msg.structuredData.example && (
                        <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                            Example / Landmark Precedent
                          </span>
                          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                            {msg.structuredData.example}
                          </p>
                        </div>
                      )}

                      {/* 5. Syllabus Connection & Prelims / Mains Angle */}
                      <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                            UPSC Syllabus Mapping
                          </span>
                          {msg.structuredData.upscConnection?.syllabusPaper && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-800">
                              {msg.structuredData.upscConnection.syllabusPaper}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mb-2">
                          {msg.structuredData.upscConnection?.relevance}
                        </p>

                        {(msg.structuredData.relevantAngle?.prelimsAngle ||
                          msg.structuredData.relevantAngle?.mainsAngle) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-200 text-xs">
                            {msg.structuredData.relevantAngle.prelimsAngle && (
                              <div>
                                <strong className="text-slate-800">Prelims Angle: </strong>
                                <span className="text-slate-600">
                                  {msg.structuredData.relevantAngle.prelimsAngle}
                                </span>
                              </div>
                            )}
                            {msg.structuredData.relevantAngle.mainsAngle && (
                              <div>
                                <strong className="text-slate-800">Mains Angle: </strong>
                                <span className="text-slate-600">
                                  {msg.structuredData.relevantAngle.mainsAngle}
                                </span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* 6. Common UPSC Traps */}
                      {msg.structuredData.commonTraps && msg.structuredData.commonTraps.length > 0 && (
                        <div className="p-3.5 rounded-xl bg-red-50/60 border border-red-200/80">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-red-900 mb-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                            <span>Common UPSC Traps & Misconceptions</span>
                          </div>
                          <ul className="space-y-1 text-xs text-red-950 list-disc list-inside">
                            {msg.structuredData.commonTraps.map((trap, tidx) => (
                              <li key={tidx} className="leading-relaxed">
                                {trap}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* 7. Verification & Sources */}
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                            <Shield className="w-3.5 h-3.5 text-amber-700" />
                            <span>Source Verification</span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              msg.structuredData.verification?.isExternallyVerified
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {msg.structuredData.verification?.isExternallyVerified
                              ? 'Verified with Primary Sources'
                              : 'This response has not been externally verified'}
                          </span>
                        </div>

                        {msg.structuredData.verification?.verificationNote && (
                          <p className="text-xs text-slate-500 mb-2 italic">
                            {msg.structuredData.verification.verificationNote}
                          </p>
                        )}

                        {msg.structuredData.verification?.sources &&
                        msg.structuredData.verification.sources.length > 0 ? (
                          <div className="space-y-1.5 pt-1">
                            {msg.structuredData.verification.sources.map((src, sidx) => (
                              <div
                                key={sidx}
                                className="flex items-start justify-between gap-2 p-2 rounded-lg bg-slate-50 text-xs border border-slate-200"
                              >
                                <div>
                                  <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                                    <span>{src.title}</span>
                                    {src.organization && (
                                      <span className="text-[10px] text-slate-500 font-normal">
                                        ({src.organization})
                                      </span>
                                    )}
                                  </div>
                                  {src.excerpt && (
                                    <p className="text-[11px] text-slate-600 mt-0.5">"{src.excerpt}"</p>
                                  )}
                                </div>
                                {src.url && (
                                  <a
                                    href={src.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-amber-700 hover:text-amber-900 shrink-0 p-1"
                                    title="View Source Link"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-[11px] text-slate-500">
                            Based on standard constitutional & academic consensus. No external statute link attached.
                          </p>
                        )}
                      </div>

                      {/* 8. Socratic Follow-up (if mode is socratic) */}
                      {msg.structuredData.socraticFollowUp && (
                        <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-950">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 block mb-1">
                            Socratic Reasoning Challenge
                          </span>
                          <p className="text-xs sm:text-sm font-semibold">
                            {msg.structuredData.socraticFollowUp}
                          </p>
                          <p className="text-[11px] text-purple-700 mt-1">
                            Try answering in the follow-up box below before asking for the solution.
                          </p>
                        </div>
                      )}

                      {/* 9. UPSC Takeaway */}
                      {msg.structuredData.upscTakeaway && msg.structuredData.upscTakeaway.length > 0 && (
                        <div className="p-4 rounded-xl bg-slate-900 text-white shadow-xs">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-2">
                            ★ UPSC High-Yield Takeaway (For Quick Revision)
                          </span>
                          <ul className="space-y-1.5 text-xs text-slate-200">
                            {msg.structuredData.upscTakeaway.map((item, kidx) => (
                              <li key={kidx} className="flex items-start gap-2">
                                <span className="text-amber-400 font-bold shrink-0">•</span>
                                <span className="leading-relaxed">{item}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Plain Content Fallback */
                    <p className="text-sm text-slate-800 whitespace-pre-wrap">{msg.content}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-xs animate-pulse">
            <div className="flex items-center justify-center gap-2 text-amber-700 mb-2">
              <Sparkles className="w-5 h-5 animate-spin" />
              <span className="text-sm font-bold">Consulting UPSC Knowledge & Constitutional Repositories...</span>
            </div>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Analyzing doubt type, verifying primary legal provisions, formulating Hinglish context, and extracting UPSC traps.
            </p>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Persistent Follow-up & Input Box */}
      <div className="sticky bottom-4 z-20">
        <form
          onSubmit={handleAskDoubt}
          className="bg-white rounded-2xl border border-slate-300 shadow-lg p-2 flex items-end gap-2"
        >
          <div className="flex-1">
            <textarea
              id="doubt-input-textarea"
              rows={messages.length === 0 ? 3 : 2}
              placeholder={
                messages.length === 0
                  ? "Type or paste your UPSC doubt (e.g. 'Why does Article 32 constitute a Fundamental Right?')..."
                  : "Ask a follow-up question (e.g. 'What is the difference between this and Article 226?')..."
              }
              value={inputQuestion}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAskDoubt();
                }
              }}
              className="w-full px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none"
            />
          </div>

          <button
            id="doubt-submit-btn"
            type="submit"
            disabled={loading || !inputQuestion.trim()}
            className="p-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold disabled:opacity-40 transition-colors shadow-xs shrink-0 cursor-pointer flex items-center justify-center"
          >
            {loading ? <Sparkles className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </form>
        <p className="text-[11px] text-slate-400 text-center mt-1.5">
          Press <strong>Enter</strong> to submit, <strong>Shift + Enter</strong> for a new line. Multi-turn conversation context is preserved.
        </p>
      </div>
    </div>
  );
};
