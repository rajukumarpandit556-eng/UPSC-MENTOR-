import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Sparkles, Shield, AlertCircle } from 'lucide-react';
import type { User } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (token: string, user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const body = isLogin ? { email, password } : { name, email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }

      onAuthSuccess(data.token, data.user);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to start demo session');
      onAuthSuccess(data.token, data.user);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Could not start guest session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="auth-modal-card"
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700" />

        <button
          id="auth-modal-close-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-amber-600" />
            <h2 className="text-xl font-serif font-bold text-slate-900">
              {isLogin ? 'Sign In to UPSC Mentor' : 'Create Aspirant Account'}
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Save your doubts, track your revision flashcards, and persist your conversation history across study sessions.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-name-input"
                  type="text"
                  required
                  placeholder="e.g. Aditi Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="auth-email-input"
                type="email"
                required
                placeholder="aspirant@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="auth-password-input"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            {!isLogin && <p className="text-[11px] text-slate-500 mt-1">Minimum 6 characters</p>}
          </div>

          <button
            id="auth-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold text-sm transition-colors shadow-xs disabled:opacity-50 cursor-pointer mt-2"
          >
            {loading ? 'Authenticating...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="my-4 relative text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <span className="relative bg-white px-2 text-[11px] text-slate-400 uppercase tracking-wider">or</span>
        </div>

        {/* Guest Demo Login */}
        <button
          id="auth-guest-btn"
          type="button"
          onClick={handleGuestLogin}
          disabled={loading}
          className="w-full py-2 px-3 rounded-lg border border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-amber-600" />
          <span>Continue as Guest Aspirant (1-Click Demo)</span>
        </button>

        <div className="mt-5 text-center text-xs text-slate-600">
          {isLogin ? (
            <span>
              Don't have an account yet?{' '}
              <button
                id="switch-to-signup-btn"
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setError(null);
                }}
                className="text-amber-700 font-semibold hover:underline cursor-pointer"
              >
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already registered?{' '}
              <button
                id="switch-to-login-btn"
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setError(null);
                }}
                className="text-amber-700 font-semibold hover:underline cursor-pointer"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
