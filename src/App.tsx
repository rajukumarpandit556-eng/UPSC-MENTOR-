/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, NavTab } from './components/Header';
import { TrustBanner } from './components/TrustBanner';
import { HomeView } from './components/HomeView';
import { DoubtSolverView } from './components/DoubtSolverView';
import { PYQLabView } from './components/PYQLabView';
import { MainsLabView } from './components/MainsLabView';
import { RevisionView } from './components/RevisionView';
import { HistoryView } from './components/HistoryView';
import { AboutView } from './components/AboutView';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import type { User, Subject, StudyMode, Conversation } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('upsc_mentor_token'));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [savedDoubtsCount, setSavedDoubtsCount] = useState<number>(0);

  // States for transferring context between views
  const [selectedPrompt, setSelectedPrompt] = useState<{
    question: string;
    subject: Subject;
    mode: StudyMode;
  }>({
    question: '',
    subject: 'Polity',
    mode: 'normal',
  });

  // Verify auth token on mount
  useEffect(() => {
    if (!token) return;

    fetch('/api/auth/me', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Session expired');
        return res.json();
      })
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem('upsc_mentor_token');
        setToken(null);
        setUser(null);
      });
  }, [token]);

  // Refresh saved doubts count
  const refreshSavedCount = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch('/api/saved-doubts', { headers });
      const data = await res.json();
      if (res.ok && data.doubts) {
        setSavedDoubtsCount(data.doubts.length);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    refreshSavedCount();
  }, [token]);

  const handleAuthSuccess = (newToken: string, newUser: User) => {
    localStorage.setItem('upsc_mentor_token', newToken);
    setToken(newToken);
    setUser(newUser);
    refreshSavedCount();
  };

  const handleLogout = () => {
    localStorage.removeItem('upsc_mentor_token');
    setToken(null);
    setUser(null);
    refreshSavedCount();
  };

  const handleLaunchPrompt = (question: string, subject: Subject, mode: StudyMode) => {
    setSelectedPrompt({ question, subject, mode });
    setActiveTab('doubt-solver');
  };

  const handleSelectHistoryConversation = (conv: Conversation) => {
    if (conv.messages && conv.messages.length > 0) {
      const userQ = conv.messages.find((m) => m.role === 'user')?.content || conv.title;
      setSelectedPrompt({
        question: userQ,
        subject: conv.subject,
        mode: conv.mode,
      });
    }
    setActiveTab('doubt-solver');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 text-slate-900 font-sans antialiased selection:bg-amber-200 selection:text-amber-950">
      {/* Top Trust Notice */}
      <TrustBanner onLearnMore={() => setActiveTab('about')} />

      {/* Main Global Navigation */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        user={user}
        savedDoubtsCount={savedDoubtsCount}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Primary Page Canvas */}
      <main className="flex-1 w-full max-w-7xl mx-auto py-4">
        {activeTab === 'home' && (
          <HomeView
            onNavigate={setActiveTab}
            onSelectPrompt={handleLaunchPrompt}
          />
        )}

        {activeTab === 'doubt-solver' && (
          <DoubtSolverView
            initialQuestion={selectedPrompt.question}
            initialSubject={selectedPrompt.subject}
            initialMode={selectedPrompt.mode}
            onDoubtSaved={refreshSavedCount}
            token={token}
          />
        )}

        {activeTab === 'pyq-lab' && <PYQLabView />}

        {activeTab === 'mains-lab' && <MainsLabView />}

        {activeTab === 'revision' && (
          <RevisionView
            token={token}
            onNavigateToDoubtSolver={() => setActiveTab('doubt-solver')}
            onRefreshCount={refreshSavedCount}
          />
        )}

        {activeTab === 'history' && (
          <HistoryView
            token={token}
            onSelectConversation={handleSelectHistoryConversation}
            onNavigateToDoubtSolver={() => setActiveTab('doubt-solver')}
          />
        )}

        {activeTab === 'about' && <AboutView />}
      </main>

      {/* Footer */}
      <Footer onSelectTab={setActiveTab} />

      {/* Auth / Demo Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
