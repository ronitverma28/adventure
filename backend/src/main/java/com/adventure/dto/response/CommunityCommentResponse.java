package com.adventure.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class CommunityCommentResponse {
    private Long id;
    private Long postId;
    private CommunityPostResponse.AuthorInfo author;
    private String content;
    private Integer likeCount;
    private Instant createdAt;
}
