'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  AlertCircle, ArrowLeft, Calendar, Check, CheckCircle2, CreditCard, Download,
  FileText, Loader2, MapPin, ShieldCheck, Ticket, UserRound, Users,
  Phone, MessageCircle,
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
  { id: 5, label: 'Confirmation', icon: CheckCircle2 },
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
  const [step, setStep] = useState(() => {
    if (initialTrekSlug && initialBatchId) {
      return 4; // Start directly at details entry
    }
    if (initialTrekSlug) {
      return 2; // Choose date
    }
    return 1;
  });
  const [selectedTrekSlug, setSelectedTrekSlug] = useState(initialTrekSlug);
  const [selectedBatchId, setSelectedBatchId] = useState(initialBatchId);
  const [numAdults, setNumAdults] = useState(initialTravelers);
  const [numChildren, setNumChildren] = useState(0);
  const [travelers, setTravelers] = useState<Traveler[]>(() =>
    Array.from({ length: initialTravelers }, (_, index) => {
      const t = defaultTraveler(index);
      if (index === 0 && user?.name) {
        t.name = user.name;
      }
      return t;
    })
  );

  useEffect(() => {
    if (user?.name) {
      setTravelers((prev) =>
        prev.map((t, i) => (i === 0 && !t.name ? { ...t, name: user.name } : t))
      );
    }
  }, [user]);

  const [contact, setContact] = useState<ContactDetails>({
    emergencyContact: user?.name ?? '',
    emergencyPhone: '',
    pickupLocation: '',
    specialRequests: '',
  });
  const couponDiscount = 0;
  const [confirmation, setConfirmation] = useState<BookingConfirmation | null>(null);
  const [showValidationErrors, setShowValidationErrors] = useState(false);

  const getValidationErrors = () => {
    const errors: Record<string, string> = {};
    travelers.forEach((t, i) => {
      if (!t.name.trim()) {
        errors[`traveler.${i}.name`] = 'Full name is required';
      }
      if (!t.age || t.age < 5 || t.age > 80) {
        errors[`traveler.${i}.age`] = 'Age must be between 5 and 80';
      }
      if (!t.idNumber.trim()) {
        errors[`traveler.${i}.idNumber`] = 'ID number is required';
      }
    });

    if (!contact.emergencyContact.trim()) {
      errors['contact.emergencyContact'] = 'Emergency contact name is required';
    }
    if (!phoneRegex.test(contact.emergencyPhone)) {
      errors['contact.emergencyPhone'] = 'Enter a valid 10-digit mobile number';
    }
    return errors;
  };

  useEffect(() => {
    let active = true;

    async function loadTreks() {
      try {
        const response = await trekApi.getAll(undefined, 0, 100);
        if (!active) return;
        if (response.data?.data?.content && response.data.data.content.length > 0) {
          setTreks(response.data.data.content);
        } else {
          throw new Error('No treks found in API response');
        }
      } catch {
        if (active) {
          try {
            const { MOCK_TREKS } = await import('@/lib/data/mock-treks');
            setTreks(MOCK_TREKS);
          } catch (e) {
            toast.error('Failed to load mock treks');
          }
        }
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

  const [selectedTrekBatches, setSelectedTrekBatches] = useState<TrekBatchDate[]>([]);
  const [batchesLoading, setBatchesLoading] = useState(false);

  useEffect(() => {
    if (selectedTrek && !contact.pickupLocation) {
      setContact((curr) => ({ ...curr, pickupLocation: selectedTrek.location || '' }));
    }
  }, [selectedTrek, contact.pickupLocation]);

  useEffect(() => {
    if (!selectedTrek) {
      setSelectedTrekBatches([]);
      return;
    }

    let active = true;
    async function loadBatches() {
      setBatchesLoading(true);
      try {
        const availabilityResponse = await trekApi.getAvailability(selectedTrek!.id);
        if (!active) return;
        
        const mappedBatches: TrekBatchDate[] = availabilityResponse.data.data.map((batch) => ({
          id: batch.batchId,
          startDate: batch.startDate,
          endDate: batch.endDate,
          availableSeats: batch.availableSlots,
          totalSeats: batch.totalSlots,
          price: batch.pricePerPerson,
        }));
        
        setSelectedTrekBatches(mappedBatches);
        
        if (initialBatchId && mappedBatches.some(b => b.id === initialBatchId)) {
          setSelectedBatchId(initialBatchId);
        } else if (mappedBatches.length > 0) {
          setSelectedBatchId(mappedBatches[0].id);
        }
      } catch (error) {
        console.warn('Failed to load batches from API, falling back to mock or trek data:', error);
        if (active) {
          const fallbackBatches = selectedTrek!.upcomingBatches ?? [];
          setSelectedTrekBatches(fallbackBatches);
          if (initialBatchId && fallbackBatches.some(b => b.id === initialBatchId)) {
            setSelectedBatchId(initialBatchId);
          } else if (fallbackBatches.length > 0) {
            setSelectedBatchId(fallbackBatches[0].id);
          }
        }
      } finally {
        if (active) setBatchesLoading(false);
      }
    }

    loadBatches();
    return () => {
      active = false;
    };
  }, [selectedTrek?.id, selectedTrek, initialBatchId]);

  const batches = selectedTrekBatches;
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
    setSelectedTrekSlug(trek.slug);
    setSelectedBatchId(0);
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
      const errors = getValidationErrors();
      if (Object.keys(errors).length > 0) {
        return Object.values(errors)[0];
      }
    }
    return null;
  };

  const goNext = () => {
    const error = validateCurrentStep();
    if (error) {
      toast.error(error);
      return;
    }
    setStep((current) => Math.min(current + 1, 5));
  };

  const goBack = () => {
    setStep((current) => Math.max(current - 1, 1));
  };

  const submitBooking = async () => {
    if (!selectedTrek || !selectedBatch) {
      toast.error('Select trek and batch date');
      return;
    }

    const validationError = validateCurrentStep();
    if (validationError) {
      setShowValidationErrors(true);
      toast.error(validationError);
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
        paymentGateway: 'RAZORPAY',
      });

      let confirmationData: BookingConfirmation;

      try {
        const createResponse = await bookingApi.createBooking({
          batchId: selectedBatch.id,
          numAdults,
          numChildren,
          travelers: travelers.map(t => ({
            name: t.name,
            age: t.age,
            gender: t.gender,
            idType: t.idType,
            idNumber: t.idNumber,
            isLeader: t.isLeader ?? false
          })),
          emergencyContact: contact.emergencyContact,
          emergencyPhone: contact.emergencyPhone,
        });
        const summary = createResponse.data.data;

        // Fetch full booking details to populate confirmation state
        const detailsResponse = await bookingApi.getBooking(summary.bookingRef);
        confirmationData = detailsResponse.data.data;
      } catch (apiError) {
        console.warn('Backend booking failed, falling back to mock booking:', apiError);
        const mockRef = `ADV-${selectedTrek.title.substring(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
        confirmationData = {
          bookingId: Math.floor(1000 + Math.random() * 9000),
          bookingRef: mockRef,
          trekTitle: selectedTrek.title,
          trekSlug: selectedTrek.slug,
          startDate: selectedBatch.startDate,
          endDate: selectedBatch.endDate,
          numAdults,
          numChildren,
          totalAmount: pricing.total,
          status: 'PENDING',
          paymentStatus: 'PENDING',
          createdAt: new Date().toISOString(),
          travelers,
          emergencyContact: contact.emergencyContact,
          emergencyPhone: contact.emergencyPhone,
          pickupLocation: contact.pickupLocation,
          specialRequests: contact.specialRequests,
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem(`mock_booking_${mockRef}`, JSON.stringify(confirmationData));
        }
      }

      setConfirmation(confirmationData);
      reset();
      toast.success('Booking requested successfully');
      setStep(5);
    } catch (error: any) {
      toast.error(error?.response?.data?.error ?? 'Booking failed');
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
    <section className="bg-background pt-24 pb-8 sm:pt-28 sm:pb-10">
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
                batchesLoading ? (
                  <div className="flex min-h-[200px] flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
                    <p className="mt-2 text-sm text-muted-foreground">Loading available batches...</p>
                  </div>
                ) : (
                  <ChooseDateStep
                    trek={selectedTrek}
                    batches={batches}
                    selectedBatch={selectedBatch}
                    onSelect={(batch) => setSelectedBatchId(batch.id)}
                  />
                )
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
                  errors={showValidationErrors ? getValidationErrors() : {}}
                />
              )}

              {step === 5 && (
                <ConfirmationStep
                  confirmation={confirmation}
                  onDownload={downloadDocument}
                />
              )}

              {step < 4 && (
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

              {step === 4 && (
                <div className="mt-6 flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-between">
                  <button
                    onClick={goBack}
                    disabled={isProcessing}
                    className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Back
                  </button>
                  <button
                    onClick={submitBooking}
                    disabled={isProcessing}
                    className="flex items-center justify-center rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Request Booking'
                    )}
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
      <div className="grid min-w-[640px] grid-cols-5 gap-2">
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
  errors = {},
}: {
  travelers: Traveler[];
  contact: ContactDetails;
  onTravelerChange: (index: number, value: Partial<Traveler>) => void;
  onContactChange: (value: ContactDetails) => void;
  errors?: Record<string, string>;
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
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-foreground">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  className={cn(
                    "rounded-xl border bg-card px-3 py-2.5 text-sm outline-none transition-colors",
                    errors[`traveler.${index}.name`]
                      ? "border-red-500 focus:border-red-500"
                      : "border-border focus:border-brand-500"
                  )}
                  placeholder="Full name"
                  value={traveler.name}
                  onChange={(e) => onTravelerChange(index, { name: e.target.value })}
                />
                {errors[`traveler.${index}.name`] && (
                  <span className="text-[10px] font-semibold text-red-500">
                    {errors[`traveler.${index}.name`]}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-foreground">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  className={cn(
                    "rounded-xl border bg-card px-3 py-2.5 text-sm outline-none transition-colors",
                    errors[`traveler.${index}.age`]
                      ? "border-red-500 focus:border-red-500"
                      : "border-border focus:border-brand-500"
                  )}
                  type="number"
                  min={5}
                  max={80}
                  placeholder="Age"
                  value={traveler.age || ''}
                  onChange={(e) => onTravelerChange(index, { age: Number(e.target.value) })}
                />
                {errors[`traveler.${index}.age`] && (
                  <span className="text-[10px] font-semibold text-red-500">
                    {errors[`traveler.${index}.age`]}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-foreground">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                  value={traveler.gender}
                  onChange={(e) => onTravelerChange(index, { gender: e.target.value as Traveler['gender'] })}
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-foreground">
                  ID Type <span className="text-red-500">*</span>
                </label>
                <select
                  className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                  value={traveler.idType}
                  onChange={(e) => onTravelerChange(index, { idType: e.target.value as Traveler['idType'] })}
                >
                  <option>Aadhaar</option>
                  <option>Passport</option>
                  <option>Driving License</option>
                  <option>Voter ID</option>
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-foreground">
                  ID Number <span className="text-red-500">*</span>
                </label>
                <input
                  className={cn(
                    "rounded-xl border bg-card px-3 py-2.5 text-sm outline-none transition-colors",
                    errors[`traveler.${index}.idNumber`]
                      ? "border-red-500 focus:border-red-500"
                      : "border-border focus:border-brand-500"
                  )}
                  placeholder="ID number"
                  value={traveler.idNumber}
                  onChange={(e) => onTravelerChange(index, { idNumber: e.target.value })}
                />
                {errors[`traveler.${index}.idNumber`] && (
                  <span className="text-[10px] font-semibold text-red-500">
                    {errors[`traveler.${index}.idNumber`]}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-foreground">
                  Medical Conditions
                </label>
                <input
                  className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-brand-500"
                  placeholder="Medical conditions, if any"
                  value={traveler.medicalConditions || ''}
                  onChange={(e) => onTravelerChange(index, { medicalConditions: e.target.value })}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 rounded-xl border border-border bg-background p-4">
        <h3 className="font-display text-lg font-bold text-foreground">Emergency & Pickup</h3>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-foreground">
              Emergency Contact Name <span className="text-red-500">*</span>
            </label>
            <input
              className={cn(
                "rounded-xl border bg-card px-3 py-2.5 text-sm outline-none transition-colors",
                errors['contact.emergencyContact']
                  ? "border-red-500 focus:border-red-500"
                  : "border-border focus:border-brand-500"
              )}
              placeholder="Emergency contact name"
              value={contact.emergencyContact}
              onChange={(e) => onContactChange({ ...contact, emergencyContact: e.target.value })}
            />
            {errors['contact.emergencyContact'] && (
              <span className="text-[10px] font-semibold text-red-500">
                {errors['contact.emergencyContact']}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-foreground">
              Emergency Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              className={cn(
                "rounded-xl border bg-card px-3 py-2.5 text-sm outline-none transition-colors",
                errors['contact.emergencyPhone']
                  ? "border-red-500 focus:border-red-500"
                  : "border-border focus:border-brand-500"
              )}
              placeholder="10-digit mobile number"
              value={contact.emergencyPhone}
              onChange={(e) => onContactChange({ ...contact, emergencyPhone: e.target.value })}
            />
            {errors['contact.emergencyPhone'] && (
              <span className="text-[10px] font-semibold text-red-500">
                {errors['contact.emergencyPhone']}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs font-semibold text-foreground">
              Pickup Location
            </label>
            <input
              className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-brand-500"
              placeholder="Pickup location"
              value={contact.pickupLocation || ''}
              onChange={(e) => onContactChange({ ...contact, pickupLocation: e.target.value })}
            />
          </div>

          <div className="flex flex-col gap-1 sm:col-span-2">
            <label className="text-xs font-semibold text-foreground">
              Special Requests
            </label>
            <textarea
              className="min-h-24 rounded-xl border border-border bg-card px-3 py-2.5 text-sm outline-none focus:border-brand-500"
              placeholder="Special requests"
              value={contact.specialRequests || ''}
              onChange={(e) => onContactChange({ ...contact, specialRequests: e.target.value })}
            />
          </div>
        </div>
      </div>
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
  const [txnId, setTxnId] = useState('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [submittingProof, setSubmittingProof] = useState(false);
  const [proof, setProof] = useState<{ txnId: string; screenshot: string } | null>(null);

  useEffect(() => {
    if (confirmation && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`payment_proof_${confirmation.bookingRef}`);
      if (saved) {
        setProof(JSON.parse(saved));
      }
    }
  }, [confirmation]);

  if (!confirmation) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center text-sm text-amber-600">
        <AlertCircle className="mb-2 h-5 w-5" />
        Confirmation details are not available yet.
      </div>
    );
  }

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds the 5MB limit.');
        return;
      }
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const submitProof = async () => {
    if (!txnId.trim()) {
      toast.error('Please enter the Transaction ID / UTR');
      return;
    }
    if (!screenshotFile) {
      toast.error('Please upload a screenshot of your payment');
      return;
    }
    setSubmittingProof(true);
    try {
      await bookingApi.uploadPayment(confirmation.bookingRef, txnId.trim(), screenshotFile);
      const data = { txnId: txnId.trim(), screenshot: screenshot || '' };
      localStorage.setItem(`payment_proof_${confirmation.bookingRef}`, JSON.stringify(data));
      setProof(data);
      toast.success('Payment proof submitted successfully! Our team will verify it shortly.');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || 'Failed to submit payment proof');
    } finally {
      setSubmittingProof(false);
    }
  };

  const isConfirmed = confirmation.status === 'CONFIRMED';
  const waTxnId = proof?.txnId || txnId || '';
  const waMessage = `Hi, I have submitted a booking request for ${confirmation.trekTitle} (Reference: ${confirmation.bookingRef}).${waTxnId ? ` My Transaction ID/UTR is: ${waTxnId}.` : ''} Please verify my payment.`;

  return (
    <div>
      <div className={cn(
        "rounded-xl border p-5",
        isConfirmed
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-amber-200 bg-amber-50 text-amber-700"
      )}>
        {isConfirmed ? (
          <CheckCircle2 className="h-8 w-8 text-emerald-600" />
        ) : (
          <AlertCircle className="h-8 w-8 text-amber-600" />
        )}
        <h2 className="mt-3 font-display text-2xl font-bold">
          {isConfirmed ? 'Booking Confirmed' : 'Booking Request Submitted'}
        </h2>
        <p className="mt-1 text-sm">Reference: <span className="font-bold">{confirmation.bookingRef}</span></p>
        {!isConfirmed && (
          <p className="mt-2 text-xs text-amber-600/90">
            Your booking request has been submitted. You will receive a confirmation email once the business approves your booking.
          </p>
        )}
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
          <div className="text-xs text-muted-foreground">Status</div>
          <div className="mt-1 font-semibold text-foreground capitalize">{confirmation.status.toLowerCase().replace('_', ' ')}</div>
        </div>
      </div>

      {/* Dynamic Payment QR & Contact Options */}
      <div className="mt-6 rounded-2xl border border-brand-500/20 bg-brand-500/5 p-6 shadow-sm">
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
                <span className="font-bold text-brand-500">{formatCurrency(confirmation.totalAmount)}</span>
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
                href={`https://wa.me/918979117745?text=${encodeURIComponent(waMessage)}`}
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
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=upi://pay?pa=8979117745@superyes%26pn=Adventure%2520Treks%26am=${confirmation.totalAmount}%26cu=INR`}
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
                  localStorage.removeItem(`payment_proof_${confirmation.bookingRef}`);
                  setProof(null);
                  setScreenshot(null);
                  setScreenshotFile(null);
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
                disabled={submittingProof}
                onChange={(e) => setTxnId(e.target.value)}
                className="w-full rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-brand-500 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">Payment Screenshot</label>
              <div className="flex flex-col gap-3">
                {screenshot ? (
                  <div className="relative h-40 w-full overflow-hidden rounded-xl border border-border bg-muted">
                    <img src={screenshot} alt="Screenshot preview" className="h-full w-full object-contain" />
                    <button
                      onClick={() => {
                        setScreenshot(null);
                        setScreenshotFile(null);
                      }}
                      disabled={submittingProof}
                      className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-background p-4 hover:border-brand-500 transition-colors opacity-100 [&:has(input:disabled)]:opacity-50 [&:has(input:disabled)]:cursor-not-allowed">
                    <span className="text-xs font-semibold text-brand-500">Click to upload screenshot</span>
                    <span className="mt-1 text-[10px] text-muted-foreground">JPG, PNG or WEBP up to 5MB</span>
                    <input type="file" accept="image/*" onChange={handleScreenshotChange} className="hidden" disabled={submittingProof} />
                  </label>
                )}
              </div>
            </div>
            <button
              onClick={submitProof}
              disabled={submittingProof}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-500 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-500/25 hover:bg-brand-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingProof ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Payment Proof'
              )}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {isConfirmed && (
          <>
            <button onClick={() => onDownload('ticket')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted">
              <Download className="h-4 w-4" /> Ticket
            </button>
            <button onClick={() => onDownload('invoice')} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted">
              <FileText className="h-4 w-4" /> Invoice
            </button>
          </>
        )}
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
