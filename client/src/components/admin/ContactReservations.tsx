// client/src/pages/ContactReservations.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { ReservationForm } from '../reservations/ReservationForm';
import { apiClient } from '@/services/api';

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

  // Contact info
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
    <div className="bg-[#0a0a0a] min-h-screen">
      {/* HERO - Dark Theme */}
      <section className="bg-[#0a0a0a] border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-white">
              Get in Touch
            </h1>
            <p className="mt-3 text-base sm:text-lg text-neutral-400 leading-relaxed">
              Have a question or need assistance? Our team is here to help. Reach out to us through any of
              the following channels.
            </p>
          </div>
        </div>
      </section>

      {/* TABS - Dark Theme */}
      <section className="bg-[#0a0a0a] border-b border-neutral-800 sticky top-16 sm:top-20 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-center">
            <div className="bg-[#161616] border border-neutral-800 rounded-2xl p-1">
              <button
                onClick={() => setActiveTab('reservation')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'reservation'
                    ? 'bg-[#d4af37] text-black'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                Make Reservation
              </button>
              <button
                onClick={() => setActiveTab('contact')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'contact'
                    ? 'bg-[#d4af37] text-black'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                }`}
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT - Dark Theme */}
      <section className="bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          {/* RESERVATION TAB */}
          {activeTab === 'reservation' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                <div className="bg-[#161616] border border-neutral-800 rounded-2xl p-4 sm:p-6">
                  <ReservationForm onSuccess={handleReservationSuccess} onError={handleReservationError} />
                </div>
              </div>

              <div className="lg:col-span-4">
                <div className="bg-[#161616] border border-neutral-800 rounded-2xl p-6 sm:p-7">
                  <h3 className="text-xl font-extrabold text-white">Reservation Info</h3>
                  <p className="mt-2 text-sm text-neutral-400">
                    For large groups or special requests, send us a message.
                  </p>

                  <div className="mt-6 space-y-3 text-sm">
                    <div className="rounded-xl border border-neutral-700 bg-[#1a1a1a] p-4">
                      <div className="font-semibold text-[#d4af37]">Hours</div>
                      <div className="mt-2 text-neutral-300">
                        Front Desk: 24/7 <br />
                        Check-in: 3:00 PM <br />
                        Check-out: 11:00 AM
                      </div>
                    </div>

                    <div className="rounded-xl border border-neutral-700 bg-[#1a1a1a] p-4">
                      <div className="font-semibold text-[#d4af37]">Phone</div>
                      <div className="mt-2 text-neutral-300">{info.phoneValue}</div>
                    </div>

                    <div className="rounded-xl border border-neutral-700 bg-[#1a1a1a] p-4">
                      <div className="font-semibold text-[#d4af37]">Email</div>
                      <div className="mt-2 text-neutral-300 break-all">{info.emailValue}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONTACT TAB */}
          {activeTab === 'contact' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* LEFT COLUMN */}
              <div className="lg:col-span-6">
                {/* Cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Address card */}
                  <div className="bg-[#161616] border border-neutral-800 rounded-2xl p-6 sm:p-7">
                    <h3 className="text-2xl font-extrabold text-[#d4af37]">{info.addressTitle}</h3>
                    <div className="mt-4 space-y-1 text-neutral-300">
                      {info.addressLines.map((line, idx) => (
                        <p key={idx} className="text-base">
                          {line}
                        </p>
                      ))}
                    </div>
                  </div>

                  {/* Phone card */}
                  <div className="bg-[#161616] border border-neutral-800 rounded-2xl p-6 sm:p-7">
                    <h3 className="text-2xl font-extrabold text-[#d4af37]">{info.phoneTitle}</h3>
                    <p className="mt-4 text-base text-neutral-300">{info.phoneValue}</p>
                  </div>

                  {/* Email card */}
                  <div className="bg-[#161616] border border-neutral-800 rounded-2xl p-6 sm:p-7">
                    <h3 className="text-2xl font-extrabold text-[#d4af37]">{info.emailTitle}</h3>
                    <p className="mt-4 text-base text-neutral-300 break-all">{info.emailValue}</p>
                  </div>

                  {/* Hours card */}
                  <div className="bg-[#161616] border border-neutral-800 rounded-2xl p-6 sm:p-7">
                    <h3 className="text-2xl font-extrabold text-[#d4af37]">{info.hoursTitle}</h3>
                    <div className="mt-4 space-y-1 text-neutral-300">
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
                    className="inline-flex items-center justify-center rounded-xl bg-[#d4af37] hover:bg-[#c9a432] text-black font-bold py-3 transition"
                  >
                    Call Now
                  </a>
                  <a
                    href={info.emailHref}
                    className="inline-flex items-center justify-center rounded-xl bg-[#d4af37] hover:bg-[#c9a432] text-black font-bold py-3 transition"
                  >
                    Email Us
                  </a>
                  <a
                    href={info.mapsHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-xl bg-[#d4af37] hover:bg-[#c9a432] text-black font-bold py-3 transition"
                  >
                    Open in Maps
                  </a>
                </div>

                {/* Map */}
                <div className="mt-8 bg-[#161616] border border-neutral-800 rounded-2xl overflow-hidden">
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
                <div className="bg-[#161616] border border-neutral-800 rounded-2xl p-6 sm:p-8">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Send us a Message
                  </h2>

                  {contactSuccess && (
                    <div className="mt-6 p-4 bg-green-900/30 border border-green-700 rounded-xl">
                      <p className="text-green-400 font-semibold">
                        Thank you! Your message has been sent successfully.
                      </p>
                    </div>
                  )}

                  {contactError && (
                    <div className="mt-6 p-4 bg-red-900/30 border border-red-700 rounded-xl">
                      <p className="text-red-400 font-semibold">{contactError}</p>
                    </div>
                  )}

                  <form onSubmit={handleContactSubmit} className="mt-6 space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-300 mb-2">
                        Name <span className="text-[#d4af37]">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={contactFormData.name}
                        onChange={handleContactInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-700 bg-[#1a1a1a] text-white placeholder-neutral-500 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent transition"
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-300 mb-2">
                          Email <span className="text-[#d4af37]">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={contactFormData.email}
                          onChange={handleContactInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-neutral-700 bg-[#1a1a1a] text-white placeholder-neutral-500 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent transition"
                          placeholder="your@email.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-neutral-300 mb-2">
                          Phone
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={contactFormData.phone}
                          onChange={handleContactInputChange}
                          className="w-full px-4 py-3 rounded-xl border border-neutral-700 bg-[#1a1a1a] text-white placeholder-neutral-500 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent transition"
                          placeholder="+355 ..."
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-300 mb-2">
                        Subject <span className="text-[#d4af37]">*</span>
                      </label>
                      <select
                        name="subject"
                        required
                        value={contactFormData.subject}
                        onChange={handleContactInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-700 bg-[#1a1a1a] text-white focus:ring-2 focus:ring-[#d4af37] focus:border-transparent transition"
                      >
                        <option value="" className="bg-[#1a1a1a]">Select a subject</option>
                        <option value="reservation" className="bg-[#1a1a1a]">Reservation Inquiry</option>
                        <option value="private_event" className="bg-[#1a1a1a]">Private Event</option>
                        <option value="catering" className="bg-[#1a1a1a]">Catering Services</option>
                        <option value="corporate" className="bg-[#1a1a1a]">Corporate Booking</option>
                        <option value="feedback" className="bg-[#1a1a1a]">Feedback</option>
                        <option value="general" className="bg-[#1a1a1a]">General Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-neutral-300 mb-2">
                        Message <span className="text-[#d4af37]">*</span>
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={6}
                        value={contactFormData.message}
                        onChange={handleContactInputChange}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-700 bg-[#1a1a1a] text-white placeholder-neutral-500 focus:ring-2 focus:ring-[#d4af37] focus:border-transparent transition resize-none"
                        placeholder="How can we help you?"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={contactLoading}
                      className="w-full bg-[#d4af37] hover:bg-[#c9a432] text-black font-bold py-3 rounded-xl transition disabled:opacity-50"
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
