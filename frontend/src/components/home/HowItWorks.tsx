'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Search, CalendarCheck, Backpack, Trophy } from 'lucide-react';

const STEPS = [
  {
    step: '01',
    icon: Search,
    title: 'Discover Your Trek',
    description:
      'Browse 150+ curated treks. Filter by difficulty, duration, budget, and season. Read detailed itineraries and real reviews.',
    color: 'text-brand-400',
    bg: 'bg-brand-500/10',
    border: 'border-brand-500/20',
    connector: true,
  },
  {
    step: '02',
    icon: CalendarCheck,
    title: 'Book Instantly',
    description:
      'Select your batch date, add participants, apply a coupon, and pay securely via Razorpay or Stripe. Confirmation in seconds.',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    connector: true,
  },
  {
    step: '03',
    icon: Backpack,
    title: 'Prepare & Pack',
    description:
      'Receive a personalized packing list, fitness guide, and pre-trek briefing. Our team is available for any questions.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    connector: true,
  },
  {
    step: '04',
    icon: Trophy,
    title: 'Conquer the Summit',
    description:
      'Meet your guide, trek with your group, and experience the magic. Share your story and earn rewards for your next adventure.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
    connector: false,
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="bg-background py-28">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-16 text-center"
        >
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-brand-500">
            Simple Process
          </span>
          <h2 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            How Your Journey Works
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            From discovery to summit — we&apos;ve made every step effortless so you can focus
            on the adventure.
          </p>
        </motion.div>

        <div ref={ref} className="relative">
          {/* Connecting line (desktop) */}
          <div className="absolute left-0 right-0 top-16 hidden h-px bg-gradient-to-r from-transparent via-border to-transparent lg:block" />

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: i * 0.15 }}
                  className="relative flex flex-col items-center text-center"
                >
                  {/* Step number + icon */}
                  <div className="relative mb-6">
                    {/* Outer ring */}
                    <div
                      className={`flex h-16 w-16 items-center justify-center rounded-2xl border-2 ${
                        step.bg
                      } ${step.border} relative z-10`}
                    >
                      <Icon className={`h-7 w-7 ${step.color}`} />
                    </div>
                    {/* Step badge */}
                    <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                      {step.step}
                    </div>
                  </div>

                  <h3 className="mb-3 font-display text-lg font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <a
            href="/treks"
            className="inline-flex items-center gap-2 rounded-full bg-brand-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-600 hover:-translate-y-0.5 hover:shadow-xl"
          >
            Start Your Journey
          </a>
        </motion.div>
      </div>
    </section>
  );
}
