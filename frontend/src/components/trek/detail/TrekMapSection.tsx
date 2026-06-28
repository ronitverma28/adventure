'use client';

import { motion } from 'framer-motion';
import { MapPin, Plane, Train, Navigation } from 'lucide-react';
import { SectionHeader } from './TrekPhotoGallery';

interface Props {
  lat: number; lng: number; trekTitle: string;
  meetingPoint: string; nearestAirport: string; nearestRailway: string;
}

export function TrekMapSection({ lat, lng, trekTitle, meetingPoint, nearestAirport, nearestRailway }: Props) {
  // Google Maps embed URL
  const mapSrc = `https://maps.google.com/maps?q=${lat},${lng}&z=10&output=embed&maptype=terrain`;

  return (
    <div>
      <SectionHeader icon={Navigation} label="Route & Location" title="Getting There" />

      {/* Transport info */}
      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          { icon: MapPin, label: 'Meeting Point', value: meetingPoint, color: 'text-brand-500', bg: 'bg-brand-500/10' },
          { icon: Plane,  label: 'Nearest Airport', value: nearestAirport, color: 'text-blue-500', bg: 'bg-blue-500/10' },
          { icon: Train,  label: 'Nearest Railway', value: nearestRailway, color: 'text-green-500', bg: 'bg-green-500/10' },
        ].map(({ icon: Icon, label, value, color, bg }) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-2xl border border-border bg-card p-4"
          >
            <div className={`mb-2 inline-flex h-9 w-9 items-center justify-center rounded-xl ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">{label}</div>
            <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
          </motion.div>
        ))}
      </div>

      {/* Map embed */}
      <div className="overflow-hidden rounded-2xl border border-border shadow-sm">
        <iframe
          src={mapSrc}
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title={`Map for ${trekTitle}`}
          className="block"
        />
      </div>
    </div>
  );
}
