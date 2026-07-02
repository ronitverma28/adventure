package com.adventure.dto.response;

import com.adventure.enums.BookingStatus;
import com.adventure.enums.PaymentStatus;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
public class BookingConfirmationResponse {
    private Long bookingId;
    private String bookingRef;
    private String trekTitle;
    private String trekSlug;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer numAdults;
    private Integer numChildren;
    private BigDecimal totalAmount;
    private BookingStatus status;
    private PaymentStatus paymentStatus;
    private Instant createdAt;
    private List<TravelerResponse> travelers;
    private String emergencyContact;
    private String emergencyPhone;
}
