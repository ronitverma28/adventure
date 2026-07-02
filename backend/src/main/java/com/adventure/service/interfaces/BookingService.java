package com.adventure.service.interfaces;

import com.adventure.dto.request.CancelBookingRequest;
import com.adventure.dto.request.CreateBookingRequest;
import com.adventure.dto.request.ValidateCouponRequest;
import com.adventure.dto.response.BookingConfirmationResponse;
import com.adventure.dto.response.BookingSummaryResponse;
import com.adventure.dto.response.CouponValidationResponse;
import com.adventure.dto.response.PagedResponse;
import org.springframework.data.domain.Pageable;

public interface BookingService {

    BookingSummaryResponse createBooking(
            String userEmail,
            CreateBookingRequest request
    );

    CouponValidationResponse validateCoupon(
            String userEmail,
            ValidateCouponRequest request
    );

    PagedResponse<BookingConfirmationResponse> getMyBookings(
            String userEmail,
            Pageable pageable
    );

    BookingConfirmationResponse getBooking(
            String userEmail,
            String bookingRef
    );

    void cancelBooking(
            String userEmail,
            String bookingRef,
            CancelBookingRequest request
    );

    byte[] generateTicket(
            String userEmail,
            String bookingRef
    );

    byte[] generateInvoice(
            String userEmail,
            String bookingRef
    );
}
