'use client';

import { motion } from 'framer-motion';
import { Instagram, Users, Camera, ArrowRight } from 'lucide-react';

const COMMUNITY_STATS = [
  { icon: Users, value: '50K+', label: 'Community Members' },
  { icon: Camera, value: '200K+', label: 'Photos Shared' },
  { icon: Instagram, value: '180K', label: 'Instagram Followers' },
];

const INSTAGRAM_POSTS = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&q=75',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=300&q=75',
  'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=300&q=75',
];

export function CommunitySection() {
  return (
    <section className="relative overflow-hidden bg-background py-28">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-500/5 via-transparent to-transparent" />

      <div className="container relative">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-2 lg:items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-brand-500">
              Join the Tribe
            </span>
            <h2 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
              A Community of
              <br />
              <span className="text-brand-500">Mountain Lovers</span>
            </h2>
            <p className="mt-5 text-lg text-muted-foreground">
              Connect with 50,000+ trekkers who share your passion. Share stories, get
              advice, find trek partners, and inspire each other to go higher.
            </p>

            {/* Stats */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
              {COMMUNITY_STATS.map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="text-center">
                    <div className="mb-2 flex justify-center">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10">
                        <Icon className="h-5 w-5 text-brand-500" />
                      </div>
                    </div>
                    <div className="font-display text-2xl font-bold text-foreground">
                      {stat.value}
                    </div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                );
              })}
            </div>

            {/* CTAs */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <a
                href="/register"
                className="flex items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-600 hover:-translate-y-0.5 w-full sm:w-auto"
              >
                Join the Community
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted w-full sm:w-auto"
              >
                <Instagram className="h-4 w-4" />
                Follow on Instagram
              </a>
            </div>
          </motion.div>

          {/* Right: Instagram Grid */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="grid grid-cols-3 gap-2"
          >
            {INSTAGRAM_POSTS.map((url, i) => (
              <motion.div
                key={url}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-xl"
              >
                <img
                  src={url}
                  alt="Community post"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/30">
                  <Instagram className="h-6 w-6 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
