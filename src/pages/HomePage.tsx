import React, { useState } from 'react';
import { PipelineVisualizer } from '../components/PipelineVisualizer';
import {
  Search,
  ArrowRight,
  Database,
  Layers,
  Scale,
  BrainCircuit,
  FileText,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { PageTab } from '../components/Navbar';

interface HomePageProps {
  onNavigate: (page: PageTab) => void;
  onSelectSample: (sampleText: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate, onSelectSample }) => {
  const [quickInput, setQuickInput] = useState('');

  const sampleScenarios = [
    {
      title: 'Historical Discovery',
      type: 'Factual Claim',
      text: 'Penicillin was discovered by Alexander Fleming in 1928 after mold contaminated a Staphylococcus culture plate.',
      expectedVerdict: 'SUPPORTED',
      category: 'Science',
    },
    {
      title: 'Popular Space Myth',
      type: 'Factual Claim',
      text: 'The Great Wall of China is clearly visible from the Moon with the naked human eye.',
      expectedVerdict: 'CONTRADICTED',
      category: 'Science / History',
    },
    {
      title: 'Lifecycle Comparison Debate',
      type: 'Technical Comparison',
      text: 'Electric vehicles have a higher lifetime carbon footprint than internal combustion engine vehicles when battery manufacturing is included.',
      expectedVerdict: 'CONFLICTING EVIDENCE',
      category: 'Environment / Tech',
    },
    {
      title: 'Uncorroborated Assertion',
      type: 'Unproven Assertion',
      text: 'Ancient Roman engineers regularly used piezoelectric quartz energy generators inside their aqueduct tunnels.',
      expectedVerdict: 'INSUFFICIENT EVIDENCE',
      category: 'History',
    },
  ];

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quickInput.trim()) {
      onSelectSample(quickInput.trim());
      onNavigate('verify');
    }
  };

  return (
    <div className="space-y-12 pb-16">
      {/* Product Overview Section */}
      <section className="bg-white border-b border-stone-200 py-10 sm:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-stone-900 tracking-tight">
              TruthLens
            </h1>
            <p className="text-lg font-medium text-stone-700">
              AI-Assisted Claim Verification
            </p>
            <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-sans max-w-2xl">
              Analyze claims and articles using retrieved evidence and transparent verification.
              TruthLens extracts factual assertions, retrieves live authoritative sources, evaluates domain
              credibility, and provides evidence-grounded verdicts.
            </p>
          </div>

          {/* Quick verification form */}
          <form onSubmit={handleQuickSubmit} className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-3.5 text-stone-400" />
                <input
                  type="text"
                  value={quickInput}
                  onChange={(e) => setQuickInput(e.target.value)}
                  placeholder="Enter a claim (e.g., 'Water freezes at 0°C') or news URL..."
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:border-stone-500 text-stone-900"
                />
              </div>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-medium text-sm transition-colors cursor-pointer shrink-0"
              >
                <span>Verify Claim</span>
                <ArrowRight size={15} />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-700" />
                <span>Sources retrieved live from verified web databases and registries</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('methodology')}
                className="text-stone-600 hover:text-stone-900 underline cursor-pointer"
              >
                View Verification Methodology
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Verification Pipeline Workflow */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl font-bold text-stone-900 tracking-tight">
              Verification Workflow
            </h2>
            <p className="text-xs text-stone-600">
              The systematic pipeline from raw input to verified evidence and verdict
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('methodology')}
            className="text-xs font-mono text-stone-600 hover:text-stone-900 underline flex items-center gap-1 cursor-pointer"
          >
            Methodology Details
            <ArrowRight size={12} />
          </button>
        </div>

        <PipelineVisualizer interactive={true} />
      </section>

      {/* Benchmark Test Scenarios */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        <div>
          <h2 className="font-serif text-xl font-bold text-stone-900 tracking-tight">
            Benchmark Test Scenarios
          </h2>
          <p className="text-xs text-stone-600">
            Select a verified benchmark to test claim extraction, evidence retrieval, and conflict detection
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
              className="bg-white border border-stone-200 hover:border-stone-400 rounded-lg p-5 shadow-xs transition-all cursor-pointer flex flex-col justify-between group"
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
                    Expected: {scenario.expectedVerdict}
                  </span>
                </div>

                <h3 className="font-serif text-base font-semibold text-stone-900 group-hover:text-stone-700 transition-colors leading-snug">
                  {scenario.title}
                </h3>

                <p className="text-xs text-stone-600 italic bg-stone-50 p-2.5 rounded border border-stone-100 line-clamp-3">
                  "{scenario.text}"
                </p>
              </div>

              <div className="flex items-center justify-between pt-3 mt-3 border-t border-stone-100 text-xs">
                <span className="text-stone-500 font-mono text-[11px]">Domain: {scenario.category}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-stone-800 group-hover:translate-x-0.5 transition-transform">
                  Run Benchmark
                  <ArrowRight size={13} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Core Verification Principles */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-stone-900 text-stone-100 rounded-xl p-6 sm:p-8 space-y-6">
          <div className="max-w-2xl">
            <h2 className="font-serif text-xl font-bold tracking-tight text-stone-50">
              Core Verification Principles
            </h2>
            <p className="text-xs text-stone-400 mt-1">
              Methodological standards governing claim decomposition, evidence grounding, and uncertainty reporting
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="bg-stone-800/80 border border-stone-700/60 rounded-lg p-4 space-y-2">
              <div className="w-7 h-7 rounded bg-stone-700 text-stone-200 flex items-center justify-center font-bold">
                <BrainCircuit size={15} />
              </div>
              <h3 className="font-semibold text-stone-100 text-sm">Evidence-Bounded Reasoning</h3>
              <p className="text-stone-400 leading-relaxed">
                Gemini reasoning is restricted strictly to retrieved evidence snippets, preventing ungrounded speculation.
              </p>
            </div>

            <div className="bg-stone-800/80 border border-stone-700/60 rounded-lg p-4 space-y-2">
              <div className="w-7 h-7 rounded bg-stone-700 text-stone-200 flex items-center justify-center font-bold">
                <Scale size={15} />
              </div>
              <h3 className="font-semibold text-stone-100 text-sm">Absence of Evidence Standard</h3>
              <p className="text-stone-400 leading-relaxed">
                Uncorroborated assertions are classified as <em>INSUFFICIENT EVIDENCE</em>, never assumed false without proof.
              </p>
            </div>

            <div className="bg-stone-800/80 border border-stone-700/60 rounded-lg p-4 space-y-2">
              <div className="w-7 h-7 rounded bg-stone-700 text-stone-200 flex items-center justify-center font-bold">
                <Database size={15} />
              </div>
              <h3 className="font-semibold text-stone-100 text-sm">Source Prioritization</h3>
              <p className="text-stone-400 leading-relaxed">
                Institutional domains (.gov, .edu, scientific journals, verified registries) are prioritized over secondary content.
              </p>
            </div>

            <div className="bg-stone-800/80 border border-stone-700/60 rounded-lg p-4 space-y-2">
              <div className="w-7 h-7 rounded bg-stone-700 text-stone-200 flex items-center justify-center font-bold">
                <Layers size={15} />
              </div>
              <h3 className="font-semibold text-stone-100 text-sm">Conflict Detection</h3>
              <p className="text-stone-400 leading-relaxed">
                When credible sources disagree, the engine flags <em>CONFLICTING EVIDENCE</em> rather than forcing a false consensus.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
