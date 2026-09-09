import React from 'react';
import { PipelineVisualizer } from '../components/PipelineVisualizer';
import {
  ShieldCheck,
  Search,
  ArrowRight,
  Database,
  Layers,
  Scale,
  BrainCircuit,
  FileText,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { PageTab } from '../components/Navbar';

interface HomePageProps {
  onNavigate: (page: PageTab) => void;
  onSelectSample: (sampleText: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectSample }) => {
  const sampleScenarios = [
    {
      title: 'Historical Discovery',
      type: 'Single Factual Claim',
      text: 'Penicillin was discovered by Alexander Fleming in 1928 after mold contaminated a Staphylococcus culture plate.',
      expectedVerdict: 'SUPPORTED',
      category: 'Science',
    },
    {
      title: 'Popular Space Myth',
      type: 'Single Factual Claim',
      text: 'The Great Wall of China is clearly visible from the Moon with the naked human eye.',
      expectedVerdict: 'CONTRADICTED',
      category: 'Science / History',
    },
    {
      title: 'Complex Lifecycle Debate',
      type: 'Technical Comparison',
      text: 'Electric vehicles have a higher lifetime carbon footprint than internal combustion engine vehicles when battery manufacturing is included.',
      expectedVerdict: 'CONFLICTING EVIDENCE',
      category: 'Environment / Tech',
    },
    {
      title: 'Fictitious Archeological Claim',
      type: 'Unproven Assertion',
      text: 'Ancient Roman engineers regularly used piezoelectric quartz energy generators inside their aqueduct tunnels.',
      expectedVerdict: 'INSUFFICIENT EVIDENCE',
      category: 'History',
    },
  ];

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <section className="bg-white border-b border-stone-200 py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-100 border border-stone-200 text-stone-700 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Academic Research & Epistemic Fact-Checking Engine
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-stone-950 tracking-tight leading-tight max-w-3xl mx-auto">
            Evidence-Grounded Misinformation & Claim Verification
          </h1>

          <p className="text-base sm:text-lg text-stone-600 max-w-2xl mx-auto font-sans leading-relaxed">
            TruthLens is an academic platform designed to dismantle misinformation through a
            10-stage verifiable pipeline: decomposing text into atomic claims, querying live authoritative
            sources, assessing source credibility, and performing grounded reasoning with Gemini 3.8 Flash.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => onNavigate('verify')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm transition-all shadow-sm hover:shadow cursor-pointer"
            >
              <Search size={16} />
              <span>Verify Claim or Article</span>
              <ArrowRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('methodology')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-medium text-sm border border-stone-200 transition-colors cursor-pointer"
            >
              <Scale size={16} />
              <span>Epistemological Methodology</span>
            </button>
          </div>

          {/* Core Philosophy Banner */}
          <div className="pt-4 max-w-xl mx-auto">
            <div className="text-xs text-stone-500 font-mono bg-stone-50 border border-stone-200 rounded-lg p-2.5 flex items-center justify-center gap-2">
              <AlertCircle size={14} className="text-stone-400 shrink-0" />
              <span>
                <strong>Non-Chatbot Architecture:</strong> Answers are bounded strictly by retrieved empirical citations, never hallucinated knowledge.
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive 10-Stage Pipeline Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
              The Verification Pipeline
            </h2>
            <p className="text-xs text-stone-600">
              Traceable flow from raw user input to final verifiable dossier
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('methodology')}
            className="text-xs font-mono text-stone-600 hover:text-stone-900 underline flex items-center gap-1 cursor-pointer"
          >
            Detailed Rubrics & Math
            <ArrowRight size={12} />
          </button>
        </div>

        <PipelineVisualizer interactive={true} />
      </section>

      {/* Preset Academic Test Scenarios */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 tracking-tight">
            Academic Benchmark Scenarios
          </h2>
          <p className="text-xs text-stone-600">
            Click any curated benchmark to observe how the engine decomposes claims, tests evidence, and detects conflicts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sampleScenarios.map((scenario, idx) => (
            <div
              key={idx}
              onClick={() => {
                onSelectSample(scenario.text);
                onNavigate('verify');
              }}
              className="bg-white border border-stone-200 hover:border-stone-400 rounded-xl p-5 shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-mono text-stone-500 uppercase">
                    {scenario.type}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                      scenario.expectedVerdict === 'SUPPORTED'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : scenario.expectedVerdict === 'CONTRADICTED'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : scenario.expectedVerdict === 'CONFLICTING EVIDENCE'
                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    Target: {scenario.expectedVerdict}
                  </span>
                </div>

                <h3 className="font-serif text-base font-semibold text-stone-900 group-hover:text-amber-900 transition-colors leading-snug">
                  {scenario.title}
                </h3>

                <p className="text-xs text-stone-600 italic bg-stone-50 p-2.5 rounded border border-stone-100 line-clamp-3">
                  "{scenario.text}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100 text-xs">
                <span className="text-stone-400 font-mono text-[11px]">Domain: {scenario.category}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-stone-800 group-hover:translate-x-0.5 transition-transform">
                  Run Benchmark
                  <ArrowRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4 Architectural Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="max-w-2xl">
            <h2 className="font-serif text-2xl font-bold tracking-tight text-stone-50">
              Architectural Pillars for Misinformation Defense
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              Built to withstand academic examination, peer review, and viva defense
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-stone-800/80 border border-stone-700/60 rounded-xl p-4 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
                <BrainCircuit size={16} />
              </div>
              <h3 className="font-semibold text-stone-100 text-sm">Evidence-Bounded AI</h3>
              <p className="text-stone-400 leading-relaxed">
                Gemini 3.8 Flash is restricted to reasoning over retrieved citations, eliminating hallucinated "truth judgments".
              </p>
            </div>

            <div className="bg-stone-800/80 border border-stone-700/60 rounded-xl p-4 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                <Scale size={16} />
              </div>
              <h3 className="font-semibold text-stone-100 text-sm">Absence of Evidence != False</h3>
              <p className="text-stone-400 leading-relaxed">
                Adheres strictly to the scientific method: unverified assertions are marked <em>INSUFFICIENT EVIDENCE</em>, never false.
              </p>
            </div>

            <div className="bg-stone-800/80 border border-stone-700/60 rounded-xl p-4 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center font-bold">
                <Database size={16} />
              </div>
              <h3 className="font-semibold text-stone-100 text-sm">5-Tier Source Prioritization</h3>
              <p className="text-stone-400 leading-relaxed">
                Prioritizes Government, Academic/Scientific (.edu, peer-reviewed), and Primary datasets over secondary blogs.
              </p>
            </div>

            <div className="bg-stone-800/80 border border-stone-700/60 rounded-xl p-4 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold">
                <Layers size={16} />
              </div>
              <h3 className="font-semibold text-stone-100 text-sm">Conflict Detection</h3>
              <p className="text-stone-400 leading-relaxed">
                When credible authorities disagree, TruthLens flags <em>CONFLICTING EVIDENCE</em> rather than forcing a binary consensus.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
