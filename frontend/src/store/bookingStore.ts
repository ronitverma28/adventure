import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { BookingFormData, BookingPricing } from '@/types/booking.types';

interface BookingState {
  step: number;
  formData: Partial<BookingFormData>;
  pricing: BookingPricing | null;
  isProcessing: boolean;

  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (data: Partial<BookingFormData>) => void;
  setPricing: (pricing: BookingPricing) => void;
  setProcessing: (v: boolean) => void;
  reset: () => void;
}

const INITIAL_STATE = {
  step: 1,
  formData: {},
  pricing: null,
  isProcessing: false,
};

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      ...INITIAL_STATE,

      setStep: (step) => set({ step }),
      nextStep: () => set((s) => ({ step: Math.min(s.step + 1, 7) })),
      prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 1) })),
      updateFormData: (data) =>
        set((s) => ({ formData: { ...s.formData, ...data } })),
      setPricing: (pricing) => set({ pricing }),
      setProcessing: (isProcessing) => set({ isProcessing }),
      reset: () => set(INITIAL_STATE),
    }),
    {
      name: 'adventure-booking',
      storage: createJSONStorage(() => sessionStorage), // session only
      partialize: (s) => ({ step: s.step, formData: s.formData, pricing: s.pricing }),
    }
  )
);
