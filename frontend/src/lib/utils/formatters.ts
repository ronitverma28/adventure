import { format, formatDistanceToNow } from 'date-fns';

export const formatCurrency = (amount: number, currency = 'INR'): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string | Date, pattern = 'dd MMM yyyy'): string => {
  return format(new Date(date), pattern);
};

export const formatRelativeTime = (date: string | Date): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const formatDuration = (days: number, nights: number): string => {
  return `${days}D / ${nights}N`;
};

export const formatAltitude = (meters: number): string => {
  return `${meters.toLocaleString('en-IN')} m`;
};

export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.slice(0, length).trimEnd() + '...';
};
