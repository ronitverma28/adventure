package com.adventure.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;
import java.util.List;

@Data
@Builder
public class CommunityPostResponse {
    private Long id;
    private AuthorInfo author;
    private String trekTitle;
    private String trekSlug;
    private String title;
    private String content;
    private List<String> imageUrls;
    private String type;
    private Integer likeCount;
    private Integer commentCount;
    private boolean likedByMe;
    private Instant createdAt;
    private Instant updatedAt;

    @Data @Builder
    public static class AuthorInfo {
        private Long id;
        private String name;
        private String avatarUrl;
        private long followerCount;
        private long postCount;
    }
}
