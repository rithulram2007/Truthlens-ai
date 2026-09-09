import React from 'react';
import { HelpCircle } from 'lucide-react';

interface ConfidenceMeterProps {
  score: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  score,
  size = 'md',
  showLabel = true,
}) => {
  const normalized = Math.max(0, Math.min(100, Math.round(score)));

  let colorClass = 'bg-stone-500 text-stone-700';
  let badgeColor = 'bg-stone-100 text-stone-700 border-stone-300';
  let tierText = 'Low System Certainty';

  if (normalized >= 80) {
    colorClass = 'bg-emerald-600 text-emerald-700';
    badgeColor = 'bg-emerald-50 text-emerald-800 border-emerald-300';
    tierText = 'High Evidentiary Certainty';
  } else if (normalized >= 60) {
    colorClass = 'bg-sky-600 text-sky-700';
    badgeColor = 'bg-sky-50 text-sky-800 border-sky-300';
    tierText = 'Moderate Evidentiary Certainty';
  } else if (normalized >= 40) {
    colorClass = 'bg-amber-600 text-amber-700';
    badgeColor = 'bg-amber-50 text-amber-800 border-amber-300';
    tierText = 'Partial / Tentative Assessment';
  } else {
    colorClass = 'bg-stone-500 text-stone-700';
    badgeColor = 'bg-stone-100 text-stone-700 border-stone-300';
    tierText = 'Constrained / Uncertain Evidence Base';
  }

  if (size === 'sm') {
    return (
      <div className="flex items-center gap-2" title={`${normalized}% System Confidence (${tierText})`}>
        <div className="w-16 h-2 bg-stone-200 rounded-full overflow-hidden">
          <div className={`h-full ${colorClass}`} style={{ width: `${normalized}%` }} />
        </div>
        <span className="font-mono text-xs font-semibold text-stone-700">{normalized}%</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {showLabel && (
        <div className="flex items-center justify-between text-xs text-stone-600">
          <span className="flex items-center gap-1 font-medium">
            System Confidence
            <span
              title="Metric representing system certainty in the evidentiary cross-examination, NOT probability that the claim is true."
              className="cursor-help text-stone-400 hover:text-stone-600"
            >
              <HelpCircle size={12} />
            </span>
          </span>
          <span className={`px-2 py-0.5 rounded border text-[11px] font-mono ${badgeColor}`}>
            {normalized}% • {tierText}
          </span>
        </div>
      )}
      <div className="w-full h-2.5 bg-stone-200 rounded-full overflow-hidden relative">
        <div
          className={`h-full transition-all duration-700 ease-out ${colorClass}`}
          style={{ width: `${normalized}%` }}
        />
      </div>
    </div>
  );
};
