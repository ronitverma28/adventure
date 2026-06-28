package com.adventure.dto.response;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
public class TrekAvailabilityResponse {
    private Long batchId;
    private Long trekId;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer totalSlots;
    private Integer availableSlots;
    private BigDecimal pricePerPerson;
    private String meetingPoint;
}
