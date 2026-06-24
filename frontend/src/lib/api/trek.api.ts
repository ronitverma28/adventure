import apiClient from './client';
import type { Trek, TrekDetail, TrekFilters } from '@/types/trek.types';
import type { ApiResponse, PagedResponse } from '@/types/api.types';

export const trekApi = {
  getAll: (filters?: TrekFilters, page = 0, size = 12) =>
    apiClient.get<ApiResponse<PagedResponse<Trek>>>('/treks', {
      params: { ...filters, page, size },
    }),

  getBySlug: (slug: string) =>
    apiClient.get<ApiResponse<TrekDetail>>(`/treks/${slug}`),

  getFeatured: () =>
    apiClient.get<ApiResponse<Trek[]>>('/treks/featured'),

  search: (query: string) =>
    apiClient.get<ApiResponse<Trek[]>>('/treks/search', { params: { q: query } }),

  // Admin
  create: (data: FormData) =>
    apiClient.post<ApiResponse<TrekDetail>>('/admin/treks', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: number, data: Partial<TrekDetail>) =>
    apiClient.put<ApiResponse<TrekDetail>>(`/admin/treks/${id}`, data),

  delete: (id: number) =>
    apiClient.delete(`/admin/treks/${id}`),
};
