package com.adventure.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class AdminStatsResponse {
    private long totalUsers;
    private long totalTreks;
    private long totalBookings;
    private long confirmedBookings;
    private long pendingBookings;
    private long cancelledBookings;
    private BigDecimal totalRevenue;
    private BigDecimal monthlyRevenue;
    private long totalReviews;
    private long pendingReviews;
    private long totalGuides;
    private long activeCoupons;
    private List<PopularTrek> popularTreks;

    @Data
    @Builder
    public static class PopularTrek {
        private Long id;
        private String title;
        private String slug;
        private int totalBookings;
        private BigDecimal revenue;
        private double avgRating;
    }
}
