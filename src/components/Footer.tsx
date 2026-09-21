import React from 'react';
import { BookOpen, ShieldAlert } from 'lucide-react';
import type { NavTab } from './Header';

interface FooterProps {
  onSelectTab: (tab: NavTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onSelectTab }) => {
  return (
    <footer id="main-footer" className="bg-slate-900 text-slate-400 border-t border-slate-800 text-xs py-10 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div className="space-y-2 max-w-sm">
            <div className="flex items-center gap-2 text-white">
              <div className="w-6 h-6 rounded-md bg-amber-600 flex items-center justify-center text-slate-950 font-bold">
                <BookOpen className="w-4 h-4 text-white" />
              </div>
              <span className="font-serif font-bold text-base tracking-wide">UPSC MENTOR</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              AI-powered reasoning coach, doubt solver, and pedagogical companion for civil services aspirants across India.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-2">Practice Labs</h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button onClick={() => onSelectTab('doubt-solver')} className="hover:text-white cursor-pointer">
                    Doubt Solver
                  </button>
                </li>
                <li>
                  <button onClick={() => onSelectTab('pyq-lab')} className="hover:text-white cursor-pointer">
                    PYQ Diagnostic Lab
                  </button>
                </li>
                <li>
                  <button onClick={() => onSelectTab('mains-lab')} className="hover:text-white cursor-pointer">
                    Mains Answer Lab
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-2">Tools & Retention</h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button onClick={() => onSelectTab('revision')} className="hover:text-white cursor-pointer">
                    Active Recall Flashcards
                  </button>
                </li>
                <li>
                  <button onClick={() => onSelectTab('history')} className="hover:text-white cursor-pointer">
                    Past Study Threads
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold text-xs uppercase tracking-wider mb-2">Principles</h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <button onClick={() => onSelectTab('about')} className="hover:text-white cursor-pointer">
                    Accuracy & Trust Policy
                  </button>
                </li>
                <li>
                  <button onClick={() => onSelectTab('about')} className="hover:text-white cursor-pointer">
                    Disclaimer & Boundaries
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p className="text-center sm:text-left">
            © {new Date().getFullYear()} UPSC Mentor. Independent educational tool; not affiliated with the Union Public Service Commission.
          </p>
          <div className="flex items-center gap-1.5 text-slate-400">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>AI outputs are study aids. Always verify critical facts with official sources.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
