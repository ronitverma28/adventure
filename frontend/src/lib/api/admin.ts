import apiClient from './client';
import type { ApiResponse, PagedResponse } from '@/types/api.types';
import type { User } from '@/types/auth.types';
import type {
  AdminBooking,
  AdminCoupon,
  AdminCouponRequest,
  AdminGuide,
  AdminReview,
  AdminStats,
  AdminTrekRequest,
  AdminTrek,
  ItineraryRequest,
  TrekImageRequest,
  BatchRequest,
  PendingPayment,
  RejectPaymentRequest,
  GuideRequest,
} from '@/types/admin.types';
import type { BookingStatus } from '@/types/booking.types';

export const adminApi = {
  getStats: () => apiClient.get<ApiResponse<AdminStats>>('/admin/stats'),

  getTreks: (search?: string, status?: string, page = 0, size = 20) =>
    apiClient.get<ApiResponse<PagedResponse<AdminTrek>>>('/admin/treks', {
      params: { search, status, page, size },
    }),

  getTrek: (id: number) =>
    apiClient.get<ApiResponse<AdminTrek>>(`/admin/treks/${id}`),

  createTrek: (data: AdminTrekRequest) =>
    apiClient.post<ApiResponse<AdminTrek>>('/admin/treks', data),

  updateTrek: (id: number, data: AdminTrekRequest) =>
    apiClient.put<ApiResponse<AdminTrek>>(`/admin/treks/${id}`, data),

  deleteTrek: (id: number) =>
    apiClient.delete<ApiResponse<null>>(`/admin/treks/${id}`),

  changeTrekStatus: (id: number, status: string) =>
    apiClient.patch<ApiResponse<AdminTrek>>(`/admin/treks/${id}/status`, undefined, {
      params: { status },
    }),

  addItineraryDay: (trekId: number, data: ItineraryRequest) =>
    apiClient.post<ApiResponse<any>>(`/admin/treks/${trekId}/itinerary`, data),

  updateItineraryDay: (itineraryId: number, data: ItineraryRequest) =>
    apiClient.put<ApiResponse<any>>(`/admin/itinerary/${itineraryId}`, data),

  deleteItineraryDay: (itineraryId: number) =>
    apiClient.delete<ApiResponse<null>>(`/admin/itinerary/${itineraryId}`),

  addTrekImage: (trekId: number, data: TrekImageRequest) =>
    apiClient.post<ApiResponse<any>>(`/admin/treks/${trekId}/images`, data),

  updateTrekImage: (imageId: number, data: TrekImageRequest) =>
    apiClient.put<ApiResponse<any>>(`/admin/images/${imageId}`, data),

  deleteTrekImage: (imageId: number) =>
    apiClient.delete<ApiResponse<null>>(`/admin/images/${imageId}`),

  setCoverImage: (trekId: number, imageId: number) =>
    apiClient.patch<ApiResponse<any>>(`/admin/treks/${trekId}/images/${imageId}/cover`),

  createBatch: (trekId: number, data: BatchRequest) =>
    apiClient.post<ApiResponse<any>>(`/admin/treks/${trekId}/batches`, data),

  updateBatch: (batchId: number, data: BatchRequest) =>
    apiClient.put<ApiResponse<any>>(`/admin/batches/${batchId}`, data),

  deleteBatch: (batchId: number) =>
    apiClient.delete<ApiResponse<null>>(`/admin/batches/${batchId}`),

  getUsers: (search?: string, page = 0, size = 20) =>
    apiClient.get<ApiResponse<PagedResponse<User>>>('/admin/users', {
      params: { search, page, size },
    }),

  toggleUserActive: (id: number) =>
    apiClient.patch<ApiResponse<User>>(`/admin/users/${id}/toggle-active`),

  getBookings: (status?: string, search?: string, page = 0, size = 20) =>
    apiClient.get<ApiResponse<PagedResponse<AdminBooking>>>('/admin/bookings', {
      params: { status, search, page, size },
    }),

  updateBookingStatus: (bookingRef: string, status: BookingStatus) =>
    apiClient.patch<ApiResponse<AdminBooking>>(`/admin/bookings/${bookingRef}/status`, undefined, {
      params: { status },
    }),

  getReviews: (approved?: boolean, page = 0, size = 20) =>
    apiClient.get<ApiResponse<PagedResponse<AdminReview>>>('/admin/reviews', {
      params: { approved, page, size },
    }),

  approveReview: (id: number) =>
    apiClient.patch<ApiResponse<AdminReview>>(`/admin/reviews/${id}/approve`),

  deleteReview: (id: number) =>
    apiClient.delete<ApiResponse<null>>(`/admin/reviews/${id}`),

  getCoupons: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<PagedResponse<AdminCoupon>>>('/admin/coupons', {
      params: { page, size },
    }),

  createCoupon: (data: AdminCouponRequest) =>
    apiClient.post<ApiResponse<AdminCoupon>>('/admin/coupons', data),

  toggleCoupon: (id: number) =>
    apiClient.patch<ApiResponse<AdminCoupon>>(`/admin/coupons/${id}/toggle`),

  deleteCoupon: (id: number) =>
    apiClient.delete<ApiResponse<null>>(`/admin/coupons/${id}`),

  getGuides: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<PagedResponse<AdminGuide>>>('/admin/guides', {
      params: { page, size },
    }),

  createGuide: (data: GuideRequest) =>
    apiClient.post<ApiResponse<AdminGuide>>('/admin/guides', data),

  getGuide: (id: number) =>
    apiClient.get<ApiResponse<AdminGuide>>(`/admin/guides/${id}`),

  updateGuide: (id: number, data: GuideRequest) =>
    apiClient.put<ApiResponse<AdminGuide>>(`/admin/guides/${id}`, data),

  deleteGuide: (id: number) =>
    apiClient.delete<ApiResponse<null>>(`/admin/guides/${id}`),

  verifyGuide: (id: number) =>
    apiClient.patch<ApiResponse<AdminGuide>>(`/admin/guides/${id}/verify`),

  getAllFolders: () =>
    apiClient.get<ApiResponse<string[]>>('/admin/folders'),

  getFiles: () =>
    apiClient.get<ApiResponse<any>>('/admin/files'),

  getFilesFromFolder: (folderName: string) =>
    apiClient.get<ApiResponse<any>>(`/admin/files/${folderName}`),

  getPendingPayments: () =>
    apiClient.get<ApiResponse<PendingPayment[]>>('/admin/payments/pending'),

  verifyPayment: (paymentId: number) =>
    apiClient.put<ApiResponse<any>>(`/admin/payments/${paymentId}/verify`),

  rejectPayment: (paymentId: number, data: RejectPaymentRequest) =>
    apiClient.put<ApiResponse<any>>(`/admin/payments/${paymentId}/reject`, data),
};
