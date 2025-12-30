import { apiClient } from './client';

export interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  event_type: 'featured' | 'regular' | 'recurring';
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  start_date: string;
  end_date?: string;
  start_time: string;
  end_time: string;
  recurring_type?: 'none' | 'daily' | 'weekly' | 'monthly';
  recurring_days?: string;
  recurring_until?: string;
  price: string;
  formatted_price?: string;
  price_display?: string;
  capacity?: number;
  max_capacity?: number;
  location: string;
  booking_required: boolean;
  booking_url?: string;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  special_notes?: string;
  special_instructions?: string;
  created_at: string;
  updated_at: string;
  formatted_time?: string;
  duration_display?: string;
  price_formatted?: string;
}

export interface EventsResponse {
  results: Event[];
  count: number;
  next?: string;
  previous?: string;
}

export async function getEvents(params?: {
  limit?: number;
  offset?: number;
  is_featured?: boolean;
  event_type?: string;
  status?: string;
}): Promise<EventsResponse> {
  const queryParams = new URLSearchParams();

  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());
  if (params?.is_featured !== undefined) queryParams.set('is_featured', params.is_featured.toString());
  if (params?.event_type) queryParams.set('event_type', params.event_type);
  if (params?.status) queryParams.set('status', params.status);

  const query = queryParams.toString();
  return apiClient.get<EventsResponse>(`/events/${query ? `?${query}` : ''}`);
}

export async function getFeaturedEvent(): Promise<Event | null> {
  try {
    const response = await getEvents({ is_featured: true, limit: 1, status: 'upcoming' });
    return response.results[0] || null;
  } catch (error) {
    console.error('Error fetching featured event:', error);
    return null;
  }
}

export async function getUpcomingEvents(limit: number = 3): Promise<Event[]> {
  try {
    const response = await getEvents({ limit, status: 'upcoming' });
    return response.results;
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }
}

export async function getEventById(id: string): Promise<Event> {
  return apiClient.get<Event>(`/events/${id}/`);
}
