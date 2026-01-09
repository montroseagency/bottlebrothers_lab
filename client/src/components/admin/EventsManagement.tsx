// client/src/components/admin/EventsManagement.tsx - FIXED VERSION
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuthenticatedApi } from '../../contexts/AuthContext';
import type { Event } from '../../services/api';

// Extended Event type with video fields
interface EventWithVideo extends Event {
  video_original_url?: string | null;
  video_webm_url?: string | null;
  video_status?: 'none' | 'uploading' | 'processing' | 'completed' | 'failed';
  video_duration?: number | null;
  video_error?: string | null;
  video_task_id?: string | null;
}

export const EventsManagement: React.FC = () => {
  const { apiCall } = useAuthenticatedApi();
  const [events, setEvents] = useState<EventWithVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventWithVideo | null>(null);

  // Video upload state
  const [selectedVideoFile, setSelectedVideoFile] = useState<File | null>(null);
  const [videoUploadProgress, setVideoUploadProgress] = useState<number>(0);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoStatusPolling, setVideoStatusPolling] = useState<string | null>(null);
  const videoStatusIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    event_type: 'regular',
    start_date: '',
    end_date: '',
    start_time: '19:00',
    end_time: '23:00',
    recurring_type: 'none',
    recurring_days: '',
    recurring_until: '',
    formatted_price: 'Free',
    price: 0,
    location: 'Main Dining Hall',
    capacity: 50,
    booking_required: false,
    booking_url: '',
    is_featured: false,
    is_active: true,
    special_notes: '',
    display_order: 0
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await apiCall('/events/', { method: 'GET' });
      setEvents(data || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      setError('Failed to load events. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (name === 'price' || name === 'capacity' || name === 'display_order') {
      setFormData(prev => ({
        ...prev,
        [name]: parseFloat(value) || 0
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
      if (file.size > 5 * 1024 * 1024) {
        setMessage('❌ File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setMessage('❌ Please select an image file');
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
      event_type: 'regular',
      start_date: '',
      end_date: '',
      start_time: '19:00',
      end_time: '23:00',
      recurring_type: 'none',
      recurring_days: '',
      recurring_until: '',
      formatted_price: 'Free',
      price: 0,
      location: 'Main Dining Hall',
      capacity: 50,
      booking_required: false,
      booking_url: '',
      is_featured: false,
      is_active: true,
      special_notes: '',
      display_order: 0
    });
    setSelectedFile(null);
    setSelectedVideoFile(null);
    setEditingEvent(null);
    setIsFormOpen(false);
    setMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    
    try {
      // Create FormData manually to ensure proper handling
      const formDataToSend = new FormData();
      
      // Add all form fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('event_type', formData.event_type);
      formDataToSend.append('start_date', formData.start_date);
      formDataToSend.append('start_time', formData.start_time);
      formDataToSend.append('end_time', formData.end_time);
      formDataToSend.append('recurring_type', formData.recurring_type);
      formDataToSend.append('formatted_price', formData.formatted_price);
      formDataToSend.append('price', formData.price.toString());
      formDataToSend.append('location', formData.location);
      formDataToSend.append('capacity', formData.capacity.toString());
      formDataToSend.append('booking_required', formData.booking_required.toString());
      formDataToSend.append('is_featured', formData.is_featured.toString());
      formDataToSend.append('is_active', formData.is_active.toString());
      formDataToSend.append('display_order', formData.display_order.toString());
      
      // Add optional fields only if they have values
      if (formData.end_date) {
        formDataToSend.append('end_date', formData.end_date);
      }
      if (formData.recurring_days) {
        formDataToSend.append('recurring_days', formData.recurring_days);
      }
      if (formData.recurring_until) {
        formDataToSend.append('recurring_until', formData.recurring_until);
      }
      if (formData.booking_url) {
        formDataToSend.append('booking_url', formData.booking_url);
      }
      if (formData.special_notes) {
        formDataToSend.append('special_notes', formData.special_notes);
      }
      
      // Add image if selected
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }
      
      // Debug: Log FormData contents
      console.log('Sending FormData with the following fields:');
      for (let [key, value] of formDataToSend.entries()) {
        console.log(`${key}:`, value);
      }
      
      if (editingEvent) {
        // Update existing event
        await apiCall(`/events/${editingEvent.id}/`, {
          method: 'PATCH',
          body: formDataToSend
        });
        setMessage('✅ Event updated successfully!');
      } else {
        // Create new event
        await apiCall('/events/', {
          method: 'POST',
          body: formDataToSend
        });
        setMessage('✅ Event created successfully!');
      }
      
      fetchEvents();
      resetForm();
    } catch (error) {
      console.error('Failed to save event:', error);
      setError(`❌ Failed to save event: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      event_type: event.event_type,
      start_date: event.start_date,
      end_date: event.end_date || '',
      start_time: event.start_time,
      end_time: event.end_time || '23:00',
      recurring_type: event.recurring_type || 'none',
      recurring_days: event.recurring_days || '',
      recurring_until: event.recurring_until || '',
      formatted_price: event.formatted_price || 'Free',
      price: typeof event.price === 'number' ? event.price : 0,
      location: event.location,
      capacity: event.capacity || event.max_capacity || 50,
      booking_required: event.booking_required,
      booking_url: event.booking_url || '',
      is_featured: event.is_featured,
      is_active: event.is_active !== undefined ? event.is_active : true,
      special_notes: event.special_notes || '',
      display_order: event.display_order || 0
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }
    
    try {
      await apiCall(`/events/${eventId}/`, { method: 'DELETE' });
      setMessage('✅ Event deleted successfully!');
      fetchEvents();
    } catch (error) {
      console.error('Failed to delete event:', error);
      setError('❌ Failed to delete event');
    }
  };

  const toggleFeatured = async (eventId: string) => {
    try {
      await apiCall(`/events/${eventId}/toggle_featured/`, { method: 'PATCH' });
      fetchEvents();
    } catch (error) {
      console.error('Failed to toggle featured:', error);
    }
  };

  const toggleActive = async (eventId: string) => {
    try {
      await apiCall(`/events/${eventId}/toggle_active/`, { method: 'PATCH' });
      fetchEvents();
    } catch (error) {
      console.error('Failed to toggle active:', error);
    }
  };

  // Video upload handler
  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        setMessage('Video file size must be less than 100MB');
        return;
      }
      // Check file type
      if (!file.type.startsWith('video/') || !['video/mp4', 'video/mpeg', 'video/quicktime'].includes(file.type)) {
        setMessage('Please select an MP4 video file');
        return;
      }
      setSelectedVideoFile(file);
      setMessage('');
    }
  };

  // Upload video for an event
  const handleVideoUpload = async (eventId: string) => {
    if (!selectedVideoFile) {
      setMessage('Please select a video file first');
      return;
    }

    setIsUploadingVideo(true);
    setVideoUploadProgress(0);
    setError('');

    try {
      const formData = new FormData();
      formData.append('video', selectedVideoFile);

      const response = await apiCall(`/events/${eventId}/upload_video/`, {
        method: 'POST',
        body: formData
      });

      setMessage('Video uploaded successfully! Conversion in progress...');
      setSelectedVideoFile(null);
      setVideoStatusPolling(eventId);

      // Start polling for video status
      startVideoStatusPolling(eventId);

      fetchEvents();
    } catch (error) {
      console.error('Failed to upload video:', error);
      setError(`Failed to upload video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploadingVideo(false);
      setVideoUploadProgress(0);
    }
  };

  // Poll video conversion status
  const startVideoStatusPolling = useCallback((eventId: string) => {
    // Clear any existing polling
    if (videoStatusIntervalRef.current) {
      clearInterval(videoStatusIntervalRef.current);
    }

    videoStatusIntervalRef.current = setInterval(async () => {
      try {
        const statusData = await apiCall(`/events/${eventId}/video_status/`, { method: 'GET' });

        if (statusData.status === 'completed') {
          setMessage('Video conversion completed successfully!');
          setVideoStatusPolling(null);
          if (videoStatusIntervalRef.current) {
            clearInterval(videoStatusIntervalRef.current);
          }
          fetchEvents();
        } else if (statusData.status === 'failed') {
          setError(`Video conversion failed: ${statusData.error || 'Unknown error'}`);
          setVideoStatusPolling(null);
          if (videoStatusIntervalRef.current) {
            clearInterval(videoStatusIntervalRef.current);
          }
          fetchEvents();
        }
      } catch (error) {
        console.error('Failed to check video status:', error);
      }
    }, 3000); // Poll every 3 seconds
  }, [apiCall]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (videoStatusIntervalRef.current) {
        clearInterval(videoStatusIntervalRef.current);
      }
    };
  }, []);

  // Delete video
  const handleDeleteVideo = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      await apiCall(`/events/${eventId}/delete_video/`, { method: 'DELETE' });
      setMessage('Video deleted successfully!');
      fetchEvents();
    } catch (error) {
      console.error('Failed to delete video:', error);
      setError('Failed to delete video');
    }
  };

  // Format video duration
  const formatDuration = (seconds: number | null | undefined): string => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get video status badge
  const getVideoStatusBadge = (status: string | undefined) => {
    switch (status) {
      case 'processing':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
            <svg className="w-3 h-3 mr-1 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Video Ready
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Events Management</h1>
            <p className="text-gray-600 mt-2">Manage restaurant events and special occasions</p>
          </div>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Add New Event</span>
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

        {/* Event Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingEvent ? 'Edit Event' : 'Create New Event'}
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
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Type *
                    </label>
                    <select
                      name="event_type"
                      value={formData.event_type}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="regular">Regular Event</option>
                      <option value="featured">Featured Event</option>
                      <option value="recurring">Recurring Event</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={formData.start_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date (optional)
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={formData.end_date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      name="start_time"
                      value={formData.start_time}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time *
                    </label>
                    <input
                      type="time"
                      name="end_time"
                      value={formData.end_time}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>

                {/* Pricing & Capacity */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Price Display *
                    </label>
                    <input
                      type="text"
                      name="formatted_price"
                      value={formData.formatted_price}
                      onChange={handleInputChange}
                      placeholder="e.g., Free, $20, $50 per person"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Capacity
                    </label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>

                {/* Display Settings */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="is_featured"
                      id="is_featured"
                      checked={formData.is_featured}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
                      Featured Event
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      name="is_active"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                      Active
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* Event Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Image {!editingEvent && '*'}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required={!editingEvent}
                  />
                  <p className="text-sm text-gray-500 mt-1">Max 5MB - JPG, PNG, WebP</p>

                  {selectedFile && (
                    <div className="mt-4">
                      <img
                        src={URL.createObjectURL(selectedFile)}
                        alt="Preview"
                        className="max-w-full h-48 object-cover rounded-lg border"
                      />
                    </div>
                  )}
                </div>

                {/* Event Video - Only show when editing */}
                {editingEvent && (
                  <div className="border-t border-gray-200 pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Video (Optional)
                    </label>

                    {/* Current video status */}
                    {editingEvent.video_status && editingEvent.video_status !== 'none' && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">Current Video</span>
                          {getVideoStatusBadge(editingEvent.video_status)}
                        </div>

                        {editingEvent.video_status === 'completed' && editingEvent.video_webm_url && (
                          <div className="mt-3">
                            <video
                              controls
                              className="w-full max-w-md rounded-lg border"
                              preload="metadata"
                            >
                              <source src={editingEvent.video_webm_url} type="video/webm" />
                              <source src={editingEvent.video_original_url || ''} type="video/mp4" />
                              Your browser does not support video playback.
                            </video>
                            {editingEvent.video_duration && (
                              <p className="text-sm text-gray-500 mt-1">
                                Duration: {formatDuration(editingEvent.video_duration)}
                              </p>
                            )}
                          </div>
                        )}

                        {editingEvent.video_status === 'processing' && (
                          <div className="mt-3">
                            <div className="flex items-center text-yellow-700">
                              <svg className="w-5 h-5 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Video is being converted to WebM format...
                            </div>
                          </div>
                        )}

                        {editingEvent.video_status === 'failed' && editingEvent.video_error && (
                          <div className="mt-3 text-sm text-red-600">
                            Error: {editingEvent.video_error}
                          </div>
                        )}

                        {/* Delete video button */}
                        {editingEvent.video_status !== 'processing' && (
                          <button
                            type="button"
                            onClick={() => handleDeleteVideo(editingEvent.id)}
                            className="mt-3 text-sm text-red-600 hover:text-red-800 flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Video
                          </button>
                        )}
                      </div>
                    )}

                    {/* Upload new video */}
                    {editingEvent.video_status !== 'processing' && (
                      <div className="space-y-3">
                        <input
                          type="file"
                          accept="video/mp4,video/mpeg,video/quicktime"
                          onChange={handleVideoSelect}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        <p className="text-sm text-gray-500">Max 100MB - MP4 format. Video will be converted to WebM for web playback.</p>

                        {selectedVideoFile && (
                          <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center">
                              <svg className="w-8 h-8 text-blue-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                              <div>
                                <p className="text-sm font-medium text-gray-900">{selectedVideoFile.name}</p>
                                <p className="text-xs text-gray-500">
                                  {(selectedVideoFile.size / (1024 * 1024)).toFixed(2)} MB
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleVideoUpload(editingEvent.id)}
                              disabled={isUploadingVideo}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                              {isUploadingVideo ? (
                                <>
                                  <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Uploading...
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                  </svg>
                                  Upload Video
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

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
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Events List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Video
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-lg font-medium">No events found</p>
                      <p className="text-sm mt-1">Get started by creating your first event</p>
                    </td>
                  </tr>
                ) : (
                  events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{event.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {event.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          event.event_type === 'featured' 
                            ? 'bg-yellow-100 text-yellow-800'
                            : event.event_type === 'recurring'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {event.event_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div>{event.start_date}</div>
                        <div className="text-gray-500">
                          {event.start_time} - {event.end_time}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {event.location}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {event.formatted_price || 'Free'}
                      </td>
                      <td className="px-6 py-4">
                        {getVideoStatusBadge(event.video_status)}
                        {event.video_status === 'completed' && event.video_duration && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({formatDuration(event.video_duration)})
                          </span>
                        )}
                        {(!event.video_status || event.video_status === 'none') && (
                          <span className="text-xs text-gray-400">No video</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => toggleFeatured(event.id)}
                            className={`p-1 rounded-full transition-colors ${
                              event.is_featured
                                ? 'bg-yellow-100 text-yellow-600 hover:bg-yellow-200'
                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                            }`}
                            title="Toggle Featured"
                          >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                            </svg>
                          </button>
                          
                          <button
                            onClick={() => toggleActive(event.id)}
                            className={`p-1 rounded-full transition-colors ${
                              event.is_active
                                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                : 'bg-red-100 text-red-600 hover:bg-red-200'
                            }`}
                            title="Toggle Active"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={
                                event.is_active
                                  ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  : "M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                              } />
                            </svg>
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(event)}
                            className="text-blue-600 hover:text-blue-800 transition-colors"
                            title="Edit"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                            title="Delete"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            Event Management Tips
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li className="flex items-start">
              <span className="block w-2 h-2 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
              <span>Featured events appear prominently on the homepage and events page</span>
            </li>
            <li className="flex items-start">
              <span className="block w-2 h-2 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
              <span>Use recurring events for regular weekly or monthly happenings</span>
            </li>
            <li className="flex items-start">
              <span className="block w-2 h-2 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
              <span>Display order determines the sequence events appear (lower numbers first)</span>
            </li>
            <li className="flex items-start">
              <span className="block w-2 h-2 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
              <span>Inactive events are hidden from public view but preserved in the system</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};