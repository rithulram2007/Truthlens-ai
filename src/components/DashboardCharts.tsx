import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { ClaimVerification, SourceItem } from '../types';

interface DashboardChartsProps {
  claims: ClaimVerification[];
  sources: SourceItem[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ claims, sources }) => {
  // 1. Verdict Distribution Data
  const supportedCount = claims.filter((c) => c.verdict === 'SUPPORTED').length;
  const contradictedCount = claims.filter((c) => c.verdict === 'CONTRADICTED').length;
  const insufficientCount = claims.filter((c) => c.verdict === 'INSUFFICIENT EVIDENCE').length;

  const verdictData = [
    { name: 'Supported', count: supportedCount, color: '#059669' },
    { name: 'Contradicted', count: contradictedCount, color: '#e11d48' },
    { name: 'Insufficient', count: insufficientCount, color: '#d97706' },
  ].filter((d) => d.count > 0);

  // 2. Confidence by Claim Data
  const confidenceData = claims.map((c, idx) => ({
    name: `Claim ${idx + 1}`,
    fullClaim: c.claimText,
    confidence: c.confidence,
    verdict: c.verdict,
  }));

  // 3. Supporting vs Contradicting Evidence counts
  const totalSupporting = claims.reduce((acc, c) => acc + c.supportingEvidence.length, 0);
  const totalContradicting = claims.reduce((acc, c) => acc + c.contradictingEvidence.length, 0);
  const totalConflicts = claims.reduce((acc, c) => acc + c.conflicts.length, 0);

  const evidenceStanceData = [
    { name: 'Supporting Evidence', count: totalSupporting, fill: '#10b981' },
    { name: 'Contradicting Evidence', count: totalContradicting, fill: '#f43f5e' },
    { name: 'Flagged Conflicts', count: totalConflicts, fill: '#8b5cf6' },
  ];

  // 4. Source Assessment Distribution
  const highTierCount = sources.filter((s) => s.assessment === 'HIGH').length;
  const medTierCount = sources.filter((s) => s.assessment === 'MEDIUM').length;
  const lowTierCount = sources.filter((s) => s.assessment === 'LOW').length;
  const unkCount = sources.filter((s) => s.assessment === 'UNKNOWN').length;

  const sourceTierData = [
    { name: 'High Reliability', count: highTierCount, fill: '#0284c7' },
    { name: 'Medium Reliability', count: medTierCount, fill: '#64748b' },
    { name: 'Low / Blog', count: lowTierCount, fill: '#f59e0b' },
    { name: 'Unverified', count: unkCount, fill: '#a8a29e' },
  ].filter((d) => d.count > 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Chart 1: Claim Verdict Distribution */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs flex flex-col">
        <div className="mb-2">
          <h4 className="text-xs font-mono uppercase tracking-wider text-stone-500 font-semibold">
            Claim Verdict Distribution
          </h4>
          <p className="text-xs text-stone-600">Breakdown across verifiable assertions</p>
        </div>
        <div className="h-52 w-full flex items-center justify-center">
          {verdictData.length === 0 ? (
            <span className="text-xs text-stone-400">No verifiable claims evaluated yet</span>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={verdictData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {verdictData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => [`${value} claim(s)`, 'Verdict']}
                  contentStyle={{
                    backgroundColor: '#1c1917',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2 border-t border-stone-100 text-xs">
          {verdictData.map((d) => (
            <div key={d.name} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
              <span className="text-stone-700 font-medium">
                {d.name}: {d.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 2: Confidence by Claim */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs flex flex-col">
        <div className="mb-2">
          <h4 className="text-xs font-mono uppercase tracking-wider text-stone-500 font-semibold">
            System Confidence by Claim
          </h4>
          <p className="text-xs text-stone-600">Certainty in evidentiary cross-examination (0-100%)</p>
        </div>
        <div className="h-52 w-full">
          {confidenceData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-stone-400">
              No claim data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={confidenceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#78716c' }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#78716c' }} />
                <Tooltip
                  formatter={(value: any, _name: any, item: any) => [
                    `${value}% (${item.payload.verdict})`,
                    item.payload.fullClaim.substring(0, 45) + '...',
                  ]}
                  contentStyle={{
                    backgroundColor: '#1c1917',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="confidence" fill="#0f766e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px] text-stone-500 font-mono">
          <span>Range: 0% to 100%</span>
          <span>Target: Corroborated Primary Evidence</span>
        </div>
      </div>

      {/* Chart 3: Supporting vs Contradicting Evidence */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs flex flex-col">
        <div className="mb-2">
          <h4 className="text-xs font-mono uppercase tracking-wider text-stone-500 font-semibold">
            Evidence Stance Balance
          </h4>
          <p className="text-xs text-stone-600">Supporting vs Contradicting citation counts</p>
        </div>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={evidenceStanceData}
              layout="vertical"
              margin={{ top: 10, right: 20, left: 30, bottom: 0 }}
            >
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11, fill: '#78716c' }} />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 10, fill: '#57534e' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1c1917',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px] text-stone-500">
          <span>Total evidentiary items extracted: {totalSupporting + totalContradicting}</span>
          <span className="font-mono">{totalConflicts} conflict flags</span>
        </div>
      </div>

      {/* Chart 4: Source Assessment Distribution */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs flex flex-col">
        <div className="mb-2">
          <h4 className="text-xs font-mono uppercase tracking-wider text-stone-500 font-semibold">
            Source Assessment Distribution
          </h4>
          <p className="text-xs text-stone-600">Reliability indicator classification of retrieved domains</p>
        </div>
        <div className="h-52 w-full">
          {sourceTierData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-stone-400">
              No sources registered
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceTierData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#78716c' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#78716c' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1c1917',
                    color: '#fff',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="#4338ca" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-[11px] text-stone-500">
          <span>{sources.length} unique sources cataloged</span>
          <span>Indicator only (not absolute truth)</span>
        </div>
      </div>
    </div>
  );
};
