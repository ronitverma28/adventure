'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Star, Clock, Mountain, TrendingUp } from 'lucide-react';
import { trekApi } from '@/lib/api/treks';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/formatters';
import type { Trek } from '@/types/trek.types';

const DIFFICULTY_CONFIG = {
  EASY: { label: 'Easy', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  MODERATE: { label: 'Moderate', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  DIFFICULT: { label: 'Difficult', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  EXTREME: { label: 'Extreme', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export function FeaturedTreks() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [treks, setTreks] = useState<Trek[]>([]);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadTreks() {
      try {
        const response = await trekApi.getFeatured(0, 4);
        if (active) {
          setTreks(response.data.data.content.slice(0, 4));
          setUsingMockData(false);
        }
      } catch {
        if (!active) return;
        // Fallback: pick 4 featured/bestseller mock treks
        const { MOCK_TREKS } = await import('@/lib/data/mock-treks');
        const featured = MOCK_TREKS
          .filter((t) => t.isFeatured || t.isBestseller)
          .slice(0, 4);
        setTreks(featured);
        setUsingMockData(true);
      }
    }

    loadTreks();
    return () => {
      active = false;
    };
  }, []);

  return (
    <section className="bg-background py-16 md:py-24">
      <div className="container">
        <div className="mb-14 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-brand-500">
              Handpicked for You
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Featured Treks
            </h2>
            <p className="mt-3 max-w-lg text-muted-foreground">
              Expertly curated treks across India's most breathtaking Himalayan regions.
            </p>
            {usingMockData && (
              <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-amber-500/80">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                Showing demo treks — API offline
              </span>
            )}
          </motion.div>

          <motion.a
            href="/treks"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="group flex shrink-0 items-center gap-2 text-sm font-semibold text-brand-500 transition-colors hover:text-brand-600"
          >
            View all treks
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </motion.a>
        </div>

        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4"
        >
          {treks.map((trek) => (
            <TrekCard key={trek.id} trek={trek} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function TrekCard({ trek }: { trek: Trek }) {
  const diff = DIFFICULTY_CONFIG[trek.difficulty];

  return (
    <motion.article
      variants={cardVariants}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-xl"
    >
      <div className="relative h-56 overflow-hidden">
        <img
          src={trek.coverImageUrl || ''}
          alt={trek.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute left-3 top-3 flex gap-2">
          {trek.isBestseller && (
            <span className="rounded-full bg-brand-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
              Bestseller
            </span>
          )}
          <span className="rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
            {trek.state}
          </span>
        </div>

        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-sm">
          <Star className="h-3 w-3 fill-brand-400 text-brand-400" />
          <span className="text-xs font-semibold text-white">{trek.avgRating}</span>
          <span className="text-[10px] text-white/60">({trek.totalReviews})</span>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Mountain className="h-3 w-3" />
          {trek.location}
        </div>

        <h3 className="font-display text-lg font-bold text-foreground transition-colors group-hover:text-brand-500">
          {trek.title}
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-medium',
              diff.color
            )}
          >
            <TrendingUp className="h-2.5 w-2.5" />
            {diff.label}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {trek.durationDays} Days
          </span>
          {trek.altitudeMax && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Mountain className="h-3 w-3" />
              {trek.altitudeMax.toLocaleString()}m
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div>
            <span className="text-[10px] text-muted-foreground">Starting from</span>
            <div className="font-display text-xl font-bold text-foreground">
              {formatCurrency(trek.pricePerPerson)}
            </div>
            <span className="text-[10px] text-muted-foreground">per person</span>
          </div>
          <a
            href={`/treks/${trek.slug}`}
            className="group/btn flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-brand-600 hover:gap-2.5"
          >
            View Trek
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </a>
        </div>
      </div>
    </motion.article>
  );
}
