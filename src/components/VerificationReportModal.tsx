import React from 'react';
import { VerificationResult } from '../types';
import { VerdictBadge } from './VerdictBadge';
import { ConfidenceMeter } from './ConfidenceMeter';
import { Download, Printer, X, Shield, FileCheck2, ExternalLink } from 'lucide-react';

interface VerificationReportModalProps {
  result: VerificationResult;
  onClose: () => void;
}

export const VerificationReportModal: React.FC<VerificationReportModalProps> = ({
  result,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(result, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `TruthLens-Verification-Report-${result.id}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 print:p-0 print:bg-white print:static">
      <div className="bg-white border border-stone-300 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden print:shadow-none print:border-none print:max-h-none print:w-full">
        {/* Modal Top Bar (Hidden during print) */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-100/70 print:hidden">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-stone-800" />
            <h2 className="font-serif text-sm font-bold text-stone-900 tracking-tight">
              TruthLens Academic Verification Report
            </h2>
            <span className="text-[11px] font-mono text-stone-500 bg-white px-2 py-0.5 rounded border border-stone-200">
              ID: {result.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportJSON}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-stone-50 text-stone-800 text-xs font-medium border border-stone-200 transition-colors cursor-pointer"
            >
              <Download size={13} />
              Export JSON
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-colors cursor-pointer"
            >
              <Printer size={13} />
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors ml-2 cursor-pointer"
              aria-label="Close Report"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Report Printable Document Body */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8 font-sans text-stone-900 print:p-0">
          {/* Header Block */}
          <div className="border-b-2 border-stone-900 pb-5 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 font-serif text-2xl font-bold text-stone-950 tracking-tight">
                <span>TRUTHLENS</span>
                <span className="text-xs font-sans font-normal px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200 uppercase tracking-widest">
                  Academic Report
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-1 font-serif italic">
                Evidence-Grounded Misinformation & Claim Verification Dossier
              </p>
            </div>
            <div className="text-xs font-mono text-stone-600 sm:text-right space-y-0.5">
              <div>Timestamp: {new Date(result.timestamp).toUTCString()}</div>
              <div>Input Mode: {result.inputType.toUpperCase()}</div>
              <div>Claims Evaluated: {result.claimsAnalyzedCount}</div>
            </div>
          </div>

          {/* Section 1: Executive Verdict Summary */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500 font-semibold">
                  Overall System Assessment
                </span>
                <div className="mt-1 flex items-center gap-3">
                  <VerdictBadge verdict={result.overallVerdict} size="lg" />
                </div>
              </div>

              <div className="w-full sm:w-64">
                <ConfidenceMeter score={result.overallConfidence} size="md" />
              </div>
            </div>

            {result.conflictSummary && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-900">
                <strong>Evidentiary Discrepancy Note: </strong>
                {result.conflictSummary}
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-stone-200/80 text-xs font-mono text-stone-700">
              <div>Supported: <span className="font-bold text-emerald-700">{result.counts.supported}</span></div>
              <div>Contradicted: <span className="font-bold text-rose-700">{result.counts.contradicted}</span></div>
              <div>Insufficient: <span className="font-bold text-amber-700">{result.counts.insufficient}</span></div>
              <div>Cataloged Sources: <span className="font-bold text-stone-900">{result.sourcesAnalyzedCount}</span></div>
            </div>
          </div>

          {/* Section 2: Input Material */}
          <div className="space-y-2">
            <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-stone-600 border-b border-stone-200 pb-1">
              1. Submitted Input Subject to Verification
            </h3>
            {result.articleMetadata?.title && (
              <div className="text-sm font-semibold text-stone-900 font-serif">
                Headline / Title: {result.articleMetadata.title}
              </div>
            )}
            {result.articleMetadata?.publisher && (
              <div className="text-xs text-stone-500 font-mono">
                Publisher: {result.articleMetadata.publisher}
                {result.articleMetadata.author && ` • Author: ${result.articleMetadata.author}`}
                {result.articleMetadata.publicationDate && ` • Date: ${result.articleMetadata.publicationDate}`}
              </div>
            )}
            <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs text-stone-800 font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
              {result.rawInput}
            </div>
          </div>

          {/* Section 3: Decomposed Claims & Findings */}
          <div className="space-y-4">
            <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-stone-600 border-b border-stone-200 pb-1">
              2. Claim-by-Claim Evidentiary Examination
            </h3>
            <div className="space-y-4">
              {result.claims.map((claim, idx) => (
                <div
                  key={claim.id}
                  className="border border-stone-200 rounded-lg p-4 space-y-3 bg-white text-xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-2">
                    <span className="font-mono font-bold text-stone-800">
                      Claim #{idx + 1} [{claim.category}]
                    </span>
                    <div className="flex items-center gap-2">
                      <VerdictBadge verdict={claim.verdict} size="sm" />
                      <span className="font-mono text-stone-500">
                        Certainty: {claim.confidence}%
                      </span>
                    </div>
                  </div>

                  <p className="font-serif text-sm font-semibold text-stone-950">
                    "{claim.claimText}"
                  </p>

                  <div className="text-stone-700 leading-relaxed font-sans">
                    <strong>Grounded Rationale: </strong>
                    {claim.reasoning}
                  </div>

                  {claim.supportingEvidence.length > 0 && (
                    <div className="text-emerald-900 bg-emerald-50/70 p-2 rounded border border-emerald-200">
                      <span className="font-semibold">Supporting: </span>
                      {claim.supportingEvidence.join('; ')}
                    </div>
                  )}

                  {claim.contradictingEvidence.length > 0 && (
                    <div className="text-rose-900 bg-rose-50/70 p-2 rounded border border-rose-200">
                      <span className="font-semibold">Contradicting: </span>
                      {claim.contradictingEvidence.join('; ')}
                    </div>
                  )}

                  {claim.conflicts.length > 0 && (
                    <div className="text-purple-900 bg-purple-50/70 p-2 rounded border border-purple-200">
                      <span className="font-semibold">Conflicting Reports: </span>
                      {claim.conflicts.join('; ')}
                    </div>
                  )}

                  {claim.sources.length > 0 && (
                    <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500">
                      <span className="font-semibold text-stone-700">Cited References: </span>
                      {claim.sources.map((s) => `${s.sourceName} (${s.tier})`).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Traceable Source Ledger */}
          <div className="space-y-3">
            <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-stone-600 border-b border-stone-200 pb-1">
              3. Traceable Source Registry ({result.aggregatedSources.length})
            </h3>
            <div className="divide-y divide-stone-200 text-xs font-mono">
              {result.aggregatedSources.map((s, sIdx) => (
                <div key={s.id} className="py-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <div className="font-bold text-stone-900 font-sans">
                      [{sIdx + 1}] {s.title}
                    </div>
                    <div className="text-stone-500 text-[11px]">
                      {s.sourceName} • {s.tier} • Assessment: {s.assessment} • Relevance: {s.relevance}%
                    </div>
                  </div>
                  {s.url && (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-stone-700 hover:text-stone-900 underline text-[11px] shrink-0"
                    >
                      {s.url.length > 40 ? s.url.substring(0, 40) + '...' : s.url}
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Risk Indicators & Methodological Caveats */}
          <div className="space-y-3 pt-3 border-t border-stone-200">
            <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-stone-600 border-b border-stone-200 pb-1">
              4. Epistemic Indicators & Academic Caveats
            </h3>
            <div className="text-xs text-stone-600 space-y-1.5 leading-relaxed">
              <p>
                <strong>Methodological Declaration:</strong> This report was generated by TruthLens using an
                epistemologically bounded multi-stage pipeline. Verification reasoning is constrained strictly to
                retrieved empirical evidence rather than ungrounded parameter weights. Absence of evidence is
                treated as <em>INSUFFICIENT EVIDENCE</em> rather than falsehood.
              </p>
              <p>
                <strong>Risk Indicator Clarification:</strong> Rhetorical markers (such as sensational language or missing attribution) are heuristic indicators only and do not establish misinformation independently of factual proof.
              </p>
            </div>
          </div>

          {/* Signoff / Academic Footer */}
          <div className="pt-6 border-t-2 border-stone-900 flex items-center justify-between text-[11px] font-mono text-stone-500">
            <div>TruthLens Verification Engine v1.0 • Academic Viva Edition</div>
            <div>Generated autonomously with Gemini 3.8 Flash Grounding</div>
          </div>
        </div>
      </div>
    </div>
  );
};
