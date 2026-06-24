'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import {
  Shield, Users, Award, Headphones,
  MapPin, Camera, Heart, Zap,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Shield,
    title: 'Safety First',
    description:
      'Every trek is led by certified guides with first-aid training. We carry emergency oxygen and satellite phones on all high-altitude routes.',
    color: 'from-blue-500/20 to-blue-600/10',
    iconColor: 'text-blue-400',
    border: 'border-blue-500/20',
  },
  {
    icon: Award,
    title: 'Expert Guides',
    description:
      'Our guides have 10+ years of experience and hold certifications from the Nehru Institute of Mountaineering. They know every trail intimately.',
    color: 'from-brand-500/20 to-brand-600/10',
    iconColor: 'text-brand-400',
    border: 'border-brand-500/20',
  },
  {
    icon: Users,
    title: 'Small Groups',
    description:
      'We cap group sizes at 12 to ensure a personalized experience. More attention, better safety, and deeper connections with fellow trekkers.',
    color: 'from-green-500/20 to-green-600/10',
    iconColor: 'text-green-400',
    border: 'border-green-500/20',
  },
  {
    icon: Headphones,
    title: '24/7 Support',
    description:
      'Our operations team is available round the clock. From pre-trek queries to on-trail emergencies, we\'re always just a call away.',
    color: 'from-purple-500/20 to-purple-600/10',
    iconColor: 'text-purple-400',
    border: 'border-purple-500/20',
  },
  {
    icon: MapPin,
    title: 'Exclusive Routes',
    description:
      'We\'ve spent years discovering off-the-beaten-path routes that most operators don\'t know exist. Unique experiences, guaranteed.',
    color: 'from-red-500/20 to-red-600/10',
    iconColor: 'text-red-400',
    border: 'border-red-500/20',
  },
  {
    icon: Camera,
    title: 'Memories Captured',
    description:
      'Every trek includes a dedicated photographer on select batches. Professional photos delivered within 7 days of your return.',
    color: 'from-pink-500/20 to-pink-600/10',
    iconColor: 'text-pink-400',
    border: 'border-pink-500/20',
  },
  {
    icon: Heart,
    title: 'Responsible Travel',
    description:
      'We follow Leave No Trace principles. 2% of every booking goes to local mountain communities and trail conservation efforts.',
    color: 'from-teal-500/20 to-teal-600/10',
    iconColor: 'text-teal-400',
    border: 'border-teal-500/20',
  },
  {
    icon: Zap,
    title: 'Instant Booking',
    description:
      'Book your spot in under 2 minutes. Instant confirmation, flexible cancellation up to 15 days before departure, and easy EMI options.',
    color: 'from-yellow-500/20 to-yellow-600/10',
    iconColor: 'text-yellow-400',
    border: 'border-yellow-500/20',
  },
];

export function WhyChooseUs() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="relative overflow-hidden bg-mountain-900 py-28">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-brand-500/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent" />

      <div className="container relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-16 text-center"
        >
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-brand-400">
            Why Adventure?
          </span>
          <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
            The Adventure Difference
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-mountain-300">
            We don&apos;t just organize treks. We craft transformative experiences that push your
            limits and leave you forever changed.
          </p>
        </motion.div>

        {/* Grid */}
        <div ref={ref} className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className={`group relative overflow-hidden rounded-2xl border bg-gradient-to-br p-6 transition-shadow hover:shadow-xl hover:shadow-black/20 ${
                  feature.color
                } ${feature.border}`}
              >
                {/* Glow */}
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/5 blur-2xl transition-all duration-500 group-hover:scale-150 group-hover:bg-white/10" />

                <div
                  className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 ${
                    feature.iconColor
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <h3 className="mb-2 font-display text-base font-bold text-white">
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed text-mountain-300">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
