package com.adventure.dto.response;

import com.adventure.enums.PaymentGateway;
import com.adventure.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
public class PaymentHistoryResponse {
    private Long paymentId;
    private String bookingRef;
    private String trekTitle;
    private LocalDate trekDate;
    private BigDecimal amount;
    private BigDecimal refundAmount;
    private String currency;
    private PaymentGateway gateway;
    private PaymentStatus status;
    private String gatewayOrderId;
    private String gatewayPaymentId;
    private String refundId;
    private String failureReason;
    private Instant paidAt;
    private Instant refundedAt;
    private Instant createdAt;
}
