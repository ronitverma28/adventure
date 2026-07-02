package com.adventure.controller;

import com.adventure.dto.request.*;
import com.adventure.dto.response.*;
import com.adventure.service.interfaces.BookingService;
import com.adventure.service.interfaces.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Booking and payment endpoints")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("isAuthenticated()")
public class BookingController {

    private final BookingService bookingService;
    private final PaymentService paymentService;

    @PostMapping
@Operation(summary = "Create booking")
public ResponseEntity<ApiResponse<BookingSummaryResponse>> createBooking(

        @AuthenticationPrincipal UserDetails userDetails,

        @Valid
        @RequestBody CreateBookingRequest request

) {

    return ResponseEntity.ok(

            ApiResponse.success(

                    "Booking created successfully",

                    bookingService.createBooking(
                            userDetails.getUsername(),
                            request
                    )

            )

    );

}

@PostMapping(
        value = "/upload-payment",
        consumes = "multipart/form-data"
)
@Operation(summary = "Upload payment proof")
public ResponseEntity<ApiResponse<String>> uploadPayment(

        @AuthenticationPrincipal UserDetails userDetails,

        @RequestParam String bookingRef,

        @RequestParam String utrNumber,

        @RequestParam MultipartFile screenshot

) {

    paymentService.uploadPaymentProof(

            userDetails.getUsername(),

            bookingRef,

            utrNumber,

            screenshot

    );

    return ResponseEntity.ok(

            ApiResponse.success(

                    "Payment submitted successfully."

            )

    );

}

    @PostMapping("/validate-coupon")
    @Operation(summary = "Validate coupon")
    public ResponseEntity<ApiResponse<CouponValidationResponse>> validateCoupon(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody ValidateCouponRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success(
            bookingService.validateCoupon(userDetails.getUsername(), request)));
    }

    @GetMapping("/my")
    @Operation(summary = "Get current user's bookings")
    public ResponseEntity<ApiResponse<PagedResponse<BookingConfirmationResponse>>> getMyBookings(
        @AuthenticationPrincipal UserDetails userDetails,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(
            bookingService.getMyBookings(userDetails.getUsername(), pageable)));
    }

    @GetMapping("/{bookingRef}")
    @Operation(summary = "Get booking by reference")
    public ResponseEntity<ApiResponse<BookingConfirmationResponse>> getBooking(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable String bookingRef
    ) {
        return ResponseEntity.ok(ApiResponse.success(
            bookingService.getBooking(userDetails.getUsername(), bookingRef)));
    }

    @PostMapping("/{bookingRef}/cancel")
    @Operation(summary = "Cancel booking")
    public ResponseEntity<ApiResponse<Void>> cancelBooking(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable String bookingRef,
        @Valid @RequestBody CancelBookingRequest request
    ) {
        bookingService.cancelBooking(userDetails.getUsername(), bookingRef, request);
        return ResponseEntity.ok(ApiResponse.success("Booking cancelled successfully", null));
    }

    @GetMapping("/{bookingRef}/ticket")
    @Operation(summary = "Download ticket placeholder")
    public ResponseEntity<byte[]> downloadTicket(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable String bookingRef
    ) {
        return ResponseEntity.ok()
            .header("Content-Type", "application/pdf")
            .header("Content-Disposition", "attachment; filename=ticket-" + bookingRef + ".pdf")
            .body(bookingService.generateTicket(userDetails.getUsername(), bookingRef));
    }

    @GetMapping("/{bookingRef}/invoice")
    @Operation(summary = "Download invoice placeholder")
    public ResponseEntity<byte[]> downloadInvoice(
        @AuthenticationPrincipal UserDetails userDetails,
        @PathVariable String bookingRef
    ) {
        return ResponseEntity.ok()
            .header("Content-Type", "application/pdf")
            .header("Content-Disposition", "attachment; filename=invoice-" + bookingRef + ".pdf")
            .body(bookingService.generateInvoice(userDetails.getUsername(), bookingRef));
    }
}
