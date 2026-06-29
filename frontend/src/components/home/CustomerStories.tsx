'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

const STORIES = [
  {
    id: 1,
    name: 'Priya Sharma',
    location: 'Mumbai, Maharashtra',
    trek: 'Kedarkantha Trek',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80',
    quote:
      'Standing at the Kedarkantha summit at sunrise, surrounded by a 360° panorama of snow-capped peaks, I understood why people call this life-changing. Adventure\'s team made every moment feel safe and magical.',
    date: 'December 2024',
  },
  {
    id: 2,
    name: 'Arjun Mehta',
    location: 'Bangalore, Karnataka',
    trek: 'Roopkund Trek',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&q=80',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80',
    quote:
      'The Roopkund mystery lake exceeded every expectation. Our guide Ramesh was phenomenal — his knowledge of the Himalayas is encyclopedic. The booking process was seamless and the support team was always available.',
    date: 'September 2024',
  },
  {
    id: 3,
    name: 'Kavya Nair',
    location: 'Kochi, Kerala',
    trek: 'Valley of Flowers',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80',
    quote:
      'As a solo female trekker, safety was my top concern. Adventure\'s team went above and beyond. The Valley of Flowers was breathtaking, and I felt completely secure throughout. Already booked my next trek!',
    date: 'August 2024',
  },
  {
    id: 4,
    name: 'Rahul Gupta',
    location: 'Delhi, NCR',
    trek: 'Chadar Trek',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80',
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&q=80',
    quote:
      'Walking on a frozen river in -20°C is something I\'ll never forget. The logistics were flawless, the gear was top-notch, and the guides were absolute legends. Worth every rupee and more.',
    date: 'January 2024',
  },
  {
    id: 5,
    name: 'Sneha Patel',
    location: 'Ahmedabad, Gujarat',
    trek: 'Hampta Pass',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
    image: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=400&q=80',
    quote:
      'Hampta Pass was my first high-altitude trek and I was nervous. The team\'s preparation materials, fitness plan, and constant encouragement made it possible. Crossed the pass at 4270m — I cried happy tears!',
    date: 'July 2024',
  },
];

export function CustomerStories() {
  const [active, setActive] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  const prev = () => setActive((a) => (a - 1 + STORIES.length) % STORIES.length);
  const next = () => setActive((a) => (a + 1) % STORIES.length);

  const story = STORIES[active];

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
            Real Stories
          </span>
          <h2 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Trekkers Who Transformed
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            50,000+ adventurers have trusted us with their most memorable experiences.
          </p>
        </motion.div>

        <div ref={ref} className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          {/* Left: Featured Story */}
          <AnimatePresence mode="wait">
            <motion.div
              key={story.id}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              {/* Quote icon */}
              <Quote className="mb-6 h-10 w-10 text-brand-500/30" />

              {/* Stars */}
              <div className="mb-4 flex gap-1">
                {Array.from({ length: story.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-brand-400 text-brand-400" />
                ))}
              </div>

              {/* Quote */}
              <blockquote className="mb-8 text-xl font-medium leading-relaxed text-foreground sm:text-2xl">
                &ldquo;{story.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img
                  src={story.avatar}
                  alt={story.name}
                  className="h-14 w-14 rounded-full object-cover ring-2 ring-brand-500/30"
                />
                <div>
                  <div className="font-semibold text-foreground">{story.name}</div>
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {story.location}
                  </div>
                  <div className="mt-0.5 text-xs text-brand-500">
                    {story.trek} · {story.date}
                  </div>
                </div>
              </div>

              {/* Navigation */}
              <div className="mt-10 flex items-center gap-4">
                <button
                  onClick={prev}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-muted"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="flex gap-2">
                  {STORIES.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActive(i)}
                      className={cn(
                        'h-1.5 rounded-full transition-all duration-300',
                        i === active ? 'w-8 bg-brand-500' : 'w-1.5 bg-border hover:bg-muted-foreground'
                      )}
                    />
                  ))}
                </div>
                <button
                  onClick={next}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background transition-colors hover:bg-muted"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Right: Story Image + Mini Cards */}
          <div className="relative">
            <AnimatePresence mode="wait">
              <motion.div
                key={story.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="relative overflow-hidden rounded-3xl"
              >
                <img
                  src={story.image}
                  alt={story.trek}
                  className="h-80 w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <div className="absolute bottom-4 left-4 rounded-xl bg-black/40 px-4 py-2 backdrop-blur-sm">
                  <div className="text-xs text-white/60">Trek</div>
                  <div className="font-semibold text-white">{story.trek}</div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Mini story cards */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STORIES.filter((_, i) => i !== active)
                .slice(0, 2)
                .map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActive(STORIES.indexOf(s))}
                    className="group flex items-center gap-3 overflow-hidden rounded-xl border border-border bg-card p-3 text-left transition-all hover:border-brand-500/30 hover:shadow-md"
                  >
                    <img
                      src={s.avatar}
                      alt={s.name}
                      className="h-10 w-10 shrink-0 rounded-full object-cover"
                    />
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold text-foreground">{s.name}</div>
                      <div className="truncate text-[10px] text-muted-foreground">{s.trek}</div>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
