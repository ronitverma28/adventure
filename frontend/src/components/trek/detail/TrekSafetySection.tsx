'use client';

import { motion } from 'framer-motion';
import { Shield, AlertTriangle, Phone, HeartPulse } from 'lucide-react';
import { SectionHeader } from './TrekPhotoGallery';

interface Props {
  safetyInfo: { title: string; description: string }[];
}

const ICONS = [AlertTriangle, HeartPulse, Phone, Shield];
const COLORS = [
  { bg: 'bg-red-500/10', border: 'border-red-500/20', icon: 'text-red-500' },
  { bg: 'bg-orange-500/10', border: 'border-orange-500/20', icon: 'text-orange-500' },
  { bg: 'bg-blue-500/10', border: 'border-blue-500/20', icon: 'text-blue-500' },
  { bg: 'bg-green-500/10', border: 'border-green-500/20', icon: 'text-green-500' },
];

export function TrekSafetySection({ safetyInfo }: Props) {
  return (
    <div>
      <SectionHeader icon={Shield} label="Safety" title="Safety Information" />
      <p className="mb-6 text-sm text-muted-foreground">
        Your safety is our highest priority. Please read all safety guidelines before the trek.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {safetyInfo.map((info, i) => {
          const Icon  = ICONS[i % ICONS.length];
          const color = COLORS[i % COLORS.length];
          return (
            <motion.div
              key={info.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-2xl border p-5 ${color.bg} ${color.border}`}
            >
              <div className="mb-3 flex items-center gap-2">
                <Icon className={`h-5 w-5 ${color.icon}`} />
                <h3 className="font-semibold text-foreground">{info.title}</h3>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">{info.description}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Emergency contacts */}
      <div className="mt-6 rounded-2xl border border-red-500/20 bg-red-500/5 p-5">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-foreground">
          <Phone className="h-4 w-4 text-red-500" />
          Emergency Contacts
        </h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { label: 'Adventure Support', number: '+91 98765 43210' },
            { label: 'Mountain Rescue',   number: '+91 1800 180 4141' },
            { label: 'SDRF Uttarakhand',  number: '+91 135 2710334' },
          ].map((contact) => (
            <a
              key={contact.label}
              href={`tel:${contact.number.replace(/\s/g, '')}`}
              className="flex flex-col rounded-xl border border-red-500/20 bg-background p-3 transition-colors hover:bg-red-500/5"
            >
              <span className="text-[10px] text-muted-foreground">{contact.label}</span>
              <span className="mt-0.5 font-semibold text-foreground">{contact.number}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
