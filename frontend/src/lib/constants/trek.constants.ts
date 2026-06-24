import { DifficultyLevel } from '@/types/trek.types';

export const DIFFICULTY_CONFIG: Record<
  DifficultyLevel,
  { label: string; color: string; bg: string; border: string; dot: string }
> = {
  EASY: {
    label: 'Easy',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-500/10',
    border: 'border-emerald-200 dark:border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
  MODERATE: {
    label: 'Moderate',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-500/10',
    border: 'border-amber-200 dark:border-amber-500/30',
    dot: 'bg-amber-500',
  },
  DIFFICULT: {
    label: 'Difficult',
    color: 'text-orange-600 dark:text-orange-400',
    bg: 'bg-orange-50 dark:bg-orange-500/10',
    border: 'border-orange-200 dark:border-orange-500/30',
    dot: 'bg-orange-500',
  },
  EXTREME: {
    label: 'Extreme',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-500/10',
    border: 'border-red-200 dark:border-red-500/30',
    dot: 'bg-red-500',
  },
};

export const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'duration_asc', label: 'Duration: Short First' },
  { value: 'duration_desc', label: 'Duration: Long First' },
  { value: 'newest', label: 'Newest First' },
] as const;

export const SEASONS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const STATES = [
  'Uttarakhand', 'Himachal Pradesh', 'Ladakh', 'Sikkim',
  'West Bengal', 'Kashmir', 'Arunachal Pradesh', 'Manipur',
];

export const PRICE_RANGE = { min: 0, max: 50000, step: 500 };
export const DURATION_RANGE = { min: 1, max: 21, step: 1 };
export const ALTITUDE_RANGE = { min: 1000, max: 7000, step: 100 };
export const TREKS_PER_PAGE = 12;
