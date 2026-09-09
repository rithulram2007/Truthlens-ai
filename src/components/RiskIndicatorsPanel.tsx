import React from 'react';
import { RiskIndicator } from '../types';
import { AlertCircle, AlertTriangle, Info, ShieldAlert } from 'lucide-react';

interface RiskIndicatorsPanelProps {
  indicators: RiskIndicator[];
}

export const RiskIndicatorsPanel: React.FC<RiskIndicatorsPanelProps> = ({ indicators }) => {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs space-y-4">
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-stone-200">
        <div>
          <h3 className="font-serif text-base font-semibold text-stone-900 flex items-center gap-2">
            <ShieldAlert size={18} className="text-amber-600" />
            Potential Rhetorical & Evidentiary Risk Indicators
          </h3>
          <p className="text-xs text-stone-500">
            Heuristic detection of linguistic framing, statistical ambiguity, and missing citations
          </p>
        </div>
        <span className="font-mono text-xs px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold shrink-0">
          {indicators.length} Flagged
        </span>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3 text-xs text-amber-900 flex items-start gap-2.5">
        <Info size={16} className="text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-semibold">Academic Epistemic Caveat:</strong> Risk indicators are
          heuristic flags identifying stylistic, rhetorical, or structural patterns (such as sensational
          vocabulary or unanchored statistics). These are <strong>strictly indicators and NOT proof of misinformation</strong>.
          Claims must always be judged by verifiable empirical evidence.
        </p>
      </div>

      {indicators.length === 0 ? (
        <div className="py-6 text-center text-xs text-stone-500 italic bg-stone-50 rounded-lg border border-dashed border-stone-200">
          No prominent rhetorical risk indicators or sensational markers detected in the submitted material.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {indicators.map((risk) => {
            const isHigh = risk.severity === 'high';
            const isMedium = risk.severity === 'medium';

            const badgeBg = isHigh
              ? 'bg-rose-50 text-rose-800 border-rose-200'
              : isMedium
              ? 'bg-amber-50 text-amber-800 border-amber-200'
              : 'bg-stone-100 text-stone-700 border-stone-200';

            return (
              <div
                key={risk.id}
                className="bg-stone-50 border border-stone-200 rounded-lg p-3.5 space-y-2 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="font-semibold text-stone-900 text-xs">{risk.title}</span>
                    <span
                      className={`font-mono text-[10px] uppercase px-2 py-0.5 rounded border font-semibold ${badgeBg}`}
                    >
                      {risk.severity} severity
                    </span>
                  </div>

                  <p className="text-stone-600 leading-relaxed">{risk.description}</p>
                </div>

                {risk.excerpt && (
                  <div className="pt-2 border-t border-stone-200/60 font-mono text-[11px] text-stone-700">
                    <span className="text-stone-400">Excerpt: </span>
                    <span className="bg-white px-1.5 py-0.5 rounded border border-stone-200 text-stone-900">
                      "{risk.excerpt}"
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
