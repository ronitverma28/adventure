package com.adventure.dto.request;

import com.adventure.enums.DiscountType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
public class AdminCouponRequest {
    @NotBlank
    private String code;

    private String description;

    @NotNull
    private DiscountType discountType;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal discountValue;

    private BigDecimal minAmount;
    private BigDecimal maxDiscount;
    private Integer usageLimit;
    private Integer perUserLimit;

    @NotNull
    private Instant validFrom;

    @NotNull
    private Instant validUntil;

    private Long applicableTrekId;
    private Boolean isActive;
}
