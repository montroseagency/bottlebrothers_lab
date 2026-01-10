// client/src/components/admin/TranslationStatusBadge.tsx
'use client';

import React from 'react';

export type TranslationStatus = 'complete' | 'partial' | 'missing';

interface TranslationStatusBadgeProps {
  status: TranslationStatus;
  locale?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

const statusConfig = {
  complete: {
    label: 'Complete',
    bgColor: 'bg-green-500/20',
    textColor: 'text-green-400',
    borderColor: 'border-green-500/30',
    icon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  partial: {
    label: 'Partial',
    bgColor: 'bg-yellow-500/20',
    textColor: 'text-yellow-400',
    borderColor: 'border-yellow-500/30',
    icon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01" />
      </svg>
    ),
  },
  missing: {
    label: 'Missing',
    bgColor: 'bg-red-500/20',
    textColor: 'text-red-400',
    borderColor: 'border-red-500/30',
    icon: (
      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
};

export const TranslationStatusBadge: React.FC<TranslationStatusBadgeProps> = ({
  status,
  locale,
  showLabel = true,
  size = 'sm',
}) => {
  const config = statusConfig[status];
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full border
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeClasses} font-medium
      `}
    >
      {config.icon}
      {showLabel && (
        <span>
          {locale ? `${locale.toUpperCase()} ` : ''}
          {config.label}
        </span>
      )}
    </span>
  );
};

interface TranslationStatusGroupProps {
  sqStatus: TranslationStatus;
  enStatus: TranslationStatus;
}

export const TranslationStatusGroup: React.FC<TranslationStatusGroupProps> = ({
  sqStatus,
  enStatus,
}) => {
  return (
    <div className="flex items-center gap-2">
      <TranslationStatusBadge status={sqStatus} locale="sq" />
      <TranslationStatusBadge status={enStatus} locale="en" />
    </div>
  );
};

export default TranslationStatusBadge;
