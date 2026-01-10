import React from 'react';
import { HomeSnapSections } from '@/components/sections';
import { getFeaturedEvent, getUpcomingEvents, getFeaturedMenuItems, getFeaturedGalleryItems, getActiveMoments, Event, MenuItem, GalleryItem, Moment } from '@/lib/api';
import { locales, type Locale } from '@/lib/locale';

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Generate locale-specific metadata
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const titles: Record<Locale, string> = {
    sq: 'Bottle Brothers - Lounge & Restorant Premium në Tiranë',
    en: 'Bottle Brothers - Premium Lounge & Restaurant in Tirana',
  };

  const descriptions: Record<Locale, string> = {
    sq: 'Përjetoni darkë luksoze, kokteje dhe evente në Bottle Brothers. Ku çdo moment bëhet kryevepër.',
    en: 'Experience luxury dining, cocktails, and events at Bottle Brothers. Where every moment becomes a masterpiece.',
  };

  return {
    title: titles[locale as Locale] || titles.sq,
    description: descriptions[locale as Locale] || descriptions.sq,
    alternates: {
      canonical: `/${locale}`,
      languages: {
        'sq': '/sq',
        'en': '/en',
        'x-default': '/sq',
      },
    },
    openGraph: {
      title: titles[locale as Locale] || titles.sq,
      description: descriptions[locale as Locale] || descriptions.sq,
      images: ['/og-image.jpg'],
      locale: locale === 'sq' ? 'sq_AL' : 'en_US',
    },
  };
}

// This is a Server Component - data fetching happens on the server
export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

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
