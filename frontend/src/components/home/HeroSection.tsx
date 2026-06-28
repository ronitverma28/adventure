'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ChevronDown, Play, Star } from 'lucide-react';
import { HeroSearchBar } from './HeroSearchBar';
import { cn } from '@/lib/utils/cn';

const HERO_STATS = [
  { value: '150+', label: 'Curated Treks' },
  { value: '50K+', label: 'Happy Trekkers' },
  { value: '4.9★', label: 'Average Rating' },
  { value: '10+', label: 'Years of Excellence' },
];

const BG_SLIDES = [
  {
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&q=85',
    location: 'Roopkund Trek, Uttarakhand',
  },
  {
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=85',
    location: 'Kedarkantha, Uttarakhand',
  },
  {
    url: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=1920&q=85',
    location: 'Hampta Pass, Himachal Pradesh',
  },
  {
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1920&q=85',
    location: 'Chadar Trek, Ladakh',
  },
];

export function HeroSection() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  });

  const y = useTransform(scrollYProgress, [0, 1], ['0%', '40%']);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  // Auto-advance slides
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BG_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative h-screen min-h-[700px] bg-mountain-900"
    >
      {/* ── Background layers wrapped in overflow-hidden so parallax stays clipped ── */}
      <div className="absolute inset-0 overflow-hidden">
        {/* ── Parallax Background Slides ── */}
        <motion.div
          style={{ y, scale }}
          className="absolute inset-0 will-change-transform"
        >
          <AnimatePresence mode="sync">
            {BG_SLIDES.map((slide, i) =>
              i === currentSlide ? (
                <motion.div
                  key={slide.url}
                  initial={{ opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1.5, ease: 'easeInOut' }}
                  className="absolute inset-0"
                >
                  <img
                    src={slide.url}
                    alt={slide.location}
                    className="h-full w-full object-cover"
                  />
                </motion.div>
              ) : null
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Gradient Overlays ── */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/80" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

        {/* ── Noise Texture ── */}
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {/* ── Main Content ── */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 flex h-full flex-col items-center justify-center px-4 text-center"
      >
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-sm"
        >
          <Star className="h-3.5 w-3.5 fill-brand-400 text-brand-400" />
          <span className="text-xs font-medium tracking-widest text-white/90 uppercase">
            India&apos;s #1 Premium Trek Platform
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="font-display max-w-4xl text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl"
        >
          Discover Adventures
          <br />
          <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-amber-300 bg-clip-text text-transparent">
            Beyond Ordinary
          </span>
        </motion.h1>

        {/* Subheading */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="mt-6 max-w-2xl text-base text-white/70 sm:text-lg md:text-xl"
        >
          Expert-guided Himalayan treks, seamless booking, and memories that last a lifetime.
          Your next summit is waiting.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href="/treks"
            className="group relative overflow-hidden rounded-full bg-brand-500 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all duration-300 hover:bg-brand-600 hover:shadow-xl hover:shadow-brand-500/40 hover:-translate-y-0.5"
          >
            <span className="relative z-10">Book Your Adventure</span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </a>

          <button
            onClick={() => setIsVideoOpen(true)}
            className="group flex items-center gap-3 rounded-full border border-white/30 bg-white/10 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:bg-white/20 hover:-translate-y-0.5"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 transition-colors group-hover:bg-white/30">
              <Play className="h-3 w-3 fill-white text-white" />
            </span>
            Watch Our Story
          </button>
        </motion.div>

        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.8 }}
          className="mt-8 w-full max-w-4xl px-2 sm:px-0"
        >
          <HeroSearchBar />
        </motion.div>

        {/* Stats */}
        {/* <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.8 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-8 sm:gap-12"
        >
          {HERO_STATS.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 + i * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-2xl font-bold text-white sm:text-3xl">
                {stat.value}
              </div>
              <div className="mt-0.5 text-xs text-white/50 tracking-wide">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div> */}
      </motion.div>

      {/* ── Slide Indicators ── */}
      <div className="absolute bottom-24 left-1/2 z-20 flex -translate-x-1/2 gap-2">
        {BG_SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentSlide(i)}
            className={cn(
              'h-1 rounded-full transition-all duration-500',
              i === currentSlide ? 'w-8 bg-brand-400' : 'w-2 bg-white/30 hover:bg-white/50'
            )}
          />
        ))}
      </div>

      {/* ── Location Label ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.5 }}
          className="absolute bottom-24 right-8 z-20 hidden items-center gap-2 md:flex"
        >
          <div className="h-px w-8 bg-white/40" />
          <span className="text-xs text-white/60 tracking-widest uppercase">
            {BG_SLIDES[currentSlide].location}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* ── Scroll Indicator ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 z-20 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="flex flex-col items-center gap-1 text-white/40"
        >
          <span className="text-[10px] tracking-widest uppercase">Scroll</span>
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </motion.div>

      {/* ── Video Modal ── */}
      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsVideoOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl overflow-hidden rounded-2xl bg-black shadow-2xl"
            >
              <div className="aspect-video">
                <iframe
                  className="h-full w-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              </div>
              <button
                onClick={() => setIsVideoOpen(false)}
                className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
