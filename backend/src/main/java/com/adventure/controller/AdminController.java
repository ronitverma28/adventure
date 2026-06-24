package com.adventure.controller;

import com.adventure.dto.request.AdminCouponRequest;
import com.adventure.dto.request.AdminTrekRequest;
import com.adventure.dto.response.*;
import com.adventure.enums.BookingStatus;
import com.adventure.service.interfaces.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin management endpoints")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    // ── Analytics ─────────────────────────────────────────────────────────────

    @GetMapping("/stats")
    @Operation(summary = "Get platform analytics")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats() {
        return ResponseEntity.ok(ApiResponse.success(adminService.getStats()));
    }

    // ── Trek management ───────────────────────────────────────────────────────

    @GetMapping("/treks")
    @Operation(summary = "List all treks")
    public ResponseEntity<ApiResponse<PagedResponse<TrekResponse>>> getAllTreks(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String status,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllTreks(search, status, pageable)));
    }

    @PostMapping("/treks")
    @Operation(summary = "Create trek")
    public ResponseEntity<ApiResponse<TrekResponse>> createTrek(@Valid @RequestBody AdminTrekRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Trek created", adminService.createTrek(request)));
    }

    @PutMapping("/treks/{id}")
    @Operation(summary = "Update trek")
    public ResponseEntity<ApiResponse<TrekResponse>> updateTrek(@PathVariable Long id,@Valid @RequestBody AdminTrekRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Trek updated", adminService.updateTrek(id, request)));
    }

    @DeleteMapping("/treks/{id}")
    @Operation(summary = "Delete trek")
    public ResponseEntity<ApiResponse<Void>> deleteTrek(@PathVariable Long id) {
        adminService.deleteTrek(id);
        return ResponseEntity.ok(ApiResponse.success("Trek deleted", null));
    }

    // ── User management ───────────────────────────────────────────────────────

    @GetMapping("/users")
    @Operation(summary = "List all users")
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> getAllUsers(
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "id"));
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllUsers(search, pageable)));
    }

    @PatchMapping("/users/{id}/toggle-active")
    @Operation(summary = "Toggle user active status")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserActive(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.toggleUserActive(id)));
    }

    // ── Booking management ────────────────────────────────────────────────────

    @GetMapping("/bookings")
    @Operation(summary = "List all bookings")
    public ResponseEntity<ApiResponse<PagedResponse<AdminBookingResponse>>> getAllBookings(@RequestParam(required = false) String status,@RequestParam(required = false) String search,@RequestParam(defaultValue = "0") int page,@RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllBookings(status, search, pageable)));
    }

    @PatchMapping("/bookings/{bookingRef}/status")
    @Operation(summary = "Update booking status")
    public ResponseEntity<ApiResponse<AdminBookingResponse>> updateBookingStatus(
        @PathVariable String bookingRef,
        @RequestParam BookingStatus status
    ) {
        return ResponseEntity.ok(ApiResponse.success(adminService.updateBookingStatus(bookingRef, status)));
    }

    // ── Review management ─────────────────────────────────────────────────────

    @GetMapping("/reviews")
    @Operation(summary = "List all reviews")
    public ResponseEntity<ApiResponse<PagedResponse<AdminReviewResponse>>> getAllReviews(@RequestParam(required = false) Boolean approved,@RequestParam(defaultValue = "0") int page,@RequestParam(defaultValue = "20") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllReviews(approved, pageable)));
    }

    @PatchMapping("/reviews/{id}/approve")
    @Operation(summary = "Toggle review approval")
    public ResponseEntity<ApiResponse<AdminReviewResponse>> approveReview(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.approveReview(id)));
    }

    @DeleteMapping("/reviews/{id}")
    @Operation(summary = "Delete review")
    public ResponseEntity<ApiResponse<Void>> deleteReview(@PathVariable Long id) {
        adminService.deleteReview(id);
        return ResponseEntity.ok(ApiResponse.success("Review deleted", null));
    }

    // ── Coupon management ─────────────────────────────────────────────────────

    @GetMapping("/coupons")
    @Operation(summary = "List all coupons")
    public ResponseEntity<ApiResponse<PagedResponse<AdminCouponResponse>>> getAllCoupons(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllCoupons(pageable)));
    }

    @PostMapping("/coupons")
    @Operation(summary = "Create coupon")
    public ResponseEntity<ApiResponse<AdminCouponResponse>> createCoupon(
        @Valid @RequestBody AdminCouponRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.success("Coupon created", adminService.createCoupon(request)));
    }

    @PatchMapping("/coupons/{id}/toggle")
    @Operation(summary = "Toggle coupon active")
    public ResponseEntity<ApiResponse<AdminCouponResponse>> toggleCoupon(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.toggleCoupon(id)));
    }

    @DeleteMapping("/coupons/{id}")
    @Operation(summary = "Delete coupon")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(@PathVariable Long id) {
        adminService.deleteCoupon(id);
        return ResponseEntity.ok(ApiResponse.success("Coupon deleted", null));
    }

    // ── Guide management ──────────────────────────────────────────────────────

    @GetMapping("/guides")
    @Operation(summary = "List all guides")
    public ResponseEntity<ApiResponse<PagedResponse<AdminGuideResponse>>> getAllGuides(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return ResponseEntity.ok(ApiResponse.success(adminService.getAllGuides(pageable)));
    }

    @PatchMapping("/guides/{id}/verify")
    @Operation(summary = "Toggle guide verification")
    public ResponseEntity<ApiResponse<AdminGuideResponse>> verifyGuide(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(adminService.verifyGuide(id)));
    }
}
