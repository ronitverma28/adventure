package com.adventure.dto.response;

import com.adventure.enums.DiscountType;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class AdminCouponResponse {
    private Long id;
    private String code;
    private String description;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal minAmount;
    private BigDecimal maxDiscount;
    private Integer usageLimit;
    private Integer usedCount;
    private Integer perUserLimit;
    private Instant validFrom;
    private Instant validUntil;
    private String applicableTrekTitle;
    private Boolean isActive;
    private Instant createdAt;
//    private LocalDate startDate;
    private Instant updatedAt;
}
