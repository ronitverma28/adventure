package com.adventure.service.impl;

import com.adventure.dto.response.PaymentResponse;
import com.adventure.entity.Batch;
import com.adventure.entity.Booking;
import com.adventure.entity.Coupon;
import com.adventure.entity.Payment;
import com.adventure.enums.BookingStatus;
import com.adventure.enums.PaymentStatus;
import com.adventure.exception.BadRequestException;
import com.adventure.exception.BookingConflictException;
import com.adventure.exception.ResourceNotFoundException;
import com.adventure.exception.UnauthorizedException;
import com.adventure.repository.BatchRepository;
import com.adventure.repository.BookingRepository;
import com.adventure.repository.CouponRepository;
import com.adventure.repository.PaymentRepository;
import com.adventure.service.interfaces.CloudinaryService;
import com.adventure.service.interfaces.NotificationService;
import com.adventure.service.interfaces.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentServiceImpl implements PaymentService {
    private static final String PAYMENT_FOLDER = "payments_screenshots";

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final BatchRepository batchRepository;
    private final CouponRepository couponRepository;
    private final CloudinaryService cloudinaryService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public void uploadPaymentProof(String userEmail, String bookingRef, String utrNumber, MultipartFile screenshot) {

        if (!StringUtils.hasText(utrNumber)) {
            throw new BadRequestException("UTR number is required.");
        }

        if (screenshot == null || screenshot.isEmpty()) {
            throw new BadRequestException("Payment screenshot is required.");
        }

        Booking booking = bookingRepository.findByBookingRef(bookingRef)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "reference", bookingRef));

        if (!booking.getUser().getEmail().equals(userEmail)) {
            throw new UnauthorizedException("Access denied.");
        }

        Payment payment = booking.getPayment();

        if (payment == null) {
            throw new BadRequestException("Payment not found for this booking.");
        }

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            throw new BadRequestException("Payment is already verified.");
        }

        if (paymentRepository.existsByUtrNumber(utrNumber)) {
            throw new BadRequestException("UTR number already exists.");
        }

        try {

            Map<?, ?> uploadResult = cloudinaryService.uploadImage(screenshot, PAYMENT_FOLDER);

            payment.setUtrNumber(utrNumber);

            payment.setPaymentScreenshot(
                    uploadResult.get("secure_url").toString()
            );

            payment.setPaymentScreenshotPublicId(
                    uploadResult.get("public_id").toString()
            );

            payment.setStatus(PaymentStatus.PENDING_VERIFICATION);
            booking.setPaymentStatus(PaymentStatus.PENDING_VERIFICATION);

            payment.setPaidAt(Instant.now());

            paymentRepository.save(payment);
            bookingRepository.save(booking);

        } catch (IOException e) {
            throw new BadRequestException("Image upload failed.");
        }

    }

    @Override
    @Transactional
    public void verifyPayment(Long paymentId) {

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", paymentId));

        Booking booking = payment.getBooking();

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            return;
        }

        if (payment.getStatus() != PaymentStatus.PENDING_VERIFICATION) {
            throw new BadRequestException("Only submitted payment proofs can be verified.");
        }

        int seats = booking.getNumAdults() + booking.getNumChildren();
        Batch batch = booking.getBatch();

        if (batch.getAvailableSlots() < seats) {
            throw new BookingConflictException("Only " + batch.getAvailableSlots() + " seats are available.");
        }

        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setVerifiedAt(Instant.now());
        payment.setVerifiedBy("ADMIN");
        payment.setAdminRemark("Payment Verified");

        booking.setPaymentStatus(PaymentStatus.SUCCESS);
        booking.setStatus(BookingStatus.CONFIRMED);

        batch.setAvailableSlots(batch.getAvailableSlots() - seats);
        batchRepository.save(batch);

        Coupon coupon = booking.getCoupon();
        if (coupon != null) {
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        }

        paymentRepository.save(payment);
        bookingRepository.save(booking);

        try {
            notificationService.sendBookingConfirmation(
                    booking.getUser().getEmail(),
                    booking.getUser().getName(),
                    booking.getBookingRef());

            if (StringUtils.hasText(booking.getUser().getPhone())) {
                notificationService.sendWhatsAppBookingConfirmation(
                        booking.getUser().getPhone(),
                        booking.getUser().getName(),
                        booking.getBookingRef());
            }
        } catch (Exception ex) {
            log.error("Notification sending failed", ex);
        }
    }

    @Override
    @Transactional
    public void rejectPayment(Long paymentId, String reason) {

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", paymentId));

        Booking booking = payment.getBooking();

        if (payment.getStatus() == PaymentStatus.SUCCESS) {
            throw new BadRequestException("Verified payments cannot be rejected.");
        }

        payment.setStatus(PaymentStatus.FAILED);
        payment.setFailureReason(reason);
        payment.setAdminRemark(reason);

        booking.setPaymentStatus(PaymentStatus.FAILED);
        booking.setStatus(BookingStatus.PENDING);

        paymentRepository.save(payment);
        bookingRepository.save(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPendingPayments() {

        List<Payment> payments =
                paymentRepository.findByStatus(PaymentStatus.PENDING_VERIFICATION);

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

                        .uploadedAt(payment.getUpdatedAt() != null ? payment.getUpdatedAt() : payment.getCreatedAt())

                        .build())

                .toList();

    }
}
