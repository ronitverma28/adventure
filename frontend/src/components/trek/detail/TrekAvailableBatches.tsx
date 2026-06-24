'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, ArrowRight, Zap, CheckCircle } from 'lucide-react';
import { Trek } from '@/types/trek.types';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import { SectionHeader } from './TrekPhotoGallery';

export function TrekAvailableBatches({ trek }: { trek: Trek }) {
  const [selectedBatch, setSelectedBatch] = useState<number | null>(null);
  const batches = trek.upcomingBatches ?? [];

  return (
    <div>
      <SectionHeader icon={Calendar} label="Book Your Spot" title="Available Batches" />
      <p className="mb-6 text-sm text-muted-foreground">
        Select a batch that works for you. Prices are per person, all-inclusive.
      </p>

      {batches.length === 0 ? (
        <div className="rounded-2xl border border-border bg-muted/30 p-8 text-center">
          <p className="text-muted-foreground">No upcoming batches. Contact us for custom dates.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {batches.map((batch, i) => {
            const pct = Math.round(((batch.totalSeats - batch.availableSeats) / batch.totalSeats) * 100);
            const isFull = batch.availableSeats === 0;
            const isAlmostFull = batch.availableSeats <= 3 && !isFull;
            const isSelected = selectedBatch === batch.id;

            return (
              <motion.div
                key={batch.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                onClick={() => !isFull && setSelectedBatch(isSelected ? null : batch.id)}
                className={cn(
                  'relative overflow-hidden rounded-2xl border p-5 transition-all',
                  isFull
                    ? 'cursor-not-allowed border-border bg-muted/30 opacity-60'
                    : isSelected
                    ? 'cursor-pointer border-brand-500 bg-brand-500/5 shadow-md'
                    : 'cursor-pointer border-border bg-card hover:border-brand-500/40 hover:shadow-sm'
                )}
              >
                {/* Selected indicator */}
                {isSelected && (
                  <div className="absolute right-4 top-4">
                    <CheckCircle className="h-5 w-5 text-brand-500" />
                  </div>
                )}

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  {/* Date info */}
                  <div>
                    <div className="font-display text-lg font-bold text-foreground">
                      {formatDate(batch.startDate, 'dd MMM')} – {formatDate(batch.endDate, 'dd MMM yyyy')}
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {trek.durationDays} days
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {batch.totalSeats} total seats
                      </span>
                    </div>
                  </div>

                  {/* Price + availability */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-display text-2xl font-bold text-foreground">
                        {formatCurrency(batch.price ?? trek.pricePerPerson)}
                      </div>
                      <div className="text-xs text-muted-foreground">per person</div>
                    </div>

                    {!isFull && (
                      <a
                        href={`/bookings/new?trek=${trek.slug}&batch=${batch.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-600"
                      >
                        Book <ArrowRight className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Seat fill bar */}
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {isAlmostFull && <Zap className="h-3 w-3 text-orange-500" />}
                      <span className={cn(
                        'text-xs font-semibold',
                        isFull ? 'text-red-500' : isAlmostFull ? 'text-orange-500' : 'text-emerald-500'
                      )}>
                        {isFull ? 'Sold Out' : `${batch.availableSeats} seats remaining`}
                      </span>
                    </div>
                    <span className="text-[10px] text-muted-foreground">{pct}% filled</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      className={cn(
                        'h-full rounded-full',
                        pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-orange-500' : 'bg-emerald-500'
                      )}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
