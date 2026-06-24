package com.adventure.dto.response;

import com.adventure.enums.DifficultyLevel;
import com.adventure.enums.TrekStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
public class TrekResponse {
    private Long id;
    private String title;
    private String slug;
    private String shortDescription;
    private String location;
    private String state;
    private String region;
    private Integer durationDays;
    private Integer durationNights;
    private DifficultyLevel difficulty;
    private BigDecimal pricePerPerson;
    private BigDecimal priceChild;
    private Integer altitudeMax;
    private Integer altitudeBase;
    private Integer groupSizeMin;
    private Integer groupSizeMax;
    private LocalDate startDate;
    private LocalDate endDate;
    private String meetingPoint;
    private String nearestAirport;
    private String nearestRailway;
    private TrekStatus status;
    private Boolean isFeatured;
    private Boolean isBestseller;
    private BigDecimal avgRating;
    private Integer totalReviews;
    private Integer totalBookings;
    private String coverImageUrl;
    private String metaTitle;
    private String metaDescription;
    private String[] highlights;
    private String[] inclusions;
    private String[] exclusions;
    private String[] thingsToCarry;
    private Instant createdAt;
    private Instant updatedAt;
}
