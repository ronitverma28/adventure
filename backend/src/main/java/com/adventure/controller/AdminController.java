package com.adventure.controller;

import com.adventure.dto.request.*;
import com.adventure.dto.response.*;
import com.adventure.enums.BookingStatus;
import com.adventure.enums.TrekStatus;
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
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
@Tag(name = "Admin", description = "Admin management endpoints")
@SecurityRequirement(name = "bearerAuth")

public class AdminController {

    private final AdminService adminService;
    // ─────────────────────────────────────────────────────────────────────────────
    // Cloudinary Management
    // ─────────────────────────────────────────────────────────────────────────────

    @GetMapping("/files")
    @Operation(summary = "Get all Cloudinary files")
    public ResponseEntity<ApiResponse<List<CloudinaryFileResponse>>> getFiles() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        adminService.getAllFiles()
                )
        );
    }

    @GetMapping("/folders")
    @Operation(summary = "Get all Cloudinary folders")
    public ResponseEntity<ApiResponse<List<String>>> getAllFolders() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        adminService.getAllFolders()
                )
        );
    }

    @GetMapping("/files/{folderName}")
    @Operation(summary = "Get Cloudinary files from folder")
    public ResponseEntity<ApiResponse<List<CloudinaryFileResponse>>> getFiles(
            @PathVariable String folderName
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        adminService.getAllFiles(folderName)
                )
        );
    }

// ─────────────────────────────────────────────────────────────────────────────
// Dashboard
// ─────────────────────────────────────────────────────────────────────────────

    @GetMapping("/stats")
    @Operation(summary = "Get dashboard statistics")
    public ResponseEntity<ApiResponse<AdminStatsResponse>> getStats() {
        return ResponseEntity.ok(
                ApiResponse.success(
                        adminService.getStats()
                )
        );
    }

// ─────────────────────────────────────────────────────────────────────────────
// User Management
// ─────────────────────────────────────────────────────────────────────────────

    @GetMapping("/users")
    @Operation(summary = "List all users")
    public ResponseEntity<ApiResponse<PagedResponse<UserResponse>>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "id")
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        adminService.getAllUsers(search, pageable)
                )
        );
    }

    @PatchMapping("/users/{id}/toggle-active")
    @Operation(summary = "Toggle user active status")
    public ResponseEntity<ApiResponse<UserResponse>> toggleUserActive(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        adminService.toggleUserActive(id)
                )
        );
    }

// ─────────────────────────────────────────────────────────────────────────────
// Booking Management
// ─────────────────────────────────────────────────────────────────────────────

    @GetMapping("/bookings")
    @Operation(summary = "List all bookings")
    public ResponseEntity<ApiResponse<PagedResponse<AdminBookingResponse>>> getAllBookings(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        adminService.getAllBookings(status, search, pageable)
                )
        );
    }

    @PatchMapping("/bookings/{bookingRef}/status")
    @Operation(summary = "Update booking status")
    public ResponseEntity<ApiResponse<AdminBookingResponse>> updateBookingStatus(
            @PathVariable String bookingRef,
            @RequestParam BookingStatus status
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        adminService.updateBookingStatus(bookingRef, status)
                )
        );
    }

// ─────────────────────────────────────────────────────────────────────────────
// Review Management
// ─────────────────────────────────────────────────────────────────────────────

    @GetMapping("/reviews")
    @Operation(summary = "List all reviews")
    public ResponseEntity<ApiResponse<PagedResponse<AdminReviewResponse>>> getAllReviews(
            @RequestParam(required = false) Boolean approved,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        adminService.getAllReviews(approved, pageable)
                )
        );
    }

    @PatchMapping("/reviews/{id}/approve")
    @Operation(summary = "Approve review")
    public ResponseEntity<ApiResponse<AdminReviewResponse>> approveReview(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        adminService.approveReview(id)
                )
        );
    }

    @DeleteMapping("/reviews/{id}")
    @Operation(summary = "Delete review")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable Long id
    ) {
        adminService.deleteReview(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Review deleted successfully.",
                        null
                )
        );
    }

// ─────────────────────────────────────────────────────────────────────────────
// Coupon Management
// ─────────────────────────────────────────────────────────────────────────────

    @GetMapping("/coupons")
    @Operation(summary = "List all coupons")
    public ResponseEntity<ApiResponse<PagedResponse<AdminCouponResponse>>> getAllCoupons(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        adminService.getAllCoupons(pageable)
                )
        );
    }

    @PostMapping("/coupons")
    @Operation(summary = "Create coupon")
    public ResponseEntity<ApiResponse<AdminCouponResponse>> createCoupon(
            @Valid @RequestBody AdminCouponRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Coupon created successfully.",
                                adminService.createCoupon(request)
                        )
                );
    }

    @PatchMapping("/coupons/{id}/toggle")
    @Operation(summary = "Toggle coupon status")
    public ResponseEntity<ApiResponse<AdminCouponResponse>> toggleCoupon(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        adminService.toggleCoupon(id)
                )
        );
    }

    @DeleteMapping("/coupons/{id}")
    @Operation(summary = "Delete coupon")
    public ResponseEntity<ApiResponse<Void>> deleteCoupon(
            @PathVariable Long id
    ) {
        adminService.deleteCoupon(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Coupon deleted successfully.",
                        null
                )
        );
    }

    // ─────────────────────────────────────────────────────────────────────────────
// Trek Management
// ─────────────────────────────────────────────────────────────────────────────

    @GetMapping("/treks")
    @Operation(summary = "List all treks")
    public ResponseEntity<ApiResponse<PagedResponse<TrekResponse>>> getAllTreks(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        adminService.getAllTreks(search, status, pageable)
                )
        );
    }

    @GetMapping("/treks/{id}")
    @Operation(summary = "Get trek by ID")
    public ResponseEntity<ApiResponse<TrekResponse>> getTrek(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        adminService.getTrek(id)
                )
        );
    }

    @PostMapping("/treks")
    @Operation(summary = "Create trek")
    public ResponseEntity<ApiResponse<TrekResponse>> createTrek(
            @Valid @RequestBody AdminTrekRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Trek created successfully.",
                                adminService.createTrek(request)
                        )
                );
    }

    @PutMapping("/treks/{id}")
    @Operation(summary = "Update trek")
    public ResponseEntity<ApiResponse<TrekResponse>> updateTrek(
            @PathVariable Long id,
            @Valid @RequestBody AdminTrekRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Trek updated successfully.",
                        adminService.updateTrek(id, request)
                )
        );
    }

    @PatchMapping("/treks/{id}/status")
    @Operation(summary = "Change trek status")
    public ResponseEntity<ApiResponse<TrekResponse>> changeTrekStatus(
            @PathVariable Long id,
            @RequestParam TrekStatus status
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Trek status updated successfully.",
                        adminService.changeTrekStatus(id, status)
                )
        );
    }

    @DeleteMapping("/treks/{id}")
    @Operation(summary = "Delete trek")
    public ResponseEntity<ApiResponse<Void>> deleteTrek(
            @PathVariable Long id
    ) {
        adminService.deleteTrek(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Trek deleted successfully.",
                        null
                )
        );
    }

    // ─────────────────────────────────────────────────────────────────────────────
// Trek Image Management
// ─────────────────────────────────────────────────────────────────────────────

    @PostMapping("/treks/{trekId}/images")
    @Operation(summary = "Add image to trek")
    public ResponseEntity<ApiResponse<TrekDetailResponse.ImageResponse>> addTrekImage(
            @PathVariable Long trekId,
            @Valid @RequestBody TrekImageRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Image added successfully.",
                                adminService.addTrekImage(trekId, request)
                        )
                );
    }

    @PutMapping("/images/{imageId}")
    @Operation(summary = "Update trek image")
    public ResponseEntity<ApiResponse<TrekDetailResponse.ImageResponse>> updateTrekImage(
            @PathVariable Long imageId,
            @Valid @RequestBody TrekImageRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Image updated successfully.",
                        adminService.updateTrekImage(imageId, request)
                )
        );
    }

    @PatchMapping("/treks/{trekId}/images/{imageId}/cover")
    @Operation(summary = "Set cover image")
    public ResponseEntity<ApiResponse<TrekDetailResponse.ImageResponse>> setCoverImage(
            @PathVariable Long trekId,
            @PathVariable Long imageId
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Cover image updated successfully.",
                        adminService.setCoverImage(trekId, imageId)
                )
        );
    }

    @DeleteMapping("/images/{imageId}")
    @Operation(summary = "Delete trek image")
    public ResponseEntity<ApiResponse<Void>> deleteTrekImage(
            @PathVariable Long imageId
    ) {
        adminService.deleteTrekImage(imageId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Image deleted successfully.",
                        null
                )
        );
    }

    // ─────────────────────────────────────────────────────────────────────────────
// Itinerary Management
// ─────────────────────────────────────────────────────────────────────────────

    @PostMapping("/treks/{trekId}/itinerary")
    @Operation(summary = "Add itinerary day to trek")
    public ResponseEntity<ApiResponse<TrekDetailResponse.ItineraryResponse>> addItineraryDay(
            @PathVariable Long trekId,
            @Valid @RequestBody ItineraryRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Itinerary day added successfully.",
                                adminService.addItineraryDay(trekId, request)
                        )
                );
    }

    @PutMapping("/itinerary/{itineraryId}")
    @Operation(summary = "Update itinerary day")
    public ResponseEntity<ApiResponse<TrekDetailResponse.ItineraryResponse>> updateItineraryDay(
            @PathVariable Long itineraryId,
            @Valid @RequestBody ItineraryRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Itinerary day updated successfully.",
                        adminService.updateItineraryDay(itineraryId, request)
                )
        );
    }

    @DeleteMapping("/itinerary/{itineraryId}")
    @Operation(summary = "Delete itinerary day")
    public ResponseEntity<ApiResponse<Void>> deleteItineraryDay(
            @PathVariable Long itineraryId
    ) {
        adminService.deleteItineraryDay(itineraryId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Itinerary day deleted successfully.",
                        null
                )
        );
    }

    // ─────────────────────────────────────────────────────────────────────────────
// Batch Management
// ─────────────────────────────────────────────────────────────────────────────

    @PostMapping("/treks/{trekId}/batches")
    @Operation(summary = "Create batch for trek")
    public ResponseEntity<ApiResponse<TrekDetailResponse.BatchResponse>> createBatch(
            @PathVariable Long trekId,
            @Valid @RequestBody BatchRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Batch created successfully.",
                                adminService.createBatch(trekId, request)
                        )
                );
    }

    @PutMapping("/batches/{batchId}")
    @Operation(summary = "Update batch")
    public ResponseEntity<ApiResponse<TrekDetailResponse.BatchResponse>> updateBatch(
            @PathVariable Long batchId,
            @Valid @RequestBody BatchRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Batch updated successfully.",
                        adminService.updateBatch(batchId, request)
                )
        );
    }

    @DeleteMapping("/batches/{batchId}")
    @Operation(summary = "Delete batch")
    public ResponseEntity<ApiResponse<Void>> deleteBatch(
            @PathVariable Long batchId
    ) {
        adminService.deleteBatch(batchId);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Batch deleted successfully.",
                        null
                )
        );
    }

    // ─────────────────────────────────────────────────────────────────────────────
// Guide Management
// ─────────────────────────────────────────────────────────────────────────────

    @GetMapping("/guides")
    @Operation(summary = "List all guides")
    public ResponseEntity<ApiResponse<PagedResponse<AdminGuideResponse>>> getAllGuides(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(
                page,
                size,
                Sort.by(Sort.Direction.DESC, "createdAt")
        );

        return ResponseEntity.ok(
                ApiResponse.success(
                        adminService.getAllGuides(pageable)
                )
        );
    }

    @GetMapping("/guides/{id}")
    @Operation(summary = "Get guide by ID")
    public ResponseEntity<ApiResponse<AdminGuideResponse>> getGuide(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        adminService.getGuide(id)
                )
        );
    }

    @PostMapping("/guides")
    @Operation(summary = "Create guide")
    public ResponseEntity<ApiResponse<AdminGuideResponse>> createGuide(
            @Valid @RequestBody GuideRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(
                        ApiResponse.success(
                                "Guide created successfully.",
                                adminService.createGuide(request)
                        )
                );
    }

    @PutMapping("/guides/{id}")
    @Operation(summary = "Update guide")
    public ResponseEntity<ApiResponse<AdminGuideResponse>> updateGuide(
            @PathVariable Long id,
            @Valid @RequestBody GuideRequest request
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Guide updated successfully.",
                        adminService.updateGuide(id, request)
                )
        );
    }

    @PatchMapping("/guides/{id}/verify")
    @Operation(summary = "Verify guide")
    public ResponseEntity<ApiResponse<AdminGuideResponse>> verifyGuide(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                ApiResponse.success(
                        "Guide verification updated successfully.",
                        adminService.verifyGuide(id)
                )
        );
    }

    @DeleteMapping("/guides/{id}")
    @Operation(summary = "Delete guide")
    public ResponseEntity<ApiResponse<Void>> deleteGuide(
            @PathVariable Long id
    ) {
        adminService.deleteGuide(id);

        return ResponseEntity.ok(
                ApiResponse.success(
                        "Guide deleted successfully.",
                        null
                )
        );
    }
}
