// client/src/components/admin/TranslationTabs.tsx
'use client';

import React, { useState, useCallback } from 'react';
import { TranslationStatusBadge, TranslationStatus } from './TranslationStatusBadge';

export type Locale = 'sq' | 'en';

export interface TranslationField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'richtext';
  required?: boolean;
  placeholder?: string;
  rows?: number;
}

export interface TranslationData {
  [fieldName: string]: string;
}

interface TranslationTabsProps {
  fields: TranslationField[];
  sqData: TranslationData;
  enData: TranslationData;
  onSqChange: (data: TranslationData) => void;
  onEnChange: (data: TranslationData) => void;
  onAutoTranslate?: (sourceLocale: Locale, targetLocale: Locale) => Promise<void>;
  isAutoTranslating?: boolean;
  sqStatus?: TranslationStatus;
  enStatus?: TranslationStatus;
  disabled?: boolean;
}

export const TranslationTabs: React.FC<TranslationTabsProps> = ({
  fields,
  sqData,
  enData,
  onSqChange,
  onEnChange,
  onAutoTranslate,
  isAutoTranslating = false,
  sqStatus = 'complete',
  enStatus = 'missing',
  disabled = false,
}) => {
  const [activeTab, setActiveTab] = useState<Locale>('sq');

  const currentData = activeTab === 'sq' ? sqData : enData;
  const onChange = activeTab === 'sq' ? onSqChange : onEnChange;

  const handleFieldChange = useCallback(
    (fieldName: string, value: string) => {
      onChange({ ...currentData, [fieldName]: value });
    },
    [currentData, onChange]
  );

  const handleAutoTranslate = async () => {
    if (onAutoTranslate) {
      const sourceLocale = activeTab === 'sq' ? 'sq' : 'en';
      const targetLocale = activeTab === 'sq' ? 'en' : 'sq';
      await onAutoTranslate(sourceLocale, targetLocale);
    }
  };

  return (
    <div className="border border-gray-700 rounded-lg overflow-hidden">
      {/* Tab Headers */}
      <div className="flex border-b border-gray-700 bg-gray-800/50">
        <button
          type="button"
          onClick={() => setActiveTab('sq')}
          className={`
            flex-1 px-4 py-3 text-sm font-medium transition-colors
            flex items-center justify-center gap-2
            ${activeTab === 'sq'
              ? 'bg-gray-700 text-white border-b-2 border-amber-500'
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }
          `}
        >
          <span className="text-lg">🇦🇱</span>
          <span>Shqip (Albanian)</span>
          <TranslationStatusBadge status={sqStatus} showLabel={false} />
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('en')}
          className={`
            flex-1 px-4 py-3 text-sm font-medium transition-colors
            flex items-center justify-center gap-2
            ${activeTab === 'en'
              ? 'bg-gray-700 text-white border-b-2 border-amber-500'
              : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }
          `}
        >
          <span className="text-lg">🇬🇧</span>
          <span>English</span>
          <TranslationStatusBadge status={enStatus} showLabel={false} />
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-4 space-y-4 bg-gray-800/30">
        {fields.map((field) => (
          <div key={field.name}>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              {field.label}
              {field.required && <span className="text-red-400 ml-1">*</span>}
            </label>
            {field.type === 'textarea' ? (
              <textarea
                value={currentData[field.name] || ''}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                rows={field.rows || 4}
                disabled={disabled}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg
                  text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500
                  focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
            ) : (
              <input
                type="text"
                value={currentData[field.name] || ''}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                placeholder={field.placeholder}
                disabled={disabled}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg
                  text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500
                  focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              />
            )}
          </div>
        ))}

        {/* Auto-translate Button */}
        {onAutoTranslate && (
          <div className="pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={handleAutoTranslate}
              disabled={isAutoTranslating || disabled}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700
                text-white text-sm font-medium rounded-lg transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAutoTranslating ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Translating...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                  <span>
                    Auto-translate to {activeTab === 'sq' ? 'English' : 'Albanian'}
                  </span>
                </>
              )}
            </button>
            <p className="mt-2 text-xs text-gray-500">
              Auto-translated content will be marked for review
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TranslationTabs;
