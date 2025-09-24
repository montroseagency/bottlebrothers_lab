// src/services/api.ts - COMPLETE VERSION

// Base URL for your API - using REACT_APP_ prefix for Create React App
const API_BASE_URL = (window as any)?.env?.REACT_APP_API_URL || 
                     (typeof process !== 'undefined' ? process.env.REACT_APP_API_URL : null) || 
                     'http://localhost:8000/api';

// Event type definitions
export interface Event {
  id: string;
  title: string;
  description: string;
  image_url?: string;
  event_type: 'featured' | 'recurring' | 'regular';
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

// Gallery type definitions
export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category: 'food' | 'interior' | 'events' | 'cocktails' | 'atmosphere' | 'staff' | 'other';
  is_featured: boolean;
  display_order?: number;
  is_active?: boolean;
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

export interface GalleryFilters {
  category?: string;
  is_featured?: boolean;
  is_active?: boolean;
}

export interface CreateEventData {
  title: string;
  description: string;
  image?: File;
  image_url?: string;
  event_type: string;
  start_date: string;
  start_time: string;
  end_time?: string;
  end_date?: string;
  frequency?: string;
  recurring_day?: string;
  price?: number;
  price_display?: string;
  location: string;
  booking_required: boolean;
  booking_url?: string;
  is_featured?: boolean;
  max_capacity?: number;
}

export interface CreateGalleryData {
  title: string;
  description: string;
  image: File;
  category: string;
  is_featured?: boolean;
  display_order?: number;
}

// API Error handling
export class ApiError extends Error {
  public status: number;
  
  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
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
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only add Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

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
      const response = await makeRequest('/events/public/');
      return response;
    } catch (error) {
      console.error('Failed to fetch public events:', error);
      throw error;
    }
  }

  async getFeaturedEvents(): Promise<Event[]> {
    try {
      const response = await makeRequest('/events/featured/');
      return response;
    } catch (error) {
      console.error('Failed to fetch featured events:', error);
      throw error;
    }
  }

  async getUpcomingEvents(limit?: number): Promise<Event[]> {
    try {
      const url = limit ? `/events/upcoming/?limit=${limit}` : '/events/upcoming/';
      const response = await makeRequest(url);
      return response;
    } catch (error) {
      console.error('Failed to fetch upcoming events:', error);
      throw error;
    }
  }

  async getEventTypes(): Promise<Array<{ value: string; label: string; count: number }>> {
    try {
      const response = await makeRequest('/events/types/');
      return response;
    } catch (error) {
      console.error('Failed to fetch event types:', error);
      throw error;
    }
  }

  // Public Gallery (no authentication required)
  async getPublicGalleryItems(filters?: GalleryFilters): Promise<GalleryItem[]> {
    try {
      let url = '/gallery/public/';
      
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

      const response = await makeRequest(url);
      return response;
    } catch (error) {
      console.error('Failed to fetch public gallery items:', error);
      throw error;
    }
  }

  async getFeaturedGalleryItems(): Promise<GalleryItem[]> {
    try {
      const response = await makeRequest('/gallery/public/?featured=true');
      return response;
    } catch (error) {
      console.error('Failed to fetch featured gallery items:', error);
      throw error;
    }
  }

  async getGalleryCategories(): Promise<Array<{ value: string; label: string; count: number }>> {
    try {
      const response = await makeRequest('/gallery/categories/');
      return response;
    } catch (error) {
      console.error('Failed to fetch gallery categories:', error);
      throw error;
    }
  }

  // Authenticated Gallery endpoints (require token)
  async getGalleryItems(token: string, filters?: GalleryFilters): Promise<GalleryItem[]> {
    try {
      let url = '/gallery/';
      
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
      console.error('Failed to fetch gallery items:', error);
      throw error;
    }
  }

  async createGalleryItem(token: string, galleryData: CreateGalleryData): Promise<GalleryItem> {
    try {
      const formData = new FormData();
      formData.append('title', galleryData.title);
      formData.append('description', galleryData.description);
      formData.append('image', galleryData.image);
      formData.append('category', galleryData.category);
      
      if (galleryData.is_featured !== undefined) {
        formData.append('is_featured', galleryData.is_featured.toString());
      }
      
      if (galleryData.display_order !== undefined) {
        formData.append('display_order', galleryData.display_order.toString());
      }

      const response = await makeRequest(
        '/gallery/',
        {
          method: 'POST',
          body: formData,
        },
        token
      );
      return response;
    } catch (error) {
      console.error('Failed to create gallery item:', error);
      throw error;
    }
  }

  async updateGalleryItem(token: string, itemId: string, galleryData: Partial<CreateGalleryData>): Promise<GalleryItem> {
    try {
      const formData = new FormData();
      
      Object.entries(galleryData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'image' && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response = await makeRequest(
        `/gallery/${itemId}/`,
        {
          method: 'PUT',
          body: formData,
        },
        token
      );
      return response;
    } catch (error) {
      console.error('Failed to update gallery item:', error);
      throw error;
    }
  }

  async deleteGalleryItem(token: string, itemId: string): Promise<void> {
    try {
      await makeRequest(
        `/gallery/${itemId}/`,
        { method: 'DELETE' },
        token
      );
    } catch (error) {
      console.error('Failed to delete gallery item:', error);
      throw error;
    }
  }

  async toggleGalleryItemActive(token: string, itemId: string): Promise<GalleryItem> {
    try {
      const response = await makeRequest(
        `/gallery/${itemId}/toggle_active/`,
        { method: 'PATCH' },
        token
      );
      return response;
    } catch (error) {
      console.error('Failed to toggle gallery item active status:', error);
      throw error;
    }
  }

  async toggleGalleryItemFeatured(token: string, itemId: string): Promise<GalleryItem> {
    try {
      const response = await makeRequest(
        `/gallery/${itemId}/toggle_featured/`,
        { method: 'PATCH' },
        token
      );
      return response;
    } catch (error) {
      console.error('Failed to toggle gallery item featured status:', error);
      throw error;
    }
  }

  // Authenticated Events endpoints (require token)
  async getEvents(token: string, filters?: EventFilters): Promise<Event[]> {
    try {
      let url = '/events/';
      
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
      const formData = new FormData();
      
      // Add all the fields to FormData
      Object.entries(eventData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'image' && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response = await makeRequest(
        '/events/',
        {
          method: 'POST',
          body: formData,
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
      const formData = new FormData();
      
      Object.entries(eventData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'image' && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });

      const response = await makeRequest(
        `/events/${eventId}/`,
        {
          method: 'PUT',
          body: formData,
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
        `/events/${eventId}/`,
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
        `/events/${eventId}/toggle_active/`,
        { method: 'PATCH' },
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
        `/events/${eventId}/toggle_featured/`,
        { method: 'PATCH' },
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
      const response = await makeRequest(`/events/${eventId}/`);
      return response;
    } catch (error) {
      console.error('Failed to fetch event by ID:', error);
      throw error;
    }
  }

  async getGalleryItemById(itemId: string): Promise<GalleryItem> {
    try {
      const response = await makeRequest(`/gallery/${itemId}/`);
      return response;
    } catch (error) {
      console.error('Failed to fetch gallery item by ID:', error);
      throw error;
    }
  }

  async searchEvents(query: string): Promise<Event[]> {
    try {
      const response = await makeRequest(`/events/public/?search=${encodeURIComponent(query)}`);
      return response;
    } catch (error) {
      console.error('Failed to search events:', error);
      throw error;
    }
  }

  async searchGalleryItems(query: string): Promise<GalleryItem[]> {
    try {
      const response = await makeRequest(`/gallery/public/?search=${encodeURIComponent(query)}`);
      return response;
    } catch (error) {
      console.error('Failed to search gallery items:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient();

// Export default as well for flexibility
export default apiClient;