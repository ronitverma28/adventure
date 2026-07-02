'use client';

import Link from 'next/link';
import { Mountain, Compass, ShieldCheck, Award, Heart, Users } from 'lucide-react';

const stats = [
  { label: 'Treks Organized', value: '150+' },
  { label: 'Happy Travelers', value: '5,000+' },
  { label: 'Expert Guides', value: '25+' },
  { label: 'Safety Rating', value: '4.9/5' },
];

const values = [
  {
    icon: ShieldCheck,
    title: 'Safety First',
    description: 'Our top priority is your safety. We carry advanced medical kits, oxygen cylinders, and satellite trackers on every trek.',
  },
  {
    icon: Compass,
    title: 'Responsible Tourism',
    description: 'We follow Leave No Trace principles, minimizing our environmental impact and supporting local mountain communities.',
  },
  {
    icon: Heart,
    title: 'Passion for Adventure',
    description: 'Trekking is not just our business; it is our passion. We strive to share the magic of the Himalayas with the world.',
  },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative flex h-[60vh] items-center justify-center overflow-hidden bg-slate-950 pt-16">
        <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-brand-900/30 via-slate-950 to-slate-950 opacity-90" />
        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <span className="rounded-full bg-brand-500/10 px-4 py-1.5 text-xs font-semibold text-brand-400">
            About HimYatraa
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Empowering Your <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-400 to-emerald-400 bg-clip-text text-transparent">
              Himalayan Journey
            </span>
          </h1>
          <p className="mt-6 text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            We are a group of passionate mountain explorers, safety professionals, and community builders dedicated to making Himalayan treks safe, accessible, and unforgettable.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-border bg-card/50 py-12 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="font-display text-3xl font-bold text-brand-500 sm:text-4xl">{stat.value}</div>
                <div className="mt-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story / Mission */}
      <section className="mx-auto max-w-5xl px-4 py-20">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Our Mission & Story
            </h2>
            <p className="mt-6 text-muted-foreground leading-relaxed">
              Founded in the heart of the mountains, Adventure began with a simple idea: that trekking should be a transformative, safe, and deeply respectful experience. We saw a gap between mass tourism and true mountaineering, and set out to bridge it.
            </p>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Over the last few years, we have mapped new routes, trained local guides to international safety standards, and helped thousands of travelers disconnect from urban chaos and connect with raw nature.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-gradient-to-br from-brand-500/5 to-emerald-500/5 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-brand-500/10 blur-3xl" />
            <Mountain className="h-10 w-10 text-brand-500 mb-6" />
            <h3 className="font-display text-xl font-bold text-foreground">Why We Trek</h3>
            <blockquote className="mt-4 text-sm italic text-muted-foreground">
              "The mountains are not stadiums where I satisfy my ambition to achieve, they are the cathedrals where I practice my religion."
            </blockquote>
            <p className="mt-4 text-xs font-semibold text-brand-500 uppercase tracking-wider">— Adventure Ethos</p>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-card py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Our Core Values
            </h2>
            <p className="mt-4 text-muted-foreground">
              These principles guide every decision we make, from planning routes to selecting local partners.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {values.map((v, idx) => (
              <div key={idx} className="rounded-2xl border border-border bg-background p-6 transition-all hover:-translate-y-1 hover:shadow-md">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-500">
                  <v.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-foreground">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center">
        <div className="rounded-3xl border border-border bg-gradient-to-r from-brand-950 to-slate-900 px-6 py-12 sm:px-12 sm:py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:20px_20px]" />
          <h2 className="relative z-10 font-display text-3xl font-bold text-white sm:text-4xl">
            Ready to Start Your Adventure?
          </h2>
          <p className="relative z-10 mt-4 text-slate-300 max-w-lg mx-auto">
            Explore our curated list of Himalayan expeditions and book your batch today.
          </p>
          <div className="relative z-10 mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/treks"
              className="rounded-xl bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-colors"
            >
              Explore Treks
            </Link>
            <Link
              href="/contact"
              className="rounded-xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
