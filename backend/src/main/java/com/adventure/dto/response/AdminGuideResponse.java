package com.adventure.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class AdminGuideResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String photoUrl;
    private String bio;
    private Integer experienceYears;
    private String[] languages;
    private String[] certifications;
    private String[] specializations;
    private BigDecimal avgRating;
    private Integer totalTreks;
    private Boolean isAvailable;
    private Boolean isVerified;
    private Instant createdAt;
}
