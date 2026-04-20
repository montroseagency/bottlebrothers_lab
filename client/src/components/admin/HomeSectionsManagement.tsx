'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import {
  getHomeSections,
  createHomeSection,
  updateHomeSectionWithImage,
  HomeSection,
} from '@/lib/api/homeSections';

// ─── Types ───────────────────────────────────────────────────────────────────

type SectionKey = 'hero' | 'story' | 'reviews';

interface SectionConfig {
  key: SectionKey;
  number: number;
  label: string;
  sublabel: string;
  description: string;
  icon: React.ReactNode;
  uploadType: 'background' | 'four-images';
}

// ─── Section Configs ─────────────────────────────────────────────────────────

const SECTIONS: SectionConfig[] = [
  {
    key: 'hero',
    number: 1,
    label: 'Hero',
    sublabel: 'Background Photo',
    description: 'The full-screen photo visitors see first when they open the website.',
    uploadType: 'background',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    key: 'story',
    number: 2,
    label: 'Our Story',
    sublabel: '4 Photos',
    description: 'The 4 photos displayed in the story section (2-column grid on the right side).',
    uploadType: 'four-images',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
      </svg>
    ),
  },
  {
    key: 'reviews',
    number: 3,
    label: 'What Our Guests Say',
    sublabel: 'Background Photo',
    description: 'The background photo for the reviews/testimonials section of the home page.',
    uploadType: 'background',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
];

// ─── Image Upload Slot ────────────────────────────────────────────────────────

interface UploadSlotProps {
  label: string;
  hint?: string;
  preview: string | null;
  onChange: (file: File, preview: string) => void;
}

function UploadSlot({ label, hint, preview, onChange }: UploadSlotProps) {
  const ref = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    onChange(file, URL.createObjectURL(file));
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-800">{label}</span>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="w-full rounded-2xl border-2 border-dashed border-gray-200 hover:border-amber-400 transition-colors overflow-hidden group focus:outline-none focus:ring-2 focus:ring-amber-400"
      >
        {preview ? (
          <div className="relative w-full h-48">
            <Image src={preview} alt={label} fill className="object-cover" unoptimized />
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <svg className="w-7 h-7 text-white mb-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-white text-sm font-medium">Click to replace</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-48 text-gray-400 hover:text-amber-500 transition-colors">
            <div className="w-14 h-14 rounded-full bg-gray-100 group-hover:bg-amber-50 flex items-center justify-center mb-3 transition-colors">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <span className="text-sm font-semibold">Click to upload photo</span>
            <span className="text-xs mt-1 text-gray-400">JPG, PNG, WebP accepted</span>
          </div>
        )}
      </button>
      <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleChange} />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const HomeSectionsManagement: React.FC = () => {
  const [dbSections, setDbSections] = useState<HomeSection[]>([]);
  const [selectedKey, setSelectedKey] = useState<SectionKey | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // Image state for all 3 sections
  const [heroBgFile, setHeroBgFile] = useState<File | null>(null);
  const [heroBgPreview, setHeroBgPreview] = useState<string | null>(null);

  const [storyFiles, setStoryFiles] = useState<(File | null)[]>([null, null, null, null]);
  const [storyPreviews, setStoryPreviews] = useState<(string | null)[]>([null, null, null, null]);

  const [reviewsBgFile, setReviewsBgFile] = useState<File | null>(null);
  const [reviewsBgPreview, setReviewsBgPreview] = useState<string | null>(null);

  // Load sections from DB
  useEffect(() => {
    (async () => {
      try {
        const data = await getHomeSections();
        setDbSections(data);

        // Populate previews from existing DB images
        const hero = data.find(s => s.section_type === 'hero');
        const story = data.find(s => s.section_type === 'story');
        const reviews = data.find(s => s.section_type === 'reviews');

        if (hero?.background_image_url) setHeroBgPreview(hero.background_image_url);
        if (story) {
          setStoryPreviews([
            story.image_url || null,
            story.image_2_url || null,
            story.image_3_url || null,
            story.image_4_url || null,
          ]);
        }
        if (reviews?.background_image_url) setReviewsBgPreview(reviews.background_image_url);
      } catch {
        showToast('error', 'Failed to load sections. Is the server running?');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const showToast = (type: 'success' | 'error', msg: string) => setToast({ type, msg });

  const getOrCreateSection = async (sectionType: string): Promise<HomeSection> => {
    const existing = dbSections.find(s => s.section_type === sectionType);
    if (existing) return existing;

    const created = await createHomeSection({
      section_type: sectionType,
      title: sectionType === 'hero' ? 'Hero Section' : sectionType === 'story' ? 'Our Story' : 'What Our Guests Say',
      is_active: true,
      display_order: sectionType === 'hero' ? 1 : sectionType === 'story' ? 2 : 3,
    });
    return created;
  };

  const handleSave = async () => {
    if (!selectedKey) return;
    setIsSaving(true);

    try {
      if (selectedKey === 'hero') {
        if (!heroBgFile && !heroBgPreview) {
          showToast('error', 'Please upload a background photo first.');
          setIsSaving(false);
          return;
        }
        if (heroBgFile) {
          const section = await getOrCreateSection('hero');
          const fd = new FormData();
          fd.append('background_image', heroBgFile);
          fd.append('is_active', 'true');
          fd.append('is_published', 'true');
          await updateHomeSectionWithImage(section.id, fd);
        }
        showToast('success', 'Hero background saved! Refresh the home page to see changes.');
      }

      if (selectedKey === 'story') {
        const hasNewFile = storyFiles.some(f => f !== null);
        if (!hasNewFile && storyPreviews.every(p => !p)) {
          showToast('error', 'Please upload at least one photo.');
          setIsSaving(false);
          return;
        }
        if (hasNewFile) {
          const section = await getOrCreateSection('story');
          const fd = new FormData();
          if (storyFiles[0]) fd.append('image', storyFiles[0]);
          if (storyFiles[1]) fd.append('image_2', storyFiles[1]);
          if (storyFiles[2]) fd.append('image_3', storyFiles[2]);
          if (storyFiles[3]) fd.append('image_4', storyFiles[3]);
          fd.append('is_active', 'true');
          fd.append('is_published', 'true');
          await updateHomeSectionWithImage(section.id, fd);
        }
        showToast('success', 'Story photos saved! Refresh the home page to see changes.');
      }

      if (selectedKey === 'reviews') {
        if (!reviewsBgFile && !reviewsBgPreview) {
          showToast('error', 'Please upload a background photo first.');
          setIsSaving(false);
          return;
        }
        if (reviewsBgFile) {
          const section = await getOrCreateSection('reviews');
          const fd = new FormData();
          fd.append('background_image', reviewsBgFile);
          fd.append('is_active', 'true');
          fd.append('is_published', 'true');
          await updateHomeSectionWithImage(section.id, fd);
        }
        showToast('success', "Reviews background saved! Refresh the home page to see changes.");
      }

      // Refresh DB sections
      const data = await getHomeSections();
      setDbSections(data);
    } catch (err) {
      console.error(err);
      showToast('error', 'Save failed. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const selectedConfig = SECTIONS.find(s => s.key === selectedKey) ?? null;

  const hasChanges = (() => {
    if (selectedKey === 'hero') return !!heroBgFile;
    if (selectedKey === 'story') return storyFiles.some(f => f !== null);
    if (selectedKey === 'reviews') return !!reviewsBgFile;
    return false;
  })();

  // ─── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-amber-500 mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-3xl mx-auto space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Home Page Photos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Choose a section below and upload new photos. Changes appear live on the{' '}
          <a href="/" target="_blank" rel="noopener" className="text-amber-600 hover:underline font-medium">
            home page →
          </a>
        </p>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`flex items-start gap-3 p-4 rounded-xl text-sm border ${
          toast.type === 'success'
            ? 'bg-green-50 border-green-200 text-green-800'
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {toast.type === 'success' ? (
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          )}
          <span>{toast.msg}</span>
          <button onClick={() => setToast(null)} className="ml-auto opacity-60 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Step 1: Section Picker */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Step 1 — Choose a section</p>
        </div>
        <div className="p-6 grid grid-cols-3 gap-4">
          {SECTIONS.map((section) => {
            const isActive = selectedKey === section.key;
            const dbSection = dbSections.find(s =>
              s.section_type === section.key
            );
            const hasPhoto = section.key === 'hero'
              ? !!dbSection?.background_image_url
              : section.key === 'story'
              ? !!(dbSection?.image_url || dbSection?.image_2_url)
              : !!dbSection?.background_image_url;

            return (
              <button
                key={section.key}
                type="button"
                onClick={() => setSelectedKey(isActive ? null : section.key)}
                className={`relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 text-left transition-all focus:outline-none ${
                  isActive
                    ? 'border-amber-400 bg-amber-50 shadow-md'
                    : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50/40'
                }`}
              >
                {/* Number badge */}
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                  isActive ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}>
                  {section.number}
                </div>

                {/* Icon */}
                <div className={`${isActive ? 'text-amber-600' : 'text-gray-400'}`}>
                  {section.icon}
                </div>

                {/* Labels */}
                <div className="text-center">
                  <p className={`font-bold text-sm ${isActive ? 'text-amber-700' : 'text-gray-800'}`}>
                    {section.label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{section.sublabel}</p>
                </div>

                {/* Status dot */}
                <div className={`w-2 h-2 rounded-full ${hasPhoto ? 'bg-green-400' : 'bg-gray-300'}`}
                  title={hasPhoto ? 'Has photo' : 'No photo yet'} />

                {/* Selected checkmark */}
                {isActive && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 2: Upload Form */}
      {selectedConfig && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
              {selectedConfig.number}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Step 2 — Upload photo</p>
              <p className="text-sm font-semibold text-gray-800 mt-0.5">{selectedConfig.label}</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Description */}
            <p className="text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3 border border-gray-100">
              {selectedConfig.description}
            </p>

            {/* Upload area */}
            {selectedConfig.uploadType === 'background' && (
              <>
                {selectedConfig.key === 'hero' && (
                  <UploadSlot
                    label="Background Photo"
                    hint="Best size: 1920 × 1080 px"
                    preview={heroBgPreview}
                    onChange={(file, preview) => { setHeroBgFile(file); setHeroBgPreview(preview); }}
                  />
                )}
                {selectedConfig.key === 'reviews' && (
                  <UploadSlot
                    label="Background Photo"
                    hint="Best size: 1920 × 1080 px"
                    preview={reviewsBgPreview}
                    onChange={(file, preview) => { setReviewsBgFile(file); setReviewsBgPreview(preview); }}
                  />
                )}
              </>
            )}

            {selectedConfig.uploadType === 'four-images' && (
              <div className="grid grid-cols-2 gap-4">
                {(['Top Left', 'Bottom Left', 'Top Right', 'Bottom Right'] as const).map((pos, i) => (
                  <UploadSlot
                    key={i}
                    label={`Photo ${i + 1}`}
                    hint={pos}
                    preview={storyPreviews[i]}
                    onChange={(file, preview) => {
                      setStoryFiles(prev => { const n = [...prev]; n[i] = file; return n; });
                      setStoryPreviews(prev => { const n = [...prev]; n[i] = preview; return n; });
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 3: Save */}
      {selectedConfig && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Step 3 — Save</p>
              <p className="text-sm text-gray-600">
                {hasChanges
                  ? 'You have unsaved changes. Click Save to apply them to the website.'
                  : 'Upload a photo above, then click Save.'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                hasChanges && !isSaving
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md hover:shadow-lg'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {isSaving ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Save Changes
                </>
              )}
            </button>
          </div>

          {/* View on website link */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            After saving, visit{' '}
            <a href="/" target="_blank" rel="noopener" className="text-amber-500 hover:underline font-medium">
              the home page
            </a>{' '}
            and do a hard refresh (Ctrl+Shift+R) to see your changes.
          </div>
        </div>
      )}

      {/* Empty state */}
      {!selectedConfig && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 py-16 flex flex-col items-center text-center px-8">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="font-semibold text-gray-700 mb-1">Select a section above to get started</p>
          <p className="text-sm text-gray-400">Each section controls specific photos on the home page</p>
        </div>
      )}

    </div>
  );
};

export default HomeSectionsManagement;
