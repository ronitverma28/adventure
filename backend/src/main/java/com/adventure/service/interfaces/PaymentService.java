package com.adventure.service.interfaces;

import com.adventure.dto.response.PaymentResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface PaymentService {
    void uploadPaymentProof(Long bookingId,String utrNumber,MultipartFile screenshot);

    void verifyPayment(Long paymentId);

    void rejectPayment(Long paymentId, String reason);

    List<PaymentResponse> getPendingPayments();
}
