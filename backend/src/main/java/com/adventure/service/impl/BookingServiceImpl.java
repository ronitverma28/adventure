package com.adventure.service.impl;

import com.adventure.dto.request.*;
import com.adventure.dto.response.*;
import com.adventure.entity.*;
import com.adventure.enums.BookingStatus;
import com.adventure.enums.DiscountType;
import com.adventure.enums.PaymentGateway;
import com.adventure.enums.PaymentStatus;
import com.adventure.exception.BadRequestException;
import com.adventure.exception.BookingConflictException;
import com.adventure.exception.ResourceNotFoundException;
import com.adventure.repository.*;
import com.adventure.service.interfaces.BookingService;
import com.adventure.service.interfaces.NotificationService;
import com.razorpay.RazorpayClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class BookingServiceImpl implements BookingService {

    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);
    private static final DateTimeFormatter DOC_DATE = DateTimeFormatter.ofPattern("dd MMM yyyy");

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final CouponRepository couponRepository;
    private final TrekRepository trekRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Value("${razorpay.key-id:}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret:}")
    private String razorpayKeySecret;

    @Value("${razorpay.currency:INR}")
    private String currency;

    @Value("${app.tax-rate:0.18}")
    private BigDecimal taxRate;

    @Override
    public RazorpayOrderResponse createOrder(String userEmail, CreateOrderRequest request) {
        User user = findUser(userEmail);
        Trek trek = findTrek(request.getTrekId());
        PriceBreakdown price = calculatePrice(trek, request.getNumAdults(), request.getNumChildren(), request.getCouponCode(), user);
        LocalDate trekDate = resolveTrekDate(trek, request.getStartDate());
        ensureCapacity(trek, trekDate, request.getNumAdults() + request.getNumChildren());

        String orderId = createGatewayOrder(price.total(), user, trek);
        return RazorpayOrderResponse.builder()
            .orderId(orderId)
            .amount(toPaise(price.total()))
            .currency(currency)
            .keyId(razorpayKeyId)
            .build();
    }

    @Override
    public BookingConfirmationResponse confirmBooking(String userEmail, ConfirmBookingRequest request) {
        User user = findUser(userEmail);
        Trek trek = findTrek(request.getTrekId());
        validateTravelerCount(request);

        LocalDate trekDate = resolveTrekDate(trek, request.getStartDate());
        ensureCapacity(trek, trekDate, request.getNumAdults() + request.getNumChildren());
        verifyPaymentSignature(request.getRazorpayOrderId(), request.getRazorpayPaymentId(), request.getRazorpaySignature());

        PriceBreakdown price = calculatePrice(trek, request.getNumAdults(), request.getNumChildren(), request.getCouponCode(), user);

        Booking booking = Booking.builder()
            .trek(trek)
            .user(user)
            .coupon(price.coupon())
            .numAdults(request.getNumAdults())
            .numChildren(request.getNumChildren())
            .trekDate(trekDate)
            .baseAmount(price.subtotal())
            .discountAmount(price.discount())
            .taxAmount(price.tax())
            .finalAmount(price.total())
            .status(BookingStatus.CONFIRMED)
            .emergencyContact(request.getEmergencyContact())
            .emergencyPhone(request.getEmergencyPhone())
            .pickupLocation(request.getPickupLocation())
            .specialRequests(request.getSpecialRequests())
            .build();

        request.getTravelers().forEach(traveler ->
            booking.getTravelers().add(toTravelerEntity(booking, traveler)));

        Payment payment = Payment.builder()
            .booking(booking)
            .user(user)
            .amount(price.total())
            .currency(currency)
            .gateway(PaymentGateway.RAZORPAY)
            .gatewayOrderId(request.getRazorpayOrderId())
            .gatewayPaymentId(request.getRazorpayPaymentId())
            .gatewaySignature(request.getRazorpaySignature())
            .status(PaymentStatus.SUCCESS)
            .paidAt(Instant.now())
            .build();
        booking.setPayment(payment);

        if (price.coupon() != null) {
            price.coupon().setUsedCount(price.coupon().getUsedCount() + 1);
        }
        trek.setTotalBookings(trek.getTotalBookings() + request.getNumAdults() + request.getNumChildren());

        Booking saved = bookingRepository.save(booking);
        notificationService.sendBookingConfirmation(user.getEmail(), user.getName(), saved.getBookingRef());
        notificationService.sendWhatsAppBookingConfirmation(user.getPhone(), user.getName(), saved.getBookingRef());
        return toBookingResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CouponValidationResponse validateCoupon(String userEmail, ValidateCouponRequest request) {
        User user = findUser(userEmail);
        Trek trek = findTrek(request.getTrekId());
        Coupon coupon = couponRepository.findByCodeIgnoreCase(request.getCode())
            .orElse(null);
        if (coupon == null) {
            return invalidCoupon(request.getCode(), "Coupon code is not valid");
        }
        try {
            BigDecimal discount = calculateCouponDiscount(coupon, trek, request.getAmount(), user);
            return CouponValidationResponse.builder()
                .valid(true)
                .code(coupon.getCode())
                .discountType(coupon.getDiscountType())
                .discountValue(coupon.getDiscountValue())
                .discountAmount(discount)
                .message("Coupon applied successfully")
                .build();
        } catch (BadRequestException ex) {
            return invalidCoupon(coupon.getCode(), ex.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<BookingConfirmationResponse> getMyBookings(String userEmail, Pageable pageable) {
        User user = findUser(userEmail);
        Page<Booking> page = bookingRepository.findByUserId(user.getId(), pageable);
        return PagedResponse.<BookingConfirmationResponse>builder()
            .content(page.getContent().stream().map(this::toBookingResponse).toList())
            .page(page.getNumber())
            .size(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .first(page.isFirst())
            .last(page.isLast())
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public BookingConfirmationResponse getBooking(String userEmail, String bookingRef) {
        User user = findUser(userEmail);
        Booking booking = bookingRepository.findByBookingRefAndUserId(bookingRef, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Booking", "reference", bookingRef));
        return toBookingResponse(booking);
    }

    @Override
    public void cancelBooking(String userEmail, String bookingRef, CancelBookingRequest request) {
        User user = findUser(userEmail);
        Booking booking = bookingRepository.findByBookingRefAndUserId(bookingRef, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Booking", "reference", bookingRef));
        if (booking.getStatus() == BookingStatus.CANCELLED || booking.getStatus() == BookingStatus.REFUNDED) {
            throw new BadRequestException("Booking is already cancelled");
        }
        if (booking.getTrekDate().minusDays(15).isBefore(LocalDate.now())) {
            throw new BadRequestException("Free cancellation is available only up to 15 days before the trek");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(Instant.now());
        booking.setCancellationReason(request.getReason());
        if (booking.getPayment() != null) {
            booking.getPayment().setStatus(PaymentStatus.REFUNDED);
            booking.getPayment().setRefundAmount(booking.getFinalAmount());
            booking.getPayment().setRefundedAt(Instant.now());
        }
    }

    // -------------------------------------------------------------------------
    // Payment lifecycle methods (Razorpay webhook / manual flows)
    // -------------------------------------------------------------------------

    @Override
    public PaymentHistoryResponse verifyPayment(String userEmail, PaymentVerificationRequest request) {
        User user = findUser(userEmail);
        Payment payment = paymentRepository.findByGatewayOrderId(request.getOrderId())
            .orElseThrow(() -> new ResourceNotFoundException("Payment", "orderId", request.getOrderId()));
        if (!payment.getUser().getId().equals(user.getId())) {
            throw new com.adventure.exception.UnauthorizedException("Access denied");
        }
        verifyPaymentSignature(request.getOrderId(), request.getPaymentId(), request.getSignature());
        payment.setGatewayPaymentId(request.getPaymentId());
        payment.setGatewaySignature(request.getSignature());
        payment.setStatus(PaymentStatus.SUCCESS);
        payment.setPaidAt(Instant.now());
        payment.getBooking().setStatus(BookingStatus.CONFIRMED);
        return toPaymentHistoryResponse(payment);
    }

    @Override
    public PaymentHistoryResponse markPaymentFailed(String userEmail, PaymentFailureRequest request) {
        User user = findUser(userEmail);
        Payment payment = paymentRepository.findByGatewayOrderId(request.getOrderId())
            .orElseThrow(() -> new ResourceNotFoundException("Payment", "orderId", request.getOrderId()));
        if (!payment.getUser().getId().equals(user.getId())) {
            throw new com.adventure.exception.UnauthorizedException("Access denied");
        }
        payment.setStatus(PaymentStatus.FAILED);
        payment.setFailureReason(request.getReason());
        payment.getBooking().setStatus(BookingStatus.CANCELLED);
        payment.getBooking().setCancelledAt(Instant.now());
        payment.getBooking().setCancellationReason("Payment failed: " + request.getReason());
        return toPaymentHistoryResponse(payment);
    }

    @Override
    public PaymentHistoryResponse refundPayment(String userEmail, String bookingRef, RefundPaymentRequest request) {
        User user = findUser(userEmail);
        Booking booking = bookingRepository.findByBookingRefAndUserId(bookingRef, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Booking", "reference", bookingRef));
        Payment payment = booking.getPayment();
        if (payment == null) {
            throw new BadRequestException("No payment found for this booking");
        }
        if (payment.getStatus() != PaymentStatus.SUCCESS) {
            throw new BadRequestException("Only successful payments can be refunded");
        }
        BigDecimal refundAmt = request.getAmount() != null
            ? request.getAmount().min(payment.getAmount())
            : payment.getAmount();
        payment.setStatus(PaymentStatus.REFUNDED);
        payment.setRefundAmount(refundAmt);
        payment.setRefundedAt(Instant.now());
        booking.setStatus(BookingStatus.REFUNDED);
        return toPaymentHistoryResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<PaymentHistoryResponse> getPaymentHistory(String userEmail, Pageable pageable) {
        User user = findUser(userEmail);
        Page<Payment> page = paymentRepository.findByUserId(user.getId(), pageable);
        return PagedResponse.<PaymentHistoryResponse>builder()
            .content(page.getContent().stream().map(this::toPaymentHistoryResponse).toList())
            .page(page.getNumber())
            .size(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .first(page.isFirst())
            .last(page.isLast())
            .build();
    }

    private PaymentHistoryResponse toPaymentHistoryResponse(Payment payment) {
        Booking booking = payment.getBooking();
        return PaymentHistoryResponse.builder()
            .paymentId(payment.getId())
            .bookingRef(booking.getBookingRef())
            .trekTitle(booking.getTrek().getTitle())
            .trekDate(booking.getTrekDate())
            .amount(payment.getAmount())
            .refundAmount(payment.getRefundAmount())
            .currency(payment.getCurrency())
            .gateway(payment.getGateway())
            .status(payment.getStatus())
            .gatewayOrderId(payment.getGatewayOrderId())
            .gatewayPaymentId(payment.getGatewayPaymentId())
            .refundId(payment.getRefundId())
            .failureReason(payment.getFailureReason())
            .paidAt(payment.getPaidAt())
            .refundedAt(payment.getRefundedAt())
            .createdAt(payment.getCreatedAt())
            .build();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateTicket(String userEmail, String bookingRef) {
        Booking booking = findUserBooking(userEmail, bookingRef);
        return renderPdf("Adventure Trek Ticket", buildTicketDocument(booking));
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateInvoice(String userEmail, String bookingRef) {
        Booking booking = findUserBooking(userEmail, bookingRef);
        return renderPdf("Adventure Tax Invoice", buildInvoiceDocument(booking));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private Trek findTrek(Long trekId) {
        return trekRepository.findById(trekId)
            .orElseThrow(() -> new ResourceNotFoundException("Trek", trekId));
    }

    private Booking findUserBooking(String userEmail, String bookingRef) {
        User user = findUser(userEmail);
        return bookingRepository.findByBookingRefAndUserId(bookingRef, user.getId())
            .orElseThrow(() -> new ResourceNotFoundException("Booking", "reference", bookingRef));
    }

    private LocalDate resolveTrekDate(Trek trek, LocalDate requestedDate) {
        if (requestedDate != null) return requestedDate;
        if (trek.getStartDate() != null) return trek.getStartDate();
        throw new BadRequestException("Trek date is required for booking");
    }

    private void ensureCapacity(Trek trek, LocalDate trekDate, int requestedSeats) {
        int alreadyBooked = bookingRepository.countConfirmedPersonsForTrekDate(trek.getId(), trekDate);
        if (alreadyBooked + requestedSeats > trek.getGroupSizeMax()) {
            throw new BookingConflictException("Not enough seats available for selected date");
        }
    }

    private void validateTravelerCount(ConfirmBookingRequest request) {
        int expected = request.getNumAdults() + request.getNumChildren();
        if (request.getTravelers().size() != expected) {
            throw new BadRequestException("Traveler count must match selected seats");
        }
        long leaders = request.getTravelers().stream().filter(t -> Boolean.TRUE.equals(t.getIsLeader())).count();
        if (leaders == 0) request.getTravelers().get(0).setIsLeader(true);
        if (leaders > 1) throw new BadRequestException("Only one traveler can be marked as leader");
    }

    private PriceBreakdown calculatePrice(Trek trek, int adults, int children, String couponCode, User user) {
        BigDecimal adultPrice = trek.getPricePerPerson().multiply(BigDecimal.valueOf(adults));
        BigDecimal childRate = trek.getPriceChild() != null ? trek.getPriceChild() : trek.getPricePerPerson();
        BigDecimal childPrice = childRate.multiply(BigDecimal.valueOf(children));
        BigDecimal subtotal = adultPrice.add(childPrice);
        Coupon coupon = null;
        BigDecimal discount = BigDecimal.ZERO;

        if (StringUtils.hasText(couponCode)) {
            coupon = couponRepository.findByCodeIgnoreCase(couponCode)
                .orElseThrow(() -> new BadRequestException("Coupon code is not valid"));
            discount = calculateCouponDiscount(coupon, trek, subtotal, user);
        }

        BigDecimal taxable = subtotal.subtract(discount).max(BigDecimal.ZERO);
        BigDecimal tax = taxable.multiply(taxRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = taxable.add(tax).setScale(2, RoundingMode.HALF_UP);
        return new PriceBreakdown(subtotal, discount, tax, total, coupon);
    }

    private BigDecimal calculateCouponDiscount(Coupon coupon, Trek trek, BigDecimal amount, User user) {
        Instant now = Instant.now();
        if (!Boolean.TRUE.equals(coupon.getIsActive())) throw new BadRequestException("Coupon is inactive");
        if (coupon.getValidFrom().isAfter(now) || coupon.getValidUntil().isBefore(now)) {
            throw new BadRequestException("Coupon has expired");
        }
        if (coupon.getApplicableTrek() != null && !coupon.getApplicableTrek().getId().equals(trek.getId())) {
            throw new BadRequestException("Coupon is not valid for this trek");
        }
        if (coupon.getMinAmount() != null && amount.compareTo(coupon.getMinAmount()) < 0) {
            throw new BadRequestException("Booking amount is below coupon minimum");
        }
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new BadRequestException("Coupon usage limit reached");
        }
        if (coupon.getPerUserLimit() != null &&
            couponRepository.countUsageByUser(coupon.getId(), user.getId()) >= coupon.getPerUserLimit()) {
            throw new BadRequestException("Coupon already used by this user");
        }

        BigDecimal discount = coupon.getDiscountType() == DiscountType.PERCENTAGE
            ? amount.multiply(coupon.getDiscountValue()).divide(ONE_HUNDRED, 2, RoundingMode.HALF_UP)
            : coupon.getDiscountValue();
        if (coupon.getMaxDiscount() != null) {
            discount = discount.min(coupon.getMaxDiscount());
        }
        return discount.min(amount).setScale(2, RoundingMode.HALF_UP);
    }

    private String createGatewayOrder(BigDecimal total, User user, Trek trek) {
        if (!StringUtils.hasText(razorpayKeyId) || !StringUtils.hasText(razorpayKeySecret)
            || razorpayKeyId.startsWith("rzp_test_local")) {
            return "order_dev_" + UUID.randomUUID().toString().replace("-", "");
        }

        try {
            RazorpayClient razorpay = new RazorpayClient(razorpayKeyId, razorpayKeySecret);
            JSONObject payload = new JSONObject();
            payload.put("amount", toPaise(total));
            payload.put("currency", currency);
            payload.put("receipt", "trek_" + trek.getId() + "_user_" + user.getId());
            return razorpay.orders.create(payload).get("id");
        } catch (Exception ex) {
            log.error("Razorpay order creation failed", ex);
            throw new BadRequestException("Unable to create payment order. Please try again.");
        }
    }

    private void verifyPaymentSignature(String orderId, String paymentId, String signature) {
        if (orderId != null && orderId.startsWith("order_dev_")) return;
        if (!StringUtils.hasText(razorpayKeySecret)) return;
        if (!StringUtils.hasText(signature)) throw new BadRequestException("Payment signature is required");

        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            String expected = HexFormat.of().formatHex(mac.doFinal((orderId + "|" + paymentId).getBytes(StandardCharsets.UTF_8)));
            if (!expected.equals(signature)) throw new BadRequestException("Invalid payment signature");
        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BadRequestException("Unable to verify payment signature");
        }
    }

    private long toPaise(BigDecimal amount) {
        return amount.multiply(ONE_HUNDRED).setScale(0, RoundingMode.HALF_UP).longValue();
    }

    private BookingTraveler toTravelerEntity(Booking booking, TravelerRequest traveler) {
        return BookingTraveler.builder()
            .booking(booking)
            .name(traveler.getName())
            .age(traveler.getAge())
            .gender(traveler.getGender())
            .idType(traveler.getIdType())
            .idNumber(traveler.getIdNumber())
            .medicalConditions(traveler.getMedicalConditions())
            .isLeader(Boolean.TRUE.equals(traveler.getIsLeader()))
            .build();
    }

    private BookingConfirmationResponse toBookingResponse(Booking booking) {
        LocalDate endDate = booking.getTrek().getDurationDays() != null
            ? booking.getTrekDate().plusDays(Math.max(booking.getTrek().getDurationDays() - 1, 0))
            : booking.getTrekDate();
        return BookingConfirmationResponse.builder()
            .bookingId(booking.getId())
            .bookingRef(booking.getBookingRef())
            .trekTitle(booking.getTrek().getTitle())
            .trekSlug(booking.getTrek().getSlug())
            .startDate(booking.getTrekDate())
            .endDate(endDate)
            .numAdults(booking.getNumAdults())
            .numChildren(booking.getNumChildren())
            .totalAmount(booking.getFinalAmount())
            .status(booking.getStatus())
            .paymentStatus(booking.getPayment() != null ? booking.getPayment().getStatus() : PaymentStatus.PENDING)
            .createdAt(booking.getCreatedAt())
            .travelers(booking.getTravelers().stream().map(this::toTravelerResponse).toList())
            .emergencyContact(booking.getEmergencyContact())
            .emergencyPhone(booking.getEmergencyPhone())
            .pickupLocation(booking.getPickupLocation())
            .specialRequests(booking.getSpecialRequests())
            .build();
    }

    private TravelerResponse toTravelerResponse(BookingTraveler traveler) {
        return TravelerResponse.builder()
            .id(traveler.getId())
            .name(traveler.getName())
            .age(traveler.getAge())
            .gender(traveler.getGender())
            .idType(traveler.getIdType())
            .idNumber(traveler.getIdNumber())
            .medicalConditions(traveler.getMedicalConditions())
            .isLeader(traveler.getIsLeader())
            .build();
    }

    private String buildTicketDocument(Booking booking) {
        LocalDate endDate = resolveEndDate(booking);
        String travelers = booking.getTravelers().stream()
            .map(t -> "- " + t.getName() + " (" + t.getAge() + " yrs" + (Boolean.TRUE.equals(t.getIsLeader()) ? ", Leader" : "") + ")")
            .reduce((a, b) -> a + "\n" + b)
            .orElse("- Traveler details unavailable");

        return """
            ADVENTURE PLATFORM - TREK TICKET
            Booking Ref: %s
            Status: %s

            Trek: %s
            Location: %s, %s
            Travel Dates: %s - %s
            Travelers: %d

            Emergency Contact: %s
            Emergency Phone: %s
            Pickup Location: %s

            Traveler List:
            %s

            Please carry a government ID, required trek gear, and this ticket at reporting.
            """.formatted(
            booking.getBookingRef(),
            booking.getStatus(),
            booking.getTrek().getTitle(),
            booking.getTrek().getLocation(),
            booking.getTrek().getState(),
            booking.getTrekDate().format(DOC_DATE),
            endDate.format(DOC_DATE),
            booking.getNumAdults() + booking.getNumChildren(),
            valueOrDash(booking.getEmergencyContact()),
            valueOrDash(booking.getEmergencyPhone()),
            valueOrDash(booking.getPickupLocation()),
            travelers
        );
    }

    private String buildInvoiceDocument(Booking booking) {
        Payment payment = booking.getPayment();
        return """
            ADVENTURE PLATFORM - TAX INVOICE
            Invoice For: %s
            Booking Ref: %s
            Payment Status: %s
            Payment ID: %s

            Trek: %s
            Trek Date: %s

            Base Amount: INR %s
            Discount: INR %s
            GST: INR %s
            Total Paid: INR %s

            This invoice was generated electronically.
            """.formatted(
            booking.getUser().getName(),
            booking.getBookingRef(),
            payment != null ? payment.getStatus() : PaymentStatus.PENDING,
            payment != null ? valueOrDash(payment.getGatewayPaymentId()) : "-",
            booking.getTrek().getTitle(),
            booking.getTrekDate().format(DOC_DATE),
            booking.getBaseAmount(),
            booking.getDiscountAmount(),
            booking.getTaxAmount(),
            booking.getFinalAmount()
        );
    }

    private LocalDate resolveEndDate(Booking booking) {
        return booking.getTrek().getDurationDays() != null
            ? booking.getTrekDate().plusDays(Math.max(booking.getTrek().getDurationDays() - 1, 0))
            : booking.getTrekDate();
    }

    private String valueOrDash(String value) {
        return StringUtils.hasText(value) ? value : "-";
    }

    private byte[] renderPdf(String title, String body) {
        String stream = buildPdfTextStream(title, body);
        List<String> objects = List.of(
            "<< /Type /Catalog /Pages 2 0 R >>",
            "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
            "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
            "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
            "<< /Length " + stream.getBytes(StandardCharsets.US_ASCII).length + " >>\nstream\n" + stream + "\nendstream"
        );

        StringBuilder pdf = new StringBuilder("%PDF-1.4\n");
        List<Integer> offsets = new ArrayList<>();
        for (int i = 0; i < objects.size(); i++) {
            offsets.add(pdf.toString().getBytes(StandardCharsets.US_ASCII).length);
            pdf.append(i + 1).append(" 0 obj\n").append(objects.get(i)).append("\nendobj\n");
        }

        int xrefOffset = pdf.toString().getBytes(StandardCharsets.US_ASCII).length;
        pdf.append("xref\n0 ").append(objects.size() + 1).append("\n");
        pdf.append("0000000000 65535 f \n");
        for (Integer offset : offsets) {
            pdf.append(String.format("%010d 00000 n \n", offset));
        }
        pdf.append("trailer\n<< /Size ").append(objects.size() + 1).append(" /Root 1 0 R >>\n");
        pdf.append("startxref\n").append(xrefOffset).append("\n%%EOF");
        return pdf.toString().getBytes(StandardCharsets.US_ASCII);
    }

    private String buildPdfTextStream(String title, String body) {
        StringBuilder content = new StringBuilder();
        content.append("BT\n/F1 16 Tf\n50 760 Td\n(").append(escapePdf(title)).append(") Tj\n");
        content.append("/F1 10 Tf\n0 -24 Td\n");

        int lineCount = 0;
        for (String sourceLine : body.split("\\R")) {
            for (String line : wrapLine(sourceLine, 90)) {
                if (lineCount >= 48) {
                    content.append("(Document continues in booking dashboard.) Tj\n");
                    content.append("ET");
                    return content.toString();
                }
                content.append("(").append(escapePdf(line)).append(") Tj\n0 -14 Td\n");
                lineCount++;
            }
        }
        content.append("ET");
        return content.toString();
    }

    private List<String> wrapLine(String line, int maxLength) {
        String normalized = sanitizePdfText(line);
        if (normalized.length() <= maxLength) return List.of(normalized);

        List<String> lines = new ArrayList<>();
        int start = 0;
        while (start < normalized.length()) {
            int end = Math.min(start + maxLength, normalized.length());
            int breakAt = normalized.lastIndexOf(' ', end);
            if (breakAt <= start) breakAt = end;
            lines.add(normalized.substring(start, breakAt).trim());
            start = breakAt;
        }
        return lines;
    }

    private String escapePdf(String value) {
        return sanitizePdfText(value)
            .replace("\\", "\\\\")
            .replace("(", "\\(")
            .replace(")", "\\)");
    }

    private String sanitizePdfText(String value) {
        if (value == null) return "";
        return value.replaceAll("[^\\x20-\\x7E]", "-");
    }

    private CouponValidationResponse invalidCoupon(String code, String message) {
        return CouponValidationResponse.builder()
            .valid(false)
            .code(code)
            .discountAmount(BigDecimal.ZERO)
            .message(message)
            .build();
    }

    private record PriceBreakdown(
        BigDecimal subtotal,
        BigDecimal discount,
        BigDecimal tax,
        BigDecimal total,
        Coupon coupon
    ) {}
}
