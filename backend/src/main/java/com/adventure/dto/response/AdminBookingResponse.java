package com.adventure.dto.response;

import com.adventure.enums.BookingStatus;
import com.adventure.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Data
@Builder
public class AdminBookingResponse {
    private Long bookingId;
    private String bookingRef;
    private String trekTitle;
    private String trekSlug;
    private String userName;
    private String userEmail;
    private String userPhone;
    private LocalDate trekDate;
    private Integer numAdults;
    private Integer numChildren;
    private BigDecimal baseAmount;
    private BigDecimal discountAmount;
    private BigDecimal taxAmount;
    private BigDecimal finalAmount;
    private BookingStatus status;
    private PaymentStatus paymentStatus;
    private String emergencyContact;
    private String emergencyPhone;
    private String cancellationReason;
    private Instant cancelledAt;
    private Instant createdAt;
}
