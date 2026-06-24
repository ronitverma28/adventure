'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ThumbsUp, Camera, MessageSquare, Filter } from 'lucide-react';
import { Trek } from '@/types/trek.types';
import { formatRelativeTime } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import { SectionHeader } from './TrekPhotoGallery';

const MOCK_REVIEWS = [
  {
    id: 1, name: 'Priya Sharma', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80',
    location: 'Mumbai', rating: 5, date: '2024-12-15T00:00:00Z',
    title: 'Life-changing experience!',
    body: 'Standing at the Kedarkantha summit at sunrise, surrounded by a 360° panorama of snow-capped peaks, I understood why people call this life-changing. The team was incredibly professional and supportive throughout.',
    photos: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&q=75'],
    helpful: 42, isVerified: true,
  },
  {
    id: 2, name: 'Arjun Mehta', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80',
    location: 'Bangalore', rating: 5, date: '2024-11-20T00:00:00Z',
    title: 'Perfect first trek',
    body: 'As a first-time trekker, I was nervous. But the guides were patient, encouraging, and incredibly knowledgeable. The campfire nights were magical. Already planning my next trek with Adventure!',
    photos: [],
    helpful: 38, isVerified: true,
  },
  {
    id: 3, name: 'Kavya Nair', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80',
    location: 'Kochi', rating: 4, date: '2024-10-05T00:00:00Z',
    title: 'Beautiful but challenging',
    body: 'The summit views are absolutely worth every step. The trail is well-maintained and the guides are excellent. Food was surprisingly good for a mountain trek. Minus one star only because the sleeping bags could be warmer.',
    photos: ['https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&q=75'],
    helpful: 29, isVerified: true,
  },
];

const RATING_BREAKDOWN = [
  { stars: 5, count: 890, pct: 72 },
  { stars: 4, count: 248, pct: 20 },
  { stars: 3, count: 62,  pct: 5  },
  { stars: 2, count: 25,  pct: 2  },
  { stars: 1, count: 15,  pct: 1  },
];

export function TrekReviewsSection({ trek }: { trek: Trek }) {
  const [filter, setFilter] = useState<number | null>(null);
  const [helpfulClicked, setHelpfulClicked] = useState<Set<number>>(new Set());

  const filtered = filter ? MOCK_REVIEWS.filter((r) => r.rating === filter) : MOCK_REVIEWS;

  return (
    <div>
      <SectionHeader icon={MessageSquare} label="Reviews" title={`What Trekkers Say (${trek.totalReviews.toLocaleString()})`} />

      {/* Rating summary */}
      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* Overall */}
        <div className="flex items-center gap-6 rounded-2xl border border-border bg-card p-6">
          <div className="text-center">
            <div className="font-display text-6xl font-bold text-foreground">{trek.avgRating}</div>
            <div className="mt-1 flex justify-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn('h-4 w-4', i < Math.floor(trek.avgRating) ? 'fill-brand-400 text-brand-400' : 'text-muted')} />
              ))}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">{trek.totalReviews.toLocaleString()} reviews</div>
          </div>
          <div className="flex-1 space-y-1.5">
            {RATING_BREAKDOWN.map((r) => (
              <button
                key={r.stars}
                onClick={() => setFilter(filter === r.stars ? null : r.stars)}
                className={cn('flex w-full items-center gap-2 rounded-lg px-2 py-1 transition-colors', filter === r.stars && 'bg-brand-500/10')}
              >
                <span className="w-4 text-right text-xs text-muted-foreground">{r.stars}</span>
                <Star className="h-3 w-3 fill-brand-400 text-brand-400" />
                <div className="flex-1 overflow-hidden rounded-full bg-muted" style={{ height: 6 }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${r.pct}%` }}
                    viewport={{ once: true }}
                    className="h-full rounded-full bg-brand-400"
                  />
                </div>
                <span className="w-8 text-right text-xs text-muted-foreground">{r.pct}%</span>
              </button>
            ))}
          </div>
        </div>

        {/* Category ratings */}
        <div className="rounded-2xl border border-border bg-card p-6">
          <h4 className="mb-4 text-sm font-semibold text-foreground">Category Ratings</h4>
          {[
            { label: 'Guide Quality',    score: 4.9 },
            { label: 'Food & Meals',     score: 4.7 },
            { label: 'Accommodation',    score: 4.6 },
            { label: 'Value for Money',  score: 4.8 },
            { label: 'Safety',           score: 5.0 },
          ].map((cat) => (
            <div key={cat.label} className="mb-3 flex items-center gap-3">
              <span className="w-32 shrink-0 text-xs text-muted-foreground">{cat.label}</span>
              <div className="flex-1 overflow-hidden rounded-full bg-muted" style={{ height: 6 }}>
                <motion.div
                  initial={{ width: 0 }}
                  whileInView={{ width: `${(cat.score / 5) * 100}%` }}
                  viewport={{ once: true }}
                  className="h-full rounded-full bg-brand-400"
                />
              </div>
              <span className="w-8 text-right text-xs font-semibold text-foreground">{cat.score}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter chips */}
      {filter && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Showing {filter}-star reviews</span>
          <button onClick={() => setFilter(null)} className="text-xs text-brand-500 underline">Clear</button>
        </div>
      )}

      {/* Review cards */}
      <div className="space-y-4">
        {filtered.map((review, i) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="rounded-2xl border border-border bg-card p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <img src={review.avatar} alt={review.name} className="h-10 w-10 rounded-full object-cover" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">{review.name}</span>
                    {review.isVerified && (
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{review.location} · {formatRelativeTime(review.date)}</div>
                </div>
              </div>
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={cn('h-3.5 w-3.5', i < review.rating ? 'fill-brand-400 text-brand-400' : 'text-muted')} />
                ))}
              </div>
            </div>

            <h4 className="mt-3 font-semibold text-foreground">{review.title}</h4>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{review.body}</p>

            {/* Photos */}
            {review.photos.length > 0 && (
              <div className="mt-3 flex gap-2">
                {review.photos.map((photo) => (
                  <img key={photo} src={photo} alt="Review photo" className="h-16 w-16 rounded-xl object-cover" />
                ))}
              </div>
            )}

            {/* Helpful */}
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => setHelpfulClicked((prev) => { const n = new Set(prev); n.has(review.id) ? n.delete(review.id) : n.add(review.id); return n; })}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors',
                  helpfulClicked.has(review.id)
                    ? 'border-brand-500/30 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                    : 'border-border text-muted-foreground hover:bg-muted'
                )}
              >
                <ThumbsUp className="h-3 w-3" />
                Helpful ({review.helpful + (helpfulClicked.has(review.id) ? 1 : 0)})
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load more */}
      <div className="mt-6 text-center">
        <button className="rounded-xl border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
          Load More Reviews
        </button>
      </div>
    </div>
  );
}
