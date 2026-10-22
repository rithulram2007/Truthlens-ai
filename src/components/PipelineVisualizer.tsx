import React from 'react';
import {
  FileText,
  Filter,
  Search,
  ShieldCheck,
  BarChart3,
  GitCompare,
  AlertTriangle,
  BrainCircuit,
  Award,
  Link2,
  Check,
  ArrowRight,
} from 'lucide-react';

export interface PipelineStep {
  number: number;
  id: string;
  name: string;
  shortDesc: string;
  icon: React.ReactNode;
  category: 'Input' | 'Decomposition' | 'Evidence' | 'Reasoning' | 'Output';
}

export const PIPELINE_STEPS: PipelineStep[] = [
  {
    number: 1,
    id: 'input',
    name: 'Input Detection',
    shortDesc: 'Analyzes the input format as an individual claim, news URL, or article text.',
    icon: <FileText size={16} />,
    category: 'Input',
  },
  {
    number: 2,
    id: 'extraction',
    name: 'Claim Extraction',
    shortDesc: 'Extracts verifiable factual assertions while separating opinion or subjective language.',
    icon: <Filter size={16} />,
    category: 'Decomposition',
  },
  {
    number: 3,
    id: 'retrieval',
    name: 'Evidence Retrieval',
    shortDesc: 'Queries live web sources via Tavily Search API to collect real evidence and citations.',
    icon: <Search size={16} />,
    category: 'Evidence',
  },
  {
    number: 4,
    id: 'assessment',
    name: 'Source Assessment',
    shortDesc: 'Evaluates institutional domains (governmental, academic, news agencies) for authority.',
    icon: <ShieldCheck size={16} />,
    category: 'Evidence',
  },
  {
    number: 5,
    id: 'ranking',
    name: 'Evidence Ranking',
    shortDesc: 'Ranks and filters retrieved evidence based on domain credibility and relevance.',
    icon: <BarChart3 size={16} />,
    category: 'Evidence',
  },
  {
    number: 6,
    id: 'comparison',
    name: 'Evidence Comparison',
    shortDesc: 'Compares each extracted claim against the retrieved empirical evidence snippets.',
    icon: <GitCompare size={16} />,
    category: 'Reasoning',
  },
  {
    number: 7,
    id: 'conflict',
    name: 'Conflict Detection',
    shortDesc: 'Identifies discrepancies across sources and flags conflicting evidence.',
    icon: <AlertTriangle size={16} />,
    category: 'Reasoning',
  },
  {
    number: 8,
    id: 'reasoning',
    name: 'LLM Reasoning',
    shortDesc: 'Applies LLM reasoning strictly grounded on the retrieved evidence citations.',
    icon: <BrainCircuit size={16} />,
    category: 'Reasoning',
  },
  {
    number: 9,
    id: 'confidence',
    name: 'Confidence Estimation',
    shortDesc: 'Calculates evidentiary certainty, consistency metrics, and confidence score.',
    icon: <Award size={16} />,
    category: 'Output',
  },
  {
    number: 10,
    id: 'verdict',
    name: 'Generate Verdict',
    shortDesc: 'Determines the final verdict (SUPPORTED, CONTRADICTED, or INSUFFICIENT EVIDENCE) and citations.',
    icon: <Link2 size={16} />,
    category: 'Output',
  },
];

interface PipelineVisualizerProps {
  activeStep?: number; // 1 to 10
  interactive?: boolean;
}

export const PipelineVisualizer: React.FC<PipelineVisualizerProps> = ({
  activeStep,
  interactive = false,
}) => {
  const [selectedStep, setSelectedStep] = React.useState<PipelineStep>(
    PIPELINE_STEPS[activeStep ? activeStep - 1 : 0]
  );

  React.useEffect(() => {
    if (activeStep && activeStep >= 1 && activeStep <= 10) {
      setSelectedStep(PIPELINE_STEPS[activeStep - 1]);
    }
  }, [activeStep]);

  return (
    <div className="w-full bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-200 gap-2">
        <div>
          <h3 className="font-serif text-lg font-semibold text-stone-900 tracking-tight">
            Verification Pipeline
          </h3>
          <p className="text-xs text-stone-500">
            A transparent workflow: from input analysis to evidence-grounded verification
          </p>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 bg-stone-100 border border-stone-200 rounded text-stone-600 self-start sm:self-auto">
          System Workflow
        </span>
      </div>

      {/* 10-Stage Pipeline: Clean 5x2 grid on desktop with zero horizontal scroll */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 py-4">
        {PIPELINE_STEPS.map((step, idx) => {
          const isCurrent = activeStep === step.number;
          const isPassed = activeStep ? activeStep > step.number : false;
          const isSelected = selectedStep.number === step.number;

          let badgeStyles = 'bg-stone-50/80 border-stone-200 text-stone-700 hover:border-stone-400 hover:bg-stone-100/70';
          if (isCurrent) {
            badgeStyles = 'bg-stone-900 border-stone-900 text-white shadow-xs ring-2 ring-stone-900 ring-offset-1';
          } else if (isPassed) {
            badgeStyles = 'bg-emerald-50/80 border-emerald-300 text-emerald-950';
          } else if (isSelected) {
            badgeStyles = 'bg-stone-100 border-stone-400 text-stone-950 font-semibold shadow-xs';
          }

          const stepNumberFormatted = step.number < 10 ? `0${step.number}` : `${step.number}`;
          // Show directional flow arrow on desktop between columns in row 1 (01-04) and row 2 (06-09)
          const showRowConnector = idx !== 4 && idx !== 9;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => interactive && setSelectedStep(step)}
              className={`flex flex-col text-left p-3 rounded-lg border transition-all text-xs w-full relative ${
                interactive ? 'cursor-pointer' : 'cursor-default'
              } ${badgeStyles}`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-[11px] font-bold opacity-80">
                    {stepNumberFormatted}
                  </span>
                  {isCurrent && (
                    <span
                      className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse inline-block"
                      title="Current Stage"
                    />
                  )}
                  {isPassed && (
                    <Check size={12} className="text-emerald-700 inline-block stroke-[2.5]" />
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <span className="opacity-90">{step.icon}</span>
                  {showRowConnector && (
                    <ArrowRight
                      size={11}
                      className="hidden md:inline-block text-stone-400/80 ml-0.5"
                    />
                  )}
                </div>
              </div>
              <span className="font-semibold leading-snug text-xs truncate">
                {step.name}
              </span>
              <span className="text-[10px] opacity-70 mt-0.5 truncate">
                {step.category}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected / Current step detail banner */}
      <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded bg-stone-900 text-white font-mono text-[11px] flex items-center justify-center font-bold">
            {selectedStep.number < 10 ? `0${selectedStep.number}` : selectedStep.number}
          </span>
          <div>
            <span className="font-semibold text-stone-900">{selectedStep.name}: </span>
            <span className="text-stone-600">{selectedStep.shortDesc}</span>
          </div>
        </div>
        <span className="font-mono text-[10px] text-stone-500 uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-stone-200 shrink-0">
          Stage: {selectedStep.category}
        </span>
      </div>
    </div>
  );
};
