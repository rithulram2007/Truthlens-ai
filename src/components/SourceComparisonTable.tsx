import React, { useState } from 'react';
import { SourceItem, SourceRelationship } from '../types';
import { ExternalLink, Filter, Search, ShieldCheck } from 'lucide-react';

interface SourceComparisonTableProps {
  sources: SourceItem[];
}

export const SourceComparisonTable: React.FC<SourceComparisonTableProps> = ({ sources }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [stanceFilter, setStanceFilter] = useState<string>('ALL');

  const filteredSources = sources.filter((s) => {
    const matchesSearch =
      s.sourceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.domain.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTier = tierFilter === 'ALL' || s.tier === tierFilter;
    const matchesStance = stanceFilter === 'ALL' || s.relationshipToClaim === stanceFilter;

    return matchesSearch && matchesTier && matchesStance;
  });

  const getStanceBadge = (stance: SourceRelationship) => {
    switch (stance) {
      case 'SUPPORTS':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300">
            SUPPORTS
          </span>
        );
      case 'CONTRADICTS':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-rose-50 text-rose-800 border border-rose-300">
            CONTRADICTS
          </span>
        );
      case 'INSUFFICIENT':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-300">
            INSUFFICIENT
          </span>
        );
      case 'NEUTRAL':
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-stone-100 text-stone-700 border border-stone-200">
            CONTEXT / NEUTRAL
          </span>
        );
    }
  };

  const getAssessmentBadge = (assessment: string) => {
    switch (assessment) {
      case 'HIGH':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-50 text-sky-800 border border-sky-300">
            HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-100 text-stone-700 border border-stone-200">
            MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300">
            LOW
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-stone-50 text-stone-600 border border-stone-200">
            UNKNOWN
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
      <div className="p-4 border-b border-stone-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-stone-50/50">
        <div>
          <h3 className="font-serif text-base font-semibold text-stone-900 flex items-center gap-2">
            <ShieldCheck size={18} className="text-stone-700" />
            Source Comparison & Evidentiary Rubric
          </h3>
          <p className="text-xs text-stone-500">
            Comparative analysis of all cataloged sources, stance alignment, and reliability indicators
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-2.5 text-stone-400" />
            <input
              type="text"
              placeholder="Search sources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-stone-200 rounded-lg focus:outline-none focus:border-stone-400 w-40"
            />
          </div>

          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="text-xs bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-stone-400 text-stone-700"
          >
            <option value="ALL">All Categories</option>
            <option value="Government / Official">Gov / Official</option>
            <option value="Scientific / Academic">Academic / Scientific</option>
            <option value="Primary Source">Primary Source</option>
            <option value="Reputable News">Reputable News</option>
            <option value="Established Organization">Established Org</option>
          </select>

          <select
            value={stanceFilter}
            onChange={(e) => setStanceFilter(e.target.value)}
            className="text-xs bg-white border border-stone-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-stone-400 text-stone-700"
          >
            <option value="ALL">All Stances</option>
            <option value="SUPPORTS">Supports</option>
            <option value="CONTRADICTS">Contradicts</option>
            <option value="NEUTRAL">Neutral / Context</option>
            <option value="INSUFFICIENT">Insufficient</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-stone-100 text-stone-600 font-mono text-[11px] uppercase tracking-wider border-b border-stone-200">
            <tr>
              <th className="py-3 px-4">Source / Publisher</th>
              <th className="py-3 px-4">Title & Excerpt</th>
              <th className="py-3 px-4">Category Tier</th>
              <th className="py-3 px-4">Stance to Claim</th>
              <th className="py-3 px-4">Reliability</th>
              <th className="py-3 px-4 text-right">Relevance</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100 font-sans">
            {filteredSources.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-stone-400 text-xs">
                  No sources matched the criteria.
                </td>
              </tr>
            ) : (
              filteredSources.map((source) => (
                <tr key={source.id} className="hover:bg-stone-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-medium text-stone-900">
                    <div>{source.sourceName}</div>
                    <div className="text-[10px] text-stone-400 font-mono">{source.domain}</div>
                    {source.publicationDate && (
                      <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                        {source.publicationDate}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-medium text-stone-900 leading-snug line-clamp-2">
                      {source.title}
                    </div>
                    {source.excerpt && (
                      <div className="text-[11px] text-stone-500 italic mt-1 line-clamp-2">
                        "{source.excerpt}"
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="text-stone-700 font-mono text-[11px]">{source.tier}</span>
                  </td>
                  <td className="py-3.5 px-4">{getStanceBadge(source.relationshipToClaim)}</td>
                  <td className="py-3.5 px-4">{getAssessmentBadge(source.assessment)}</td>
                  <td className="py-3.5 px-4 text-right font-mono font-semibold text-stone-800">
                    {source.relevance}%
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {source.url ? (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-stone-600 hover:text-stone-900 hover:underline text-[11px] font-medium"
                      >
                        Inspect
                        <ExternalLink size={11} />
                      </a>
                    ) : (
                      <span className="text-stone-400 text-[11px]">N/A</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-stone-50 border-t border-stone-200 text-[11px] text-stone-500 flex items-center justify-between">
        <span>Showing {filteredSources.length} of {sources.length} sources</span>
        <span className="italic font-sans">
          Notice: Source assessment is treated as an epistemic indicator, not absolute truth.
        </span>
      </div>
    </div>
  );
};
