'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { X, ZoomIn } from 'lucide-react';

const GALLERY = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
    thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=75',
    caption: 'Kedarkantha Summit',
    location: 'Uttarakhand',
    span: 'col-span-2 row-span-2',
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
    thumb: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=75',
    caption: 'Roopkund Lake',
    location: 'Uttarakhand',
    span: '',
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=800&q=80',
    thumb: 'https://images.unsplash.com/photo-1486870591958-9b9d0d1dda99?w=400&q=75',
    caption: 'Hampta Pass',
    location: 'Himachal Pradesh',
    span: '',
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&q=80',
    thumb: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=75',
    caption: 'Chadar Trek',
    location: 'Ladakh',
    span: '',
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&q=80',
    thumb: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&q=75',
    caption: 'Leh Landscape',
    location: 'Ladakh',
    span: '',
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80',
    thumb: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=75',
    caption: 'Valley of Flowers',
    location: 'Uttarakhand',
    span: 'col-span-2',
  },
];

export function GallerySection() {
  const [lightbox, setLightbox] = useState<(typeof GALLERY)[0] | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className="bg-mountain-900 py-16 md:py-28">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mb-14 text-center"
        >
          <span className="mb-3 inline-block text-xs font-semibold uppercase tracking-widest text-brand-400">
            Visual Journey
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
            Through the Lens
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-mountain-300">
            Every frame tells a story of courage, beauty, and the indomitable human spirit.
          </p>
        </motion.div>

        {/* Masonry Grid */}
        <div
          ref={ref}
          className="grid grid-cols-2 gap-2 sm:gap-3 sm:grid-cols-3 lg:grid-cols-4"
          style={{ gridAutoRows: 'clamp(120px, 20vw, 200px)' }}
        >
          {GALLERY.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              onClick={() => setLightbox(item)}
              className={`group relative cursor-pointer overflow-hidden rounded-2xl ${
                item.span
              }`}
            >
              <img
                src={item.thumb}
                alt={item.caption}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 transition-colors duration-300 group-hover:bg-black/40" />

              {/* Hover overlay */}
              <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <ZoomIn className="mb-2 h-8 w-8 text-white" />
                <div className="text-center">
                  <div className="text-sm font-semibold text-white">{item.caption}</div>
                  <div className="text-xs text-white/70">{item.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl"
            >
              <img
                src={lightbox.url}
                alt={lightbox.caption}
                className="max-h-[85vh] w-full object-contain"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 p-6">
                <div className="font-semibold text-white">{lightbox.caption}</div>
                <div className="text-sm text-white/60">{lightbox.location}</div>
              </div>
              <button
                onClick={() => setLightbox(null)}
                className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
