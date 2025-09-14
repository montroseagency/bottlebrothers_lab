// client/src/services/api.ts
const API_BASE_URL = 'http://localhost:8000/api';

// API response types
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
  occasion?: string;
  special_requests?: string;
  dietary_restrictions?: string;
  status: string;
  created_at: string;
  updated_at: string;
  is_past_date: boolean;
}

export interface AvailabilitySlot {
  time: string;
  time_display: string;
  available_capacity: number;
  is_available: boolean;
}

export interface DayAvailability {
  date: string;
  slots: AvailabilitySlot[];
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  event_date?: string;
  guest_count?: number;
  event_type?: string;
  created_at?: string;
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

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  event_date?: string;
  guest_count?: number;
  event_type?: string;
}

// API Error types
export interface APIError {
  message: string;
  field?: string;
  code?: string;
}

export interface APIResponse<T> {
  data?: T;
  error?: APIError;
  success: boolean;
}

// API client class
export class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { detail: `HTTP error! status: ${response.status}` };
        }
        
        // Handle field-specific errors from Django REST framework
        if (typeof errorData === 'object' && errorData !== null) {
          if (errorData.detail) {
            throw new Error(errorData.detail);
          }
          if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
            throw new Error(errorData.non_field_errors.join(', '));
          }
          // Handle field-specific errors
          const fieldErrors = Object.entries(errorData)
            .filter(([key, value]) => Array.isArray(value))
            .map(([key, value]) => `${key}: ${(value as string[]).join(', ')}`)
            .join('; ');
          if (fieldErrors) {
            throw new Error(fieldErrors);
          }
        }
        
        throw new Error(`Request failed with status ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response.text() as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Reservation endpoints
  async createReservation(data: ReservationFormData): Promise<Reservation> {
    return this.request<Reservation>('/reservations/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAvailability(startDate: string, endDate?: string): Promise<DayAvailability[]> {
    const params = new URLSearchParams({ start_date: startDate });
    if (endDate) {
      params.append('end_date', endDate);
    }
    
    return this.request<DayAvailability[]>(`/reservations/availability/?${params}`);
  }

  async lookupReservation(email: string, phone: string): Promise<Reservation[]> {
    const params = new URLSearchParams({ email, phone });
    return this.request<Reservation[]>(`/reservations/lookup/?${params}`);
  }

  async cancelReservation(reservationId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/reservations/${reservationId}/cancel/`, {
      method: 'POST',
    });
  }

  // Contact endpoints
  async sendContactMessage(data: ContactFormData): Promise<ContactMessage> {
    return this.request<ContactMessage>('/contact/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Utility methods
  async checkEmailAvailability(email: string): Promise<boolean> {
    try {
      const reservations = await this.lookupReservation(email, 'temp');
      return reservations.length === 0;
    } catch {
      return true; // Assume available if check fails
    }
  }

  formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toISOString().split('T')[0];
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  formatDateTime(date: string, time: string): string {
    const formattedDate = new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    const formattedTime = this.formatTime(time);
    return `${formattedDate} at ${formattedTime}`;
  }
}

// Create API client instance
export const apiClient = new ApiClient();

// React hooks for API calls
import { useState, useEffect, useCallback } from 'react';

// Custom hook for availability data
export const useAvailability = (startDate?: string, endDate?: string) => {
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAvailability = useCallback(async (start?: string, end?: string) => {
    if (!start) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiClient.getAvailability(start, end);
      setAvailability(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch availability');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (startDate) {
      fetchAvailability(startDate, endDate);
    }
  }, [startDate, endDate, fetchAvailability]);

  return { availability, loading, error, refetch: fetchAvailability };
};

// Custom hook for reservation creation
export const useCreateReservation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createReservation = useCallback(async (data: ReservationFormData): Promise<Reservation | null> => {
    setLoading(true);
    setError(null);

    try {
      const reservation = await apiClient.createReservation(data);
      return reservation;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create reservation';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createReservation, loading, error };
};

// Custom hook for reservation lookup
export const useReservationLookup = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookupReservations = useCallback(async (email: string, phone: string) => {
    setLoading(true);
    setError(null);

    try {
      const data = await apiClient.lookupReservation(email, phone);
      setReservations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lookup reservations');
      setReservations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelReservation = useCallback(async (reservationId: string) => {
    try {
      await apiClient.cancelReservation(reservationId);
      // Remove cancelled reservation from state
      setReservations(prev => prev.filter(r => r.id !== reservationId));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel reservation');
      return false;
    }
  }, []);

  return { 
    reservations, 
    loading, 
    error, 
    lookupReservations, 
    cancelReservation 
  };
};

// Custom hook for contact messages
export const useContactMessage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const sendMessage = useCallback(async (data: ContactFormData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await apiClient.sendContactMessage(data);
      setSuccess(true);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const resetState = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return { sendMessage, loading, error, success, resetState };
};

// Utility functions for date/time handling
export const dateUtils = {
  getTodayString: (): string => {
    return new Date().toISOString().split('T')[0];
  },

  getMaxDateString: (monthsAhead = 3): string => {
    const date = new Date();
    date.setMonth(date.getMonth() + monthsAhead);
    return date.toISOString().split('T')[0];
  },

  formatDisplayDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  isDateAvailable: (dateString: string): boolean => {
    const date = new Date(dateString);
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3);
    
    return date >= today && date <= maxDate;
  },

  addDays: (dateString: string, days: number): string => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + days);
    return date.toISOString().split('T')[0];
  }
};

// Constants
export const RESERVATION_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  SEATED: 'seated',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  NO_SHOW: 'no_show'
} as const;

export const CONTACT_SUBJECTS = {
  RESERVATION: 'reservation',
  PRIVATE_EVENT: 'private_event',
  CATERING: 'catering',
  CORPORATE: 'corporate',
  FEEDBACK: 'feedback',
  GENERAL: 'general'
} as const;

export const OCCASIONS = {
  BIRTHDAY: 'birthday',
  ANNIVERSARY: 'anniversary',
  BUSINESS: 'business',
  DATE: 'date',
  FAMILY: 'family',
  CELEBRATION: 'celebration',
  CASUAL: 'casual',
  OTHER: 'other'
} as const;

export const TIME_SLOTS = [
  { value: '17:00', label: '5:00 PM' },
  { value: '17:30', label: '5:30 PM' },
  { value: '18:00', label: '6:00 PM' },
  { value: '18:30', label: '6:30 PM' },
  { value: '19:00', label: '7:00 PM' },
  { value: '19:30', label: '7:30 PM' },
  { value: '20:00', label: '8:00 PM' },
  { value: '20:30', label: '8:30 PM' },
  { value: '21:00', label: '9:00 PM' },
  { value: '21:30', label: '9:30 PM' },
  { value: '22:00', label: '10:00 PM' }
] as const;

export default apiClient;