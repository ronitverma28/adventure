'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Mountain } from 'lucide-react';

const DESTINATIONS = [
  {
    name: 'Uttarakhand',
    treks: 48,
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
    highlight: 'Valley of Flowers · Roopkund · Kedarkantha',
    size: 'large',
  },
  {
    name: 'Himachal Pradesh',
    treks: 36,
    image: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=600&q=80',
    highlight: 'Hampta Pass · Bali Pass · Pin Parvati',
    size: 'medium',
  },
  {
    name: 'Ladakh',
    treks: 22,
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&q=80',
    highlight: 'Chadar Trek · Markha Valley · Stok Kangri',
    size: 'medium',
  },
  {
    name: 'Sikkim',
    treks: 18,
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
    highlight: 'Goecha La · Dzongri · Green Lake',
    size: 'small',
  },
  {
    name: 'West Bengal',
    treks: 14,
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&q=80',
    highlight: 'Sandakphu · Phalut · Singalila Ridge',
    size: 'small',
  },
  {
    name: 'Kashmir',
    treks: 12,
    image: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80',
    highlight: 'Kashmir Great Lakes · Tarsar Marsar',
    size: 'small',
  },
];

export function PopularDestinations() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <section className="bg-muted/30 py-16 md:py-28">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-14 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end"
        >
          <div>
            <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-brand-500">
              Explore India
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Popular Destinations
            </h2>
            <p className="mt-3 max-w-lg text-muted-foreground">
              From the frozen rivers of Ladakh to the flower-carpeted meadows of Uttarakhand.
            </p>
          </div>
          <a
            href="/treks"
            className="group flex shrink-0 items-center gap-2 text-sm font-semibold text-brand-500 hover:text-brand-600"
          >
            All destinations
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </motion.div>

        {/* Bento Grid */}
        <div ref={ref} className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {DESTINATIONS.map((dest, i) => (
            <motion.a
              key={dest.name}
              href={`/treks?state=${dest.name}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              onHoverStart={() => setHovered(dest.name)}
              onHoverEnd={() => setHovered(null)}
              className={`group relative overflow-hidden rounded-2xl ${
                dest.size === 'large'
                  ? 'col-span-2 row-span-2 h-64 sm:h-80 lg:min-h-[400px]'
                  : dest.size === 'medium'
                  ? 'h-36 sm:h-48 md:h-52'
                  : 'h-32 sm:h-40 md:h-44'
              }`}
            >
              {/* Image */}
              <img
                src={dest.image}
                alt={dest.name}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">{dest.name}</h3>
                    {dest.size === 'large' && (
                      <p className="mt-1 text-xs text-white/60">{dest.highlight}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
                    <Mountain className="h-3 w-3 text-brand-400" />
                    <span className="text-xs font-semibold text-white">{dest.treks} treks</span>
                  </div>
                </div>
              </div>

              {/* Hover arrow */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={hovered === dest.name ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
              >
                <ArrowRight className="h-4 w-4 text-white" />
              </motion.div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
