// src/services/api.ts

// Base URL for your API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Event type definitions
export interface Event {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  event_type: 'featured' | 'recurring' | 'one-time';
  status: 'upcoming' | 'active' | 'completed' | 'cancelled';
  start_date: string;
  start_time: string;
  end_time?: string;
  end_date?: string;
  recurring_type?: 'none' | 'daily' | 'weekly' | 'monthly';
  recurring_days?: string;
  formatted_price: string;
  location: string;
  booking_required: boolean;
  booking_url?: string;
  is_featured: boolean;
  duration_display: string;
  capacity?: number;
  booking_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface EventFilters {
  event_type?: string;
  status?: string;
  is_active?: boolean;
  location?: string;
  date?: string;
}

export interface CreateEventData {
  title: string;
  description: string;
  image_url?: string;
  event_type: string;
  start_date: string;
  start_time: string;
  end_time?: string;
  end_date?: string;
  recurring_type?: string;
  recurring_days?: string;
  formatted_price: string;
  location: string;
  booking_required: boolean;
  booking_url?: string;
  is_featured?: boolean;
  capacity?: number;
}

// API Error handling
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorMessage = await response.text();
    throw new ApiError(response.status, errorMessage || `HTTP error! status: ${response.status}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text();
};

// Helper function to make authenticated requests
const makeRequest = async (
  url: string, 
  options: RequestInit = {}, 
  token?: string
) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  return handleResponse(response);
};

// API Client class
export class ApiClient {
  // Public Events (no authentication required)
  async getPublicEvents(): Promise<Event[]> {
    try {
      const response = await makeRequest('/events/public');
      return response;
    } catch (error) {
      console.error('Failed to fetch public events:', error);
      throw error;
    }
  }

  async getFeaturedEvents(): Promise<Event[]> {
    try {
      const response = await makeRequest('/events/featured');
      return response;
    } catch (error) {
      console.error('Failed to fetch featured events:', error);
      throw error;
    }
  }

  async getUpcomingEvents(limit?: number): Promise<Event[]> {
    try {
      const url = limit ? `/events/upcoming?limit=${limit}` : '/events/upcoming';
      const response = await makeRequest(url);
      return response;
    } catch (error) {
      console.error('Failed to fetch upcoming events:', error);
      throw error;
    }
  }

  async getEventTypes(): Promise<Array<{ id: string; name: string; count: number }>> {
    try {
      const response = await makeRequest('/events/types');
      return response;
    } catch (error) {
      console.error('Failed to fetch event types:', error);
      throw error;
    }
  }

  // Authenticated endpoints (require token)
  async getEvents(token: string, filters?: EventFilters): Promise<Event[]> {
    try {
      let url = '/events';
      
      if (filters) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            params.append(key, String(value));
          }
        });
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
      }

      const response = await makeRequest(url, { method: 'GET' }, token);
      return response;
    } catch (error) {
      console.error('Failed to fetch events:', error);
      throw error;
    }
  }

  async createEvent(token: string, eventData: CreateEventData): Promise<Event> {
    try {
      const response = await makeRequest(
        '/events',
        {
          method: 'POST',
          body: JSON.stringify(eventData),
        },
        token
      );
      return response;
    } catch (error) {
      console.error('Failed to create event:', error);
      throw error;
    }
  }

  async updateEvent(token: string, eventId: string, eventData: Partial<CreateEventData>): Promise<Event> {
    try {
      const response = await makeRequest(
        `/events/${eventId}`,
        {
          method: 'PUT',
          body: JSON.stringify(eventData),
        },
        token
      );
      return response;
    } catch (error) {
      console.error('Failed to update event:', error);
      throw error;
    }
  }

  async deleteEvent(token: string, eventId: string): Promise<void> {
    try {
      await makeRequest(
        `/events/${eventId}`,
        { method: 'DELETE' },
        token
      );
    } catch (error) {
      console.error('Failed to delete event:', error);
      throw error;
    }
  }

  async toggleEventActive(token: string, eventId: string): Promise<Event> {
    try {
      const response = await makeRequest(
        `/events/${eventId}/toggle-active`,
        { method: 'POST' },
        token
      );
      return response;
    } catch (error) {
      console.error('Failed to toggle event active status:', error);
      throw error;
    }
  }

  async toggleEventFeatured(token: string, eventId: string): Promise<Event> {
    try {
      const response = await makeRequest(
        `/events/${eventId}/toggle-featured`,
        { method: 'POST' },
        token
      );
      return response;
    } catch (error) {
      console.error('Failed to toggle event featured status:', error);
      throw error;
    }
  }

  // Additional utility methods
  async getEventById(eventId: string): Promise<Event> {
    try {
      const response = await makeRequest(`/events/${eventId}/public`);
      return response;
    } catch (error) {
      console.error('Failed to fetch event by ID:', error);
      throw error;
    }
  }

  async searchEvents(query: string): Promise<Event[]> {
    try {
      const response = await makeRequest(`/events/search?q=${encodeURIComponent(query)}`);
      return response;
    } catch (error) {
      console.error('Failed to search events:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export default as well for flexibility
export default apiClient;