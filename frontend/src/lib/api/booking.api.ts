import apiClient from './client';
import type { ApiResponse, PagedResponse } from '@/types/api.types';
import type {
  BookingConfirmation, RazorpayOrder, CouponValidation, PaymentHistory,
} from '@/types/booking.types';

export const bookingApi = {
  // ── Order & Confirm ──────────────────────────────────────────────────────
  createOrder: (data: {
    trekId: number;
    batchId: number;
    startDate?: string;
    endDate?: string;
    numAdults: number;
    numChildren: number;
    couponCode?: string;
  }) => apiClient.post<ApiResponse<RazorpayOrder>>('/bookings/create-order', data),

  confirmBooking: (data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
    trekId: number;
    batchId: number;
    startDate?: string;
    endDate?: string;
    numAdults: number;
    numChildren: number;
    travelers: import('@/types/booking.types').Traveler[];
    emergencyContact: string;
    emergencyPhone: string;
    pickupLocation?: string;
    specialRequests?: string;
    couponCode?: string;
  }) => apiClient.post<ApiResponse<BookingConfirmation>>('/bookings/confirm', data),

  // ── Coupon ───────────────────────────────────────────────────────────────
  validateCoupon: (code: string, trekId: number, amount: number) =>
    apiClient.post<ApiResponse<CouponValidation>>('/bookings/validate-coupon', {
      code, trekId, amount,
    }),

  // ── My Bookings ──────────────────────────────────────────────────────────
  getMyBookings: (page = 0, size = 10) =>
    apiClient.get<ApiResponse<PagedResponse<BookingConfirmation>>>(
      '/bookings/my', { params: { page, size } }
    ),

  getBooking: (bookingRef: string) =>
    apiClient.get<ApiResponse<BookingConfirmation>>(`/bookings/${bookingRef}`),

  cancelBooking: (bookingRef: string, reason: string) =>
    apiClient.post(`/bookings/${bookingRef}/cancel`, { reason }),

  // ── Documents ────────────────────────────────────────────────────────────
  downloadTicket: (bookingRef: string) =>
    apiClient.get(`/bookings/${bookingRef}/ticket`, { responseType: 'blob' }),

  downloadInvoice: (bookingRef: string) =>
    apiClient.get(`/bookings/${bookingRef}/invoice`, { responseType: 'blob' }),

  // ── Payment History ──────────────────────────────────────────────────────
  getPaymentHistory: (page = 0, size = 10) =>
    apiClient.get<ApiResponse<PagedResponse<PaymentHistory>>>(
      '/payments/history', { params: { page, size } }
    ),
};
