'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Clock, Mountain, TrendingUp, Calendar,
  Heart, Eye, ArrowRight, Users, Thermometer,
  MapPin, ChevronRight, Zap,
} from 'lucide-react';
import { Trek } from '@/types/trek.types';
import { DIFFICULTY_CONFIG } from '@/lib/constants/trek.constants';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import { useAuthStore } from '@/store/authStore';

interface TrekCardProps {
  trek: Trek;
  onQuickView: (trek: Trek) => void;
  viewMode?: 'grid' | 'list';
}

export function TrekCard({ trek, onQuickView, viewMode = 'grid' }: TrekCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const diff = DIFFICULTY_CONFIG[trek.difficulty];

  const handleWishlist = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!isAuthenticated) {
        window.location.href = '/login?redirect=/treks';
        return;
      }
      setIsWishlisted((v) => !v);
    },
    [isAuthenticated]
  );

  const seatsLeft = trek.upcomingBatches?.[0]?.availableSeats ?? null;
  const isAlmostFull = seatsLeft !== null && seatsLeft <= 3 && seatsLeft > 0;
  const isSoldOut = trek.status === 'SOLD_OUT' || seatsLeft === 0;

  if (viewMode === 'list') {
    return <TrekCardList trek={trek} onQuickView={onQuickView} diff={diff} isWishlisted={isWishlisted} onWishlist={handleWishlist} />;
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow duration-300 hover:shadow-2xl hover:shadow-black/10"
    >
      {/* ── Image ── */}
      <div className="relative h-56 overflow-hidden">
        <motion.img
          src={trek.coverImageUrl || 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'}
          alt={trek.title}
          className="h-full w-full object-cover"
          animate={{ scale: isHovered ? 1.08 : 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        />

        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

        {/* Top badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          {trek.isBestseller && (
            <span className="rounded-full bg-brand-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
              Bestseller
            </span>
          )}
          {trek.isFeatured && !trek.isBestseller && (
            <span className="rounded-full bg-blue-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
              Featured
            </span>
          )}
          {isAlmostFull && (
            <span className="flex items-center gap-1 rounded-full bg-red-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white shadow">
              <Zap className="h-2.5 w-2.5" />
              {seatsLeft} seats left
            </span>
          )}
          {isSoldOut && (
            <span className="rounded-full bg-gray-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Sold Out
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-all hover:bg-black/50"
        >
          <Heart
            className={cn(
              'h-4 w-4 transition-all',
              isWishlisted ? 'fill-red-500 text-red-500 scale-110' : 'text-white'
            )}
          />
        </button>

        {/* Rating */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-sm">
          <Star className="h-3 w-3 fill-brand-400 text-brand-400" />
          <span className="text-xs font-bold text-white">{trek.avgRating}</span>
          <span className="text-[10px] text-white/60">({trek.totalReviews.toLocaleString()})</span>
        </div>

        {/* Altitude badge */}
        {trek.altitudeMax && (
          <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-sm">
            <Mountain className="h-3 w-3 text-blue-300" />
            <span className="text-[10px] font-semibold text-white">
              {trek.altitudeMax.toLocaleString()}m
            </span>
          </div>
        )}

        {/* Hover overlay — itinerary preview */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.25 }}
              className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/60 to-black/20 p-4"
            >
              <div className="mb-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-white/60">
                  Quick Itinerary
                </p>
                <div className="space-y-1">
                  {trek.itinerary?.slice(0, 3).map((day) => (
                    <div key={day.id} className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-brand-500/80 text-[9px] font-bold text-white">
                        {day.dayNumber}
                      </span>
                      <span className="text-xs text-white/80 leading-tight">{day.title}</span>
                    </div>
                  ))}
                  {(trek.itinerary?.length ?? 0) > 3 && (
                    <div className="flex items-center gap-1 pl-6 text-[10px] text-white/50">
                      <ChevronRight className="h-3 w-3" />
                      +{(trek.itinerary?.length ?? 0) - 3} more days
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming dates */}
              {trek.upcomingBatches && trek.upcomingBatches.length > 0 && (
                <div className="mb-3">
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/60">
                    Next Batches
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {trek.upcomingBatches.slice(0, 2).map((batch) => (
                      <span
                        key={batch.id}
                        className={cn(
                          'rounded-lg px-2 py-1 text-[10px] font-medium',
                          batch.availableSeats === 0
                            ? 'bg-gray-700/80 text-gray-400 line-through'
                            : 'bg-white/15 text-white'
                        )}
                      >
                        {formatDate(batch.startDate, 'dd MMM')}
                        {batch.availableSeats > 0 && (
                          <span className="ml-1 text-white/50">· {batch.availableSeats} seats</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={(e) => { e.preventDefault(); onQuickView(trek); }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-white/30 bg-white/10 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Quick View
                </button>
                <a
                  href={`/treks/${trek.slug}`}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand-500 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-600"
                >
                  Book Now
                  <ArrowRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Content ── */}
      <div className="flex flex-1 flex-col p-5">
        {/* Location */}
        <div className="mb-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{trek.location}</span>
        </div>

        {/* Title */}
        <h3 className="font-display text-base font-bold text-foreground transition-colors group-hover:text-brand-500 line-clamp-1">
          {trek.title}
        </h3>

        {/* Short description */}
        <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {trek.shortDescription}
        </p>

        {/* Meta chips */}
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium', diff.bg, diff.border, diff.color)}>
            <span className={cn('h-1.5 w-1.5 rounded-full', diff.dot)} />
            {diff.label}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {trek.durationDays}D/{trek.durationNights}N
          </span>
          {trek.bestSeason && trek.bestSeason.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Thermometer className="h-3 w-3" />
              {trek.bestSeason.slice(0, 2).map(s => s.slice(0, 3)).join(', ')}
            </span>
          )}
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />
            Max {trek.groupSizeMax}
          </span>
        </div>

        {/* Highlights */}
        {trek.highlights && trek.highlights.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {trek.highlights.slice(0, 2).map((h) => (
              <span key={h} className="rounded-md bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
                {h}
              </span>
            ))}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Footer */}
        <div className="mt-4 flex items-end justify-between border-t border-border pt-4">
          <div>
            <span className="text-[10px] text-muted-foreground">Starting from</span>
            <div className="font-display text-xl font-bold text-foreground">
              {formatCurrency(trek.pricePerPerson)}
            </div>
            <span className="text-[10px] text-muted-foreground">per person · all inclusive</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={(e) => { e.preventDefault(); onQuickView(trek); }}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background text-muted-foreground transition-colors hover:border-brand-500/30 hover:text-brand-500"
            >
              <Eye className="h-4 w-4" />
            </button>
            <a
              href={`/treks/${trek.slug}`}
              className={cn(
                'flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold text-white transition-all',
                isSoldOut
                  ? 'cursor-not-allowed bg-muted text-muted-foreground'
                  : 'bg-brand-500 hover:bg-brand-600 hover:gap-2.5'
              )}
            >
              {isSoldOut ? 'Sold Out' : 'Book Now'}
              {!isSoldOut && <ArrowRight className="h-3.5 w-3.5" />}
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// ── List View Variant ──────────────────────────────────────────────────────────
function TrekCardList({
  trek, onQuickView, diff, isWishlisted, onWishlist,
}: {
  trek: Trek;
  onQuickView: (t: Trek) => void;
  diff: (typeof DIFFICULTY_CONFIG)[keyof typeof DIFFICULTY_CONFIG];
  isWishlisted: boolean;
  onWishlist: (e: React.MouseEvent) => void;
}) {
  return (
    <motion.article
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      className="group flex overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
    >
      {/* Image */}
      <div className="relative h-auto w-48 shrink-0 overflow-hidden sm:w-64">
        <img
          src={trek.coverImageUrl || ''}
          alt={trek.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
        {trek.isBestseller && (
          <span className="absolute left-2 top-2 rounded-full bg-brand-500 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
            Bestseller
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-5">
        <div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />{trek.location}
              </div>
              <h3 className="font-display text-lg font-bold text-foreground group-hover:text-brand-500">
                {trek.title}
              </h3>
            </div>
            <button onClick={onWishlist}>
              <Heart className={cn('h-5 w-5 transition-all', isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground')} />
            </button>
          </div>
          <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{trek.shortDescription}</p>

          <div className="mt-3 flex flex-wrap gap-3">
            <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium', diff.bg, diff.border, diff.color)}>
              <TrendingUp className="h-3 w-3" />{diff.label}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" />{trek.durationDays}D/{trek.durationNights}N</span>
            {trek.altitudeMax && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Mountain className="h-3 w-3" />{trek.altitudeMax.toLocaleString()}m</span>}
            <span className="flex items-center gap-1 text-xs text-muted-foreground"><Star className="h-3 w-3 fill-brand-400 text-brand-400" />{trek.avgRating} ({trek.totalReviews})</span>
            {trek.bestSeason && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Calendar className="h-3 w-3" />{trek.bestSeason.slice(0, 3).join(', ')}</span>}
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-muted-foreground">From </span>
            <span className="font-display text-xl font-bold text-foreground">{formatCurrency(trek.pricePerPerson)}</span>
            <span className="text-xs text-muted-foreground"> / person</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => onQuickView(trek)}
              className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
            >
              <Eye className="h-3.5 w-3.5" />Quick View
            </button>
            <a
              href={`/treks/${trek.slug}`}
              className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand-600"
            >
              Book Now<ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
