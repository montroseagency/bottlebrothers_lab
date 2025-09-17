// client/src/services/api.ts
const API_BASE_URL = 'http://localhost:8000/api';

// Types
export interface Reservation {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  party_size: number;
  occasion: string;
  special_requests?: string;
  dietary_restrictions?: string;
  status: 'pending' | 'confirmed' | 'seated' | 'completed' | 'cancelled' | 'no_show';
  created_at: string;
  updated_at: string;
  is_past_date: boolean;
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
  available_capacity: number;
  is_available: boolean;
}

export interface DayAvailability {
  date: string;
  slots: TimeSlot[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  event_date?: string;
  guest_count?: number;
  event_type?: string;
  is_read: boolean;
  is_replied: boolean;
  created_at: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image: string;
  image_url?: string;
  category: 'food' | 'interior' | 'events' | 'staff' | 'atmosphere' | 'other';
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryFormData {
  title: string;
  description: string;
  image?: File;
  category: string;
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
}

export class ApiClient {
  private baseURL: string;
  private token: string | null;

  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('adminToken');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }
    
    return response.json();
  }

  private async formRequest<T>(
    endpoint: string,
    formData: FormData,
    method: 'POST' | 'PUT' | 'PATCH' = 'POST'
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      method,
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      body: formData,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP ${response.status}`);
    }
    
    return response.json();
  }

  // Reservation methods
  async createReservation(data: ReservationFormData): Promise<Reservation> {
    return this.request<Reservation>('/reservations/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getReservations(): Promise<Reservation[]> {
    return this.request<Reservation[]>('/reservations/');
  }

  async getReservation(id: string): Promise<Reservation> {
    return this.request<Reservation>(`/reservations/${id}/`);
  }

  async updateReservation(id: string, data: Partial<ReservationFormData>): Promise<Reservation> {
    return this.request<Reservation>(`/reservations/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async updateReservationStatus(id: string, status: string): Promise<Reservation> {
    return this.request<Reservation>(`/reservations/${id}/update_status/`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async cancelReservation(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/reservations/${id}/cancel/`, {
      method: 'POST',
    });
  }

  async lookupReservation(email: string, phone: string): Promise<Reservation[]> {
    const params = new URLSearchParams({ email, phone });
    return this.request<Reservation[]>(`/reservations/lookup/?${params}`);
  }

  async getAvailability(startDate: string, endDate?: string): Promise<DayAvailability[]> {
    const params = new URLSearchParams({ start_date: startDate });
    if (endDate) params.append('end_date', endDate);
    return this.request<DayAvailability[]>(`/reservations/availability/?${params}`);
  }

  // Contact methods
  async sendContactMessage(data: any): Promise<{ message: string; data: ContactMessage }> {
    return this.request<{ message: string; data: ContactMessage }>('/contact/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getContactMessages(): Promise<ContactMessage[]> {
    return this.request<ContactMessage[]>('/contact/');
  }

  async markMessageRead(id: string): Promise<ContactMessage> {
    return this.request<ContactMessage>(`/contact/${id}/mark_read/`, {
      method: 'PATCH',
    });
  }

  async markMessageReplied(id: string): Promise<ContactMessage> {
    return this.request<ContactMessage>(`/contact/${id}/mark_replied/`, {
      method: 'PATCH',
    });
  }

  // Gallery methods
  async getGalleryItems(params?: { category?: string; featured?: boolean }): Promise<GalleryItem[]> {
    const queryParams = new URLSearchParams();
    if (params?.category) queryParams.append('category', params.category);
    if (params?.featured) queryParams.append('featured', 'true');
    
    const query = queryParams.toString();
    return this.request<GalleryItem[]>(`/gallery/${query ? `?${query}` : ''}`);
  }

  async getPublicGalleryItems(category?: string): Promise<GalleryItem[]> {
    const params = category ? `?category=${category}` : '';
    return this.request<GalleryItem[]>(`/gallery/public/${params}`);
  }

  async getFeaturedGalleryItems(): Promise<GalleryItem[]> {
    return this.request<GalleryItem[]>('/gallery/featured/');
  }

  async getGalleryCategories(): Promise<Array<{ value: string; label: string; count: number }>> {
    return this.request<Array<{ value: string; label: string; count: number }>>('/gallery/categories/');
  }

  async createGalleryItem(data: GalleryFormData): Promise<GalleryItem> {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('is_featured', data.is_featured.toString());
    formData.append('display_order', data.display_order.toString());
    formData.append('is_active', data.is_active.toString());
    
    if (data.image) {
      formData.append('image', data.image);
    }

    return this.formRequest<GalleryItem>('/gallery/', formData, 'POST');
  }

  async updateGalleryItem(id: string, data: Partial<GalleryFormData>): Promise<GalleryItem> {
    const formData = new FormData();
    
    if (data.title) formData.append('title', data.title);
    if (data.description) formData.append('description', data.description);
    if (data.category) formData.append('category', data.category);
    if (data.is_featured !== undefined) formData.append('is_featured', data.is_featured.toString());
    if (data.display_order !== undefined) formData.append('display_order', data.display_order.toString());
    if (data.is_active !== undefined) formData.append('is_active', data.is_active.toString());
    if (data.image) formData.append('image', data.image);

    return this.formRequest<GalleryItem>(`/gallery/${id}/`, formData, 'PATCH');
  }

  async deleteGalleryItem(id: string): Promise<void> {
    await this.request<void>(`/gallery/${id}/`, {
      method: 'DELETE',
    });
  }

  async toggleGalleryItemActive(id: string): Promise<GalleryItem> {
    return this.request<GalleryItem>(`/gallery/${id}/toggle_active/`, {
      method: 'PATCH',
    });
  }

  async toggleGalleryItemFeatured(id: string): Promise<GalleryItem> {
    return this.request<GalleryItem>(`/gallery/${id}/toggle_featured/`, {
      method: 'PATCH',
    });
  }

  // Dashboard methods
  async getDashboardData(): Promise<any> {
    return this.request<any>('/reservations/dashboard/');
  }

  async getDashboardAnalytics(): Promise<any> {
    return this.request<any>('/dashboard/analytics/');
  }

  // Auth methods
  setToken(token: string): void {
    this.token = token;
    localStorage.setItem('adminToken', token);
  }

  clearToken(): void {
    this.token = null;
    localStorage.removeItem('adminToken');
  }
}

export const apiClient = new ApiClient();
export default apiClient;