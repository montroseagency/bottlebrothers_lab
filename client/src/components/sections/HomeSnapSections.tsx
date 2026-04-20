'use client';

import React from 'react';
import { HeroSection } from './HeroSection';
import { OurStory } from './OurStory';
import { SignaturePicks } from './SignaturePicks';
import { ReviewsCarousel } from './ReviewsCarousel';
import { LocationSection } from './LocationSection';
import { SnapScrollWrapper } from './SnapScrollWrapper';
import type { MenuItem } from '@/lib/api';

interface HomeSnapSectionsProps {
  featuredMenuItems: MenuItem[];
  heroBackgroundUrl?: string | null;
  storyImages?: (string | null)[];
  reviewsBackgroundUrl?: string | null;
}

export function HomeSnapSections({
  featuredMenuItems,
  heroBackgroundUrl,
  storyImages,
  reviewsBackgroundUrl,
}: HomeSnapSectionsProps) {
  const sections: React.ReactNode[] = [
    <HeroSection key="hero" backgroundImageUrl={heroBackgroundUrl} />,
    <OurStory key="story" fullHeight images={storyImages} />,
  ];

  if (featuredMenuItems.length > 0) {
    sections.push(<SignaturePicks key="picks" items={featuredMenuItems} fullHeight />);
  }

  sections.push(<ReviewsCarousel key="reviews" fullHeight backgroundImageUrl={reviewsBackgroundUrl} />);
  sections.push(<LocationSection key="location" fullHeight />);

  return <SnapScrollWrapper>{sections}</SnapScrollWrapper>;
}
