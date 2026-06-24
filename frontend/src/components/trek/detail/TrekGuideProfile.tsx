'use client';

import { motion } from 'framer-motion';
import { Star, Award, Globe, CheckCircle, UserCheck } from 'lucide-react';
import { SectionHeader } from './TrekPhotoGallery';

interface Guide {
  name: string; photo: string; experience: number;
  languages: string[]; certifications: string[];
  bio: string; rating: number; totalTreks: number;
}

export function TrekGuideProfile({ guide }: { guide: Guide }) {
  return (
    <div>
      <SectionHeader icon={UserCheck} label="Your Guide" title="Meet Your Trek Leader" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="overflow-hidden rounded-2xl border border-border bg-card"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-mountain-900 to-mountain-800 p-6">
          <div className="flex items-start gap-5">
            <div className="relative">
              <img
                src={guide.photo}
                alt={guide.name}
                className="h-20 w-20 rounded-2xl object-cover ring-4 ring-white/20"
              />
              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
                <CheckCircle className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-display text-xl font-bold text-white">{guide.name}</h3>
              <div className="mt-1 flex items-center gap-1.5">
                <Star className="h-4 w-4 fill-brand-400 text-brand-400" />
                <span className="font-semibold text-white">{guide.rating}</span>
                <span className="text-white/50">rating</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-3">
                <div className="text-center">
                  <div className="font-display text-xl font-bold text-white">{guide.experience}</div>
                  <div className="text-[10px] text-white/50">Years Exp.</div>
                </div>
                <div className="text-center">
                  <div className="font-display text-xl font-bold text-white">{guide.totalTreks}</div>
                  <div className="text-[10px] text-white/50">Treks Led</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm leading-relaxed text-muted-foreground">{guide.bio}</p>

          {/* Languages */}
          <div className="mt-5">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Globe className="h-3.5 w-3.5 text-brand-500" />
              Languages
            </div>
            <div className="flex flex-wrap gap-2">
              {guide.languages.map((lang) => (
                <span key={lang} className="rounded-lg bg-muted px-3 py-1 text-xs font-medium text-foreground">
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="mt-4">
            <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Award className="h-3.5 w-3.5 text-brand-500" />
              Certifications
            </div>
            <div className="space-y-1.5">
              {guide.certifications.map((cert) => (
                <div key={cert} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                  {cert}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
