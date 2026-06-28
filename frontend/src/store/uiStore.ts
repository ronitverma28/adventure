import { create } from 'zustand';

interface UIState {
  isMobileMenuOpen: boolean;
  isSearchOpen: boolean;
  isBookingModalOpen: boolean;
  selectedTrekId: number | null;

  toggleMobileMenu: () => void;
  toggleSearch: () => void;
  openBookingModal: (trekId: number) => void;
  closeBookingModal: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isSearchOpen: false,
  isBookingModalOpen: false,
  selectedTrekId: null,

  toggleMobileMenu: () =>
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),

  toggleSearch: () =>
    set((state) => ({ isSearchOpen: !state.isSearchOpen })),

  openBookingModal: (trekId) =>
    set({ isBookingModalOpen: true, selectedTrekId: trekId }),

  closeBookingModal: () =>
    set({ isBookingModalOpen: false, selectedTrekId: null }),
}));
