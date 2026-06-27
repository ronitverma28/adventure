'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Calendar, TrendingUp, Clock, Wallet, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils/cn';

const DESTINATIONS = [
  'Kedarkantha', 'Roopkund', 'Hampta Pass', 'Chadar Trek',
  'Valley of Flowers', 'Brahmatal', 'Kuari Pass', 'Sandakphu',
  'Goecha La', 'Pin Parvati', 'Bali Pass', 'Rupin Pass',
];

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DIFFICULTIES = [
  { label: 'Easy', value: 'EASY', color: 'text-green-400' },
  { label: 'Moderate', value: 'MODERATE', color: 'text-yellow-400' },
  { label: 'Difficult', value: 'DIFFICULT', color: 'text-orange-400' },
  { label: 'Extreme', value: 'EXTREME', color: 'text-red-400' },
];

const DURATIONS = [
  { label: '1-3 Days', value: '1-3' },
  { label: '4-6 Days', value: '4-6' },
  { label: '7-10 Days', value: '7-10' },
  { label: '10+ Days', value: '10+' },
];

const BUDGETS = [
  { label: 'Under ₹5,000', value: '0-5000' },
  { label: '₹5K - ₹10K', value: '5000-10000' },
  { label: '₹10K - ₹20K', value: '10000-20000' },
  { label: '₹20K+', value: '20000+' },
];

type ActiveField = 'destination' | 'month' | 'difficulty' | 'duration' | 'budget' | null;

export function HeroSearchBar() {
  const router = useRouter();
  const [activeField, setActiveField] = useState<ActiveField>(null);
  const [values, setValues] = useState({
    destination: '',
    month: '',
    difficulty: '',
    duration: '',
    budget: '',
  });
  const [destInput, setDestInput] = useState('');

  const filteredDests = DESTINATIONS.filter((d) =>
    d.toLowerCase().includes(destInput.toLowerCase())
  );

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (values.destination) params.set('search', values.destination);
    if (values.month) params.set('month', values.month);
    if (values.difficulty) params.set('difficulty', values.difficulty);
    if (values.duration) params.set('duration', values.duration);
    if (values.budget) params.set('budget', values.budget);
    router.push(`/treks?${params.toString()}`);
  };

  const toggle = (field: ActiveField) =>
    setActiveField((prev) => (prev === field ? null : field));

  const FIELDS = [
    {
      key: 'destination' as const,
      icon: MapPin,
      label: 'Destination',
      placeholder: 'Where to?',
      value: values.destination || destInput,
    },
    {
      key: 'month' as const,
      icon: Calendar,
      label: 'Month',
      placeholder: 'When?',
      value: values.month,
    },
    {
      key: 'difficulty' as const,
      icon: TrendingUp,
      label: 'Difficulty',
      placeholder: 'Level?',
      value: values.difficulty,
    },
    {
      key: 'duration' as const,
      icon: Clock,
      label: 'Duration',
      placeholder: 'How long?',
      value: values.duration,
    },
    {
      key: 'budget' as const,
      icon: Wallet,
      label: 'Budget',
      placeholder: 'Budget?',
      value: values.budget,
    },
  ];

  return (
    <div className="relative">
      {/* ── Search Container ── */}
      <div className="relative overflow-visible rounded-2xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row">
          {FIELDS.map((field, idx) => {
            const Icon = field.icon;
            const isActive = activeField === field.key;
            const isLast = idx === FIELDS.length - 1;

            return (
              <div
                key={field.key}
                className={cn(
                  'relative flex-1',
                  !isLast && 'border-b border-white/10 md:border-b-0 md:border-r'
                )}
              >
                <button
                  onClick={() => toggle(field.key)}
                  className={cn(
                    'group flex w-full items-center gap-3 px-5 py-4 text-left transition-all duration-200',
                    isActive && 'bg-white/10',
                    'hover:bg-white/5'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-4 w-4 shrink-0 transition-colors',
                      isActive ? 'text-brand-400' : 'text-white/50'
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[10px] font-semibold uppercase tracking-widest text-white/50">
                      {field.label}
                    </div>
                    <div
                      className={cn(
                        'truncate text-sm font-medium transition-colors',
                        field.value ? 'text-white' : 'text-white/30'
                      )}
                    >
                      {field.value || field.placeholder}
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      'h-3.5 w-3.5 shrink-0 text-white/30 transition-transform duration-200',
                      isActive && 'rotate-180'
                    )}
                  />
                </button>

                {/* Dropdown */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.97 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-mountain-900/95 shadow-2xl backdrop-blur-xl"
                    >
                      {/* Destination has text input */}
                      {field.key === 'destination' && (
                        <div className="p-3">
                          <div className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2">
                            <Search className="h-3.5 w-3.5 text-white/40" />
                            <input
                              autoFocus
                              value={destInput}
                              onChange={(e) => setDestInput(e.target.value)}
                              placeholder="Search destination..."
                              className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
                            />
                          </div>
                          <div className="mt-2 max-h-48 overflow-y-auto">
                            {filteredDests.map((dest) => (
                              <button
                                key={dest}
                                onClick={() => {
                                  setValues((v) => ({ ...v, destination: dest }));
                                  setDestInput(dest);
                                  setActiveField(null);
                                }}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                              >
                                <MapPin className="h-3 w-3 text-brand-400" />
                                {dest}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Month picker */}
                      {field.key === 'month' && (
                        <div className="grid grid-cols-3 gap-1 p-3">
                          {MONTHS.map((month) => (
                            <button
                              key={month}
                              onClick={() => {
                                setValues((v) => ({ ...v, month }));
                                setActiveField(null);
                              }}
                              className={cn(
                                'rounded-lg px-2 py-2 text-xs font-medium transition-colors',
                                values.month === month
                                  ? 'bg-brand-500 text-white'
                                  : 'text-white/70 hover:bg-white/10 hover:text-white'
                              )}
                            >
                              {month.slice(0, 3)}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Difficulty
                      {field.key === 'difficulty' && (
                        <div className="p-2">
                          {DIFFICULTIES.map((d) => (
                            <button
                              key={d.value}
                              onClick={() => {
                                setValues((v) => ({ ...v, difficulty: d.label }));
                                setActiveField(null);
                              }}
                              className={cn(
                                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                                values.difficulty === d.label
                                  ? 'bg-white/10 text-white'
                                  : 'text-white/70 hover:bg-white/5 hover:text-white'
                              )}
                            >
                              <span className={cn('h-2 w-2 rounded-full', d.color.replace('text-', 'bg-'))} />
                              <span className={d.color}>{d.label}</span>
                            </button>
                          ))}
                        </div>
                      )} */}

                      {/* Duration */}
                      {/* {field.key === 'duration' && (
                        <div className="p-2">
                          {DURATIONS.map((d) => (
                            <button
                              key={d.value}
                              onClick={() => {
                                setValues((v) => ({ ...v, duration: d.label }));
                                setActiveField(null);
                              }}
                              className={cn(
                                'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors',
                                values.duration === d.label
                                  ? 'bg-white/10 text-white'
                                  : 'text-white/70 hover:bg-white/5 hover:text-white'
                              )}
                            >
                              <Clock className="h-3.5 w-3.5 text-brand-400" />
                              {d.label}
                            </button>
                          ))}
                        </div>
                      )} */}

                      {/* Budget */}
                      {field.key === 'budget' && (
                        <div className="p-2">
                          {BUDGETS.map((b) => (
                            <button
                              key={b.value}
                              onClick={() => {
                                setValues((v) => ({ ...v, budget: b.label }));
                                setActiveField(null);
                              }}
                              className={cn(
                                'flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors',
                                values.budget === b.label
                                  ? 'bg-white/10 text-white'
                                  : 'text-white/70 hover:bg-white/5 hover:text-white'
                              )}
                            >
                              <Wallet className="h-3.5 w-3.5 text-brand-400" />
                              {b.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Search Button */}
          <div className="flex items-center p-3">
            <button
              onClick={handleSearch}
              className="group flex h-full w-full items-center justify-center gap-2 rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all duration-300 hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/40 md:w-auto"
            >
              <Search className="h-4 w-4 transition-transform group-hover:scale-110" />
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop to close dropdowns */}
      {activeField && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActiveField(null)}
        />
      )}
    </div>
  );
}
