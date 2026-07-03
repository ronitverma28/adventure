'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Grid3X3, List, ChevronDown, X, FlaskConical } from 'lucide-react';
import { TrekCard } from './TrekCard';
import { TrekFilterPanel } from './TrekFilterPanel';
import { TrekGridSkeleton } from './TrekCardSkeleton';
import { QuickViewModal } from './QuickViewModal';
import { TrekPagination } from './TrekPagination';
import { trekApi } from '@/lib/api/treks';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { cn } from '@/lib/utils/cn';
import type { Trek, TrekFilters, SortOption } from '@/types/trek.types';
import type { PagedResponse } from '@/types/api.types';
import { SORT_OPTIONS } from '@/lib/constants/trek.constants';

interface TrekListingProps {
  initialTreks?: Trek[];
}

const DEFAULT_PAGED: PagedResponse<Trek> = {
  content: [],
  page: 0,
  size: 12,
  totalElements: 0,
  totalPages: 0,
  first: true,
  last: true,
};

export function TrekListing({ initialTreks = [] }: TrekListingProps) {
  const [filters, setFilters] = useState<TrekFilters>({});
  const [searchInput, setSearchInput] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOpen, setSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewTrek, setQuickViewTrek] = useState<Trek | null>(null);
  const [loading, setLoading] = useState(initialTreks.length === 0);
  const [usingMockData, setUsingMockData] = useState(false);
  const [result, setResult] = useState<PagedResponse<Trek>>({
    ...DEFAULT_PAGED,
    content: initialTreks,
    totalElements: initialTreks.length,
    totalPages: initialTreks.length > 0 ? 1 : 0,
    last: true,
    first: true,
  });

  const debouncedSearch = useDebounce(searchInput, 350);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, debouncedSearch]);

  useEffect(() => {
    let active = true;

    async function loadTreks() {
      setLoading(true);
      try {
        const response = debouncedSearch
          ? await trekApi.search(debouncedSearch, currentPage - 1, 12)
          : await trekApi.getAll({
              search: debouncedSearch || filters.search,
              state: filters.state,
              region: filters.region,
              difficulty: filters.difficulty,
              minPrice: filters.minPrice,
              maxPrice: filters.maxPrice,
              bestSeason: filters.bestSeason,
              featured: filters.featured,
              bestseller: filters.bestseller,
              sort: filters.sort,
            }, currentPage - 1, 12);

        if (!active) return;
        if (response.data?.data?.content && response.data.data.content.length > 0) {
          setResult(response.data.data);
          setUsingMockData(false);
        } else {
          throw new Error('No treks found in API response');
        }
      } catch {
        if (!active) return;
        // API unavailable — fall back to mock data with client-side filtering
        const { MOCK_TREKS } = await import('@/lib/data/mock-treks');
        const PAGE_SIZE = 12;
        const query = (debouncedSearch || filters.search || '').toLowerCase();

        let filtered = MOCK_TREKS.filter((trek) => {
          if (query && !trek.title.toLowerCase().includes(query) &&
              !trek.location.toLowerCase().includes(query) &&
              !(trek.state ?? '').toLowerCase().includes(query)) return false;
          if (filters.difficulty && trek.difficulty !== filters.difficulty) return false;
          if (filters.state && trek.state !== filters.state) return false;
          if (filters.minPrice && trek.pricePerPerson < filters.minPrice) return false;
          if (filters.maxPrice && trek.pricePerPerson > filters.maxPrice) return false;
          if (filters.bestSeason && !trek.bestSeason?.includes(filters.bestSeason)) return false;
          if (filters.featured && !trek.isFeatured) return false;
          if (filters.bestseller && !trek.isBestseller) return false;
          return true;
        });

        const sort = filters.sort ?? 'popular';
        if (sort === 'price_asc') filtered.sort((a, b) => a.pricePerPerson - b.pricePerPerson);
        else if (sort === 'price_desc') filtered.sort((a, b) => b.pricePerPerson - a.pricePerPerson);
        else if (sort === 'rating') filtered.sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0));
        else if (sort === 'duration_asc') filtered.sort((a, b) => a.durationDays - b.durationDays);
        else filtered.sort((a, b) => (b.totalBookings ?? 0) - (a.totalBookings ?? 0));

        const totalElements = filtered.length;
        const totalPages = Math.ceil(totalElements / PAGE_SIZE);
        const start = (currentPage - 1) * PAGE_SIZE;
        const content = filtered.slice(start, start + PAGE_SIZE);

        setResult({
          content,
          page: currentPage - 1,
          size: PAGE_SIZE,
          totalElements,
          totalPages,
          first: currentPage === 1,
          last: currentPage >= totalPages,
        });
        setUsingMockData(true);
      } finally {
        if (active) setLoading(false);
      }
    }

    loadTreks();
    return () => {
      active = false;
    };
  }, [currentPage, debouncedSearch, filters]);

  const currentSort = SORT_OPTIONS.find((option) => option.value === (filters.sort ?? 'popular'));

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string }[] = [];
    if (filters.difficulty) chips.push({ key: 'difficulty', label: filters.difficulty });
    if (filters.state) chips.push({ key: 'state', label: filters.state });
    if (filters.minPrice || filters.maxPrice) {
      chips.push({
        key: 'price',
        label: `INR ${(filters.minPrice ?? 0).toLocaleString()} - INR ${(filters.maxPrice ?? 50000).toLocaleString()}`,
      });
    }
    if (filters.bestSeason) chips.push({ key: 'bestSeason', label: filters.bestSeason });
    return chips;
  }, [filters]);

  const removeChip = (key: string) => {
    const next = { ...filters };
    if (key === 'price') {
      delete next.minPrice;
      delete next.maxPrice;
    } else {
      delete (next as Record<string, unknown>)[key];
    }
    setFilters(next);
  };

  return (
    <>
      <div className="flex flex-col lg:flex-row gap-6">
        <TrekFilterPanel
          filters={filters}
          onChange={setFilters}
          totalResults={result.totalElements}
        />

        <div className="min-w-0 flex-1">
          <div className="mb-6 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {/* Filter button inline on mobile (rendered by TrekFilterPanel as lg:hidden child) */}
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search treks..."
                  className="w-full rounded-xl border border-border bg-card py-2.5 pl-10 pr-4 text-sm text-foreground placeholder-muted-foreground outline-none transition-colors focus:border-brand-500 focus:ring-1 focus:ring-brand-500/20"
                />
                {searchInput && (
                  <button
                    onClick={() => setSearchInput('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setSortOpen((value) => !value)}
                  className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted"
                >
                  <span className="hidden sm:inline">{currentSort?.label}</span>
                  <span className="sm:hidden">Sort</span>
                  <ChevronDown className={cn('h-4 w-4 transition-transform', sortOpen && 'rotate-180')} />
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full z-30 mt-2 w-52 overflow-hidden rounded-xl border border-border bg-card shadow-xl"
                    >
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setFilters((current) => ({ ...current, sort: option.value as SortOption }));
                            setSortOpen(false);
                          }}
                          className={cn(
                            'flex w-full items-center px-4 py-2.5 text-sm transition-colors',
                            filters.sort === option.value || (!filters.sort && option.value === 'popular')
                              ? 'bg-brand-500/10 font-medium text-brand-600 dark:text-brand-400'
                              : 'text-foreground hover:bg-muted'
                          )}
                        >
                          {option.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                {sortOpen && <div className="fixed inset-0 z-20" onClick={() => setSortOpen(false)} />}
              </div>

              <div className="flex overflow-hidden rounded-xl border border-border bg-card">
                {(['grid', 'list'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={cn(
                      'flex h-10 w-10 items-center justify-center transition-colors',
                      viewMode === mode ? 'bg-brand-500 text-white' : 'text-muted-foreground hover:bg-muted'
                    )}
                  >
                    {mode === 'grid' ? <Grid3X3 className="h-4 w-4" /> : <List className="h-4 w-4" />}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {activeChips.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-2"
                >
                  {activeChips.map((chip) => (
                    <motion.span
                      key={chip.key}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-600 dark:text-brand-400"
                    >
                      {chip.label}
                      <button onClick={() => removeChip(chip.key)}>
                        <X className="h-3 w-3" />
                      </button>
                    </motion.span>
                  ))}
                  <button
                    onClick={() => setFilters({})}
                    className="text-xs text-muted-foreground underline hover:text-foreground"
                  >
                    Clear all
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Demo data banner */}
            <AnimatePresence>
              {usingMockData && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-xs font-medium text-amber-700 dark:text-amber-400"
                >
                  <FlaskConical className="h-3.5 w-3.5 shrink-0" />
                  Showing demo data &mdash; API is currently unavailable. Filters &amp; search work locally.
                </motion.div>
              )}
            </AnimatePresence>

            <div className="text-sm text-muted-foreground">
              {loading ? 'Loading treks...' : (
                <>
                  Showing <span className="font-semibold text-foreground">{result.content.length}</span> of{' '}
                  <span className="font-semibold text-foreground">{result.totalElements}</span> treks
                </>
              )}
            </div>
          </div>

          {loading ? (
            <TrekGridSkeleton count={12} viewMode={viewMode} />
          ) : result.content.length === 0 ? (
            <EmptyState onReset={() => { setFilters({}); setSearchInput(''); }} />
          ) : (
            <motion.div
              layout
              className={cn(
                viewMode === 'grid'
                  ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3'
                  : 'flex flex-col gap-4'
              )}
            >
              <AnimatePresence mode="popLayout">
                {result.content.map((trek) => (
                  <TrekCard
                    key={trek.id}
                    trek={trek}
                    viewMode={viewMode}
                    onQuickView={setQuickViewTrek}
                  />
                ))}
              </AnimatePresence>
            </motion.div>
          )}

          {result.totalPages > 1 && (
            <div className="mt-10">
              <TrekPagination
                currentPage={currentPage}
                totalPages={result.totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      <QuickViewModal trek={quickViewTrek} onClose={() => setQuickViewTrek(null)} />
    </>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      <h3 className="font-display text-xl font-bold text-foreground">No treks found</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Try adjusting your filters or search query to discover more adventures.
      </p>
      <button
        onClick={onReset}
        className="mt-6 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
      >
        Reset Filters
      </button>
    </motion.div>
  );
}

