package com.adventure.dto.response;

import com.adventure.enums.BatchStatus;
import com.adventure.enums.DifficultyLevel;
import com.adventure.enums.Meals;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Set;

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
    private List<String> highlights;
    private List<String> inclusions;
    private List<String> exclusions;
    private List<String> thingsToCarry;
    private List<ImageResponse> images;
    private List<ItineraryResponse> itinerary;
    private List<BatchResponse> batches;
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
        private Set<Meals> mealsIncluded;
        private DifficultyLevel difficultyDay;
        private String tips;
    }

    @Data
    @Builder
    public static class BatchResponse {

        private Long id;

        private LocalDate startDate;

        private LocalDate endDate;

        private Integer totalSlots;

        private Integer availableSlots;

        private BigDecimal pricePerPerson;

        private BigDecimal pricePerChild;

        private String meetingPoint;

        private BatchStatus status;
    }

    @Data
    @Builder
    public static class GuideResponse {

        private Long id;

        private String name;

        private String bio;

        private String photoUrl;

        private String phone;

        private String email;

        private Integer experienceYears;

        private List<String> languages;

        private List<String> certifications;

        private List<String> specializations;

        private BigDecimal avgRating;

        private Integer totalTreks;

        private Boolean isAvailable;

        private Boolean isVerified;
    }
}