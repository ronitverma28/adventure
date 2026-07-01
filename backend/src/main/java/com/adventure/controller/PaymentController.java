package com.adventure.controller;


import com.adventure.service.interfaces.PaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<String> uploadPaymentProof(

            @RequestParam Long bookingId,

            @RequestParam String utrNumber,

            @RequestParam MultipartFile screenshot

    ) {

        paymentService.uploadPaymentProof(
                bookingId,
                utrNumber,
                screenshot
        );

        return ResponseEntity.ok("Payment submitted successfully. Waiting for verification.");
    }

}