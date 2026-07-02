package com.adventure.dto.request;

import com.adventure.enums.DifficultyLevel;
import com.adventure.enums.Meals;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.util.Set;

@Data
public class ItineraryRequest {

    @NotNull
    @Min(1)
    private Integer dayNumber;

    @NotBlank
    @Size(max = 200)
    private String title;

    @NotBlank
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