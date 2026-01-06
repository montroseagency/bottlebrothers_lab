// client/src/components/admin/MenuManagement.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuthenticatedApi } from '../../contexts/AuthContext';

interface MenuCategory {
  id: string;
  name: string;
  category_type: string;
  description: string;
  icon: string;
  display_order: number;
  is_active: boolean;
  parent?: string | null;
  parent_name?: string | null;
  is_subcategory: boolean;
  items_count: number;
  subcategory_count: number;
  subcategories?: MenuCategory[];
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

const CATEGORY_TYPES = [
  { value: 'cocktails', label: 'Cocktails', icon: '🍸' },
  { value: 'wine', label: 'Wine', icon: '🍷' },
  { value: 'beer', label: 'Beer', icon: '🍺' },
  { value: 'food', label: 'Food', icon: '🍽️' },
  { value: 'shisha', label: 'Shisha', icon: '💨' },
];

const DIETARY_OPTIONS = [
  { value: 'vegetarian', label: 'Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'gluten_free', label: 'Gluten Free' },
  { value: 'dairy_free', label: 'Dairy Free' },
  { value: 'nut_free', label: 'Nut Free' },
  { value: 'halal', label: 'Halal' },
];

const TAG_OPTIONS = [
  { value: 'signature', label: 'Signature' },
  { value: 'popular', label: 'Popular' },
  { value: 'new', label: 'New' },
  { value: 'spicy', label: 'Spicy' },
  { value: 'premium', label: 'Premium' },
];

const MenuManagement: React.FC = () => {
  const { apiCall } = useAuthenticatedApi();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState<'categories' | 'subcategories' | 'items'>('items');

  // Data states
  const [mainCategories, setMainCategories] = useState<MenuCategory[]>([]);
  const [subcategories, setSubcategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Selection states for subcategories tab
  const [selectedParentCategory, setSelectedParentCategory] = useState<string>('');

  // Modal states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<MenuCategory | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Image preview
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Form states
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    category_type: '',
    description: '',
    icon: '',
    display_order: 0,
    is_active: true,
  });

  const [subcategoryForm, setSubcategoryForm] = useState({
    name: '',
    parent: '',
    description: '',
    icon: '',
    display_order: 0,
    is_active: true,
  });

  const [itemForm, setItemForm] = useState({
    category: '',
    name: '',
    description: '',
    price: 0,
    image: null as File | null,
    dietary_info: [] as string[],
    tags: [] as string[],
    ingredients: '',
    allergens: '',
    calories: undefined as number | undefined,
    preparation_time: '',
    is_available: true,
    is_featured: false,
    display_order: 0,
  });

  // Step state for item creation
  const [itemStep, setItemStep] = useState(1);
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>('');

  // Fetch data
  useEffect(() => {
    fetchData();
  }, []);

  // Fetch subcategories when parent changes
  useEffect(() => {
    if (selectedParentCategory) {
      fetchSubcategories(selectedParentCategory);
    } else {
      setSubcategories([]);
    }
  }, [selectedParentCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [categoriesData, itemsData] = await Promise.all([
        apiCall('/menu/categories/?parent=null'),
        apiCall('/menu/items/')
      ]);
      setMainCategories(categoriesData);
      setItems(itemsData);
    } catch (err) {
      setError('Failed to load menu data');
      console.error(err);
    }
    setLoading(false);
  };

  const fetchSubcategories = async (parentId: string) => {
    try {
      const data = await apiCall(`/menu/categories/${parentId}/subcategories/`);
      setSubcategories(data);
    } catch (err) {
      console.error('Failed to load subcategories', err);
    }
  };

  const showSuccess = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Category handlers
  const handleCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({
      name: '',
      category_type: '',
      description: '',
      icon: '',
      display_order: mainCategories.length,
      is_active: true,
    });
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: MenuCategory) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      category_type: category.category_type,
      description: category.description || '',
      icon: category.icon || '',
      display_order: category.display_order,
      is_active: category.is_active,
    });
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async () => {
    try {
      if (editingCategory) {
        await apiCall(`/menu/categories/${editingCategory.id}/`, {
          method: 'PATCH',
          body: JSON.stringify(categoryForm),
          headers: { 'Content-Type': 'application/json' },
        });
        showSuccess('Category updated');
      } else {
        await apiCall('/menu/categories/', {
          method: 'POST',
          body: JSON.stringify(categoryForm),
          headers: { 'Content-Type': 'application/json' },
        });
        showSuccess('Category created');
      }
      setShowCategoryModal(false);
      fetchData();
    } catch (err) {
      setError('Failed to save category');
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category? All subcategories and items will be deleted.')) return;
    try {
      await apiCall(`/menu/categories/${id}/`, { method: 'DELETE' });
      showSuccess('Category deleted');
      fetchData();
    } catch (err) {
      setError('Failed to delete category');
    }
  };

  // Subcategory handlers
  const handleCreateSubcategory = () => {
    setEditingSubcategory(null);
    setSubcategoryForm({
      name: '',
      parent: selectedParentCategory,
      description: '',
      icon: '',
      display_order: subcategories.length,
      is_active: true,
    });
    setShowSubcategoryModal(true);
  };

  const handleEditSubcategory = (subcategory: MenuCategory) => {
    setEditingSubcategory(subcategory);
    setSubcategoryForm({
      name: subcategory.name,
      parent: subcategory.parent || '',
      description: subcategory.description || '',
      icon: subcategory.icon || '',
      display_order: subcategory.display_order,
      is_active: subcategory.is_active,
    });
    setShowSubcategoryModal(true);
  };

  const handleSaveSubcategory = async () => {
    try {
      if (editingSubcategory) {
        await apiCall(`/menu/categories/${editingSubcategory.id}/`, {
          method: 'PATCH',
          body: JSON.stringify(subcategoryForm),
          headers: { 'Content-Type': 'application/json' },
        });
        showSuccess('Subcategory updated');
      } else {
        await apiCall('/menu/categories/', {
          method: 'POST',
          body: JSON.stringify(subcategoryForm),
          headers: { 'Content-Type': 'application/json' },
        });
        showSuccess('Subcategory created');
      }
      setShowSubcategoryModal(false);
      fetchSubcategories(selectedParentCategory);
      fetchData();
    } catch (err) {
      setError('Failed to save subcategory');
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    if (!confirm('Delete this subcategory? All items will be deleted.')) return;
    try {
      await apiCall(`/menu/categories/${id}/`, { method: 'DELETE' });
      showSuccess('Subcategory deleted');
      fetchSubcategories(selectedParentCategory);
      fetchData();
    } catch (err) {
      setError('Failed to delete subcategory');
    }
  };

  // Item handlers
  const handleCreateItem = () => {
    setEditingItem(null);
    setItemStep(1);
    setSelectedMainCategory('');
    setItemForm({
      category: '',
      name: '',
      description: '',
      price: 0,
      image: null,
      dietary_info: [],
      tags: [],
      ingredients: '',
      allergens: '',
      calories: undefined,
      preparation_time: '',
      is_available: true,
      is_featured: false,
      display_order: items.length,
    });
    setImagePreview(null);
    setShowItemModal(true);
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setItemStep(3); // Go directly to form when editing
    // Find the main category for this item's subcategory
    const itemCategory = [...mainCategories, ...subcategories].find(c => c.id === item.category);
    if (itemCategory?.parent) {
      setSelectedMainCategory(itemCategory.parent);
    } else {
      setSelectedMainCategory(item.category);
    }
    setItemForm({
      category: item.category,
      name: item.name,
      description: item.description,
      price: item.price,
      image: null,
      dietary_info: item.dietary_info || [],
      tags: item.tags || [],
      ingredients: item.ingredients || '',
      allergens: item.allergens || '',
      calories: item.calories,
      preparation_time: item.preparation_time || '',
      is_available: item.is_available,
      is_featured: item.is_featured,
      display_order: item.display_order,
    });
    setImagePreview(item.image_url || null);
    setShowItemModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setItemForm({ ...itemForm, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setItemForm({ ...itemForm, image: null });
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveItem = async () => {
    try {
      const formData = new FormData();
      formData.append('category', itemForm.category);
      formData.append('name', itemForm.name);
      formData.append('description', itemForm.description);
      formData.append('price', String(itemForm.price));
      formData.append('dietary_info', JSON.stringify(itemForm.dietary_info));
      formData.append('tags', JSON.stringify(itemForm.tags));
      formData.append('ingredients', itemForm.ingredients);
      formData.append('allergens', itemForm.allergens);
      if (itemForm.calories) formData.append('calories', String(itemForm.calories));
      formData.append('preparation_time', itemForm.preparation_time);
      formData.append('is_available', String(itemForm.is_available));
      formData.append('is_featured', String(itemForm.is_featured));
      formData.append('display_order', String(itemForm.display_order));
      if (itemForm.image) formData.append('image', itemForm.image);

      if (editingItem) {
        await apiCall(`/menu/items/${editingItem.id}/`, {
          method: 'PATCH',
          body: formData,
        });
        showSuccess('Item updated');
      } else {
        await apiCall('/menu/items/', {
          method: 'POST',
          body: formData,
        });
        showSuccess('Item created');
      }
      setShowItemModal(false);
      fetchData();
    } catch (err) {
      setError('Failed to save item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!confirm('Delete this item?')) return;
    try {
      await apiCall(`/menu/items/${id}/`, { method: 'DELETE' });
      showSuccess('Item deleted');
      fetchData();
    } catch (err) {
      setError('Failed to delete item');
    }
  };

  const toggleItemAvailable = async (id: string) => {
    try {
      await apiCall(`/menu/items/${id}/toggle_available/`, { method: 'PATCH' });
      fetchData();
    } catch (err) {
      setError('Failed to toggle availability');
    }
  };

  // Get subcategories for selected main category (for item creation)
  const getSubcategoriesForMain = (mainCategoryId: string): MenuCategory[] => {
    const mainCat = mainCategories.find(c => c.id === mainCategoryId);
    return mainCat?.subcategories || [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-green-200 border-t-green-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Success/Error Messages */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
          <button onClick={() => setError(null)} className="float-right">×</button>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'items', label: 'Menu Items', icon: '🍽️' },
            { id: 'categories', label: 'Categories', icon: '📁' },
            { id: 'subcategories', label: 'Subcategories', icon: '📂' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'border-b-2 border-green-500 text-green-600 bg-green-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {/* Menu Items Tab */}
          {activeTab === 'items' && (
            <div className="space-y-4">
              {/* Prominent Add Item CTA */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-6 text-white mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-1">Menu Items</h3>
                    <p className="text-green-100 text-sm">
                      {items.length} items in your menu
                    </p>
                  </div>
                  <button
                    onClick={handleCreateItem}
                    className="px-6 py-3 bg-white text-green-600 rounded-xl hover:bg-green-50 font-bold text-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
                  >
                    + Add New Item
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">All Items</h3>
                <button
                  onClick={handleCreateItem}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                >
                  + Add Item
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Image</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Name</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Category</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Price</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                      <th className="text-right py-3 px-4 font-medium text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {item.image_url ? (
                            <img
                              src={item.image_url}
                              alt={item.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                              🍽️
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{item.description}</div>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{item.category_name}</td>
                        <td className="py-3 px-4 text-gray-900 font-medium">{item.formatted_price}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => toggleItemAvailable(item.id)}
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              item.is_available
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {item.is_available ? 'Available' : 'Unavailable'}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleEditItem(item)}
                            className="text-blue-600 hover:text-blue-800 mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {items.length === 0 && (
                  <div className="text-center py-12 text-gray-500">
                    No menu items yet. Click &quot;Add Item&quot; to create one.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Main Categories</h3>
                <button
                  onClick={handleCreateCategory}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                >
                  + Add Category
                </button>
              </div>

              <div className="grid gap-4">
                {mainCategories.map((category) => (
                  <div
                    key={category.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center space-x-4">
                      <span className="text-2xl">{category.icon || '📁'}</span>
                      <div>
                        <div className="font-medium text-gray-900">{category.name}</div>
                        <div className="text-sm text-gray-500">
                          {category.subcategory_count} subcategories • {category.items_count} items
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        category.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <button
                        onClick={() => handleEditCategory(category)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(category.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Subcategories Tab */}
          {activeTab === 'subcategories' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <h3 className="text-lg font-semibold text-gray-900">Subcategories</h3>
                  <select
                    value={selectedParentCategory}
                    onChange={(e) => setSelectedParentCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Select main category...</option>
                    {mainCategories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon} {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                {selectedParentCategory && (
                  <button
                    onClick={handleCreateSubcategory}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium"
                  >
                    + Add Subcategory
                  </button>
                )}
              </div>

              {selectedParentCategory ? (
                <div className="grid gap-4">
                  {subcategories.map((subcategory) => (
                    <div
                      key={subcategory.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="flex items-center space-x-4">
                        <span className="text-xl">{subcategory.icon || '📂'}</span>
                        <div>
                          <div className="font-medium text-gray-900">{subcategory.name}</div>
                          <div className="text-sm text-gray-500">{subcategory.items_count} items</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          subcategory.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {subcategory.is_active ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => handleEditSubcategory(subcategory)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSubcategory(subcategory.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {subcategories.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No subcategories yet. Click &quot;Add Subcategory&quot; to create one.
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  Select a main category to view and manage its subcategories.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">
                {editingCategory ? 'Edit Category' : 'New Category'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={categoryForm.category_type}
                  onChange={(e) => setCategoryForm({ ...categoryForm, category_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select type...</option>
                  {CATEGORY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.icon} {type.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
                <input
                  type="text"
                  value={categoryForm.icon}
                  onChange={(e) => setCategoryForm({ ...categoryForm, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="🍸"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={categoryForm.is_active}
                  onChange={(e) => setCategoryForm({ ...categoryForm, is_active: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-600">Active</label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowCategoryModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveCategory}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {showSubcategoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">
                {editingSubcategory ? 'Edit Subcategory' : 'New Subcategory'}
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Category</label>
                <select
                  value={subcategoryForm.parent}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, parent: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                >
                  <option value="">Select parent...</option>
                  {mainCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={subcategoryForm.name}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon (emoji)</label>
                <input
                  type="text"
                  value={subcategoryForm.icon}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  placeholder="⭐"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={subcategoryForm.description}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                  rows={3}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={subcategoryForm.is_active}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, is_active: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded"
                />
                <label className="ml-2 text-sm text-gray-600">Active</label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowSubcategoryModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSubcategory}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Modal with Step-by-Step */}
      {showItemModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              {!editingItem && (
                <div className="flex items-center mt-4 space-x-2">
                  {[1, 2, 3].map((step) => (
                    <div key={step} className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        itemStep >= step ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {step}
                      </div>
                      {step < 3 && (
                        <div className={`w-12 h-1 mx-1 ${
                          itemStep > step ? 'bg-green-500' : 'bg-gray-200'
                        }`} />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 space-y-6">
              {/* Step 1: Select Category */}
              {itemStep === 1 && !editingItem && (
                <div className="space-y-4">
                  <h3 className="font-medium text-gray-900">Select Category</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {mainCategories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => {
                          setSelectedMainCategory(cat.id);
                          setItemStep(2);
                        }}
                        className={`p-4 border-2 rounded-xl text-left transition-all ${
                          selectedMainCategory === cat.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <span className="text-2xl">{cat.icon}</span>
                        <div className="font-medium mt-2">{cat.name}</div>
                        <div className="text-sm text-gray-500">{cat.subcategory_count} subcategories</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Select Subcategory */}
              {itemStep === 2 && !editingItem && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">Select Subcategory</h3>
                    <button
                      onClick={() => setItemStep(1)}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      ← Back
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {getSubcategoriesForMain(selectedMainCategory).map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => {
                          setItemForm({ ...itemForm, category: sub.id });
                          setItemStep(3);
                        }}
                        className={`p-4 border-2 rounded-xl text-left transition-all ${
                          itemForm.category === sub.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-green-300'
                        }`}
                      >
                        <span className="text-xl">{sub.icon}</span>
                        <div className="font-medium mt-2">{sub.name}</div>
                        <div className="text-sm text-gray-500">{sub.items_count} items</div>
                      </button>
                    ))}
                    {/* Option to add directly to main category */}
                    <button
                      onClick={() => {
                        setItemForm({ ...itemForm, category: selectedMainCategory });
                        setItemStep(3);
                      }}
                      className="p-4 border-2 border-dashed border-gray-300 rounded-xl text-left hover:border-green-300"
                    >
                      <span className="text-xl">➕</span>
                      <div className="font-medium mt-2 text-gray-600">Add to main category</div>
                      <div className="text-sm text-gray-400">No subcategory</div>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Item Details */}
              {(itemStep === 3 || editingItem) && (
                <div className="space-y-6">
                  {!editingItem && (
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-gray-900">Item Details</h3>
                      <button
                        onClick={() => setItemStep(2)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        ← Back
                      </button>
                    </div>
                  )}

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image</label>
                    <div className="flex items-start space-x-4">
                      {imagePreview ? (
                        <div className="relative">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-32 h-32 rounded-lg object-cover"
                          />
                          <button
                            onClick={handleRemoveImage}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-green-500"
                        >
                          <span className="text-3xl text-gray-400">📷</span>
                          <span className="text-sm text-gray-500 mt-1">Add image</span>
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                      <div className="text-sm text-gray-500">
                        <p>Recommended: 800x600px</p>
                        <p>Max size: 5MB</p>
                      </div>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                      <input
                        type="text"
                        value={itemForm.name}
                        onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="e.g., Old Fashioned"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                      <textarea
                        value={itemForm.description}
                        onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        rows={3}
                        placeholder="Describe the item..."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price *</label>
                      <input
                        type="number"
                        step="0.01"
                        value={itemForm.price}
                        onChange={(e) => setItemForm({ ...itemForm, price: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Prep Time</label>
                      <input
                        type="text"
                        value={itemForm.preparation_time}
                        onChange={(e) => setItemForm({ ...itemForm, preparation_time: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="e.g., 10 min"
                      />
                    </div>
                  </div>

                  {/* Dietary & Tags */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Dietary Info</label>
                      <div className="flex flex-wrap gap-2">
                        {DIETARY_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              const current = itemForm.dietary_info;
                              setItemForm({
                                ...itemForm,
                                dietary_info: current.includes(opt.value)
                                  ? current.filter(v => v !== opt.value)
                                  : [...current, opt.value]
                              });
                            }}
                            className={`px-3 py-1 rounded-full text-sm ${
                              itemForm.dietary_info.includes(opt.value)
                                ? 'bg-green-500 text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                      <div className="flex flex-wrap gap-2">
                        {TAG_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              const current = itemForm.tags;
                              setItemForm({
                                ...itemForm,
                                tags: current.includes(opt.value)
                                  ? current.filter(v => v !== opt.value)
                                  : [...current, opt.value]
                              });
                            }}
                            className={`px-3 py-1 rounded-full text-sm ${
                              itemForm.tags.includes(opt.value)
                                ? 'bg-amber-500 text-white'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Ingredients</label>
                      <textarea
                        value={itemForm.ingredients}
                        onChange={(e) => setItemForm({ ...itemForm, ingredients: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        rows={2}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Allergens</label>
                      <textarea
                        value={itemForm.allergens}
                        onChange={(e) => setItemForm({ ...itemForm, allergens: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Toggles */}
                  <div className="flex items-center space-x-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={itemForm.is_available}
                        onChange={(e) => setItemForm({ ...itemForm, is_available: e.target.checked })}
                        className="w-4 h-4 text-green-600 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">Available</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={itemForm.is_featured}
                        onChange={(e) => setItemForm({ ...itemForm, is_featured: e.target.checked })}
                        className="w-4 h-4 text-amber-600 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-600">Featured</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowItemModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Cancel
              </button>
              {(itemStep === 3 || editingItem) && (
                <button
                  onClick={handleSaveItem}
                  disabled={!itemForm.name || !itemForm.description || itemForm.price <= 0}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingItem ? 'Update' : 'Create'} Item
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManagement;
