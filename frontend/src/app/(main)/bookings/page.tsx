'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, Calendar, CheckCircle2, Clock, Download,
  FileText, Loader2, MapPin, Mountain, Users, XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingApi } from '@/lib/api/booking.api';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import type { BookingConfirmation, BookingStatus } from '@/types/booking.types';

const STATUS_CONFIG: Record<BookingStatus, { label: string; className: string }> = {
  PENDING:   { label: 'Pending',   className: 'bg-amber-500/10 text-amber-600' },
  CONFIRMED: { label: 'Confirmed', className: 'bg-emerald-500/10 text-emerald-600' },
  COMPLETED: { label: 'Completed', className: 'bg-blue-500/10 text-blue-600' },
  CANCELLED: { label: 'Cancelled', className: 'bg-red-500/10 text-red-600' },
  REFUNDED:  { label: 'Refunded',  className: 'bg-purple-500/10 text-purple-600' },
};

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<BookingConfirmation[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancelRef, setCancelRef] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [filter, setFilter] = useState<BookingStatus | 'ALL'>('ALL');

  useEffect(() => {
    bookingApi.getMyBookings(0, 50)
      .then((r) => setBookings(r.data.data.content))
      .catch(() => toast.error('Failed to load bookings'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async () => {
    if (!cancelRef || !cancelReason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }
    setCancelling(true);
    try {
      await bookingApi.cancelBooking(cancelRef, cancelReason);
      setBookings((prev) =>
        prev.map((b) => b.bookingRef === cancelRef ? { ...b, status: 'CANCELLED' } : b)
      );
      toast.success('Booking cancelled successfully');
      setCancelRef(null);
      setCancelReason('');
    } catch (err: any) {
      toast.error(err?.response?.data?.error ?? 'Cancellation failed');
    } finally {
      setCancelling(false);
    }
  };

  const downloadDoc = async (bookingRef: string, type: 'ticket' | 'invoice') => {
    try {
      const res = type === 'ticket'
        ? await bookingApi.downloadTicket(bookingRef)
        : await bookingApi.downloadInvoice(bookingRef);
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-${bookingRef}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      toast.error(`Failed to download ${type}`);
    }
  };

  const filtered = filter === 'ALL' ? bookings : bookings.filter((b) => b.status === filter);

  if (loading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-background pt-16 pb-8">
      <div className="mx-auto max-w-5xl px-4">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Link>
            <h1 className="mt-2 font-display text-3xl font-bold text-foreground">My Bookings</h1>
            <p className="mt-1 text-sm text-muted-foreground">{bookings.length} total booking{bookings.length !== 1 ? 's' : ''}</p>
          </div>
          <Link
            href="/bookings/new"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600"
          >
            <Mountain className="h-4 w-4" /> Book a Trek
          </Link>
        </div>

        {/* Filter tabs */}
        <div className="mt-6 flex flex-wrap gap-2">
          {(['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED', 'REFUNDED'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                'rounded-full px-4 py-1.5 text-xs font-semibold transition-colors',
                filter === s
                  ? 'bg-brand-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              )}
            >
              {s === 'ALL' ? 'All' : STATUS_CONFIG[s].label}
              {s !== 'ALL' && (
                <span className="ml-1.5 opacity-70">
                  ({bookings.filter((b) => b.status === s).length})
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Booking cards */}
        <div className="mt-6 space-y-4">
          {filtered.length === 0 ? (
            <div className="rounded-2xl border border-border bg-card p-12 text-center">
              <Mountain className="mx-auto h-12 w-12 text-muted-foreground/30" />
              <p className="mt-4 font-semibold text-foreground">No bookings found</p>
              <p className="mt-1 text-sm text-muted-foreground">Start your adventure today</p>
              <Link href="/bookings/new" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white">
                Book a Trek
              </Link>
            </div>
          ) : (
            filtered.map((booking) => {
              const cfg = STATUS_CONFIG[booking.status];
              const canCancel = booking.status === 'CONFIRMED' || booking.status === 'PENDING';
              const canDownload = booking.status === 'CONFIRMED' || booking.status === 'COMPLETED';
              return (
                <div key={booking.bookingRef} className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', cfg.className)}>
                          {cfg.label}
                        </span>
                        <span className="text-xs text-muted-foreground font-mono">{booking.bookingRef}</span>
                      </div>
                      <h3 className="mt-2 font-display text-lg font-bold text-foreground">{booking.trekTitle}</h3>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(booking.startDate, 'dd MMM')} – {formatDate(booking.endDate, 'dd MMM yyyy')}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5" />
                          {booking.numAdults + booking.numChildren} travelers
                        </span>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className="font-display text-xl font-bold text-foreground">{formatCurrency(booking.totalAmount)}</div>
                      <div className="mt-1 text-xs text-muted-foreground">{formatDate(booking.createdAt, 'dd MMM yyyy')}</div>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                    <Link
                      href={`/bookings/${booking.bookingRef}`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                    >
                      <MapPin className="h-3.5 w-3.5" /> View Details
                    </Link>
                    {canDownload && (
                      <>
                        <button
                          onClick={() => downloadDoc(booking.bookingRef, 'ticket')}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                        >
                          <Download className="h-3.5 w-3.5" /> Ticket
                        </button>
                        <button
                          onClick={() => downloadDoc(booking.bookingRef, 'invoice')}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                        >
                          <FileText className="h-3.5 w-3.5" /> Invoice
                        </button>
                      </>
                    )}
                    {canCancel && (
                      <button
                        onClick={() => setCancelRef(booking.bookingRef)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                      >
                        <XCircle className="h-3.5 w-3.5" /> Cancel
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Cancel modal */}
      {cancelRef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl">
            <h2 className="font-display text-xl font-bold text-foreground">Cancel Booking</h2>
            <p className="mt-1 text-sm text-muted-foreground">Ref: <span className="font-mono font-semibold">{cancelRef}</span></p>
            <p className="mt-3 text-sm text-muted-foreground">Free cancellation is available up to 15 days before the trek date.</p>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Please provide a reason for cancellation..."
              rows={3}
              className="mt-4 w-full resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none focus:border-brand-500"
            />
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => { setCancelRef(null); setCancelReason(''); }}
                className="flex-1 rounded-xl border border-border py-2.5 text-sm font-semibold text-foreground hover:bg-muted"
              >
                Keep Booking
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling || !cancelReason.trim()}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
              >
                {cancelling ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
