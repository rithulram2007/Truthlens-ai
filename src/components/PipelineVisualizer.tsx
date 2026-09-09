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
    shortDesc: 'Classifies claim, URL, or article text without fabricating missing data.',
    icon: <FileText size={16} />,
    category: 'Input',
  },
  {
    number: 2,
    id: 'decomposition',
    name: 'Claim Decomposition',
    shortDesc: 'Extracts verifiable assertions, filtering out opinions and predictions.',
    icon: <Filter size={16} />,
    category: 'Decomposition',
  },
  {
    number: 3,
    id: 'retrieval',
    name: 'Evidence Retrieval',
    shortDesc: 'Grounds searches against live indexes, official registries, and journals.',
    icon: <Search size={16} />,
    category: 'Evidence',
  },
  {
    number: 4,
    id: 'assessment',
    name: 'Source Assessment',
    shortDesc: 'Evaluates domains (Gov, Academic, News) into High/Medium/Low indicators.',
    icon: <ShieldCheck size={16} />,
    category: 'Evidence',
  },
  {
    number: 5,
    id: 'ranking',
    name: 'Evidence Ranking',
    shortDesc: 'Ranks and deduplicates sources by evidentiary weight and relevance.',
    icon: <BarChart3 size={16} />,
    category: 'Evidence',
  },
  {
    number: 6,
    id: 'comparison',
    name: 'Claim-Evidence Comparison',
    shortDesc: 'Cross-examines each claim against retrieved empirical citations.',
    icon: <GitCompare size={16} />,
    category: 'Reasoning',
  },
  {
    number: 7,
    id: 'conflict',
    name: 'Conflict Detection',
    shortDesc: 'Identifies discrepancies and flags explicit CONFLICTING EVIDENCE.',
    icon: <AlertTriangle size={16} />,
    category: 'Reasoning',
  },
  {
    number: 8,
    id: 'gemini_reasoning',
    name: 'Gemini 3.8 Reasoning',
    shortDesc: 'Generates evidence-bounded rationale strictly from retrieved sources.',
    icon: <BrainCircuit size={16} />,
    category: 'Reasoning',
  },
  {
    number: 9,
    id: 'verdict',
    name: 'Verdict & Confidence',
    shortDesc: 'Assigns SUPPORTED, CONTRADICTED, or INSUFFICIENT EVIDENCE.',
    icon: <Award size={16} />,
    category: 'Output',
  },
  {
    number: 10,
    id: 'traceability',
    name: 'Traceable Audit Ledger',
    shortDesc: 'Renders complete source links, timeline, and academic export report.',
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
            How TruthLens Works
          </h3>
          <p className="text-xs text-stone-500">
            A 10-stage epistemological verification pipeline built for academic rigor
          </p>
        </div>
        <span className="text-[11px] font-mono px-2.5 py-1 bg-stone-100 border border-stone-200 rounded text-stone-600 self-start sm:self-auto">
          Non-Chatbot Pipeline
        </span>
      </div>

      {/* Pipeline steps scroll track */}
      <div className="overflow-x-auto py-4 scrollbar-thin">
        <div className="flex items-center min-w-[780px] gap-2">
          {PIPELINE_STEPS.map((step, idx) => {
            const isCurrent = activeStep === step.number;
            const isPassed = activeStep ? activeStep > step.number : false;
            const isSelected = selectedStep.number === step.number;

            let badgeStyles = 'bg-stone-50 border-stone-200 text-stone-600 hover:border-stone-400';
            if (isCurrent) {
              badgeStyles = 'bg-amber-100 border-amber-500 text-amber-900 ring-2 ring-amber-300 ring-offset-1';
            } else if (isPassed) {
              badgeStyles = 'bg-emerald-50 border-emerald-300 text-emerald-800';
            } else if (isSelected) {
              badgeStyles = 'bg-stone-900 border-stone-900 text-white';
            }

            return (
              <React.Fragment key={step.id}>
                <button
                  type="button"
                  onClick={() => interactive && setSelectedStep(step)}
                  className={`flex flex-col items-center text-left p-2.5 rounded-lg border transition-all text-xs w-[140px] shrink-0 cursor-pointer ${badgeStyles}`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <span className="font-mono text-[10px] font-bold opacity-75">
                      0{step.number}
                    </span>
                    <span className="opacity-90">{step.icon}</span>
                  </div>
                  <span className="font-semibold leading-tight line-clamp-1 text-xs">
                    {step.name}
                  </span>
                  <span className="text-[10px] opacity-70 mt-0.5 line-clamp-1">
                    {step.category}
                  </span>
                </button>
                {idx < PIPELINE_STEPS.length - 1 && (
                  <div className="w-3 h-0.5 bg-stone-300 shrink-0" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Selected / Current step detail banner */}
      <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-stone-900 text-white font-mono text-xs flex items-center justify-center font-bold">
            {selectedStep.number}
          </span>
          <div>
            <span className="font-bold text-stone-900">{selectedStep.name}: </span>
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
