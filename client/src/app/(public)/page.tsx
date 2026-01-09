import React from 'react';
import { HomeSnapSections } from '@/components/sections';
import { getFeaturedEvent, getUpcomingEvents, getFeaturedMenuItems, getFeaturedGalleryItems, getActiveMoments, Event, MenuItem, GalleryItem, Moment } from '@/lib/api';

// This is a Server Component - data fetching happens on the server
export default async function HomePage() {
  // Fetch data in parallel on the server
  let featuredEvent: Event | null = null;
  let upcomingEvents: Event[] = [];
  let featuredMenuItems: MenuItem[] = [];
  let galleryItems: GalleryItem[] = [];
  let moments: Moment[] = [];

  try {
    [featuredEvent, upcomingEvents, featuredMenuItems, galleryItems, moments] = await Promise.all([
      getFeaturedEvent(),
      getUpcomingEvents(3),
      getFeaturedMenuItems(6),
      getFeaturedGalleryItems(8),
      getActiveMoments(8),
    ]);
  } catch (error) {
    console.error('Error fetching home page data:', error);
    // Use empty defaults - app should still work
  }

  return (
    <main className="min-h-screen bg-white">
      {/* All sections with TikTok-style snap scroll */}
      <HomeSnapSections
        featuredEvent={featuredEvent}
        upcomingEvents={upcomingEvents}
        featuredMenuItems={featuredMenuItems}
        galleryItems={galleryItems}
        moments={moments}
      />
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
