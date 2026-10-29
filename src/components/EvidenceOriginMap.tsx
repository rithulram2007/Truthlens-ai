import React from 'react';
import { IndependentEvidenceCorroboration, SourceItem, SourceOriginRelationship } from '../types';
import { Network, ExternalLink, HelpCircle, GitCommit, FileText, CornerDownRight } from 'lucide-react';

interface EvidenceOriginMapProps {
  claimText: string;
  iec?: IndependentEvidenceCorroboration;
  sources: SourceItem[];
}

export const EvidenceOriginMap: React.FC<EvidenceOriginMapProps> = ({
  claimText,
  iec,
  sources,
}) => {
  const getRelationshipBadge = (type?: SourceOriginRelationship) => {
    switch (type) {
      case 'Independent':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-emerald-50 text-emerald-800 border border-emerald-300">
            Independent
          </span>
        );
      case 'Derivative':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-purple-50 text-purple-800 border border-purple-300">
            Derivative
          </span>
        );
      case 'Same Origin':
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-sky-50 text-sky-800 border border-sky-300">
            Same Origin
          </span>
        );
      case 'Unknown':
      default:
        return (
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-stone-100 text-stone-700 border border-stone-300">
            Unknown
          </span>
        );
    }
  };

  const groups = iec?.groups && iec.groups.length > 0 ? iec.groups : null;

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-4 space-y-4">
      {/* Title & Subtitle */}
      <div className="pb-3 border-b border-stone-100 space-y-0.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-semibold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
            <Network size={14} className="text-stone-700" />
            Evidence Origin Map
          </span>
          <span className="text-[11px] font-mono text-stone-500">
            Claim → Evidence Origins → Sources
          </span>
        </div>
        <p className="text-xs text-stone-600 font-sans">
          Shows how retrieved sources may relate to distinct evidence origins.
        </p>
      </div>

      {/* Origin Tree Flow */}
      <div className="space-y-4 font-sans">
        {/* Level 1: Root Claim Node */}
        <div className="p-3 rounded-lg border-2 border-stone-800 bg-stone-900 text-white shadow-xs space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-stone-300 uppercase tracking-wider">
            <span>Root Claim</span>
            <span className="text-stone-400">Target of Corroboration</span>
          </div>
          <p className="font-serif text-sm font-semibold text-stone-100">
            "{claimText}"
          </p>
        </div>

        {/* Level 2 & 3: Evidence Origins & Their Sources */}
        {groups && groups.length > 0 ? (
          <div className="relative pl-3 sm:pl-6 space-y-4 border-l-2 border-dashed border-stone-300 ml-3 sm:ml-4">
            {groups.map((group, gIdx) => (
              <div key={group.id || gIdx} className="relative space-y-2.5">
                {/* Horizontal branch from tree stem */}
                <div className="absolute -left-[13px] sm:-left-[25px] top-4 w-3 sm:w-6 h-0.5 bg-stone-300" />

                {/* Evidence Origin Node */}
                <div className="bg-stone-50 border border-stone-300 rounded-lg p-3 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span className="text-xs font-mono font-bold text-stone-900 flex items-center gap-1.5">
                      <GitCommit size={14} className="text-stone-700" />
                      {group.originName}
                    </span>
                    <span className="text-[10px] font-mono text-stone-500 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                      {group.sources.length} source{group.sources.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  {group.description && (
                    <p className="text-[11px] text-stone-600 font-sans">
                      {group.description}
                    </p>
                  )}
                </div>

                {/* Level 3: Leaf Sources under this Origin */}
                <div className="pl-4 sm:pl-6 space-y-2 border-l border-stone-200 ml-3">
                  {group.sources.map((src, sIdx) => (
                    <div
                      key={src.id || sIdx}
                      className="bg-white border border-stone-200 rounded-md p-2.5 text-xs space-y-1 hover:border-stone-300 transition-colors"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          <CornerDownRight size={12} className="text-stone-400 shrink-0" />
                          <span className="font-mono font-semibold text-stone-800">
                            {src.sourceName || src.domain}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getRelationshipBadge(src.evidenceOrigin)}
                          {src.url && (
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-stone-400 hover:text-stone-700 inline-flex items-center gap-0.5 text-[11px]"
                              title="Open original publication"
                            >
                              <ExternalLink size={11} />
                            </a>
                          )}
                        </div>
                      </div>

                      {src.title && (
                        <div className="text-[11px] text-stone-600 leading-snug pl-4">
                          {src.title}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Fallback direct listing if no groups established */
          <div className="pl-4 space-y-2 border-l-2 border-dashed border-stone-300 ml-3">
            <div className="text-xs text-stone-500 italic p-2 bg-stone-50 rounded border border-stone-200">
              Provenance origin relationships could not be determined reliably from retrieved search metadata.
            </div>
            {sources.map((src, sIdx) => (
              <div
                key={src.id || sIdx}
                className="bg-white border border-stone-200 rounded p-2 text-xs flex items-center justify-between"
              >
                <div className="font-mono font-medium text-stone-800">
                  {src.sourceName || src.domain}
                </div>
                {getRelationshipBadge(src.evidenceOrigin || 'Unknown')}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Uncertainty Notice */}
      <div className="text-[10px] font-mono text-stone-500 pt-2 border-t border-stone-100 flex items-center gap-1.5">
        <HelpCircle size={12} className="text-stone-400 shrink-0" />
        <span>
          Origin classifications rely on attribution heuristics, publisher domains, and text excerpts. When uncertain, relationships are marked Unknown.
        </span>
      </div>
    </div>
  );
};
