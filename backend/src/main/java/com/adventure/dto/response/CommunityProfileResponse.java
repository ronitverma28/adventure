package com.adventure.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CommunityProfileResponse {
    private Long id;
    private String name;
    private String avatarUrl;
    private String city;
    private String state;
    private long followerCount;
    private long followingCount;
    private long postCount;
    private boolean followedByMe;
}
