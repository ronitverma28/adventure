'use client';

import { motion } from 'framer-motion';
import {
  Clock, Mountain, TrendingUp, Thermometer,
  Users, MapPin, Plane, Train, Star,
} from 'lucide-react';
import { Trek } from '@/types/trek.types';
import { DIFFICULTY_CONFIG } from '@/lib/constants/trek.constants';
import { formatCurrency } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';

interface Props {
  trek: Trek;
  diff: (typeof DIFFICULTY_CONFIG)[keyof typeof DIFFICULTY_CONFIG];
}

export function TrekQuickInfo({ trek, diff }: Props) {
  const cards = [
    {
      icon: Clock,
      label: 'Duration',
      value: `${trek.durationDays} Days`,
      sub: `${trek.durationNights} Nights`,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      icon: Mountain,
      label: 'Max Altitude',
      value: trek.altitudeMax ? `${trek.altitudeMax.toLocaleString()}m` : 'N/A',
      sub: trek.altitudeBase ? `Base: ${trek.altitudeBase.toLocaleString()}m` : '',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
    {
      icon: TrendingUp,
      label: 'Difficulty',
      value: diff.label,
      sub: 'Fitness required',
      color: diff.color,
      bg: diff.bg,
    },
    {
      icon: Thermometer,
      label: 'Temperature',
      value: '-5°C to 10°C',
      sub: 'Varies by season',
      color: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
    },
    {
      icon: Users,
      label: 'Group Size',
      value: `${trek.groupSizeMin}–${trek.groupSizeMax}`,
      sub: 'People per batch',
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      icon: Star,
      label: 'Rating',
      value: `${trek.avgRating} ★`,
      sub: `${trek.totalReviews.toLocaleString()} reviews`,
      color: 'text-brand-500',
      bg: 'bg-brand-500/10',
    },
  ];

  return (
    <div>
      {/* Short description */}
      <p className="mb-8 text-lg leading-relaxed text-muted-foreground">
        {trek.shortDescription}
      </p>

      {/* Quick info cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="group rounded-2xl border border-border bg-card p-4 transition-shadow hover:shadow-md"
            >
              <div className={cn('mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl', card.bg)}>
                <Icon className={cn('h-5 w-5', card.color)} />
              </div>
              <div className="text-xs text-muted-foreground">{card.label}</div>
              <div className={cn('mt-0.5 font-display text-lg font-bold', card.color)}>{card.value}</div>
              {card.sub && <div className="text-[11px] text-muted-foreground">{card.sub}</div>}
            </motion.div>
          );
        })}
      </div>

      {/* Highlights */}
      {trek.highlights && trek.highlights.length > 0 && (
        <div className="mt-8">
          <h3 className="mb-4 font-display text-xl font-bold text-foreground">Trek Highlights</h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {trek.highlights.map((h, i) => (
              <motion.div
                key={h}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-xs font-bold text-brand-500">
                  {i + 1}
                </span>
                <span className="text-sm text-foreground">{h}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
