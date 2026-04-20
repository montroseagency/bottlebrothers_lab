import React from 'react';
import { HomeSnapSections } from '@/components/sections';
import { getFeaturedMenuItems, MenuItem } from '@/lib/api';
import { getPublicHomeSections, HomeSection } from '@/lib/api/homeSections';
import { locales, type Locale } from '@/lib/locale';

// Generate static params for all locales
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

// Generate locale-specific metadata
export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;

  const titles: Record<Locale, string> = {
    sq: 'Sarajet Restaurant - Restorant Premium në Kelcyrës, Gjirokastër',
    en: 'Sarajet Restaurant - Premium Restaurant in Kelcyrës, Gjirokastër',
  };

  const descriptions: Record<Locale, string> = {
    sq: 'Përjetoni darkë luksoze dhe evente në Sarajet Restaurant, SH75, Kelcyrës. Ku çdo moment bëhet kryevepër.',
    en: 'Experience luxury dining and events at Sarajet Restaurant, SH75, Kelcyrës. Where every moment becomes a masterpiece.',
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
