package com.adventure.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class AdminReviewResponse {
    private Long id;
    private Long trekId;
    private Long userId;
    private String userPhoto;
    private String trekTitle;
    private List<String> photos;
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
    private Instant updatedAt;
}
