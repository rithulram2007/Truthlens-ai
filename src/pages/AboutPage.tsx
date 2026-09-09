import React from 'react';
import {
  Shield,
  Layers,
  Cpu,
  Terminal,
  Code2,
  FileCode,
  Sparkles,
  Award,
  BookMarked,
  Copy,
  Check,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const [copied, setCopied] = React.useState(false);

  const bibtex = `@software{truthlens2025,
  title = {TruthLens: An Evidence-Grounded AI Misinformation & Claim Verification Platform},
  author = {TruthLens Academic Laboratory},
  year = {2025},
  note = {Full-stack verification system with Tavily Search and Gemini 3.8 Flash},
  url = {https://github.com/academic/truthlens}
}`;

  const copyBibtex = () => {
    navigator.clipboard.writeText(bibtex);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const architecturalModules = [
    {
      name: 'Frontend Presentation Layer',
      tech: 'React 19 + TypeScript + Tailwind CSS + Recharts + Lucide',
      role: 'Academic dashboard, interactive 10-stage pipeline visualizer, verification charts, source comparison matrix, and printable report modal.',
    },
    {
      name: 'Backend Controller & Server',
      tech: 'Node.js + Express 4 + Vite Middleware',
      role: 'RESTful verification endpoints on port 3000, request throttling, error handling, and server-side secret isolation.',
    },
    {
      name: 'Article & URL Ingestion Layer',
      tech: 'DOM Parser + Meta Extractor + HTML Sanitizer',
      role: 'Detects input mode, fetches remote URLs with timeout guards, extracts author/publisher/date tags without synthesizing missing data.',
    },
    {
      name: 'Claim Decomposition Engine',
      tech: 'Gemini 3.8 Flash Structured Schema Extractor',
      role: 'Decomposes articles into discrete claims, classifies into 10 domains, and filters subjective opinions from empirical assertions.',
    },
    {
      name: 'Modular Evidence Retrieval Layer',
      tech: 'Tavily Search API + Domain Indexer',
      role: 'Queries live indexes to obtain real-world primary sources and authoritative citations with genuine URLs, published dates, and content snippets.',
    },
    {
      name: 'Source Assessment & Ranking Engine',
      tech: 'Deterministic Tier Evaluation + Domain Matcher',
      role: 'Scores domains across 5 institutional tiers (Gov, Academic, Primary, News, Fact-Checkers), ranking and deduplicating citations.',
    },
    {
      name: 'Evidence-Bounded Verification Engine',
      tech: 'Structured JSON Synthesizer + Conflict Detector',
      role: 'Restricts reasoning strictly to retrieved evidence, classifies canonical verdicts (SUPPORTED, CONTRADICTED, INSUFFICIENT), and computes confidence.',
    },
    {
      name: 'Dossier & Audit Persistence Layer',
      tech: 'Local Key-Value Storage + JSON Exporter',
      role: 'Maintains historical verification audits, print stylesheets, and academic JSON dossiers.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="space-y-2 border-b border-stone-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-mono text-stone-500 uppercase tracking-wider">
          <Shield size={14} className="text-amber-600" />
          <span>Project Information • Academic Viva Dossier</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
          About TruthLens
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed font-sans max-w-3xl">
          TruthLens is an academic misinformation and claim verification system engineered to bridge
          the gap between large language model reasoning and empirical journalistic fact-checking standards.
        </p>
      </div>

      {/* Project Background & Motivation */}
      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold text-stone-900 tracking-tight">
          Project Motivation & Scientific Purpose
        </h2>
        <div className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
          <p>
            In contemporary information ecosystems, automated misinformation detection has largely relied
            either on static database lookups (which cannot address newly emerging claims) or generic generative
            chatbots (which frequently hallucinate, lack primary citations, and fail to distinguish absence of
            evidence from falsehood).
          </p>
          <p>
            TruthLens was developed as an academic capstone project to demonstrate an evidence-grounded
            alternative. By constraining Gemini 3.8 Flash to a multi-stage deterministic pipeline—where claims
            are isolated, sources are cross-examined, and institutional tiers are assessed before any verdict is
            rendered—TruthLens delivers transparent, verifiable, and academically defensible verdicts.
          </p>
        </div>
      </section>

      {/* Architectural Separation of Concerns */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-semibold text-stone-900 tracking-tight">
            Modular Architecture Breakdown
          </h2>
          <span className="text-xs font-mono text-stone-500 bg-stone-100 px-2.5 py-1 rounded border border-stone-200">
            8 Isolated Subsystems
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {architecturalModules.map((mod, idx) => (
            <div
              key={idx}
              className="bg-white border border-stone-200 rounded-xl p-4 space-y-2 text-xs shadow-xs"
            >
              <div className="flex items-center justify-between gap-2 border-b border-stone-100 pb-2">
                <span className="font-mono font-bold text-stone-900">{mod.name}</span>
                <span className="font-mono text-[10px] text-stone-400">MOD-0{idx + 1}</span>
              </div>
              <div className="text-stone-500 font-mono text-[11px]">{mod.tech}</div>
              <p className="text-stone-700 leading-relaxed">{mod.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security & Secret Handling */}
      <section className="space-y-4">
        <h2 className="font-serif text-2xl font-semibold text-stone-900 tracking-tight">
          Security & API Key Isolation
        </h2>
        <div className="bg-stone-900 text-stone-100 rounded-xl p-6 space-y-3 text-xs leading-relaxed">
          <div className="flex items-center gap-2 text-amber-400 font-mono uppercase font-bold text-[11px]">
            <Terminal size={14} />
            <span>Strict Server-Side Key Containment</span>
          </div>
          <p className="text-stone-300">
            TruthLens adheres strictly to enterprise and academic security practices. All Gemini 3.8 Flash SDK
            invocations and Tavily Search API queries occur strictly on the server-side via Node.js (<code className="text-amber-200">process.env.GEMINI_API_KEY</code> and <code className="text-amber-200">process.env.TAVILY_API_KEY</code>).
            No API keys, credentials, or private headers are ever exposed to the client-side JavaScript bundle.
          </p>
        </div>
      </section>

      {/* Citation Block */}
      <section className="space-y-3">
        <h2 className="font-serif text-xl font-semibold text-stone-900 tracking-tight">
          Academic Citation (BibTeX)
        </h2>
        <div className="relative bg-stone-100 border border-stone-300 rounded-xl p-4 font-mono text-xs text-stone-800 overflow-x-auto">
          <pre>{bibtex}</pre>
          <button
            type="button"
            onClick={copyBibtex}
            className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-stone-200 border border-stone-300 text-[11px] font-medium transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check size={12} className="text-emerald-600" />
                <span className="text-emerald-700">Copied</span>
              </>
            ) : (
              <>
                <Copy size={12} />
                <span>Copy BibTeX</span>
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
};
