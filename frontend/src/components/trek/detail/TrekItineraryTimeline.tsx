'use client';

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Mountain, Clock, Utensils, Tent, ChevronDown,
  ChevronUp, TrendingUp, Navigation, ArrowUp, ArrowDown,
} from 'lucide-react';
import { Trek, ItineraryDay } from '@/types/trek.types';
import { DIFFICULTY_CONFIG } from '@/lib/constants/trek.constants';
import { cn } from '@/lib/utils/cn';
import { SectionHeader } from './TrekPhotoGallery';

export function TrekItineraryTimeline({ trek }: { trek: Trek }) {
  const [expandedDays, setExpandedDays] = useState<number[]>([1]);
  const [viewAll, setViewAll] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const toggle = (day: number) =>
    setExpandedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );

  const days = trek.itinerary ?? [];
  const visibleDays = viewAll ? days : days.slice(0, 4);

  // Elevation profile data
  const maxAlt = Math.max(...days.map((d) => d.maxAltitude ?? 0));

  return (
    <div>
      <SectionHeader icon={Navigation} label="Day-by-Day" title="Detailed Itinerary" />

      {/* Elevation Profile Bar */}
      {maxAlt > 0 && (
        <div className="mb-8 overflow-hidden rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">Elevation Profile</span>
            <span className="text-xs text-muted-foreground">Max: {maxAlt.toLocaleString()}m</span>
          </div>
          <div className="flex items-end gap-1" style={{ height: 80 }}>
            {days.map((day, i) => {
              const h = day.maxAltitude ? (day.maxAltitude / maxAlt) * 100 : 20;
              return (
                <motion.div
                  key={day.id}
                  initial={{ height: 0 }}
                  whileInView={{ height: `${h}%` }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05, duration: 0.5 }}
                  className="group relative flex-1 cursor-pointer rounded-t-lg bg-gradient-to-t from-brand-500 to-brand-400 transition-opacity hover:opacity-80"
                  onClick={() => toggle(day.dayNumber)}
                >
                  <div className="absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-2 py-1 text-[10px] text-background group-hover:block">
                    Day {day.dayNumber}: {day.maxAltitude?.toLocaleString()}m
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-[10px] text-muted-foreground">Day 1</span>
            <span className="text-[10px] text-muted-foreground">Day {days.length}</span>
          </div>
        </div>
      )}

      {/* Timeline */}
      <div ref={ref} className="relative">
        {/* Vertical line */}
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-brand-500 via-border to-transparent" />

        <div className="space-y-0">
          {visibleDays.map((day, i) => {
            const isExpanded = expandedDays.includes(day.dayNumber);
            const isLast = i === visibleDays.length - 1;

            return (
              <motion.div
                key={day.id}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className={cn('relative pl-16', !isLast && 'pb-6')}
              >
                {/* Day dot */}
                <div className="absolute left-0 flex h-12 w-12 items-center justify-center">
                  <div className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 font-bold text-sm transition-all',
                    isExpanded
                      ? 'border-brand-500 bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                      : 'border-border bg-background text-muted-foreground'
                  )}>
                    {day.dayNumber}
                  </div>
                </div>

                {/* Card */}
                <div className={cn(
                  'overflow-hidden rounded-2xl border transition-all duration-300',
                  isExpanded ? 'border-brand-500/30 shadow-md' : 'border-border'
                )}>
                  {/* Header */}
                  <button
                    onClick={() => toggle(day.dayNumber)}
                    className="flex w-full items-center gap-4 p-4 text-left hover:bg-muted/30"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-widest text-brand-500">
                          Day {day.dayNumber}
                        </span>
                        {day.difficultyDay && (
                          <span className={cn(
                            'rounded-full px-2 py-0.5 text-[10px] font-medium',
                            DIFFICULTY_CONFIG[day.difficultyDay].bg,
                            DIFFICULTY_CONFIG[day.difficultyDay].color
                          )}>
                            {DIFFICULTY_CONFIG[day.difficultyDay].label}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-0.5 font-display text-base font-bold text-foreground">
                        {day.title}
                      </h3>
                      {/* Quick meta */}
                      <div className="mt-1.5 flex flex-wrap gap-3">
                        {day.maxAltitude && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mountain className="h-3 w-3" />{day.maxAltitude.toLocaleString()}m
                          </span>
                        )}
                        {day.distanceKm && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />{day.distanceKm}km
                          </span>
                        )}
                        {day.elevationGain && (
                          <span className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                            <ArrowUp className="h-3 w-3" />+{day.elevationGain}m
                          </span>
                        )}
                        {day.accommodation && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Tent className="h-3 w-3" />{day.accommodation}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 text-muted-foreground">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </div>
                  </button>

                  {/* Expanded content */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border px-4 pb-5 pt-4">
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {day.description}
                          </p>

                          {/* Detail grid */}
                          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {day.maxAltitude && (
                              <DetailChip icon={Mountain} label="Altitude" value={`${day.maxAltitude.toLocaleString()}m`} />
                            )}
                            {day.distanceKm && (
                              <DetailChip icon={Clock} label="Distance" value={`${day.distanceKm}km`} />
                            )}
                            {day.elevationGain && (
                              <DetailChip icon={ArrowUp} label="Gain" value={`+${day.elevationGain}m`} />
                            )}
                            {day.accommodation && (
                              <DetailChip icon={Tent} label="Stay" value={day.accommodation} />
                            )}
                          </div>

                          {/* Meals */}
                          {day.mealsIncluded && day.mealsIncluded.length > 0 && (
                            <div className="mt-4">
                              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                <Utensils className="h-3.5 w-3.5 text-brand-500" />
                                Meals Included
                              </div>
                              <div className="flex gap-2">
                                {day.mealsIncluded.map((meal) => (
                                  <span
                                    key={meal}
                                    className="rounded-lg bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-600 dark:text-brand-400"
                                  >
                                    {meal}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Show more */}
        {days.length > 4 && (
          <div className="mt-6 pl-16">
            <button
              onClick={() => setViewAll((v) => !v)}
              className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
            >
              {viewAll ? (
                <><ChevronUp className="h-4 w-4" /> Show Less</>
              ) : (
                <><ChevronDown className="h-4 w-4" /> Show All {days.length} Days</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailChip({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <Icon className="mb-1 h-3.5 w-3.5 text-brand-500" />
      <div className="text-[10px] text-muted-foreground">{label}</div>
      <div className="text-xs font-semibold text-foreground">{value}</div>
    </div>
  );
}
