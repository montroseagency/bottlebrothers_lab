// client/src/lib/api/translations.ts
import api from './index';

export interface Translation {
  id: string;
  content_type: number;
  content_type_name: string;
  object_id: string;
  locale: 'sq' | 'en';
  field_name: string;
  translated_text: string;
  status: 'draft' | 'pending' | 'approved' | 'published';
  is_auto_translated: boolean;
  translated_by: string;
  created_at: string;
  updated_at: string;
}

export interface TranslationCreatePayload {
  object_id: string;
  content_type: string; // e.g., 'api.event'
  locale: 'sq' | 'en';
  translations: Record<string, string>;
}

export interface TranslationPublishPayload {
  object_id: string;
  locale: 'sq' | 'en';
}

// Get translations for an object
export async function getTranslations(
  contentType: string,
  objectId: string,
  locale?: 'sq' | 'en'
): Promise<Translation[]> {
  const params = new URLSearchParams({
    content_type: contentType,
    object_id: objectId,
  });
  if (locale) {
    params.append('locale', locale);
  }
  const response = await api.get(`/admin/translations/?${params}`);
  return response.data.results || response.data;
}

// Bulk create/update translations
export async function saveTranslations(payload: TranslationCreatePayload): Promise<{
  created: Array<{ id: string; field_name: string; was_created: boolean }>;
}> {
  const response = await api.post('/admin/translations/bulk_create/', payload);
  return response.data;
}

// Publish translations for an object
export async function publishTranslations(payload: TranslationPublishPayload): Promise<{
  updated_count: number;
}> {
  const response = await api.post('/admin/translations/publish/', payload);
  return response.data;
}

// Get a single translation
export async function getTranslation(id: string): Promise<Translation> {
  const response = await api.get(`/admin/translations/${id}/`);
  return response.data;
}

// Update a single translation
export async function updateTranslation(
  id: string,
  data: Partial<Translation>
): Promise<Translation> {
  const response = await api.patch(`/admin/translations/${id}/`, data);
  return response.data;
}

// Delete a translation
export async function deleteTranslation(id: string): Promise<void> {
  await api.delete(`/admin/translations/${id}/`);
}

// Helper to convert translations array to a record
export function translationsToRecord(
  translations: Translation[],
  locale: 'sq' | 'en'
): Record<string, string> {
  return translations
    .filter((t) => t.locale === locale)
    .reduce((acc, t) => {
      acc[t.field_name] = t.translated_text;
      return acc;
    }, {} as Record<string, string>);
}

// Helper to check translation status
export function getTranslationStatus(
  translations: Translation[],
  locale: 'sq' | 'en',
  requiredFields: string[]
): 'complete' | 'partial' | 'missing' {
  const localeTranslations = translations.filter(
    (t) => t.locale === locale && t.status === 'published'
  );

  if (localeTranslations.length === 0) {
    return 'missing';
  }

  const translatedFields = localeTranslations.map((t) => t.field_name);
  const hasAll = requiredFields.every((f) => translatedFields.includes(f));

  return hasAll ? 'complete' : 'partial';
}

export default {
  getTranslations,
  saveTranslations,
  publishTranslations,
  getTranslation,
  updateTranslation,
  deleteTranslation,
  translationsToRecord,
  getTranslationStatus,
};
