export type DifficultyLevel = 'EASY' | 'MODERATE' | 'DIFFICULT' | 'EXTREME';
export type TrekStatus = 'DRAFT' | 'ACTIVE' | 'INACTIVE' | 'SOLD_OUT' | 'CANCELLED';
export type SortOption = 'popular' | 'price_asc' | 'price_desc' | 'rating' | 'duration_asc' | 'duration_desc' | 'newest';

export interface TrekImage {
  id: number;
  imageUrl: string;
  altText?: string;
  caption?: string;
  isCover: boolean;
  displayOrder: number;
}

export interface ItineraryDay {
  id: number;
  dayNumber: number;
  title: string;
  description: string;
  distanceKm?: number;
  elevationGain?: number;
  maxAltitude?: number;
  accommodation?: string;
  mealsIncluded?: string[];
  difficultyDay?: DifficultyLevel;
}

export interface TrekBatchDate {
  id: number;
  startDate: string;
  endDate: string;
  availableSeats: number;
  totalSeats: number;
  price?: number;
}

export interface Trek {
  id: number;
  title: string;
  slug: string;
  shortDescription: string;
  location: string;
  state: string;
  region?: string;
  altitudeMax?: number;
  altitudeBase?: number;
  durationDays: number;
  durationNights: number;
  difficulty: DifficultyLevel;
  pricePerPerson: number;
  priceChild?: number;
  coverImageUrl?: string;
  avgRating: number;
  totalReviews: number;
  totalBookings: number;
  isFeatured: boolean;
  isBestseller: boolean;
  status: TrekStatus;
  startDate?: string;
  endDate?: string;
  bestSeason?: string[];
  groupSizeMin: number;
  groupSizeMax: number;
  highlights?: string[];
  images?: TrekImage[];
  itinerary?: ItineraryDay[];
  upcomingBatches?: TrekBatchDate[];
  routeMapUrl?: string;
  createdAt: string;
}

export interface TrekDetail extends Trek {
  description: string;
  inclusions?: string[];
  exclusions?: string[];
  thingsToCarry?: string[];
  meetingPoint?: string;
  nearestAirport?: string;
  nearestRailway?: string;
  latitude?: number;
  longitude?: number;
  metaTitle?: string;
  metaDescription?: string;
}

export interface TrekFilters {
  search?: string;
  state?: string;
  difficulty?: DifficultyLevel;
  minPrice?: number;
  maxPrice?: number;
  minDays?: number;
  maxDays?: number;
  minAltitude?: number;
  maxAltitude?: number;
  bestSeason?: string;
  isFeatured?: boolean;
  sort?: SortOption;
}

export interface TrekFilterOptions {
  states: string[];
  maxPrice: number;
  maxDuration: number;
  maxAltitude: number;
}
