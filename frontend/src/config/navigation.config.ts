import { Mountain, Home, Map, Heart, User, LayoutDashboard, BookOpen } from 'lucide-react';

export const mainNavLinks = [
  { label: 'Home', href: '/' },
  { label: 'Treks', href: '/treks' },
  { label: 'AI Planner', href: '/planner' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
];

export const userNavLinks = [
  { label: 'My Bookings', href: '/bookings', icon: BookOpen },
  { label: 'Wishlist', href: '/wishlist', icon: Heart },
  { label: 'Profile', href: '/profile', icon: User },
];

export const adminNavLinks = [
  { label: 'Dashboard', href: '/dashboard/admin', icon: LayoutDashboard },
  { label: 'Treks', href: '/dashboard/admin/treks', icon: Mountain },
  { label: 'Bookings', href: '/dashboard/admin/bookings', icon: BookOpen },
  { label: 'Users', href: '/dashboard/admin/users', icon: User },
  { label: 'Guides', href: '/dashboard/admin/guides', icon: Map },
];
