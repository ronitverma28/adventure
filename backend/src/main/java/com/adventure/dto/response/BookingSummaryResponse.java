package com.adventure.dto.response;

import com.adventure.enums.BookingStatus;
import com.adventure.enums.PaymentStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
public class BookingSummaryResponse {

    private Long bookingId;

    private String bookingRef;

    private BigDecimal amount;

    private BookingStatus bookingStatus;

    private PaymentStatus paymentStatus;

    private String message;
}
