'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Backpack, Check, X, Package } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { SectionHeader } from './TrekPhotoGallery';

interface Props {
  items: string[];
  inclusions: string[];
  exclusions: string[];
}

export function TrekPackingChecklist({ items, inclusions, exclusions }: Props) {
  const [checked, setChecked] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'packing' | 'inclusions'>('packing');

  const toggle = (i: number) =>
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });

  const progress = items.length > 0 ? Math.round((checked.size / items.length) * 100) : 0;

  return (
    <div>
      <SectionHeader icon={Backpack} label="Preparation" title="Packing & Inclusions" />

      {/* Tabs */}
      <div className="mb-6 flex gap-2">
        {(['packing', 'inclusions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'rounded-xl px-5 py-2.5 text-sm font-medium transition-all',
              activeTab === tab
                ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                : 'border border-border bg-card text-muted-foreground hover:bg-muted'
            )}
          >
            {tab === 'packing' ? 'Packing Checklist' : 'What\'s Included'}
          </button>
        ))}
      </div>

      {activeTab === 'packing' && (
        <div>
          {/* Progress */}
          <div className="mb-5 rounded-2xl border border-border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                {checked.size} of {items.length} items packed
              </span>
              <span className="text-sm font-bold text-brand-500">{progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-brand-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            {progress === 100 && (
              <p className="mt-2 text-xs font-medium text-emerald-500">
                ✓ You\'re all packed! Have a great trek.
              </p>
            )}
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            {items.map((item, i) => (
              <motion.button
                key={item}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                onClick={() => toggle(i)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-all',
                  checked.has(i)
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-border bg-card hover:border-brand-500/30 hover:bg-muted/30'
                )}
              >
                <div className={cn(
                  'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                  checked.has(i)
                    ? 'border-emerald-500 bg-emerald-500'
                    : 'border-muted-foreground'
                )}>
                  {checked.has(i) && <Check className="h-3 w-3 text-white" />}
                </div>
                <span className={cn(
                  'text-sm transition-colors',
                  checked.has(i) ? 'text-muted-foreground line-through' : 'text-foreground'
                )}>
                  {item}
                </span>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'inclusions' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Inclusions */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
            <div className="mb-3 flex items-center gap-2">
              <Check className="h-4 w-4 text-emerald-500" />
              <span className="font-semibold text-foreground">What\'s Included</span>
            </div>
            <div className="space-y-2">
              {inclusions.map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Exclusions */}
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
            <div className="mb-3 flex items-center gap-2">
              <X className="h-4 w-4 text-red-500" />
              <span className="font-semibold text-foreground">Not Included</span>
            </div>
            <div className="space-y-2">
              {exclusions.map((item) => (
                <div key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
