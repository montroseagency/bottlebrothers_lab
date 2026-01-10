// Client Portal Authentication API

const API_BASE_URL = typeof window !== 'undefined'
  ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api')
  : 'http://localhost:8000/api';

export interface ClientUser {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  phone: string;
  preferred_locale: string;
  marketing_opt_in: boolean;
  email_verified: boolean;
  vip_tier: string | null;
  loyalty_points: number;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: ClientUser;
  tokens?: AuthTokens;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user?: ClientUser;
  tokens?: AuthTokens;
}

export interface ProfileResponse {
  success: boolean;
  profile?: ClientUser;
  message?: string;
}

export interface ReservationResponse {
  success: boolean;
  reservations?: Array<{
    id: string;
    date: string;
    time: string;
    party_size: number;
    status: string;
    occasion: string | null;
    special_requests: string | null;
    verification_code: string;
    created_at: string;
  }>;
  message?: string;
}

// Helper to make authenticated requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const tokens = getStoredTokens();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (tokens?.access) {
    headers['Authorization'] = `Bearer ${tokens.access}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw { response: { data } };
  }

  return data;
}

// Authentication functions
export async function clientLogin(email: string, password: string): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/client/login/', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function clientRegister(data: {
  email: string;
  password: string;
  first_name: string;
  last_name?: string;
  phone?: string;
  preferred_locale?: string;
  marketing_opt_in?: boolean;
}): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/client/register/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function getClientProfile(): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>('/client/profile/', {
    method: 'GET',
  });
}

export async function updateClientProfile(data: {
  first_name?: string;
  last_name?: string;
  phone?: string;
  preferred_locale?: string;
  marketing_opt_in?: boolean;
}): Promise<ProfileResponse> {
  return apiRequest<ProfileResponse>('/client/profile/update/', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  return apiRequest('/client/change-password/', {
    method: 'POST',
    body: JSON.stringify({
      current_password: currentPassword,
      new_password: newPassword,
    }),
  });
}

export async function getMyReservations(
  filter?: 'all' | 'upcoming' | 'past'
): Promise<ReservationResponse> {
  const params = filter ? `?filter=${filter}` : '';
  return apiRequest<ReservationResponse>(`/client/reservations/${params}`, {
    method: 'GET',
  });
}

export async function linkReservation(
  verificationCode: string,
  email: string
): Promise<{ success: boolean; message: string; reservation?: unknown }> {
  return apiRequest('/client/link-reservation/', {
    method: 'POST',
    body: JSON.stringify({
      verification_code: verificationCode,
      email,
    }),
  });
}

// Token management
const TOKEN_KEY = 'bb_client_tokens';
const USER_KEY = 'bb_client_user';

export function saveAuthData(tokens: AuthTokens, user: ClientUser): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }
}

export function getStoredTokens(): AuthTokens | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(TOKEN_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function getStoredUser(): ClientUser | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
}

export function clearAuthData(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}

export function isAuthenticated(): boolean {
  return getStoredTokens() !== null;
}
