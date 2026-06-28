'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wind, Droplets, Thermometer, Eye } from 'lucide-react';
import { getWeatherData, getWeatherEmoji, WeatherData } from '@/lib/services/weather.service';
import { SectionHeader } from './TrekPhotoGallery';

interface Props { lat: number; lng: number; trekTitle: string; }

export function TrekWeatherWidget({ lat, lng, trekTitle }: Props) {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getWeatherData(lat, lng)
      .then(setWeather)
      .finally(() => setLoading(false));
  }, [lat, lng]);

  return (
    <div>
      <SectionHeader icon={Thermometer} label="Live Weather" title={`Current Conditions at ${trekTitle}`} />
      <p className="mb-6 text-sm text-muted-foreground">
        Real-time weather data for the trek region. Always check forecasts 48 hours before departure.
      </p>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted" />
          ))}
        </div>
      ) : weather ? (
        <div className="space-y-4">
          {/* Current weather */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-blue-500/10 to-cyan-500/5 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-blue-500">Current</div>
                <div className="mt-1 font-display text-5xl font-bold text-foreground">
                  {weather.temp}°C
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {getWeatherEmoji(weather.description)} {weather.description}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  Feels like {weather.feelsLike}°C
                </div>
              </div>
              <div className="text-6xl">{getWeatherEmoji(weather.description)}</div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              {[
                { icon: Droplets, label: 'Humidity', value: `${weather.humidity}%` },
                { icon: Wind,     label: 'Wind',     value: `${weather.windSpeed} km/h` },
                { icon: Eye,      label: 'Visibility', value: 'Good' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl bg-white/5 p-3 text-center">
                  <Icon className="mx-auto mb-1 h-4 w-4 text-blue-400" />
                  <div className="text-[10px] text-muted-foreground">{label}</div>
                  <div className="text-sm font-semibold text-foreground">{value}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 5-day forecast */}
          <div className="grid grid-cols-5 gap-2">
            {weather.forecast.map((day, i) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07 }}
                className="rounded-2xl border border-border bg-card p-3 text-center"
              >
                <div className="text-[10px] font-semibold text-muted-foreground">{day.day}</div>
                <div className="my-2 text-2xl">{getWeatherEmoji(day.description)}</div>
                <div className="text-xs font-bold text-foreground">{day.high}°</div>
                <div className="text-[10px] text-muted-foreground">{day.low}°</div>
              </motion.div>
            ))}
          </div>

          <p className="text-[11px] text-muted-foreground">
            ⚠️ Weather data is indicative. Mountain weather changes rapidly. Always carry rain gear and extra warm layers.
          </p>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
          Weather data unavailable. Check local forecasts before departure.
        </div>
      )}
    </div>
  );
}
