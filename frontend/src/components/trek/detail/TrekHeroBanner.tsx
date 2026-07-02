'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Star, MapPin, Clock, Mountain, Share2, ChevronDown, Users, Award } from 'lucide-react';
import { Trek } from '@/types/trek.types';
import { DIFFICULTY_CONFIG } from '@/lib/constants/trek.constants';
import { cn } from '@/lib/utils/cn';

interface Props {
  trek: Trek;
  extra: { meetingPoint: string; nearestAirport: string };
}

export function TrekHeroBanner({ trek, extra }: Props) {
  const ref  = useRef<HTMLDivElement>(null);
  const diff = DIFFICULTY_CONFIG[trek.difficulty];

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const y       = useTransform(scrollYProgress, [0, 1], ['0%', '35%']);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({ title: trek.title, url: window.location.href });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div ref={ref} className="relative h-[75vh] min-h-[560px] overflow-hidden bg-mountain-900">
      {/* Parallax image */}
      <motion.div style={{ y }} className="absolute inset-0 will-change-transform">
        <img
          src={trek.coverImageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=85'}
          alt={trek.title}
          className="h-full w-full object-cover"
        />
      </motion.div>

      {/* Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

      {/* Breadcrumb */}
      <motion.div style={{ opacity }} className="absolute left-0 right-0 top-24 px-4">
        <div className="container">
          <div className="flex items-center gap-2 text-xs text-white/50">
            <a href="/" className="hover:text-white/80">Home</a>
            <span>/</span>
            <a href="/treks" className="hover:text-white/80">Treks</a>
            <span>/</span>
            <span className="text-white/80">{trek.title}</span>
          </div>
        </div>
      </motion.div>

      {/* Action buttons */}
      <div className="absolute right-4 top-24 flex gap-2 sm:right-8">
        <button
          onClick={handleShare}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-colors hover:bg-black/60"
        >
          <Share2 className="h-5 w-5 text-white" />
        </button>
      </div>

      {/* Main content */}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-0 left-0 right-0 p-6 sm:p-10"
      >
        <div className="container">
          {/* Badges */}
          <div className="mb-4 flex flex-wrap gap-2">
            {trek.isBestseller && (
              <span className="flex items-center gap-1 rounded-full bg-brand-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                <Award className="h-3 w-3" /> Bestseller
              </span>
            )}
            <span className={cn('rounded-full border px-3 py-1 text-xs font-semibold', diff.bg, diff.border, diff.color)}>
              {diff.label}
            </span>
            {trek.bestSeason?.slice(0, 2).map((s) => (
              <span key={s} className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                {s}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            {trek.title}
          </h1>

          {/* Meta row */}
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand-400" />{trek.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="h-4 w-4 fill-brand-400 text-brand-400" />
              <strong className="text-white">{trek.avgRating}</strong>
              <span className="text-white/50">({trek.totalReviews.toLocaleString()} reviews)</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />{(trek.totalBookings ?? 0).toLocaleString()} trekkers
            </span>
          </div>

          {/* Quick stats strip */}
          <div className="mt-6 flex flex-wrap gap-4">
            {[
              { icon: Clock,    label: 'Duration',  value: `${trek.durationDays}D / ${trek.durationNights}N` },
              { icon: Mountain, label: 'Altitude',  value: trek.altitudeMax ? `${trek.altitudeMax.toLocaleString()}m` : 'N/A' },
              { icon: Users,    label: 'Group',     value: `Max ${trek.groupSizeMax}` },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 backdrop-blur-sm">
                <Icon className="h-4 w-4 text-brand-400" />
                <div>
                  <div className="text-[10px] text-white/50 uppercase tracking-wide">{label}</div>
                  <div className="text-sm font-semibold text-white">{value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <ChevronDown className="h-6 w-6 text-white/40" />
      </motion.div>
    </div>
  );
}
