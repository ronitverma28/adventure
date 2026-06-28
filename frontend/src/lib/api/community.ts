import apiClient from './client';
import type { ApiResponse, PagedResponse } from '@/types/api.types';
import type {
  CommunityComment,
  CommunityPost,
  CommunityProfile,
  CreateCommentRequest,
  CreateDiscussionRequest,
  CreatePostRequest,
  CreateReplyRequest,
  Discussion,
  DiscussionReply,
} from '@/types/community.types';

export const communityApi = {
  getFeed: (type?: string, page = 0, size = 12) =>
    apiClient.get<ApiResponse<PagedResponse<CommunityPost>>>('/community/feed', {
      params: { type, page, size },
      skipAuth: true,
    }),

  getPost: (postId: number) =>
    apiClient.get<ApiResponse<CommunityPost>>(`/community/posts/${postId}`, { skipAuth: true }),

  createPost: (data: CreatePostRequest) =>
    apiClient.post<ApiResponse<CommunityPost>>('/community/posts', data),

  deletePost: (postId: number) =>
    apiClient.delete<ApiResponse<null>>(`/community/posts/${postId}`),

  toggleLike: (postId: number) =>
    apiClient.post<ApiResponse<CommunityPost>>(`/community/posts/${postId}/like`),

  getComments: (postId: number, page = 0, size = 20) =>
    apiClient.get<ApiResponse<PagedResponse<CommunityComment>>>(`/community/posts/${postId}/comments`, {
      params: { page, size },
      skipAuth: true,
    }),

  addComment: (postId: number, data: CreateCommentRequest) =>
    apiClient.post<ApiResponse<CommunityComment>>(`/community/posts/${postId}/comments`, data),

  deleteComment: (commentId: number) =>
    apiClient.delete<ApiResponse<null>>(`/community/comments/${commentId}`),

  toggleFollow: (userId: number) =>
    apiClient.post<ApiResponse<CommunityProfile>>(`/community/users/${userId}/follow`),

  getProfile: (userId: number) =>
    apiClient.get<ApiResponse<CommunityProfile>>(`/community/users/${userId}/profile`, { skipAuth: true }),

  getMembers: (page = 0, size = 20) =>
    apiClient.get<ApiResponse<PagedResponse<CommunityProfile>>>('/community/members', {
      params: { page, size },
      skipAuth: true,
    }),

  getDiscussions: (category?: string, search?: string, page = 0, size = 15) =>
    apiClient.get<ApiResponse<PagedResponse<Discussion>>>('/community/discussions', {
      params: { category, search, page, size },
      skipAuth: true,
    }),

  getDiscussion: (discussionId: number) =>
    apiClient.get<ApiResponse<Discussion>>(`/community/discussions/${discussionId}`, { skipAuth: true }),

  createDiscussion: (data: CreateDiscussionRequest) =>
    apiClient.post<ApiResponse<Discussion>>('/community/discussions', data),

  deleteDiscussion: (discussionId: number) =>
    apiClient.delete<ApiResponse<null>>(`/community/discussions/${discussionId}`),

  getReplies: (discussionId: number, page = 0, size = 20) =>
    apiClient.get<ApiResponse<PagedResponse<DiscussionReply>>>(`/community/discussions/${discussionId}/replies`, {
      params: { page, size },
      skipAuth: true,
    }),

  addReply: (discussionId: number, data: CreateReplyRequest) =>
    apiClient.post<ApiResponse<DiscussionReply>>(`/community/discussions/${discussionId}/replies`, data),

  acceptReply: (replyId: number) =>
    apiClient.patch<ApiResponse<DiscussionReply>>(`/community/replies/${replyId}/accept`),

  deleteReply: (replyId: number) =>
    apiClient.delete<ApiResponse<null>>(`/community/replies/${replyId}`),
};
