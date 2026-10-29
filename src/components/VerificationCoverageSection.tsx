import React from 'react';
import { VerificationCoverageData, FactualComponentStatus } from '../types';
import { CheckCircle2, XCircle, HelpCircle, Layers, AlertCircle } from 'lucide-react';

interface VerificationCoverageSectionProps {
  coverage?: VerificationCoverageData;
}

export const VerificationCoverageSection: React.FC<VerificationCoverageSectionProps> = ({ coverage }) => {
  if (!coverage || coverage.components.length === 0) {
    return (
      <div className="bg-white border border-stone-200 rounded-lg p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-stone-700 flex items-center gap-1.5">
            <Layers size={14} className="text-stone-600" />
            Verification Coverage
          </span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
            Coverage: UNKNOWN
          </span>
        </div>
        <p className="text-xs text-stone-500 italic">
          No distinct factual sub-components could be evaluated for this statement.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: FactualComponentStatus) => {
    switch (status) {
      case 'SUPPORTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-emerald-50 text-emerald-800 border border-emerald-300">
            <CheckCircle2 size={11} className="text-emerald-600" />
            SUPPORTED
          </span>
        );
      case 'CONTRADICTED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-rose-50 text-rose-800 border border-rose-300">
            <XCircle size={11} className="text-rose-600" />
            CONTRADICTED
          </span>
        );
      case 'INSUFFICIENT EVIDENCE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-amber-50 text-amber-800 border border-amber-300">
            <AlertCircle size={11} className="text-amber-600" />
            INSUFFICIENT EVIDENCE
          </span>
        );
      case 'UNKNOWN':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-stone-100 text-stone-700 border border-stone-300">
            <HelpCircle size={11} className="text-stone-500" />
            UNKNOWN
          </span>
        );
    }
  };

  const coverageDisplay =
    coverage.coverageScore !== null
      ? `${coverage.coverageScore}%`
      : 'UNKNOWN';

  const isFull = coverage.coverageScore === 100;
  const isPartial = coverage.coverageScore !== null && coverage.coverageScore > 0 && coverage.coverageScore < 100;

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-4 space-y-4">
      {/* Header and Overall Score */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
              <Layers size={14} className="text-stone-700" />
              Verification Coverage
            </span>
            <span className="text-[11px] font-mono text-stone-500">
              ({coverage.componentsCount} factual component{coverage.componentsCount === 1 ? '' : 's'} detected)
            </span>
          </div>
          <p className="text-[11px] text-stone-500">
            Deconstructs compound propositions to evaluate which individual assertions are substantiated by retrieved evidence.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isFull ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-900 border border-emerald-300 font-mono text-xs font-semibold">
              Coverage: 100%
            </span>
          ) : isPartial ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-amber-50 text-amber-900 border border-amber-300 font-mono text-xs font-semibold">
              Verification Coverage: {coverageDisplay} · PARTIALLY VERIFIED
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-stone-100 text-stone-800 border border-stone-300 font-mono text-xs font-semibold">
              Coverage: {coverageDisplay}
            </span>
          )}
        </div>
      </div>

      {/* Component List */}
      <div className="space-y-2.5">
        {coverage.components.map((comp, idx) => (
          <div
            key={comp.id || idx}
            className="p-3 rounded-lg border border-stone-200 bg-stone-50/70 hover:bg-stone-50 transition-colors space-y-1.5 text-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start gap-2 flex-1">
                <span className="font-mono font-bold text-stone-500 shrink-0 mt-0.5">
                  {idx + 1}.
                </span>
                <span className="font-medium text-stone-900 leading-snug">
                  {comp.componentText}
                </span>
              </div>
              <div className="shrink-0">
                {getStatusBadge(comp.status)}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-200/60 text-[11px] font-mono text-stone-500">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  Supporting evidence: <strong className="text-emerald-700">{comp.supportingEvidenceCount}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  Contradicting evidence: <strong className="text-rose-700">{comp.contradictingEvidenceCount}</strong>
                </span>
              </div>
              {comp.evidenceStatus && (
                <span className="text-stone-600 italic font-sans truncate max-w-md">
                  {comp.evidenceStatus}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
