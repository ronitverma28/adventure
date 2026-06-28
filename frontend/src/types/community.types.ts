export interface CommunityAuthor {
  id: number;
  name: string;
  avatarUrl?: string;
  followerCount: number;
  postCount: number;
}

export interface CommunityPost {
  id: number;
  author: CommunityAuthor;
  trekTitle?: string;
  trekSlug?: string;
  title: string;
  content: string;
  imageUrls?: string[];
  type: string;
  likeCount: number;
  commentCount: number;
  likedByMe: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface CommunityComment {
  id: number;
  postId: number;
  author: CommunityAuthor;
  content: string;
  likeCount: number;
  createdAt: string;
}

export interface CommunityProfile {
  id: number;
  name: string;
  avatarUrl?: string;
  city?: string;
  state?: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  followedByMe: boolean;
}

export interface Discussion {
  id: number;
  author: CommunityAuthor;
  trekTitle?: string;
  trekSlug?: string;
  title: string;
  body: string;
  category: string;
  replyCount: number;
  viewCount: number;
  isResolved?: boolean;
  isPinned?: boolean;
  createdAt: string;
}

export interface DiscussionReply {
  id: number;
  discussionId: number;
  author: CommunityAuthor;
  content: string;
  isAccepted?: boolean;
  likeCount: number;
  createdAt: string;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  type?: string;
  trekId?: number;
  imageUrls?: string[];
}

export interface CreateCommentRequest {
  content: string;
}

export interface CreateDiscussionRequest {
  title: string;
  body: string;
  category?: string;
  trekId?: number;
}

export interface CreateReplyRequest {
  content: string;
}
