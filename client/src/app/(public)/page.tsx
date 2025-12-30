import React from 'react';
import {
  HeroSection,
  TonightsVibe,
  OurStory,
  SignaturePicks,
  UpcomingEvents,
  GalleryPreview,
  ReviewsCarousel,
  LocationSection,
  FinalCTA,
} from '@/components/sections';
import { getFeaturedEvent, getUpcomingEvents, getFeaturedMenuItems, getFeaturedGalleryItems, Event, MenuItem, GalleryItem } from '@/lib/api';

// This is a Server Component - data fetching happens on the server
export default async function HomePage() {
  // Fetch data in parallel on the server
  let featuredEvent: Event | null = null;
  let upcomingEvents: Event[] = [];
  let featuredMenuItems: MenuItem[] = [];
  let galleryItems: GalleryItem[] = [];

  try {
    [featuredEvent, upcomingEvents, featuredMenuItems, galleryItems] = await Promise.all([
      getFeaturedEvent(),
      getUpcomingEvents(3),
      getFeaturedMenuItems(6),
      getFeaturedGalleryItems(8),
    ]);
  } catch (error) {
    console.error('Error fetching home page data:', error);
    // Use empty defaults - app should still work
  }

  return (
    <main className="min-h-screen bg-white">
      {/* 1. Hero Section - Full-screen with video/image overlay */}
      <HeroSection />

      {/* 2. Tonight's Vibe - Dynamic banner for featured event */}
      {featuredEvent && <TonightsVibe event={featuredEvent} />}

      {/* 3. Our Story - About section with parallax images */}
      <OurStory />

      {/* 4. Signature Picks - Featured menu carousel */}
      {featuredMenuItems.length > 0 && <SignaturePicks items={featuredMenuItems} />}

      {/* 5. Upcoming Events - Next 3 events */}
      {upcomingEvents.length > 0 && <UpcomingEvents events={upcomingEvents} />}

      {/* 6. Gallery Preview - Masonry grid */}
      {galleryItems.length > 0 && <GalleryPreview items={galleryItems} />}

      {/* 7. Reviews - Customer testimonials carousel */}
      <ReviewsCarousel />

      {/* 8. Location - Interactive map + contact */}
      <LocationSection />

      {/* 9. Final CTA - Reservation prompt */}
      <FinalCTA />
    </main>
  );
}

// Optional: Add metadata for SEO
export const metadata = {
  title: 'Bottle Brothers - Premium Lounge & Restaurant in Tirana',
  description: 'Experience luxury dining, cocktails, and events at Bottle Brothers. Where every moment becomes a masterpiece.',
  openGraph: {
    title: 'Bottle Brothers - Premium Lounge & Restaurant',
    description: 'Experience luxury dining, cocktails, and events at Bottle Brothers.',
    images: ['/og-image.jpg'],
  },
};
