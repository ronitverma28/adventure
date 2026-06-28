package com.adventure.dto.response;

import com.adventure.enums.DifficultyLevel;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class TrekDetailResponse {
    private Long id;
    private String title;
    private String slug;
    private String shortDescription;
    private String description;
    private String location;
    private String state;
    private String region;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Integer altitudeMax;
    private Integer altitudeBase;
    private Integer durationDays;
    private Integer durationNights;
    private DifficultyLevel difficulty;
    private BigDecimal pricePerPerson;
    private BigDecimal priceChild;
    private Integer groupSizeMin;
    private Integer groupSizeMax;
    private LocalDate startDate;
    private LocalDate endDate;
    private String meetingPoint;
    private String nearestAirport;
    private String nearestRailway;
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
    private List<ImageResponse> images;
    private List<ItineraryResponse> itinerary;
    private List<GuideResponse> guides;

    @Data
    @Builder
    public static class ImageResponse {
        private Long id;
        private String imageUrl;
        private String altText;
        private String caption;
        private Boolean isCover;
        private Integer displayOrder;
    }

    @Data
    @Builder
    public static class ItineraryResponse {
        private Long id;
        private Integer dayNumber;
        private String title;
        private String description;
        private BigDecimal distanceKm;
        private Integer elevationGain;
        private Integer elevationLoss;
        private Integer maxAltitude;
        private String accommodation;
        private String[] mealsIncluded;
        private DifficultyLevel difficultyDay;
        private String tips;
    }

    @Data
    @Builder
    public static class GuideResponse {
        private Long id;
        private String name;
        private String bio;
        private String photoUrl;
        private Integer experienceYears;
        private String[] languages;
        private String[] certifications;
        private String[] specializations;
        private BigDecimal avgRating;
        private Boolean isVerified;
    }
}
