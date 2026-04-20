import React from 'react';
import { HomeSnapSections } from '@/components/sections';
import { getFeaturedMenuItems, MenuItem } from '@/lib/api';
import { getPublicHomeSections, HomeSection } from '@/lib/api/homeSections';

// This is a Server Component - data fetching happens on the server
export default async function HomePage() {
  let featuredMenuItems: MenuItem[] = [];
  let homeSections: HomeSection[] = [];

  try {
    [featuredMenuItems, homeSections] = await Promise.all([
      getFeaturedMenuItems(6),
      getPublicHomeSections().catch(() => []),
    ]);
  } catch (error) {
    console.error('Error fetching home page data:', error);
  }

  const heroSection = homeSections.find(s => s.section_type === 'hero');
  const storySection = homeSections.find(s => s.section_type === 'story');
  const reviewsSection = homeSections.find(s => s.section_type === 'reviews');

  return (
    <main className="min-h-screen bg-white">
      <HomeSnapSections
        featuredMenuItems={featuredMenuItems}
        heroBackgroundUrl={heroSection?.background_image_url ?? null}
        storyImages={[
          storySection?.image_url ?? null,
          storySection?.image_2_url ?? null,
          storySection?.image_3_url ?? null,
          storySection?.image_4_url ?? null,
        ]}
        reviewsBackgroundUrl={reviewsSection?.background_image_url ?? null}
      />
    </main>
  );
}

// Optional: Add metadata for SEO
export const metadata = {
  title: 'Sarajet Restaurant - Premium Restaurant in Kelcyrës, Gjirokastër',
  description: 'Experience luxury dining and events at Sarajet Restaurant, SH75, Kelcyrës. Where every moment becomes a masterpiece.',
  openGraph: {
    title: 'Sarajet Restaurant - Kelcyrës, Gjirokastër',
    description: 'Experience luxury dining and events at Sarajet Restaurant, Kelcyrës.',
    images: ['/og-image.jpg'],
  },
};
