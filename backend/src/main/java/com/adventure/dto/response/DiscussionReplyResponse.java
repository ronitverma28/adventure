package com.adventure.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class DiscussionReplyResponse {
    private Long id;
    private Long discussionId;
    private CommunityPostResponse.AuthorInfo author;
    private String content;
    private Boolean isAccepted;
    private Integer likeCount;
    private Instant createdAt;
}
