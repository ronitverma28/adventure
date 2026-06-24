'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { SectionHeader } from './TrekPhotoGallery';

interface Props {
  faqs: { question: string; answer: string }[];
}

export function TrekFAQSection({ faqs }: Props) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div>
      <SectionHeader icon={HelpCircle} label="FAQ" title="Frequently Asked Questions" />

      <div className="mt-6 space-y-3">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className={cn(
              'overflow-hidden rounded-2xl border transition-all',
              open === i ? 'border-brand-500/30 shadow-sm' : 'border-border'
            )}
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="font-medium text-foreground">{faq.question}</span>
              <span className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors',
                open === i ? 'bg-brand-500 text-white' : 'bg-muted text-muted-foreground'
              )}>
                {open === i ? <Minus className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
              </span>
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <div className="border-t border-border px-5 pb-5 pt-4">
                    <p className="text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
