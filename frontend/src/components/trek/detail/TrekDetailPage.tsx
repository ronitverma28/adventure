'use client';

import { useEffect, useRef, useState } from 'react';
import { MessageSquare, UserCheck, Calendar, Backpack, Mountain, Navigation } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { DIFFICULTY_CONFIG } from '@/lib/constants/trek.constants';
import type { TrekDetail } from '@/types/trek.types';
import { TrekHeroBanner } from './TrekHeroBanner';
import { TrekPhotoGallery } from './TrekPhotoGallery';
import { TrekQuickInfo } from './TrekQuickInfo';
import { TrekItineraryTimeline } from './TrekItineraryTimeline';
import { TrekPackingChecklist } from './TrekPackingChecklist';
import { TrekGuideProfile } from './TrekGuideProfile';
import { TrekAvailableBatches } from './TrekAvailableBatches';
import { TrekReviewsSection } from './TrekReviewsSection';
import { TrekMapSection } from './TrekMapSection';
import { TrekStickyBooking } from './TrekStickyBooking';

const BASE_SECTIONS = [
  { id: 'overview', label: 'Overview', icon: Mountain },
  { id: 'itinerary', label: 'Itinerary', icon: Navigation },
  { id: 'packing', label: 'Packing', icon: Backpack },
  { id: 'batches', label: 'Dates', icon: Calendar },
  { id: 'reviews', label: 'Reviews', icon: MessageSquare },
] as const;

export function TrekDetailPage({ trek }: { trek: TrekDetail }) {
  const [activeSection, setActiveSection] = useState('overview');
  const [navSticky, setNavSticky] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const diff = DIFFICULTY_CONFIG[trek.difficulty];

  const sections = [
    ...BASE_SECTIONS,
    ...(trek.guides && trek.guides.length > 0 ? [{ id: 'guide', label: 'Guide', icon: UserCheck }] : []),
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setNavSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
    );
    if (navRef.current) observer.observe(navRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      for (const section of [...sections].reverse()) {
        const element = document.getElementById(section.id);
        if (element && element.getBoundingClientRect().top <= 120) {
          setActiveSection(section.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections]);

  const galleryImages = (trek.images ?? []).map((image) => ({
    url: image.imageUrl,
    caption: image.caption || image.altText || trek.title,
  }));

  const guide = trek.guides?.[0]
    ? {
        name: trek.guides[0].name,
        photo: trek.guides[0].photoUrl || trek.coverImageUrl || '',
        experience: trek.guides[0].experienceYears || 0,
        languages: trek.guides[0].languages || [],
        certifications: trek.guides[0].certifications || [],
        bio: trek.guides[0].bio,
        rating: trek.guides[0].avgRating || trek.avgRating || 0,
        totalTreks: trek.totalBookings || 0,
      }
    : null;

  return (
    <div className="min-h-screen bg-background">
      <TrekHeroBanner
        trek={trek}
        extra={{
          meetingPoint: trek.meetingPoint || trek.location,
          nearestAirport: trek.nearestAirport || 'Not specified',
        }}
      />

      <div ref={navRef} className="border-b border-border bg-background">
        <div
          className={cn(
            'transition-all duration-300',
            navSticky && 'fixed left-0 right-0 top-0 z-40 border-b border-border bg-background/95 shadow-md backdrop-blur-xl'
          )}
        >
          <div className="container">
            <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all',
                    activeSection === section.id
                      ? 'bg-brand-500 text-white'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <section.icon className="h-3.5 w-3.5" />
                  {section.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          <div className="min-w-0 space-y-16">
            <section id="overview">
              <TrekQuickInfo trek={trek} diff={diff} />
            </section>

            {galleryImages.length > 0 && (
              <section id="gallery">
                <TrekPhotoGallery images={galleryImages} trekTitle={trek.title} />
              </section>
            )}

            {(trek.itinerary?.length ?? 0) > 0 && (
              <section id="itinerary">
                <TrekItineraryTimeline trek={trek} />
              </section>
            )}

            {(trek.latitude && trek.longitude) || trek.meetingPoint || trek.nearestAirport || trek.nearestRailway ? (
              <section id="map">
                <TrekMapSection
                  lat={trek.latitude || 0}
                  lng={trek.longitude || 0}
                  trekTitle={trek.title}
                  meetingPoint={trek.meetingPoint || trek.location}
                  nearestAirport={trek.nearestAirport || 'Not specified'}
                  nearestRailway={trek.nearestRailway || 'Not specified'}
                />
              </section>
            ) : null}

            {((trek.thingsToCarry?.length ?? 0) > 0 || (trek.inclusions?.length ?? 0) > 0 || (trek.exclusions?.length ?? 0) > 0) && (
              <section id="packing">
                <TrekPackingChecklist
                  items={trek.thingsToCarry || []}
                  inclusions={trek.inclusions || []}
                  exclusions={trek.exclusions || []}
                />
              </section>
            )}

            {guide && (
              <section id="guide">
                <TrekGuideProfile guide={guide} />
              </section>
            )}

            <section id="batches">
              <TrekAvailableBatches trek={trek} />
            </section>

            <section id="reviews">
              <TrekReviewsSection trek={trek} />
            </section>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-20">
              <TrekStickyBooking trek={trek} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
