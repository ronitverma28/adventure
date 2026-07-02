import { Mountain, Instagram, Youtube, Facebook, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';
import { siteConfig } from '@/config/site.config';

const FOOTER_LINKS = {
  Treks: [
    { label: 'All Treks', href: '/treks' },
    { label: 'Easy Treks', href: '/treks?difficulty=EASY' },
    { label: 'Moderate Treks', href: '/treks?difficulty=MODERATE' },
    { label: 'Difficult Treks', href: '/treks?difficulty=DIFFICULT' },
    { label: 'Winter Treks', href: '/treks?season=winter' },
    { label: 'Weekend Treks', href: '/treks?duration=1-3' },
  ],
  Destinations: [
    { label: 'Uttarakhand', href: '/treks?state=Uttarakhand' },
    { label: 'Himachal Pradesh', href: '/treks?state=Himachal Pradesh' },
    { label: 'Ladakh', href: '/treks?state=Ladakh' },
    { label: 'Sikkim', href: '/treks?state=Sikkim' },
    { label: 'Kashmir', href: '/treks?state=Kashmir' },
    { label: 'West Bengal', href: '/treks?state=West Bengal' },
  ],
  Company: [
    { label: 'About Us', href: '/about' },
    { label: 'Our Guides', href: '/guides' },
    { label: 'Blog', href: '/blog' },
    { label: 'Careers', href: '/careers' },
    { label: 'Press', href: '/press' },
    { label: 'Contact', href: '/contact' },
  ],
  Support: [
    { label: 'Help Center', href: '/help' },
    { label: 'Booking Policy', href: '/booking-policy' },
    { label: 'Cancellation Policy', href: '/cancellation' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Sitemap', href: '/sitemap' },
  ],
};

export function Footer() {
  return (
    <footer className="bg-mountain-900 text-white">
      {/* Newsletter Banner */}
      <div className="border-b border-white/10 bg-brand-500/10">
        <div className="container py-10">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div>
              <h3 className="font-display text-xl font-bold text-white">
                Get trek updates & exclusive offers
              </h3>
              <p className="mt-1 text-sm text-white/60">
                Join 25,000+ trekkers who get our weekly newsletter.
              </p>
            </div>
            <form className="flex w-full max-w-md gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm text-white placeholder-white/40 outline-none backdrop-blur-sm transition-colors focus:border-brand-400 focus:bg-white/15"
              />
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
              >
                Subscribe
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container py-16">
        <div className="grid grid-cols-2 gap-10 md:grid-cols-3 lg:grid-cols-6">
          {/* Brand */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2">
            <a href="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500">
                <Mountain className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">HimYatraa</span>
            </a>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
              India&apos;s premium adventure travel platform. Expert-guided treks, seamless
              booking, and unforgettable Himalayan experiences since 2014.
            </p>

            {/* Contact */}
            <div className="mt-6 space-y-2">
              {[
                { icon: Phone, text: siteConfig.phone, href: `tel:${siteConfig.phone}` },
                { icon: Mail, text: siteConfig.email, href: `mailto:${siteConfig.email}` },
                { icon: MapPin, text: 'Dehradun, Uttarakhand, India', href: '#' },
              ].map(({ icon: Icon, text, href }) => (
                <a
                  key={text}
                  href={href}
                  className="flex items-center gap-2.5 text-sm text-white/50 transition-colors hover:text-white/80"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-brand-400" />
                  {text}
                </a>
              ))}
            </div>

            {/* Social */}
            <div className="mt-6 flex gap-3">
              {[
                { icon: Instagram, href: siteConfig.social.instagram, label: 'Instagram' },
                { icon: Youtube, href: siteConfig.social.youtube, label: 'YouTube' },
                { icon: Facebook, href: siteConfig.social.facebook, label: 'Facebook' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/60 transition-colors hover:bg-brand-500/20 hover:text-brand-400"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-white/60 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container flex flex-col items-center justify-between gap-4 py-6 sm:flex-row">
          <p className="text-xs text-white/40">
            &copy; {new Date().getFullYear()} HimYatraa. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-xs text-white/40">
            <span>Made with</span>
            <span className="text-red-400">♥</span>
            <span>for mountain lovers</span>
          </div>
          <div className="flex gap-4">
            {['Privacy', 'Terms', 'Cookies'].map((item) => (
              <a
                key={item}
                href={`/${item.toLowerCase()}`}
                className="text-xs text-white/40 transition-colors hover:text-white/70"
              >
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
