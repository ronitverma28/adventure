'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SlidersHorizontal, X, ChevronDown, RotateCcw,
  TrendingUp, MapPin, Clock, Wallet, Thermometer, Mountain,
} from 'lucide-react';
import { TrekFilters, DifficultyLevel } from '@/types/trek.types';
import {
  DIFFICULTY_CONFIG, SORT_OPTIONS, STATES, SEASONS,
  PRICE_RANGE, DURATION_RANGE, ALTITUDE_RANGE,
} from '@/lib/constants/trek.constants';
import { formatCurrency } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';

interface TrekFiltersProps {
  filters: TrekFilters;
  onChange: (filters: TrekFilters) => void;
  totalResults: number;
}

export function TrekFilterPanel({ filters, onChange, totalResults }: TrekFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['difficulty', 'price']);

  const toggleSection = (key: string) =>
    setExpandedSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );

  const update = useCallback(
    (patch: Partial<TrekFilters>) => onChange({ ...filters, ...patch }),
    [filters, onChange]
  );

  const reset = () => onChange({});

  const activeCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== '' && v !== null
  ).length;

  const FilterSection = ({
    id, label, icon: Icon, children,
  }: { id: string; label: string; icon: React.ElementType; children: React.ReactNode }) => (
    <div className="border-b border-border">
      <button
        onClick={() => toggleSection(id)}
        className="flex w-full items-center justify-between px-5 py-4 text-sm font-semibold text-foreground hover:bg-muted/50"
      >
        <span className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-brand-500" />
          {label}
        </span>
        <ChevronDown
          className={cn(
            'h-4 w-4 text-muted-foreground transition-transform',
            expandedSections.includes(id) && 'rotate-180'
          )}
        />
      </button>
      <AnimatePresence>
        {expandedSections.includes(id) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const filterContent = (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-brand-500" />
          <span className="font-semibold text-foreground">Filters</span>
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button
              onClick={reset}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3 w-3" />
              Reset
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-lg hover:bg-muted md:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Results count */}
      <div className="border-b border-border px-5 py-3">
        <span className="text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">{totalResults}</span> treks found
        </span>
      </div>

      {/* Difficulty
      <FilterSection id="difficulty" label="Difficulty" icon={TrendingUp}>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(DIFFICULTY_CONFIG) as DifficultyLevel[]).map((level) => {
            const cfg = DIFFICULTY_CONFIG[level];
            const isActive = filters.difficulty === level;
            return (
              <button
                key={level}
                onClick={() => update({ difficulty: isActive ? undefined : level })}
                className={cn(
                  'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all',
                  isActive
                    ? `${cfg.bg} ${cfg.border} ${cfg.color}`
                    : 'border-border text-muted-foreground hover:border-brand-500/30 hover:bg-muted'
                )}
              >
                <span className={cn('h-2 w-2 rounded-full', cfg.dot)} />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </FilterSection> */}

      {/* State */}
      <FilterSection id="state" label="Destination" icon={MapPin}>
        <div className="space-y-1">
          {STATES.map((state) => (
            <button
              key={state}
              onClick={() => update({ state: filters.state === state ? undefined : state })}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                filters.state === state
                  ? 'bg-brand-500/10 font-medium text-brand-600 dark:text-brand-400'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {state}
              {filters.state === state && (
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
              )}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection id="price" label="Budget" icon={Wallet}>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Min: {formatCurrency(filters.minPrice ?? PRICE_RANGE.min)}</span>
            <span className="text-muted-foreground">Max: {formatCurrency(filters.maxPrice ?? PRICE_RANGE.max)}</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-[10px] text-muted-foreground">Minimum Price</label>
              <input
                type="range"
                min={PRICE_RANGE.min}
                max={PRICE_RANGE.max}
                step={PRICE_RANGE.step}
                value={filters.minPrice ?? PRICE_RANGE.min}
                onChange={(e) => update({ minPrice: Number(e.target.value) })}
                className="w-full accent-brand-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-[10px] text-muted-foreground">Maximum Price</label>
              <input
                type="range"
                min={PRICE_RANGE.min}
                max={PRICE_RANGE.max}
                step={PRICE_RANGE.step}
                value={filters.maxPrice ?? PRICE_RANGE.max}
                onChange={(e) => update({ maxPrice: Number(e.target.value) })}
                className="w-full accent-brand-500"
              />
            </div>
          </div>
          {/* Quick budget presets */}
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: 'Under ₹10K', min: 0, max: 10000 },
              { label: '₹10K–20K', min: 10000, max: 20000 },
              { label: '₹20K–30K', min: 20000, max: 30000 },
              { label: '₹30K+', min: 30000, max: 50000 },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => update({ minPrice: preset.min, maxPrice: preset.max })}
                className={cn(
                  'rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors',
                  filters.minPrice === preset.min && filters.maxPrice === preset.max
                    ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                    : 'border-border text-muted-foreground hover:border-brand-500/30'
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
      </FilterSection>

      {/* Duration */}
      <FilterSection id="duration" label="Duration" icon={Clock}>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{filters.minDays ?? DURATION_RANGE.min} days</span>
            <span className="text-muted-foreground">{filters.maxDays ?? DURATION_RANGE.max} days</span>
          </div>
          <input
            type="range"
            min={DURATION_RANGE.min}
            max={DURATION_RANGE.max}
            step={1}
            value={filters.maxDays ?? DURATION_RANGE.max}
            onChange={(e) => update({ maxDays: Number(e.target.value) })}
            className="w-full accent-brand-500"
          />
          <div className="grid grid-cols-2 gap-1.5">
            {[
              { label: '1–3 Days', min: 1, max: 3 },
              { label: '4–6 Days', min: 4, max: 6 },
              { label: '7–10 Days', min: 7, max: 10 },
              { label: '10+ Days', min: 10, max: 21 },
            ].map((p) => (
              <button
                key={p.label}
                onClick={() => update({ minDays: p.min, maxDays: p.max })}
                className={cn(
                  'rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors',
                  filters.minDays === p.min && filters.maxDays === p.max
                    ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                    : 'border-border text-muted-foreground hover:border-brand-500/30'
                )}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </FilterSection>

      {/* Season */}
      <FilterSection id="season" label="Best Season" icon={Thermometer}>
        <div className="grid grid-cols-3 gap-1.5">
          {SEASONS.map((month) => (
            <button
              key={month}
              onClick={() => update({ bestSeason: filters.bestSeason === month ? undefined : month })}
              className={cn(
                'rounded-lg border px-2 py-1.5 text-[11px] font-medium transition-colors',
                filters.bestSeason === month
                  ? 'border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400'
                  : 'border-border text-muted-foreground hover:border-brand-500/30'
              )}
            >
              {month.slice(0, 3)}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Altitude */}
      <FilterSection id="altitude" label="Max Altitude" icon={Mountain}>
        <div className="space-y-3">
          <div className="text-center">
            <span className="font-semibold text-foreground">
              Up to {(filters.maxAltitude ?? ALTITUDE_RANGE.max).toLocaleString()}m
            </span>
          </div>
          <input
            type="range"
            min={ALTITUDE_RANGE.min}
            max={ALTITUDE_RANGE.max}
            step={ALTITUDE_RANGE.step}
            value={filters.maxAltitude ?? ALTITUDE_RANGE.max}
            onChange={(e) => update({ maxAltitude: Number(e.target.value) })}
            className="w-full accent-brand-500"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>1,000m</span>
            <span>7,000m</span>
          </div>
        </div>
      </FilterSection>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden w-72 shrink-0 overflow-hidden rounded-2xl border border-border bg-card shadow-sm lg:block">
        {filterContent}
      </aside>

      {/* Mobile: Filter button + drawer */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground shadow-sm"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </button>

        {/* Mobile drawer */}
        <AnimatePresence>
          {isOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-40 bg-black/50"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto bg-background shadow-2xl"
              >
                {filterContent}
                <div className="sticky bottom-0 border-t border-border bg-background p-4">
                  <button
                    onClick={() => setIsOpen(false)}
                    className="w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white"
                  >
                    Show {totalResults} Treks
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
