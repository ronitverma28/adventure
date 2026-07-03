'use client';

import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { ArrowRight, Mountain } from 'lucide-react';

const DESTINATIONS = [
  {
    id: 1,
    name: 'Uttarakhand',
    treks: 48,
    image: '/images/popular/hem_002.jpeg',
    highlight: 'Hemkund Sahib · Joshimath',
    size: 'large',
  },
  {
    id: 2,
    name: 'Uttarakhand',
    treks: 36,
    image: '/images/popular/valley_002.jpeg',
    highlight: 'Valley of Flowers · Joshimath',
    size: 'medium',
  },
  {
    id: 3,
    name: 'Uttarakhand',
    treks: 22,
    image: '/images/popular/valley_003.jpeg',
    highlight: 'Valley of Flowers · Joshimath',
    size: 'medium',
  },
  {
    id: 4,
    name: 'Uttarakhand',
    treks: 18,
    image: '/images/popular/hem_001.jpeg',
    highlight: 'Hemkund Sahib · Joshimath',
    size: 'small',
  },
  {
    id: 5,
    name: 'Uttarakhand',
    treks: 14,
    image: '/images/popular/hem_003.jpeg',
    highlight: 'Hemkund Sahib · Joshimath',
    size: 'small',
  },
  {
    id: 6,
    name: 'Uttarakhand',
    treks: 12,
    image: '/images/popular/valley_001.jpeg',
    highlight: 'Valley of Flowers · Joshimath',
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
        <div ref={ref} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DESTINATIONS.map((dest, i) => (
            <motion.a
              key={dest.id}
              href={`/treks?state=${dest.name}`}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              onHoverStart={()=> setHovered(dest.name)}
              onHoverEnd={()=> setHovered(null)}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`group relative overflow-hidden rounded-2xl ${
                dest.size === 'large'
                  ? 'col-span-1 sm:col-span-2 sm:row-span-2 h-64 sm:h-80 lg:min-h-[400px]'
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
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="flex items-end justify-between">
                  <div>
                      <p className="mt-1 text-xs text-white/60">{dest.highlight}</p>
                    <h3 className="text-lg font-semibold text-white">{dest.name}</h3>
                    
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
