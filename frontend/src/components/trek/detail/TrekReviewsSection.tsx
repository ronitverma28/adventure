'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Star, ThumbsUp } from 'lucide-react';
import { reviewApi } from '@/lib/api/reviews';
import { formatRelativeTime } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import { SectionHeader } from './TrekPhotoGallery';
import type { Trek } from '@/types/trek.types';
import type { RatingSummary, Review } from '@/types/review.types';

export function TrekReviewsSection({ trek }: { trek: Trek }) {
  const [filter, setFilter] = useState<number | null>(null);
  const [helpfulClicked, setHelpfulClicked] = useState<Set<number>>(new Set());
  const [reviews, setReviews] = useState<Review[]>([]);
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadReviews() {
      setLoading(true);
      try {
        const [reviewResponse, summaryResponse] = await Promise.all([
          reviewApi.getTrekReviews(trek.id, page, 10),
          reviewApi.getTrekRating(trek.id),
        ]);

        if (!active) return;
        const nextReviews = reviewResponse.data.data.content;
        setReviews((current) => (page === 0 ? nextReviews : [...current, ...nextReviews]));
        setSummary(summaryResponse.data.data);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadReviews();
    return () => {
      active = false;
    };
  }, [page, trek.id]);

  const filtered = useMemo(
    () => (filter ? reviews.filter((review) => review.rating === filter) : reviews),
    [filter, reviews]
  );

  const ratingBreakdown = [5, 4, 3, 2, 1].map((stars) => {
    const count = summary?.ratingDistribution?.[String(stars)] ?? summary?.ratingDistribution?.[stars] ?? 0;
    const total = summary?.totalReviews || 0;
    return {
      stars,
      count,
      pct: total > 0 ? Math.round((count / total) * 100) : 0,
    };
  });

  return (
    <div>
      <SectionHeader icon={MessageSquare} label="Reviews" title={`What Trekkers Say (${summary?.totalReviews ?? trek.totalReviews ?? 0})`} />

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex items-center gap-6 rounded-2xl border border-border bg-card p-6">
          <div className="text-center">
            <div className="font-display text-6xl font-bold text-foreground">
              {summary?.averageRating ?? trek.avgRating ?? 0}
            </div>
            <div className="mt-1 flex justify-center gap-0.5">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star
                  key={index}
                  className={cn(
                    'h-4 w-4',
                    index < Math.floor(summary?.averageRating ?? trek.avgRating ?? 0)
                      ? 'fill-brand-400 text-brand-400'
                      : 'text-muted'
                  )}
                />
              ))}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {(summary?.totalReviews ?? trek.totalReviews ?? 0).toLocaleString()} reviews
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            {ratingBreakdown.map((item) => (
              <button
                key={item.stars}
                onClick={() => setFilter(filter === item.stars ? null : item.stars)}
                className={cn('flex w-full items-center gap-2 rounded-lg px-2 py-1 transition-colors', filter === item.stars && 'bg-brand-500/10')}
              >
                <span className="w-4 text-right text-xs text-muted-foreground">{item.stars}</span>
                <Star className="h-3 w-3 fill-brand-400 text-brand-400" />
                <div className="flex-1 overflow-hidden rounded-full bg-muted" style={{ height: 6 }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${item.pct}%` }}
                    viewport={{ once: true }}
                    className="h-full rounded-full bg-brand-400"
                  />
                </div>
                <span className="w-8 text-right text-xs text-muted-foreground">{item.pct}%</span>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-6">
          <h4 className="mb-4 text-sm font-semibold text-foreground">Rating Snapshot</h4>
          <div className="space-y-3">
            {ratingBreakdown.map((item) => (
              <div key={item.stars} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{item.stars} star</span>
                <span className="font-semibold text-foreground">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {filter && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Showing {filter}-star reviews</span>
          <button onClick={() => setFilter(null)} className="text-xs text-brand-500 underline">Clear</button>
        </div>
      )}

      {loading && reviews.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          Loading reviews...
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No reviews available for this trek yet.
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="rounded-2xl border border-border bg-card p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <img
                    src={review.userAvatarUrl || trek.coverImageUrl || ''}
                    alt={review.userName}
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{review.userName}</span>
                      {review.isVerified && (
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{formatRelativeTime(review.createdAt)}</div>
                  </div>
                </div>
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={starIndex} className={cn('h-3.5 w-3.5', starIndex < review.rating ? 'fill-brand-400 text-brand-400' : 'text-muted')} />
                  ))}
                </div>
              </div>

              {review.title && <h4 className="mt-3 font-semibold text-foreground">{review.title}</h4>}
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{review.comment}</p>

              {(review.photos?.length ?? 0) > 0 && (
                <div className="mt-3 flex gap-2">
                  {review.photos?.map((photo) => (
                    <img key={photo} src={photo} alt="Review" className="h-16 w-16 rounded-xl object-cover" />
                  ))}
                </div>
              )}

              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => setHelpfulClicked((current) => {
                    const next = new Set(current);
                    if (next.has(review.id)) next.delete(review.id);
                    else next.add(review.id);
                    return next;
                  })}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors',
                    helpfulClicked.has(review.id)
                      ? 'border-brand-500/30 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                      : 'border-border text-muted-foreground hover:bg-muted'
                  )}
                >
                  <ThumbsUp className="h-3 w-3" />
                  Helpful ({(review.helpfulCount ?? 0) + (helpfulClicked.has(review.id) ? 1 : 0)})
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && reviews.length >= 10 && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setPage((current) => current + 1)}
            className="rounded-xl border border-border bg-card px-6 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            Load More Reviews
          </button>
        </div>
      )}
    </div>
  );
}
