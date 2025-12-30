import { apiClient } from './client';

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image: string;
  category: 'food' | 'interior' | 'events' | 'cocktails' | 'atmosphere' | 'other';
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryResponse {
  results: GalleryItem[];
  count: number;
  next?: string;
  previous?: string;
}

export async function getGalleryItems(params?: {
  limit?: number;
  offset?: number;
  category?: string;
  is_featured?: boolean;
  is_active?: boolean;
}): Promise<GalleryResponse> {
  const queryParams = new URLSearchParams();

  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());
  if (params?.category) queryParams.set('category', params.category);
  if (params?.is_featured !== undefined) queryParams.set('is_featured', params.is_featured.toString());
  if (params?.is_active !== undefined) queryParams.set('is_active', params.is_active.toString());

  const query = queryParams.toString();
  return apiClient.get<GalleryResponse>(`/gallery/${query ? `?${query}` : ''}`);
}

export async function getFeaturedGalleryItems(limit: number = 8): Promise<GalleryItem[]> {
  try {
    const response = await getGalleryItems({ is_featured: true, is_active: true, limit });
    return response.results;
  } catch (error) {
    console.error('Error fetching featured gallery items:', error);
    return [];
  }
}

export async function getGalleryItemById(id: string): Promise<GalleryItem> {
  return apiClient.get<GalleryItem>(`/gallery/${id}/`);
}
