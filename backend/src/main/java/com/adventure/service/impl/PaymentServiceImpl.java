package com.adventure.service.impl;

import com.adventure.dto.response.PaymentResponse;
import com.adventure.entity.Booking;
import com.adventure.entity.Payment;
import com.adventure.enums.BookingStatus;
import com.adventure.enums.PaymentStatus;
import com.adventure.repository.BookingRepository;
import com.adventure.repository.PaymentRepository;
import com.adventure.service.interfaces.PaymentService;
import com.adventure.service.interfaces.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {
    private final String PAYMENT_FOLDER = "payments_screenshots";

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final CloudinaryService cloudinaryService;

    @Override
    public void uploadPaymentProof(Long bookingId,String utrNumber,MultipartFile screenshot){

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (paymentRepository.existsByUtrNumber(utrNumber)) {
            throw new RuntimeException("UTR already exists.");
        }

        Payment payment = paymentRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        try {

            Map uploadResult = cloudinaryService.uploadImage(screenshot, PAYMENT_FOLDER);

            payment.setUtrNumber(utrNumber);

            payment.setPaymentScreenshot(
                    uploadResult.get("secure_url").toString()
            );

            payment.setCloudinaryPublicId(
                    uploadResult.get("public_id").toString()
            );

            payment.setStatus(PaymentStatus.PENDING);

            payment.setPaidAt(Instant.now());
            payment.setBooking(booking);

            paymentRepository.save(payment);

        } catch (IOException e) {
            throw new RuntimeException("Image upload failed.");
        }

    }

    @Override
    @Transactional
    public void verifyPayment(Long paymentId) {

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        Booking booking = payment.getBooking();

        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setVerifiedAt(Instant.now());
        payment.setAdminRemark("Payment Verified");

        booking.setPaymentStatus(PaymentStatus.SUCCESS);
        booking.setStatus(BookingStatus.CONFIRMED);

        paymentRepository.save(payment);
    }

    @Override
    @Transactional
    public void rejectPayment(Long paymentId, String reason) {

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));

        Booking booking = payment.getBooking();

        payment.setStatus(PaymentStatus.FAILED);
        payment.setFailureReason(reason);
        payment.setAdminRemark(reason);

        booking.setPaymentStatus(PaymentStatus.FAILED);
        booking.setStatus(BookingStatus.PENDING);

        paymentRepository.save(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPendingPayments() {

        List<Payment> payments =
                paymentRepository.findByStatus(PaymentStatus.PENDING);

        return payments.stream()
                .map(payment -> PaymentResponse.builder()

                        .paymentId(payment.getId())

                        .bookingId(payment.getBooking().getId())

                        .bookingRef(payment.getBooking().getBookingRef())

                        .customerName(payment.getUser().getName())

                        .email(payment.getUser().getEmail())

                        .phone(payment.getUser().getPhone())

                        .amount(payment.getAmount())

                        .utrNumber(payment.getUtrNumber())

                        .screenshotUrl(payment.getPaymentScreenshot())

                        .paymentStatus(payment.getStatus())

                        .uploadedAt(payment.getCreatedAt())

                        .build())

                .toList();

    }
}