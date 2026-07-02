package com.adventure.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBookingRequest {
    @NotNull(message = "Batch is required")

    private Long batchId;

    private String couponCode;

    @NotNull(message = "Number of adults is required")

    @Min(value = 1, message = "At least one adult is required")

    private Integer numAdults;

    @Builder.Default

    private Integer numChildren = 0;

    @Valid

    @NotNull(message = "Traveler details are required")

    private List<TravelerRequest> travelers;

    private String emergencyContact;

    private String emergencyPhone;
}
