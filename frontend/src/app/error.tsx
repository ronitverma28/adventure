'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home, ChevronDown, ChevronUp } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    console.error('Next.js Root Error Boundary:', error);
  }, [error]);

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-500/10 text-red-500">
        <AlertCircle className="h-10 w-10 animate-pulse" />
        <div className="absolute inset-0 -z-10 animate-ping rounded-full bg-red-500/5" />
      </div>

      <h1 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        Something went wrong
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        An unexpected error occurred while loading this page. Our team has been notified.
      </p>

      {/* Error Details Accordion */}
      <div className="mt-6 w-full max-w-md overflow-hidden rounded-xl border border-border bg-card">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex w-full items-center justify-between px-4 py-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-muted"
        >
          <span>Error Details</span>
          {showDetails ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
        {showDetails && (
          <div className="border-t border-border bg-muted/30 px-4 py-3 text-left">
            <p className="font-mono text-xs font-semibold text-red-500 break-all">
              {error.message || 'Unknown error'}
            </p>
            {error.digest && (
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                Digest: {error.digest}
              </p>
            )}
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition-all hover:bg-brand-600 hover:-translate-y-0.5"
        >
          <RotateCcw className="h-4 w-4" />
          Try Again
        </button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted hover:-translate-y-0.5"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Link>
      </div>
    </div>
  );
}
