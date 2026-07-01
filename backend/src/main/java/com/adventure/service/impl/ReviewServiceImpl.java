package com.adventure.service.impl;

import com.adventure.dto.request.ReviewRequest;
import com.adventure.dto.response.PagedResponse;
import com.adventure.dto.response.RatingSummaryResponse;
import com.adventure.dto.response.ReviewResponse;
import com.adventure.entity.Review;
import com.adventure.entity.Trek;
import com.adventure.entity.User;
import com.adventure.enums.BookingStatus;
import com.adventure.enums.TrekStatus;
import com.adventure.exception.BadRequestException;
import com.adventure.exception.ResourceNotFoundException;
import com.adventure.exception.UnauthorizedException;
import com.adventure.repository.BookingRepository;
import com.adventure.repository.ReviewRepository;
import com.adventure.repository.TrekRepository;
import com.adventure.repository.UserRepository;
import com.adventure.service.interfaces.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final TrekRepository trekRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    @Override
    public ReviewResponse createReview(String email, ReviewRequest request) {

        if (request.getTrekId() == null) {
            throw new BadRequestException("trekId is required");
        }

        User user = getUser(email);

        Trek trek = trekRepository.findByIdAndStatus(
                request.getTrekId(),
                TrekStatus.ACTIVE
        ).orElseThrow(() ->
                new ResourceNotFoundException("Trek", request.getTrekId()));

        if (reviewRepository.existsByTrekIdAndUserId(
                trek.getId(),
                user.getId())) {
            throw new BadRequestException("You have already reviewed this trek");
        }

        boolean completedBooking =
                bookingRepository.existsByUserIdAndBatchTrekIdAndStatus(
                        user.getId(),
                        trek.getId(),
                        BookingStatus.COMPLETED
                );

        if (!completedBooking) {
            throw new BadRequestException(
                    "Only users with a completed booking can review this trek"
            );
        }

        Review review = Review.builder()
                .trek(trek)
                .user(user)
                .rating(request.getRating())
                .title(request.getTitle())
                .body(request.getComment())
                .photos(toList(request.getPhotos()))
                .isVerified(true)
                .isApproved(false)
                .helpfulCount(0)
                .build();

        return toReviewResponse(reviewRepository.save(review));
    }

    @Override
    public ReviewResponse updateReview(String email, Long reviewId, ReviewRequest request) {
        User user = getUser(email);
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));

        if (!review.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Only the review owner can update this review");
        }

        boolean wasApproved = Boolean.TRUE.equals(review.getIsApproved());
        Trek trek = review.getTrek();
        review.setRating(request.getRating());
        review.setTitle(request.getTitle());
        review.setBody(request.getComment());
        if (request.getPhotos() != null) {
            review.setPhotos(toList(request.getPhotos()));
        }
        review.setIsApproved(false);

        Review saved = reviewRepository.save(review);
        if (wasApproved) {
            reviewRepository.flush();
            updateTrekRating(trek);
        }
        return toReviewResponse(saved);
    }

    @Override
    public void deleteReview(String email, Long reviewId) {
        User user = getUser(email);
        Review review = reviewRepository.findById(reviewId)
            .orElseThrow(() -> new ResourceNotFoundException("Review", reviewId));

        if (!review.getUser().getId().equals(user.getId()) && !isAdmin(user)) {
            throw new AccessDeniedException("Only the review owner or an admin can delete this review");
        }

        Trek trek = review.getTrek();
        boolean wasApproved = Boolean.TRUE.equals(review.getIsApproved());
        reviewRepository.delete(review);
        if (wasApproved) {
            reviewRepository.flush();
            updateTrekRating(trek);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ReviewResponse> getMyReviews(String email, Pageable pageable) {
        User user = getUser(email);
        return toPagedResponse(reviewRepository.findByUserId(user.getId(), pageable).map(this::toReviewResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<ReviewResponse> getTrekReviews(Long trekId, Pageable pageable) {
        if (!trekRepository.existsById(trekId)) {
            throw new ResourceNotFoundException("Trek", trekId);
        }
        return toPagedResponse(reviewRepository.findByTrekIdAndIsApproved(trekId, true, pageable).map(this::toReviewResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public RatingSummaryResponse getTrekRating(Long trekId) {
        if (!trekRepository.existsById(trekId)) {
            throw new ResourceNotFoundException("Trek", trekId);
        }

        Map<Integer, Long> distribution = new LinkedHashMap<>();
        long weightedTotal = 0;
        long totalReviews = 0;
        for (int rating = 5; rating >= 1; rating--) {
            long count = reviewRepository.countByTrekIdAndIsApprovedAndRating(trekId, true, rating);
            distribution.put(rating, count);
            weightedTotal += (long) rating * count;
            totalReviews += count;
        }

        BigDecimal average = totalReviews == 0
            ? BigDecimal.ZERO
            : BigDecimal.valueOf(weightedTotal)
                .divide(BigDecimal.valueOf(totalReviews), 2, RoundingMode.HALF_UP);

        return RatingSummaryResponse.builder()
            .averageRating(average)
            .totalReviews(totalReviews)
            .ratingDistribution(distribution)
            .build();
    }

    private User getUser(String email) {
        if (!StringUtils.hasText(email)) {
            throw new UnauthorizedException("Authentication is required");
        }
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private boolean isAdmin(User user) {
        return user.getRoles().stream()
            .anyMatch(role -> "ROLE_ADMIN".equals(role.getName()));
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

    private ReviewResponse toReviewResponse(Review review) {
        return ReviewResponse.builder()
            .id(review.getId())
            .trekId(review.getTrek().getId())
            .trekTitle(review.getTrek().getTitle())
            .trekSlug(review.getTrek().getSlug())
            .userId(review.getUser().getId())
            .userName(review.getUser().getName())
            .userAvatarUrl(review.getUser().getAvatarUrl())
            .rating(review.getRating())
            .title(review.getTitle())
            .comment(review.getBody())
            .photos(toArray(review.getPhotos()))
            .isVerified(review.getIsVerified())
            .isApproved(review.getIsApproved())
            .helpfulCount(review.getHelpfulCount())
            .createdAt(review.getCreatedAt())
            .updatedAt(review.getUpdatedAt())
            .build();
    }

    private <T> PagedResponse<T> toPagedResponse(Page<T> page) {
        return PagedResponse.<T>builder()
            .content(page.getContent())
            .page(page.getNumber())
            .size(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .first(page.isFirst())
            .last(page.isLast())
            .build();
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
}
