import { Suspense } from 'react';
import type { Metadata } from 'next';
import { TrekListing } from '@/components/trek/TrekListing';
import { TrekGridSkeleton } from '@/components/trek/TrekCardSkeleton';

export const metadata: Metadata = {
  title: 'All Treks',
  description:
    'Browse curated Himalayan treks. Filter by difficulty, duration, budget, and season.',
};

export default function TreksPage() {
  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="border-b border-border bg-muted/30">
        <div className="container py-6 sm:py-10">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <a href="/" className="hover:text-foreground">Home</a>
              <span>/</span>
              <span className="text-foreground">Treks</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl md:text-4xl">
              Explore All Treks
            </h1>
            <p className="max-w-xl text-sm text-muted-foreground sm:text-base">
              Browse our curated trek inventory and find your next adventure.
            </p>
          </div>
        </div>
      </div>

      <div className="container py-6 sm:py-8">
        <Suspense fallback={<TrekGridSkeleton count={12} />}>
          <TrekListing />
        </Suspense>
      </div>
    </div>

  );
}
