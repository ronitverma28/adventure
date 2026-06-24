package com.adventure.service.interfaces;

import com.adventure.dto.request.AdminCouponRequest;
import com.adventure.dto.request.AdminTrekRequest;
import com.adventure.dto.response.*;
import com.adventure.enums.BookingStatus;
import org.springframework.data.domain.Pageable;

public interface AdminService {
    // Analytics
    AdminStatsResponse getStats();

    // Trek management
    PagedResponse<TrekResponse> getAllTreks(String search, String status, Pageable pageable);
    TrekResponse createTrek(AdminTrekRequest request);
    TrekResponse updateTrek(Long id, AdminTrekRequest request);
    void deleteTrek(Long id);

    // User management
    PagedResponse<UserResponse> getAllUsers(String search, Pageable pageable);
    UserResponse toggleUserActive(Long userId);

    // Booking management
    PagedResponse<AdminBookingResponse> getAllBookings(String status, String search, Pageable pageable);
    AdminBookingResponse updateBookingStatus(String bookingRef, BookingStatus status);

    // Review management
    PagedResponse<AdminReviewResponse> getAllReviews(Boolean approved, Pageable pageable);
    AdminReviewResponse approveReview(Long reviewId);
    void deleteReview(Long reviewId);

    // Coupon management
    PagedResponse<AdminCouponResponse> getAllCoupons(Pageable pageable);
    AdminCouponResponse createCoupon(AdminCouponRequest request);
    AdminCouponResponse toggleCoupon(Long couponId);
    void deleteCoupon(Long couponId);

    // Guide management
    PagedResponse<AdminGuideResponse> getAllGuides(Pageable pageable);
    AdminGuideResponse verifyGuide(Long guideId);
}
