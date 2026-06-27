'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Mountain, Heart, User, ChevronDown, Search } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import { cn } from '@/lib/utils/cn';
import { mainNavLinks } from '@/config/navigation.config';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isAuthenticated, user } = useAuthStore();
  const { isMobileMenuOpen, toggleMobileMenu } = useUIStore();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className={cn(
          'fixed left-0 right-0 top-0 z-50 transition-all duration-500',
          scrolled
            ? 'border-b border-white/10 bg-mountain-900/95 shadow-lg shadow-black/20 backdrop-blur-xl'
            : 'bg-transparent'
        )}
      >
        <div className="container">
          <div className="flex h-16 items-center justify-between md:h-20">
            {/* Logo */}
            <a href="/" className="group flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500 shadow-lg shadow-brand-500/30 transition-transform group-hover:scale-105">
                <Mountain className="h-5 w-5 text-white" />
              </div>
              <span className="font-display text-xl font-bold text-white">
                Adventure
              </span>
            </a>

            {/* Desktop Nav */}
            <nav className="hidden items-center gap-1 md:flex">
              {mainNavLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              {/* <button className="hidden h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white md:flex">
                <Search className="h-4 w-4" />
              </button> */}

              {isAuthenticated ? (
                <>
                  {/* Wishlist */}
                  <a
                    href="/wishlist"
                    className="hidden h-9 w-9 items-center justify-center rounded-lg text-white/70 transition-colors hover:bg-white/10 hover:text-white md:flex"
                  >
                    <Heart className="h-4 w-4" />
                  </a>

                  {/* User Menu */}
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen((v) => !v)}
                      className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                    >
                      {user?.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.name}
                          className="h-6 w-6 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-xs font-bold">
                          {user?.name?.[0]?.toUpperCase()}
                        </div>
                      )}
                      <span className="hidden sm:block">{user?.name?.split(' ')[0]}</span>
                      <ChevronDown
                        className={cn(
                          'h-3.5 w-3.5 transition-transform',
                          userMenuOpen && 'rotate-180'
                        )}
                      />
                    </button>

                    <AnimatePresence>
                      {userMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-mountain-900/95 shadow-2xl backdrop-blur-xl"
                        >
                          <div className="border-b border-white/10 px-4 py-3">
                            <div className="text-sm font-semibold text-white">{user?.name}</div>
                            <div className="text-xs text-white/50">{user?.email}</div>
                          </div>
                          {[
                            { label: 'My Bookings', href: '/bookings' },
                            { label: 'Wishlist', href: '/wishlist' },
                            { label: 'Profile', href: '/profile' },
                            ...(user?.roles?.includes('ROLE_ADMIN')
                              ? [{ label: 'Admin Dashboard', href: '/dashboard/admin' }]
                              : []),
                          ].map((item) => (
                            <a
                              key={item.href}
                              href={item.href}
                              className="block px-4 py-2.5 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                            >
                              {item.label}
                            </a>
                          ))}
                          <div className="border-t border-white/10">
                            <button className="block w-full px-4 py-2.5 text-left text-sm text-red-400 transition-colors hover:bg-white/10">
                              Sign Out
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <a
                    href="/login"
                    className="hidden rounded-lg px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white sm:block"
                  >
                    Sign In
                  </a>
                  {/* <a
                    href="/register"
                    className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-600 hover:-translate-y-0.5"
                  >
                    Get Started
                  </a> */}
                </div>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={toggleMobileMenu}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white/80 transition-colors hover:bg-white/10 md:hidden"
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed inset-0 z-40 bg-mountain-900 pt-20 md:hidden"
          >
            <nav className="flex flex-col gap-1 p-4">
              {mainNavLinks.map((link, i) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={toggleMobileMenu}
                  className="rounded-xl px-4 py-3.5 text-base font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white"
                >
                  {link.label}
                </motion.a>
              ))}
              <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
                {!isAuthenticated ? (
                  <>
                    <a
                      href="/login"
                      className="rounded-xl border border-white/20 px-4 py-3 text-center text-sm font-semibold text-white"
                    >
                      Sign In
                    </a>
                    <a
                      href="/register"
                      className="rounded-xl bg-brand-500 px-4 py-3 text-center text-sm font-semibold text-white"
                    >
                      Get Started
                    </a>
                  </>
                ) : (
                  <>
                    <a href="/bookings" className="rounded-xl px-4 py-3 text-sm font-medium text-white/80">
                      My Bookings
                    </a>
                    <a href="/profile" className="rounded-xl px-4 py-3 text-sm font-medium text-white/80">
                      Profile
                    </a>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {userMenuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
      )}
    </>
  );
}
