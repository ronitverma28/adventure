package com.adventure.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class DiscussionResponse {
    private Long id;
    private CommunityPostResponse.AuthorInfo author;
    private String trekTitle;
    private String trekSlug;
    private String title;
    private String body;
    private String category;
    private Integer replyCount;
    private Integer viewCount;
    private Boolean isResolved;
    private Boolean isPinned;
    private Instant createdAt;
}
