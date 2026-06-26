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
} from '@/types/admin.types';
import type { BookingStatus } from '@/types/booking.types';

export const adminApi = {
  getStats: () => apiClient.get<ApiResponse<AdminStats>>('/admin/stats'),

  getTreks: (search?: string, status?: string, page = 0, size = 20) =>
    apiClient.get<ApiResponse<PagedResponse<AdminTrek>>>('/admin/treks', {
      params: { search, status, page, size },
    }),

  createTrek: (data: AdminTrekRequest) =>
    apiClient.post<ApiResponse<AdminTrek>>('/admin/treks', data),

  updateTrek: (id: number, data: AdminTrekRequest) =>
    apiClient.put<ApiResponse<AdminTrek>>(`/admin/treks/${id}`, data),

  deleteTrek: (id: number) =>
    apiClient.delete<ApiResponse<null>>(`/admin/treks/${id}`),

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

  verifyGuide: (id: number) =>
    apiClient.patch<ApiResponse<AdminGuide>>(`/admin/guides/${id}/verify`),
};
