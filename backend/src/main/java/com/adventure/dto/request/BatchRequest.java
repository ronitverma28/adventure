package com.adventure.dto.request;

import com.adventure.enums.BatchStatus;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class BatchRequest {

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;

    @NotNull
    @Min(1)
    private Integer totalSlots;

    @NotNull
    @DecimalMin("1.00")
    private BigDecimal pricePerPerson;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal pricePerChild;

    @Size(max = 300)
    private String meetingPoint;

    private BatchStatus status;

    private List<Long> guideIds;
}