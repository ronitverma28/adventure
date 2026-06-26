import apiClient from './client';
import type { ApiResponse, PagedResponse } from '@/types/api.types';
import type {
  RelatedTrek,
  Trek,
  TrekAvailability,
  TrekDetail,
  TrekFilters,
} from '@/types/trek.types';

export const trekApi = {
  getAll: (filters?: TrekFilters, page = 0, size = 12) =>
    apiClient.get<ApiResponse<PagedResponse<Trek>>>('/treks', {
      params: { ...filters, page, size },
      skipAuth: true,
    }),

  getFeatured: (page = 0, size = 6) =>
    apiClient.get<ApiResponse<PagedResponse<Trek>>>('/treks/featured', {
      params: { page, size },
      skipAuth: true,
    }),

  getBestsellers: (page = 0, size = 6) =>
    apiClient.get<ApiResponse<PagedResponse<Trek>>>('/treks/bestsellers', {
      params: { page, size },
      skipAuth: true,
    }),

  search: (keyword: string, page = 0, size = 12) =>
    apiClient.get<ApiResponse<PagedResponse<Trek>>>('/treks/search', {
      params: { keyword, page, size },
      skipAuth: true,
    }),

  filter: (filters?: TrekFilters, page = 0, size = 12) =>
    apiClient.get<ApiResponse<PagedResponse<Trek>>>('/treks/filter', {
      params: { ...filters, page, size },
      skipAuth: true,
    }),

  getBySlug: (slug: string) =>
    apiClient.get<ApiResponse<TrekDetail>>(`/treks/slug/${slug}`, { skipAuth: true }),

  getById: (id: number) =>
    apiClient.get<ApiResponse<TrekDetail>>(`/treks/${id}`, { skipAuth: true }),

  getRelated: (id: number) =>
    apiClient.get<ApiResponse<RelatedTrek[]>>(`/treks/${id}/related`, { skipAuth: true }),

  getAvailability: (id: number) =>
    apiClient.get<ApiResponse<TrekAvailability[]>>(`/treks/${id}/availability`, { skipAuth: true }),
};
