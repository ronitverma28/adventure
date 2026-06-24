package com.adventure.dto.request;

import com.adventure.enums.PaymentGateway;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class CreateOrderRequest {
    @NotNull
    private Long trekId;

    private Long batchId;

    private LocalDate startDate;

    private LocalDate endDate;

    @Min(1)
    private int numAdults = 1;

    @Min(0)
    private int numChildren = 0;

    private String couponCode;

    private PaymentGateway paymentGateway = PaymentGateway.RAZORPAY;

    @Valid
    private List<TravelerRequest> travelers;

    private String emergencyContact;
    private String emergencyPhone;
    private String pickupLocation;
    private String specialRequests;
}
