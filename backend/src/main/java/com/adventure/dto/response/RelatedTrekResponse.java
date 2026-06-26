package com.adventure.dto.response;

import com.adventure.enums.DifficultyLevel;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class RelatedTrekResponse {
    private Long id;
    private String title;
    private String slug;
    private String location;
    private String state;
    private String region;
    private Integer durationDays;
    private DifficultyLevel difficulty;
    private BigDecimal pricePerPerson;
    private BigDecimal avgRating;
    private String coverImageUrl;
}
