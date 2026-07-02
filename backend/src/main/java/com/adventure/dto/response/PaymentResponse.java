package com.adventure.dto.response;

import com.adventure.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
public class PaymentResponse {

    private Long paymentId;

    private Long bookingId;

    private String bookingRef;

    private String customerName;

    private String email;

    private String phone;

    private BigDecimal amount;

    private String utrNumber;

    private String screenshotUrl;

    private PaymentStatus paymentStatus;

    private Instant uploadedAt;

}