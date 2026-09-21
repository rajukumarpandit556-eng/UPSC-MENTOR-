import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  CheckCircle,
  Eye,
  EyeOff,
  Trash2,
  Bookmark,
  Brain,
  Filter,
  Check,
  Award,
  AlertCircle,
} from 'lucide-react';
import type { SavedDoubt, Subject } from '../types';

interface RevisionViewProps {
  token?: string | null;
  onNavigateToDoubtSolver: () => void;
  onRefreshCount: () => void;
}

export const RevisionView: React.FC<RevisionViewProps> = ({
  token,
  onNavigateToDoubtSolver,
  onRefreshCount,
}) => {
  const [doubts, setDoubts] = useState<SavedDoubt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [filterStatus, setFilterStatus] = useState<'all' | 'unmastered' | 'mastered'>('all');

  const fetchSavedDoubts = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/saved-doubts', { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load saved doubts');
      setDoubts(data.doubts || []);
      onRefreshCount();
    } catch (err: any) {
      setError(err?.message || 'Error fetching revision cards.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedDoubts();
  }, [token]);

  const toggleReveal = (id: string) => {
    setRevealedCards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleToggleMastery = async (doubt: SavedDoubt) => {
    const updatedStatus = !doubt.isMastered;
    try {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/saved-doubts/${doubt.id}`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          isMastered: updatedStatus,
          reviewCount: (doubt.reviewCount || 0) + 1,
          lastReviewedAt: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        setDoubts((prev) =>
          prev.map((d) =>
            d.id === doubt.id
              ? {
                  ...d,
                  isMastered: updatedStatus,
                  reviewCount: (d.reviewCount || 0) + 1,
                  lastReviewedAt: new Date().toISOString(),
                }
              : d
          )
        );
      }
    } catch (err) {
      console.error('Failed to update mastery status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/saved-doubts/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (res.ok) {
        setDoubts((prev) => prev.filter((d) => d.id !== id));
        onRefreshCount();
      }
    } catch (err) {
      console.error('Failed to delete doubt:', err);
    }
  };

  const filteredDoubts = doubts.filter((d) => {
    if (selectedSubject !== 'All' && d.subject !== selectedSubject) return false;
    if (filterStatus === 'mastered' && !d.isMastered) return false;
    if (filterStatus === 'unmastered' && d.isMastered) return false;
    return true;
  });

  const subjectsList = ['All', ...new Set(doubts.map((d) => d.subject))];

  return (
    <div id="revision-view-container" className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center text-white">
            <RotateCcw className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-slate-900">Active Recall Revision Hub</h1>
            <p className="text-xs text-slate-500">
              Transform answered doubts into high-yield memory flashcards for active retention.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
            Total Saved: <strong>{doubts.length}</strong>
          </span>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
            Mastered: <strong>{doubts.filter((d) => d.isMastered).length}</strong>
          </span>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 sm:p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-700">Subject:</span>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-2 py-1 rounded-md border border-slate-300 text-slate-800 bg-white"
          >
            {subjectsList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              filterStatus === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Cards
          </button>
          <button
            onClick={() => setFilterStatus('unmastered')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              filterStatus === 'unmastered'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Needs Review
          </button>
          <button
            onClick={() => setFilterStatus('mastered')}
            className={`px-3 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              filterStatus === 'mastered'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Mastered
          </button>
        </div>
      </div>

      {/* Flashcards List */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
          Loading your revision flashcards...
        </div>
      ) : filteredDoubts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-serif font-bold text-slate-900">No Revision Flashcards Yet</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            When you solve doubts in the Doubt Solver, click the <strong>"Save to Revision"</strong> button to turn them into active recall flashcards here.
          </p>
          <button
            onClick={onNavigateToDoubtSolver}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold cursor-pointer shadow-xs transition-colors"
          >
            Go to Doubt Solver
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDoubts.map((card) => {
            const isRevealed = revealedCards.has(card.id);
            return (
              <div
                key={card.id}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-2xs ${
                  card.isMastered
                    ? 'border-emerald-200 bg-emerald-50/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Meta Header */}
                <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {card.subject}
                    </span>
                    <span className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                      {card.mode} mode
                    </span>
                    {card.isMastered && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Mastered
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-400">
                      Reviews: <strong>{card.reviewCount || 0}</strong>
                    </span>
                    <button
                      onClick={() => handleDelete(card.id)}
                      title="Delete card"
                      className="p-1 rounded text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Question */}
                <div className="mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    Question (Prompt For Recall)
                  </span>
                  <p className="text-sm font-semibold text-slate-900 leading-snug">
                    {card.question}
                  </p>
                </div>

                {/* Reveal Action Button */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => toggleReveal(card.id)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {isRevealed ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> Hide Breakdown
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5 text-amber-700" /> Reveal Recall Breakdown
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleToggleMastery(card)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      card.isMastered
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                        : 'bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200'
                    }`}
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    {card.isMastered ? 'Mark as Needs Review' : 'Mark as Mastered'}
                  </button>
                </div>

                {/* Revealed Details */}
                {isRevealed && (
                  <div className="mt-4 pt-4 border-t border-slate-200 space-y-3 text-xs text-slate-700 animate-in fade-in duration-200">
                    <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 block mb-0.5">
                        Direct Answer
                      </span>
                      <p className="font-semibold text-slate-900">{card.directAnswer}</p>
                    </div>

                    {card.hinglishExplanation && (
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                          Hinglish Intuition
                        </span>
                        <p className="italic text-slate-700">"{card.hinglishExplanation}"</p>
                      </div>
                    )}

                    {card.upscTakeaway && card.upscTakeaway.length > 0 && (
                      <div className="p-3.5 bg-slate-900 text-white rounded-xl">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                          Key UPSC Takeaways:
                        </span>
                        <ul className="space-y-1">
                          {card.upscTakeaway.map((takeaway, tidx) => (
                            <li key={tidx} className="flex items-start gap-1.5">
                              <span className="text-amber-400">•</span>
                              <span>{takeaway}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
