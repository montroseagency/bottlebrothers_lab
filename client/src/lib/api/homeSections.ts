// client/src/lib/api/homeSections.ts
import { apiClient } from './client';

export interface HomeSection {
  id: string;
  section_type: string;
  title: string;
  subtitle: string;
  description: string;
  button_text: string;
  button_url: string;
  secondary_button_text: string;
  secondary_button_url: string;
  image: string | null;
  image_url: string | null;
  background_image: string | null;
  background_image_url: string | null;
  video_url: string | null;
  extra_data: Record<string, unknown>;
  is_active: boolean;
  is_published: boolean;
  published_at: string | null;
  display_order: number;
  translation_status_en: 'complete' | 'partial' | 'missing';
  created_at: string;
  updated_at: string;
}

export interface HomeSectionCreatePayload {
  section_type: string;
  title: string;
  subtitle?: string;
  description?: string;
  button_text?: string;
  button_url?: string;
  secondary_button_text?: string;
  secondary_button_url?: string;
  video_url?: string;
  extra_data?: Record<string, unknown>;
  is_active?: boolean;
  display_order?: number;
}

// Get all home sections
export async function getHomeSections(): Promise<HomeSection[]> {
  const response = await apiClient.get<{ results?: HomeSection[] } | HomeSection[]>('/admin/home-sections/');
  return (response as { results?: HomeSection[] }).results || (response as HomeSection[]);
}

// Get a single home section
export async function getHomeSection(id: string): Promise<HomeSection> {
  return apiClient.get<HomeSection>(`/admin/home-sections/${id}/`);
}

// Create a home section
export async function createHomeSection(
  data: HomeSectionCreatePayload
): Promise<HomeSection> {
  return apiClient.post<HomeSection>('/admin/home-sections/', data);
}

// Update a home section
export async function updateHomeSection(
  id: string,
  data: Partial<HomeSectionCreatePayload>
): Promise<HomeSection> {
  return apiClient.patch<HomeSection>(`/admin/home-sections/${id}/`, data);
}

// Update with image (FormData)
export async function updateHomeSectionWithImage(
  id: string,
  formData: FormData
): Promise<HomeSection> {
  return apiClient.patch<HomeSection>(`/admin/home-sections/${id}/`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

// Delete a home section
export async function deleteHomeSection(id: string): Promise<void> {
  await apiClient.delete(`/admin/home-sections/${id}/`);
}

// Publish a home section
export async function publishHomeSection(id: string): Promise<{ status: string }> {
  return apiClient.post<{ status: string }>(`/admin/home-sections/${id}/publish/`);
}

// Unpublish a home section
export async function unpublishHomeSection(id: string): Promise<{ status: string }> {
  return apiClient.post<{ status: string }>(`/admin/home-sections/${id}/unpublish/`);
}

// Section type labels
export const SECTION_TYPE_LABELS: Record<string, string> = {
  hero: 'Hero Section',
  story: 'Our Story',
  signature_picks: 'Signature Picks',
  tonights_vibe: "Tonight's Vibe",
  upcoming_events: 'Upcoming Events',
  gallery_preview: 'Gallery Preview',
  reviews: 'Reviews Carousel',
  visit: 'Visit Section',
  location: 'Location Section',
  final_cta: 'Final CTA',
  custom: 'Custom Section',
};

export default {
  getHomeSections,
  getHomeSection,
  createHomeSection,
  updateHomeSection,
  updateHomeSectionWithImage,
  deleteHomeSection,
  publishHomeSection,
  unpublishHomeSection,
  SECTION_TYPE_LABELS,
};
