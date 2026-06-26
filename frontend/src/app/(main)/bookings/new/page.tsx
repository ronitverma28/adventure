'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  AlertCircle, ArrowLeft, Calendar, Check, CheckCircle2, CreditCard, Download,
  FileText, Loader2, MapPin, ShieldCheck, Ticket, UserRound, Users,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { bookingApi } from '@/lib/api/booking.api';
import { trekApi } from '@/lib/api/trek.api';
import { useAuthStore } from '@/store/authStore';
import { useBookingStore } from '@/store/bookingStore';
import { formatCurrency, formatDate } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils/cn';
import type { BookingConfirmation, Traveler } from '@/types/booking.types';
import type { Trek, TrekBatchDate } from '@/types/trek.types';

type PaymentResult = {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
};

type ContactDetails = {
  emergencyContact: string;
  emergencyPhone: string;
  pickupLocation: string;
  specialRequests: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

const STEPS = [
  { id: 1, label: 'Select Trek', icon: MapPin },
  { id: 2, label: 'Choose Date', icon: Calendar },
  { id: 3, label: 'Travelers', icon: Users },
  { id: 4, label: 'Details', icon: UserRound },
  { id: 5, label: 'Coupon', icon: Ticket },
  { id: 6, label: 'Payment', icon: CreditCard },
  { id: 7, label: 'Confirmation', icon: CheckCircle2 },
] as const;

const defaultTraveler = (index: number): Traveler => ({
  name: '',
  age: 18,
  gender: 'Male',
  idType: 'Aadhaar',
  idNumber: '',
  medicalConditions: '',
  isLeader: index === 0,
});

const phoneRegex = /^[6-9]\d{9}$/;

export default function NewBookingPage() {
  return (
    <Suspense
      fallback={
        <section className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
        </section>
      }
    >
      <NewBookingContent />
    </Suspense>
  );
}

function NewBookingContent() {
  const params = useSearchParams();
  const { user, isAuthenticated } = useAuthStore();
  const { isProcessing, setProcessing, updateFormData, reset } = useBookingStore();

  const initialTrekSlug = params.get('trek') ?? '';
  const initialBatchId = Number(params.get('batch') ?? 0);
  const initialTravelers = Math.max(1, Number(params.get('persons') ?? 1));

  const [treks, setTreks] = useState<Trek[]>([]);
  const [treksLoading, setTreksLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [selectedTrekSlug, setSelectedTrekSlug] = useState(initialTrekSlug);
  const [selectedBatchId, setSelectedBatchId] = useState(initialBatchId);
  const [numAdults, setNumAdults] = useState(initialTravelers);
  const [numChildren, setNumChildren] = useState(0);
  const [travelers, setTravelers] = useState<Traveler[]>(
    Array.from({ length: initialTravelers }, (_, index) => defaultTraveler(index))
  );
  const [contact, setContact] = useState<ContactDetails>({
    emergencyContact: user?.name ?? '',
    emergencyPhone: '',
    pickupLocation: '',
    specialRequests: '',
  });
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);

  useEffect(() => {
    let active = true;

    async function loadTreks() {
      try {
        const response = await trekApi.getAll(undefined, 0, 100);
        if (!active) return;
        setTreks(response.data.data.content);
      } catch {
        if (active) toast.error('Failed to load treks');
      } finally {
        if (active) setTreksLoading(false);
      }
    }

    loadTreks();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (treks.length === 0) return;
    if (!selectedTrekSlug) {
      setSelectedTrekSlug(treks[0]?.slug ?? '');
      return;
    }
    const exists = treks.some((trek) => trek.slug === selectedTrekSlug);
    if (!exists) setSelectedTrekSlug(treks[0]?.slug ?? '');
  }, [selectedTrekSlug, treks]);

  const selectedTrek = useMemo(
    () => treks.find((item) => item.slug === selectedTrekSlug) ?? null,
    [selectedTrekSlug, treks]
  );
  const batches = selectedTrek?.upcomingBatches ?? [];
  const selectedBatch = batches.find((item) => item.id === selectedBatchId) ?? batches[0] ?? null;
  const totalTravelers = numAdults + numChildren;
  const adultPrice = selectedBatch?.price ?? selectedTrek?.pricePerPerson ?? 0;
  const childPrice = selectedTrek?.priceChild ?? adultPrice;

  const pricing = useMemo(() => {
    const subtotal = (adultPrice * numAdults) + (childPrice * numChildren);
    const taxable = Math.max(subtotal - couponDiscount, 0);
    const taxAmount = Math.round(taxable * 0.18);
    return {
      pricePerAdult: adultPrice,
      pricePerChild: childPrice,
      numAdults,
      numChildren,
      subtotal,
      couponDiscount,
      taxAmount,
      taxRate: 0.18,
      total: taxable + taxAmount,
    };
  }, [adultPrice, childPrice, couponDiscount, numAdults, numChildren]);

  if (!isAuthenticated) {
    return (
      <section className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
        <ShieldCheck className="h-12 w-12 text-brand-500" />
        <h1 className="mt-4 font-display text-3xl font-bold text-foreground">Sign in to secure your trek</h1>
        <p className="mt-2 text-muted-foreground">Your dates and seats are ready. Login to complete the booking.</p>
        <Link href="/login" className="mt-6 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white">
          Login to continue
        </Link>
      </section>
    );
  }

  if (treksLoading) {
    return (
      <section className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
      </section>
    );
  }

  const selectTrek = (trek: Trek) => {
    const firstBatch = trek.upcomingBatches?.[0];
    setSelectedTrekSlug(trek.slug);
    setSelectedBatchId(firstBatch?.id ?? 0);
    setCouponCode('');
    setCouponDiscount(0);
    setContact((current) => ({ ...current, pickupLocation: trek.location }));
  };

  const setTravelerCounts = (adults: number, children: number) => {
    const nextAdults = Math.max(1, adults);
    const nextChildren = Math.max(0, children);
    const nextTotal = nextAdults + nextChildren;
    setNumAdults(nextAdults);
    setNumChildren(nextChildren);
    setTravelers((current) => {
      const next = Array.from({ length: nextTotal }, (_, index) => current[index] ?? defaultTraveler(index));
      return next.map((traveler, index) => ({ ...traveler, isLeader: index === 0 }));
    });
  };

  const updateTraveler = (index: number, value: Partial<Traveler>) => {
    setTravelers((current) =>
      current.map((traveler, itemIndex) => itemIndex === index ? { ...traveler, ...value } : traveler)
    );
  };

  const validateCurrentStep = () => {
    if (step === 1 && !selectedTrek) return 'Select a trek to continue';
    if (step === 2 && !selectedBatch) return 'Choose a batch date';
    if (step === 3 && totalTravelers < 1) return 'Select at least one traveler';
    if (step === 4) {
      if (travelers.some((traveler) => !traveler.name.trim() || !traveler.idNumber.trim())) {
        return 'Add traveler names and ID numbers';
      }
      if (!contact.emergencyContact.trim()) return 'Emergency contact is required';
      if (!phoneRegex.test(contact.emergencyPhone)) return 'Enter a valid 10-digit emergency mobile number';
    }
    return null;
  };

  const goNext = () => {
    const error = validateCurrentStep();
    if (error) {
      toast.error(error);
      return;
    }
    setStep((current) => Math.min(current + 1, 7));
  };

  const goBack = () => {
    setStep((current) => Math.max(current - 1, 1));
  };

  const applyCoupon = async () => {
    if (!selectedTrek || !couponCode.trim()) return;
    try {
      const response = await bookingApi.validateCoupon(couponCode.trim(), selectedTrek.id, pricing.subtotal);
      const result = response.data.data;
      if (!result.valid) {
        setCouponDiscount(0);
        toast.error(result.message);
        return;
      }
      setCouponDiscount(result.discountAmount);
      toast.success(result.message);
    } catch (error: any) {
      toast.error(error?.response?.data?.error ?? 'Could not validate coupon');
    }
  };

  const processPayment = async (orderId: string, amount: number, keyId: string): Promise<PaymentResult> => {
    if (orderId.startsWith('order_dev_') || !window.Razorpay) {
      return {
        razorpayOrderId: orderId,
        razorpayPaymentId: `pay_dev_${Date.now()}`,
        razorpaySignature: 'dev-signature',
      };
    }

    return new Promise((resolve, reject) => {
      const Razorpay = window.Razorpay;
      if (!Razorpay) {
        reject(new Error('Payment gateway unavailable'));
        return;
      }
      const checkout = new Razorpay({
        key: keyId,
        amount,
        currency: 'INR',
        name: 'Adventure Platform',
        description: selectedTrek?.title,
        order_id: orderId,
        prefill: { name: user?.name, email: user?.email },
        handler: (response: any) => resolve({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        }),
        modal: { ondismiss: () => reject(new Error('Payment cancelled')) },
      });
      checkout.open();
    });
  };

  const submitBooking = async () => {
    if (!selectedTrek || !selectedBatch) {
      toast.error('Select trek and batch date');
      return;
    }

    setProcessing(true);
    try {
      updateFormData({
        trekId: selectedTrek.id,
        trekSlug: selectedTrek.slug,
        trekTitle: selectedTrek.title,
        batchId: selectedBatch.id,
        startDate: selectedBatch.startDate,
        endDate: selectedBatch.endDate,
        numAdults,
        numChildren,
        travelers,
        ...contact,
        couponCode: couponCode || undefined,
        couponDiscount,
        paymentGateway: 'RAZORPAY',
      });

      const orderResponse = await bookingApi.createOrder({
        trekId: selectedTrek.id,
        batchId: selectedBatch.id,
        startDate: selectedBatch.startDate,
        endDate: selectedBatch.endDate,
        numAdults,
        numChildren,
        couponCode: couponCode || undefined,
      });
      const order = orderResponse.data.data;
      const payment = await processPayment(order.orderId, order.amount, order.keyId);
      const confirmationResponse = await bookingApi.confirmBooking({
        ...payment,
        trekId: selectedTrek.id,
        batchId: selectedBatch.id,
        startDate: selectedBatch.startDate,
        endDate: selectedBatch.endDate,
        numAdults,
        numChildren,
        travelers,
        ...contact,
        couponCode: couponCode || undefined,
      });

      setConfirmation(confirmationResponse.data.data);
      reset();
      toast.success('Booking confirmed');
      setStep(7);
    } catch (error: any) {
      toast.error(error?.message === 'Payment cancelled' ? 'Payment cancelled' : error?.response?.data?.error ?? 'Booking failed');
    } finally {
      setProcessing(false);
    }
  };

  const downloadDocument = async (type: 'ticket' | 'invoice') => {
    if (!confirmation) return;
    const response = type === 'ticket'
      ? await bookingApi.downloadTicket(confirmation.bookingRef)
      : await bookingApi.downloadInvoice(confirmation.bookingRef);
    const url = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${type}-${confirmation.bookingRef}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="bg-background py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4">
        <Link href={selectedTrek ? `/treks/${selectedTrek.slug}` : '/treks'} className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Back to treks
        </Link>

        <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_380px]">
          <div className="min-w-0 space-y-6">
            <header>
              <p className="text-sm font-semibold text-brand-500">Phase 6 booking workflow</p>
              <h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">
                Complete your adventure booking
              </h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                Select your trek, choose a date, add traveler details, apply a coupon, pay securely, and download your documents.
              </p>
            </header>

            <StepProgress currentStep={step} />

            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
              {step === 1 && (
                <SelectTrekStep treks={treks} selectedTrek={selectedTrek} onSelect={selectTrek} />
              )}

              {step === 2 && selectedTrek && (
                <ChooseDateStep
                  trek={selectedTrek}
                  batches={batches}
                  selectedBatch={selectedBatch}
                  onSelect={(batch) => setSelectedBatchId(batch.id)}
                />
              )}

              {step === 3 && (
                <TravelersStep
                  numAdults={numAdults}
                  numChildren={numChildren}
                  onChange={setTravelerCounts}
                />
              )}

              {step === 4 && (
                <DetailsStep
                  travelers={travelers}
                  contact={contact}
                  onTravelerChange={updateTraveler}
                  onContactChange={setContact}
                />
              )}

              {step === 5 && (
                <CouponStep
                  couponCode={couponCode}
                  couponDiscount={couponDiscount}
                  pricing={pricing}
                  onCouponChange={setCouponCode}
                  onApply={applyCoupon}
                  onRemove={() => {
                    setCouponCode('');
                    setCouponDiscount(0);
                  }}
                />
              )}

              {step === 6 && selectedTrek && selectedBatch && (
                <PaymentStep
                  trek={selectedTrek}
                  batch={selectedBatch}
                  pricing={pricing}
                  travelers={travelers}
                  contact={contact}
                  isProcessing={isProcessing}
                  onPay={submitBooking}
                />
              )}

              {step === 7 && (
                <ConfirmationStep
                  confirmation={confirmation}
                  onDownload={downloadDocument}
                />
              )}

              {step < 6 && (
                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-between">
                  <button
                    onClick={goBack}
                    disabled={step === 1}
                    className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={goNext}
                    className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-colors hover:bg-brand-600"
                  >
                    Continue
                  </button>
                </div>
              )}

              {step === 6 && (
                <div className="mt-6 flex border-t border-border pt-5">
                  <button
                    onClick={goBack}
                    disabled={isProcessing}
                    className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Back
                  </button>
                </div>
              )}
            </div>
          </div>

          <BookingSummary
            trek={selectedTrek}
            batch={selectedBatch}
            pricing={pricing}
            totalTravelers={totalTravelers}
            couponDiscount={couponDiscount}
          />
        </div>
      </div>
    </section>
  );
}

function StepProgress({ currentStep }: { currentStep: number }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card p-3">
      <div className="grid min-w-[760px] grid-cols-7 gap-2">
        {STEPS.map(({ id, label, icon: Icon }) => {
          const active = currentStep === id;
          const done = currentStep > id;
          return (
            <div
              key={id}
              className={cn(
                'flex items-center gap-2 rounded-xl px-3 py-2.5 text-xs font-semibold transition-colors',
                active && 'bg-brand-500 text-white',
                done && 'bg-emerald-500/10 text-emerald-600',
                !active && !done && 'bg-background text-muted-foreground'
              )}
            >
              <span className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                active ? 'bg-white/20' : done ? 'bg-emerald-500 text-white' : 'bg-muted'
              )}>
                {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
              </span>
              {label}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SelectTrekStep({
  treks,
  selectedTrek,
  onSelect,
}: {
  treks: Trek[];
  selectedTrek: Trek | null;
  onSelect: (trek: Trek) => void;
}) {
  return (
    <div>
      <StepHeader title="Step 1: Select Trek" description="Pick the trek you want to book." />
      {treks.length === 0 && (
        <div className="mt-5 rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
          No treks are available for booking right now.
        </div>
      )}
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {treks.map((trek) => {
          const selected = selectedTrek?.id === trek.id;
          return (
            <button
              key={trek.id}
              onClick={() => onSelect(trek)}
              className={cn(
                'overflow-hidden rounded-xl border bg-background text-left transition-all hover:-translate-y-0.5 hover:shadow-lg',
                selected ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-border'
              )}
            >
              <div className="flex gap-4 p-3">
                <img src={trek.coverImageUrl} alt={trek.title} className="h-24 w-28 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0">
                  <div className="font-display text-base font-bold text-foreground">{trek.title}</div>
                  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" /> {trek.location}
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-muted px-2 py-1">{trek.durationDays}D/{trek.durationNights}N</span>
                    <span className="rounded-full bg-muted px-2 py-1">{trek.difficulty}</span>
                    <span className="rounded-full bg-brand-500/10 px-2 py-1 font-semibold text-brand-600">{formatCurrency(trek.pricePerPerson)}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ChooseDateStep({
  trek,
  batches,
  selectedBatch,
  onSelect,
}: {
  trek: Trek;
  batches: TrekBatchDate[];
  selectedBatch: TrekBatchDate | null;
  onSelect: (batch: TrekBatchDate) => void;
}) {
  return (
    <div>
      <StepHeader title="Step 2: Choose Date" description={`Select an available batch for ${trek.title}.`} />
      {batches.length === 0 ? (
        <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
          No batches are currently available for this trek.
        </div>
      ) : (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {batches.map((batch) => {
            const selected = selectedBatch?.id === batch.id;
            const full = batch.availableSeats <= 0;
            return (
              <button
                key={batch.id}
                onClick={() => !full && onSelect(batch)}
                disabled={full}
                className={cn(
                  'rounded-xl border bg-background p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50',
                  selected ? 'border-brand-500 ring-2 ring-brand-500/20' : 'border-border'
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-foreground">
                      {formatDate(batch.startDate, 'dd MMM')} - {formatDate(batch.endDate, 'dd MMM yyyy')}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">{trek.durationDays} days itinerary</div>
                  </div>
                  <span className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-semibold',
                    full ? 'bg-red-500/10 text-red-600' : 'bg-emerald-500/10 text-emerald-600'
                  )}>
                    {full ? 'Sold out' : `${batch.availableSeats} seats`}
                  </span>
                </div>
                <div className="mt-4 font-display text-xl font-bold text-foreground">
                  {formatCurrency(batch.price ?? trek.pricePerPerson)}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TravelersStep({
  numAdults,
  numChildren,
  onChange,
}: {
  numAdults: number;
  numChildren: number;
  onChange: (adults: number, children: number) => void;
}) {
  return (
    <div>
      <StepHeader title="Step 3: Select Travelers" description="Choose how many people are joining this trek." />
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <CounterCard
          label="Adults"
          description="Age 12 and above"
          value={numAdults}
          min={1}
          onChange={(value) => onChange(value, numChildren)}
        />
        <CounterCard
          label="Children"
          description="Age 5 to 11"
          value={numChildren}
          min={0}
          onChange={(value) => onChange(numAdults, value)}
        />
      </div>
      <div className="mt-5 rounded-xl border border-border bg-background p-4 text-sm text-muted-foreground">
        We will collect each traveler&apos;s name, age, ID number, and medical details in the next step.
      </div>
    </div>
  );
}

function DetailsStep({
  travelers,
  contact,
  onTravelerChange,
  onContactChange,
}: {
  travelers: Traveler[];
  contact: ContactDetails;
  onTravelerChange: (index: number, value: Partial<Traveler>) => void;
  onContactChange: (value: ContactDetails) => void;
}) {
  return (
    <div>
      <StepHeader title="Step 4: Add Details" description="Add traveler identity, age, emergency contact, and medical information." />
      <div className="mt-5 space-y-5">
        {travelers.map((traveler, index) => (
          <div key={index} className="rounded-xl border border-border bg-background p-4">
            <div className="mb-4 flex items-center gap-2 font-semibold text-foreground">
              <UserRound className="h-4 w-4 text-brand-500" />
              Traveler {index + 1}{index === 0 ? ' - Leader' : ''}
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <input className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-brand-500" placeholder="Full name" value={traveler.name} onChange={(e) => onTravelerChange(index, { name: e.target.value })} />
              <input className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-brand-500" type="number" min={5} max={80} value={traveler.age} onChange={(e) => onTravelerChange(index, { age: Number(e.target.value) })} />
              <select className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-brand-500" value={traveler.gender} onChange={(e) => onTravelerChange(index, { gender: e.target.value as Traveler['gender'] })}>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
              <select className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-brand-500" value={traveler.idType} onChange={(e) => onTravelerChange(index, { idType: e.target.value as Traveler['idType'] })}>
                <option>Aadhaar</option><option>Passport</option><option>Driving License</option><option>Voter ID</option>
              </select>
              <input className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-brand-500" placeholder="ID number" value={traveler.idNumber} onChange={(e) => onTravelerChange(index, { idNumber: e.target.value })} />
              <input className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-brand-500" placeholder="Medical conditions, if any" value={traveler.medicalConditions} onChange={(e) => onTravelerChange(index, { medicalConditions: e.target.value })} />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-border bg-background p-4">
        <h3 className="font-display text-lg font-bold text-foreground">Emergency & Pickup</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-brand-500" placeholder="Emergency contact name" value={contact.emergencyContact} onChange={(e) => onContactChange({ ...contact, emergencyContact: e.target.value })} />
          <input className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-brand-500" placeholder="10-digit mobile number" value={contact.emergencyPhone} onChange={(e) => onContactChange({ ...contact, emergencyPhone: e.target.value })} />
          <input className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-brand-500 sm:col-span-2" placeholder="Pickup location" value={contact.pickupLocation} onChange={(e) => onContactChange({ ...contact, pickupLocation: e.target.value })} />
          <textarea className="min-h-24 rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-brand-500 sm:col-span-2" placeholder="Special requests" value={contact.specialRequests} onChange={(e) => onContactChange({ ...contact, specialRequests: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

function CouponStep({
  couponCode,
  couponDiscount,
  pricing,
  onCouponChange,
  onApply,
  onRemove,
}: {
  couponCode: string;
  couponDiscount: number;
  pricing: { subtotal: number };
  onCouponChange: (value: string) => void;
  onApply: () => void;
  onRemove: () => void;
}) {
  return (
    <div>
      <StepHeader title="Step 5: Apply Coupon" description="Add a coupon code before payment. You can skip this step." />
      <div className="mt-5 rounded-xl border border-border bg-background p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input
            className="rounded-xl border border-border bg-card px-3 py-3 text-sm uppercase outline-none focus:border-brand-500"
            placeholder="Enter coupon code"
            value={couponCode}
            onChange={(e) => onCouponChange(e.target.value.toUpperCase())}
          />
          <button onClick={onApply} className="rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white hover:bg-brand-600">
            Apply Coupon
          </button>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
          <span className="text-muted-foreground">Eligible amount: {formatCurrency(pricing.subtotal)}</span>
          {couponDiscount > 0 && (
            <button onClick={onRemove} className="font-semibold text-red-500 hover:text-red-600">
              Remove discount
            </button>
          )}
        </div>
        {couponDiscount > 0 && (
          <div className="mt-4 rounded-xl bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-600">
            Coupon applied. You saved {formatCurrency(couponDiscount)}.
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentStep({
  trek,
  batch,
  pricing,
  travelers,
  contact,
  isProcessing,
  onPay,
}: {
  trek: Trek;
  batch: TrekBatchDate;
  pricing: { subtotal: number; couponDiscount: number; taxAmount: number; total: number };
  travelers: Traveler[];
  contact: ContactDetails;
  isProcessing: boolean;
  onPay: () => void;
}) {
  return (
    <div>
      <StepHeader title="Step 6: Payment" description="Review your booking and complete payment securely." />
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-background p-4">
          <h3 className="font-display text-lg font-bold text-foreground">{trek.title}</h3>
          <div className="mt-3 space-y-2 text-sm text-muted-foreground">
            <div>{formatDate(batch.startDate, 'dd MMM')} - {formatDate(batch.endDate, 'dd MMM yyyy')}</div>
            <div>{travelers.length} travelers</div>
            <div>Emergency: {contact.emergencyContact} ({contact.emergencyPhone})</div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <h3 className="font-display text-lg font-bold text-foreground">Payment Summary</h3>
          <div className="mt-3 space-y-2 text-sm">
            <SummaryRow label="Subtotal" value={formatCurrency(pricing.subtotal)} />
            <SummaryRow label="Coupon discount" value={`-${formatCurrency(pricing.couponDiscount)}`} />
            <SummaryRow label="GST 18%" value={formatCurrency(pricing.taxAmount)} />
            <div className="border-t border-border pt-2">
              <SummaryRow label="Total payable" value={formatCurrency(pricing.total)} strong />
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={onPay}
        disabled={isProcessing}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/30 transition-all hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
        Pay {formatCurrency(pricing.total)}
      </button>
    </div>
  );
}

function ConfirmationStep({
  confirmation,
  onDownload,
}: {
  confirmation: BookingConfirmation | null;
  onDownload: (type: 'ticket' | 'invoice') => void;
}) {
  if (!confirmation) {
    return (
      <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 text-sm text-orange-700">
        <AlertCircle className="mb-2 h-5 w-5" />
        Confirmation details are not available yet. Complete payment to generate your booking.
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-700">
        <CheckCircle2 className="h-8 w-8" />
        <h2 className="mt-3 font-display text-2xl font-bold">Step 7: Booking Confirmed</h2>
        <p className="mt-1 text-sm">Reference: <span className="font-bold">{confirmation.bookingRef}</span></p>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="text-xs text-muted-foreground">Trek</div>
          <div className="mt-1 font-semibold text-foreground">{confirmation.trekTitle}</div>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="text-xs text-muted-foreground">Dates</div>
          <div className="mt-1 font-semibold text-foreground">{formatDate(confirmation.startDate, 'dd MMM')} - {formatDate(confirmation.endDate, 'dd MMM yyyy')}</div>
        </div>
        <div className="rounded-xl border border-border bg-background p-4">
          <div className="text-xs text-muted-foreground">Paid</div>
          <div className="mt-1 font-semibold text-foreground">{formatCurrency(confirmation.totalAmount)}</div>
        </div>
      </div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button onClick={() => onDownload('ticket')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted">
          <Download className="h-4 w-4" /> Ticket
        </button>
        <button onClick={() => onDownload('invoice')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted">
          <FileText className="h-4 w-4" /> Invoice
        </button>
        <Link href={`/bookings/${confirmation.bookingRef}`} className="inline-flex items-center justify-center rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white">
          Open confirmation page
        </Link>
      </div>
    </div>
  );
}

function BookingSummary({
  trek,
  batch,
  pricing,
  totalTravelers,
  couponDiscount,
}: {
  trek: Trek | null;
  batch: TrekBatchDate | null;
  pricing: { subtotal: number; taxAmount: number; total: number };
  totalTravelers: number;
  couponDiscount: number;
}) {
  return (
    <aside className="lg:sticky lg:top-24 lg:self-start">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xl">
        <h2 className="font-display text-xl font-bold text-foreground">Booking Summary</h2>
        {trek ? (
          <>
            <div className="mt-5 overflow-hidden rounded-xl border border-border bg-background">
              <img src={trek.coverImageUrl} alt={trek.title} className="h-40 w-full object-cover" />
              <div className="p-4">
                <div className="font-semibold text-foreground">{trek.title}</div>
                <div className="mt-1 text-sm text-muted-foreground">{trek.location}</div>
                {batch && (
                  <div className="mt-3 rounded-lg bg-muted p-3 text-xs font-semibold text-foreground">
                    {formatDate(batch.startDate, 'dd MMM')} - {formatDate(batch.endDate, 'dd MMM yyyy')}
                  </div>
                )}
              </div>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <SummaryRow label="Travelers" value={`${totalTravelers}`} />
              <SummaryRow label="Subtotal" value={formatCurrency(pricing.subtotal)} />
              {couponDiscount > 0 && <SummaryRow label="Coupon discount" value={`-${formatCurrency(couponDiscount)}`} success />}
              <SummaryRow label="GST 18%" value={formatCurrency(pricing.taxAmount)} />
              <div className="border-t border-border pt-3">
                <SummaryRow label="Total" value={formatCurrency(pricing.total)} strong />
              </div>
            </div>
            <div className="mt-4 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
              {['Ticket generated after payment', 'Invoice available instantly', 'Email and WhatsApp confirmation queued'].map((item) => (
                <div key={item} className="flex items-center gap-2"><Check className="h-3.5 w-3.5 text-emerald-500" /> {item}</div>
              ))}
            </div>
          </>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">Select a trek to see your booking summary.</p>
        )}
      </div>
    </aside>
  );
}

function CounterCard({
  label,
  description,
  value,
  min,
  onChange,
}: {
  label: string;
  description: string;
  value: number;
  min: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div>
        <div className="font-semibold text-foreground">{label}</div>
        <div className="mt-1 text-sm text-muted-foreground">{description}</div>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-lg font-bold hover:bg-muted"
        >
          -
        </button>
        <span className="font-display text-2xl font-bold text-foreground">{value}</span>
        <button
          onClick={() => onChange(value + 1)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-lg font-bold hover:bg-muted"
        >
          +
        </button>
      </div>
    </div>
  );
}

function StepHeader({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h2 className="font-display text-2xl font-bold text-foreground">{title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong,
  success,
}: {
  label: string;
  value: string;
  strong?: boolean;
  success?: boolean;
}) {
  return (
    <div className={cn('flex items-center justify-between gap-4', strong && 'text-base font-bold text-foreground', success && 'text-emerald-600')}>
      <span className={cn(!strong && !success && 'text-muted-foreground')}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
