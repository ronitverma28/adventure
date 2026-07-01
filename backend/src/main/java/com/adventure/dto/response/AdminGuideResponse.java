package com.adventure.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Data
@Builder
public class AdminGuideResponse {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String photoUrl;
    private String bio;
    private Integer experienceYears;
    private List<String> languages;
    private List<String> certifications;
    private List<String> specializations;
    private BigDecimal avgRating;
    private Integer totalTreks;
    private Boolean isAvailable;
    private Boolean isVerified;
    private Instant createdAt;
    private Instant updatedAt;
}
