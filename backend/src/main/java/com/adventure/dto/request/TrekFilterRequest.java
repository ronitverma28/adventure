package com.adventure.dto.request;

import com.adventure.enums.DifficultyLevel;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TrekFilterRequest {
    private String search;
    private DifficultyLevel difficulty;
    private String state;
    private String region;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Boolean featured;
    private Boolean bestseller;
    private String sort;
}
