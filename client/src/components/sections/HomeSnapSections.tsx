'use client';

import React from 'react';
import { HeroSection } from './HeroSection';
import { OurStory } from './OurStory';
import { OurBestMoments } from './OurBestMoments';
import { TonightsVibe } from './TonightsVibe';
import { SignaturePicks } from './SignaturePicks';
import { UpcomingEvents } from './UpcomingEvents';
import { GalleryPreview } from './GalleryPreview';
import { ReviewsCarousel } from './ReviewsCarousel';
import { LocationSection } from './LocationSection';
import { SnapScrollWrapper } from './SnapScrollWrapper';
import type { Event, MenuItem, GalleryItem, Moment } from '@/lib/api';

interface HomeSnapSectionsProps {
  featuredEvent: Event | null;
  upcomingEvents: Event[];
  featuredMenuItems: MenuItem[];
  galleryItems: GalleryItem[];
  moments: Moment[];
}

export function HomeSnapSections({
  featuredEvent,
  upcomingEvents,
  featuredMenuItems,
  galleryItems,
  moments,
}: HomeSnapSectionsProps) {
  // Build sections array dynamically based on available data
  const sections: React.ReactNode[] = [
    <HeroSection key="hero" />,
    <OurStory key="story" fullHeight />,
  ];

  // Add Our Best Moments section right after OurStory
  if (moments.length > 0) {
    sections.push(<OurBestMoments key="moments" moments={moments} fullHeight />);
  }

  if (featuredEvent) {
    sections.push(<TonightsVibe key="vibe" event={featuredEvent} fullHeight />);
  }

  if (featuredMenuItems.length > 0) {
    sections.push(<SignaturePicks key="picks" items={featuredMenuItems} fullHeight />);
  }

  if (upcomingEvents.length > 0) {
    sections.push(<UpcomingEvents key="events" events={upcomingEvents} fullHeight />);
  }

  if (galleryItems.length > 0) {
    sections.push(<GalleryPreview key="gallery" items={galleryItems} fullHeight />);
  }

  sections.push(<ReviewsCarousel key="reviews" fullHeight />);
  sections.push(<LocationSection key="location" fullHeight />);

  return <SnapScrollWrapper>{sections}</SnapScrollWrapper>;
}
