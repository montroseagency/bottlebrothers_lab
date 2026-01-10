// client/src/components/admin/HomeSectionsManagement.tsx
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { TranslationTabs, TranslationField, TranslationData } from './TranslationTabs';
import { TranslationStatusBadge, TranslationStatus } from './TranslationStatusBadge';
import {
  getHomeSections,
  getHomeSection,
  updateHomeSection,
  publishHomeSection,
  unpublishHomeSection,
  HomeSection,
  SECTION_TYPE_LABELS,
} from '@/lib/api/homeSections';
import {
  getTranslations,
  saveTranslations,
  publishTranslations,
  translationsToRecord,
} from '@/lib/api/translations';

const TRANSLATION_FIELDS: TranslationField[] = [
  { name: 'title', label: 'Title', type: 'text', required: true },
  { name: 'subtitle', label: 'Subtitle', type: 'text' },
  { name: 'description', label: 'Description', type: 'textarea', rows: 4 },
  { name: 'button_text', label: 'Button Text', type: 'text' },
  { name: 'secondary_button_text', label: 'Secondary Button Text', type: 'text' },
];

export const HomeSectionsManagement: React.FC = () => {
  const [sections, setSections] = useState<HomeSection[]>([]);
  const [selectedSection, setSelectedSection] = useState<HomeSection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAutoTranslating, setIsAutoTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Translation data
  const [sqData, setSqData] = useState<TranslationData>({});
  const [enData, setEnData] = useState<TranslationData>({});
  const [sqStatus, setSqStatus] = useState<TranslationStatus>('complete');
  const [enStatus, setEnStatus] = useState<TranslationStatus>('missing');

  // Non-translatable fields
  const [buttonUrl, setButtonUrl] = useState('');
  const [secondaryButtonUrl, setSecondaryButtonUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [displayOrder, setDisplayOrder] = useState(0);

  // Load sections
  const loadSections = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getHomeSections();
      setSections(data);
    } catch (err) {
      setError('Failed to load home sections');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSections();
  }, [loadSections]);

  // Load section details and translations
  const handleSelectSection = async (section: HomeSection) => {
    setSelectedSection(section);
    setError(null);
    setSuccessMessage(null);

    // Set Albanian (original) data
    setSqData({
      title: section.title || '',
      subtitle: section.subtitle || '',
      description: section.description || '',
      button_text: section.button_text || '',
      secondary_button_text: section.secondary_button_text || '',
    });

    // Set non-translatable fields
    setButtonUrl(section.button_url || '');
    setSecondaryButtonUrl(section.secondary_button_url || '');
    setVideoUrl(section.video_url || '');
    setIsActive(section.is_active);
    setDisplayOrder(section.display_order);

    // Load English translations
    try {
      const translations = await getTranslations('homesection', section.id, 'en');
      const enTranslations = translationsToRecord(translations, 'en');
      setEnData(enTranslations);

      // Update status
      setSqStatus('complete'); // Albanian is always the source
      setEnStatus(
        Object.keys(enTranslations).length >= TRANSLATION_FIELDS.filter(f => f.required).length
          ? 'complete'
          : Object.keys(enTranslations).length > 0
          ? 'partial'
          : 'missing'
      );
    } catch (err) {
      console.error('Failed to load translations:', err);
      setEnData({});
      setEnStatus('missing');
    }
  };

  // Save section
  const handleSave = async () => {
    if (!selectedSection) return;

    setIsSaving(true);
    setError(null);

    try {
      // Update Albanian content (main model)
      await updateHomeSection(selectedSection.id, {
        title: sqData.title,
        subtitle: sqData.subtitle,
        description: sqData.description,
        button_text: sqData.button_text,
        button_url: buttonUrl,
        secondary_button_text: sqData.secondary_button_text,
        secondary_button_url: secondaryButtonUrl,
        video_url: videoUrl || undefined,
        is_active: isActive,
        display_order: displayOrder,
      });

      // Save English translations
      if (Object.keys(enData).some(k => enData[k])) {
        await saveTranslations({
          object_id: selectedSection.id,
          content_type: 'api.homesection',
          locale: 'en',
          translations: enData,
        });

        // Publish English translations
        await publishTranslations({
          object_id: selectedSection.id,
          locale: 'en',
        });
      }

      setSuccessMessage('Section saved successfully!');
      loadSections();

      // Update status
      setEnStatus(
        Object.keys(enData).filter(k => enData[k]).length >= TRANSLATION_FIELDS.filter(f => f.required).length
          ? 'complete'
          : Object.keys(enData).filter(k => enData[k]).length > 0
          ? 'partial'
          : 'missing'
      );
    } catch (err) {
      setError('Failed to save section');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // Publish/Unpublish
  const handleTogglePublish = async () => {
    if (!selectedSection) return;

    try {
      if (selectedSection.is_published) {
        await unpublishHomeSection(selectedSection.id);
      } else {
        await publishHomeSection(selectedSection.id);
      }
      loadSections();
      setSuccessMessage(
        selectedSection.is_published ? 'Section unpublished' : 'Section published'
      );
    } catch (err) {
      setError('Failed to update publish status');
      console.error(err);
    }
  };

  // Auto-translate placeholder
  const handleAutoTranslate = async () => {
    setIsAutoTranslating(true);
    try {
      // Copy Albanian content to English as placeholder
      // In a real implementation, this would call a translation API
      setEnData({
        title: sqData.title,
        subtitle: sqData.subtitle,
        description: sqData.description,
        button_text: sqData.button_text,
        secondary_button_text: sqData.secondary_button_text,
      });
      setEnStatus('partial');
      setSuccessMessage('Content copied. Please review and edit the English translation.');
    } catch (err) {
      setError('Auto-translate failed');
    } finally {
      setIsAutoTranslating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Sections List */}
      <div className="col-span-4">
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Home Sections</h2>
            <p className="text-sm text-gray-400">Manage homepage content</p>
          </div>
          <div className="divide-y divide-gray-700">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSelectSection(section)}
                className={`w-full px-4 py-3 text-left transition-colors ${
                  selectedSection?.id === section.id
                    ? 'bg-amber-500/10 border-l-2 border-amber-500'
                    : 'hover:bg-gray-700/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">
                      {SECTION_TYPE_LABELS[section.section_type] || section.section_type}
                    </p>
                    <p className="text-sm text-gray-400 truncate">{section.title}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {section.is_published ? (
                      <span className="px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                        Published
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-xs bg-gray-500/20 text-gray-400 rounded-full">
                        Draft
                      </span>
                    )}
                    <TranslationStatusBadge
                      status={section.translation_status_en}
                      locale="en"
                      showLabel={false}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Panel */}
      <div className="col-span-8">
        {selectedSection ? (
          <div className="bg-gray-800 rounded-lg border border-gray-700">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {SECTION_TYPE_LABELS[selectedSection.section_type]}
                </h2>
                <p className="text-sm text-gray-400">Edit section content</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleTogglePublish}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedSection.is_published
                      ? 'bg-gray-600 hover:bg-gray-500 text-white'
                      : 'bg-green-600 hover:bg-green-500 text-white'
                  }`}
                >
                  {selectedSection.is_published ? 'Unpublish' : 'Publish'}
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black
                    rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>

            {/* Messages */}
            {error && (
              <div className="mx-4 mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="mx-4 mt-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
                {successMessage}
              </div>
            )}

            <div className="p-4 space-y-6">
              {/* Translation Tabs */}
              <TranslationTabs
                fields={TRANSLATION_FIELDS}
                sqData={sqData}
                enData={enData}
                onSqChange={setSqData}
                onEnChange={setEnData}
                onAutoTranslate={handleAutoTranslate}
                isAutoTranslating={isAutoTranslating}
                sqStatus={sqStatus}
                enStatus={enStatus}
              />

              {/* Non-translatable Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Button URL
                  </label>
                  <input
                    type="text"
                    value={buttonUrl}
                    onChange={(e) => setButtonUrl(e.target.value)}
                    placeholder="/reservations"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg
                      text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Secondary Button URL
                  </label>
                  <input
                    type="text"
                    value={secondaryButtonUrl}
                    onChange={(e) => setSecondaryButtonUrl(e.target.value)}
                    placeholder="/menu"
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg
                      text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Video URL (YouTube/Vimeo)
                  </label>
                  <input
                    type="url"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://youtube.com/..."
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg
                      text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded-lg
                      text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-amber-500
                      focus:ring-amber-500 focus:ring-offset-gray-800"
                  />
                  <span className="text-sm text-gray-300">Section is active</span>
                </label>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 text-center">
            <p className="text-gray-400">Select a section to edit</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomeSectionsManagement;
