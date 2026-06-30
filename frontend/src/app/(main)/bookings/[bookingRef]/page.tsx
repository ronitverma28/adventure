'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Calendar, CheckCircle2, Download, FileText, Loader2, MapPin, Users } from 'lucide-react';
import { bookingApi } from '@/lib/api/booking.api';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import type { BookingConfirmation } from '@/types/booking.types';

export default function BookingConfirmationPage() {
  const params = useParams<{ bookingRef: string }>();
  const [booking, setBooking] = useState<BookingConfirmation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookingApi.getBooking(params.bookingRef)
      .then((response) => setBooking(response.data.data))
      .finally(() => setLoading(false));
  }, [params.bookingRef]);

  const downloadDocument = async (type: 'ticket' | 'invoice') => {
    const response = type === 'ticket'
      ? await bookingApi.downloadTicket(params.bookingRef)
      : await bookingApi.downloadInvoice(params.bookingRef);
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}-${params.bookingRef}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </section>
    );
  }

  if (!booking) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <h1 className="font-display text-3xl font-bold text-foreground">Booking not found</h1>
        <Link href="/profile" className="mt-5 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white">Go to profile</Link>
      </section>
    );
  }

  return (
    <section className="bg-background pt-24 pb-10">
      <div className="mx-auto max-w-4xl px-4">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-600">
                <CheckCircle2 className="h-4 w-4" /> Booking confirmed
              </div>
              <h1 className="mt-4 font-display text-3xl font-bold text-foreground">{booking.trekTitle}</h1>
              <p className="mt-2 text-muted-foreground">Reference: <span className="font-semibold text-foreground">{booking.bookingRef}</span></p>
            </div>
            <div className="rounded-xl border border-border bg-background px-4 py-3 text-right">
              <div className="text-xs text-muted-foreground">Amount paid</div>
              <div className="font-display text-2xl font-bold text-foreground">{formatCurrency(booking.totalAmount)}</div>
            </div>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-background p-4">
              <Calendar className="h-5 w-5 text-brand-500" />
              <div className="mt-2 text-sm font-semibold text-foreground">{formatDate(booking.startDate, 'dd MMM')} - {formatDate(booking.endDate, 'dd MMM yyyy')}</div>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <Users className="h-5 w-5 text-brand-500" />
              <div className="mt-2 text-sm font-semibold text-foreground">{booking.numAdults + booking.numChildren} travelers</div>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <MapPin className="h-5 w-5 text-brand-500" />
              <div className="mt-2 text-sm font-semibold text-foreground">{booking.status}</div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="font-display text-xl font-bold text-foreground">Travelers</h2>
            <div className="mt-4 divide-y divide-border rounded-xl border border-border">
              {booking.travelers.map((traveler) => (
                <div key={`${traveler.name}-${traveler.idNumber}`} className="flex items-center justify-between p-4 text-sm">
                  <div>
                    <div className="font-semibold text-foreground">{traveler.name}</div>
                    <div className="text-muted-foreground">{traveler.age} yrs · {traveler.gender}</div>
                  </div>
                  {traveler.isLeader && <span className="rounded-full bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-600">Leader</span>}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => downloadDocument('ticket')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted"
            >
              <Download className="h-4 w-4" /> Ticket
            </button>
            <button
              onClick={() => downloadDocument('invoice')}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted"
            >
              <FileText className="h-4 w-4" /> Invoice
            </button>
            <Link href="/profile" className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white">
              View dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
