'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Phone, MapPin, Calendar, Camera, Save, Loader2, Lock,
  Eye, EyeOff, CheckCircle, AlertCircle, Shield, Mountain,
  CreditCard, FileText, Download, XCircle, Star, Upload,
  Award, Activity, Backpack, Heart, Clock, CheckCircle2,
  ChevronRight, Ticket,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/hooks/useAuth';
import { authApi } from '@/lib/api/auth.api';
import { bookingApi } from '@/lib/api/booking.api';
import { reviewApi } from '@/lib/api/reviews';
import { trekApi } from '@/lib/api/trek.api';
import {
  updateProfileSchema, changePasswordSchema,
  UpdateProfileFormData, ChangePasswordData,
} from '@/lib/validations/auth.schema';
import { formatCurrency, formatDate, formatRelativeTime } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import type { BookingConfirmation, BookingStatus, PaymentHistory } from '@/types/booking.types';

// ─── Types ────────────────────────────────────────────────────────────────────

type DashboardTab =
  | 'profile' | 'security'
  | 'upcoming' | 'completed'
  | 'wishlist' | 'payments'
  | 'documents' | 'certificates'
  | 'fitness' | 'packing';

interface ReviewForm {
  rating: number;
  title: string;
  comment: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const TABS: { key: DashboardTab; label: string; icon: React.ElementType; group: string }[] = [
  { key: 'profile',      label: 'Profile',          icon: User,        group: 'Account' },
  { key: 'security',     label: 'Security',         icon: Shield,      group: 'Account' },
  { key: 'upcoming',     label: 'Upcoming Treks',   icon: Mountain,    group: 'Treks' },
  { key: 'completed',    label: 'Completed Treks',  icon: CheckCircle2,group: 'Treks' },
  { key: 'wishlist',     label: 'Wishlist',         icon: Heart,       group: 'Treks' },
  { key: 'payments',     label: 'Payment History',  icon: CreditCard,  group: 'Finance' },
  { key: 'documents',    label: 'Documents',        icon: FileText,    group: 'Finance' },
  { key: 'certificates', label: 'Certificates',     icon: Award,       group: 'Finance' },
  { key: 'fitness',      label: 'Fitness Checklist',icon: Activity,    group: 'Prep' },
  { key: 'packing',      label: 'Packing List',     icon: Backpack,    group: 'Prep' },
];

const STATUS_CFG: Record<BookingStatus, { label: string; cls: string }> = {
  PENDING:   { label: 'Pending',   cls: 'bg-amber-500/10 text-amber-600' },
  CONFIRMED: { label: 'Confirmed', cls: 'bg-emerald-500/10 text-emerald-600' },
  COMPLETED: { label: 'Completed', cls: 'bg-blue-500/10 text-blue-600' },
  CANCELLED: { label: 'Cancelled', cls: 'bg-red-500/10 text-red-600' },
  REFUNDED:  { label: 'Refunded',  cls: 'bg-purple-500/10 text-purple-600' },
};

const FITNESS_ITEMS = [
  { id: 'cardio',    label: 'Cardio fitness (30 min daily jog for 4 weeks)' },
  { id: 'strength',  label: 'Leg strength training (squats, lunges)' },
  { id: 'altitude',  label: 'Altitude acclimatisation awareness' },
  { id: 'hydration', label: 'Hydration habit (3L water/day)' },
  { id: 'diet',      label: 'High-protein diet for 2 weeks before trek' },
  { id: 'sleep',     label: 'Consistent 8-hour sleep schedule' },
  { id: 'stretching',label: 'Daily stretching & flexibility routine' },
  { id: 'hiking',    label: 'Practice hike with loaded backpack' },
  { id: 'medical',   label: 'Medical check-up & fitness clearance' },
  { id: 'firstaid',  label: 'Basic first-aid knowledge' },
];

const PACKING_CATEGORIES = [
  {
    name: 'Clothing',
    items: [
      { id: 'base_layer',   label: 'Moisture-wicking base layer (2 sets)' },
      { id: 'fleece',       label: 'Fleece jacket / mid layer' },
      { id: 'rain_jacket',  label: 'Waterproof rain jacket' },
      { id: 'trek_pants',   label: 'Trek pants (2 pairs)' },
      { id: 'thermal',      label: 'Thermal innerwear' },
      { id: 'gloves',       label: 'Warm gloves' },
      { id: 'beanie',       label: 'Woollen beanie / balaclava' },
      { id: 'socks',        label: 'Woollen socks (3 pairs)' },
      { id: 'gaiters',      label: 'Gaiters (for snow treks)' },
    ],
  },
  {
    name: 'Footwear',
    items: [
      { id: 'trek_boots',   label: 'Waterproof trekking boots (broken-in)' },
      { id: 'camp_shoes',   label: 'Camp shoes / sandals' },
      { id: 'microspikes',  label: 'Microspikes / crampons (snow treks)' },
    ],
  },
  {
    name: 'Gear',
    items: [
      { id: 'backpack',     label: '50–60L trekking backpack with rain cover' },
      { id: 'sleeping_bag', label: 'Sleeping bag (-10°C rated)' },
      { id: 'trekking_pole',label: 'Trekking poles (pair)' },
      { id: 'headlamp',     label: 'Headlamp + extra batteries' },
      { id: 'sunglasses',   label: 'UV-protection sunglasses' },
      { id: 'sun_hat',      label: 'Sun hat / cap' },
    ],
  },
  {
    name: 'Safety & Medical',
    items: [
      { id: 'first_aid',    label: 'Personal first-aid kit' },
      { id: 'diamox',       label: 'Diamox / altitude sickness medication' },
      { id: 'sunscreen',    label: 'SPF 50+ sunscreen' },
      { id: 'lip_balm',     label: 'Lip balm with SPF' },
      { id: 'water_bottle', label: 'Water bottle (1L) + water purification tablets' },
      { id: 'whistle',      label: 'Emergency whistle' },
    ],
  },
  {
    name: 'Documents & Essentials',
    items: [
      { id: 'id_proof',     label: 'Government ID (Aadhaar / Passport)' },
      { id: 'booking_ticket',label: 'Printed booking ticket' },
      { id: 'insurance',    label: 'Travel insurance documents' },
      { id: 'cash',         label: 'Cash (ATMs unavailable on trail)' },
      { id: 'power_bank',   label: 'Power bank (20,000 mAh)' },
      { id: 'camera',       label: 'Camera / extra memory cards' },
    ],
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<DashboardTab>('profile');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Bookings
  const { data: bookingsData, isLoading: bookingsLoading, refetch: refetchBookings } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => bookingApi.getMyBookings(0, 100).then((r) => r.data.data.content),
    enabled: ['upcoming', 'completed', 'documents', 'certificates'].includes(activeTab),
  });
  const allBookings: BookingConfirmation[] = bookingsData ?? [];
  const upcomingBookings = allBookings.filter(
    (b) => (b.status === 'CONFIRMED' || b.status === 'PENDING') && new Date(b.startDate) >= new Date()
  );
  const completedBookings = allBookings.filter((b) => b.status === 'COMPLETED');

  // Payment history
  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['payment-history'],
    queryFn: () => bookingApi.getPaymentHistory(0, 50).then((r) => r.data.data.content),
    enabled: activeTab === 'payments',
  });
  const payments: PaymentHistory[] = paymentsData ?? [];

  // Cancel booking
  const [cancelRef, setCancelRef] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    if (!cancelRef || !cancelReason.trim()) { toast.error('Provide a reason'); return; }
    setCancelling(true);
    try {
      await bookingApi.cancelBooking(cancelRef, cancelReason);
      toast.success('Booking cancelled');
      setCancelRef(null);
      setCancelReason('');
      refetchBookings();
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Cancellation failed');
    } finally {
      setCancelling(false);
    }
  };

  // Download
  const downloadDoc = async (bookingRef: string, type: 'ticket' | 'invoice') => {
    try {
      const res = type === 'ticket'
        ? await bookingApi.downloadTicket(bookingRef)
        : await bookingApi.downloadInvoice(bookingRef);
      downloadBlob(res.data, `${type}-${bookingRef}.pdf`);
    } catch { toast.error(`Failed to download ${type}`); }
  };

  // Review modal
  const [reviewBookingRef, setReviewBookingRef] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState<ReviewForm>({ rating: 5, title: '', comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  const submitReview = async () => {
    if (!reviewBookingRef || !reviewForm.title.trim() || !reviewForm.comment.trim()) {
      toast.error('Please fill in all review fields');
      return;
    }
    setSubmittingReview(true);
    try {
      const booking = allBookings.find((item) => item.bookingRef === reviewBookingRef);
      if (!booking?.trekSlug) throw new Error('Booking details unavailable');

      const trekResponse = await trekApi.getBySlug(booking.trekSlug);
      await reviewApi.create({
        trekId: trekResponse.data.data.id,
        rating: reviewForm.rating,
        title: reviewForm.title,
        comment: reviewForm.comment,
      });

      toast.success('Review submitted! It will appear after approval.');
      setReviewBookingRef(null);
      setReviewForm({ rating: 5, title: '', comment: '' });
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? err?.message ?? 'Review submission failed');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Fitness checklist
  const [fitnessChecked, setFitnessChecked] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem('fitness-checklist') ?? '{}'); } catch { return {}; }
  });
  const toggleFitness = (id: string) => {
    const next = { ...fitnessChecked, [id]: !fitnessChecked[id] };
    setFitnessChecked(next);
    localStorage.setItem('fitness-checklist', JSON.stringify(next));
  };

  // Packing list
  const [packingChecked, setPackingChecked] = useState<Record<string, boolean>>(() => {
    if (typeof window === 'undefined') return {};
    try { return JSON.parse(localStorage.getItem('packing-list') ?? '{}'); } catch { return {}; }
  });
  const togglePacking = (id: string) => {
    const next = { ...packingChecked, [id]: !packingChecked[id] };
    setPackingChecked(next);
    localStorage.setItem('packing-list', JSON.stringify(next));
  };

  // Uploaded documents (local state — backend upload wired in Phase 9)
  const [uploadedDocs, setUploadedDocs] = useState<{ name: string; size: string; type: string }[]>([]);
  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    const newDocs = files.map((f) => ({
      name: f.name,
      size: `${(f.size / 1024).toFixed(1)} KB`,
      type: f.type.includes('pdf') ? 'PDF' : 'Image',
    }));
    setUploadedDocs((prev) => [...prev, ...newDocs]);
    toast.success(`${files.length} document(s) uploaded`);
    e.target.value = '';
  };

  // Profile form
  const profileForm = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name:    user?.name ?? '',
      phone:   user?.phone ?? '',
      city:    (user as any)?.city ?? '',
      state:   (user as any)?.state ?? '',
      country: (user as any)?.country ?? 'India',
    },
  });
  const profileMutation = useMutation({
    mutationFn: (data: UpdateProfileFormData) => authApi.updateProfile(data),
    onSuccess: ({ data }) => { updateUser(data.data as any); toast.success('Profile updated!'); },
    onError: () => toast.error('Failed to update profile'),
  });

  // Password form
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const passwordForm = useForm<ChangePasswordData>({ resolver: zodResolver(changePasswordSchema) });
  const passwordMutation = useMutation({
    mutationFn: (d: ChangePasswordData) =>
      authApi.changePassword(d),
    onSuccess: () => { toast.success('Password changed!'); passwordForm.reset(); },
    onError: (err: any) => toast.error(err?.response?.data?.error ?? 'Failed to change password'),
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Stats
  const totalSpent = allBookings
    .filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const groups = TABS.reduce<Record<string, typeof TABS>>((acc, tab) => {
    (acc[tab.group] ??= []).push(tab);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Hero header */}
      <div className="border-b border-border bg-gradient-to-r from-brand-500/10 to-emerald-500/10">
        <div className="container py-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold text-foreground">My Dashboard</h1>
              <p className="mt-1 text-muted-foreground">Welcome back, {user?.name?.split(' ')[0]} 👋</p>
            </div>
            {/* Quick stats */}
            <div className="flex flex-wrap gap-3">
              {[
                { label: 'Bookings', value: allBookings.length },
                { label: 'Completed', value: completedBookings.length },
                { label: 'Spent', value: formatCurrency(totalSpent) },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl border border-border bg-card px-4 py-2 text-center">
                  <div className="font-display text-lg font-bold text-foreground">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">

          {/* ── Sidebar ── */}
          <aside className="space-y-4">
            {/* Avatar card */}
            <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-6">
              <div className="relative">
                <div className="h-20 w-20 overflow-hidden rounded-full bg-brand-500/10">
                  {avatarPreview || user?.avatarUrl ? (
                    <img src={avatarPreview || user?.avatarUrl || ''} alt={user?.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center font-display text-3xl font-bold text-brand-500">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <label htmlFor="avatar-upload" className="absolute -bottom-1 -right-1 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-brand-500 text-white shadow-lg hover:bg-brand-600">
                  <Camera className="h-3.5 w-3.5" />
                </label>
                <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div className="mt-3 text-center">
                <div className="font-semibold text-foreground">{user?.name}</div>
                <div className="text-xs text-muted-foreground">{user?.email}</div>
                {user?.emailVerified ? (
                  <div className="mt-1.5 flex items-center justify-center gap-1 text-xs text-emerald-500">
                    <CheckCircle className="h-3 w-3" /> Verified
                  </div>
                ) : (
                  <div className="mt-1.5 flex items-center justify-center gap-1 text-xs text-amber-500">
                    <AlertCircle className="h-3 w-3" /> Not verified
                  </div>
                )}
              </div>
            </div>

            {/* Nav */}
            <nav className="overflow-hidden rounded-2xl border border-border bg-card">
              {Object.entries(groups).map(([group, tabs], gi) => (
                <div key={group}>
                  {gi > 0 && <div className="border-t border-border" />}
                  <div className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{group}</div>
                  {tabs.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      className={cn(
                        'flex w-full items-center justify-between px-4 py-2.5 text-sm font-medium transition-colors',
                        activeTab === tab.key
                          ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                    >
                      <span className="flex items-center gap-2.5">
                        <tab.icon className="h-4 w-4" />
                        {tab.label}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 opacity-40" />
                    </button>
                  ))}
                </div>
              ))}
            </nav>
          </aside>

          {/* ── Main content ── */}
          <main>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >

                {/* ── PROFILE ── */}
                {activeTab === 'profile' && (
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="mb-6 font-display text-xl font-bold text-foreground">Personal Information</h2>
                    <form onSubmit={profileForm.handleSubmit((d) => profileMutation.mutate(d))} className="space-y-5">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className="mb-1.5 block text-sm font-medium text-foreground">Full Name</label>
                          <div className="relative">
                            <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input {...profileForm.register('name')} className={cn('w-full rounded-xl border bg-background py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20', profileForm.formState.errors.name ? 'border-red-500' : 'border-border')} />
                          </div>
                          {profileForm.formState.errors.name && <p className="mt-1 text-xs text-red-500">{profileForm.formState.errors.name.message}</p>}
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-foreground">Phone</label>
                          <div className="relative">
                            <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input {...profileForm.register('phone')} type="tel" placeholder="9876543210" className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm outline-none transition-all focus:border-brand-500" />
                          </div>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-foreground">Gender</label>
                          <select {...profileForm.register('gender')} className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand-500">
                            <option value="">Select gender</option>
                            {['Male', 'Female', 'Other', 'Prefer not to say'].map((g) => <option key={g}>{g}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-foreground">Date of Birth</label>
                          <div className="relative">
                            <Calendar className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input {...profileForm.register('dateOfBirth')} type="date" className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm outline-none focus:border-brand-500" />
                          </div>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-foreground">City</label>
                          <div className="relative">
                            <MapPin className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input {...profileForm.register('city')} placeholder="Mumbai" className="w-full rounded-xl border border-border bg-background py-3 pl-10 pr-4 text-sm outline-none focus:border-brand-500" />
                          </div>
                        </div>
                        <div>
                          <label className="mb-1.5 block text-sm font-medium text-foreground">State</label>
                          <input {...profileForm.register('state')} placeholder="Maharashtra" className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand-500" />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="mb-1.5 block text-sm font-medium text-foreground">Address</label>
                          <textarea {...profileForm.register('address')} rows={3} placeholder="Your full address" className="w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand-500" />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button type="submit" disabled={profileMutation.isPending} className="flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-600 disabled:opacity-70">
                          {profileMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : <><Save className="h-4 w-4" /> Save Changes</>}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* ── SECURITY ── */}
                {activeTab === 'security' && (
                  <div className="rounded-2xl border border-border bg-card p-6">
                    <h2 className="mb-6 font-display text-xl font-bold text-foreground">Change Password</h2>
                    <form onSubmit={passwordForm.handleSubmit((d) => passwordMutation.mutate(d))} className="max-w-md space-y-5">
                      {([
                        { name: 'currentPassword' as const, label: 'Current Password', key: 'current' as const },
                        { name: 'newPassword' as const,     label: 'New Password',     key: 'new' as const },
                        { name: 'confirmPassword' as const, label: 'Confirm Password', key: 'confirm' as const },
                      ]).map(({ name, label, key }) => (
                        <div key={name}>
                          <label className="mb-1.5 block text-sm font-medium text-foreground">{label}</label>
                          <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input {...passwordForm.register(name)} type={showPw[key] ? 'text' : 'password'} placeholder="••••••••" className={cn('w-full rounded-xl border bg-background py-3 pl-10 pr-11 text-sm outline-none transition-all focus:border-brand-500', passwordForm.formState.errors[name] ? 'border-red-500' : 'border-border')} />
                            <button type="button" onClick={() => setShowPw((p) => ({ ...p, [key]: !p[key] }))} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                              {showPw[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                          {passwordForm.formState.errors[name] && <p className="mt-1 text-xs text-red-500">{passwordForm.formState.errors[name]?.message}</p>}
                        </div>
                      ))}
                      <button type="submit" disabled={passwordMutation.isPending} className="flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 hover:bg-brand-600 disabled:opacity-70">
                        {passwordMutation.isPending ? <><Loader2 className="h-4 w-4 animate-spin" /> Changing...</> : <><Shield className="h-4 w-4" /> Change Password</>}
                      </button>
                    </form>
                  </div>
                )}

                {/* ── UPCOMING TREKS ── */}
                {activeTab === 'upcoming' && (
                  <div>
                    <SectionHeader title="Upcoming Treks" description="Your confirmed and pending trek bookings" />
                    {bookingsLoading ? <LoadingSpinner /> : upcomingBookings.length === 0 ? (
                      <EmptyState icon={Mountain} title="No upcoming treks" description="Book your next adventure!" action={{ label: 'Browse Treks', href: '/treks' }} />
                    ) : (
                      <div className="space-y-4">
                        {upcomingBookings.map((b) => (
                          <BookingCard
                            key={b.bookingRef}
                            booking={b}
                            onCancel={() => setCancelRef(b.bookingRef)}
                            onDownload={downloadDoc}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── COMPLETED TREKS ── */}
                {activeTab === 'completed' && (
                  <div>
                    <SectionHeader title="Completed Treks" description="Your trek history and achievements" />
                    {bookingsLoading ? <LoadingSpinner /> : completedBookings.length === 0 ? (
                      <EmptyState icon={CheckCircle2} title="No completed treks yet" description="Complete your first trek to see it here" />
                    ) : (
                      <div className="space-y-4">
                        {completedBookings.map((b) => (
                          <BookingCard
                            key={b.bookingRef}
                            booking={b}
                            onDownload={downloadDoc}
                            onReview={() => setReviewBookingRef(b.bookingRef)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── WISHLIST ── */}
                {activeTab === 'wishlist' && (
                  <div>
                    <SectionHeader title="Wishlist" description="Treks you have saved for later" />
                    <div className="rounded-2xl border border-border bg-card p-8 text-center">
                      <Heart className="mx-auto h-12 w-12 text-muted-foreground/30" />
                      <p className="mt-4 font-semibold text-foreground">Wishlist coming soon</p>
                      <p className="mt-1 text-sm text-muted-foreground">Save treks from the listing page to see them here</p>
                      <Link href="/treks" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white">
                        <Mountain className="h-4 w-4" /> Browse Treks
                      </Link>
                    </div>
                  </div>
                )}

                {/* ── PAYMENT HISTORY ── */}
                {activeTab === 'payments' && (
                  <div>
                    <SectionHeader title="Payment History" description="All your transactions" />
                    {paymentsLoading ? <LoadingSpinner /> : payments.length === 0 ? (
                      <EmptyState icon={CreditCard} title="No payments yet" description="Your payment history will appear here" />
                    ) : (
                      <div className="overflow-hidden rounded-2xl border border-border bg-card">
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead>
                              <tr className="border-b border-border bg-muted/50">
                                {['Trek', 'Date', 'Amount', 'Gateway', 'Status', 'Actions'].map((h) => (
                                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {payments.map((p) => (
                                <tr key={p.paymentId} className="hover:bg-muted/30">
                                  <td className="px-4 py-3">
                                    <div className="font-medium text-foreground">{p.trekTitle}</div>
                                    <div className="text-xs text-muted-foreground font-mono">{p.bookingRef}</div>
                                  </td>
                                  <td className="px-4 py-3 text-muted-foreground">{p.paidAt ? formatDate(p.paidAt, 'dd MMM yyyy') : '—'}</td>
                                  <td className="px-4 py-3 font-semibold text-foreground">{formatCurrency(p.amount)}</td>
                                  <td className="px-4 py-3">
                                    <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-semibold">{p.gateway}</span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <PaymentStatusBadge status={p.status} />
                                  </td>
                                  <td className="px-4 py-3">
                                    <button onClick={() => downloadDoc(p.bookingRef, 'invoice')} className="inline-flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-semibold hover:bg-muted">
                                      <Download className="h-3 w-3" /> Invoice
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* ── DOCUMENTS ── */}
                {activeTab === 'documents' && (
                  <div>
                    <SectionHeader title="Documents" description="Upload and manage your travel documents" />
                    <div className="space-y-4">
                      {/* Upload area */}
                      <div className="rounded-2xl border-2 border-dashed border-border bg-card p-8 text-center">
                        <Upload className="mx-auto h-10 w-10 text-muted-foreground/50" />
                        <p className="mt-3 font-semibold text-foreground">Upload Documents</p>
                        <p className="mt-1 text-sm text-muted-foreground">ID proof, medical certificates, insurance — PDF or image</p>
                        <label htmlFor="doc-upload" className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600">
                          <Upload className="h-4 w-4" /> Choose Files
                        </label>
                        <input id="doc-upload" type="file" multiple accept=".pdf,image/*" className="hidden" onChange={handleDocUpload} />
                      </div>

                      {/* Uploaded list */}
                      {uploadedDocs.length > 0 && (
                        <div className="overflow-hidden rounded-2xl border border-border bg-card">
                          <div className="border-b border-border px-5 py-3">
                            <h3 className="font-semibold text-foreground">Uploaded Documents ({uploadedDocs.length})</h3>
                          </div>
                          <div className="divide-y divide-border">
                            {uploadedDocs.map((doc, i) => (
                              <div key={i} className="flex items-center justify-between px-5 py-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500/10">
                                    <FileText className="h-4 w-4 text-brand-500" />
                                  </div>
                                  <div>
                                    <div className="text-sm font-medium text-foreground">{doc.name}</div>
                                    <div className="text-xs text-muted-foreground">{doc.type} · {doc.size}</div>
                                  </div>
                                </div>
                                <button onClick={() => setUploadedDocs((prev) => prev.filter((_, j) => j !== i))} className="text-xs text-red-500 hover:text-red-600">Remove</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Booking documents */}
                      {bookingsLoading ? <LoadingSpinner /> : allBookings.filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED').length > 0 && (
                        <div className="overflow-hidden rounded-2xl border border-border bg-card">
                          <div className="border-b border-border px-5 py-3">
                            <h3 className="font-semibold text-foreground">Booking Documents</h3>
                          </div>
                          <div className="divide-y divide-border">
                            {allBookings
                              .filter((b) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
                              .map((b) => (
                                <div key={b.bookingRef} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <div className="font-medium text-foreground">{b.trekTitle}</div>
                                    <div className="text-xs text-muted-foreground">{b.bookingRef} · {formatDate(b.startDate, 'dd MMM yyyy')}</div>
                                  </div>
                                  <div className="flex gap-2">
                                    <button onClick={() => downloadDoc(b.bookingRef, 'ticket')} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted">
                                      <Ticket className="h-3.5 w-3.5" /> Ticket
                                    </button>
                                    <button onClick={() => downloadDoc(b.bookingRef, 'invoice')} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted">
                                      <FileText className="h-3.5 w-3.5" /> Invoice
                                    </button>
                                  </div>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* ── CERTIFICATES ── */}
                {activeTab === 'certificates' && (
                  <div>
                    <SectionHeader title="Certificates" description="Completion certificates for your treks" />
                    {bookingsLoading ? <LoadingSpinner /> : completedBookings.length === 0 ? (
                      <EmptyState icon={Award} title="No certificates yet" description="Complete a trek to earn your certificate" />
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        {completedBookings.map((b) => (
                          <div key={b.bookingRef} className="overflow-hidden rounded-2xl border border-border bg-card">
                            <div className="bg-gradient-to-br from-brand-500/20 to-emerald-500/20 p-6 text-center">
                              <Award className="mx-auto h-12 w-12 text-brand-500" />
                              <h3 className="mt-3 font-display text-lg font-bold text-foreground">Certificate of Completion</h3>
                              <p className="mt-1 text-sm text-muted-foreground">{b.trekTitle}</p>
                            </div>
                            <div className="p-4">
                              <div className="space-y-1.5 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Trekker</span>
                                  <span className="font-medium text-foreground">{user?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Completed</span>
                                  <span className="font-medium text-foreground">{formatDate(b.endDate, 'dd MMM yyyy')}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Ref</span>
                                  <span className="font-mono text-xs text-foreground">{b.bookingRef}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => toast.success('Certificate download coming soon!')}
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-border py-2 text-sm font-semibold hover:bg-muted"
                              >
                                <Download className="h-4 w-4" /> Download Certificate
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── FITNESS CHECKLIST ── */}
                {activeTab === 'fitness' && (
                  <div>
                    <SectionHeader
                      title="Fitness Checklist"
                      description={`${Object.values(fitnessChecked).filter(Boolean).length} / ${FITNESS_ITEMS.length} completed`}
                    />
                    <div className="rounded-2xl border border-border bg-card">
                      {/* Progress bar */}
                      <div className="border-b border-border p-5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground">Overall Progress</span>
                          <span className="font-bold text-brand-500">
                            {Math.round((Object.values(fitnessChecked).filter(Boolean).length / FITNESS_ITEMS.length) * 100)}%
                          </span>
                        </div>
                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-brand-500 transition-all duration-500"
                            style={{ width: `${(Object.values(fitnessChecked).filter(Boolean).length / FITNESS_ITEMS.length) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="divide-y divide-border">
                        {FITNESS_ITEMS.map((item) => (
                          <label key={item.id} className="flex cursor-pointer items-center gap-4 px-5 py-3.5 hover:bg-muted/50">
                            <div className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors', fitnessChecked[item.id] ? 'border-brand-500 bg-brand-500' : 'border-border')}>
                              {fitnessChecked[item.id] && <CheckCircle2 className="h-3 w-3 text-white" />}
                            </div>
                            <input type="checkbox" className="sr-only" checked={!!fitnessChecked[item.id]} onChange={() => toggleFitness(item.id)} />
                            <span className={cn('text-sm', fitnessChecked[item.id] ? 'text-muted-foreground line-through' : 'text-foreground')}>
                              {item.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── PACKING LIST ── */}
                {activeTab === 'packing' && (
                  <div>
                    <SectionHeader
                      title="Packing List"
                      description={`${Object.values(packingChecked).filter(Boolean).length} / ${PACKING_CATEGORIES.flatMap((c) => c.items).length} items packed`}
                    />
                    <div className="space-y-4">
                      {PACKING_CATEGORIES.map((cat) => {
                        const catChecked = cat.items.filter((i) => packingChecked[i.id]).length;
                        return (
                          <div key={cat.name} className="overflow-hidden rounded-2xl border border-border bg-card">
                            <div className="flex items-center justify-between border-b border-border px-5 py-3">
                              <h3 className="font-semibold text-foreground">{cat.name}</h3>
                              <span className="text-xs text-muted-foreground">{catChecked}/{cat.items.length}</span>
                            </div>
                            <div className="divide-y divide-border">
                              {cat.items.map((item) => (
                                <label key={item.id} className="flex cursor-pointer items-center gap-4 px-5 py-3 hover:bg-muted/50">
                                  <div className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors', packingChecked[item.id] ? 'border-emerald-500 bg-emerald-500' : 'border-border')}>
                                    {packingChecked[item.id] && <CheckCircle2 className="h-3 w-3 text-white" />}
                                  </div>
                                  <input type="checkbox" className="sr-only" checked={!!packingChecked[item.id]} onChange={() => togglePacking(item.id)} />
                                  <span className={cn('text-sm', packingChecked[item.id] ? 'text-muted-foreground line-through' : 'text-foreground')}>
                                    {item.label}
                                  </span>
                                </label>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* ── Cancel Modal ── */}
      {cancelRef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h2 className="font-display text-xl font-bold text-foreground">Cancel Booking</h2>
            <p className="mt-1 text-sm text-muted-foreground">Ref: <span className="font-mono font-semibold">{cancelRef}</span></p>
            <p className="mt-3 rounded-xl bg-amber-500/10 p-3 text-sm text-amber-700">Free cancellation is available up to 15 days before the trek date.</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a reason for cancellation..."
              rows={3}
              className="mt-4 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-brand-500"
            />
            <div className="mt-4 flex gap-3">
              <button onClick={() => { setCancelRef(null); setCancelReason(''); }} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold hover:bg-muted">Keep Booking</button>
              <button onClick={handleCancel} disabled={cancelling || !cancelReason.trim()} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60">
                {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />} Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Review Modal ── */}
      {reviewBookingRef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h2 className="font-display text-xl font-bold text-foreground">Write a Review</h2>
            <p className="mt-1 text-sm text-muted-foreground">Ref: <span className="font-mono font-semibold">{reviewBookingRef}</span></p>
            {/* Star rating */}
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-foreground">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => setReviewForm((f) => ({ ...f, rating: star }))} className="transition-transform hover:scale-110">
                    <Star className={cn('h-7 w-7', star <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground')} />
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Review Title</label>
              <input
                value={reviewForm.title}
                onChange={(e) => setReviewForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="Summarise your experience"
                className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-500"
              />
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-foreground">Your Review</label>
              <textarea
                value={reviewForm.comment}
                onChange={(e) => setReviewForm((f) => ({ ...f, comment: e.target.value }))}
                placeholder="Share your experience in detail..."
                rows={4}
                className="w-full resize-none rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-brand-500"
              />
            </div>
            <div className="mt-5 flex gap-3">
              <button onClick={() => setReviewBookingRef(null)} className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold hover:bg-muted">Cancel</button>
              <button onClick={submitReview} disabled={submittingReview} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60">
                {submittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />} Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-5">
      <h2 className="font-display text-2xl font-bold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex min-h-[200px] items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
    </div>
  );
}

function EmptyState({
  icon: Icon, title, description, action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: { label: string; href: string };
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-12 text-center">
      <Icon className="mx-auto h-12 w-12 text-muted-foreground/30" />
      <p className="mt-4 font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      {action && (
        <Link href={action.href} className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white">
          {action.label}
        </Link>
      )}
    </div>
  );
}

function BookingCard({
  booking, onCancel, onDownload, onReview,
}: {
  booking: BookingConfirmation;
  onCancel?: () => void;
  onDownload: (ref: string, type: 'ticket' | 'invoice') => void;
  onReview?: () => void;
}) {
  const cfg = STATUS_CFG[booking.status];
  const canCancel = (booking.status === 'CONFIRMED' || booking.status === 'PENDING') && !!onCancel;
  const canDownload = booking.status === 'CONFIRMED' || booking.status === 'COMPLETED';

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', cfg.cls)}>{cfg.label}</span>
            <span className="font-mono text-xs text-muted-foreground">{booking.bookingRef}</span>
          </div>
          <h3 className="mt-2 font-display text-lg font-bold text-foreground">{booking.trekTitle}</h3>
          <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" />{formatDate(booking.startDate, 'dd MMM')} – {formatDate(booking.endDate, 'dd MMM yyyy')}</span>
            <span className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5" />{formatRelativeTime(booking.createdAt)}</span>
          </div>
        </div>
        <div className="shrink-0 text-right">
          <div className="font-display text-xl font-bold text-foreground">{formatCurrency(booking.totalAmount)}</div>
          <div className="mt-1 text-xs text-muted-foreground">{booking.numAdults + booking.numChildren} travelers</div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
        <Link href={`/bookings/${booking.bookingRef}`} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted">
          <ChevronRight className="h-3.5 w-3.5" /> View Details
        </Link>
        {canDownload && (
          <>
            <button onClick={() => onDownload(booking.bookingRef, 'ticket')} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted">
              <Download className="h-3.5 w-3.5" /> Ticket
            </button>
            <button onClick={() => onDownload(booking.bookingRef, 'invoice')} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold hover:bg-muted">
              <FileText className="h-3.5 w-3.5" /> Invoice
            </button>
          </>
        )}
        {onReview && (
          <button onClick={onReview} className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-600 hover:bg-amber-50 dark:border-amber-900 dark:hover:bg-amber-950">
            <Star className="h-3.5 w-3.5" /> Write Review
          </button>
        )}
        {canCancel && (
          <button onClick={onCancel} className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950">
            <XCircle className="h-3.5 w-3.5" /> Cancel
          </button>
        )}
      </div>
    </div>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    SUCCESS:            'bg-emerald-500/10 text-emerald-600',
    PENDING:            'bg-amber-500/10 text-amber-600',
    FAILED:             'bg-red-500/10 text-red-600',
    REFUNDED:           'bg-purple-500/10 text-purple-600',
    PARTIALLY_REFUNDED: 'bg-blue-500/10 text-blue-600',
  };
  return (
    <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', map[status] ?? 'bg-muted text-muted-foreground')}>
      {status.replace('_', ' ')}
    </span>
  );
}
