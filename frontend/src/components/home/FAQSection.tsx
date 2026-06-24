'use client';

import { useState, useRef } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const FAQS = [
  {
    category: 'Booking',
    items: [
      {
        q: 'How do I book a trek?',
        a: 'Browse our trek catalog, select your preferred trek and batch date, fill in participant details, apply any coupon code, and pay securely via Razorpay or Stripe. You\'ll receive an instant confirmation email with your booking reference.',
      },
      {
        q: 'What is the cancellation policy?',
        a: 'Cancel 30+ days before: 90% refund. 15-29 days: 50% refund. 7-14 days: 25% refund. Less than 7 days: no refund. All refunds are processed within 5-7 business days to your original payment method.',
      },
      {
        q: 'Can I pay in installments (EMI)?',
        a: 'Yes! We offer 3, 6, and 12-month EMI options through major credit cards and Razorpay. No-cost EMI is available on select treks for orders above ₹10,000.',
      },
    ],
  },
  {
    category: 'Preparation',
    items: [
      {
        q: 'What fitness level is required?',
        a: 'It depends on the trek difficulty. Easy treks require basic fitness (30-min daily walks). Moderate treks need 3-4 months of cardio training. Difficult and Extreme treks require 6+ months of dedicated preparation including running, cycling, and strength training.',
      },
      {
        q: 'What gear do I need to bring?',
        a: 'After booking, you\'ll receive a detailed, trek-specific packing list. We provide sleeping bags, tents, and common camping equipment. You\'ll need personal clothing, trekking shoes, and basic toiletries. Gear rental is available at our base camps.',
      },
      {
        q: 'Are there age restrictions?',
        a: 'Minimum age is 12 years for Easy treks (with guardian), 16 for Moderate, and 18 for Difficult/Extreme. Maximum age is 65 for Easy/Moderate and 55 for Difficult/Extreme, subject to a medical fitness certificate.',
      },
    ],
  },
  {
    category: 'On Trek',
    items: [
      {
        q: 'What food is provided during the trek?',
        a: 'All meals are included from Day 1 dinner to last day breakfast. We serve nutritious, high-energy meals including hot breakfast, packed lunch, and a warm dinner. Vegetarian and vegan options are always available. Special dietary requirements can be accommodated with advance notice.',
      },
      {
        q: 'What happens in case of a medical emergency?',
        a: 'All our guides are Wilderness First Responder certified. We carry emergency oxygen cylinders, first-aid kits, and satellite phones on all high-altitude treks. We have evacuation protocols and partnerships with helicopter rescue services in all major trekking regions.',
      },
      {
        q: 'Is there mobile network connectivity on treks?',
        a: 'Mobile connectivity varies by region. Most Uttarakhand and Himachal treks have BSNL coverage at base camps. Ladakh and remote treks may have no connectivity. We provide satellite communication devices for emergencies on all treks above 4000m.',
      },
    ],
  },
];

export function FAQSection() {
  const [activeCategory, setActiveCategory] = useState('Booking');
  const [openItem, setOpenItem] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const currentFAQs = FAQS.find((f) => f.category === activeCategory)?.items ?? [];

  return (
    <section className="bg-muted/30 py-28">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-14 text-center"
        >
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-brand-500">
            Got Questions?
          </span>
          <h2 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Frequently Asked
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Everything you need to know before your first step on the trail.
          </p>
        </motion.div>

        <div ref={ref} className="mx-auto max-w-3xl">
          {/* Category Tabs */}
          <div className="mb-8 flex justify-center gap-2">
            {FAQS.map((cat) => (
              <button
                key={cat.category}
                onClick={() => {
                  setActiveCategory(cat.category);
                  setOpenItem(null);
                }}
                className={cn(
                  'rounded-full px-5 py-2 text-sm font-medium transition-all duration-200',
                  activeCategory === cat.category
                    ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30'
                    : 'bg-background text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {cat.category}
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {currentFAQs.map((item, i) => {
                const key = `${activeCategory}-${i}`;
                const isOpen = openItem === key;

                return (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    className={cn(
                      'overflow-hidden rounded-2xl border bg-background transition-all duration-200',
                      isOpen ? 'border-brand-500/30 shadow-md' : 'border-border'
                    )}
                  >
                    <button
                      onClick={() => setOpenItem(isOpen ? null : key)}
                      className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                    >
                      <span className="font-medium text-foreground">{item.q}</span>
                      <span
                        className={cn(
                          'flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition-colors',
                          isOpen
                            ? 'bg-brand-500 text-white'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {isOpen ? (
                          <Minus className="h-3.5 w-3.5" />
                        ) : (
                          <Plus className="h-3.5 w-3.5" />
                        )}
                      </span>
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: 'easeInOut' }}
                        >
                          <div className="border-t border-border px-6 pb-5 pt-4">
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              {item.a}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>

          {/* Still have questions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-12 rounded-2xl border border-brand-500/20 bg-brand-500/5 p-8 text-center"
          >
            <h3 className="font-display text-xl font-bold text-foreground">
              Still have questions?
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Our team is available 9 AM – 9 PM, 7 days a week.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <a
                href="/contact"
                className="rounded-full bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-600"
              >
                Contact Us
              </a>
              <a
                href="https://wa.me/919876543210"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-green-500/30 bg-green-500/10 px-6 py-2.5 text-sm font-semibold text-green-600 transition-all hover:bg-green-500/20 dark:text-green-400"
              >
                WhatsApp Us
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
