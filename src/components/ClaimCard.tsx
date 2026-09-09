import React, { useState } from 'react';
import { ClaimVerification } from '../types';
import { VerdictBadge } from './VerdictBadge';
import { ConfidenceMeter } from './ConfidenceMeter';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Tag,
  FileQuestion,
  BookOpen,
} from 'lucide-react';

interface ClaimCardProps {
  claim: ClaimVerification;
  index: number;
  initiallyExpanded?: boolean;
}

export const ClaimCard: React.FC<ClaimCardProps> = ({
  claim,
  index,
  initiallyExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(initiallyExpanded);
  const [activeTab, setActiveTab] = useState<'evidence' | 'sources' | 'conflicts'>('evidence');

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs transition-all hover:border-stone-300">
      {/* Card Header (Summary Line) */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-stone-50/70 transition-colors"
      >
        <div className="flex items-start gap-3 flex-1">
          <span className="w-6 h-6 rounded bg-stone-100 border border-stone-200 text-stone-700 font-mono text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
            {index + 1}
          </span>
          <div className="space-y-1.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <VerdictBadge verdict={claim.verdict} size="sm" />
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                {claim.category}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-50 text-stone-500 border border-stone-200 capitalize">
                {claim.statementType} statement
              </span>
              {claim.conflicts.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                  <AlertTriangle size={11} />
                  Contested
                </span>
              )}
            </div>
            <h3 className="font-serif text-base font-semibold text-stone-900 leading-snug">
              "{claim.claimText}"
            </h3>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
          <div className="w-32">
            <ConfidenceMeter score={claim.confidence} size="sm" showLabel={false} />
          </div>
          <button
            type="button"
            className="p-1 rounded text-stone-400 hover:text-stone-700 transition-colors"
            aria-label={isExpanded ? 'Collapse claim' : 'Expand claim'}
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Card Body (Detailed Examination) */}
      {isExpanded && (
        <div className="border-t border-stone-200 bg-stone-50/40 p-4 sm:p-6 space-y-5">
          {/* AI Grounded Reasoning Explanation */}
          <div className="bg-white border border-stone-200 rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-stone-600 flex items-center gap-1.5">
                <BookOpen size={14} className="text-stone-600" />
                Evidence-Grounded Reasoning
              </span>
              <span className="text-[11px] font-mono text-stone-400">Grounded in retrieved evidence</span>
            </div>
            <p className="text-sm text-stone-800 leading-relaxed font-sans">{claim.reasoning}</p>
            {claim.evidenceSummary && (
              <div className="pt-2 border-t border-stone-100 text-xs text-stone-600">
                <span className="font-semibold text-stone-700">Evidence Summary: </span>
                {claim.evidenceSummary}
              </div>
            )}
          </div>

          {/* Sub-Tabs: Evidence Items / Sources / Conflict Detection */}
          <div className="space-y-3">
            <div className="flex border-b border-stone-200 gap-4 text-xs font-medium">
              <button
                type="button"
                onClick={() => setActiveTab('evidence')}
                className={`pb-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'evidence'
                    ? 'border-b-2 border-stone-900 text-stone-900 font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Evidence ({claim.supportingEvidence.length + claim.contradictingEvidence.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('sources')}
                className={`pb-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'sources'
                    ? 'border-b-2 border-stone-900 text-stone-900 font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Sources ({claim.sources.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('conflicts')}
                className={`pb-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  activeTab === 'conflicts'
                    ? 'border-b-2 border-stone-900 text-stone-900 font-semibold'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Conflict Detection ({claim.conflicts.length > 0 ? 'Flagged' : 'None'})
              </button>
            </div>

            {/* Tab 1: Evidentiary Findings */}
            {activeTab === 'evidence' && (
              <div className="space-y-3">
                {/* Supporting Evidence */}
                {claim.supportingEvidence.length > 0 && (
                  <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-3.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 font-mono uppercase">
                      <CheckCircle size={14} className="text-emerald-600" />
                      Supporting Evidence
                    </div>
                    <ul className="space-y-1 text-xs text-emerald-900 list-disc list-inside">
                      {claim.supportingEvidence.map((ev, i) => (
                        <li key={i} className="leading-relaxed">
                          {ev}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Contradicting Evidence */}
                {claim.contradictingEvidence.length > 0 && (
                  <div className="bg-rose-50/60 border border-rose-200 rounded-lg p-3.5 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-800 font-mono uppercase">
                      <XCircle size={14} className="text-rose-600" />
                      Contradicting Evidence
                    </div>
                    <ul className="space-y-1 text-xs text-rose-900 list-disc list-inside">
                      {claim.contradictingEvidence.map((ev, i) => (
                        <li key={i} className="leading-relaxed">
                          {ev}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {claim.supportingEvidence.length === 0 && claim.contradictingEvidence.length === 0 && (
                  <div className="bg-stone-100 border border-stone-200 rounded-lg p-3 text-xs text-stone-600 flex items-center gap-2">
                    <FileQuestion size={16} className="text-stone-400" />
                    <span>
                      No definitive empirical citations directly corroborating or contradicting this specific statement. Per academic guidelines, this is classified as <strong>INSUFFICIENT EVIDENCE</strong> rather than automatically false.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Traceable Sources */}
            {activeTab === 'sources' && (
              <div className="space-y-2">
                {claim.sources.length === 0 ? (
                  <p className="text-xs text-stone-500 italic">No external sources retrieved for this item.</p>
                ) : (
                  claim.sources.map((src) => (
                    <div
                      key={src.id}
                      className="bg-white border border-stone-200 rounded-lg p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase font-semibold ${
                              src.assessment === 'HIGH'
                                ? 'bg-sky-50 text-sky-800 border border-sky-200'
                                : src.assessment === 'MEDIUM'
                                ? 'bg-stone-100 text-stone-700 border border-stone-200'
                                : 'bg-amber-50 text-amber-800 border border-amber-200'
                            }`}
                          >
                            {src.assessment} Reliability
                          </span>
                          <span className="text-stone-500 font-mono text-[11px]">{src.tier}</span>
                          {src.publicationDate && (
                            <span className="text-stone-400 text-[11px]">
                              Published: {src.publicationDate}
                            </span>
                          )}
                        </div>
                        <div className="font-medium text-stone-900 leading-tight">
                          {src.title}
                        </div>
                        {src.excerpt && (
                          <div className="text-stone-600 text-[11px] italic bg-stone-50 p-1.5 rounded border border-stone-100">
                            "{src.excerpt}"
                          </div>
                        )}
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1.5 shrink-0">
                        <span className="text-[11px] font-mono text-stone-500">
                          Relevance: {src.relevance}%
                        </span>
                        {src.url && (
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-stone-100 hover:bg-stone-200 text-stone-800 text-[11px] font-medium transition-colors"
                          >
                            <span>Inspect Source</span>
                            <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Tab 3: Conflicts & Uncertainty */}
            {activeTab === 'conflicts' && (
              <div className="space-y-3">
                {claim.conflicts.length > 0 ? (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-3.5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-purple-900 font-mono uppercase">
                      <AlertTriangle size={14} className="text-purple-600" />
                      Conflicting Evidence Detected
                    </div>
                    <ul className="space-y-1 text-xs text-purple-950 list-disc list-inside">
                      {claim.conflicts.map((conf, cIdx) => (
                        <li key={cIdx}>{conf}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="bg-white border border-stone-200 rounded-lg p-3 text-xs text-stone-600">
                    No active conflicting assertions detected among retrieved peer sources.
                  </div>
                )}

                {claim.uncertainty && (
                  <div className="bg-stone-100 border border-stone-200 rounded-lg p-3 space-y-1 text-xs text-stone-700">
                    <div className="font-semibold text-stone-800 uppercase font-mono text-[11px]">
                      Epistemic Uncertainty Analysis:
                    </div>
                    <p>{claim.uncertainty}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
