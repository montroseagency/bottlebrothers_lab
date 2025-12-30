// client/src/pages/ContactReservations.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { ReservationForm } from '../reservations/ReservationForm';
import { apiClient } from '../services/api';

type Tab = 'reservation' | 'contact';

const MAP_EMBED_URL =
  'https://www.google.com/maps?q=41.316673,19.855730&z=15&output=embed';

const ContactReservations: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('reservation');

  const [contactFormData, setContactFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    eventType: '',
    date: '',
    guests: '',
    message: '',
  });

  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');

  const handleContactInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setContactFormData((prev) => ({ ...prev, [name]: value }));
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
          | 'reservation'
          | 'private_event'
          | 'catering'
          | 'corporate'
          | 'feedback'
          | 'general',
        message: contactFormData.message,
        event_date: contactFormData.date || undefined,
        guest_count: contactFormData.guests ? parseInt(contactFormData.guests) : undefined,
        event_type: ([
          'corporate',
          'other',
          'wedding',
          'birthday',
          'anniversary',
          'graduation',
        ].includes(contactFormData.eventType)
          ? contactFormData.eventType
          : undefined) as
          | 'corporate'
          | 'other'
          | 'wedding'
          | 'birthday'
          | 'anniversary'
          | 'graduation'
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
        message: '',
      });
    } catch (error) {
      setContactError(
        error instanceof Error ? error.message : 'Failed to send message. Please try again.'
      );
    } finally {
      setContactLoading(false);
    }
  };

  const handleReservationSuccess = (reservation: any) => {
    console.log('Reservation successful:', reservation);
  };

  const handleReservationError = (error: string) => {
    console.error('Reservation error:', error);
  };

  // ✅ Put your real info here (matches screenshot layout)
  const info = useMemo(
    () => ({
      addressTitle: 'Address',
      addressLines: ['Sunlake Villa', 'Panorama e Liqenit, Liqeni i Farkës', 'Tiranë, Albania'],
      phoneTitle: 'Phone',
      phoneValue: '+355 69 383 0639',
      emailTitle: 'Email',
      emailValue: 'villasunlake@gmail.com',
      hoursTitle: 'Hours',
      hoursLines: ['Front Desk: 24/7', 'Check-in: 3:00 PM', 'Check-out: 11:00 AM'],
      callHref: 'tel:+355693830639',
      emailHref: 'mailto:villasunlake@gmail.com',
      mapsHref: 'https://maps.google.com/?q=41.316673,19.855730',
    }),
    []
  );

  return (
    <div className="bg-white min-h-screen">
      {/* ✅ HERO (WHITE ONLY) */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900">
              Get in Touch
            </h1>
            <p className="mt-3 text-base sm:text-lg text-gray-600 leading-relaxed">
              Have a question or need assistance? Our team is here to help. Reach out to us through any of
              the following channels.
            </p>
          </div>
        </div>
      </section>

      {/* ✅ TABS (WHITE ONLY) */}
      <section className="bg-white border-b border-gray-200 sticky top-16 sm:top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-center">
            <div className="bg-white border border-gray-200 rounded-2xl p-1 shadow-sm">
              <button
                onClick={() => setActiveTab('reservation')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'reservation'
                    ? 'bg-green-700 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Make Reservation
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'contact'
                    ? 'bg-green-700 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ✅ CONTENT */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          {/* ========================= */}
          {/* ✅ RESERVATION TAB */}
          {/* ========================= */}
          {activeTab === 'reservation' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-4 sm:p-6">
                  <ReservationForm onSuccess={handleReservationSuccess} onError={handleReservationError} />
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sm:p-7">
                  <h3 className="text-xl font-extrabold text-gray-900">Reservation Info</h3>
                  <p className="mt-2 text-sm text-gray-600">
                    For large groups or special requests, send us a message.
                  </p>

                  <div className="mt-6 space-y-3 text-sm text-gray-700">
                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="font-semibold text-gray-900">Hours</div>
                      <div className="mt-2 text-gray-600">
                        Front Desk: 24/7 <br />
                        Check-in: 3:00 PM <br />
                        Check-out: 11:00 AM
                      </div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="font-semibold text-gray-900">Phone</div>
                      <div className="mt-2 text-gray-600">{info.phoneValue}</div>
                    </div>

                    <div className="rounded-xl border border-gray-200 p-4">
                      <div className="font-semibold text-gray-900">Email</div>
                      <div className="mt-2 text-gray-600 break-all">{info.emailValue}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================= */}
          {/* ✅ CONTACT TAB (MATCH SCREENSHOT) */}
          {/* ========================= */}
          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN */}
              <div className="lg:col-span-6">
                {/* Cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Address card */}
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sm:p-7">
                    <h3 className="text-2xl font-extrabold text-gray-900">{info.addressTitle}</h3>
                    <div className="mt-4 space-y-1 text-gray-600">
                      {info.addressLines.map((line, idx) => (
                        <p key={idx} className="text-base">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Phone card */}
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sm:p-7">
                    <h3 className="text-2xl font-extrabold text-gray-900">{info.phoneTitle}</h3>
                    <p className="mt-4 text-base text-gray-600">{info.phoneValue}</p>
                  </div>

                  {/* Email card */}
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sm:p-7">
                    <h3 className="text-2xl font-extrabold text-gray-900">{info.emailTitle}</h3>
                    <p className="mt-4 text-base text-gray-600 break-all">{info.emailValue}</p>
                  </div>

                  {/* Hours card */}
                  <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sm:p-7">
                    <h3 className="text-2xl font-extrabold text-gray-900">{info.hoursTitle}</h3>
                    <div className="mt-4 space-y-1 text-gray-600">
                      {info.hoursLines.map((line, idx) => (
                        <p key={idx} className="text-base">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom buttons */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <a
                    href={info.callHref}
                    className="inline-flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 shadow-lg transition"
                  >
                    Call Now
                  </a>
                  <a
                    href={info.emailHref}
                    className="inline-flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 shadow-lg transition"
                  >
                    Email Us
                  </a>
                  <a
                    href={info.mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 shadow-lg transition"
                  >
                    Open in Maps
                  </a>
                </div>

                {/* Map (big, like screenshot) */}
                <div className="mt-8 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
                  <iframe
                    title="Google Map"
                    src={MAP_EMBED_URL}
                    className="w-full h-[320px] sm:h-[380px]"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>

              {/* RIGHT COLUMN - FORM */}
              <div className="lg:col-span-6">
                <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 sm:p-8">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                    Send us a Message
                  </h2>

                  {contactSuccess && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-green-800 font-semibold">
                        ✅ Thank you! Your message has been sent successfully.
                      </p>
                    </div>
                  )}

                  {contactError && (
                    <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-red-700 font-semibold">{contactError}</p>
                    </div>
                  )}

                  <form onSubmit={handleContactSubmit} className="mt-6 space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={contactFormData.name}
                        onChange={handleContactInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={contactFormData.email}
                          onChange={handleContactInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                          placeholder="your@email.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={contactFormData.phone}
                          onChange={handleContactInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                          placeholder="+355 ..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Subject <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="subject"
                        required
                        value={contactFormData.subject}
                        onChange={handleContactInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
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

                    <div>
                      <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={6}
                        value={contactFormData.message}
                        onChange={handleContactInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-green-500 focus:border-transparent transition resize-none"
                        placeholder="How can we help you?"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={contactLoading}
                      className="w-full bg-amber-50 hover:bg-amber-100 text-gray-900 border border-amber-200 font-bold py-3 rounded-xl shadow-md transition disabled:opacity-50"
                    >
                      {contactLoading ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
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
