import React, { useState } from 'react';
import { VerificationHistoryItem, VerificationResult } from '../types';
import { VerdictBadge } from '../components/VerdictBadge';
import {
  History,
  Trash2,
  ExternalLink,
  Search,
  ArrowRight,
  Download,
  Clock,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { PageTab } from '../components/Navbar';

interface HistoryPageProps {
  historyItems: VerificationHistoryItem[];
  onOpenItem: (result: VerificationResult) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  onNavigate: (page: PageTab) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  historyItems,
  onOpenItem,
  onDeleteItem,
  onClearAll,
  onNavigate,
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  const filtered = historyItems.filter((item) =>
    item.inputPreview.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-stone-500 uppercase">
            <History size={14} />
            <span>Saved Verifications</span>
          </div>
          <h1 className="font-serif text-3xl font-bold text-stone-900 tracking-tight">
            Verification History
          </h1>
          <p className="text-xs text-stone-600">
            Stored locally in browser memory. View previous verification results or clear history.
          </p>
        </div>

        {historyItems.length > 0 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-rose-50 text-stone-700 hover:text-rose-700 text-xs font-medium border border-stone-200 hover:border-rose-200 transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Clear All History</span>
            </button>
          </div>
        )}
      </div>

      {/* Filter / Search Bar */}
      {historyItems.length > 0 && (
        <div className="relative max-w-md">
          <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
          <input
            type="text"
            placeholder="Search past verification inputs..."
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 text-stone-800"
          />
        </div>
      )}

      {/* History Items List */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-xl p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mx-auto">
            <History size={24} />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-base font-semibold text-stone-900">
              No Verification Records Found
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Run a claim or article through the TruthLens verification engine to record verification history.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('verify')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-colors cursor-pointer"
          >
            <span>Verify First Claim</span>
            <ArrowRight size={14} />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => {
            const formattedTime = new Date(item.timestamp).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            });

            return (
              <div
                key={item.id}
                className="bg-white border border-stone-200 hover:border-stone-300 rounded-xl p-4 sm:p-5 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <VerdictBadge verdict={item.overallVerdict} size="sm" />
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200 uppercase">
                      {item.inputType}
                    </span>
                    <span className="text-[11px] font-mono text-stone-400 flex items-center gap-1">
                      <Clock size={11} />
                      {formattedTime}
                    </span>
                  </div>

                  <p className="font-serif text-sm font-semibold text-stone-900 leading-snug line-clamp-2">
                    "{item.inputPreview}"
                  </p>

                  <div className="flex items-center gap-4 text-xs font-mono text-stone-500">
                    <span>Claims: <strong className="text-stone-800">{item.claimsCount}</strong></span>
                    <span>Sources: <strong className="text-stone-800">{item.sourcesCount}</strong></span>
                    <span>Confidence: <strong className="text-stone-800">{item.overallConfidence}%</strong></span>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                  <button
                    type="button"
                    onClick={() => onOpenItem(item.fullResult)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-medium transition-colors cursor-pointer"
                  >
                    <span>Inspect Result</span>
                    <ArrowRight size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    aria-label="Delete analysis"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
