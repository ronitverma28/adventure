package com.adventure.dto.request;

import jakarta.validation.constraints.DecimalMin;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class RefundPaymentRequest {
    @DecimalMin(value = "1.00", message = "Refund amount must be greater than zero")
    private BigDecimal amount;

    private String reason;
}
