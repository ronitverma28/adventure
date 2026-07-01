package com.adventure.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ValidateCouponRequest {
    @NotBlank
    private String code;

    @NotNull
    private Long batchId;

    @NotNull
    private BigDecimal amount;
}
