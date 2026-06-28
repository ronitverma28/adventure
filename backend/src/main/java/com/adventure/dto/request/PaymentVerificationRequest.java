package com.adventure.dto.request;

import com.adventure.enums.PaymentGateway;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PaymentVerificationRequest {
    private PaymentGateway paymentGateway = PaymentGateway.RAZORPAY;

    @NotBlank
    private String orderId;

    private String paymentId;
    private String signature;
}
