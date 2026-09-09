import React, { useState, useEffect } from 'react';
import { Navbar, PageTab } from './components/Navbar';
import { HomePage } from './pages/HomePage';
import { VerifyPage } from './pages/VerifyPage';
import { ResultsPage } from './pages/ResultsPage';
import { HistoryPage } from './pages/HistoryPage';
import { MethodologyPage } from './pages/MethodologyPage';
import { AboutPage } from './pages/AboutPage';
import { VerificationHistoryItem, VerificationResult } from './types';
import { SEED_VERIFICATION_RESULT } from './data/seedResult';
import { Shield, BookOpen, Github, Scale, ExternalLink } from 'lucide-react';

const LOCAL_STORAGE_KEY = 'truthlens_verification_history_v1';

export default function App() {
  const [activePage, setActivePage] = useState<PageTab>('home');
  const [currentResult, setCurrentResult] = useState<VerificationResult | null>(
    SEED_VERIFICATION_RESULT
  );
  const [verifyPrefill, setVerifyPrefill] = useState<string>('');
  const [historyItems, setHistoryItems] = useState<VerificationHistoryItem[]>([]);

  // Load history from localStorage on initial mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setHistoryItems(parsed);
          return;
        }
      }
      // Seed an initial benchmark item if empty so history & results have real content immediately
      const seedItem: VerificationHistoryItem = {
        id: SEED_VERIFICATION_RESULT.id,
        timestamp: SEED_VERIFICATION_RESULT.timestamp,
        inputType: SEED_VERIFICATION_RESULT.inputType,
        inputPreview: SEED_VERIFICATION_RESULT.rawInput,
        overallVerdict: SEED_VERIFICATION_RESULT.overallVerdict,
        overallConfidence: SEED_VERIFICATION_RESULT.overallConfidence,
        claimsCount: SEED_VERIFICATION_RESULT.claimsAnalyzedCount,
        sourcesCount: SEED_VERIFICATION_RESULT.sourcesAnalyzedCount,
        fullResult: SEED_VERIFICATION_RESULT,
      };
      setHistoryItems([seedItem]);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([seedItem]));
    } catch {
      // In case of restricted iframe storage
    }
  }, []);

  const saveHistory = (items: VerificationHistoryItem[]) => {
    setHistoryItems(items);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Fallback
    }
  };

  const handleVerificationComplete = (result: VerificationResult) => {
    setCurrentResult(result);
    const newHistoryItem: VerificationHistoryItem = {
      id: result.id,
      timestamp: result.timestamp,
      inputType: result.inputType,
      inputPreview: result.rawInput.slice(0, 160),
      overallVerdict: result.overallVerdict,
      overallConfidence: result.overallConfidence,
      claimsCount: result.claimsAnalyzedCount,
      sourcesCount: result.sourcesAnalyzedCount,
      fullResult: result,
    };
    const updated = [newHistoryItem, ...historyItems.filter((h) => h.id !== result.id)];
    saveHistory(updated);
    setActivePage('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectSample = (sampleText: string) => {
    setVerifyPrefill(sampleText);
    setActivePage('verify');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenHistoryItem = (result: VerificationResult) => {
    setCurrentResult(result);
    setActivePage('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteHistoryItem = (id: string) => {
    const filtered = historyItems.filter((item) => item.id !== id);
    saveHistory(filtered);
  };

  const handleClearAllHistory = () => {
    saveHistory([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-100/60 text-stone-900 font-sans selection:bg-amber-100 selection:text-amber-900">
      {/* Global Navigation Header */}
      <Navbar
        activePage={activePage}
        onSelectPage={(page) => {
          setActivePage(page);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        hasActiveResult={currentResult !== null}
        historyCount={historyItems.length}
      />

      {/* Main Page Router */}
      <main className="flex-1">
        {activePage === 'home' && (
          <HomePage
            onNavigate={(page) => {
              setActivePage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onSelectSample={handleSelectSample}
          />
        )}

        {activePage === 'verify' && (
          <VerifyPage
            initialInput={verifyPrefill}
            onVerificationComplete={handleVerificationComplete}
          />
        )}

        {activePage === 'results' && currentResult && (
          <ResultsPage
            result={currentResult}
            onNewVerification={() => {
              setVerifyPrefill('');
              setActivePage('verify');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigate={(page) => {
              setActivePage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activePage === 'history' && (
          <HistoryPage
            historyItems={historyItems}
            onOpenItem={handleOpenHistoryItem}
            onDeleteItem={handleDeleteHistoryItem}
            onClearAll={handleClearAllHistory}
            onNavigate={(page) => {
              setActivePage(page);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activePage === 'methodology' && <MethodologyPage />}

        {activePage === 'about' && <AboutPage />}
      </main>

      {/* Academic Footer */}
      <footer className="bg-stone-900 text-stone-300 border-t border-stone-800 text-xs mt-16 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold">
                  <Shield size={16} />
                </div>
                <span className="font-serif font-bold text-base text-stone-100">
                  TruthLens Academic Platform
                </span>
              </div>
              <p className="text-stone-400 text-xs leading-relaxed max-w-md font-sans">
                An evidence-grounded misinformation and claim verification system engineered for
                academic research, journalism laboratories, and fact-checking evaluations. Powered by
                Tavily Search API evidence retrieval and Gemini 3.8 Flash reasoning.
              </p>
              <div className="text-[11px] font-mono text-stone-500">
                Rule: Absence of evidence alone does not establish that a claim is false.
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-mono text-xs uppercase tracking-wider text-stone-100 font-semibold">
                Platform Navigation
              </h4>
              <ul className="space-y-1.5 text-stone-400">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage('home');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-stone-100 transition-colors cursor-pointer"
                  >
                    Home Overview
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage('verify');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-stone-100 transition-colors cursor-pointer"
                  >
                    Verify Claims
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage('results');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-stone-100 transition-colors cursor-pointer"
                  >
                    Active Results Dossier
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage('history');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-stone-100 transition-colors cursor-pointer"
                  >
                    Verification History
                  </button>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <h4 className="font-mono text-xs uppercase tracking-wider text-stone-100 font-semibold">
                Research & Standards
              </h4>
              <ul className="space-y-1.5 text-stone-400">
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage('methodology');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-stone-100 transition-colors cursor-pointer"
                  >
                    Epistemological Rubric
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePage('about');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-stone-100 transition-colors cursor-pointer"
                  >
                    System Architecture
                  </button>
                </li>
                <li>
                  <span className="text-stone-500 font-mono text-[11px]">
                    Model: gemini-3.8-flash (Evidence Reasoning)
                  </span>
                </li>
                <li>
                  <span className="text-stone-500 font-mono text-[11px]">
                    Backend: Node Express / Port 3000
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-stone-500 text-[11px] font-mono">
            <div>
              TruthLens © {new Date().getFullYear()} • Academic Fact-Checking & Verification Platform
            </div>
            <div>Strict Evidence Grounding • No Ungrounded Hallucinations</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
