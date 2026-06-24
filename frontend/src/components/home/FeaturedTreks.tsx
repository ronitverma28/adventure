'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Star, Clock, Mountain, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { formatCurrency } from '@/lib/utils/formatters';

const DIFFICULTY_CONFIG = {
  EASY: { label: 'Easy', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
  MODERATE: { label: 'Moderate', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
  DIFFICULT: { label: 'Difficult', color: 'bg-orange-500/20 text-orange-400 border-orange-500/30' },
  EXTREME: { label: 'Extreme', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
};

const FEATURED_TREKS = [
  {
    id: 1,
    title: 'Kedarkantha Trek',
    slug: 'kedarkantha-trek',
    location: 'Uttarkashi, Uttarakhand',
    duration: '6 Days / 5 Nights',
    difficulty: 'EASY' as const,
    altitude: 3810,
    price: 8500,
    rating: 4.9,
    reviews: 1240,
    isBestseller: true,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    tag: 'Winter Special',
  },
  {
    id: 2,
    title: 'Roopkund Trek',
    slug: 'roopkund-trek',
    location: 'Chamoli, Uttarakhand',
    duration: '8 Days / 7 Nights',
    difficulty: 'DIFFICULT' as const,
    altitude: 5029,
    price: 14500,
    rating: 4.8,
    reviews: 876,
    isBestseller: false,
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    tag: 'Mystery Lake',
  },
  {
    id: 3,
    title: 'Hampta Pass',
    slug: 'hampta-pass-trek',
    location: 'Kullu, Himachal Pradesh',
    duration: '5 Days / 4 Nights',
    difficulty: 'MODERATE' as const,
    altitude: 4270,
    price: 9800,
    rating: 4.9,
    reviews: 1050,
    isBestseller: true,
    image: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&q=80',
    tag: 'Most Popular',
  },
  {
    id: 4,
    title: 'Valley of Flowers',
    slug: 'valley-of-flowers',
    location: 'Chamoli, Uttarakhand',
    duration: '6 Days / 5 Nights',
    difficulty: 'EASY' as const,
    altitude: 3658,
    price: 11200,
    rating: 4.9,
    reviews: 2100,
    isBestseller: true,
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
    tag: 'UNESCO Heritage',
  },
  {
    id: 5,
    title: 'Chadar Trek',
    slug: 'chadar-trek',
    location: 'Leh, Ladakh',
    duration: '9 Days / 8 Nights',
    difficulty: 'EXTREME' as const,
    altitude: 3400,
    price: 22000,
    rating: 4.7,
    reviews: 430,
    isBestseller: false,
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80',
    tag: 'Frozen River',
  },
  {
    id: 6,
    title: 'Brahmatal Trek',
    slug: 'brahmatal-trek',
    location: 'Chamoli, Uttarakhand',
    duration: '6 Days / 5 Nights',
    difficulty: 'MODERATE' as const,
    altitude: 3862,
    price: 9200,
    rating: 4.8,
    reviews: 680,
    isBestseller: false,
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
    tag: 'Winter Trek',
  },
];

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

  return (
    <section className="bg-background py-24">
      <div className="container">
        {/* Header */}
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
            <h2 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              Featured Treks
            </h2>
            <p className="mt-3 max-w-lg text-muted-foreground">
              Carefully curated adventures for every skill level. From gentle meadow walks
              to extreme high-altitude expeditions.
            </p>
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

        {/* Grid */}
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? 'visible' : 'hidden'}
          className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {FEATURED_TREKS.map((trek) => (
            <TrekCard key={trek.id} trek={trek} />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function TrekCard({ trek }: { trek: (typeof FEATURED_TREKS)[0] }) {
  const diff = DIFFICULTY_CONFIG[trek.difficulty];

  return (
    <motion.article
      variants={cardVariants}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-xl"
    >
      {/* Image */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={trek.image}
          alt={trek.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute left-3 top-3 flex gap-2">
          {trek.isBestseller && (
            <span className="rounded-full bg-brand-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
              Bestseller
            </span>
          )}
          <span className="rounded-full bg-black/40 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
            {trek.tag}
          </span>
        </div>

        {/* Rating */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/40 px-2.5 py-1 backdrop-blur-sm">
          <Star className="h-3 w-3 fill-brand-400 text-brand-400" />
          <span className="text-xs font-semibold text-white">{trek.rating}</span>
          <span className="text-[10px] text-white/60">({trek.reviews})</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Location */}
        <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Mountain className="h-3 w-3" />
          {trek.location}
        </div>

        {/* Title */}
        <h3 className="font-display text-lg font-bold text-foreground transition-colors group-hover:text-brand-500">
          {trek.title}
        </h3>

        {/* Meta */}
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
            {trek.duration}
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Mountain className="h-3 w-3" />
            {trek.altitude.toLocaleString()}m
          </span>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div>
            <span className="text-[10px] text-muted-foreground">Starting from</span>
            <div className="font-display text-xl font-bold text-foreground">
              {formatCurrency(trek.price)}
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
