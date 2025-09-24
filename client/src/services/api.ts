// client/src/services/api.ts - COMPLETE VERSION WITH RESERVATIONS
const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && (window as any)?.env?.REACT_APP_API_URL) {
    return (window as any).env.REACT_APP_API_URL;
  }
  
  if (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  return 'http://localhost:8000/api';
};

const API_BASE_URL = getApiBaseUrl();

// ========== TYPE DEFINITIONS ==========

export interface Event {
  id: string;
  title: string;
  description: string;
  image?: string;
  image_url?: string;
  event_type: 'featured' | 'recurring' | 'one-time' | 'regular';
  status?: 'upcoming' | 'active' | 'completed' | 'cancelled';
  start_date: string;
  start_time: string;
  end_time?: string;
  end_date?: string;
  recurring_type?: 'none' | 'daily' | 'weekly' | 'monthly';
  recurring_days?: string;
  recurring_until?: string;
  formatted_price: string;
  price?: number;
  price_display?: string;
  location: string;
  capacity?: number;
  max_capacity?: number;
  booking_required: boolean;
  booking_url?: string;
  is_featured: boolean;
  duration_display: string;
  formatted_time?: string;
  special_notes?: string;
  special_instructions?: string;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  is_past_event?: boolean;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image?: string;
  image_url?: string;
  category: 'food' | 'interior' | 'events' | 'cocktails' | 'atmosphere' | 'other';
  is_featured: boolean;
  display_order?: number;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

// RESERVATION TYPES - Updated to match backend
export interface Reservation {
  id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  party_size: number;
  occasion?: 'birthday' | 'anniversary' | 'business' | 'date' | 'family' | 'celebration' | 'casual' | 'other';
  special_requests?: string;
  dietary_restrictions?: string;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
  created_at: string;
  updated_at: string;
  is_past_date?: boolean;
}

export interface ReservationFilters {
  status?: string;
  date?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
  email?: string;
  phone?: string;
}

export interface CreateReservationData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  party_size: number;
  occasion?: string;
  special_requests?: string;
  dietary_restrictions?: string;
}

export interface UpdateReservationData extends Partial<CreateReservationData> {
  status?: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
}

export interface ReservationStats {
  total_reservations: number;
  confirmed_reservations: number;
  pending_reservations: number;
  cancelled_reservations: number;
  completed_reservations: number;
  seated_reservations: number;
  no_show_reservations: number;
  today_reservations: number;
}

export interface EventFilters {
  event_type?: string;
  status?: string;
  is_active?: boolean;
  location?: string;
  date?: string;
  featured?: boolean;
  search?: string;
}

export interface GalleryFilters {
  category?: string;
  featured?: boolean;
  search?: string;
  is_active?: boolean;
}

export interface CreateEventData {
  title: string;
  description: string;
  image?: File | null;
  event_type: string;
  status?: string;
  start_date: string;
  start_time: string;
  end_time?: string;
  end_date?: string;
  recurring_type?: string;
  recurring_days?: string;
  recurring_until?: string;
  formatted_price: string;
  price?: number;
  location: string;
  capacity?: number;
  booking_required: boolean;
  booking_url?: string;
  is_featured?: boolean;
  special_notes?: string;
  display_order?: number;
}

export interface UpdateEventData extends Partial<CreateEventData> {
  id?: string;
}

export interface CreateGalleryData {
  title: string;
  description: string;
  image: File;
  category: string;
  is_featured?: boolean;
  display_order?: number;
}

export interface UpdateGalleryData extends Partial<Omit<CreateGalleryData, 'image'>> {
  id?: string;
  image?: File | null;
}

export interface EventTypeResponse {
  value: string;
  label: string;
  count: number;
}

export interface GalleryCategoryResponse {
  value: string;
  label: string;
  count: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: 'success' | 'error';
}

// ========== ERROR HANDLING ==========

export class ApiError extends Error {
  public readonly status: number;
  public readonly response?: Response;
  
  constructor(status: number, message: string, response?: Response) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.response = response;
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }

  public isNetworkError(): boolean {
    return this.status === 0 || this.status >= 500;
  }

  public isClientError(): boolean {
    return this.status >= 400 && this.status < 500;
  }

  public isUnauthorized(): boolean {
    return this.status === 401;
  }

  public isForbidden(): boolean {
    return this.status === 403;
  }

  public isNotFound(): boolean {
    return this.status === 404;
  }
}

// ========== UTILITY FUNCTIONS ==========

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } else {
        errorMessage = await response.text() || errorMessage;
      }
    } catch (parseError) {
      console.warn('Failed to parse error response:', parseError);
    }
    
    throw new ApiError(response.status, errorMessage, response);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  const textResponse = await response.text();
  return textResponse as unknown as T;
};

export const createHeaders = (token?: string, isFormData: boolean = false): Record<string, string> => {
  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

export const buildUrl = (endpoint: string, params?: Record<string, any>): string => {
  let url = `${API_BASE_URL}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }
  
  return url;
};

const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
  params?: Record<string, any>
): Promise<T> => {
  try {
    const isFormData = options.body instanceof FormData;
    const headers = createHeaders(token, isFormData);
    const url = buildUrl(endpoint, params);

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers as Record<string, string>),
      },
    });

    return await handleResponse<T>(response);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    
    console.error('Request failed:', error);
    throw new ApiError(0, `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const createFormData = (data: Record<string, any>): FormData => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (value instanceof File) {
        formData.append(key, value);
      } else if (typeof value === 'boolean') {
        formData.append(key, value ? 'true' : 'false');
      } else {
        formData.append(key, String(value));
      }
    }
  });

  return formData;
};

// ========== API CLIENT CLASS ==========

export class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // ========== RESERVATIONS ==========

  /**
   * Get all reservations (requires authentication)
   */
  async getReservations(token: string, filters?: ReservationFilters): Promise<Reservation[]> {
    try {
      return await makeRequest<Reservation[]>('/reservations/', { method: 'GET' }, token, filters);
    } catch (error) {
      console.error('Failed to fetch reservations:', error);
      throw error;
    }
  }

  /**
   * Get reservation statistics for dashboard
   */
  async getReservationStats(token: string, dateFrom?: string, dateTo?: string): Promise<ReservationStats> {
    try {
      // Since backend doesn't have dedicated stats endpoint yet, calculate from reservations
      const reservations = await this.getReservations(token);
      const today = new Date().toISOString().split('T')[0];
      
      const stats: ReservationStats = {
        total_reservations: reservations.length,
        confirmed_reservations: reservations.filter(r => r.status === 'confirmed').length,
        pending_reservations: reservations.filter(r => r.status === 'pending').length,
        cancelled_reservations: reservations.filter(r => r.status === 'cancelled').length,
        completed_reservations: reservations.filter(r => r.status === 'completed').length,
        seated_reservations: reservations.filter(r => r.status === 'seated').length,
        no_show_reservations: reservations.filter(r => r.status === 'no_show').length,
        today_reservations: reservations.filter(r => r.date === today).length,
      };

      return stats;
    } catch (error) {
      console.error('Failed to fetch reservation stats:', error);
      throw error;
    }
  }

  /**
   * Get a single reservation by ID
   */
  async getReservationById(token: string, reservationId: string): Promise<Reservation> {
    try {
      return await makeRequest<Reservation>(`/reservations/${reservationId}/`, { method: 'GET' }, token);
    } catch (error) {
      console.error('Failed to fetch reservation by ID:', error);
      throw error;
    }
  }

  /**
   * Create a new reservation
   */
  async createReservation(reservationData: CreateReservationData): Promise<Reservation> {
    try {
      return await makeRequest<Reservation>(
        '/reservations/',
        {
          method: 'POST',
          body: JSON.stringify(reservationData),
        }
      );
    } catch (error) {
      console.error('Failed to create reservation:', error);
      throw error;
    }
  }

  /**
   * Update a reservation (requires authentication)
   */
  async updateReservation(token: string, reservationId: string, reservationData: UpdateReservationData): Promise<Reservation> {
    try {
      return await makeRequest<Reservation>(
        `/reservations/${reservationId}/`,
        {
          method: 'PATCH',
          body: JSON.stringify(reservationData),
        },
        token
      );
    } catch (error) {
      console.error('Failed to update reservation:', error);
      throw error;
    }
  }

  /**
   * Cancel a reservation
   */
  async cancelReservation(token: string, reservationId: string): Promise<Reservation> {
    try {
      return await makeRequest<Reservation>(
        `/reservations/${reservationId}/cancel/`,
        { method: 'POST' },
        token
      );
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
      throw error;
    }
  }

  /**
   * Confirm a reservation
   */
  async confirmReservation(token: string, reservationId: string): Promise<Reservation> {
    try {
      return await makeRequest<Reservation>(
        `/reservations/${reservationId}/`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'confirmed' }),
        },
        token
      );
    } catch (error) {
      console.error('Failed to confirm reservation:', error);
      throw error;
    }
  }

  /**
   * Mark reservation as seated
   */
  async seatReservation(token: string, reservationId: string): Promise<Reservation> {
    try {
      return await makeRequest<Reservation>(
        `/reservations/${reservationId}/`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'seated' }),
        },
        token
      );
    } catch (error) {
      console.error('Failed to seat reservation:', error);
      throw error;
    }
  }

  /**
   * Complete a reservation
   */
  async completeReservation(token: string, reservationId: string): Promise<Reservation> {
    try {
      return await makeRequest<Reservation>(
        `/reservations/${reservationId}/`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'completed' }),
        },
        token
      );
    } catch (error) {
      console.error('Failed to complete reservation:', error);
      throw error;
    }
  }

  /**
   * Mark reservation as no-show
   */
  async markNoShow(token: string, reservationId: string): Promise<Reservation> {
    try {
      return await makeRequest<Reservation>(
        `/reservations/${reservationId}/`,
        {
          method: 'PATCH',
          body: JSON.stringify({ status: 'no_show' }),
        },
        token
      );
    } catch (error) {
      console.error('Failed to mark reservation as no-show:', error);
      throw error;
    }
  }

  /**
   * Delete a reservation
   */
  async deleteReservation(token: string, reservationId: string): Promise<void> {
    try {
      await makeRequest<void>(
        `/reservations/${reservationId}/`,
        { method: 'DELETE' },
        token
      );
    } catch (error) {
      console.error('Failed to delete reservation:', error);
      throw error;
    }
  }

  /**
   * Lookup reservations by email and phone
   */
  async lookupReservation(email: string, phone: string): Promise<Reservation[]> {
    try {
      return await makeRequest<Reservation[]>('/reservations/lookup/', { method: 'GET' }, undefined, { email, phone });
    } catch (error) {
      console.error('Failed to lookup reservation:', error);
      throw error;
    }
  }

  // ========== EVENTS ==========

  async getPublicEvents(filters?: EventFilters): Promise<Event[]> {
    try {
      return await makeRequest<Event[]>('/events/public/', { method: 'GET' }, undefined, filters);
    } catch (error) {
      console.error('Failed to fetch public events:', error);
      throw error;
    }
  }

  async getFeaturedEvents(): Promise<Event[]> {
    try {
      return await makeRequest<Event[]>('/events/featured/', { method: 'GET' });
    } catch (error) {
      console.error('Failed to fetch featured events:', error);
      throw error;
    }
  }

  async getUpcomingEvents(limit?: number): Promise<Event[]> {
    try {
      const params = limit ? { limit } : undefined;
      return await makeRequest<Event[]>('/events/upcoming/', { method: 'GET' }, undefined, params);
    } catch (error) {
      console.error('Failed to fetch upcoming events:', error);
      throw error;
    }
  }

  async getEventTypes(): Promise<EventTypeResponse[]> {
    try {
      return await makeRequest<EventTypeResponse[]>('/events/types/', { method: 'GET' });
    } catch (error) {
      console.error('Failed to fetch event types:', error);
      throw error;
    }
  }

  async getEventById(eventId: string): Promise<Event> {
    try {
      return await makeRequest<Event>(`/events/public/${eventId}/`, { method: 'GET' });
    } catch (error) {
      console.error('Failed to fetch event by ID:', error);
      throw error;
    }
  }

  async searchEvents(query: string, filters?: Omit<EventFilters, 'search'>): Promise<Event[]> {
    try {
      const params = { search: query, ...filters };
      return await makeRequest<Event[]>('/events/public/', { method: 'GET' }, undefined, params);
    } catch (error) {
      console.error('Failed to search events:', error);
      throw error;
    }
  }

  async getEvents(token: string, filters?: EventFilters): Promise<Event[]> {
    try {
      return await makeRequest<Event[]>('/events/', { method: 'GET' }, token, filters);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      throw error;
    }
  }

  async createEvent(token: string, eventData: CreateEventData): Promise<Event> {
    try {
      const formData = createFormData(eventData);
      return await makeRequest<Event>(
        '/events/',
        {
          method: 'POST',
          body: formData,
        },
        token
      );
    } catch (error) {
      console.error('Failed to create event:', error);
      throw error;
    }
  }

  async updateEvent(token: string, eventId: string, eventData: UpdateEventData): Promise<Event> {
    try {
      const formData = createFormData(eventData);
      return await makeRequest<Event>(
        `/events/${eventId}/`,
        {
          method: 'PATCH',
          body: formData,
        },
        token
      );
    } catch (error) {
      console.error('Failed to update event:', error);
      throw error;
    }
  }

  async deleteEvent(token: string, eventId: string): Promise<void> {
    try {
      await makeRequest<void>(
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
      return await makeRequest<Event>(
        `/events/${eventId}/toggle_active/`,
        { method: 'PATCH' },
        token
      );
    } catch (error) {
      console.error('Failed to toggle event active status:', error);
      throw error;
    }
  }

  async toggleEventFeatured(token: string, eventId: string): Promise<Event> {
    try {
      return await makeRequest<Event>(
        `/events/${eventId}/toggle_featured/`,
        { method: 'PATCH' },
        token
      );
    } catch (error) {
      console.error('Failed to toggle event featured status:', error);
      throw error;
    }
  }

  // ========== GALLERY ==========

  async getPublicGalleryItems(filters?: GalleryFilters): Promise<GalleryItem[]> {
    try {
      return await makeRequest<GalleryItem[]>('/gallery/public/', { method: 'GET' }, undefined, filters);
    } catch (error) {
      console.error('Failed to fetch public gallery items:', error);
      throw error;
    }
  }

  async getGalleryCategories(): Promise<GalleryCategoryResponse[]> {
    try {
      return await makeRequest<GalleryCategoryResponse[]>('/gallery/categories/', { method: 'GET' });
    } catch (error) {
      console.error('Failed to fetch gallery categories:', error);
      throw error;
    }
  }

  async getGalleryItemById(itemId: string): Promise<GalleryItem> {
    try {
      return await makeRequest<GalleryItem>(`/gallery/public/${itemId}/`, { method: 'GET' });
    } catch (error) {
      console.error('Failed to fetch gallery item by ID:', error);
      throw error;
    }
  }

  async searchGallery(query: string, filters?: Omit<GalleryFilters, 'search'>): Promise<GalleryItem[]> {
    try {
      const params = { search: query, ...filters };
      return await makeRequest<GalleryItem[]>('/gallery/public/', { method: 'GET' }, undefined, params);
    } catch (error) {
      console.error('Failed to search gallery:', error);
      throw error;
    }
  }

  async getGalleryItems(token: string, filters?: GalleryFilters): Promise<GalleryItem[]> {
    try {
      return await makeRequest<GalleryItem[]>('/gallery/', { method: 'GET' }, token, filters);
    } catch (error) {
      console.error('Failed to fetch gallery items:', error);
      throw error;
    }
  }

  async createGalleryItem(token: string, galleryData: CreateGalleryData): Promise<GalleryItem> {
    try {
      const formData = createFormData(galleryData);
      return await makeRequest<GalleryItem>(
        '/gallery/',
        {
          method: 'POST',
          body: formData,
        },
        token
      );
    } catch (error) {
      console.error('Failed to create gallery item:', error);
      throw error;
    }
  }

  async updateGalleryItem(token: string, itemId: string, galleryData: UpdateGalleryData): Promise<GalleryItem> {
    try {
      const formData = createFormData(galleryData);
      return await makeRequest<GalleryItem>(
        `/gallery/${itemId}/`,
        {
          method: 'PATCH',
          body: formData,
        },
        token
      );
    } catch (error) {
      console.error('Failed to update gallery item:', error);
      throw error;
    }
  }

  async deleteGalleryItem(token: string, itemId: string): Promise<void> {
    try {
      await makeRequest<void>(
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
      return await makeRequest<GalleryItem>(
        `/gallery/${itemId}/toggle_active/`,
        { method: 'PATCH' },
        token
      );
    } catch (error) {
      console.error('Failed to toggle gallery item active status:', error);
      throw error;
    }
  }

  async toggleGalleryItemFeatured(token: string, itemId: string): Promise<GalleryItem> {
    try {
      return await makeRequest<GalleryItem>(
        `/gallery/${itemId}/toggle_featured/`,
        { method: 'PATCH' },
        token
      );
    } catch (error) {
      console.error('Failed to toggle gallery item featured status:', error);
      throw error;
    }
  }

  // ========== UTILITY METHODS ==========

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      return await makeRequest<{ status: string; timestamp: string }>('/health/', { method: 'GET' });
    } catch (error) {
      console.error('Health check failed:', error);
      throw error;
    }
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }
}

// ========== SINGLETON INSTANCE ==========
export const apiClient = new ApiClient();
export const createApiClient = (baseUrl?: string): ApiClient => {
  return new ApiClient(baseUrl);
};

export default apiClient;