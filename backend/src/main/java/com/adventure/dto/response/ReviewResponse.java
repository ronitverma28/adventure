package com.adventure.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ReviewResponse {
    private Long id;
    private Long trekId;
    private String trekTitle;
    private String trekSlug;
    private Long userId;
    private String userName;
    private String userAvatarUrl;
    private Integer rating;
    private String title;
    private String comment;
    private String[] photos;
    private Boolean isVerified;
    private Boolean isApproved;
    private Integer helpfulCount;
    private Instant createdAt;
    private Instant updatedAt;
}
