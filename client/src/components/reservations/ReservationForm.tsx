import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { ReservationFormData, DayAvailability } from '../../services/api';
import apiClient from '../../services/api';

interface ReservationFormProps {
  onSuccess?: (reservation: any) => void;
  onError?: (error: string) => void;
  className?: string;
}

export const ReservationForm: React.FC<ReservationFormProps> = ({
  onSuccess,
  onError,
  className = ''
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<ReservationFormData>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    party_size: 2,
    occasion: '',
    special_requests: '',
    dietary_restrictions: ''
  });
  
  const [availability, setAvailability] = useState<DayAvailability[]>([]);
  const [loading, setLoading] = useState(false);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState(false);

  // Fetch availability when date changes
  useEffect(() => {
    if (formData.date) {
      fetchAvailability(formData.date);
    }
  }, [formData.date]);

  const fetchAvailability = async (date: string) => {
    setAvailabilityLoading(true);
    try {
      const availabilityData = await apiClient.getAvailability(date);
      setAvailability(availabilityData);
      
      // Reset time selection if current selection is no longer available
      if (formData.time) {
        const dayData = availabilityData.find(day => day.date === date);
        const isTimeStillAvailable = dayData?.slots.some(slot => 
          slot.time === formData.time && 
          slot.is_available && 
          (slot.available_capacity || 0) >= formData.party_size
        );
        
        if (!isTimeStillAvailable) {
          setFormData(prev => ({ ...prev, time: '' }));
        }
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
      setErrors(prev => ({
        ...prev,
        date: 'Unable to load availability for this date. Please try again.'
      }));
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: name === 'party_size' ? parseInt(value) || 1 : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Clear success message
    setSuccess(false);

    // If party size changes and time is selected, recheck availability
    if (name === 'party_size' && formData.time && formData.date) {
      const dayData = availability.find(day => day.date === formData.date);
      const selectedSlot = dayData?.slots.find(slot => slot.time === formData.time);
      
      if (selectedSlot && (selectedSlot.available_capacity || 0) < parseInt(value)) {
        setErrors(prev => ({
          ...prev,
          time: 'Selected time slot cannot accommodate your party size. Please select a different time.'
        }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Required field validations
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        newErrors.date = 'Cannot make reservations for past dates';
      }
    }
    if (!formData.time) {
      newErrors.time = 'Time is required';
    }
    if (formData.party_size < 1 || formData.party_size > 20) {
      newErrors.party_size = 'Party size must be between 1 and 20';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setErrors({});
    
    try {
      const reservation = await apiClient.createReservation(formData);
      
      setSuccess(true);
      onSuccess?.(reservation);
      
      // Reset form after successful submission
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        date: '',
        time: '',
        party_size: 2,
        occasion: '',
        special_requests: '',
        dietary_restrictions: ''
      });
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create reservation. Please try again.';
      onError?.(errorMessage);
      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const getAvailableTimeSlots = () => {
    if (!availability.length || !formData.date) return [];
    
    const dayAvailability = availability.find(day => day.date === formData.date);
    return dayAvailability?.slots.filter(slot => 
      slot.is_available && (slot.available_capacity || 0) >= formData.party_size
    ) || [];
  };

  const minDate = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <div className={`max-w-2xl mx-auto ${className}`}>
      <h2 className="text-2xl font-bold text-neutral-900 mb-6">
        Reserve Your Table
      </h2>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex">
            <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <p className="text-green-700">Your reservation has been submitted successfully!</p>
          </div>
        </div>
      )}

      {errors.general && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex">
            <svg className="w-5 h-5 text-red-600 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-700">{errors.general}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl bg-white text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition ${
                errors.first_name ? 'border-red-500' : 'border-neutral-300'
              }`}
              placeholder="Your first name"
            />
            {errors.first_name && (
              <p className="text-red-600 text-sm mt-1">{errors.first_name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl bg-white text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition ${
                errors.last_name ? 'border-red-500' : 'border-neutral-300'
              }`}
              placeholder="Your last name"
            />
            {errors.last_name && (
              <p className="text-red-600 text-sm mt-1">{errors.last_name}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl bg-white text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition ${
                errors.email ? 'border-red-500' : 'border-neutral-300'
              }`}
              placeholder="your.email@example.com"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl bg-white text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition ${
                errors.phone ? 'border-red-500' : 'border-neutral-300'
              }`}
              placeholder="+1 (555) 123-4567"
            />
            {errors.phone && (
              <p className="text-red-600 text-sm mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        {/* Reservation Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              min={minDate}
              max={maxDate}
              className={`w-full px-4 py-3 border rounded-xl bg-white text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition ${
                errors.date ? 'border-red-500' : 'border-neutral-300'
              }`}
            />
            {errors.date && (
              <p className="text-red-600 text-sm mt-1">{errors.date}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Time <span className="text-red-500">*</span>
            </label>
            <select
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-xl bg-white text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition ${
                errors.time ? 'border-red-500' : 'border-neutral-300'
              }`}
              disabled={!formData.date || availabilityLoading}
            >
              <option value="">
                {!formData.date
                  ? 'Select date first'
                  : availabilityLoading
                  ? 'Loading...'
                  : 'Select time'
                }
              </option>
              {getAvailableTimeSlots().map(slot => (
                <option key={slot.time} value={slot.time}>
                  {slot.time_display}
                  {slot.available_capacity !== undefined && ` (${slot.available_capacity} available)`}
                </option>
              ))}
            </select>
            {errors.time && (
              <p className="text-red-600 text-sm mt-1">{errors.time}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-neutral-700 mb-2">
              Party Size <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="party_size"
              value={formData.party_size}
              onChange={handleInputChange}
              min="1"
              max="20"
              className={`w-full px-4 py-3 border rounded-xl bg-white text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition ${
                errors.party_size ? 'border-red-500' : 'border-neutral-300'
              }`}
            />
            {errors.party_size && (
              <p className="text-red-600 text-sm mt-1">{errors.party_size}</p>
            )}
          </div>
        </div>

        {/* Optional Details */}
        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Occasion
          </label>
          <select
            name="occasion"
            value={formData.occasion}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-white text-neutral-900 focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition"
          >
            <option value="">Select occasion</option>
            <option value="birthday">Birthday Celebration</option>
            <option value="anniversary">Anniversary</option>
            <option value="business">Business Meeting</option>
            <option value="date">Date Night</option>
            <option value="family">Family Gathering</option>
            <option value="celebration">Special Celebration</option>
            <option value="casual">Casual Dining</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Special Requests
          </label>
          <textarea
            name="special_requests"
            value={formData.special_requests}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-white text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition resize-none"
            placeholder="Any special requests or preferences..."
            maxLength={500}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-neutral-700 mb-2">
            Dietary Restrictions
          </label>
          <textarea
            name="dietary_restrictions"
            value={formData.dietary_restrictions}
            onChange={handleInputChange}
            rows={2}
            className="w-full px-4 py-3 border border-neutral-300 rounded-xl bg-white text-neutral-900 placeholder-neutral-400 focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition resize-none"
            placeholder="Any allergies or dietary requirements..."
            maxLength={300}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || availabilityLoading}
          className="w-full bg-white hover:bg-neutral-100 disabled:bg-neutral-200 text-neutral-900 border border-neutral-200 font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-md hover:shadow-lg"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-neutral-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Creating Reservation...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Make Reservation</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};