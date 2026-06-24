'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Star, Clock, Mountain, TrendingUp, Calendar,
  MapPin, Users, Check, X, ChevronDown, ChevronUp,
  Thermometer, ArrowRight, Heart, Share2, Utensils, Tent,
} from 'lucide-react';
import { Trek } from '@/types/trek.types';
import { DIFFICULTY_CONFIG } from '@/lib/constants/trek.constants';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';

export function TrekDetailHero({ trek }: { trek: Trek }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'itinerary' | 'inclusions' | 'dates'>('overview');
  const [itineraryExpanded, setItineraryExpanded] = useState<number[]>([]);
  const diff = DIFFICULTY_CONFIG[trek.difficulty];

  const toggleDay = (dayNum: number) =>
    setItineraryExpanded((prev) =>
      prev.includes(dayNum) ? prev.filter((d) => d !== dayNum) : [...prev, dayNum]
    );

  const TABS = [
    { key: 'overview', label: 'Overview' },
    { key: 'itinerary', label: `Itinerary (${trek.itinerary?.length ?? 0} Days)` },
    { key: 'inclusions', label: 'Inclusions' },
    { key: 'dates', label: 'Dates & Pricing' },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
        <img
          src={trek.coverImageUrl || ''}
          alt={trek.title}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container">
            <div className="flex items-center gap-2 text-xs text-white/60 mb-3">
              <a href="/" className="hover:text-white">Home</a>
              <span>/</span>
              <a href="/treks" className="hover:text-white">Treks</a>
              <span>/</span>
              <span className="text-white">{trek.title}</span>
            </div>
            {trek.isBestseller && (
              <span className="mb-3 inline-block rounded-full bg-brand-500 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
                Bestseller
              </span>
            )}
            <h1 className="font-display text-4xl font-bold text-white sm:text-5xl">{trek.title}</h1>
            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" />{trek.location}</span>
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-brand-400 text-brand-400" />{trek.avgRating} ({trek.totalReviews.toLocaleString()} reviews)</span>
              <span className="flex items-center gap-1.5"><Users className="h-4 w-4" />{trek.totalBookings.toLocaleString()} trekkers</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left: Details */}
          <div className="lg:col-span-2">
            {/* Quick stats */}
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: Clock, label: 'Duration', value: `${trek.durationDays}D / ${trek.durationNights}N` },
                { icon: Mountain, label: 'Max Altitude', value: trek.altitudeMax ? `${trek.altitudeMax.toLocaleString()}m` : 'N/A' },
                { icon: TrendingUp, label: 'Difficulty', value: diff.label, color: diff.color },
                { icon: Users, label: 'Group Size', value: `${trek.groupSizeMin}–${trek.groupSizeMax} people` },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="rounded-2xl border border-border bg-card p-4 text-center">
                  <Icon className="mx-auto mb-2 h-5 w-5 text-brand-500" />
                  <div className="text-xs text-muted-foreground">{label}</div>
                  <div className={cn('mt-0.5 text-sm font-bold text-foreground', color)}>{value}</div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-border bg-muted/30 p-1">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all',
                    activeTab === tab.key
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <p className="text-muted-foreground leading-relaxed">{trek.shortDescription}</p>
                {trek.highlights && (
                  <div>
                    <h3 className="mb-3 font-display text-lg font-bold text-foreground">Highlights</h3>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {trek.highlights.map((h) => (
                        <div key={h} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Check className="h-4 w-4 shrink-0 text-brand-500" />{h}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {trek.bestSeason && (
                  <div>
                    <h3 className="mb-3 font-display text-lg font-bold text-foreground">Best Season</h3>
                    <div className="flex flex-wrap gap-2">
                      {trek.bestSeason.map((s) => (
                        <span key={s} className="rounded-xl border border-brand-500/20 bg-brand-500/10 px-3 py-1.5 text-sm font-medium text-brand-600 dark:text-brand-400">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'itinerary' && trek.itinerary && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {trek.itinerary.map((day) => {
                  const isExpanded = itineraryExpanded.includes(day.dayNumber);
                  return (
                    <div key={day.id} className="overflow-hidden rounded-2xl border border-border bg-card">
                      <button
                        onClick={() => toggleDay(day.dayNumber)}
                        className="flex w-full items-center gap-4 p-4 text-left"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-sm font-bold text-brand-500">
                          {day.dayNumber}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-foreground">{day.title}</div>
                          <div className="flex flex-wrap gap-3 mt-1">
                            {day.maxAltitude && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Mountain className="h-3 w-3" />{day.maxAltitude.toLocaleString()}m</span>}
                            {day.distanceKm && <span className="text-xs text-muted-foreground">{day.distanceKm}km</span>}
                            {day.accommodation && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Tent className="h-3 w-3" />{day.accommodation}</span>}
                          </div>
                        </div>
                        {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                      </button>
                      {isExpanded && (
                        <div className="border-t border-border px-4 pb-4 pt-3">
                          <p className="text-sm text-muted-foreground">{day.description}</p>
                          {day.mealsIncluded && (
                            <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Utensils className="h-3.5 w-3.5" />
                              <span>Meals: {day.mealsIncluded.join(', ')}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}

            {activeTab === 'dates' && trek.upcomingBatches && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                {trek.upcomingBatches.map((batch) => {
                  const pct = Math.round(((batch.totalSeats - batch.availableSeats) / batch.totalSeats) * 100);
                  return (
                    <div key={batch.id} className="rounded-2xl border border-border bg-card p-5">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-foreground">
                            {formatDate(batch.startDate, 'dd MMM yyyy')} – {formatDate(batch.endDate, 'dd MMM yyyy')}
                          </div>
                          <div className="mt-1 text-sm text-muted-foreground">{trek.durationDays} days · {trek.durationNights} nights</div>
                        </div>
                        <div className="text-right">
                          <div className="font-display text-xl font-bold text-foreground">{formatCurrency(batch.price ?? trek.pricePerPerson)}</div>
                          <div className={cn('text-xs font-semibold', batch.availableSeats === 0 ? 'text-red-500' : batch.availableSeats <= 3 ? 'text-orange-500' : 'text-emerald-500')}>
                            {batch.availableSeats === 0 ? 'Sold Out' : `${batch.availableSeats} of ${batch.totalSeats} seats left`}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                        <div className={cn('h-full rounded-full', pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-orange-500' : 'bg-emerald-500')} style={{ width: `${pct}%` }} />
                      </div>
                      {batch.availableSeats > 0 && (
                        <a href={`/bookings/new?trek=${trek.slug}&batch=${batch.id}`} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
                          Book This Batch <ArrowRight className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* Right: Sticky Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-lg">
              <div className="mb-4">
                <div className="text-xs text-muted-foreground">Starting from</div>
                <div className="font-display text-3xl font-bold text-foreground">{formatCurrency(trek.pricePerPerson)}</div>
                <div className="text-xs text-muted-foreground">per person · all inclusive</div>
              </div>
              <div className="mb-4 flex items-center gap-2">
                <Star className="h-4 w-4 fill-brand-400 text-brand-400" />
                <span className="font-semibold text-foreground">{trek.avgRating}</span>
                <span className="text-sm text-muted-foreground">({trek.totalReviews} reviews)</span>
              </div>
              <a href={`/bookings/new?trek=${trek.slug}`} className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-600">
                Book Now <ArrowRight className="h-4 w-4" />
              </a>
              <div className="mt-4 space-y-2">
                {['✓ Free cancellation up to 15 days', '✓ Instant confirmation', '✓ 24/7 on-trek support', '✓ All meals included'].map((t) => (
                  <p key={t} className="text-xs text-muted-foreground">{t}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
