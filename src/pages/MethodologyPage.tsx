import React from 'react';
import { PipelineVisualizer } from '../components/PipelineVisualizer';
import {
  BookOpen,
  Scale,
  ShieldCheck,
  AlertTriangle,
  BrainCircuit,
  FileCheck2,
  HelpCircle,
  Database,
  Calculator,
} from 'lucide-react';

export const MethodologyPage: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="space-y-2 border-b border-stone-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-stone-500 uppercase tracking-wider">
          <BookOpen size={14} className="text-amber-600" />
          <span>Academic Specification • Research Methodology</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
          TruthLens Epistemological Methodology
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed font-sans max-w-3xl">
          A rigorous academic framework for automated claim verification, evidentiary cross-examination,
          and conflict detection using Tavily Search API evidence retrieval with Gemini 3.8 Flash reasoning.
        </p>
      </div>

      {/* Section 1: Core Epistemological Philosophy */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-stone-900">
          <Scale size={20} className="text-stone-800" />
          <h2 className="font-serif text-2xl font-semibold tracking-tight">
            1. Core Epistemological Framework
          </h2>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <p>
            Standard AI chatbots frequently generate hallucinations or deliver binary "true/false"
            declarations without verifiable evidentiary grounding. TruthLens explicitly rejects this
            chatbot model. Instead, TruthLens adopts an <strong>evidence-bounded epistemology</strong> grounded in:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <strong>Popperian Falsifiability:</strong> Statements are decomposed into empirical assertions
              capable of being refuted or substantiated by verifiable observations or measurements.
            </li>
            <li>
              <strong>Peircean Fallibilism:</strong> Evidentiary conclusions are treated as open to revision
              upon the emergence of superior peer-reviewed or official counter-evidence.
            </li>
            <li>
              <strong>The Principle of Non-Fabrication:</strong> If publication dates, authors, or primary sources
              cannot be verified, TruthLens refuses to synthesize placeholder data.
            </li>
            <li>
              <strong>Strict Separation of Heuristic from Proof:</strong> Rhetorical markers (such as emotional
              wording) are flagged as risk indicators, but are never conflated with factual refutation.
            </li>
          </ul>
        </div>
      </section>

      {/* Section 2: Complete 10-Stage Pipeline */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-stone-900">
          <BrainCircuit size={20} className="text-stone-800" />
          <h2 className="font-serif text-2xl font-semibold tracking-tight">
            2. The 10-Stage Verification Pipeline
          </h2>
        </div>
        <PipelineVisualizer interactive={true} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-stone-700">
          <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-1.5">
            <span className="font-mono font-bold text-stone-900">Stage 01: Input Classification</span>
            <p>
              Auto-detects whether the submitted material is an isolated claim, a remote URL, or raw article text.
              For URLs, attempts safe HTML DOM extraction of publisher, date, and author tags without fabrication.
            </p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-1.5">
            <span className="font-mono font-bold text-stone-900">Stage 02: Claim Decomposition</span>
            <p>
              Segments dense journalistic text into atomic, verifiable claims. Categorizes claims across disciplines
              and isolates opinions, predictions, and aesthetic statements from empirical propositions.
            </p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-1.5">
            <span className="font-mono font-bold text-stone-900">Stage 03: Evidence Retrieval</span>
            <p>
              Queries live authoritative indexing systems via Tavily Search API with genuine URLs, published dates,
              and content snippets across government, academic, and global news domains.
            </p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-1.5">
            <span className="font-mono font-bold text-stone-900">Stage 04: Source Assessment Rubric</span>
            <p>
              Classifies every domain against an institutional credibility hierarchy, tagging sources with
              HIGH, MEDIUM, LOW, or UNKNOWN reliability indicators (treated as indicators, not absolute truth).
            </p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-1.5">
            <span className="font-mono font-bold text-stone-900">Stage 05: Evidence Ranking & Deduplication</span>
            <p>
              Sorts citations based on institutional tier weighting, semantic relevance, and domain freshness.
              Filters out duplicate syndications.
            </p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-1.5">
            <span className="font-mono font-bold text-stone-900">Stage 06: Claim-Evidence Cross-Examination</span>
            <p>
              Compares atomic assertions against the extracted excerpts to establish evidentiary stance:
              Supporting, Contradicting, Contextual, or Insufficient.
            </p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-1.5">
            <span className="font-mono font-bold text-stone-900">Stage 07: Conflict Detection</span>
            <p>
              Scrutinizes whether multiple authoritative sources yield divergent conclusions. Explicitly flags
              conflicts rather than coercing artificial unanimity.
            </p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-1.5">
            <span className="font-mono font-bold text-stone-900">Stage 08: Evidence-Bounded Gemini Reasoning</span>
            <p>
              Gemini 3.8 Flash synthesizes a structured academic rationale strictly referencing the retrieved
              evidentiary ledger, highlighting uncertainty boundaries.
            </p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-1.5">
            <span className="font-mono font-bold text-stone-900">Stage 09: Verdict & Confidence Calculation</span>
            <p>
              Assigns strictly one of the 3 canonical verdicts: SUPPORTED, CONTRADICTED, or INSUFFICIENT EVIDENCE.
              Computes mathematical system confidence based on corroboration depth.
            </p>
          </div>
          <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-1.5">
            <span className="font-mono font-bold text-stone-900">Stage 10: Traceable Audit Ledger</span>
            <p>
              Assembles the complete dossier with interactive charts, source comparison matrix, chronological
              timeline, and exportable academic verification report.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Verdict Taxonomy */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-stone-900">
          <FileCheck2 size={20} className="text-stone-800" />
          <h2 className="font-serif text-2xl font-semibold tracking-tight">
            3. Verdict Taxonomy & Absence of Evidence
          </h2>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4 text-xs sm:text-sm text-stone-700">
          <p>
            TruthLens enforces a disciplined 3-verdict taxonomy. A fourth composite verdict (
            <strong>CONFLICTING EVIDENCE</strong>) is rendered at the dossier level when high-tier sources
            fundamentally diverge:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="bg-emerald-50/70 border border-emerald-300 rounded-xl p-4 space-y-2">
              <span className="font-mono font-bold text-emerald-800 text-xs">SUPPORTED</span>
              <p className="text-xs text-emerald-950">
                The proposition is corroborated by authoritative primary documentation, regulatory filings, or
                peer-reviewed consensus without substantial credible contradiction.
              </p>
            </div>

            <div className="bg-rose-50/70 border border-rose-300 rounded-xl p-4 space-y-2">
              <span className="font-mono font-bold text-rose-800 text-xs">CONTRADICTED</span>
              <p className="text-xs text-rose-950">
                The proposition directly conflicts with established empirical records, scientific findings,
                or official public data from Tier-1/Tier-2 authorities.
              </p>
            </div>

            <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-4 space-y-2">
              <span className="font-mono font-bold text-amber-800 text-xs">INSUFFICIENT EVIDENCE</span>
              <p className="text-xs text-amber-950">
                Insufficient empirical records exist to confirm or refute the assertion.
                <strong> Absence of evidence alone does not establish that a claim is false.</strong>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4: 5-Tier Source Prioritization */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-stone-900">
          <Database size={20} className="text-stone-800" />
          <h2 className="font-serif text-2xl font-semibold tracking-tight">
            4. 5-Tier Source Prioritization Rubric
          </h2>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow-xs text-xs">
          <div className="p-4 bg-stone-50 border-b border-stone-200 text-stone-600">
            TruthLens prioritizes institutional authority, domain validation, and primary observation over secondary hearsay.
          </div>
          <div className="divide-y divide-stone-100">
            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-mono font-bold text-sky-800 uppercase">Tier 1: Government & Official Portals</span>
                <p className="text-stone-600 mt-0.5">
                  .gov, .mil, WHO, CDC, NASA, FDA, UN, judicial courts, and statutory regulatory bodies.
                </p>
              </div>
              <span className="font-mono text-[11px] px-2 py-1 rounded bg-sky-50 text-sky-800 border border-sky-200 font-bold self-start sm:self-auto">
                HIGH RELIABILITY
              </span>
            </div>

            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-mono font-bold text-sky-800 uppercase">Tier 2: Scientific & Academic Literature</span>
                <p className="text-stone-600 mt-0.5">
                  Nature, Science, Lancet, PubMed, Cell, arXiv, university repositories (.edu), and peer-reviewed journals.
                </p>
              </div>
              <span className="font-mono text-[11px] px-2 py-1 rounded bg-sky-50 text-sky-800 border border-sky-200 font-bold self-start sm:self-auto">
                HIGH RELIABILITY
              </span>
            </div>

            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-mono font-bold text-stone-800 uppercase">Tier 3: Primary Public Registries</span>
                <p className="text-stone-600 mt-0.5">
                  SEC filings, patent registers, legislative transcripts, court transcripts, and raw census datasets.
                </p>
              </div>
              <span className="font-mono text-[11px] px-2 py-1 rounded bg-stone-100 text-stone-800 border border-stone-200 font-bold self-start sm:self-auto">
                HIGH RELIABILITY
              </span>
            </div>

            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-mono font-bold text-stone-700 uppercase">Tier 4: Reputable News Agencies</span>
                <p className="text-stone-600 mt-0.5">
                  Reuters, Associated Press (AP), BBC, Agence France-Presse (AFP), NPR, and global wires with formal correction standards.
                </p>
              </div>
              <span className="font-mono text-[11px] px-2 py-1 rounded bg-stone-100 text-stone-700 border border-stone-200 font-bold self-start sm:self-auto">
                HIGH / MEDIUM
              </span>
            </div>

            <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-mono font-bold text-stone-600 uppercase">Tier 5: Established Research & Fact Checkers</span>
                <p className="text-stone-600 mt-0.5">
                  Pew Research Center, Brookings, FactCheck.org, Snopes, PolitiFact, and accredited IFCN signatories.
                </p>
              </div>
              <span className="font-mono text-[11px] px-2 py-1 rounded bg-stone-50 text-stone-600 border border-stone-200 font-bold self-start sm:self-auto">
                MEDIUM / HIGH
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Confidence Score Mathematics */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-stone-900">
          <Calculator size={20} className="text-stone-800" />
          <h2 className="font-serif text-2xl font-semibold tracking-tight">
            5. System Confidence Mathematical Formulation
          </h2>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <div className="p-3 bg-stone-100 rounded-lg font-mono text-xs text-stone-900 overflow-x-auto">
            Confidence(c) = BaseScore + w_tier(N_high) + w_corrob(S_agree) - w_conflict(C_flag) - w_uncertainty(U_gap)
          </div>
          <p>
            <strong>Critical Epistemic Distinction:</strong> System Confidence in TruthLens does{' '}
            <strong>NOT</strong> represent the subjective probability that a claim is true. Rather, it measures{' '}
            <strong>the system's certainty in the completeness and reliability of the evidentiary cross-examination</strong>.
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
            <li>
              <strong>High Confidence (80–100%):</strong> Multiple Tier-1/Tier-2 sources independently corroborate or decisively refute the specific claim with no unresolved conflicts.
            </li>
            <li>
              <strong>Moderate Confidence (60–79%):</strong> Credible journalistic reporting corroborated by secondary institutions, with minor semantic ambiguity.
            </li>
            <li>
              <strong>Partial Confidence (40–59%):</strong> Tentative reporting or presence of contested perspectives.
            </li>
            <li>
              <strong>Constrained Confidence (0–39%):</strong> Data scarcity or reliance on unverified blogs; properly labeled as <em>INSUFFICIENT EVIDENCE</em>.
            </li>
          </ul>
        </div>
      </section>

      {/* Section 6: Viva Defense & Limitations */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-stone-900">
          <AlertTriangle size={20} className="text-amber-600" />
          <h2 className="font-serif text-2xl font-semibold tracking-tight">
            6. Academic Limitations & Viva Defense Notes
          </h2>
        </div>
        <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-3 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <p>
            When defending TruthLens in an academic examination or project presentation, consider these known structural limitations:
          </p>
          <ol className="list-decimal list-inside space-y-2 pl-2 text-xs">
            <li>
              <strong>Ephemeral Paywalls & Scraping Blocks:</strong> Certain proprietary journalistic outlets block automated retrieval. TruthLens handles this gracefully by flagging the fetch limitation and falling back to referenced entity retrieval.
            </li>
            <li>
              <strong>Temporal Lag in Scientific Consensus:</strong> Fast-evolving emerging crises (e.g. initial weeks of an epidemic) naturally exhibit high rates of <em>CONFLICTING EVIDENCE</em> until replication studies conclude.
            </li>
            <li>
              <strong>Value Judgments & Metaphysics:</strong> Moral, philosophical, or aesthetic assertions cannot be verified through empirical documentation and are properly categorized as subjective statements.
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
};
