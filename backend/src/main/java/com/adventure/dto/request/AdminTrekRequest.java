package com.adventure.dto.request;

import com.adventure.enums.DifficultyLevel;
import com.adventure.enums.TrekStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class AdminTrekRequest {

    @NotBlank
    @Size(max = 200)
    private String title;

    @NotBlank
    @Size(max = 500)
    private String shortDescription;

    @NotBlank
    private String description;

    @NotBlank
    @Size(max = 200)
    private String location;

    @NotBlank
    @Size(max = 100)
    private String state;

    @Size(max = 100)
    private String region;

    private BigDecimal latitude;

    private BigDecimal longitude;

    private Integer altitudeMax;

    private Integer altitudeBase;

    @NotNull
    @Min(1)
    private Integer durationDays;

    @NotNull
    @Min(0)
    private Integer durationNights;

    @NotNull
    private DifficultyLevel difficulty;

    @Min(1)
    private Integer groupSizeMin;

    @Min(1)
    private Integer groupSizeMax;

    private LocalDate startDate;

    private LocalDate endDate;

    @Size(max = 300)
    private String meetingPoint;

    @Size(max = 200)
    private String nearestAirport;

    @Size(max = 200)
    private String nearestRailway;

    @Size(max = 500)
    private String coverImageUrl;

    private TrekStatus status;

    private Boolean isFeatured;

    private Boolean isBestseller;

    @Size(max = 200)
    private String metaTitle;

    @Size(max = 500)
    private String metaDescription;

    private List<String> highlights;

    private List<String> inclusions;

    private List<String> exclusions;

    private List<String> thingsToCarry;

    @Valid
    private List<TrekImageRequest> images;

    @Valid
    private List<ItineraryRequest> itinerary;

    @Valid
    private List<BatchRequest> batches;

}