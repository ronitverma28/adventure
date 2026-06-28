'use client';

import { motion } from 'framer-motion';
import { TrendingUp, CheckCircle, Lightbulb, Activity } from 'lucide-react';
import { DifficultyLevel } from '@/types/trek.types';
import { DIFFICULTY_CONFIG } from '@/lib/constants/trek.constants';
import { cn } from '@/lib/utils/cn';
import { SectionHeader } from './TrekPhotoGallery';

interface Props {
  fitness: { level: string; activities: string[]; tips: string[] };
  difficulty: DifficultyLevel;
}

const FITNESS_LEVELS: Record<DifficultyLevel, { weeks: number; hoursPerWeek: number; description: string }> = {
  EASY:      { weeks: 4,  hoursPerWeek: 3,  description: 'Basic fitness. Regular walking and light cardio is sufficient.' },
  MODERATE:  { weeks: 8,  hoursPerWeek: 5,  description: 'Moderate fitness. Regular cardio, stair climbing, and weekend hikes recommended.' },
  DIFFICULT: { weeks: 12, hoursPerWeek: 8,  description: 'Good fitness required. Running, cycling, and strength training for 3 months.' },
  EXTREME:   { weeks: 16, hoursPerWeek: 12, description: 'Excellent fitness mandatory. Dedicated training program for 4+ months.' },
};

export function TrekFitnessSection({ fitness, difficulty }: Props) {
  const level = FITNESS_LEVELS[difficulty];
  const diff  = DIFFICULTY_CONFIG[difficulty];

  return (
    <div>
      <SectionHeader icon={Activity} label="Fitness" title="Physical Requirements" />
      <p className="mb-6 text-sm text-muted-foreground">
        Proper physical preparation is key to a safe and enjoyable trek. Here\'s what you need.
      </p>

      {/* Fitness level card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className={cn('mb-6 rounded-2xl border p-6', diff.bg, diff.border)}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className={cn('text-xs font-semibold uppercase tracking-widest', diff.color)}>Required Level</div>
            <div className="mt-1 font-display text-2xl font-bold text-foreground">{fitness.level}</div>
            <p className="mt-2 text-sm text-muted-foreground">{level.description}</p>
          </div>
          <div className="text-right">
            <div className="font-display text-3xl font-bold text-foreground">{level.weeks}</div>
            <div className="text-xs text-muted-foreground">weeks prep</div>
            <div className="mt-1 font-display text-xl font-bold text-foreground">{level.hoursPerWeek}h</div>
            <div className="text-xs text-muted-foreground">per week</div>
          </div>
        </div>

        {/* Fitness bar */}
        <div className="mt-4">
          <div className="mb-1 flex justify-between text-[10px] text-muted-foreground">
            <span>Beginner</span><span>Expert</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-black/10">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: difficulty === 'EASY' ? '25%' : difficulty === 'MODERATE' ? '50%' : difficulty === 'DIFFICULT' ? '75%' : '95%' }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={cn('h-full rounded-full', diff.dot)}
            />
          </div>
        </div>
      </motion.div>

      {/* Training activities */}
      <div className="mb-6">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
          <CheckCircle className="h-4 w-4 text-brand-500" />
          Recommended Training
        </h3>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {fitness.activities.map((activity, i) => (
            <motion.div
              key={activity}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-xs font-bold text-brand-500">
                {i + 1}
              </div>
              <span className="text-sm text-foreground">{activity}</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
          <Lightbulb className="h-4 w-4 text-amber-500" />
          Pro Tips
        </h3>
        <div className="space-y-2">
          {fitness.tips.map((tip) => (
            <div key={tip} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
              {tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
