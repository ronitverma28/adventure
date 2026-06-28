package com.adventure.dto.response;

import com.adventure.enums.PaymentGateway;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class RazorpayOrderResponse {
    private PaymentGateway gateway;
    private String orderId;
    private long amount;
    private String currency;
    private String keyId;
    private String checkoutUrl;
    private String clientSecret;
    private String status;
    private String bookingRef;
    private Long paymentId;
}
