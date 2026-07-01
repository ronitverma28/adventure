package com.adventure.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class PaymentUploadRequest {
    @NotNull(message = "Booking Id is required")
    private Long bookingId;

    @NotBlank(message = "UTR Number is required")
    private String utrNumber;

    @NotNull(message = "Payment screenshot is required")
    private MultipartFile screenshot;
}
