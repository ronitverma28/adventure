'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Grid3X3, List, ChevronDown, X, SlidersHorizontal } from 'lucide-react';
import { TrekCard } from './TrekCard';
import { TrekFilterPanel } from './TrekFilterPanel';
import { TrekGridSkeleton } from './TrekCardSkeleton';
import { QuickViewModal } from './QuickViewModal';
import { TrekPagination } from './TrekPagination';
import { Trek, TrekFilters, SortOption } from '@/types/trek.types';
import { SORT_OPTIONS, TREKS_PER_PAGE } from '@/lib/constants/trek.constants';
import { useDebounce } from '@/lib/hooks/useDebounce';
import { cn } from '@/lib/utils/cn';

interface TrekListingProps {
  initialTreks: Trek[];
  isLoading?: boolean;
}

export function TrekListing({ initialTreks, isLoading = false }: TrekListingProps) {
  const [filters, setFilters] = useState<TrekFilters>({});
  const [searchInput, setSearchInput] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortOpen, setSortOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [quickViewTrek, setQuickViewTrek] = useState<Trek | null>(null);

  const debouncedSearch = useDebounce(searchInput, 350);

  // Reset page on filter change
  useEffect(() => { setCurrentPage(1); }, [filters, debouncedSearch]);

  const handleFilterChange = useCallback((newFilters: TrekFilters) => {
    setFilters(newFilters);
  }, []);

  // Client-side filtering + sorting
  const filteredTreks = useMemo(() => {
    let result = [...initialTreks];

    // Search
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q) ||
          t.state.toLowerCase().includes(q) ||
          t.shortDescription.toLowerCase().includes(q)
      );
    }

    // Difficulty
    if (filters.difficulty) result = result.filter((t) => t.difficulty === filters.difficulty);

    // State
    if (filters.state) result = result.filter((t) => t.state === filters.state);

    // Price
    if (filters.minPrice !== undefined) result = result.filter((t) => t.pricePerPerson >= filters.minPrice!);
    if (filters.maxPrice !== undefined) result = result.filter((t) => t.pricePerPerson <= filters.maxPrice!);

    // Duration
    if (filters.minDays !== undefined) result = result.filter((t) => t.durationDays >= filters.minDays!);
    if (filters.maxDays !== undefined) result = result.filter((t) => t.durationDays <= filters.maxDays!);

    // Altitude
    if (filters.maxAltitude !== undefined)
      result = result.filter((t) => !t.altitudeMax || t.altitudeMax <= filters.maxAltitude!);

    // Season
    if (filters.bestSeason)
      result = result.filter((t) => t.bestSeason?.includes(filters.bestSeason!));

    // Sort
    switch (filters.sort) {
      case 'price_asc': result.sort((a, b) => a.pricePerPerson - b.pricePerPerson); break;
      case 'price_desc': result.sort((a, b) => b.pricePerPerson - a.pricePerPerson); break;
      case 'rating': result.sort((a, b) => b.avgRating - a.avgRating); break;
      case 'duration_asc': result.sort((a, b) => a.durationDays - b.durationDays); break;
      case 'duration_desc': result.sort((a, b) => b.durationDays - a.durationDays); break;
      case 'newest': result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      default: result.sort((a, b) => b.totalBookings - a.totalBookings); // popular
    }

    return result;
  }, [initialTreks, debouncedSearch, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredTreks.length / TREKS_PER_PAGE);
  const paginatedTreks = filteredTreks.slice(
    (currentPage - 1) * TREKS_PER_PAGE,
    currentPage * TREKS_PER_PAGE
  );

  const currentSort = SORT_OPTIONS.find((o) => o.value === (filters.sort ?? 'popular'));

  // Active filter chips
  const activeChips = useMemo(() => {
    const chips: { key: string; label: string }[] = [];
    if (filters.difficulty) chips.push({ key: 'difficulty', label: filters.difficulty });
    if (filters.state) chips.push({ key: 'state', label: filters.state });
    if (filters.minPrice || filters.maxPrice)
      chips.push({ key: 'price', label: `₹${(filters.minPrice ?? 0).toLocaleString()}–₹${(filters.maxPrice ?? 50000).toLocaleString()}` });
    if (filters.minDays || filters.maxDays)
      chips.push({ key: 'duration', label: `${filters.minDays ?? 1}–${filters.maxDays ?? 21} days` });
    if (filters.bestSeason) chips.push({ key: 'bestSeason', label: filters.bestSeason });
    if (filters.maxAltitude) chips.push({ key: 'maxAltitude', label: `Up to ${filters.maxAltitude.toLocaleString()}m` });
    return chips;
  }, [filters]);

  const removeChip = (key: string) => {
    const next = { ...filters };
    if (key === 'price') { delete next.minPrice; delete next.maxPrice; }
    else if (key === 'duration') { delete next.minDays; delete next.maxDays; }
    else delete (next as Record<string, unknown>)[key];
    setFilters(next);
  };

  return (
    <>
      <div className="flex gap-6">
        {/* Sidebar Filters */}
        <TrekFilterPanel
          filters={filters}
          onChange={handleFilterChange}
          totalResults={filteredTreks.length}
        />

        {/* Main Content */}
        <div className="min-w-0 flex-1">
          {/* Toolbar */}
          <div className="mb-6 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search treks, destinations..."
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

              {/* Sort */}
              <div className="relative">
                <button
                  onClick={() => setSortOpen((v) => !v)}
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
                      {SORT_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => { setFilters((f) => ({ ...f, sort: opt.value as SortOption })); setSortOpen(false); }}
                          className={cn(
                            'flex w-full items-center px-4 py-2.5 text-sm transition-colors',
                            filters.sort === opt.value || (!filters.sort && opt.value === 'popular')
                              ? 'bg-brand-500/10 font-medium text-brand-600 dark:text-brand-400'
                              : 'text-foreground hover:bg-muted'
                          )}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                {sortOpen && <div className="fixed inset-0 z-20" onClick={() => setSortOpen(false)} />}
              </div>

              {/* View toggle */}
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

            {/* Active filter chips */}
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

            {/* Results count */}
            <div className="text-sm text-muted-foreground">
              Showing{' '}
              <span className="font-semibold text-foreground">
                {(currentPage - 1) * TREKS_PER_PAGE + 1}–
                {Math.min(currentPage * TREKS_PER_PAGE, filteredTreks.length)}
              </span>{' '}
              of{' '}
              <span className="font-semibold text-foreground">{filteredTreks.length}</span> treks
            </div>
          </div>

          {/* Trek Grid/List */}
          {isLoading ? (
            <TrekGridSkeleton count={TREKS_PER_PAGE} viewMode={viewMode} />
          ) : filteredTreks.length === 0 ? (
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
                {paginatedTreks.map((trek) => (
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-10">
              <TrekPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </div>

      {/* Quick View Modal */}
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
      <div className="mb-4 text-6xl">🏔️</div>
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
