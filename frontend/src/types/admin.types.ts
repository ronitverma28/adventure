import type { User } from './auth.types';
import type { BookingStatus, PaymentStatus } from './booking.types';
import type { DifficultyLevel, TrekStatus } from './trek.types';

export interface AdminStats {
  totalUsers: number;
  totalTreks: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalReviews: number;
  pendingReviews: number;
  totalGuides: number;
  activeCoupons: number;
  popularTreks: {
    id: number;
    title: string;
    slug: string;
    totalBookings: number;
    revenue: number;
    avgRating: number;
  }[];
}

export interface AdminTrek {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  location: string;
  state: string;
  region?: string;
  durationDays: number;
  durationNights: number;
  difficulty: DifficultyLevel;
  pricePerPerson: number;
  priceChild?: number;
  altitudeMax?: number;
  altitudeBase?: number;
  groupSizeMin?: number;
  groupSizeMax?: number;
  startDate?: string;
  endDate?: string;
  meetingPoint?: string;
  nearestAirport?: string;
  nearestRailway?: string;
  status?: TrekStatus;
  isFeatured?: boolean;
  isBestseller?: boolean;
  avgRating?: number;
  totalReviews?: number;
  totalBookings?: number;
  coverImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  thingsToCarry?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminTrekRequest {
  title: string;
  shortDescription: string;
  description: string;
  location: string;
  state: string;
  region?: string;
  durationDays: number;
  durationNights: number;
  difficulty: DifficultyLevel;
  pricePerPerson: number;
  priceChild?: number;
  altitudeMax?: number;
  altitudeBase?: number;
  groupSizeMin?: number;
  groupSizeMax?: number;
  startDate?: string;
  endDate?: string;
  meetingPoint?: string;
  nearestAirport?: string;
  nearestRailway?: string;
  coverImageUrl?: string;
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  thingsToCarry?: string[];
  status?: TrekStatus;
  isFeatured?: boolean;
  isBestseller?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

export interface AdminBooking {
  bookingId: number;
  bookingRef: string;
  trekTitle: string;
  trekSlug: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  trekDate?: string;
  numAdults: number;
  numChildren: number;
  baseAmount: number;
  discountAmount: number;
  taxAmount: number;
  finalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  emergencyContact?: string;
  emergencyPhone?: string;
  cancellationReason?: string;
  cancelledAt?: string;
  createdAt: string;
}

export interface AdminReview {
  id: number;
  trekTitle: string;
  trekSlug: string;
  userName: string;
  userEmail: string;
  rating: number;
  title?: string;
  body: string;
  isVerified?: boolean;
  isApproved?: boolean;
  helpfulCount?: number;
  createdAt: string;
}

export interface AdminCoupon {
  id: number;
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount?: number;
  perUserLimit?: number;
  validFrom: string;
  validUntil: string;
  applicableTrekTitle?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface AdminCouponRequest {
  code: string;
  description?: string;
  discountType: 'PERCENTAGE' | 'FLAT';
  discountValue: number;
  minAmount?: number;
  maxDiscount?: number;
  usageLimit?: number;
  perUserLimit?: number;
  validFrom: string;
  validUntil: string;
  applicableTrekId?: number;
  isActive?: boolean;
}

export interface AdminGuide {
  id: number;
  name: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  bio?: string;
  experienceYears?: number;
  languages?: string[];
  certifications?: string[];
  specializations?: string[];
  avgRating?: number;
  totalTreks?: number;
  isAvailable?: boolean;
  isVerified?: boolean;
  createdAt?: string;
}

export type AdminUser = User;

export interface ItineraryRequest {
  dayNumber: number;
  title: string;
  description: string;
  accommodation?: string;
  meals?: string;
  distanceKm?: number;
  durationHours?: number;
}

export interface TrekImageRequest {
  imageUrl: string;
  caption?: string;
  isCover?: boolean;
  displayOrder?: number;
}

export interface BatchRequest {
  startDate: string;
  endDate: string;
  totalSlots: number;
  availableSlots: number;
  pricePerPerson: number;
  status: string;
}

export interface PendingPayment {
  paymentId: number;
  bookingRef: string;
  amount: number;
  utrNumber: string;
  screenshotUrl: string;
  submittedAt: string;
}

export interface RejectPaymentRequest {
  rejectionReason: string;
}

export interface GuideRequest {
  name: string;
  email: string;
  phone?: string;
  photoUrl?: string;
  bio?: string;
  experienceYears?: number;
  languages?: string[];
  certifications?: string[];
  specializations?: string[];
  isAvailable?: boolean;
}

