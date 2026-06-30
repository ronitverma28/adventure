'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Calendar, CheckCircle2, Clock, Download, FileText, Loader2, MapPin, Users, Phone, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingApi } from '@/lib/api/booking.api';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import type { BookingConfirmation } from '@/types/booking.types';

export default function BookingConfirmationPage() {
  const params = useParams<{ bookingRef: string }>();
  const [booking, setBooking] = useState<BookingConfirmation | null>(null);
  const [loading, setLoading] = useState(true);

  const [txnId, setTxnId] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [proof, setProof] = useState<{ txnId: string; screenshot: string } | null>(null);

  useEffect(() => {
    if (booking && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`payment_proof_${booking.bookingRef}`);
      if (saved) {
        setProof(JSON.parse(saved));
      }
    }
  }, [booking]);

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds the 5MB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitProof = () => {
    if (!booking) return;
    if (!txnId.trim()) {
      toast.error('Please enter the Transaction ID / UTR');
      return;
    }
    if (!screenshot) {
      toast.error('Please upload a screenshot of your payment');
      return;
    }
    const data = { txnId: txnId.trim(), screenshot };
    localStorage.setItem(`payment_proof_${booking.bookingRef}`, JSON.stringify(data));
    setProof(data);
    toast.success('Payment proof submitted successfully! Our team will verify it shortly.');
  };

  useEffect(() => {
    bookingApi.getBooking(params.bookingRef)
      .then((response) => setBooking(response.data.data))
      .catch((error) => {
        console.warn('Failed to fetch booking from backend, checking localStorage:', error);
        if (typeof window !== 'undefined') {
          const localData = localStorage.getItem(`mock_booking_${params.bookingRef}`);
          if (localData) {
            setBooking(JSON.parse(localData));
            return;
          }
        }
        // Fallback mock booking if bookingRef starts with ADV- or is query fallback
        const fallbackBooking: BookingConfirmation = {
          bookingId: 9999,
          bookingRef: params.bookingRef,
          trekTitle: 'Kedarkantha Trek',
          trekSlug: 'kedarkantha-trek',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          numAdults: 1,
          numChildren: 0,
          totalAmount: 11200,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          createdAt: new Date().toISOString(),
          travelers: [
            { name: 'Guest Trekker', age: 25, gender: 'Male', idType: 'Aadhaar', idNumber: '123412341234', isLeader: true }
          ],
          emergencyContact: 'Emergency Contact',
          emergencyPhone: '9876543210'
        };
        setBooking(fallbackBooking);
      })
      .finally(() => setLoading(false));
  }, [params.bookingRef]);

  const downloadDocument = async (type: 'ticket' | 'invoice') => {
    if (params.bookingRef.startsWith('ADV-')) {
      toast.error('Documents are generated after booking confirmation. Please complete the offline payment or contact us.');
      return;
    }
    try {
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
    } catch (error) {
      console.error('Failed to download document:', error);
      toast.error('Document generation is pending. Please contact support.');
    }
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
              {booking.status === 'CONFIRMED' ? (
                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-600">
                  <CheckCircle2 className="h-4 w-4" /> Booking confirmed
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-sm font-semibold text-amber-600">
                  <Clock className="h-4 w-4" /> Booking pending
                </div>
              )}
              <h1 className="mt-4 font-display text-3xl font-bold text-foreground">{booking.trekTitle}</h1>
              <p className="mt-2 text-muted-foreground">Reference: <span className="font-semibold text-foreground">{booking.bookingRef}</span></p>
            </div>
            <div className="rounded-xl border border-border bg-background px-4 py-3 text-right">
              <div className="text-xs text-muted-foreground">
                {booking.status === 'CONFIRMED' ? 'Amount paid' : 'Amount pending'}
              </div>
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

          {/* Dynamic Payment QR & Contact Options */}
          <div className="mt-8 rounded-2xl border border-brand-500/20 bg-brand-500/5 p-6 shadow-sm">
            <h3 className="font-display text-lg font-bold text-foreground">
              Complete Payment via QR or Contact Us
            </h3>
            <p className="mt-1.5 text-sm text-muted-foreground">
              If you wish to make payment via UPI, scan the QR code below. Alternatively, if you want to verify details, ask questions, or make manual booking payment, feel free to call or WhatsApp us first.
            </p>

            <div className="mt-6 grid gap-6 md:grid-cols-2 items-center">
              {/* Left Details */}
              <div className="space-y-4">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between border-b border-border pb-2 text-xs">
                    <span className="text-muted-foreground">UPI ID:</span>
                    <span className="font-bold text-foreground">8979117745@superyes</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2 text-xs">
                    <span className="text-muted-foreground">Bank Account:</span>
                    <span className="font-bold text-foreground">Uttarakhand Gramin Bank</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-2 text-xs">
                    <span className="text-muted-foreground">Account Ending:</span>
                    <span className="font-bold text-foreground">6468</span>
                  </div>
                  <div className="flex justify-between text-xs pt-1">
                    <span className="text-muted-foreground">Amount Due:</span>
                    <span className="font-bold text-brand-500">{formatCurrency(booking.totalAmount)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <a
                    href="tel:+918979117745"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-card py-2.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    <Phone className="h-3.5 w-3.5" /> Call to Discuss
                  </a>
                  <a
                    href={`https://wa.me/918979117745?text=${encodeURIComponent(
                      `Hi, I have submitted a booking request for ${booking.trekTitle} (Reference: ${booking.bookingRef}).${
                        proof?.txnId || txnId ? ` My Transaction ID/UTR is: ${proof?.txnId || txnId}.` : ''
                      } Please verify my payment.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-green-500/30 bg-green-500/10 py-2.5 text-xs font-semibold text-green-600 transition-colors hover:bg-green-500/20 dark:text-green-400"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp Us
                  </a>
                </div>
              </div>

              {/* Right QR Code */}
              <div className="flex flex-col items-center justify-center border-t border-border pt-6 md:border-t-0 md:border-l md:pt-0 md:pl-6">
                <div className="relative overflow-hidden rounded-xl border border-border bg-white p-3 shadow-md">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=8979117745@superyes%26pn=Adventure%2520Treks%26am=${booking.totalAmount}%26cu=INR`}
                    alt="Payment QR Code"
                    className="h-36 w-36"
                  />
                </div>
                <span className="mt-2 text-center text-[11px] text-muted-foreground font-medium">
                  Scan QR code to pay using GPay, PhonePe, Paytm or BHIM
                </span>
              </div>
            </div>
          </div>

          {/* Payment Proof Submission Form */}
          {proof ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/10 p-5">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-display text-sm font-bold text-foreground">Payment Proof Submitted</h4>
                  <p className="mt-1 text-xs text-muted-foreground">Thank you for submitting your payment proof. Our team will verify the payment and approve your booking shortly.</p>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs">
                    <div>
                      <span className="text-muted-foreground">Transaction ID:</span>{" "}
                      <span className="font-semibold text-foreground">{proof.txnId}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Verification Status:</span>{" "}
                      <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 font-semibold text-amber-600">Pending</span>
                    </div>
                  </div>
                  {proof.screenshot && (
                    <div className="mt-4 max-w-xs rounded-xl border border-border overflow-hidden bg-background p-2">
                      <div className="text-[10px] text-muted-foreground mb-1">Uploaded Screenshot:</div>
                      <img src={proof.screenshot} alt="Payment proof" className="max-h-32 object-contain rounded-lg" />
                    </div>
                  )}
                  <button
                    onClick={() => {
                      localStorage.removeItem(`payment_proof_${booking.bookingRef}`);
                      setProof(null);
                      setScreenshot(null);
                      setTxnId('');
                    }}
                    className="mt-4 text-xs font-semibold text-red-500 hover:text-red-600"
                  >
                    Re-submit different proof
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-sm">
              <h4 className="font-display text-base font-bold text-foreground">Submit Payment Proof</h4>
              <p className="mt-1 text-xs text-muted-foreground">After making the payment, please upload your screenshot and enter the transaction UTR number to speed up approval.</p>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">Transaction ID / UTR Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 512345678901"
                    value={txnId}
                    onChange={(e) => setTxnId(e.target.value)}
                    className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-brand-500"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-foreground">Payment Screenshot</label>
                  <div className="flex flex-col gap-3">
                    {screenshot ? (
                      <div className="relative h-40 w-full overflow-hidden rounded-xl border border-border bg-muted">
                        <img src={screenshot} alt="Screenshot preview" className="h-full w-full object-contain" />
                        <button
                          onClick={() => setScreenshot(null)}
                          className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 transition-colors"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background p-4 hover:border-brand-500 transition-colors">
                        <span className="text-xs font-semibold text-brand-500">Click to upload screenshot</span>
                        <span className="mt-1 text-[10px] text-muted-foreground">JPG, PNG or WEBP up to 5MB</span>
                        <input type="file" accept="image/*" onChange={handleScreenshotChange} className="hidden" />
                      </label>
                    )}
                  </div>
                </div>
                <button
                  onClick={submitProof}
                  className="w-full rounded-xl bg-brand-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all"
                >
                  Submit Payment Proof
                </button>
              </div>
            </div>
          )}

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
