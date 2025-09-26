// client/src/pages/ContactReservations.tsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ReservationForm } from '../reservations/ReservationForm';
import apiClient from '../../services/api';

const ContactReservations: React.FC = () => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'reservation' | 'contact'>('reservation');
  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    eventType: '',
    date: '',
    guests: '',
    message: ''
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');

  const handleContactInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setContactFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setContactError('');
    setContactSuccess(false);
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setContactLoading(true);
    setContactError('');

    try {
      const contactData = {
        name: contactFormData.name,
        email: contactFormData.email,
        phone: contactFormData.phone,
        subject: contactFormData.subject as
          | "reservation"
          | "private_event"
          | "catering"
          | "corporate"
          | "feedback"
          | "general",
        message: contactFormData.message,
        event_date: contactFormData.date || undefined,
        guest_count: contactFormData.guests ? parseInt(contactFormData.guests) : undefined,
        event_type: (["corporate", "other", "wedding", "birthday", "anniversary", "graduation"].includes(contactFormData.eventType)
          ? contactFormData.eventType
          : undefined) as
            | "corporate"
            | "other"
            | "wedding"
            | "birthday"
            | "anniversary"
            | "graduation"
            | undefined,
      };

      await apiClient.submitContactMessage(contactData);
      
      setContactSuccess(true);
      setContactFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        eventType: '',
        date: '',
        guests: '',
        message: ''
      });
    } catch (error) {
      setContactError(error instanceof Error ? error.message : 'Failed to send message. Please try again.');
    } finally {
      setContactLoading(false);
    }
  };

  const handleReservationSuccess = (reservation: any) => {
    // Handle successful reservation - maybe show success modal or redirect
    console.log('Reservation successful:', reservation);
  };

  const handleReservationError = (error: string) => {
    // Handle reservation error
    console.error('Reservation error:', error);
  };

  return (
    <div className="bg-stone-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-stone-100 to-stone-200 py-16 sm:py-20 lg:py-32 xl:py-40 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-900/10 to-green-800/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-5xl mx-auto">
            <span className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide mb-4 sm:mb-6">
              Get In Touch
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-800 mb-4 sm:mb-6 leading-tight">
              Reserve & <span className="text-green-800">Connect</span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 sm:mb-10 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
              Make a reservation or get in touch for private events, catering, and special occasions.
            </p>
          </div>
        </div>
      </section>

      {/* Tab Navigation */}
      <section className="py-8 bg-white sticky top-16 sm:top-20 z-40 shadow-md">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="bg-stone-100 rounded-lg p-1 shadow-sm border">
              <button
                onClick={() => setActiveTab('reservation')}
                className={`px-6 py-3 rounded-md font-medium transition-colors duration-300 ${
                  activeTab === 'reservation'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Make Reservation
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`px-6 py-3 rounded-md font-medium transition-colors duration-300 ${
                  activeTab === 'contact'
                    ? 'bg-green-600 text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <section className="py-16 sm:py-20 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Reservation Tab */}
          {activeTab === 'reservation' && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 lg:gap-12">
              <div className="lg:col-span-3">
                <ReservationForm
                  onSuccess={handleReservationSuccess}
                  onError={handleReservationError}
                />
              </div>
              
              {/* Reservation Info Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-stone-200 sticky top-32">
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Reservation Info</h3>
                  
                  <div className="space-y-4 text-sm">
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold">Operating Hours</p>
                        <p className="text-gray-600">Monday - Thursday: 5:00 PM - 11:00 PM<br/>
                        Friday - Saturday: 5:00 PM - 12:00 AM<br/>
                        Sunday: 5:00 PM - 10:00 PM</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <div>
                        <p className="font-semibold">Party Size</p>
                        <p className="text-gray-600">Accommodations for 1-20 guests</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="font-semibold">Advance Booking</p>
                        <p className="text-gray-600">Reservations accepted up to 90 days in advance</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <div>
                        <p className="font-semibold">Need Help?</p>
                        <p className="text-gray-600">Call us at +1 (555) 123-4567</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contact Tab */}
          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
              
              {/* Contact Form */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-stone-200">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">Send us a Message</h2>
                  
                  {contactSuccess && (
                    <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex">
                        <svg className="w-5 h-5 text-green-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-green-700">Thank you! Your message has been sent successfully.</p>
                      </div>
                    </div>
                  )}

                  {contactError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex">
                        <svg className="w-5 h-5 text-red-400 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-red-700">{contactError}</p>
                      </div>
                    </div>
                  )}
                  
                  <form onSubmit={handleContactSubmit} className="space-y-4 sm:space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                          Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={contactFormData.name}
                          onChange={handleContactInputChange}
                          className="w-full px-3 py-3 sm:px-4 sm:py-4 border border-stone-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-stone-50 hover:bg-white text-sm sm:text-base"
                          placeholder="Your full name"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={contactFormData.email}
                          onChange={handleContactInputChange}
                          className="w-full px-3 py-3 sm:px-4 sm:py-4 border border-stone-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-stone-50 hover:bg-white text-sm sm:text-base"
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                          Phone
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={contactFormData.phone}
                          onChange={handleContactInputChange}
                          className="w-full px-3 py-3 sm:px-4 sm:py-4 border border-stone-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-stone-50 hover:bg-white text-sm sm:text-base"
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                          Subject *
                        </label>
                        <select
                          id="subject"
                          name="subject"
                          required
                          value={contactFormData.subject}
                          onChange={handleContactInputChange}
                          className="w-full px-3 py-3 sm:px-4 sm:py-4 border border-stone-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-stone-50 hover:bg-white text-sm sm:text-base"
                        >
                          <option value="">Select a subject</option>
                          <option value="reservation">Reservation Inquiry</option>
                          <option value="private_event">Private Event</option>
                          <option value="catering">Catering Services</option>
                          <option value="corporate">Corporate Booking</option>
                          <option value="feedback">Feedback</option>
                          <option value="general">General Inquiry</option>
                        </select>
                      </div>
                    </div>

                    {/* Event-specific fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                      <div>
                        <label htmlFor="eventType" className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                          Event Type
                        </label>
                        <select
                          id="eventType"
                          name="eventType"
                          value={contactFormData.eventType}
                          onChange={handleContactInputChange}
                          className="w-full px-3 py-3 sm:px-4 sm:py-4 border border-stone-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-stone-50 hover:bg-white text-sm sm:text-base"
                        >
                          <option value="">Select event type</option>
                          <option value="birthday">Birthday Party</option>
                          <option value="corporate">Corporate Event</option>
                          <option value="wedding">Wedding</option>
                          <option value="anniversary">Anniversary</option>
                          <option value="graduation">Graduation</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      
                      <div>
                        <label htmlFor="date" className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                          Event Date
                        </label>
                        <input
                          type="date"
                          id="date"
                          name="date"
                          value={contactFormData.date}
                          onChange={handleContactInputChange}
                          className="w-full px-3 py-3 sm:px-4 sm:py-4 border border-stone-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-stone-50 hover:bg-white text-sm sm:text-base"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="guests" className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                          Number of Guests
                        </label>
                        <input
                          type="number"
                          id="guests"
                          name="guests"
                          min="1"
                          max="500"
                          value={contactFormData.guests}
                          onChange={handleContactInputChange}
                          className="w-full px-3 py-3 sm:px-4 sm:py-4 border border-stone-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-stone-50 hover:bg-white text-sm sm:text-base"
                          placeholder="Number of guests"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={5}
                        value={contactFormData.message}
                        onChange={handleContactInputChange}
                        className="w-full px-3 py-3 sm:px-4 sm:py-4 border border-stone-300 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 bg-stone-50 hover:bg-white text-sm sm:text-base resize-none"
                        placeholder="Tell us about your inquiry..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={contactLoading}
                      className="w-full bg-green-800 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-lg sm:rounded-xl text-base sm:text-lg font-semibold hover:bg-green-900 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {contactLoading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending Message...
                        </>
                      ) : (
                        'Send Message'
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Contact Information */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl p-6 sm:p-8 shadow-lg border border-stone-200 h-fit sticky top-32">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">Get in Touch</h3>
                  
                  <div className="space-y-4 sm:space-y-6">
                    {/* Address */}
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 mb-2 text-base sm:text-lg">Address</h4>
                        <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                          123 Upscale Boulevard<br/>
                          Downtown District<br/>
                          City, State 12345
                        </p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 mb-2 text-base sm:text-lg">Phone</h4>
                        <p className="text-gray-600 mb-2 text-sm sm:text-base">+1 (555) 123-4567</p>
                        <p className="text-xs sm:text-sm text-gray-500">Daily: 2:00 PM - 11:00 PM<br/>For reservations and inquiries</p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-start space-x-3 sm:space-x-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-green-100 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800 mb-2 text-base sm:text-lg">Email</h4>
                        <p className="text-gray-600 mb-1 text-sm sm:text-base break-all">hello@thelounge.com</p>
                        <p className="text-gray-600 mb-2 text-sm sm:text-base break-all">events@thelounge.com</p>
                        <p className="text-xs sm:text-sm text-gray-500">Response within 24 hours</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ContactReservations;