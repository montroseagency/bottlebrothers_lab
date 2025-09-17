// client/src/components/admin/GalleryManagement.tsx
import React, { useState } from 'react';

export const GalleryManagement: React.FC = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage('File size must be less than 5MB');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !description.trim() || !selectedFile) {
      setMessage('Please fill all fields and select an image');
      return;
    }

    setUploading(true);
    
    try {
      // First, let's test if the API endpoint exists
      console.log('Testing API endpoint...');
      
      const testResponse = await fetch('http://localhost:8000/api/gallery/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
      });
      
      console.log('API Test Response:', testResponse.status, testResponse.statusText);
      
      if (!testResponse.ok) {
        setMessage(`❌ API endpoint error: ${testResponse.status} ${testResponse.statusText}`);
        setUploading(false);
        return;
      }

      // If GET works, try POST
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', 'other');
      formData.append('is_featured', 'false');
      formData.append('display_order', '0');
      formData.append('is_active', 'true');
      formData.append('image', selectedFile);

      console.log('Uploading with FormData...');
      
      const response = await fetch('http://localhost:8000/api/gallery/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
        },
        body: formData,
      });

      console.log('Upload Response:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Upload Success:', result);
        setMessage('✅ Image uploaded successfully!');
        setTitle('');
        setDescription('');
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        const errorText = await response.text();
        console.log('Upload Error:', errorText);
        setMessage(`❌ Upload failed: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Network Error:', error);
      setMessage(`❌ Network error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Gallery Management</h1>
          <p className="text-gray-600 mt-2">Upload and manage restaurant gallery images</p>
        </div>

        {/* Upload Form */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Upload New Image</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter image title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Describe this image..."
                required
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image File *
              </label>
              <input
                type="file"
                id="file-input"
                accept="image/*"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
              <p className="text-sm text-gray-500 mt-1">Max 5MB • JPG, PNG, WebP</p>
            </div>

            {/* Preview */}
            {selectedFile && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="max-w-full h-48 object-cover rounded-md border"
                />
              </div>
            )}

            {/* Message */}
            {message && (
              <div className={`p-3 rounded-md ${
                message.includes('✅') 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={uploading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {uploading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                'Upload Image'
              )}
            </button>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-md p-4">
          <h3 className="font-medium text-blue-900 mb-2">📝 Tips</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use high-quality images that showcase your restaurant</li>
            <li>• Write clear, descriptive titles and descriptions</li>
            <li>• Uploaded images will appear in the public gallery</li>
            <li>• Images are automatically optimized for web display</li>
          </ul>
        </div>
      </div>
    </div>
  );
};