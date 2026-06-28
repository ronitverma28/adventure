package com.adventure.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class AdminReviewResponse {
    private Long id;
    private String trekTitle;
    private String trekSlug;
    private String userName;
    private String userEmail;
    private Integer rating;
    private String title;
    private String body;
    private Boolean isVerified;
    private Boolean isApproved;
    private Integer helpfulCount;
    private Instant createdAt;
}
