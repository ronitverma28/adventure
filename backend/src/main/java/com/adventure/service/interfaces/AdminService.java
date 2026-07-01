package com.adventure.service.interfaces;

import com.adventure.dto.request.*;
import com.adventure.dto.response.*;
import com.adventure.enums.BookingStatus;
import com.adventure.enums.TrekStatus;
import org.springframework.data.domain.Pageable;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface AdminService {
    AdminStatsResponse getStats();
    PagedResponse<TrekResponse> getAllTreks(String search, String status, Pageable pageable);
    TrekResponse getTrek(Long trekId);
    TrekResponse createTrek(AdminTrekRequest request);
    TrekResponse updateTrek(Long trekId, AdminTrekRequest request);
    TrekResponse changeTrekStatus(Long trekId, TrekStatus status);
    void deleteTrek(Long trekId);
    TrekDetailResponse.ImageResponse addTrekImage(Long trekId, TrekImageRequest request);
    TrekDetailResponse.ImageResponse updateTrekImage(Long imageId, TrekImageRequest request);
    void deleteTrekImage(Long imageId);
    TrekDetailResponse.ImageResponse setCoverImage(Long trekId, Long imageId);
    TrekDetailResponse.ItineraryResponse addItineraryDay(Long trekId, ItineraryRequest request);
    TrekDetailResponse.ItineraryResponse updateItineraryDay(Long itineraryId, ItineraryRequest request);
    void deleteItineraryDay(Long itineraryId);
    TrekDetailResponse.BatchResponse createBatch(Long trekId, BatchRequest request);
    TrekDetailResponse.BatchResponse updateBatch(Long batchId, BatchRequest request);
    void deleteBatch(Long batchId);
    PagedResponse<AdminGuideResponse> getAllGuides(Pageable pageable);
    AdminGuideResponse getGuide(Long guideId);
    AdminGuideResponse createGuide(GuideRequest request);
    AdminGuideResponse updateGuide(Long guideId, GuideRequest request);
    AdminGuideResponse verifyGuide(Long guideId);
    void deleteGuide(Long guideId);
    PagedResponse<UserResponse> getAllUsers(String search, Pageable pageable);
    UserResponse toggleUserActive(Long userId);
    PagedResponse<AdminBookingResponse> getAllBookings(String status, String search, Pageable pageable);
    AdminBookingResponse updateBookingStatus(String bookingRef, BookingStatus status);
    PagedResponse<AdminReviewResponse> getAllReviews(Boolean approved, Pageable pageable);
    AdminReviewResponse approveReview(Long reviewId);
    void deleteReview(Long reviewId);
    PagedResponse<AdminCouponResponse> getAllCoupons(Pageable pageable);
    AdminCouponResponse createCoupon(AdminCouponRequest request);
    AdminCouponResponse toggleCoupon(Long couponId);
    void deleteCoupon(Long couponId);
    List<CloudinaryFileResponse> getAllFiles();
    List<String> getAllFolders();
    List<CloudinaryFileResponse> getAllFiles(String folderName);
}