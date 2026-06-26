package com.adventure.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Map;

@Data
@Builder
public class RatingSummaryResponse {
    private BigDecimal averageRating;
    private long totalReviews;
    private Map<Integer, Long> ratingDistribution;
}
