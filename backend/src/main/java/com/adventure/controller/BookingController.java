package com.adventure.controller;

import com.adventure.dto.request.*;
import com.adventure.dto.response.*;
import com.adventure.service.interfaces.BookingService;
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

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
@Tag(name = "Bookings", description = "Booking and payment endpoints")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("isAuthenticated()")
public class BookingController {

    private final BookingService bookingService;

    @PostMapping("/create-order")
    @Operation(summary = "Create Razorpay order")
    public ResponseEntity<ApiResponse<RazorpayOrderResponse>> createOrder(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody CreateOrderRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Payment order created",
            bookingService.createOrder(userDetails.getUsername(), request)));
    }

    @PostMapping("/confirm")
    @Operation(summary = "Confirm booking after payment")
    public ResponseEntity<ApiResponse<BookingConfirmationResponse>> confirmBooking(
        @AuthenticationPrincipal UserDetails userDetails,
        @Valid @RequestBody ConfirmBookingRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.success("Booking confirmed",
            bookingService.confirmBooking(userDetails.getUsername(), request)));
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
