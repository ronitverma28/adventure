'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Star, Clock, Mountain, Calendar, Users,
  ArrowRight, Check, ChevronDown, Zap, Shield,
  CreditCard, Phone, MessageCircle,
} from 'lucide-react';
import { Trek } from '@/types/trek.types';
import { DIFFICULTY_CONFIG } from '@/lib/constants/trek.constants';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';

export function TrekStickyBooking({ trek }: { trek: Trek }) {
  const [selectedBatch, setSelectedBatch] = useState<number | null>(
    trek.upcomingBatches?.[0]?.id ?? null
  );
  const [persons, setPersons] = useState(1);
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);

  const diff    = DIFFICULTY_CONFIG[trek.difficulty];
  const batches = trek.upcomingBatches ?? [];
  const batch   = batches.find((b) => b.id === selectedBatch);
  const price   = batch?.price ?? trek.pricePerPerson;
  const subtotal = price * persons;
  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;
  const total    = subtotal - discount;

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'ADVENTURE10') setCouponApplied(true);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xl">
      {/* Header */}
      <div className="border-b border-border bg-gradient-to-r from-brand-500/10 to-brand-600/5 p-5">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-xs text-muted-foreground">Starting from</div>
            <div className="font-display text-3xl font-bold text-foreground">
              {formatCurrency(trek.pricePerPerson)}
            </div>
            <div className="text-xs text-muted-foreground">per person · all inclusive</div>
          </div>
          <div className="flex items-center gap-1 rounded-xl bg-brand-500/10 px-3 py-1.5">
            <Star className="h-3.5 w-3.5 fill-brand-400 text-brand-400" />
            <span className="text-sm font-bold text-foreground">{trek.avgRating}</span>
          </div>
        </div>

        {/* Quick meta */}
        <div className="mt-3 flex flex-wrap gap-2">
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />{trek.durationDays}D/{trek.durationNights}N
          </span>
          <span className={cn('flex items-center gap-1 text-xs', diff.color)}>
            <Mountain className="h-3 w-3" />{diff.label}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="h-3 w-3" />Max {trek.groupSizeMax}
          </span>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* Batch selector */}
        {batches.length > 0 && (
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">Select Date</label>
            <div className="relative">
              <button
                onClick={() => setBatchOpen((v) => !v)}
                className="flex w-full items-center justify-between rounded-xl border border-border bg-background px-4 py-3 text-sm transition-colors hover:bg-muted"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-brand-500" />
                  {batch ? (
                    <span className="font-medium text-foreground">
                      {formatDate(batch.startDate, 'dd MMM')} – {formatDate(batch.endDate, 'dd MMM yyyy')}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Choose a date</span>
                  )}
                </div>
                <ChevronDown className={cn('h-4 w-4 text-muted-foreground transition-transform', batchOpen && 'rotate-180')} />
              </button>

              <AnimatePresence>
                {batchOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
                  >
                    {batches.map((b) => {
                      const pct = Math.round(((b.totalSeats - b.availableSeats) / b.totalSeats) * 100);
                      return (
                        <button
                          key={b.id}
                          disabled={b.availableSeats === 0}
                          onClick={() => { setSelectedBatch(b.id); setBatchOpen(false); }}
                          className={cn(
                            'flex w-full items-center justify-between px-4 py-3 text-sm transition-colors',
                            b.availableSeats === 0 ? 'cursor-not-allowed opacity-50' :
                            selectedBatch === b.id ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400' :
                            'hover:bg-muted'
                          )}
                        >
                          <div>
                            <div className="font-medium">
                              {formatDate(b.startDate, 'dd MMM')} – {formatDate(b.endDate, 'dd MMM')}
                            </div>
                            <div className={cn('text-[10px]', b.availableSeats === 0 ? 'text-red-500' : b.availableSeats <= 3 ? 'text-orange-500' : 'text-emerald-500')}>
                              {b.availableSeats === 0 ? 'Sold Out' : `${b.availableSeats} seats left`}
                            </div>
                          </div>
                          {selectedBatch === b.id && <Check className="h-4 w-4 text-brand-500" />}
                        </button>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
              {batchOpen && <div className="fixed inset-0 z-10" onClick={() => setBatchOpen(false)} />}
            </div>
          </div>
        )}

        {/* Persons */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground">Number of Persons</label>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 py-2.5">
            <Users className="h-4 w-4 text-brand-500" />
            <button
              onClick={() => setPersons((p) => Math.max(1, p - 1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-foreground transition-colors hover:bg-muted-foreground/20"
            >
              −
            </button>
            <span className="flex-1 text-center font-semibold text-foreground">{persons}</span>
            <button
              onClick={() => setPersons((p) => Math.min(trek.groupSizeMax ?? 100, p + 1))}
              className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-foreground transition-colors hover:bg-muted-foreground/20"
            >
              +
            </button>
          </div>
        </div>

        {/* Coupon */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground">Coupon Code</label>
          <div className="flex gap-2">
            <input
              value={coupon}
              onChange={(e) => setCoupon(e.target.value.toUpperCase())}
              placeholder="ADVENTURE10"
              disabled={couponApplied}
              className="flex-1 rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-brand-500 disabled:opacity-60"
            />
            <button
              onClick={applyCoupon}
              disabled={couponApplied || !coupon}
              className="rounded-xl bg-brand-500/10 px-4 py-2.5 text-sm font-semibold text-brand-600 transition-colors hover:bg-brand-500/20 disabled:opacity-50 dark:text-brand-400"
            >
              {couponApplied ? 'Applied!' : 'Apply'}
            </button>
          </div>
          {couponApplied && (
            <p className="mt-1 text-xs text-emerald-500">✓ 10% discount applied!</p>
          )}
        </div>

        {/* Price breakdown */}
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{formatCurrency(price)} × {persons} person{persons > 1 ? 's' : ''}</span>
            <span className="text-foreground">{formatCurrency(subtotal)}</span>
          </div>
          {couponApplied && (
            <div className="flex justify-between text-sm">
              <span className="text-emerald-500">Coupon (ADVENTURE10)</span>
              <span className="text-emerald-500">−{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2">
            <span className="font-semibold text-foreground">Total</span>
            <span className="font-display text-lg font-bold text-foreground">{formatCurrency(total)}</span>
          </div>
        </div>

        {/* Book CTA */}
        <a
          href={`/bookings/new?trek=${trek.slug}${selectedBatch ? `&batch=${selectedBatch}` : ''}&persons=${persons}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-600 hover:-translate-y-0.5"
        >
          Book Now — {formatCurrency(total)}
          <ArrowRight className="h-4 w-4" />
        </a>

        {/* EMI note */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <CreditCard className="h-3.5 w-3.5" />
          EMI from {formatCurrency(Math.round(total / 3))}/month
        </div>

        {/* Trust signals */}
        <div className="space-y-1.5 border-t border-border pt-3">
          {[
            { icon: Check,   text: 'Free cancellation up to 15 days before' },
            { icon: Shield,  text: 'Secure payment via Razorpay / Stripe' },
            { icon: Zap,     text: 'Instant booking confirmation' },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
              <Icon className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
              {text}
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="flex gap-2 border-t border-border pt-3">
          <a
            href="tel:+919876543210"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border py-2.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            <Phone className="h-3.5 w-3.5" /> Call Us
          </a>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-green-500/30 bg-green-500/10 py-2.5 text-xs font-medium text-green-600 transition-colors hover:bg-green-500/20 dark:text-green-400"
          >
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
