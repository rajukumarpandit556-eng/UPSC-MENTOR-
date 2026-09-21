import React, { useState, useEffect } from 'react';
import { History, MessageSquare, Trash2, ArrowRight, Clock, BookOpen, AlertCircle } from 'lucide-react';
import type { Conversation } from '../types';

interface HistoryViewProps {
  token?: string | null;
  onSelectConversation: (conv: Conversation) => void;
  onNavigateToDoubtSolver: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  token,
  onSelectConversation,
  onNavigateToDoubtSolver,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    setLoading(true);
    setError(null);
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch('/api/conversations', { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load conversations');
      setConversations(data.conversations || []);
    } catch (err: any) {
      setError(err?.message || 'Error fetching conversation history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, [token]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/conversations/${id}`, {
        method: 'DELETE',
        headers,
      });

      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleOpenConversation = async (id: string) => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`/api/conversations/${id}`, { headers });
      const data = await res.json();
      if (res.ok && data.conversation) {
        onSelectConversation(data.conversation);
      }
    } catch (err) {
      console.error('Failed to open conversation:', err);
    }
  };

  return (
    <div id="history-view-container" className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white">
            <History className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <h1 className="text-xl font-serif font-bold text-slate-900">Study History & Threads</h1>
            <p className="text-xs text-slate-500">
              Resume past multi-turn learning threads or review solved doubts.
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToDoubtSolver}
          className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
        >
          + New Doubt
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-xs text-slate-500">
          Loading conversation logs...
        </div>
      ) : conversations.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-10 text-center max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-serif font-bold text-slate-900">No Past Conversations</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Every doubt you explore in the Doubt Solver will be automatically saved here as a persistent thread so you can continue learning anytime.
          </p>
          <button
            onClick={onNavigateToDoubtSolver}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold cursor-pointer"
          >
            Start Your First Thread
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => handleOpenConversation(conv.id)}
              className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-400/80 shadow-2xs hover:shadow-xs transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                    {conv.subject}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">
                    {conv.mode} mode
                  </span>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(conv.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-900 group-hover:text-amber-800 transition-colors">
                  {conv.title}
                </h3>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => handleDelete(conv.id, e)}
                  title="Delete thread"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="text-slate-400 group-hover:text-amber-700 transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
