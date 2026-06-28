export interface Review {
  id: number;
  trekId: number;
  trekTitle: string;
  trekSlug: string;
  userId: number;
  userName: string;
  userAvatarUrl?: string;
  rating: number;
  title?: string;
  comment: string;
  photos?: string[];
  isVerified?: boolean;
  isApproved?: boolean;
  helpfulCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ReviewRequest {
  trekId?: number;
  rating: number;
  title?: string;
  comment: string;
  photos?: string[];
}

export interface RatingSummary {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<string, number>;
}
