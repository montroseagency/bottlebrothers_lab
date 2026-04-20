// client/src/lib/api/homeSections.ts
import { adminFetch, apiClient } from './client';

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
  image_2: string | null;
  image_2_url: string | null;
  image_3: string | null;
  image_3_url: string | null;
  image_4: string | null;
  image_4_url: string | null;
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

// Get all home sections (admin)
export async function getHomeSections(): Promise<HomeSection[]> {
  const data = await adminFetch<{ results?: HomeSection[] } | HomeSection[]>('/admin/home-sections/');
  return (Array.isArray(data) ? data : data.results) ?? [];
}

// Get public home sections (no auth required)
export async function getPublicHomeSections(): Promise<HomeSection[]> {
  const data = await apiClient.get<{ results?: HomeSection[] } | HomeSection[]>('/public/home-sections/');
  return (Array.isArray(data) ? data : data.results) ?? [];
}

// Get a single home section
export async function getHomeSection(id: string): Promise<HomeSection> {
  return adminFetch<HomeSection>(`/admin/home-sections/${id}/`);
}

// Create a home section
export async function createHomeSection(data: HomeSectionCreatePayload): Promise<HomeSection> {
  return adminFetch<HomeSection>('/admin/home-sections/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

// Update a home section
export async function updateHomeSection(id: string, data: Partial<HomeSectionCreatePayload>): Promise<HomeSection> {
  return adminFetch<HomeSection>(`/admin/home-sections/${id}/`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

// Update with image (FormData)
export async function updateHomeSectionWithImage(id: string, formData: FormData): Promise<HomeSection> {
  return adminFetch<HomeSection>(`/admin/home-sections/${id}/`, {
    method: 'PATCH',
    body: formData,
  });
}

// Delete a home section
export async function deleteHomeSection(id: string): Promise<void> {
  await adminFetch<void>(`/admin/home-sections/${id}/`, { method: 'DELETE' });
}

// Publish a home section
export async function publishHomeSection(id: string): Promise<{ status: string }> {
  return adminFetch<{ status: string }>(`/admin/home-sections/${id}/publish/`, { method: 'POST' });
}

// Unpublish a home section
export async function unpublishHomeSection(id: string): Promise<{ status: string }> {
  return adminFetch<{ status: string }>(`/admin/home-sections/${id}/unpublish/`, { method: 'POST' });
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
