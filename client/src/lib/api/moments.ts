// Moments API module
import { apiClient } from './client';

export interface Moment {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  created_at: string;
}

interface MomentsResponse {
  results?: Moment[];
}

export async function getMoments(): Promise<Moment[]> {
  try {
    const data = await apiClient.get<Moment[] | MomentsResponse>('/public/moments/');
    // Handle both array and paginated response formats
    const moments = Array.isArray(data) ? data : (data?.results || []);
    return moments;
  } catch (error) {
    console.error('Failed to fetch moments:', error);
    return [];
  }
}

export async function getActiveMoments(limit?: number): Promise<Moment[]> {
  try {
    const moments = await getMoments();
    return limit ? moments.slice(0, limit) : moments;
  } catch (error) {
    console.error('Failed to fetch active moments:', error);
    return [];
  }
}
