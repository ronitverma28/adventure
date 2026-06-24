'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface Props {
  images: { url: string; caption: string }[];
  trekTitle: string;
}

export function TrekPhotoGallery({ images, trekTitle }: Props) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const prev = () => setLightboxIdx((i) => (i !== null ? (i - 1 + images.length) % images.length : null));
  const next = () => setLightboxIdx((i) => (i !== null ? (i + 1) % images.length : null));

  return (
    <div>
      <SectionHeader icon={Camera} label="Photo Gallery" title={`${trekTitle} in Pictures`} />

      {/* Masonry-style grid */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((img, i) => (
          <motion.div
            key={img.url}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            onClick={() => setLightboxIdx(i)}
            className={cn(
              'group relative cursor-pointer overflow-hidden rounded-2xl',
              i === 0 ? 'col-span-2 row-span-2 h-72 sm:h-80' : 'h-36 sm:h-44'
            )}
          >
            <img src={img.url} alt={img.caption} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/30" />
            <div className="absolute inset-0 flex flex-col items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
              <ZoomIn className="h-8 w-8 text-white" />
              <p className="mt-1 px-2 text-center text-xs font-medium text-white">{img.caption}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxIdx !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4"
            onClick={() => setLightboxIdx(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] max-w-5xl w-full"
            >
              <img
                src={images[lightboxIdx].url}
                alt={images[lightboxIdx].caption}
                className="max-h-[80vh] w-full rounded-2xl object-contain"
              />
              <div className="mt-3 text-center text-sm text-white/70">{images[lightboxIdx].caption}</div>
              <div className="absolute bottom-12 left-0 right-0 flex justify-center gap-2">
                {images.map((_, i) => (
                  <button key={i} onClick={() => setLightboxIdx(i)}
                    className={cn('h-1.5 rounded-full transition-all', i === lightboxIdx ? 'w-6 bg-brand-400' : 'w-1.5 bg-white/30')}
                  />
                ))}
              </div>
              <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70">
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70">
                <ChevronRight className="h-5 w-5" />
              </button>
              <button onClick={() => setLightboxIdx(null)} className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70">
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function SectionHeader({ icon: Icon, label, title }: { icon: React.ElementType; label: string; title: string }) {
  return (
    <div className="mb-2">
      <div className="mb-1 flex items-center gap-2">
        <Icon className="h-4 w-4 text-brand-500" />
        <span className="text-xs font-semibold uppercase tracking-widest text-brand-500">{label}</span>
      </div>
      <h2 className="font-display text-2xl font-bold text-foreground sm:text-3xl">{title}</h2>
    </div>
  );
}
