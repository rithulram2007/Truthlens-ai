import React, { useState } from 'react';
import { VerificationResult } from '../types';
import { VerdictBadge } from '../components/VerdictBadge';
import { ConfidenceMeter } from '../components/ConfidenceMeter';
import { DashboardCharts } from '../components/DashboardCharts';
import { ClaimCard } from '../components/ClaimCard';
import { SourceComparisonTable } from '../components/SourceComparisonTable';
import { EvidenceTimeline } from '../components/EvidenceTimeline';
import { RiskIndicatorsPanel } from '../components/RiskIndicatorsPanel';
import { VerificationReportModal } from '../components/VerificationReportModal';
import {
  FileText,
  FileCheck2,
  Calendar,
  Layers,
  AlertTriangle,
  RotateCcw,
  Printer,
  ChevronRight,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import { PageTab } from '../components/Navbar';

interface ResultsPageProps {
  result: VerificationResult;
  onNewVerification: () => void;
  onNavigate: (page: PageTab) => void;
}

export const ResultsPage: React.FC<ResultsPageProps> = ({
  result,
  onNewVerification,
  onNavigate,
}) => {
  const [showReportModal, setShowReportModal] = useState(false);
  const [activeSection, setActiveSection] = useState<'claims' | 'charts' | 'sources' | 'timeline' | 'risks'>('claims');

  const formattedDate = new Date(result.timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Breadcrumb & Action Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-mono text-stone-500">
            <span className="hover:text-stone-800 cursor-pointer" onClick={() => onNavigate('home')}>
              Home
            </span>
            <ChevronRight size={12} />
            <span className="hover:text-stone-800 cursor-pointer" onClick={() => onNavigate('verify')}>
              Verify
            </span>
            <ChevronRight size={12} />
            <span className="text-stone-900 font-semibold">Result #{result.id.slice(-6)}</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
            Verification Results
          </h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={onNewVerification}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white hover:bg-stone-100 text-stone-700 text-xs font-medium border border-stone-200 transition-colors cursor-pointer"
          >
            <RotateCcw size={13} />
            <span>New Verification</span>
          </button>
          <button
            type="button"
            onClick={() => setShowReportModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-all shadow-xs cursor-pointer"
          >
            <FileCheck2 size={14} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Executive Verdict Banner */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-stone-200">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-stone-500 font-semibold">
                Verification Result
              </span>
              <span className="text-[11px] font-mono text-stone-400">
                • Verified at {formattedDate}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <VerdictBadge verdict={result.overallVerdict} size="lg" />
              {result.hasEvidenceConflict && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-900 border border-purple-300 font-mono text-xs font-semibold">
                  <AlertTriangle size={13} className="text-purple-600" />
                  Conflict Detected
                </span>
              )}
            </div>
            {result.conflictSummary && (
              <p className="text-xs text-purple-950 bg-purple-50/70 p-2.5 rounded-lg border border-purple-200 max-w-2xl leading-relaxed">
                {result.conflictSummary}
              </p>
            )}
          </div>

          {/* System Confidence Meter */}
          <div className="w-full lg:w-72 bg-stone-50 border border-stone-200 rounded-lg p-4">
            <ConfidenceMeter score={result.overallConfidence} size="lg" />
          </div>
        </div>

        {/* Metric Counter Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-stone-50 border border-stone-200 rounded-lg p-3.5 space-y-1">
            <span className="text-[11px] font-mono text-stone-500 uppercase">Claims Analyzed</span>
            <div className="font-serif text-2xl font-bold text-stone-900">
              {result.claimsAnalyzedCount}
            </div>
            <span className="text-[10px] text-stone-500">Atomic factual statements</span>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-lg p-3.5 space-y-1">
            <span className="text-[11px] font-mono text-stone-500 uppercase">Supported / Contradicted</span>
            <div className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-1.5">
              <span className="text-emerald-700">{result.counts.supported}</span>
              <span className="text-stone-300 font-normal">/</span>
              <span className="text-rose-700">{result.counts.contradicted}</span>
            </div>
            <span className="text-[10px] text-stone-500">
              {result.counts.insufficient} insufficient evidence
            </span>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-lg p-3.5 space-y-1">
            <span className="text-[11px] font-mono text-stone-500 uppercase">Sources Analyzed</span>
            <div className="font-serif text-2xl font-bold text-stone-900">
              {result.sourcesAnalyzedCount}
            </div>
            <span className="text-[10px] text-stone-500">Live authoritative citations</span>
          </div>

          <div className="bg-stone-50 border border-stone-200 rounded-lg p-3.5 space-y-1">
            <span className="text-[11px] font-mono text-stone-500 uppercase">Risk Indicators</span>
            <div className="font-serif text-2xl font-bold text-amber-700">
              {result.aggregatedRiskIndicators.length}
            </div>
            <span className="text-[10px] text-stone-500">Rhetorical markers flagged</span>
          </div>
        </div>

        {/* Input Text / URL Source Preview */}
        {result.articleMetadata && (result.articleMetadata.title || result.articleMetadata.url) && (
          <div className="pt-4 border-t border-stone-200 text-xs text-stone-700 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="font-semibold text-stone-900">Input Source: </span>
              <span>{result.articleMetadata.title || result.articleMetadata.url}</span>
              {result.articleMetadata.publisher && (
                <span className="text-stone-500 font-mono"> ({result.articleMetadata.publisher})</span>
              )}
            </div>
            {result.articleMetadata.publicationDate && (
              <span className="text-stone-500 font-mono">
                Published: {result.articleMetadata.publicationDate}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Section Navigation Tabs */}
      <div className="border-b border-stone-200 flex flex-wrap gap-2 text-xs font-medium">
        <button
          type="button"
          onClick={() => setActiveSection('claims')}
          className={`pb-3 px-1 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSection === 'claims'
              ? 'border-b-2 border-stone-900 text-stone-900 font-bold'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          Claim-by-Claim Analysis ({result.claims.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('sources')}
          className={`pb-3 px-1 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSection === 'sources'
              ? 'border-b-2 border-stone-900 text-stone-900 font-bold'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          Sources ({result.aggregatedSources.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('charts')}
          className={`pb-3 px-1 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSection === 'charts'
              ? 'border-b-2 border-stone-900 text-stone-900 font-bold'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          Analytics
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('timeline')}
          className={`pb-3 px-1 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSection === 'timeline'
              ? 'border-b-2 border-stone-900 text-stone-900 font-bold'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          Evidence Timeline ({result.timelineEvents.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveSection('risks')}
          className={`pb-3 px-1 transition-all cursor-pointer flex items-center gap-1.5 ${
            activeSection === 'risks'
              ? 'border-b-2 border-stone-900 text-stone-900 font-bold'
              : 'text-stone-500 hover:text-stone-900'
          }`}
        >
          Risk Indicators ({result.aggregatedRiskIndicators.length})
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="space-y-6">
        {activeSection === 'claims' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg font-semibold text-stone-900">
                  Extracted Claims
                </h3>
                <p className="text-xs text-stone-500">
                  Expand each claim to inspect evidence-grounded reasoning, citations, and source reliability
                </p>
              </div>
              <span className="text-xs font-mono text-stone-500 bg-stone-100 px-2.5 py-1 rounded border border-stone-200">
                {result.claims.length} Claims
              </span>
            </div>

            <div className="space-y-3">
              {result.claims.map((claim, idx) => (
                <ClaimCard
                  key={claim.id}
                  claim={claim}
                  index={idx}
                  initiallyExpanded={idx === 0}
                />
              ))}
            </div>
          </div>
        )}

        {activeSection === 'charts' && (
          <div className="space-y-4">
            <div>
              <h3 className="font-serif text-lg font-semibold text-stone-900">
                Visual Analytics Suite
              </h3>
              <p className="text-xs text-stone-500">
                Visualizations of verdict distribution, confidence variance, evidence stance, and source tiers
              </p>
            </div>
            <DashboardCharts claims={result.claims} sources={result.aggregatedSources} />
          </div>
        )}

        {activeSection === 'sources' && (
          <div className="space-y-4">
            <SourceComparisonTable sources={result.aggregatedSources} />
          </div>
        )}

        {activeSection === 'timeline' && (
          <div className="space-y-4">
            <EvidenceTimeline
              timelineEvents={result.timelineEvents}
              articleMetadata={result.articleMetadata}
            />
          </div>
        )}

        {activeSection === 'risks' && (
          <div className="space-y-4">
            <RiskIndicatorsPanel indicators={result.aggregatedRiskIndicators} />
          </div>
        )}
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <VerificationReportModal
          result={result}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  );
};
