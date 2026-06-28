package com.adventure.dto.response;

import com.adventure.enums.DifficultyLevel;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class TrekCardResponse {
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
    private BigDecimal avgRating;
    private Integer totalReviews;
    private String coverImageUrl;
    private Boolean isFeatured;
    private Boolean isBestseller;
}
