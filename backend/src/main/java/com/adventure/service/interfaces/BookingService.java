package com.adventure.service.interfaces;

import com.adventure.dto.request.CancelBookingRequest;
import com.adventure.dto.request.ConfirmBookingRequest;
import com.adventure.dto.request.CreateOrderRequest;
import com.adventure.dto.request.PaymentFailureRequest;
import com.adventure.dto.request.PaymentVerificationRequest;
import com.adventure.dto.request.RefundPaymentRequest;
import com.adventure.dto.request.ValidateCouponRequest;
import com.adventure.dto.response.BookingConfirmationResponse;
import com.adventure.dto.response.CouponValidationResponse;
import com.adventure.dto.response.PagedResponse;
import com.adventure.dto.response.PaymentHistoryResponse;
import com.adventure.dto.response.RazorpayOrderResponse;
import org.springframework.data.domain.Pageable;

public interface BookingService {
    RazorpayOrderResponse createOrder(String userEmail, CreateOrderRequest request);
    BookingConfirmationResponse confirmBooking(String userEmail, ConfirmBookingRequest request);
    PaymentHistoryResponse verifyPayment(String userEmail, PaymentVerificationRequest request);
    PaymentHistoryResponse markPaymentFailed(String userEmail, PaymentFailureRequest request);
    PaymentHistoryResponse refundPayment(String userEmail, String bookingRef, RefundPaymentRequest request);
    PagedResponse<PaymentHistoryResponse> getPaymentHistory(String userEmail, Pageable pageable);
    CouponValidationResponse validateCoupon(String userEmail, ValidateCouponRequest request);
    PagedResponse<BookingConfirmationResponse> getMyBookings(String userEmail, Pageable pageable);
    BookingConfirmationResponse getBooking(String userEmail, String bookingRef);
    void cancelBooking(String userEmail, String bookingRef, CancelBookingRequest request);
    byte[] generateTicket(String userEmail, String bookingRef);
    byte[] generateInvoice(String userEmail, String bookingRef);
}
