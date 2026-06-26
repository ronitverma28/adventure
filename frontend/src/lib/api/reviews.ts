import apiClient from './client';
import type { ApiResponse, PagedResponse } from '@/types/api.types';
import type { RatingSummary, Review, ReviewRequest } from '@/types/review.types';

export const reviewApi = {
  create: (data: ReviewRequest) =>
    apiClient.post<ApiResponse<Review>>('/reviews', data),

  update: (id: number, data: ReviewRequest) =>
    apiClient.put<ApiResponse<Review>>(`/reviews/${id}`, data),

  delete: (id: number) =>
    apiClient.delete<ApiResponse<null>>(`/reviews/${id}`),

  getMyReviews: (page = 0, size = 10) =>
    apiClient.get<ApiResponse<PagedResponse<Review>>>('/reviews/my', {
      params: { page, size },
    }),

  getTrekReviews: (trekId: number, page = 0, size = 10) =>
    apiClient.get<ApiResponse<PagedResponse<Review>>>(`/treks/${trekId}/reviews`, {
      params: { page, size },
      skipAuth: true,
    }),

  getTrekRating: (trekId: number) =>
    apiClient.get<ApiResponse<RatingSummary>>(`/treks/${trekId}/rating`, { skipAuth: true }),
};
