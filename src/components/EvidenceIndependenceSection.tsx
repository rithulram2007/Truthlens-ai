import React from 'react';
import { IndependentEvidenceCorroboration, CorroborationLevel } from '../types';
import { GitFork, ShieldAlert, ShieldCheck, HelpCircle, Info, Sparkles } from 'lucide-react';

interface EvidenceIndependenceSectionProps {
  iec?: IndependentEvidenceCorroboration;
}

export const EvidenceIndependenceSection: React.FC<EvidenceIndependenceSectionProps> = ({ iec }) => {
  if (!iec) {
    return null;
  }

  const getCorroborationBadge = (level: CorroborationLevel) => {
    switch (level) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-50 text-emerald-900 border border-emerald-300 font-mono text-xs font-semibold">
            <ShieldCheck size={13} className="text-emerald-600" />
            HIGH CORROBORATION
          </span>
        );
      case 'MODERATE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-sky-50 text-sky-900 border border-sky-300 font-mono text-xs font-semibold">
            <GitFork size={13} className="text-sky-600" />
            MODERATE CORROBORATION
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-300 font-mono text-xs font-semibold">
            <ShieldAlert size={13} className="text-amber-600" />
            LOW CORROBORATION
          </span>
        );
      case 'UNKNOWN / LIMITED PROVENANCE':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-stone-100 text-stone-700 border border-stone-300 font-mono text-xs font-semibold">
            <HelpCircle size={13} className="text-stone-500" />
            UNKNOWN / LIMITED PROVENANCE
          </span>
        );
    }
  };

  const scoreText =
    iec.score !== null ? `${iec.score}% Independent Evidence` : 'UNKNOWN / LIMITED PROVENANCE';

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-4 space-y-4">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
              <GitFork size={14} className="text-stone-700" />
              Evidence Independence (IEC)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 border border-stone-200">
              TruthLens project-specific metric
            </span>
          </div>
          <p className="text-[11px] text-stone-500">
            Source count alone does not guarantee independent corroboration. TruthLens estimates whether supporting sources represent distinct evidence origins.
          </p>
        </div>

        <div className="self-start sm:self-auto shrink-0">
          {getCorroborationBadge(iec.corroborationLevel)}
        </div>
      </div>

      {/* Primary 5-Metric Breakdown */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5 space-y-0.5">
          <div className="text-[10px] font-mono uppercase text-stone-500">Sources Retrieved</div>
          <div className="font-serif text-lg font-bold text-stone-900">
            {iec.sourcesRetrieved}
          </div>
          <div className="text-[10px] text-stone-500">Total cataloged URLs</div>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5 space-y-0.5">
          <div className="text-[10px] font-mono uppercase text-stone-500">Independent Origins</div>
          <div className="font-serif text-lg font-bold text-emerald-800">
            {iec.independentOriginsCount}
          </div>
          <div className="text-[10px] text-stone-500">Distinct primary sources</div>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5 space-y-0.5">
          <div className="text-[10px] font-mono uppercase text-stone-500">Potentially Derivative</div>
          <div className="font-serif text-lg font-bold text-stone-700">
            {iec.derivativeSourcesCount}
          </div>
          <div className="text-[10px] text-stone-500">Syndicated / shared entity</div>
        </div>

        <div className="bg-stone-50 border border-stone-200 rounded-lg p-2.5 space-y-0.5">
          <div className="text-[10px] font-mono uppercase text-stone-500">Evidence Score</div>
          <div className="font-serif text-lg font-bold text-stone-900">
            {iec.score !== null ? `${iec.score}%` : 'N/A'}
          </div>
          <div className="text-[10px] text-stone-500">
            {iec.score !== null ? 'EIS metric' : 'Limited provenance'}
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-stone-50 border border-stone-200 rounded-lg p-2.5 space-y-0.5">
          <div className="text-[10px] font-mono uppercase text-stone-500">Corroboration Level</div>
          <div className="font-serif text-sm font-bold text-stone-900 pt-1">
            {iec.corroborationLevel.replace(' CORROBORATION', '')}
          </div>
          <div className="text-[10px] text-stone-500">Independence tier</div>
        </div>
      </div>

      {/* Dual Confidence Display (Base Confidence vs Adjusted Confidence) */}
      <div className="bg-stone-50/70 border border-stone-200 rounded-lg p-3 space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-[11px] font-mono text-stone-500 uppercase">Base Confidence: </span>
              <span className="font-mono font-bold text-stone-900">{iec.baseConfidence}%</span>
            </div>
            <span className="text-stone-300">•</span>
            <div>
              <span className="text-[11px] font-mono text-stone-500 uppercase">Independent Evidence Score: </span>
              <span className="font-mono font-semibold text-stone-800">
                {iec.score !== null ? `${iec.score}%` : 'UNKNOWN'}
              </span>
            </div>
            <span className="text-stone-300">•</span>
            <div>
              <span className="text-[11px] font-mono text-stone-500 uppercase">Adjusted Confidence: </span>
              <span className="font-mono font-bold text-emerald-800">{iec.adjustedConfidence}%</span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-stone-400">
            Formula: Base × (0.7 + 0.3 × EIS)
          </span>
        </div>

        {iec.provenanceNotes && (
          <p className="text-xs text-stone-600 font-sans leading-relaxed border-t border-stone-200/60 pt-2">
            {iec.provenanceNotes}
          </p>
        )}
      </div>

      {/* Mandatory User Explanation Safeguard */}
      <div className="bg-amber-50/50 border border-amber-200/80 rounded-lg p-3 text-[11px] text-amber-900 space-y-1">
        <div className="flex items-center gap-1.5 font-semibold text-amber-950 font-mono uppercase text-[10px]">
          <Info size={13} className="text-amber-700 shrink-0" />
          Methodology & Provenance Notice
        </div>
        <p className="leading-relaxed">
          Evidence origin relationships are estimated from available source information and may be uncertain. Different domains do not necessarily represent independent evidence. The Independent Evidence Score (EIS) is a TruthLens project-specific metric and not an established academic standard.
        </p>
      </div>
    </div>
  );
};
