// client/src/components/admin/MenuManagement.tsx
import React, { useState, useEffect } from 'react';
import { useAuthenticatedApi } from '../../contexts/AuthContext';

interface MenuCategory {
  id: string;
  name: string;
  category_type: string;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  items_count: number;
}

interface MenuItem {
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
}

interface MenuItemVariant {
  id: string;
  name: string;
  description: string;
  price: number;
  variant_type: string;
  display_order: number;
  is_available: boolean;
}

const CATEGORY_TYPES = [
  { value: 'appetizers', label: 'Appetizers', icon: '🥗' },
  { value: 'mains', label: 'Main Courses', icon: '🍖' },
  { value: 'cocktails', label: 'Cocktails', icon: '🍸' },
  { value: 'wine', label: 'Wine & Spirits', icon: '🍷' },
  { value: 'desserts', label: 'Desserts', icon: '🍰' },
  { value: 'beverages', label: 'Beverages', icon: '☕' },
  { value: 'specials', label: "Chef's Specials", icon: '⭐' },
];

const DIETARY_OPTIONS = [
  'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_free', 
  'keto', 'paleo', 'halal', 'kosher'
];

const TAG_OPTIONS = [
  'signature', 'popular', 'new', 'seasonal', 'spicy', 'house_made',
  'locally_sourced', 'organic', 'sustainable', 'premium'
];

const VARIANT_TYPES = [
  { value: 'size', label: 'Size' },
  { value: 'portion', label: 'Portion' },
  { value: 'preparation', label: 'Preparation Style' },
  { value: 'wine_format', label: 'Wine Format' },
  { value: 'other', label: 'Other' },
];

const MenuManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'categories' | 'items'>('categories');
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [showVariantModal, setShowVariantModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [variants, setVariants] = useState<MenuItemVariant[]>([]);
  
  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    category_type: '',
    description: '',
    icon: '',
    display_order: 0,
    is_active: true,
  });
  
  const [itemForm, setItemForm] = useState({
    category: '',
    name: '',
    description: '',
    price: '',
    image: null as File | null,
    dietary_info: [] as string[],
    tags: [] as string[],
    ingredients: '',
    allergens: '',
    calories: '',
    preparation_time: '',
    is_available: true,
    is_featured: false,
    display_order: 0,
    has_variants: false,
  });

  const { apiCall } = useAuthenticatedApi();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [categoriesData, itemsData] = await Promise.all([
        apiCall('/menu/categories/'),
        apiCall('/menu/items/')
      ]);
      setCategories(categoriesData);
      setItems(itemsData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchVariants = async (itemId: string) => {
    try {
      const variantData = await apiCall(`/menu/variants/?menu_item=${itemId}`);
      setVariants(variantData);
    } catch (error) {
      console.error('Failed to fetch variants:', error);
    }
  };

  // Category functions
  const handleCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      category_type: '',
      description: '',
      icon: '',
      display_order: categories.length,
      is_active: true,
    });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: MenuCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      category_type: category.category_type,
      description: category.description,
      icon: category.icon,
      display_order: category.display_order,
      is_active: category.is_active,
    });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        const updated = await apiCall(`/menu/categories/${editingCategory.id}/`, {
          method: 'PATCH',
          body: JSON.stringify(categoryForm),
        });
        setCategories(categories.map(c => c.id === editingCategory.id ? updated : c));
      } else {
        const created = await apiCall('/menu/categories/', {
          method: 'POST',
          body: JSON.stringify(categoryForm),
        });
        setCategories([...categories, created]);
      }
      setShowCategoryModal(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (window.confirm('Are you sure? This will delete all items in this category.')) {
      try {
        await apiCall(`/menu/categories/${id}/`, { method: 'DELETE' });
        setCategories(categories.filter(c => c.id !== id));
        setItems(items.filter(i => i.category !== id));
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to delete category');
      }
    }
  };

  const toggleCategoryActive = async (id: string) => {
    try {
      const updated = await apiCall(`/menu/categories/${id}/toggle_active/`, {
        method: 'PATCH',
      });
      setCategories(categories.map(c => c.id === id ? updated : c));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to toggle category');
    }
  };

  // Item functions
  const handleCreateItem = () => {
    setEditingItem(null);
    setItemForm({
      category: categories[0]?.id || '',
      name: '',
      description: '',
      price: '',
      image: null,
      dietary_info: [],
      tags: [],
      ingredients: '',
      allergens: '',
      calories: '',
      preparation_time: '',
      is_available: true,
      is_featured: false,
      display_order: 0,
      has_variants: false,
    });
    setShowItemModal(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemForm({
      category: item.category,
      name: item.name,
      description: item.description,
      price: item.price.toString(),
      image: null,
      dietary_info: item.dietary_info,
      tags: item.tags,
      ingredients: item.ingredients,
      allergens: item.allergens,
      calories: item.calories?.toString() || '',
      preparation_time: item.preparation_time,
      is_available: item.is_available,
      is_featured: item.is_featured,
      display_order: item.display_order,
      has_variants: item.has_variants,
    });
    setShowItemModal(true);
  };

  const handleSaveItem = async () => {
    try {
      const formData = new FormData();
      formData.append('category', itemForm.category);
      formData.append('name', itemForm.name);
      formData.append('description', itemForm.description);
      formData.append('price', itemForm.price);
      formData.append('dietary_info', JSON.stringify(itemForm.dietary_info));
      formData.append('tags', JSON.stringify(itemForm.tags));
      formData.append('ingredients', itemForm.ingredients);
      formData.append('allergens', itemForm.allergens);
      if (itemForm.calories) formData.append('calories', itemForm.calories);
      formData.append('preparation_time', itemForm.preparation_time);
      formData.append('is_available', itemForm.is_available.toString());
      formData.append('is_featured', itemForm.is_featured.toString());
      formData.append('display_order', itemForm.display_order.toString());
      formData.append('has_variants', itemForm.has_variants.toString());
      if (itemForm.image) formData.append('image', itemForm.image);

      if (editingItem) {
        const updated = await apiCall(`/menu/items/${editingItem.id}/`, {
          method: 'PATCH',
          body: formData,
        });
        setItems(items.map(i => i.id === editingItem.id ? updated : i));
      } else {
        const created = await apiCall('/menu/items/', {
          method: 'POST',
          body: formData,
        });
        setItems([...items, created]);
      }
      setShowItemModal(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to save item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this menu item?')) {
      try {
        await apiCall(`/menu/items/${id}/`, { method: 'DELETE' });
        setItems(items.filter(i => i.id !== id));
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to delete item');
      }
    }
  };

  const toggleItemAvailable = async (id: string) => {
    try {
      const updated = await apiCall(`/menu/items/${id}/toggle_available/`, {
        method: 'PATCH',
      });
      setItems(items.map(i => i.id === id ? updated : i));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to toggle item');
    }
  };

  const toggleItemFeatured = async (id: string) => {
    try {
      const updated = await apiCall(`/menu/items/${id}/toggle_featured/`, {
        method: 'PATCH',
      });
      setItems(items.map(i => i.id === id ? updated : i));
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to toggle featured');
    }
  };

  const handleManageVariants = async (item: MenuItem) => {
    setSelectedItem(item);
    await fetchVariants(item.id);
    setShowVariantModal(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-600">Manage menu categories and items</p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-800 hover:text-red-900 font-medium mt-2"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'categories'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('items')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'items'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Menu Items ({items.length})
          </button>
        </nav>
      </div>

      {/* Categories Tab */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Menu Categories</h2>
            <button
              onClick={handleCreateCategory}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Add Category
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">{category.items_count} items</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleCategoryActive(category.id)}
                      className={`p-1 rounded ${
                        category.is_active 
                          ? 'text-green-600 hover:bg-green-50' 
                          : 'text-gray-400 hover:bg-gray-50'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>

                {category.description && (
                  <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                )}

                <div className="flex justify-between items-center">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    category.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEditCategory(category)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(category.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Items Tab */}
      {activeTab === 'items' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Menu Items</h2>
            <button
              onClick={handleCreateItem}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              Add Item
            </button>
          </div>

          <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Item
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.has_variants && (
                            <button
                              onClick={() => handleManageVariants(item)}
                              className="text-purple-600 hover:text-purple-900"
                            >
                              Variants
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCategory ? 'Edit Category' : 'Add Category'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Category Type</label>
                  <select
                    value={categoryForm.category_type}
                    onChange={(e) => setCategoryForm({...categoryForm, category_type: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Select category type</option>
                    {CATEGORY_TYPES.map(type => (
                      <option key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Icon (Emoji)</label>
                  <input
                    type="text"
                    value={categoryForm.icon}
                    onChange={(e) => setCategoryForm({...categoryForm, icon: e.target.value})}
                    placeholder="🥗"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Display Order</label>
                  <input
                    type="number"
                    value={categoryForm.display_order}
                    onChange={(e) => setCategoryForm({...categoryForm, display_order: parseInt(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={categoryForm.is_active}
                    onChange={(e) => setCategoryForm({...categoryForm, is_active: e.target.checked})}
                    className="h-4 w-4 text-green-600 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Active</label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCategory}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal */}
      {showItemModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <select
                    value={itemForm.category}
                    onChange={(e) => setItemForm({...itemForm, category: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <input
                    type="text"
                    value={itemForm.name}
                    onChange={(e) => setItemForm({...itemForm, name: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    value={itemForm.description}
                    onChange={(e) => setItemForm({...itemForm, description: e.target.value})}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={itemForm.price}
                    onChange={(e) => setItemForm({...itemForm, price: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setItemForm({...itemForm, image: e.target.files?.[0] || null})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Ingredients</label>
                  <textarea
                    value={itemForm.ingredients}
                    onChange={(e) => setItemForm({...itemForm, ingredients: e.target.value})}
                    rows={2}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Allergens</label>
                  <textarea
                    value={itemForm.allergens}
                    onChange={(e) => setItemForm({...itemForm, allergens: e.target.value})}
                    rows={2}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Calories</label>
                  <input
                    type="number"
                    value={itemForm.calories}
                    onChange={(e) => setItemForm({...itemForm, calories: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Preparation Time</label>
                  <input
                    type="text"
                    value={itemForm.preparation_time}
                    onChange={(e) => setItemForm({...itemForm, preparation_time: e.target.value})}
                    placeholder="15 minutes"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Information</label>
                  <div className="flex flex-wrap gap-2">
                    {DIETARY_OPTIONS.map(option => (
                      <label key={option} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={itemForm.dietary_info.includes(option)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setItemForm({...itemForm, dietary_info: [...itemForm.dietary_info, option]});
                            } else {
                              setItemForm({...itemForm, dietary_info: itemForm.dietary_info.filter(d => d !== option)});
                            }
                          }}
                          className="h-4 w-4 text-green-600 border-gray-300 rounded"
                        />
                        <span className="ml-1 text-sm text-gray-700 capitalize">{option.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {TAG_OPTIONS.map(option => (
                      <label key={option} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={itemForm.tags.includes(option)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setItemForm({...itemForm, tags: [...itemForm.tags, option]});
                            } else {
                              setItemForm({...itemForm, tags: itemForm.tags.filter(t => t !== option)});
                            }
                          }}
                          className="h-4 w-4 text-green-600 border-gray-300 rounded"
                        />
                        <span className="ml-1 text-sm text-gray-700 capitalize">{option.replace('_', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={itemForm.is_available}
                    onChange={(e) => setItemForm({...itemForm, is_available: e.target.checked})}
                    className="h-4 w-4 text-green-600 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Available</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={itemForm.is_featured}
                    onChange={(e) => setItemForm({...itemForm, is_featured: e.target.checked})}
                    className="h-4 w-4 text-green-600 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Featured</label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={itemForm.has_variants}
                    onChange={(e) => setItemForm({...itemForm, has_variants: e.target.checked})}
                    className="h-4 w-4 text-green-600 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">Has Variants</label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Display Order</label>
                  <input
                    type="number"
                    value={itemForm.display_order}
                    onChange={(e) => setItemForm({...itemForm, display_order: parseInt(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowItemModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveItem}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Variants Modal */}
      {showVariantModal && selectedItem && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Manage Variants for {selectedItem.name}
              </h3>
              
              <div className="space-y-4 max-h-64 overflow-y-auto">
                {variants.map((variant) => (
                  <div key={variant.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">{variant.name}</div>
                      <div className="text-sm text-gray-600">${variant.price}</div>
                      {variant.description && (
                        <div className="text-sm text-gray-500">{variant.description}</div>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        variant.is_available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {variant.is_available ? 'Available' : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                ))}
                
                {variants.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No variants found</p>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowVariantModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Close
                </button>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  onClick={() => {
                    // TODO: Add variant creation modal
                    console.log('Add variant functionality to be implemented');
                  }}
                >
                  Add Variant
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;