'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Sparkles, ChevronRight, ChevronLeft, MapPin, Calendar,
  DollarSign, Clock, Activity, Mountain, Star, AlertTriangle,
  CheckCircle2, Package, Dumbbell, ArrowRight, Loader2,
  ShieldCheck, Lightbulb, Check,
} from 'lucide-react';
import { trekApi } from '@/lib/api/trek.api';
import { generateTrekPlan } from '@/lib/services/ai-planner.service';
import { formatCurrency } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import { DIFFICULTY_CONFIG } from '@/lib/constants/trek.constants';
import type { PlannerInput, PlannerResult, TrekRecommendation } from '@/types/planner.types';
import type { ExperienceLevel, FitnessLevel } from '@/types/planner.types';
import type { Trek } from '@/types/trek.types';

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const STATES = [
  'Any','Uttarakhand','Himachal Pradesh','Ladakh','Sikkim',
  'West Bengal','Kashmir','Arunachal Pradesh',
];

const EXPERIENCE_OPTIONS: { value: ExperienceLevel; label: string; desc: string; icon: string }[] = [
  { value: 'BEGINNER',     label: 'Beginner',     desc: 'First trek or fewer than 3 treks completed', icon: '🌱' },
  { value: 'INTERMEDIATE', label: 'Intermediate', desc: '3–10 treks, comfortable with moderate terrain', icon: '🏔️' },
  { value: 'ADVANCED',     label: 'Advanced',     desc: '10+ treks, high-altitude experience', icon: '⛰️' },
];

const FITNESS_OPTIONS: { value: FitnessLevel; label: string; desc: string; icon: string }[] = [
  { value: 'LOW',      label: 'Low',      desc: 'Mostly sedentary, occasional walks', icon: '🚶' },
  { value: 'MODERATE', label: 'Moderate', desc: 'Regular walks, some gym activity', icon: '🏃' },
  { value: 'HIGH',     label: 'High',     desc: 'Regular running or gym, 5+ days/week', icon: '💪' },
  { value: 'ATHLETE',  label: 'Athlete',  desc: 'Competitive sports or endurance training', icon: '🏅' },
];

const STEPS = [
  { id: 1, label: 'Experience',  icon: Mountain },
  { id: 2, label: 'Budget',      icon: DollarSign },
  { id: 3, label: 'Schedule',    icon: Calendar },
  { id: 4, label: 'Fitness',     icon: Activity },
  { id: 5, label: 'Location',    icon: MapPin },
] as const;

const DEFAULT_INPUT: PlannerInput = {
  experience: 'BEGINNER',
  budget: 12000,
  availableDays: 6,
  month: MONTHS[new Date().getMonth()],
  fitnessLevel: 'MODERATE',
  locationPreference: 'Any',
};

// ─── Score badge ──────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-brand-500' : 'bg-amber-500';
  const label = score >= 80 ? 'Excellent Match' : score >= 60 ? 'Good Match' : 'Partial Match';
  return (
    <div className={cn('flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white', color)}>
      <Sparkles className="h-3 w-3" />
      {score}% — {label}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PlannerClient() {
  const [treks, setTreks] = useState<Trek[]>([]);
  const [step, setStep]       = useState(1);
  const [input, setInput]     = useState<PlannerInput>(DEFAULT_INPUT);
  const [result, setResult]   = useState<PlannerResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<TrekRecommendation | null>(null);

  useEffect(() => {
    let active = true;

    async function loadTreks() {
      try {
        const response = await trekApi.getAll(undefined, 0, 100);
        if (active) setTreks(response.data.data.content);
      } catch {
        if (active) setTreks([]);
      }
    }

    loadTreks();
    return () => {
      active = false;
    };
  }, []);

  const update = (patch: Partial<PlannerInput>) => setInput((p) => ({ ...p, ...patch }));

  const handleGenerate = async () => {
    if (treks.length === 0) return;
    setLoading(true);
    // Simulate AI thinking delay for UX
    await new Promise((r) => setTimeout(r, 1400));
    const plan = generateTrekPlan(treks, input);
    setResult(plan);
    setSelected(plan.recommendations[0] ?? null);
    setLoading(false);
  };

  const reset = () => {
    setResult(null);
    setSelected(null);
    setStep(1);
    setInput(DEFAULT_INPUT);
  };

  if (loading) {
    return (
      <section className="flex min-h-[80vh] flex-col items-center justify-center gap-6 bg-background px-4">
        <div className="relative">
          <div className="h-20 w-20 animate-spin rounded-full border-4 border-brand-500/20 border-t-brand-500" />
          <Brain className="absolute inset-0 m-auto h-8 w-8 text-brand-500" />
        </div>
        <div className="text-center">
          <h2 className="font-display text-2xl font-bold text-foreground">Analysing your profile…</h2>
          <p className="mt-2 text-muted-foreground">Matching 12 treks against your experience, budget, and schedule</p>
        </div>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground">
          {['Evaluating difficulty fit', 'Checking seasonal conditions', 'Calculating budget match', 'Building preparation plan'].map((t, i) => (
            <motion.div
              key={t}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.3 }}
              className="flex items-center gap-2"
            >
              <Loader2 className="h-3.5 w-3.5 animate-spin text-brand-500" />
              {t}
            </motion.div>
          ))}
        </div>
      </section>
    );
  }

  if (result) {
    return <ResultsView result={result} selected={selected} onSelect={setSelected} onReset={reset} />;
  }

  return (
    <section className="min-h-screen bg-background pt-16">
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-500/10 via-background to-emerald-500/10 py-12">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-sm font-semibold text-brand-600">
            <Brain className="h-4 w-4" /> AI-Powered Trek Planner
          </div>
          <h1 className="mt-4 font-display text-4xl font-bold text-foreground sm:text-5xl">
            Find Your Perfect Trek
          </h1>
          <p className="mt-3 text-lg text-muted-foreground">
            Answer 5 quick questions and our AI will recommend the best treks for your experience, budget, and schedule — with a personalised preparation plan.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Step progress */}
        <div className="mb-8 flex items-center justify-between">
          {STEPS.map(({ id, label, icon: Icon }, idx) => (
            <div key={id} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-1">
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                  step > id  ? 'border-emerald-500 bg-emerald-500 text-white'
                  : step === id ? 'border-brand-500 bg-brand-500 text-white'
                  : 'border-border bg-background text-muted-foreground'
                )}>
                  {step > id ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <span className={cn('hidden text-xs font-medium sm:block', step === id ? 'text-brand-500' : 'text-muted-foreground')}>
                  {label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className={cn('mx-1 h-0.5 flex-1 transition-colors', step > id ? 'bg-emerald-500' : 'bg-border')} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            {/* Step 1 — Experience */}
            {step === 1 && (
              <div>
                <StepHeader icon={Mountain} title="What is your trekking experience?" desc="This helps us match the right difficulty level for you." />
                <div className="mt-6 grid gap-3">
                  {EXPERIENCE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => update({ experience: opt.value })}
                      className={cn(
                        'flex items-center gap-4 rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md',
                        input.experience === opt.value
                          ? 'border-brand-500 bg-brand-500/5 ring-2 ring-brand-500/20'
                          : 'border-border bg-background'
                      )}
                    >
                      <span className="text-3xl">{opt.icon}</span>
                      <div>
                        <div className="font-semibold text-foreground">{opt.label}</div>
                        <div className="mt-0.5 text-sm text-muted-foreground">{opt.desc}</div>
                      </div>
                      {input.experience === opt.value && (
                        <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-brand-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2 — Budget */}
            {step === 2 && (
              <div>
                <StepHeader icon={DollarSign} title="What is your budget per person?" desc="Include trek fee only. Travel to base camp is separate." />
                <div className="mt-6">
                  <div className="mb-4 text-center">
                    <span className="font-display text-4xl font-bold text-brand-500">
                      {formatCurrency(input.budget)}
                    </span>
                    <span className="ml-2 text-sm text-muted-foreground">per person</span>
                  </div>
                  <input
                    type="range"
                    min={5000} max={30000} step={500}
                    value={input.budget}
                    onChange={(e) => update({ budget: Number(e.target.value) })}
                    className="w-full accent-brand-500"
                  />
                  <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                    <span>₹5,000</span><span>₹30,000</span>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {[8000, 12000, 20000].map((b) => (
                      <button
                        key={b}
                        onClick={() => update({ budget: b })}
                        className={cn(
                          'rounded-xl border py-2.5 text-sm font-semibold transition-colors',
                          input.budget === b ? 'border-brand-500 bg-brand-500 text-white' : 'border-border hover:bg-muted'
                        )}
                      >
                        {formatCurrency(b)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — Schedule */}
            {step === 3 && (
              <div>
                <StepHeader icon={Calendar} title="When can you go trekking?" desc="Select your available days and preferred month." />
                <div className="mt-6 space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Available Days</label>
                    <div className="mb-2 text-center">
                      <span className="font-display text-4xl font-bold text-brand-500">{input.availableDays}</span>
                      <span className="ml-2 text-sm text-muted-foreground">days</span>
                    </div>
                    <input
                      type="range" min={3} max={15} step={1}
                      value={input.availableDays}
                      onChange={(e) => update({ availableDays: Number(e.target.value) })}
                      className="w-full accent-brand-500"
                    />
                    <div className="mt-1 flex justify-between text-xs text-muted-foreground">
                      <span>3 days</span><span>15 days</span>
                    </div>
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-foreground">Preferred Month</label>
                    <div className="grid grid-cols-4 gap-2">
                      {MONTHS.map((m) => (
                        <button
                          key={m}
                          onClick={() => update({ month: m })}
                          className={cn(
                            'rounded-xl border py-2 text-xs font-semibold transition-colors',
                            input.month === m ? 'border-brand-500 bg-brand-500 text-white' : 'border-border hover:bg-muted'
                          )}
                        >
                          {m.slice(0, 3)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 — Fitness */}
            {step === 4 && (
              <div>
                <StepHeader icon={Activity} title="What is your current fitness level?" desc="Be honest — this ensures we recommend safe treks for you." />
                <div className="mt-6 grid gap-3">
                  {FITNESS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => update({ fitnessLevel: opt.value })}
                      className={cn(
                        'flex items-center gap-4 rounded-xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-md',
                        input.fitnessLevel === opt.value
                          ? 'border-brand-500 bg-brand-500/5 ring-2 ring-brand-500/20'
                          : 'border-border bg-background'
                      )}
                    >
                      <span className="text-3xl">{opt.icon}</span>
                      <div>
                        <div className="font-semibold text-foreground">{opt.label}</div>
                        <div className="mt-0.5 text-sm text-muted-foreground">{opt.desc}</div>
                      </div>
                      {input.fitnessLevel === opt.value && (
                        <CheckCircle2 className="ml-auto h-5 w-5 shrink-0 text-brand-500" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5 — Location */}
            {step === 5 && (
              <div>
                <StepHeader icon={MapPin} title="Any location preference?" desc="Select a state or choose Any to explore all regions." />
                <div className="mt-6 grid grid-cols-2 gap-3">
                  {STATES.map((s) => (
                    <button
                      key={s}
                      onClick={() => update({ locationPreference: s })}
                      className={cn(
                        'rounded-xl border px-4 py-3 text-sm font-semibold transition-all hover:-translate-y-0.5',
                        input.locationPreference === s
                          ? 'border-brand-500 bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                          : 'border-border bg-background hover:bg-muted'
                      )}
                    >
                      {s === 'Any' ? '🌏 Any Region' : s}
                    </button>
                  ))}
                </div>

                {/* Summary */}
                <div className="mt-6 rounded-xl border border-border bg-muted/50 p-4">
                  <h3 className="mb-3 text-sm font-bold text-foreground">Your Profile Summary</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {[
                      { label: 'Experience', value: input.experience.charAt(0) + input.experience.slice(1).toLowerCase() },
                      { label: 'Budget', value: formatCurrency(input.budget) },
                      { label: 'Days', value: `${input.availableDays} days` },
                      { label: 'Month', value: input.month },
                      { label: 'Fitness', value: input.fitnessLevel.charAt(0) + input.fitnessLevel.slice(1).toLowerCase() },
                      { label: 'Region', value: input.locationPreference },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between gap-2">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-semibold text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
              <button
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
                className="flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>

              {step < 5 ? (
                <button
                  onClick={() => setStep((s) => Math.min(5, s + 1))}
                  className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  onClick={handleGenerate}
                  className="flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600"
                >
                  <Brain className="h-4 w-4" /> Generate My Plan
                </button>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

// ─── Results view ─────────────────────────────────────────────────────────────

function ResultsView({
  result, selected, onSelect, onReset,
}: {
  result: PlannerResult;
  selected: TrekRecommendation | null;
  onSelect: (r: TrekRecommendation) => void;
  onReset: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'reasons' | 'prep' | 'packing'>('reasons');

  return (
    <section className="min-h-screen bg-background pt-24 pb-8">
      <div className="mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-600">
              <Sparkles className="h-3.5 w-3.5" /> AI Recommendations Ready
            </div>
            <h1 className="mt-2 font-display text-3xl font-bold text-foreground">Your Trek Plan</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {result.recommendations.length} treks matched · {result.input.month} · {result.input.availableDays} days · {formatCurrency(result.input.budget)} budget
            </p>
          </div>
          <button
            onClick={onReset}
            className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
          >
            <Brain className="h-4 w-4" /> Replan
          </button>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
          {/* Trek list */}
          <aside className="space-y-3">
            {result.recommendations.map((rec, idx) => (
              <button
                key={rec.trek.id}
                onClick={() => { onSelect(rec); setActiveTab('reasons'); }}
                className={cn(
                  'w-full overflow-hidden rounded-2xl border text-left transition-all hover:shadow-md',
                  selected?.trek.id === rec.trek.id
                    ? 'border-brand-500 ring-2 ring-brand-500/20'
                    : 'border-border bg-card'
                )}
              >
                <div className="relative">
                  <img
                    src={rec.trek.coverImageUrl}
                    alt={rec.trek.title}
                    className="h-28 w-full object-cover"
                  />
                  <div className="absolute left-2 top-2">
                    <span className="rounded-full bg-black/60 px-2 py-0.5 text-xs font-bold text-white">#{idx + 1}</span>
                  </div>
                  <div className="absolute right-2 top-2">
                    <ScoreBadge score={rec.score} />
                  </div>
                </div>
                <div className="p-3">
                  <div className="font-semibold text-foreground">{rec.trek.title}</div>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{rec.trek.location}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{rec.trek.durationDays}D</span>
                    <span className={cn('rounded-full px-2 py-0.5 font-semibold', DIFFICULTY_CONFIG[rec.trek.difficulty].bg, DIFFICULTY_CONFIG[rec.trek.difficulty].color)}>
                      {DIFFICULTY_CONFIG[rec.trek.difficulty].label}
                    </span>
                  </div>
                  <div className="mt-2 font-display text-base font-bold text-brand-500">
                    {formatCurrency(rec.trek.pricePerPerson)}
                  </div>
                </div>
              </button>
            ))}
          </aside>

          {/* Detail panel */}
          {selected && (
            <motion.div
              key={selected.trek.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Trek hero */}
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <img src={selected.trek.coverImageUrl} alt={selected.trek.title} className="h-52 w-full object-cover" />
                <div className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-2xl font-bold text-foreground">{selected.trek.title}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{selected.trek.shortDescription}</p>
                    </div>
                    <ScoreBadge score={selected.score} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm">
                    <span className="flex items-center gap-1.5 rounded-xl bg-muted px-3 py-1.5">
                      <MapPin className="h-3.5 w-3.5 text-brand-500" />{selected.trek.location}
                    </span>
                    <span className="flex items-center gap-1.5 rounded-xl bg-muted px-3 py-1.5">
                      <Clock className="h-3.5 w-3.5 text-brand-500" />{selected.trek.durationDays}D / {selected.trek.durationNights}N
                    </span>
                    <span className="flex items-center gap-1.5 rounded-xl bg-muted px-3 py-1.5">
                      <Star className="h-3.5 w-3.5 text-amber-400" />{selected.trek.avgRating} ({selected.trek.totalReviews.toLocaleString()})
                    </span>
                    <span className={cn('flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-semibold', DIFFICULTY_CONFIG[selected.trek.difficulty].bg, DIFFICULTY_CONFIG[selected.trek.difficulty].color)}>
                      {DIFFICULTY_CONFIG[selected.trek.difficulty].label}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={`/treks/${selected.trek.slug}`}
                      className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
                    >
                      View Trek Details <ArrowRight className="h-4 w-4" />
                    </Link>
                    <Link
                      href={`/bookings/new?trek=${selected.trek.slug}`}
                      className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600"
                    >
                      Book This Trek <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="flex border-b border-border">
                  {([
                    { key: 'reasons', label: 'Why This Trek', icon: Lightbulb },
                    { key: 'prep',    label: 'Preparation Plan', icon: Dumbbell },
                    { key: 'packing', label: 'Packing List', icon: Package },
                  ] as const).map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setActiveTab(key)}
                      className={cn(
                        'flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-semibold transition-colors',
                        activeTab === key
                          ? 'border-b-2 border-brand-500 text-brand-500'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:block">{label}</span>
                    </button>
                  ))}
                </div>

                <div className="p-5">
                  {/* Reasons tab */}
                  {activeTab === 'reasons' && (
                    <div className="space-y-5">
                      <div>
                        <h3 className="mb-3 font-semibold text-foreground">Why we recommend this trek</h3>
                        <div className="space-y-2">
                          {selected.matchReasons.map((r, i) => (
                            <div key={i} className="flex items-start gap-3 rounded-xl bg-emerald-500/5 p-3">
                              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                              <span className="text-sm text-foreground">{r}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      {selected.warnings.length > 0 && (
                        <div>
                          <h3 className="mb-3 font-semibold text-foreground">Things to be aware of</h3>
                          <div className="space-y-2">
                            {selected.warnings.map((w, i) => (
                              <div key={i} className="flex items-start gap-3 rounded-xl bg-amber-500/5 p-3">
                                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
                                <span className="text-sm text-foreground">{w}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {selected.trek.highlights && (
                        <div>
                          <h3 className="mb-3 font-semibold text-foreground">Trek Highlights</h3>
                          <div className="grid gap-2 sm:grid-cols-2">
                            {selected.trek.highlights.map((h, i) => (
                              <div key={i} className="flex items-center gap-2 text-sm">
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                                {h}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Preparation tab */}
                  {activeTab === 'prep' && (
                    <div>
                      <div className="mb-5 flex items-center gap-3 rounded-xl bg-brand-500/10 p-4">
                        <ShieldCheck className="h-6 w-6 shrink-0 text-brand-500" />
                        <div>
                          <div className="font-semibold text-foreground">Start preparing {selected.preparationPlan.weeksNeeded} weeks before your trek</div>
                          <div className="text-sm text-muted-foreground">Follow this plan to be fully ready on day one</div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {selected.preparationPlan.phases.map((phase, idx) => (
                          <div key={idx} className="rounded-xl border border-border p-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white">
                                {idx + 1}
                              </div>
                              <div>
                                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{phase.week}</div>
                                <div className="font-semibold text-foreground">{phase.title}</div>
                              </div>
                            </div>
                            <ul className="mt-3 space-y-1.5 pl-11">
                              {phase.tasks.map((task, ti) => (
                                <li key={ti} className="flex items-start gap-2 text-sm text-muted-foreground">
                                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                                  {task}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Packing tab */}
                  {activeTab === 'packing' && (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Personalised for <strong>{selected.trek.title}</strong> in <strong>{result.input.month}</strong>.
                        Essential items are marked with a badge.
                      </p>
                      {selected.packingList.map((cat) => (
                        <div key={cat.category} className="rounded-xl border border-border">
                          <div className="border-b border-border px-4 py-2.5">
                            <h4 className="font-semibold text-foreground">{cat.category}</h4>
                          </div>
                          <div className="divide-y divide-border">
                            {cat.items.map((item, i) => (
                              <div key={i} className="flex items-start justify-between gap-3 px-4 py-2.5">
                                <div>
                                  <span className="text-sm text-foreground">{item.name}</span>
                                  {item.note && (
                                    <span className="ml-2 text-xs text-muted-foreground">({item.note})</span>
                                  )}
                                </div>
                                {item.essential && (
                                  <span className="shrink-0 rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-600">Essential</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function StepHeader({ icon: Icon, title, desc }: { icon: React.ElementType; title: string; desc: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500/10">
        <Icon className="h-5 w-5 text-brand-500" />
      </div>
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </div>
    </div>
  );
}
