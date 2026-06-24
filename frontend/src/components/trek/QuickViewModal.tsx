'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Star, Clock, Mountain, TrendingUp, Calendar,
  MapPin, Users, ChevronRight, Check, Thermometer,
  ArrowRight, Heart, Share2, Utensils, Tent,
} from 'lucide-react';
import { Trek } from '@/types/trek.types';
import { DIFFICULTY_CONFIG } from '@/lib/constants/trek.constants';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';

interface QuickViewModalProps {
  trek: Trek | null;
  onClose: () => void;
}

export function QuickViewModal({ trek, onClose }: QuickViewModalProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  // Lock body scroll
  useEffect(() => {
    if (trek) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [trek]);

  return (
    <AnimatePresence>
      {trek && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-4 z-50 mx-auto my-auto flex max-h-[90vh] max-w-4xl flex-col overflow-hidden rounded-3xl bg-background shadow-2xl md:inset-8"
          >
            {/* Header Image */}
            <div className="relative h-64 shrink-0 overflow-hidden">
              <img
                src={trek.coverImageUrl || ''}
                alt={trek.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Close */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Actions */}
              <div className="absolute right-4 top-16 flex flex-col gap-2">
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60">
                  <Heart className="h-4 w-4" />
                </button>
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/60">
                  <Share2 className="h-4 w-4" />
                </button>
              </div>

              {/* Title overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-6">
                {trek.isBestseller && (
                  <span className="mb-2 inline-block rounded-full bg-brand-500 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    Bestseller
                  </span>
                )}
                <h2 className="font-display text-2xl font-bold text-white">{trek.title}</h2>
                <div className="mt-1 flex items-center gap-3 text-sm text-white/70">
                  <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{trek.location}</span>
                  <span className="flex items-center gap-1"><Star className="h-3.5 w-3.5 fill-brand-400 text-brand-400" />{trek.avgRating} ({trek.totalReviews} reviews)</span>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="grid grid-cols-1 gap-0 md:grid-cols-3">
                {/* Left: Main Info */}
                <div className="col-span-2 p-6">
                  {/* Stats row */}
                  <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { icon: Clock, label: 'Duration', value: `${trek.durationDays}D / ${trek.durationNights}N` },
                      { icon: Mountain, label: 'Max Altitude', value: trek.altitudeMax ? `${trek.altitudeMax.toLocaleString()}m` : 'N/A' },
                      { icon: TrendingUp, label: 'Difficulty', value: DIFFICULTY_CONFIG[trek.difficulty].label },
                      { icon: Users, label: 'Group Size', value: `${trek.groupSizeMin}–${trek.groupSizeMax}` },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="rounded-xl bg-muted/50 p-3 text-center">
                        <Icon className="mx-auto mb-1 h-4 w-4 text-brand-500" />
                        <div className="text-[10px] text-muted-foreground">{label}</div>
                        <div className="text-sm font-semibold text-foreground">{value}</div>
                      </div>
                    ))}
                  </div>

                  {/* Description */}
                  <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
                    {trek.shortDescription}
                  </p>

                  {/* Highlights */}
                  {trek.highlights && trek.highlights.length > 0 && (
                    <div className="mb-6">
                      <h4 className="mb-3 text-sm font-semibold text-foreground">Highlights</h4>
                      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                        {trek.highlights.map((h) => (
                          <div key={h} className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Check className="h-3.5 w-3.5 shrink-0 text-brand-500" />
                            {h}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Itinerary */}
                  {trek.itinerary && trek.itinerary.length > 0 && (
                    <div className="mb-6">
                      <h4 className="mb-3 text-sm font-semibold text-foreground">Day-by-Day Itinerary</h4>
                      <div className="relative space-y-0">
                        {/* Vertical line */}
                        <div className="absolute left-[15px] top-4 bottom-4 w-px bg-border" />

                        {trek.itinerary.map((day, idx) => (
                          <div key={day.id} className="relative flex gap-4 pb-4">
                            {/* Day dot */}
                            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-brand-500 bg-background text-[10px] font-bold text-brand-500">
                              {day.dayNumber}
                            </div>
                            <div className="flex-1 pt-1">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-semibold text-foreground">{day.title}</p>
                                  <p className="mt-0.5 text-xs text-muted-foreground">{day.description}</p>
                                </div>
                                <div className="flex shrink-0 flex-col items-end gap-1">
                                  {day.maxAltitude && (
                                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                      <Mountain className="h-2.5 w-2.5" />{day.maxAltitude.toLocaleString()}m
                                    </span>
                                  )}
                                  {day.distanceKm && (
                                    <span className="text-[10px] text-muted-foreground">{day.distanceKm}km</span>
                                  )}
                                </div>
                              </div>
                              {/* Meals */}
                              {day.mealsIncluded && day.mealsIncluded.length > 0 && (
                                <div className="mt-1.5 flex items-center gap-1">
                                  <Utensils className="h-2.5 w-2.5 text-muted-foreground" />
                                  <span className="text-[10px] text-muted-foreground">
                                    {day.mealsIncluded.join(' · ')}
                                  </span>
                                </div>
                              )}
                              {day.accommodation && (
                                <div className="mt-0.5 flex items-center gap-1">
                                  <Tent className="h-2.5 w-2.5 text-muted-foreground" />
                                  <span className="text-[10px] text-muted-foreground">{day.accommodation}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Booking Panel */}
                <div className="border-t border-border bg-muted/20 p-6 md:border-l md:border-t-0">
                  {/* Price */}
                  <div className="mb-4 rounded-2xl border border-border bg-background p-4">
                    <div className="text-xs text-muted-foreground">Starting from</div>
                    <div className="font-display text-3xl font-bold text-foreground">
                      {formatCurrency(trek.pricePerPerson)}
                    </div>
                    <div className="text-xs text-muted-foreground">per person · all inclusive</div>
                  </div>

                  {/* Best Season */}
                  {trek.bestSeason && (
                    <div className="mb-4">
                      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <Thermometer className="h-3.5 w-3.5 text-brand-500" />
                        Best Season
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {trek.bestSeason.map((s) => (
                          <span key={s} className="rounded-lg bg-brand-500/10 px-2 py-0.5 text-[11px] font-medium text-brand-600 dark:text-brand-400">
                            {s.slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Upcoming Batches */}
                  {trek.upcomingBatches && trek.upcomingBatches.length > 0 && (
                    <div className="mb-4">
                      <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <Calendar className="h-3.5 w-3.5 text-brand-500" />
                        Available Dates
                      </div>
                      <div className="space-y-2">
                        {trek.upcomingBatches.map((batch) => {
                          const pct = Math.round(((batch.totalSeats - batch.availableSeats) / batch.totalSeats) * 100);
                          return (
                            <div key={batch.id} className="rounded-xl border border-border bg-background p-3">
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-medium text-foreground">
                                  {formatDate(batch.startDate, 'dd MMM')} – {formatDate(batch.endDate, 'dd MMM yyyy')}
                                </span>
                                <span className={cn(
                                  'text-[10px] font-semibold',
                                  batch.availableSeats === 0 ? 'text-red-500' :
                                  batch.availableSeats <= 3 ? 'text-orange-500' : 'text-emerald-500'
                                )}>
                                  {batch.availableSeats === 0 ? 'Full' : `${batch.availableSeats} left`}
                                </span>
                              </div>
                              {/* Seat fill bar */}
                              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                                <div
                                  className={cn(
                                    'h-full rounded-full transition-all',
                                    pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-orange-500' : 'bg-emerald-500'
                                  )}
                                  style={{ width: `${pct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* CTAs */}
                  <div className="space-y-2">
                    <a
                      href={`/treks/${trek.slug}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-600"
                    >
                      Book This Trek
                      <ArrowRight className="h-4 w-4" />
                    </a>
                    <a
                      href={`/treks/${trek.slug}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-border py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                    >
                      View Full Details
                      <ChevronRight className="h-4 w-4" />
                    </a>
                  </div>

                  {/* Trust signals */}
                  <div className="mt-4 space-y-2">
                    {[
                      '✓ Free cancellation up to 15 days',
                      '✓ Instant booking confirmation',
                      '✓ 24/7 support on trek',
                    ].map((t) => (
                      <p key={t} className="text-[11px] text-muted-foreground">{t}</p>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
