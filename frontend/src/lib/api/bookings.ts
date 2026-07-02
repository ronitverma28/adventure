import apiClient from './client';
import type { ApiResponse, PagedResponse } from '@/types/api.types';
import type {
  BookingConfirmation,
  ConfirmBookingRequest,
  CouponValidation,
  CreateOrderRequest,
  PaymentHistory,
  RazorpayOrder,
  ValidateCouponRequest,
  CreateBookingRequest,
  BookingSummaryResponse,
} from '@/types/booking.types';

export const bookingApi = {
  createOrder: (data: CreateOrderRequest) =>
    apiClient.post<ApiResponse<RazorpayOrder>>('/bookings/create-order', data),

  confirmBooking: (data: ConfirmBookingRequest) =>
    apiClient.post<ApiResponse<BookingConfirmation>>('/bookings/confirm', data),

  createBooking: (data: CreateBookingRequest) =>
    apiClient.post<ApiResponse<BookingSummaryResponse>>('/bookings', data),

  uploadPayment: (bookingRef: string, utrNumber: string, screenshot: File) => {
    const formData = new FormData();
    formData.append('screenshot', screenshot);
    return apiClient.post<ApiResponse<string>>('/bookings/upload-payment', formData, {
      params: { bookingRef, utrNumber },
    });
  },

  validateCoupon: (code: string, batchId: number, amount: number) =>
    apiClient.post<ApiResponse<CouponValidation>>('/bookings/validate-coupon', {
      code,
      batchId,
      amount,
    } satisfies ValidateCouponRequest),

  getMyBookings: (page = 0, size = 10) =>
    apiClient.get<ApiResponse<PagedResponse<BookingConfirmation>>>('/bookings/my', {
      params: { page, size },
    }),

  getBooking: (bookingRef: string) =>
    apiClient.get<ApiResponse<BookingConfirmation>>(`/bookings/${bookingRef}`),

  cancelBooking: (bookingRef: string, reason: string) =>
    apiClient.post<ApiResponse<null>>(`/bookings/${bookingRef}/cancel`, { reason }),

  downloadTicket: (bookingRef: string) =>
    apiClient.get<Blob>(`/bookings/${bookingRef}/ticket`, { responseType: 'blob' }),

  downloadInvoice: (bookingRef: string) =>
    apiClient.get<Blob>(`/bookings/${bookingRef}/invoice`, { responseType: 'blob' }),

  getPaymentHistory: (page = 0, size = 10) =>
    apiClient.get<ApiResponse<PagedResponse<PaymentHistory>>>('/payments/history', {
      params: { page, size },
    }),
};
