// client/src/components/admin/MomentsManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useAuthenticatedApi } from '../../contexts/AuthContext';

interface Moment {
  id: string;
  title: string;
  description: string;
  image: string | null;
  image_url: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export const MomentsManagement: React.FC = () => {
  const { apiCall } = useAuthenticatedApi();
  const [moments, setMoments] = useState<Moment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMoment, setEditingMoment] = useState<Moment | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    is_active: true,
    display_order: 0
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchMoments = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/admin/moments/', { method: 'GET' });
      // Handle both array and paginated response formats
      const momentsList = Array.isArray(data) ? data : (data?.results || []);
      setMoments(momentsList);
    } catch (error) {
      console.error('Failed to fetch moments:', error);
      setError('Failed to load moments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchMoments();
  }, [fetchMoments]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;

    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'display_order') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setMessage('File size must be less than 10MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setMessage('Please select an image file');
        return;
      }
      setSelectedFile(file);
      setMessage('');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      is_active: true,
      display_order: 0
    });
    setSelectedFile(null);
    setEditingMoment(null);
    setIsFormOpen(false);
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('is_active', formData.is_active.toString());
      formDataToSend.append('display_order', formData.display_order.toString());

      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }

      if (editingMoment) {
        await apiCall(`/admin/moments/${editingMoment.id}/`, {
          method: 'PATCH',
          body: formDataToSend
        });
        setMessage('Moment updated successfully!');
      } else {
        if (!selectedFile) {
          setError('Please select an image for the moment');
          setSubmitting(false);
          return;
        }
        await apiCall('/admin/moments/', {
          method: 'POST',
          body: formDataToSend
        });
        setMessage('Moment created successfully!');
      }

      fetchMoments();
      resetForm();
    } catch (error) {
      console.error('Failed to save moment:', error);
      setError(`Failed to save moment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (moment: Moment) => {
    setEditingMoment(moment);
    setFormData({
      title: moment.title || '',
      description: moment.description || '',
      is_active: moment.is_active,
      display_order: moment.display_order
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (momentId: string) => {
    if (!confirm('Are you sure you want to delete this moment?')) {
      return;
    }

    try {
      await apiCall(`/admin/moments/${momentId}/`, { method: 'DELETE' });
      setMessage('Moment deleted successfully!');
      fetchMoments();
    } catch (error) {
      console.error('Failed to delete moment:', error);
      setError('Failed to delete moment');
    }
  };

  const toggleActive = async (momentId: string) => {
    try {
      await apiCall(`/admin/moments/${momentId}/toggle_active/`, { method: 'POST' });
      fetchMoments();
    } catch (error) {
      console.error('Failed to toggle active:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Moments Management</h1>
            <p className="text-gray-600 mt-2">Manage photos for the &quot;Our Best Moments&quot; section</p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Moment</span>
          </button>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
            {message}
          </div>
        )}

        {/* Moment Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingMoment ? 'Edit Moment' : 'Add New Moment'}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Title (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title (Optional)
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="e.g., Sunset Dinner, Live Music Night"
                  />
                </div>

                {/* Description (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    placeholder="A brief description of this moment..."
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photo {!editingMoment && '*'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required={!editingMoment}
                  />
                  <p className="text-sm text-gray-500 mt-1">Max 10MB - JPG, PNG, WebP</p>

                  {/* Preview */}
                  {selectedFile && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">New Image Preview:</p>
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        className="max-w-full h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}

                  {/* Current Image */}
                  {editingMoment?.image_url && !selectedFile && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Current Image:</p>
                      <img
                        src={editingMoment.image_url}
                        alt="Current"
                        className="max-w-full h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>

                {/* Display Settings */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="is_active"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                      Active (visible on website)
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Order
                    </label>
                    <input
                      type="number"
                      name="display_order"
                      value={formData.display_order}
                      onChange={handleInputChange}
                      min="0"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
                  </div>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:bg-gray-400 transition-colors font-medium flex items-center space-x-2"
                  >
                    {submitting && (
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    <span>{editingMoment ? 'Update Moment' : 'Add Moment'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Moments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {moments.length === 0 ? (
            <div className="col-span-full bg-white rounded-xl shadow-lg p-12 text-center">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-medium text-gray-900">No moments yet</p>
              <p className="text-sm text-gray-500 mt-1">Add your first moment to showcase your best experiences</p>
            </div>
          ) : (
            moments.map((moment) => (
              <div key={moment.id} className="bg-white rounded-xl shadow-lg overflow-hidden group">
                {/* Image */}
                <div className="relative h-48 bg-gray-100">
                  {moment.image_url ? (
                    <img
                      src={moment.image_url}
                      alt={moment.title || 'Moment'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}

                  {/* Status Badge */}
                  <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
                    moment.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {moment.is_active ? 'Active' : 'Hidden'}
                  </div>

                  {/* Order Badge */}
                  <div className="absolute top-3 left-3 w-8 h-8 bg-black/70 text-white rounded-full flex items-center justify-center text-sm font-medium">
                    {moment.display_order}
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {moment.title || 'Untitled Moment'}
                  </h3>
                  {moment.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {moment.description}
                    </p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <button
                      onClick={() => toggleActive(moment.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        moment.is_active
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {moment.is_active ? 'Hide' : 'Show'}
                    </button>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEdit(moment)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(moment.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="font-semibold text-amber-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Moments Management Tips
          </h3>
          <ul className="text-sm text-amber-800 space-y-2">
            <li className="flex items-start">
              <span className="block w-2 h-2 bg-amber-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
              <span>Moments appear in the &quot;Our Best Moments&quot; section on the homepage</span>
            </li>
            <li className="flex items-start">
              <span className="block w-2 h-2 bg-amber-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
              <span>Use high-quality images that capture the essence of your venue</span>
            </li>
            <li className="flex items-start">
              <span className="block w-2 h-2 bg-amber-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
              <span>Display order determines the sequence (lower numbers appear first)</span>
            </li>
            <li className="flex items-start">
              <span className="block w-2 h-2 bg-amber-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
              <span>Hidden moments are not visible to the public but preserved in the system</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
