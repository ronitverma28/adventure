package com.adventure.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class CreateOrderRequest {
    @NotNull
    private Long batchId;

    @Min(1)
    private int numAdults = 1;

    @Min(0)
    private int numChildren = 0;

    private String couponCode;

    @Valid
    private List<TravelerRequest> travelers;

    private String emergencyContact;
    private String emergencyPhone;
}
