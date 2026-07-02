package com.adventure.controller;

import com.adventure.dto.response.ApiResponse;
import com.adventure.dto.response.PaymentResponse;
import com.adventure.service.interfaces.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/payments")
@RequiredArgsConstructor
@Tag(name = "Admin Payments", description = "Manual UPI payment verification")
@SecurityRequirement(name = "bearerAuth")
public class AdminPaymentController {

    private final PaymentService paymentService;

    @GetMapping("/pending")
    @Operation(summary = "Get pending payment proofs")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPendingPayments() {
        return ResponseEntity.ok(ApiResponse.success(paymentService.getPendingPayments()));
    }

    @PutMapping("/{paymentId}/verify")
    @Operation(summary = "Verify payment proof")
    public ResponseEntity<ApiResponse<String>> verifyPayment(@PathVariable Long paymentId) {
        paymentService.verifyPayment(paymentId);
        return ResponseEntity.ok(ApiResponse.success("Payment verified successfully."));
    }

    @PutMapping("/{paymentId}/reject")
    @Operation(summary = "Reject payment proof")
    public ResponseEntity<ApiResponse<String>> rejectPayment(
            @PathVariable Long paymentId,
            @RequestBody RejectPaymentRequest request
    ) {
        paymentService.rejectPayment(paymentId, request.getReason());
        return ResponseEntity.ok(ApiResponse.success("Payment rejected."));
    }

    @Data
    public static class RejectPaymentRequest {
        private String reason;
    }
}
