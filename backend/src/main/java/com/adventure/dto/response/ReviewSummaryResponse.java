package com.adventure.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReviewSummaryResponse {
    private Long id;
    private Integer rating;
    private String title;
    private String comment;
    private String userName;
    private String userAvatarUrl;
}
