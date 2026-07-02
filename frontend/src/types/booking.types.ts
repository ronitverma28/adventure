export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REFUNDED';
export type PaymentStatus = 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
export type PaymentGateway = 'RAZORPAY' | 'STRIPE';
export type PaymentMethod = 'CARD' | 'UPI' | 'NET_BANKING' | 'WALLET' | 'EMI';
export type DiscountType = 'PERCENTAGE' | 'FLAT';

export interface Traveler {
  id?: number;
  name: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  idType: 'Aadhaar' | 'Passport' | 'Driving License' | 'Voter ID';
  idNumber: string;
  medicalConditions?: string;
  isLeader?: boolean;
}

export interface BookingFormData {
  trekId: number;
  trekSlug: string;
  trekTitle: string;
  batchId: number;
  startDate: string;
  endDate: string;
  numAdults: number;
  numChildren: number;
  travelers: Traveler[];
  emergencyContact: string;
  emergencyPhone: string;
  pickupLocation?: string;
  specialRequests?: string;
  couponCode?: string;
  couponDiscount?: number;
  paymentGateway: PaymentGateway;
}

export interface BookingPricing {
  pricePerAdult: number;
  pricePerChild: number;
  numAdults: number;
  numChildren: number;
  subtotal: number;
  couponDiscount: number;
  taxAmount: number;
  taxRate: number;
  total: number;
}

export interface BookingConfirmation {
  bookingId: number;
  bookingRef: string;
  trekTitle: string;
  trekSlug: string;
  startDate: string;
  endDate: string;
  numAdults: number;
  numChildren: number;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  createdAt: string;
  travelers: Traveler[];
  emergencyContact: string;
  emergencyPhone: string;
  pickupLocation?: string;
  specialRequests?: string;
}

export interface PaymentHistory {
  paymentId: number;
  bookingRef: string;
  trekTitle: string;
  trekDate: string;
  amount: number;
  refundAmount?: number;
  currency: string;
  gateway: PaymentGateway;
  status: PaymentStatus;
  gatewayOrderId?: string;
  gatewayPaymentId?: string;
  refundId?: string;
  failureReason?: string;
  paidAt?: string;
  refundedAt?: string;
  createdAt: string;
}

export interface RazorpayOrder {
  gateway: PaymentGateway;
  orderId: string;
  amount: number;
  currency: string;
  keyId: string;
  checkoutUrl?: string;
  clientSecret?: string;
  status?: string;
  bookingRef?: string;
  paymentId?: number;
}

export interface CouponValidation {
  valid: boolean;
  code: string;
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  message: string;
}

export interface CreateOrderRequest {
  trekId: number;
  batchId?: number;
  startDate?: string;
  endDate?: string;
  numAdults: number;
  numChildren: number;
  couponCode?: string;
  paymentGateway?: PaymentGateway;
  travelers?: Traveler[];
  emergencyContact?: string;
  emergencyPhone?: string;
  pickupLocation?: string;
  specialRequests?: string;
}

export interface ConfirmBookingRequest {
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paymentGateway?: PaymentGateway;
  paymentOrderId?: string;
  paymentId?: string;
  paymentSignature?: string;
  trekId: number;
  batchId?: number;
  startDate?: string;
  endDate?: string;
  numAdults: number;
  numChildren: number;
  travelers: Traveler[];
  emergencyContact: string;
  emergencyPhone: string;
  pickupLocation?: string;
  specialRequests?: string;
  couponCode?: string;
}

export interface ValidateCouponRequest {
  code: string;
  batchId: number;
  amount: number;
}

export interface CreateBookingRequest {
  batchId: number;
  couponCode?: string;
  numAdults: number;
  numChildren?: number;
  travelers: Traveler[];
  emergencyContact: string;
  emergencyPhone: string;
}

export interface BookingSummaryResponse {
  bookingId: number;
  bookingRef: string;
  amount: number;
  bookingStatus: BookingStatus;
  paymentStatus: string;
  message?: string;
}
