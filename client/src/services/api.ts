

// ========== SAFE ENVIRONMENT HANDLING ==========
const getApiBaseUrl = (): string => {
  // Check for window-based environment variables (if set by build process)
  if (typeof window !== 'undefined' && (window as any)?.__ENV__?.REACT_APP_API_URL) {
    return (window as any).__ENV__.REACT_APP_API_URL;
  }
  
  // Safely check for process.env
  try {
    if (typeof process !== 'undefined' && process?.env?.REACT_APP_API_URL) {
      return process.env.REACT_APP_API_URL;
    }
  } catch {
    // process is not available, continue to fallback
  }
  
  // Development fallback
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

export interface ReservationFormData {
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

export interface TimeSlot {
  time: string;
  time_display: string;
  is_available: boolean;
  available_capacity?: number;
  existing_reservations?: number;
}

export interface DayAvailability {
  date: string;
  slots: TimeSlot[];
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject: 'reservation' | 'private_event' | 'catering' | 'corporate' | 'feedback' | 'general';
  message: string;
  event_date?: string;
  guest_count?: number;
  event_type?: 'wedding' | 'birthday' | 'corporate' | 'anniversary' | 'graduation' | 'other';
  is_read?: boolean;
  is_replied?: boolean;
  created_at?: string;
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

// MENU TYPES
export interface MenuCategory {
  id: string;
  name: string;
  category_type: string;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  items_count: number;
  menu_items?: MenuItem[];
  created_at?: string;
  updated_at?: string;
}

export interface MenuItem {
  id: string;
  category: string;
  category_name: string;
  category_type: string;
  name: string;
  description: string;
  price: number;
  formatted_price: string;
  image?: File | null;
  image_url?: string;
  dietary_info: string[];
  tags: string[];
  ingredients: string;
  allergens: string;
  calories?: number;
  preparation_time: string;
  is_available: boolean;
  is_featured: boolean;
  display_order: number;
  has_variants: boolean;
  variants?: MenuItemVariant[];
  created_at?: string;
  updated_at?: string;
}

export interface MenuItemVariant {
  id: string;
  name: string;
  description: string;
  price: number;
  formatted_price: string;
  variant_type: string;
  display_order: number;
  is_available: boolean;
}

export interface CreateMenuCategoryData {
  name: string;
  category_type: string;
  description?: string;
  icon?: string;
  display_order?: number;
  is_active?: boolean;
}

export interface UpdateMenuCategoryData extends Partial<CreateMenuCategoryData> {
  id?: string;
}

export interface CreateMenuItemData {
  category: string;
  name: string;
  description: string;
  price: number;
  image?: File | null;
  dietary_info?: string[];
  tags?: string[];
  ingredients?: string;
  allergens?: string;
  calories?: number;
  preparation_time?: string;
  is_available?: boolean;
  is_featured?: boolean;
  display_order?: number;
  has_variants?: boolean;
}

export interface UpdateMenuItemData extends Partial<CreateMenuItemData> {
  id?: string;
}

export interface CreateMenuItemVariantData {
  menu_item: string;
  name: string;
  description?: string;
  price: number;
  variant_type: string;
  display_order?: number;
  is_available?: boolean;
}

export interface UpdateMenuItemVariantData extends Partial<CreateMenuItemVariantData> {
  id?: string;
}

export interface MenuFilters {
  category?: string;
  category_type?: string;
  featured?: boolean;
  dietary?: string;
  search?: string;
  is_available?: boolean;
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
        errorMessage = errorData.message || errorData.error || errorData.detail || errorMessage;
        
        // Handle Django validation errors
        if (errorData.non_field_errors) {
          errorMessage = errorData.non_field_errors.join(', ');
        } else if (typeof errorData === 'object') {
          const firstKey = Object.keys(errorData)[0];
          if (firstKey && errorData[firstKey]) {
            const errorValue = errorData[firstKey];
            errorMessage = Array.isArray(errorValue) ? errorValue.join(', ') : String(errorValue);
          }
        }
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
      } else if (Array.isArray(value)) {
        formData.append(key, JSON.stringify(value));
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
   * Get available time slots for a specific date
   */
  async getAvailability(startDate: string, endDate?: string): Promise<DayAvailability[]> {
    try {
      const params: Record<string, string> = { start_date: startDate };
      if (endDate) {
        params.end_date = endDate;
      }
      
      return await makeRequest<DayAvailability[]>('/reservations/availability/', { method: 'GET' }, undefined, params);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
      throw error;
    }
  }

  /**
   * Create a new reservation (public endpoint)
   */
  async createReservation(reservationData: ReservationFormData): Promise<Reservation> {
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
   * Lookup reservations by email and phone (public endpoint)
   */
  async lookupReservation(email: string, phone: string): Promise<Reservation[]> {
    try {
      return await makeRequest<Reservation[]>('/reservations/lookup/', { method: 'GET' }, undefined, { email, phone });
    } catch (error) {
      console.error('Failed to lookup reservation:', error);
      throw error;
    }
  }

  /**
   * Cancel a reservation (public endpoint with reservation ID)
   */
  async cancelReservation(reservationId: string): Promise<{ message: string; reservation: Reservation }> {
    try {
      return await makeRequest<{ message: string; reservation: Reservation }>(
        `/reservations/${reservationId}/cancel/`,
        { method: 'POST' }
      );
    } catch (error) {
      console.error('Failed to cancel reservation:', error);
      throw error;
    }
  }

  // ========== ADMIN RESERVATIONS (require authentication) ==========

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
  async getReservationStats(token: string): Promise<ReservationStats> {
    try {
      return await makeRequest<ReservationStats>('/reservations/stats/', { method: 'GET' }, token);
    } catch (error) {
      console.error('Failed to fetch reservation stats:', error);
      // Fallback to calculating from reservations list
      try {
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
      } catch (fallbackError) {
        throw error; // Throw original error
      }
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

  // ========== CONTACT MESSAGES ==========

  /**
   * Submit a contact message (public endpoint)
   */
  async submitContactMessage(contactData: ContactMessage): Promise<{ message: string }> {
    try {
      const result = await makeRequest<ContactMessage>(
        '/contact/',
        {
          method: 'POST',
          body: JSON.stringify(contactData),
        }
      );
      
      return { message: 'Message sent successfully' };
    } catch (error) {
      console.error('Failed to submit contact message:', error);
      throw error;
    }
  }

  /**
   * Get all contact messages (requires authentication)
   */
  async getContactMessages(token: string): Promise<ContactMessage[]> {
    try {
      return await makeRequest<ContactMessage[]>('/contact/', { method: 'GET' }, token);
    } catch (error) {
      console.error('Failed to fetch contact messages:', error);
      throw error;
    }
  }

  /**
   * Mark contact message as read
   */
  async markMessageRead(token: string, messageId: string): Promise<ContactMessage> {
    try {
      return await makeRequest<ContactMessage>(
        `/contact/${messageId}/mark_read/`,
        { method: 'PATCH' },
        token
      );
    } catch (error) {
      console.error('Failed to mark message as read:', error);
      throw error;
    }
  }

  // ========== AUTHENTICATION ==========

  /**
   * Admin login
   */
  async adminLogin(username: string, password: string): Promise<{
    access: string;
    refresh: string;
    user: any;
    message: string;
  }> {
    try {
      const response = await makeRequest<{
        access: string;
        refresh: string;
        user: any;
        message: string;
      }>('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      // Store tokens in localStorage
      if (response.access) {
        localStorage.setItem('access_token', response.access);
      }
      if (response.refresh) {
        localStorage.setItem('refresh_token', response.refresh);
      }

      return response;
    } catch (error) {
      console.error('Failed to login:', error);
      throw error;
    }
  }

  /**
   * Admin logout
   */
  async adminLogout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        await makeRequest('/auth/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
      // Continue with cleanup even if request fails
    } finally {
      // Always clear local storage
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
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

  // ========== MENU ==========

  /**
   * Get menu categories (public endpoint)
   */
  async getPublicMenuCategories(filters?: MenuFilters): Promise<MenuCategory[]> {
    try {
      return await makeRequest<MenuCategory[]>('/menu/categories/public/', { method: 'GET' }, undefined, filters);
    } catch (error) {
      console.error('Failed to fetch public menu categories:', error);
      throw error;
    }
  }

  /**
   * Get menu items by category (public endpoint)
   */
  async getPublicMenuByCategory(filters?: MenuFilters): Promise<MenuCategory[]> {
    try {
      return await makeRequest<MenuCategory[]>('/menu/items/by_category/', { method: 'GET' }, undefined, filters);
    } catch (error) {
      console.error('Failed to fetch public menu by category:', error);
      throw error;
    }
  }

  /**
   * Get public menu items
   */
  async getPublicMenuItems(filters?: MenuFilters): Promise<MenuItem[]> {
    try {
      return await makeRequest<MenuItem[]>('/menu/items/public/', { method: 'GET' }, undefined, filters);
    } catch (error) {
      console.error('Failed to fetch public menu items:', error);
      throw error;
    }
  }

  // ========== ADMIN MENU (require authentication) ==========

  /**
   * Get all menu categories (requires authentication)
   */
  async getMenuCategories(token: string, filters?: MenuFilters): Promise<MenuCategory[]> {
    try {
      return await makeRequest<MenuCategory[]>('/menu/categories/', { method: 'GET' }, token, filters);
    } catch (error) {
      console.error('Failed to fetch menu categories:', error);
      throw error;
    }
  }

  /**
   * Create a new menu category
   */
  async createMenuCategory(token: string, categoryData: CreateMenuCategoryData): Promise<MenuCategory> {
    try {
      return await makeRequest<MenuCategory>(
        '/menu/categories/',
        {
          method: 'POST',
          body: JSON.stringify(categoryData),
        },
        token
      );
    } catch (error) {
      console.error('Failed to create menu category:', error);
      throw error;
    }
  }

  /**
   * Update a menu category
   */
  async updateMenuCategory(token: string, categoryId: string, categoryData: UpdateMenuCategoryData): Promise<MenuCategory> {
    try {
      return await makeRequest<MenuCategory>(
        `/menu/categories/${categoryId}/`,
        {
          method: 'PATCH',
          body: JSON.stringify(categoryData),
        },
        token
      );
    } catch (error) {
      console.error('Failed to update menu category:', error);
      throw error;
    }
  }

  /**
   * Delete a menu category
   */
  async deleteMenuCategory(token: string, categoryId: string): Promise<void> {
    try {
      await makeRequest<void>(
        `/menu/categories/${categoryId}/`,
        { method: 'DELETE' },
        token
      );
    } catch (error) {
      console.error('Failed to delete menu category:', error);
      throw error;
    }
  }

  /**
   * Toggle menu category active status
   */
  async toggleMenuCategoryActive(token: string, categoryId: string): Promise<MenuCategory> {
    try {
      return await makeRequest<MenuCategory>(
        `/menu/categories/${categoryId}/toggle_active/`,
        { method: 'PATCH' },
        token
      );
    } catch (error) {
      console.error('Failed to toggle menu category active status:', error);
      throw error;
    }
  }

  /**
   * Get all menu items (requires authentication)
   */
  async getMenuItems(token: string, filters?: MenuFilters): Promise<MenuItem[]> {
    try {
      return await makeRequest<MenuItem[]>('/menu/items/', { method: 'GET' }, token, filters);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
      throw error;
    }
  }

  /**
   * Create a new menu item
   */
  async createMenuItem(token: string, itemData: CreateMenuItemData): Promise<MenuItem> {
    try {
      const formData = createFormData(itemData);
      return await makeRequest<MenuItem>(
        '/menu/items/',
        {
          method: 'POST',
          body: formData,
        },
        token
      );
    } catch (error) {
      console.error('Failed to create menu item:', error);
      throw error;
    }
  }

  /**
   * Update a menu item
   */
  async updateMenuItem(token: string, itemId: string, itemData: UpdateMenuItemData): Promise<MenuItem> {
    try {
      const formData = createFormData(itemData);
      return await makeRequest<MenuItem>(
        `/menu/items/${itemId}/`,
        {
          method: 'PATCH',
          body: formData,
        },
        token
      );
    } catch (error) {
      console.error('Failed to update menu item:', error);
      throw error;
    }
  }

  /**
   * Delete a menu item
   */
  async deleteMenuItem(token: string, itemId: string): Promise<void> {
    try {
      await makeRequest<void>(
        `/menu/items/${itemId}/`,
        { method: 'DELETE' },
        token
      );
    } catch (error) {
      console.error('Failed to delete menu item:', error);
      throw error;
    }
  }

  /**
   * Toggle menu item available status
   */
  async toggleMenuItemAvailable(token: string, itemId: string): Promise<MenuItem> {
    try {
      return await makeRequest<MenuItem>(
        `/menu/items/${itemId}/toggle_available/`,
        { method: 'PATCH' },
        token
      );
    } catch (error) {
      console.error('Failed to toggle menu item available status:', error);
      throw error;
    }
  }

  /**
   * Toggle menu item featured status
   */
  async toggleMenuItemFeatured(token: string, itemId: string): Promise<MenuItem> {
    try {
      return await makeRequest<MenuItem>(
        `/menu/items/${itemId}/toggle_featured/`,
        { method: 'PATCH' },
        token
      );
    } catch (error) {
      console.error('Failed to toggle menu item featured status:', error);
      throw error;
    }
  }

  /**
   * Get menu item variants
   */
  async getMenuItemVariants(token: string, itemId: string): Promise<MenuItemVariant[]> {
    try {
      return await makeRequest<MenuItemVariant[]>('/menu/variants/', { method: 'GET' }, token, { menu_item: itemId });
    } catch (error) {
      console.error('Failed to fetch menu item variants:', error);
      throw error;
    }
  }

  /**
   * Create a menu item variant
   */
  async createMenuItemVariant(token: string, variantData: CreateMenuItemVariantData): Promise<MenuItemVariant> {
    try {
      return await makeRequest<MenuItemVariant>(
        '/menu/variants/',
        {
          method: 'POST',
          body: JSON.stringify(variantData),
        },
        token
      );
    } catch (error) {
      console.error('Failed to create menu item variant:', error);
      throw error;
    }
  }

  /**
   * Update a menu item variant
   */
  async updateMenuItemVariant(token: string, variantId: string, variantData: UpdateMenuItemVariantData): Promise<MenuItemVariant> {
    try {
      return await makeRequest<MenuItemVariant>(
        `/menu/variants/${variantId}/`,
        {
          method: 'PATCH',
          body: JSON.stringify(variantData),
        },
        token
      );
    } catch (error) {
      console.error('Failed to update menu item variant:', error);
      throw error;
    }
  }

  /**
   * Delete a menu item variant
   */
  async deleteMenuItemVariant(token: string, variantId: string): Promise<void> {
    try {
      await makeRequest<void>(
        `/menu/variants/${variantId}/`,
        { method: 'DELETE' },
        token
      );
    } catch (error) {
      console.error('Failed to delete menu item variant:', error);
      throw error;
    }
  }

  // ========== UTILITY METHODS ==========

  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      return await makeRequest<{ status: string; timestamp: string }>('/', { method: 'GET' });
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