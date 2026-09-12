import React, { useState, useEffect } from 'react';
import { InputType, VerificationResult } from '../types';
import { PipelineVisualizer, PIPELINE_STEPS } from '../components/PipelineVisualizer';
import { SEED_VERIFICATION_RESULT } from '../data/seedResult';
import {
  Search,
  Globe,
  FileText,
  Sparkles,
  AlertTriangle,
  RotateCw,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Clock,
  ServerOff,
  Key,
} from 'lucide-react';

interface VerifyPageProps {
  initialInput?: string;
  onVerificationComplete: (result: VerificationResult) => void;
}

export const VerifyPage: React.FC<VerifyPageProps> = ({
  initialInput = '',
  onVerificationComplete,
}) => {
  const [inputText, setInputText] = useState(initialInput);
  const [detectedType, setDetectedType] = useState<InputType>('claim');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);
  const [isQuotaError, setIsQuotaError] = useState(false);

  // Auto-detect input type whenever inputText changes
  useEffect(() => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      setDetectedType('claim');
      return;
    }
    if (/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(trimmed) || /^www\.[^\s$.?#].[^\s]*$/i.test(trimmed)) {
      setDetectedType('url');
    } else if (trimmed.length > 350 || (trimmed.match(/[.!?](\s+|$)/g) || []).length >= 3) {
      setDetectedType('article');
    } else {
      setDetectedType('claim');
    }
  }, [inputText]);

  // Load sample if initialInput updates from parent
  useEffect(() => {
    if (initialInput) {
      setInputText(initialInput);
    }
  }, [initialInput]);

  const handleStartVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed) {
      setErrorMsg('Please enter a factual claim, news URL, or article text.');
      return;
    }

    setIsAnalyzing(true);
    setErrorMsg(null);
    setErrorDetails(null);
    setIsQuotaError(false);
    setActiveStep(1);

    // Simulate animated step progression through the 10-stage pipeline during the API call
    const stepInterval = setInterval(() => {
      setActiveStep((prev) => (prev < 9 ? prev + 1 : prev));
    }, 1100);

    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: trimmed }),
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        const isQuota =
          response.status === 402 ||
          response.status === 429 ||
          response.status === 503 ||
          errJson.code === 'RESOURCE_EXHAUSTED' ||
          errJson.code === 'PAYMENT_REQUIRED' ||
          errJson.isQuotaError ||
          errJson.error === 'Verification Service Unavailable' ||
          (typeof errJson.message === 'string' && (errJson.message.includes('RESOURCE_EXHAUSTED') || errJson.message.includes('402') || errJson.message.includes('credits'))) ||
          (typeof errJson.details === 'string' && (errJson.details.includes('RESOURCE_EXHAUSTED') || errJson.details.includes('402') || errJson.details.includes('credits')));

        if (isQuota) {
          const quotaErr = new Error('Verification Service Unavailable');
          Object.assign(quotaErr, {
            isQuota: true,
            details:
              errJson.message ||
              errJson.details ||
              'The verification reasoning service is currently unavailable or requires quota/credits. Per academic and epistemic safeguards, this infrastructure limitation is strictly distinct from "INSUFFICIENT EVIDENCE"—the verification pipeline did not execute, so no epistemic claim verdict has been assigned.',
          });
          throw quotaErr;
        }

        throw new Error(errJson.error || `Server responded with status ${response.status}`);
      }

      const result: VerificationResult = await response.json();
      setActiveStep(10);

      // Short delay so user observes stage 10 completion
      setTimeout(() => {
        setIsAnalyzing(false);
        onVerificationComplete(result);
      }, 500);
    } catch (err: unknown) {
      clearInterval(stepInterval);
      setIsAnalyzing(false);
      const isQuota =
        Boolean((err as Record<string, unknown>)?.isQuota) ||
        String(err).includes('Verification Service Unavailable') ||
        String(err).includes('RESOURCE_EXHAUSTED') ||
        String(err).includes('PAYMENT_REQUIRED') ||
        String(err).includes('credits') ||
        String(err).includes('402') ||
        String(err).includes('quota');

      if (isQuota) {
        setErrorMsg('Verification Service Unavailable');
        setErrorDetails(
          ((err as Record<string, unknown>)?.details as string) ||
            'The verification reasoning service is currently unavailable or requires quota/credits. The verification engine cannot run at this time. Per academic and epistemic safeguards, this infrastructure limitation is strictly distinct from "INSUFFICIENT EVIDENCE"—the verification pipeline did not execute, so no epistemic claim verdict has been assigned.'
        );
        setIsQuotaError(true);
      } else {
        setErrorMsg('Verification Pipeline Interrupted');
        setErrorDetails(err instanceof Error ? err.message : String(err));
        setIsQuotaError(false);
      }
    }
  };

  const setSampleInput = (type: InputType) => {
    setErrorMsg(null);
    if (type === 'claim') {
      setInputText(
        'The Great Wall of China is the only man-made structure visible from the Moon with the naked human eye.'
      );
    } else if (type === 'url') {
      setInputText(
        'https://www.nature.com/articles/d41586-024-00000-0'
      );
    } else {
      setInputText(
        `Groundbreaking Clinical Trials Reveal Promising Alzheimer's Therapeutic Results
Published by Medical Chronicle Staff
Recent phase-3 international clinical trials involving over 1,800 participants demonstrated a 27% reduction in cognitive decline over 18 months using monoclonal antibodies targeting amyloid-beta plaques. Researchers noted moderate side effects including localized amyloid-related imaging abnormalities (ARIA) in approximately 12% of the cohort. Independent neurologists urge cautious optimism while awaiting multi-year longitudinal survival data.`
      );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Heading */}
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
          Verify Claim or Article
        </h1>
        <p className="text-sm text-stone-600 font-sans">
          Enter an individual factual statement, an external news URL, or full article text.
          TruthLens will extract verifiable claims, retrieve evidence via Tavily, evaluate source credibility, and check for conflicts.
        </p>
      </div>

      {/* Verification Form Card */}
      <div className="bg-white border border-stone-200 rounded-xl shadow-xs overflow-hidden">
        {/* Detection Header Tabs */}
        <div className="p-3 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-stone-500">Detected Format:</span>
            <span
              className={`px-2.5 py-1 rounded-md font-bold uppercase tracking-wider text-[11px] border ${
                detectedType === 'url'
                  ? 'bg-sky-100 text-sky-800 border-sky-300'
                  : detectedType === 'article'
                  ? 'bg-purple-100 text-purple-800 border-purple-300'
                  : 'bg-stone-100 text-stone-800 border-stone-300'
              }`}
            >
              {detectedType === 'url' && <Globe size={11} className="inline mr-1" />}
              {detectedType === 'article' && <FileText size={11} className="inline mr-1" />}
              {detectedType === 'claim' && <Search size={11} className="inline mr-1" />}
              {detectedType === 'url'
                ? 'News URL'
                : detectedType === 'article'
                ? 'Article Text'
                : 'Factual Claim'}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px]">
            <span className="text-stone-400 hidden sm:inline">Load Sample:</span>
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => setSampleInput('claim')}
              className="px-2 py-0.5 rounded bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 cursor-pointer"
            >
              Claim
            </button>
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => setSampleInput('url')}
              className="px-2 py-0.5 rounded bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 cursor-pointer"
            >
              URL
            </button>
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={() => setSampleInput('article')}
              className="px-2 py-0.5 rounded bg-white hover:bg-stone-100 border border-stone-200 text-stone-700 cursor-pointer"
            >
              Article
            </button>
          </div>
        </div>

        {/* Input Text Area Form */}
        <form onSubmit={handleStartVerification} className="p-5 sm:p-6 space-y-4">
          <div className="relative">
            <textarea
              rows={detectedType === 'article' ? 7 : 4}
              disabled={isAnalyzing}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                detectedType === 'url'
                  ? 'https://example.com/news/article...'
                  : 'Enter a factual claim (e.g. "NASA landed astronauts on the Moon in 1969") or paste article text...'
              }
              className="w-full p-4 text-sm font-sans text-stone-900 bg-stone-50/50 border border-stone-200 rounded-lg focus:bg-white focus:outline-none focus:border-stone-500 focus:ring-1 focus:ring-stone-500 transition-all placeholder:text-stone-400 resize-y"
            />
            <div className="flex items-center justify-between text-[11px] font-mono text-stone-400 pt-1 px-1">
              <span>Characters: {inputText.length}</span>
              <span>Empirical, falsifiable propositions</span>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
            <div className="text-xs text-stone-500 flex items-center gap-1.5">
              <ShieldCheck size={14} className="text-emerald-700" />
              <span>
                Sources prioritized: Government (.gov), Academic/Scientific (.edu, Nature), and Reputable Global Agencies.
              </span>
            </div>

            <button
              type="submit"
              disabled={isAnalyzing || !inputText.trim()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-sm font-medium transition-all shadow-xs cursor-pointer shrink-0"
            >
              {isAnalyzing ? (
                <>
                  <RotateCw size={15} className="animate-spin text-amber-300" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Verify Claim</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Live Pipeline Stepper during analysis */}
      {isAnalyzing && (
        <div className="bg-white border border-stone-200 rounded-xl p-6 shadow-xs space-y-5 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-stone-200 pb-3">
            <div className="flex items-center gap-2.5">
              <RotateCw size={18} className="animate-spin text-amber-600" />
              <h3 className="font-serif text-base font-semibold text-stone-900">
                Verification in Progress
              </h3>
            </div>
            <span className="font-mono text-xs text-stone-500 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
              Stage {activeStep} of 10
            </span>
          </div>

          {/* Active Step Indicator */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3.5 flex items-start gap-3">
            <div className="w-7 h-7 rounded-full bg-stone-900 text-white font-mono font-bold flex items-center justify-center shrink-0 text-xs">
              {activeStep}
            </div>
            <div className="space-y-0.5">
              <div className="text-xs font-mono uppercase tracking-wider text-amber-900 font-semibold">
                {PIPELINE_STEPS[activeStep - 1]?.category} Stage:
              </div>
              <div className="font-semibold text-stone-900 text-sm">
                {PIPELINE_STEPS[activeStep - 1]?.name}
              </div>
              <p className="text-xs text-stone-600">
                {PIPELINE_STEPS[activeStep - 1]?.shortDesc}
              </p>
            </div>
          </div>

          <PipelineVisualizer activeStep={activeStep} interactive={false} />
        </div>
      )}

      {/* Error & Service Unavailable Display */}
      {errorMsg && isQuotaError && (
        <div className="bg-amber-50/90 border border-amber-300 rounded-xl p-6 space-y-4 shadow-xs text-stone-900">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-amber-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-700 text-white flex items-center justify-center shrink-0 shadow-xs">
                <ServerOff size={20} />
              </div>
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-amber-800 font-bold">
                  API Limitation
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-950">
                  Verification Service Unavailable
                </h3>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono text-xs font-semibold self-start sm:self-auto">
              <Clock size={13} />
              HTTP 429 / 503
            </span>
          </div>

          <div className="space-y-3 text-xs leading-relaxed text-stone-700">
            <p className="text-sm text-stone-800">
              The verification pipeline could not complete because the upstream API is experiencing high demand or quota limitations. Live evidence retrieval and reasoning could not run at this time.
            </p>

            {/* Epistemic Rubric Distinction Callout */}
            <div className="bg-white/80 border border-amber-200 rounded-lg p-3.5 space-y-1">
              <div className="flex items-center gap-2 text-amber-900 font-semibold text-xs font-mono">
                <ShieldCheck size={14} className="text-amber-700" />
                <span>Epistemic Distinction: Why this is NOT "INSUFFICIENT EVIDENCE"</span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">
                Under TruthLens's academic methodology, <strong>INSUFFICIENT EVIDENCE</strong> is strictly reserved for instances where the verification pipeline executed successfully against authoritative sources, but the retrieved empirical data was scarce or inconclusive. Because this request could not execute due to an upstream service interruption, no epistemic verdict has been assigned.
              </p>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-stone-500 font-mono">
              <Key size={13} className="text-stone-400" />
              <span>Remedy: Check API key configuration or retry after a brief moment.</span>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleStartVerification}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-all shadow-xs cursor-pointer"
            >
              <RotateCw size={13} />
              <span>Retry Verification</span>
            </button>

            <button
              type="button"
              onClick={() => onVerificationComplete(SEED_VERIFICATION_RESULT)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-stone-50 text-stone-800 text-xs font-medium border border-stone-300 transition-colors shadow-xs cursor-pointer"
            >
              <FileText size={13} />
              <span>Inspect Sample Verification</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Generic Error Banner with Retry (non-quota) */}
      {errorMsg && !isQuotaError && (
        <div className="bg-rose-50 border border-rose-300 rounded-xl p-5 space-y-2 text-xs text-rose-900">
          <div className="flex items-center gap-2 font-semibold text-rose-800 text-sm">
            <AlertTriangle size={18} className="text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          {errorDetails && (
            <p className="font-mono bg-white/70 p-2.5 rounded border border-rose-200 text-rose-950">
              {errorDetails}
            </p>
          )}
          <div className="pt-2 text-stone-600 flex items-center justify-between">
            <span>Per academic safeguards, TruthLens will not fabricate synthetic results when an external retrieval fails.</span>
            <button
              type="button"
              onClick={handleStartVerification}
              className="px-3 py-1 rounded bg-rose-800 hover:bg-rose-900 text-white font-medium cursor-pointer"
            >
              Retry
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
