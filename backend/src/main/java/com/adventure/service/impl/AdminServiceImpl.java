package com.adventure.service.impl;

import com.adventure.dto.request.AdminCouponRequest;
import com.adventure.dto.request.AdminTrekRequest;
import com.adventure.dto.response.*;
import com.adventure.entity.*;
import com.adventure.enums.BookingStatus;
import com.adventure.enums.PaymentStatus;
import com.adventure.enums.TrekStatus;
import com.adventure.exception.BadRequestException;
import com.adventure.exception.ResourceNotFoundException;
import com.adventure.repository.*;
import com.adventure.service.interfaces.AdminService;
import com.cloudinary.Cloudinary;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.annotations.DialectOverride;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AdminServiceImpl implements AdminService {
    @Value("${cloudinary.folder}")
    private String CLOUD_FOLDER;

    private final TrekRepository trekRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final ReviewRepository reviewRepository;
    private final CouponRepository couponRepository;
    private final GuideRepository guideRepository;
    private final Cloudinary cloudinary;

    // ── Analytics ────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public AdminStatsResponse getStats() {
        Instant monthStart = Instant.now().minus(30, ChronoUnit.DAYS);

        BigDecimal totalRevenue = bookingRepository.getTotalRevenue();
        BigDecimal monthlyRevenue = bookingRepository.getRevenueFrom(monthStart);
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
        if (monthlyRevenue == null) monthlyRevenue = BigDecimal.ZERO;

        List<AdminStatsResponse.PopularTrek> popular = trekRepository
            .findAll(Pageable.ofSize(5)).stream()
            .sorted((a, b) -> Integer.compare(b.getTotalBookings(), a.getTotalBookings()))
            .map(t -> AdminStatsResponse.PopularTrek.builder()
                .id(t.getId())
                .title(t.getTitle())
                .slug(t.getSlug())
                .totalBookings(t.getTotalBookings())
                .avgRating(t.getAvgRating() != null ? t.getAvgRating().doubleValue() : 0)
                .build())
            .toList();

        return AdminStatsResponse.builder()
            .totalUsers(userRepository.count())
            .totalTreks(trekRepository.count())
            .totalBookings(bookingRepository.count())
            .confirmedBookings(bookingRepository.countByStatus(BookingStatus.CONFIRMED))
            .pendingBookings(bookingRepository.countByStatus(BookingStatus.PENDING))
            .cancelledBookings(bookingRepository.countByStatus(BookingStatus.CANCELLED))
            .totalRevenue(totalRevenue)
            .monthlyRevenue(monthlyRevenue)
            .totalReviews(reviewRepository.count())
            .pendingReviews(reviewRepository.countByIsApproved(false))
            .totalGuides(guideRepository.count())
            .activeCoupons(couponRepository.count())
            .popularTreks(popular)
            .build();
    }

    // ── Trek management ───────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<TrekResponse> getAllTreks(String search, String status, Pageable pageable) {
        TrekStatus trekStatus = null;
        if (StringUtils.hasText(status)) {
            try { trekStatus = TrekStatus.valueOf(status.toUpperCase()); } catch (Exception ignored) {}
        }
        Page<Trek> page = trekStatus != null
            ? trekRepository.findByStatus(trekStatus, pageable)
            : trekRepository.findAll(pageable);
        return toPagedResponse(page.map(this::toTrekResponse));
    }

    @Override
    public TrekResponse createTrek(AdminTrekRequest req) {
        String slug = slugify(req.getTitle());
        int suffix = 0;
        String candidate = slug;
        while (trekRepository.existsBySlug(candidate)) {
            candidate = slug + "-" + (++suffix);
        }
        Trek trek = Trek.builder()
            .title(req.getTitle())
            .slug(candidate)
            .shortDescription(req.getShortDescription())
            .description(req.getDescription())
            .location(req.getLocation())
            .state(req.getState())
            .region(req.getRegion())
            .durationDays(req.getDurationDays())
            .durationNights(req.getDurationNights())
            .difficulty(req.getDifficulty())
            .pricePerPerson(req.getPricePerPerson())
            .priceChild(req.getPriceChild())
            .altitudeMax(req.getAltitudeMax())
            .altitudeBase(req.getAltitudeBase())
            .groupSizeMin(req.getGroupSizeMin() != null ? req.getGroupSizeMin() : 1)
            .groupSizeMax(req.getGroupSizeMax() != null ? req.getGroupSizeMax() : 20)
            .startDate(req.getStartDate())
            .endDate(req.getEndDate())
            .meetingPoint(req.getMeetingPoint())
            .nearestAirport(req.getNearestAirport())
            .nearestRailway(req.getNearestRailway())
            .coverImageUrl(req.getCoverImageUrl())
            .highlights(toList(req.getHighlights()))
            .inclusions(toList(req.getInclusions()))
            .exclusions(toList(req.getExclusions()))
            .thingsToCarry(toList(req.getThingsToCarry()))
            .status(req.getStatus() != null ? req.getStatus() : TrekStatus.DRAFT)
            .isFeatured(Boolean.TRUE.equals(req.getIsFeatured()))
            .isBestseller(Boolean.TRUE.equals(req.getIsBestseller()))
            .metaTitle(req.getMetaTitle())
            .metaDescription(req.getMetaDescription())
            .build();
        return toTrekResponse(trekRepository.save(trek));
    }

    @Override
    public TrekResponse updateTrek(Long id, AdminTrekRequest req) {
        Trek trek = trekRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Trek", id));
        trek.setTitle(req.getTitle());
        trek.setShortDescription(req.getShortDescription());
        trek.setDescription(req.getDescription());
        trek.setLocation(req.getLocation());
        trek.setState(req.getState());
        trek.setRegion(req.getRegion());
        trek.setDurationDays(req.getDurationDays());
        trek.setDurationNights(req.getDurationNights());
        trek.setDifficulty(req.getDifficulty());
        trek.setPricePerPerson(req.getPricePerPerson());
        trek.setPriceChild(req.getPriceChild());
        trek.setAltitudeMax(req.getAltitudeMax());
        trek.setAltitudeBase(req.getAltitudeBase());
        if (req.getGroupSizeMin() != null) trek.setGroupSizeMin(req.getGroupSizeMin());
        if (req.getGroupSizeMax() != null) trek.setGroupSizeMax(req.getGroupSizeMax());
        trek.setStartDate(req.getStartDate());
        trek.setEndDate(req.getEndDate());
        trek.setMeetingPoint(req.getMeetingPoint());
        trek.setNearestAirport(req.getNearestAirport());
        trek.setNearestRailway(req.getNearestRailway());
        if (StringUtils.hasText(req.getCoverImageUrl())) trek.setCoverImageUrl(req.getCoverImageUrl());
        if (req.getHighlights() != null) trek.setHighlights(toList(req.getHighlights()));
        if (req.getInclusions() != null) trek.setInclusions(toList(req.getInclusions()));
        if (req.getExclusions() != null) trek.setExclusions(toList(req.getExclusions()));
        if (req.getThingsToCarry() != null) trek.setThingsToCarry(toList(req.getThingsToCarry()));
        if (req.getStatus() != null) trek.setStatus(req.getStatus());
        if (req.getIsFeatured() != null) trek.setIsFeatured(req.getIsFeatured());
        if (req.getIsBestseller() != null) trek.setIsBestseller(req.getIsBestseller());
        trek.setMetaTitle(req.getMetaTitle());
        trek.setMetaDescription(req.getMetaDescription());
        return toTrekResponse(trekRepository.save(trek));
    }

    @Override
    public void deleteTrek(Long id) {
        Trek trek = trekRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Trek", id));
        trekRepository.delete(trek);
    }

    // ── User management ───────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<UserResponse> getAllUsers(String search, Pageable pageable) {
        Page<User> page = StringUtils.hasText(search)
            ? userRepository.searchUsers(search, pageable)
            : userRepository.findAll(pageable);
        return toPagedResponse(page.map(this::toUserResponse));
    }

    @Override
    public UserResponse toggleUserActive(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setIsActive(!Boolean.TRUE.equals(user.getIsActive()));
        return toUserResponse(userRepository.save(user));
    }

    // ── Booking management ────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AdminBookingResponse> getAllBookings(String status, String search, Pageable pageable) {
        BookingStatus bookingStatus = null;
        if (StringUtils.hasText(status)) {
            try { bookingStatus = BookingStatus.valueOf(status.toUpperCase()); } catch (Exception ignored) {}
        }
        Page<Booking> page = bookingRepository.searchBookings(bookingStatus, search, pageable);
        return toPagedResponse(page.map(this::toAdminBookingResponse));
    }

    @Override
    public AdminBookingResponse updateBookingStatus(String bookingRef, BookingStatus status) {
        Booking booking = bookingRepository.findByBookingRef(bookingRef)
            .orElseThrow(() -> new ResourceNotFoundException("Booking", "ref", bookingRef));
        booking.setStatus(status);
        if (status == BookingStatus.CANCELLED) {
            booking.setCancelledAt(Instant.now());
            if (booking.getPayment() != null) {
                booking.getPayment().setStatus(PaymentStatus.REFUNDED);
                booking.getPayment().setRefundedAt(Instant.now());
            }
        }
        return toAdminBookingResponse(bookingRepository.save(booking));
    }

    // ── Review management ─────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AdminReviewResponse> getAllReviews(Boolean approved, Pageable pageable) {
        Page<Review> page = approved != null
            ? reviewRepository.findByIsApproved(approved, pageable)
            : reviewRepository.findAll(pageable);
        return toPagedResponse(page.map(this::toAdminReviewResponse));
    }

    @Override
    public AdminReviewResponse approveReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));
        review.setIsApproved(!Boolean.TRUE.equals(review.getIsApproved()));
        Review saved = reviewRepository.save(review);
        updateTrekRating(review.getTrek());
        return toAdminReviewResponse(saved);
    }

    @Override
    public void deleteReview(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));
        Trek trek = review.getTrek();
        boolean wasApproved = Boolean.TRUE.equals(review.getIsApproved());
        reviewRepository.delete(review);
        if (wasApproved) {
            reviewRepository.flush();
            updateTrekRating(trek);
        }
    }

    // ── Coupon management ─────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AdminCouponResponse> getAllCoupons(Pageable pageable) {
        return toPagedResponse(couponRepository.findAll(pageable).map(this::toAdminCouponResponse));
    }

    @Override
    public AdminCouponResponse createCoupon(AdminCouponRequest req) {
        if (couponRepository.findByCodeIgnoreCase(req.getCode()).isPresent()) {
            throw new BadRequestException("Coupon code already exists");
        }
        Trek applicableTrek = null;
        if (req.getApplicableTrekId() != null) {
            applicableTrek = trekRepository.findById(req.getApplicableTrekId())
                .orElseThrow(() -> new ResourceNotFoundException("Trek", req.getApplicableTrekId()));
        }
        Coupon coupon = Coupon.builder()
            .code(req.getCode().toUpperCase())
            .description(req.getDescription())
            .discountType(req.getDiscountType())
            .discountValue(req.getDiscountValue())
            .minAmount(req.getMinAmount() != null ? req.getMinAmount() : BigDecimal.ZERO)
            .maxDiscount(req.getMaxDiscount())
            .usageLimit(req.getUsageLimit())
            .perUserLimit(req.getPerUserLimit() != null ? req.getPerUserLimit() : 1)
            .validFrom(req.getValidFrom())
            .validUntil(req.getValidUntil())
            .applicableTrek(applicableTrek)
            .isActive(req.getIsActive() == null || req.getIsActive())
            .build();
        return toAdminCouponResponse(couponRepository.save(coupon));
    }

    @Override
    public AdminCouponResponse toggleCoupon(Long couponId) {
        Coupon coupon = couponRepository.findById(couponId)
            .orElseThrow(() -> new ResourceNotFoundException("Coupon", couponId));
        coupon.setIsActive(!Boolean.TRUE.equals(coupon.getIsActive()));
        return toAdminCouponResponse(couponRepository.save(coupon));
    }

    @Override
    public void deleteCoupon(Long couponId) {
        Coupon coupon = couponRepository.findById(couponId)
            .orElseThrow(() -> new ResourceNotFoundException("Coupon", couponId));
        couponRepository.delete(coupon);
    }

    // ── Guide management ──────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<AdminGuideResponse> getAllGuides(Pageable pageable) {
        return toPagedResponse(guideRepository.findAll(pageable).map(this::toAdminGuideResponse));
    }

    @Override
    public AdminGuideResponse verifyGuide(Long guideId) {
        Guide guide = guideRepository.findById(guideId)
            .orElseThrow(() -> new ResourceNotFoundException("Guide", guideId));
        guide.setIsVerified(!Boolean.TRUE.equals(guide.getIsVerified()));
        return toAdminGuideResponse(guideRepository.save(guide));
    }

    // ── Mappers ───────────────────────────────────────────────────────────────

    private TrekResponse toTrekResponse(Trek t) {
        return TrekResponse.builder()
            .id(t.getId()).title(t.getTitle()).slug(t.getSlug())
            .shortDescription(t.getShortDescription())
            .location(t.getLocation()).state(t.getState()).region(t.getRegion())
            .durationDays(t.getDurationDays()).durationNights(t.getDurationNights())
            .difficulty(t.getDifficulty())
            .pricePerPerson(t.getPricePerPerson()).priceChild(t.getPriceChild())
            .altitudeMax(t.getAltitudeMax()).altitudeBase(t.getAltitudeBase())
            .groupSizeMin(t.getGroupSizeMin()).groupSizeMax(t.getGroupSizeMax())
            .startDate(t.getStartDate()).endDate(t.getEndDate())
            .meetingPoint(t.getMeetingPoint())
            .nearestAirport(t.getNearestAirport()).nearestRailway(t.getNearestRailway())
            .status(t.getStatus()).isFeatured(t.getIsFeatured()).isBestseller(t.getIsBestseller())
            .avgRating(t.getAvgRating()).totalReviews(t.getTotalReviews()).totalBookings(t.getTotalBookings())
            .coverImageUrl(t.getCoverImageUrl())
            .metaTitle(t.getMetaTitle()).metaDescription(t.getMetaDescription())
            .highlights(toArray(t.getHighlights())).inclusions(toArray(t.getInclusions()))
            .exclusions(toArray(t.getExclusions())).thingsToCarry(toArray(t.getThingsToCarry()))
            .createdAt(t.getCreatedAt()).updatedAt(t.getUpdatedAt())
            .build();
    }

    private UserResponse toUserResponse(User u) {
        return UserResponse.builder()
            .id(u.getId()).name(u.getName()).email(u.getEmail())
            .phone(u.getPhone()).avatarUrl(u.getAvatarUrl())
            .gender(u.getGender()).dateOfBirth(u.getDateOfBirth())
            .address(u.getAddress()).city(u.getCity()).state(u.getState()).country(u.getCountry())
            .isVerified(u.getIsVerified()).emailVerified(u.getEmailVerified()).phoneVerified(u.getPhoneVerified())
            .roles(u.getRoles().stream().map(r -> r.getName()).toList())
            .build();
    }

    private AdminBookingResponse toAdminBookingResponse(Booking b) {
        return AdminBookingResponse.builder()
            .bookingId(b.getId()).bookingRef(b.getBookingRef())
            .trekTitle(b.getTrek().getTitle()).trekSlug(b.getTrek().getSlug())
            .userName(b.getUser().getName()).userEmail(b.getUser().getEmail()).userPhone(b.getUser().getPhone())
            .trekDate(b.getTrekDate())
            .numAdults(b.getNumAdults()).numChildren(b.getNumChildren())
            .baseAmount(b.getBaseAmount()).discountAmount(b.getDiscountAmount())
            .taxAmount(b.getTaxAmount()).finalAmount(b.getFinalAmount())
            .status(b.getStatus())
            .paymentStatus(b.getPayment() != null ? b.getPayment().getStatus() : PaymentStatus.PENDING)
            .emergencyContact(b.getEmergencyContact()).emergencyPhone(b.getEmergencyPhone())
            .cancellationReason(b.getCancellationReason()).cancelledAt(b.getCancelledAt())
            .createdAt(b.getCreatedAt())
            .build();
    }

    private AdminReviewResponse toAdminReviewResponse(Review r) {
        return AdminReviewResponse.builder()
            .id(r.getId())
            .trekTitle(r.getTrek().getTitle()).trekSlug(r.getTrek().getSlug())
            .userName(r.getUser().getName()).userEmail(r.getUser().getEmail())
            .rating(r.getRating()).title(r.getTitle()).body(r.getBody())
            .isVerified(r.getIsVerified()).isApproved(r.getIsApproved())
            .helpfulCount(r.getHelpfulCount()).createdAt(r.getCreatedAt())
            .build();
    }

    private AdminCouponResponse toAdminCouponResponse(Coupon c) {
        return AdminCouponResponse.builder()
            .id(c.getId()).code(c.getCode()).description(c.getDescription())
            .discountType(c.getDiscountType()).discountValue(c.getDiscountValue())
            .minAmount(c.getMinAmount()).maxDiscount(c.getMaxDiscount())
            .usageLimit(c.getUsageLimit()).usedCount(c.getUsedCount()).perUserLimit(c.getPerUserLimit())
            .validFrom(c.getValidFrom()).validUntil(c.getValidUntil())
            .applicableTrekTitle(c.getApplicableTrek() != null ? c.getApplicableTrek().getTitle() : null)
            .isActive(c.getIsActive()).createdAt(c.getCreatedAt())
            .build();
    }

    private AdminGuideResponse toAdminGuideResponse(Guide g) {
        return AdminGuideResponse.builder()
            .id(g.getId()).name(g.getName()).email(g.getEmail()).phone(g.getPhone())
            .photoUrl(g.getPhotoUrl()).bio(g.getBio())
            .experienceYears(g.getExperienceYears())
            .languages(toArray(g.getLanguages())).certifications(toArray(g.getCertifications()))
            .specializations(toArray(g.getSpecializations()))
            .avgRating(g.getAvgRating()).totalTreks(g.getTotalTreks())
            .isAvailable(g.getIsAvailable()).isVerified(g.getIsVerified())
            .createdAt(g.getCreatedAt())
            .build();
    }

    private <T> PagedResponse<T> toPagedResponse(Page<T> page) {
        return PagedResponse.<T>builder()
            .content(page.getContent())
            .page(page.getNumber()).size(page.getSize())
            .totalElements(page.getTotalElements()).totalPages(page.getTotalPages())
            .first(page.isFirst()).last(page.isLast())
            .build();
    }

    private void updateTrekRating(Trek trek) {
        long totalReviews = reviewRepository.countByTrekIdAndIsApproved(trek.getId(), true);
        long weightedTotal = 0;
        for (int rating = 1; rating <= 5; rating++) {
            weightedTotal += (long) rating * reviewRepository.countByTrekIdAndIsApprovedAndRating(trek.getId(), true, rating);
        }

        trek.setTotalReviews((int) totalReviews);
        trek.setAvgRating(totalReviews == 0
            ? BigDecimal.ZERO
            : BigDecimal.valueOf(weightedTotal).divide(BigDecimal.valueOf(totalReviews), 2, RoundingMode.HALF_UP));
        trekRepository.save(trek);
    }

    private String slugify(String text) {
        return text.toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("[\\s]+", "-")
            .replaceAll("-+", "-")
            .replaceAll("^-|-$", "");
    }

    private List<String> toList(String[] values) {
        if (values == null || values.length == 0) {
            return new java.util.ArrayList<>();
        }
        return Arrays.stream(values)
            .filter(StringUtils::hasText)
            .map(String::trim)
            .collect(java.util.stream.Collectors.toCollection(java.util.ArrayList::new));
    }

    private String[] toArray(List<String> values) {
        if (values == null || values.isEmpty()) {
            return new String[0];
        }
        return values.toArray(String[]::new);
    }


    @Override
    @SuppressWarnings("unchecked")
    public List<CloudinaryFileResponse> getAllFiles() {
        List<CloudinaryFileResponse> files = new ArrayList<>();
        try {
            Map<String, Object> result = cloudinary.search()
                    .expression("asset_folder=" + CLOUD_FOLDER)
                    .maxResults(500)
                    .execute();

            System.out.println(result);


            List<Map<String, Object>> resources =
                    (List<Map<String, Object>>) result.get("resources");

            System.out.println(resources);

            for (Map<String, Object> resource : resources) {

                files.add(
                        CloudinaryFileResponse.builder()
                                .assetId((String) resource.get("asset_id"))
                                .publicId((String) resource.get("public_id"))
                                .url((String) resource.get("url"))
                                .secureUrl((String) resource.get("secure_url"))
                                .format((String) resource.get("format"))
                                .resourceType((String) resource.get("resource_type"))
                                .folder((String) resource.get("asset_folder"))
                                .bytes(((Number) resource.get("bytes")).longValue())
                                .width(resource.get("width") == null ? null :
                                        ((Number) resource.get("width")).intValue())
                                .height(resource.get("height") == null ? null :
                                        ((Number) resource.get("height")).intValue())
                                .createdAt((String) resource.get("created_at"))
                                .build()
                );
            }

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return files;
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<CloudinaryFileResponse> getAllFiles(String folderName) {
        if(folderName == null) throw new BadRequestException("Invalid Folder Name : " +folderName);

        List<CloudinaryFileResponse> files = new ArrayList<>();
        try {
            Map<String, Object> result = cloudinary.search()
                    .expression("asset_folder=" + CLOUD_FOLDER + "/" + folderName)
                    .maxResults(500)
                    .execute();

            System.out.println(result);


            List<Map<String, Object>> resources =
                    (List<Map<String, Object>>) result.get("resources");

            System.out.println(resources);

            for (Map<String, Object> resource : resources) {

                files.add(
                        CloudinaryFileResponse.builder()
                                .assetId((String) resource.get("asset_id"))
                                .publicId((String) resource.get("public_id"))
                                .url((String) resource.get("url"))
                                .secureUrl((String) resource.get("secure_url"))
                                .format((String) resource.get("format"))
                                .resourceType((String) resource.get("resource_type"))
                                .folder((String) resource.get("asset_folder"))
                                .bytes(((Number) resource.get("bytes")).longValue())
                                .width(resource.get("width") == null ? null :
                                        ((Number) resource.get("width")).intValue())
                                .height(resource.get("height") == null ? null :
                                        ((Number) resource.get("height")).intValue())
                                .createdAt((String) resource.get("created_at"))
                                .build()
                );
            }

        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        return files;
    }
}
