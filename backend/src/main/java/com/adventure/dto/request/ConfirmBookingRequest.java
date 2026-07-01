package com.adventure.dto.request;

import com.adventure.enums.PaymentGateway;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class ConfirmBookingRequest {
    private String razorpayOrderId;

    private String razorpayPaymentId;

    private String razorpaySignature;

    private PaymentGateway paymentGateway = PaymentGateway.RAZORPAY;
    private String paymentOrderId;
    private String paymentId;
    private String paymentSignature;


    @NotNull
    private Long batchId;

    private LocalDate startDate;

    private LocalDate endDate;

    @Min(1)
    private int numAdults = 1;

    @Min(0)
    private int numChildren = 0;

    @Valid
    @NotEmpty
    private List<TravelerRequest> travelers;

    @NotBlank
    private String emergencyContact;

    @NotBlank
    private String emergencyPhone;

    private String pickupLocation;
    private String specialRequests;
    private String couponCode;
}
