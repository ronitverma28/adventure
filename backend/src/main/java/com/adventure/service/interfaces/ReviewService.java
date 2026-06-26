package com.adventure.service.interfaces;

import com.adventure.dto.request.ReviewRequest;
import com.adventure.dto.response.PagedResponse;
import com.adventure.dto.response.RatingSummaryResponse;
import com.adventure.dto.response.ReviewResponse;
import org.springframework.data.domain.Pageable;

public interface ReviewService {
    ReviewResponse createReview(String email, ReviewRequest request);
    ReviewResponse updateReview(String email, Long reviewId, ReviewRequest request);
    void deleteReview(String email, Long reviewId);
    PagedResponse<ReviewResponse> getMyReviews(String email, Pageable pageable);
    PagedResponse<ReviewResponse> getTrekReviews(Long trekId, Pageable pageable);
    RatingSummaryResponse getTrekRating(Long trekId);
}
