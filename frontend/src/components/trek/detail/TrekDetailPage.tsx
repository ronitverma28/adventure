'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  Star, Clock, Mountain, TrendingUp, Thermometer,
  MapPin, Users, Share2, Heart, ChevronDown, ArrowRight,
  Camera, Calendar, Shield, Backpack, UserCheck,
  MessageSquare, HelpCircle, Navigation, Wind,
} from 'lucide-react';
import { Trek } from '@/types/trek.types';
import { TREK_EXTRA, DEFAULT_TREK_EXTRA } from '@/lib/data/trek-extra';
import { DIFFICULTY_CONFIG } from '@/lib/constants/trek.constants';
import { cn } from '@/lib/utils/cn';

// Section components
import { TrekHeroBanner } from './TrekHeroBanner';
import { TrekPhotoGallery } from './TrekPhotoGallery';
import { TrekQuickInfo } from './TrekQuickInfo';
import { TrekItineraryTimeline } from './TrekItineraryTimeline';
import { TrekWeatherWidget } from './TrekWeatherWidget';
import { TrekPackingChecklist } from './TrekPackingChecklist';
import { TrekFitnessSection } from './TrekFitnessSection';
import { TrekSafetySection } from './TrekSafetySection';
import { TrekGuideProfile } from './TrekGuideProfile';
import { TrekAvailableBatches } from './TrekAvailableBatches';
import { TrekReviewsSection } from './TrekReviewsSection';
import { TrekFAQSection } from './TrekFAQSection';
import { TrekMapSection } from './TrekMapSection';
import { TrekStickyBooking } from './TrekStickyBooking';

const NAV_SECTIONS = [
  { id: 'overview',   label: 'Overview',   icon: Mountain },
  { id: 'itinerary',  label: 'Itinerary',  icon: Navigation },
  { id: 'weather',    label: 'Weather',    icon: Wind },
  { id: 'packing',    label: 'Packing',    icon: Backpack },
  { id: 'fitness',    label: 'Fitness',    icon: TrendingUp },
  { id: 'safety',     label: 'Safety',     icon: Shield },
  { id: 'guide',      label: 'Guide',      icon: UserCheck },
  { id: 'batches',    label: 'Dates',      icon: Calendar },
  { id: 'reviews',    label: 'Reviews',    icon: MessageSquare },
  { id: 'faq',        label: 'FAQ',        icon: HelpCircle },
];

export function TrekDetailPage({ trek }: { trek: Trek }) {
  const extra = TREK_EXTRA[trek.slug] ?? DEFAULT_TREK_EXTRA;
  const diff  = DIFFICULTY_CONFIG[trek.difficulty];

  const [activeSection, setActiveSection] = useState('overview');
  const [navSticky, setNavSticky]         = useState(false);
  const [isWishlisted, setIsWishlisted]   = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Sticky nav detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setNavSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-1px 0px 0px 0px' }
    );
    if (navRef.current) observer.observe(navRef.current);
    return () => observer.disconnect();
  }, []);

  // Active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      for (const section of [...NAV_SECTIONS].reverse()) {
        const el = document.getElementById(section.id);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(section.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero Banner ── */}
      <TrekHeroBanner
        trek={trek}
        extra={extra}
        isWishlisted={isWishlisted}
        onWishlist={() => setIsWishlisted((v) => !v)}
      />

      {/* ── Sticky Section Nav ── */}
      <div ref={navRef} className="border-b border-border bg-background">
        <div
          className={cn(
            'transition-all duration-300',
            navSticky && 'fixed left-0 right-0 top-0 z-40 border-b border-border bg-background/95 shadow-md backdrop-blur-xl'
          )}
        >
          <div className="container">
            <div className="flex items-center gap-1 overflow-x-auto py-3 scrollbar-hide">
              {NAV_SECTIONS.map((s) => (
                <button
                  key={s.id}
                  onClick={() => scrollTo(s.id)}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium transition-all',
                    activeSection === s.id
                      ? 'bg-brand-500 text-white'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <s.icon className="h-3.5 w-3.5" />
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main Layout ── */}
      <div className="container py-10">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
          {/* Left Column */}
          <div className="space-y-16 min-w-0">

            {/* Overview + Quick Info */}
            <section id="overview">
              <TrekQuickInfo trek={trek} diff={diff} />
            </section>

            {/* Photo Gallery */}
            <section id="gallery">
              <TrekPhotoGallery images={extra.galleryImages} trekTitle={trek.title} />
            </section>

            {/* Itinerary */}
            <section id="itinerary">
              <TrekItineraryTimeline trek={trek} />
            </section>

            {/* Map */}
            <section id="map">
              <TrekMapSection
                lat={extra.latitude}
                lng={extra.longitude}
                trekTitle={trek.title}
                meetingPoint={extra.meetingPoint}
                nearestAirport={extra.nearestAirport}
                nearestRailway={extra.nearestRailway}
              />
            </section>

            {/* Weather */}
            <section id="weather">
              <TrekWeatherWidget lat={extra.latitude} lng={extra.longitude} trekTitle={trek.title} />
            </section>

            {/* Packing Checklist */}
            <section id="packing">
              <TrekPackingChecklist
                items={extra.thingsToCarry}
                inclusions={extra.inclusions}
                exclusions={extra.exclusions}
              />
            </section>

            {/* Fitness */}
            <section id="fitness">
              <TrekFitnessSection fitness={extra.fitnessRequirements} difficulty={trek.difficulty} />
            </section>

            {/* Safety */}
            <section id="safety">
              <TrekSafetySection safetyInfo={extra.safetyInfo} />
            </section>

            {/* Guide */}
            <section id="guide">
              <TrekGuideProfile guide={extra.guide} />
            </section>

            {/* Available Batches */}
            <section id="batches">
              <TrekAvailableBatches trek={trek} />
            </section>

            {/* Reviews */}
            <section id="reviews">
              <TrekReviewsSection trek={trek} />
            </section>

            {/* FAQ */}
            <section id="faq">
              <TrekFAQSection faqs={extra.faqs} />
            </section>
          </div>

          {/* Right Column — Sticky Booking */}
          <div className="hidden lg:block">
            <div className="sticky top-20">
              <TrekStickyBooking trek={trek} />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Booking Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 p-4 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs text-muted-foreground">Starting from</div>
            <div className="font-display text-xl font-bold text-foreground">
              ₹{trek.pricePerPerson.toLocaleString('en-IN')}
            </div>
          </div>
          <a
            href={`/bookings/new?trek=${trek.slug}`}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30"
          >
            Book Now <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
