import React from 'react';
import { OverallVerdictType } from '../types';
import { CheckCircle2, XCircle, AlertCircle, Split } from 'lucide-react';

interface VerdictBadgeProps {
  verdict: OverallVerdictType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const VerdictBadge: React.FC<VerdictBadgeProps> = ({
  verdict,
  size = 'md',
  showIcon = true,
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 tracking-wider gap-1.5',
    md: 'text-sm px-3 py-1 tracking-wide gap-2 font-medium',
    lg: 'text-base px-4 py-1.5 font-semibold tracking-wide gap-2.5',
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  switch (verdict) {
    case 'SUPPORTED':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono uppercase ${sizeClasses[size]}`}
        >
          {showIcon && <CheckCircle2 size={iconSizes[size]} className="text-emerald-600 shrink-0" />}
          SUPPORTED
        </span>
      );

    case 'CONTRADICTED':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-rose-50 text-rose-800 border border-rose-300 font-mono uppercase ${sizeClasses[size]}`}
        >
          {showIcon && <XCircle size={iconSizes[size]} className="text-rose-600 shrink-0" />}
          CONTRADICTED
        </span>
      );

    case 'CONFLICTING EVIDENCE':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-purple-50 text-purple-800 border border-purple-300 font-mono uppercase ${sizeClasses[size]}`}
        >
          {showIcon && <Split size={iconSizes[size]} className="text-purple-600 shrink-0" />}
          CONFLICTING EVIDENCE
        </span>
      );

    case 'INSUFFICIENT EVIDENCE':
    default:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-mono uppercase ${sizeClasses[size]}`}
        >
          {showIcon && <AlertCircle size={iconSizes[size]} className="text-amber-600 shrink-0" />}
          INSUFFICIENT EVIDENCE
        </span>
      );
  }
};
