package com.adventure.dto.request;

import com.adventure.enums.DifficultyLevel;
import com.adventure.enums.TrekStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class AdminTrekRequest {
    @NotBlank
    private String title;

    @NotBlank
    private String shortDescription;

    @NotBlank
    private String description;

    @NotBlank
    private String location;

    @NotBlank
    private String state;

    private String region;

    @NotNull
    @Min(1)
    private Integer durationDays;

    @NotNull
    @Min(0)
    private Integer durationNights;

    @NotNull
    private DifficultyLevel difficulty;

    @NotNull
    @DecimalMin("1.00")
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
    private String coverImageUrl;

    private String[] highlights;
    private String[] inclusions;
    private String[] exclusions;
    private String[] thingsToCarry;

    private TrekStatus status;
    private Boolean isFeatured;
    private Boolean isBestseller;

    private String metaTitle;
    private String metaDescription;
}
