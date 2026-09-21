import React from 'react';
import { ShieldAlert, Info } from 'lucide-react';

interface TrustBannerProps {
  onLearnMore?: () => void;
}

export const TrustBanner: React.FC<TrustBannerProps> = ({ onLearnMore }) => {
  return (
    <div id="trust-banner" className="bg-amber-50/90 border-b border-amber-200/80 text-amber-900 px-4 py-2 text-xs md:text-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            <strong>AI is your study assistant, not your final authority.</strong> UPSC Mentor is an independent educational tool; not affiliated with UPSC.
            Always verify critical legal, factual, or current affairs details against official primary sources.
          </span>
        </div>
        {onLearnMore && (
          <button
            id="trust-learn-more-btn"
            onClick={onLearnMore}
            className="shrink-0 text-amber-800 font-semibold underline hover:text-amber-950 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            Accuracy & Trust Principles
          </button>
        )}
      </div>
    </div>
  );
};
