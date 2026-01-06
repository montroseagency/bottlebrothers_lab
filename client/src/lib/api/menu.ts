import { apiClient } from './client';

export interface MenuCategory {
  id: string;
  name: string;
  category_type: string;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  category: string | MenuCategory;
  name: string;
  description: string;
  price: string;
  image?: string;
  dietary_info: string[];
  tags: string[];
  ingredients?: string;
  allergens?: string;
  calories?: number;
  preparation_time?: string;
  is_available: boolean;
  is_featured: boolean;
  display_order: number;
  has_variants: boolean;
  variants?: MenuItemVariant[];
  created_at: string;
  updated_at: string;
  formatted_price?: string;
  image_url?: string;
}

export interface MenuItemVariant {
  id: string;
  menu_item: string;
  name: string;
  description?: string;
  price: string;
  variant_type: 'size' | 'portion' | 'preparation' | 'wine_format' | 'other';
  display_order: number;
  is_available: boolean;
  formatted_price?: string;
}

export interface MenuItemsResponse {
  results: MenuItem[];
  count: number;
  next?: string;
  previous?: string;
}

export interface CategoriesResponse {
  results: MenuCategory[];
  count: number;
  next?: string;
  previous?: string;
}

export async function getMenuCategories(): Promise<MenuCategory[]> {
  try {
    const response = await apiClient.get<CategoriesResponse>('/menu/categories/');
    return response?.results || [];
  } catch (error) {
    console.error('Error fetching menu categories:', error);
    return [];
  }
}

export async function getMenuItems(params?: {
  limit?: number;
  offset?: number;
  category?: string;
  is_featured?: boolean;
  is_available?: boolean;
}): Promise<MenuItemsResponse> {
  const queryParams = new URLSearchParams();

  if (params?.limit) queryParams.set('limit', params.limit.toString());
  if (params?.offset) queryParams.set('offset', params.offset.toString());
  if (params?.category) queryParams.set('category', params.category);
  if (params?.is_featured !== undefined) queryParams.set('is_featured', params.is_featured.toString());
  if (params?.is_available !== undefined) queryParams.set('is_available', params.is_available.toString());

  const query = queryParams.toString();
  return apiClient.get<MenuItemsResponse>(`/menu/items/${query ? `?${query}` : ''}`);
}

export async function getFeaturedMenuItems(limit: number = 6): Promise<MenuItem[]> {
  try {
    const response = await getMenuItems({ is_featured: true, is_available: true, limit });
    return response?.results || [];
  } catch (error) {
    console.error('Error fetching featured menu items:', error);
    return [];
  }
}

export async function getMenuItemById(id: string): Promise<MenuItem> {
  return apiClient.get<MenuItem>(`/menu/items/${id}/`);
}
