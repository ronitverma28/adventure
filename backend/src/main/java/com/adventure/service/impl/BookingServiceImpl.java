package com.adventure.service.impl;

import com.adventure.dto.request.*;
import com.adventure.dto.response.*;
import com.adventure.entity.*;
import com.adventure.enums.*;
import com.adventure.exception.BadRequestException;
import com.adventure.exception.BookingConflictException;
import com.adventure.exception.ResourceNotFoundException;
import com.adventure.repository.*;
import com.adventure.service.interfaces.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;

import java.math.RoundingMode;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class BookingServiceImpl implements BookingService {

    private static final BigDecimal ONE_HUNDRED = BigDecimal.valueOf(100);
    private static final DateTimeFormatter DOC_DATE = DateTimeFormatter.ofPattern("dd MMM yyyy");

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final CouponRepository couponRepository;
    private final BatchRepository batchRepository;
    private final UserRepository userRepository;

    @Value("${app.currency:INR}")
    private String currency;

    @Value("${app.tax-rate:0.18}")
    private BigDecimal taxRate;

    @Override
    @Transactional
    public BookingSummaryResponse createBooking(
            String userEmail,
            CreateBookingRequest request
    ) {

        User user = findUser(userEmail);

        Batch batch = batchRepository.findById(request.getBatchId())
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Batch id : " + request.getBatchId()
                        ));

        if (batch.getStatus() != BatchStatus.UPCOMING) {
            throw new BadRequestException("Selected batch is not available.");
        }

        validateTravelerCount(request);

        int requestedSeats =
                request.getNumAdults() +
                        request.getNumChildren();

        if (batch.getAvailableSlots() < requestedSeats) {

            throw new BookingConflictException(
                    "Only " +
                            batch.getAvailableSlots() +
                            " seats are available."
            );

        }

        PriceBreakdown price = calculatePrice(

                batch,

                request.getNumAdults(),

                request.getNumChildren(),

                request.getCouponCode(),

                user

        );

        String bookingRef =
                "BK"
                        + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE)
                        + "-"
                        + UUID.randomUUID()
                        .toString()
                        .substring(0, 6)
                        .toUpperCase();

        Booking booking = Booking.builder()

                .bookingRef(bookingRef)

                .batch(batch)

                .person(user.getName())

                .user(user)

                .coupon(price.coupon())

                .numAdults(request.getNumAdults())

                .numChildren(request.getNumChildren())

                .trekDate(batch.getStartDate())

                .baseAmount(price.subtotal())

                .discountAmount(price.discount())

                .taxAmount(price.tax())

                .finalAmount(price.total())

                .totalAmount(price.total().doubleValue())

                .paymentStatus(PaymentStatus.PENDING)

                .status(BookingStatus.PENDING)

                .emergencyContact(request.getEmergencyContact())

                .emergencyPhone(request.getEmergencyPhone())

                .build();

        for (TravelerRequest traveler : request.getTravelers()) {

            booking.getTravelers().add(

                    toTravelerEntity(
                            booking,
                            traveler
                    )

            );

        }

        Payment payment = Payment.builder()

                .booking(booking)

                .user(user)

                .amount(price.total())

                .currency(currency)

                .status(PaymentStatus.PENDING)

                .method(PaymentMethod.UPI)

                .build();

        booking.setPayment(payment);

        Booking savedBooking = bookingRepository.save(booking);

        return BookingSummaryResponse.builder()

                .bookingId(savedBooking.getId())

                .bookingRef(savedBooking.getBookingRef())

                .amount(savedBooking.getFinalAmount())

                .bookingStatus(savedBooking.getStatus())

                .paymentStatus(savedBooking.getPaymentStatus())

                .message("Booking created successfully. Please upload your payment proof.")

                .build();

    }

    @Override
    @Transactional(readOnly = true)
    public CouponValidationResponse validateCoupon(String userEmail,
            ValidateCouponRequest request) {

        User user = findUser(userEmail);

        Batch batch = batchRepository.findById(request.getBatchId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Batch id : " +
                                request.getBatchId()));

        Coupon coupon = couponRepository.findByCodeIgnoreCase(request.getCode())
                .orElse(null);

        if (coupon == null) {
            return invalidCoupon(
                    request.getCode(),
                    "Coupon code is invalid.");
        }

        try {

            BigDecimal discount = calculateCouponDiscount(
                    coupon,
                    batch,
                    request.getAmount(),
                    user);

            return CouponValidationResponse.builder()
                    .valid(true)
                    .code(coupon.getCode())
                    .discountType(coupon.getDiscountType())
                    .discountValue(coupon.getDiscountValue())
                    .discountAmount(discount)
                    .message("Coupon applied successfully.")
                    .build();

        } catch (BadRequestException ex) {

            return invalidCoupon(
                    coupon.getCode(),
                    ex.getMessage());

        }
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<BookingConfirmationResponse> getMyBookings(String userEmail,
            Pageable pageable) {

        User user = findUser(userEmail);

        Page<Booking> page = bookingRepository.findByUserId(
                user.getId(),
                pageable);

        return PagedResponse.<BookingConfirmationResponse>builder()
                .content(
                        page.getContent()
                                .stream()
                                .map(this::toBookingResponse)
                                .toList())
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
    public BookingConfirmationResponse getBooking(String userEmail,
            String bookingRef) {

        Booking booking = findUserBooking(
                userEmail,
                bookingRef);

        return toBookingResponse(booking);
    }

    @Override
    @Transactional
    public void cancelBooking(String userEmail,
            String bookingRef,
            CancelBookingRequest request) {

        Booking booking = findUserBooking(
                userEmail,
                bookingRef);

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BadRequestException("Booking is already cancelled.");
        }

        if (booking.getStatus() == BookingStatus.REFUNDED) {
            throw new BadRequestException("Booking is already refunded.");
        }

        if (booking.getStatus() == BookingStatus.COMPLETED) {
            throw new BadRequestException("Completed bookings cannot be cancelled.");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(Instant.now());
        booking.setCancellationReason(request.getReason());
        booking.setPaymentStatus(PaymentStatus.PARTIALLY_REFUNDED);

        Payment payment = booking.getPayment();

        if (payment != null && payment.getStatus() == PaymentStatus.SUCCESS) {

            payment.setStatus(PaymentStatus.PARTIALLY_REFUNDED);
            payment.setRefundAmount(payment.getAmount());
            payment.setRefundedAt(Instant.now());

            paymentRepository.save(payment);
        }

        Batch batch = booking.getBatch();

        int seats = booking.getNumAdults() + booking.getNumChildren();

        batch.setAvailableSlots(
                batch.getAvailableSlots() + seats);

        batchRepository.save(batch);
        bookingRepository.save(booking);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateTicket(String userEmail,
            String bookingRef) {

        Booking booking = findUserBooking(
                userEmail,
                bookingRef);

        return renderPdf(
                "Adventure Trek Ticket",
                buildTicketDocument(booking));
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateInvoice(String userEmail,
            String bookingRef) {

        Booking booking = findUserBooking(
                userEmail,
                bookingRef);

        return renderPdf(
                "Adventure Tax Invoice",
                buildInvoiceDocument(booking));
    }

    private User findUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private Booking findUserBooking(String userEmail, String bookingRef) {
        User user = findUser(userEmail);
        return bookingRepository.findByBookingRefAndUserId(bookingRef, user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "reference", bookingRef));
    }

    private void validateTravelerCount(CreateBookingRequest request) {

        int expected = request.getNumAdults() + request.getNumChildren();

        if (request.getTravelers() == null || request.getTravelers().isEmpty()) {
            throw new BadRequestException("Traveler details are required.");
        }

        if (request.getTravelers().size() != expected) {
            throw new BadRequestException("Traveler count must match selected seats.");
        }

        long leaders = request.getTravelers()
                .stream()
                .filter(traveler -> Boolean.TRUE.equals(traveler.getIsLeader()))
                .count();

        if (leaders == 0) {
            request.getTravelers().get(0).setIsLeader(true);
        }

        if (leaders > 1) {
            throw new BadRequestException("Only one traveler can be marked as leader.");
        }
    }

    private PriceBreakdown calculatePrice(Batch batch, int adults, int children, String couponCode, User user) {
        BigDecimal adultPrice = batch.getPricePerPerson().multiply(BigDecimal.valueOf(adults));
        BigDecimal childRate = batch.getPricePerChild() != null ? batch.getPricePerChild() : batch.getPricePerPerson();
        BigDecimal childPrice = childRate.multiply(BigDecimal.valueOf(children));
        BigDecimal subtotal = adultPrice.add(childPrice);
        Coupon coupon = null;
        BigDecimal discount = BigDecimal.ZERO;

        if (StringUtils.hasText(couponCode)) {
            coupon = couponRepository.findByCodeIgnoreCase(couponCode)
                    .orElseThrow(() -> new BadRequestException("Coupon code is not valid"));
            discount = calculateCouponDiscount(coupon, batch, subtotal, user);
        }

        BigDecimal taxable = subtotal.subtract(discount).max(BigDecimal.ZERO);
        BigDecimal tax = taxable.multiply(taxRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = taxable.add(tax).setScale(2, RoundingMode.HALF_UP);
        return new PriceBreakdown(subtotal, discount, tax, total, coupon);
    }

    private BigDecimal calculateCouponDiscount(Coupon coupon, Batch batch, BigDecimal amount, User user) {
        Instant now = Instant.now();
        if (!Boolean.TRUE.equals(coupon.getIsActive()))
            throw new BadRequestException("Coupon is inactive");
        if (coupon.getValidFrom().isAfter(now) || coupon.getValidUntil().isBefore(now)) {
            throw new BadRequestException("Coupon has expired");
        }
        if (coupon.getApplicableTrek() != null && !coupon.getApplicableTrek().getId().equals(batch.getId())) {
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

    private BookingTraveler toTravelerEntity(Booking booking, TravelerRequest traveler) {
        return BookingTraveler.builder()
                .booking(booking)
                .name(traveler.getName())
                .age(traveler.getAge())
                .gender(traveler.getGender())
                .idType(traveler.getIdType())
                .idNumber(traveler.getIdNumber())
                .isLeader(Boolean.TRUE.equals(traveler.getIsLeader()))
                .build();
    }

    private BookingConfirmationResponse toBookingResponse(Booking booking) {
        LocalDate endDate = booking.getBatch().getTrek().getDurationDays() != null
                ? booking.getTrekDate().plusDays(Math.max(booking.getBatch().getTrek().getDurationDays() - 1, 0))
                : booking.getTrekDate();
        return BookingConfirmationResponse.builder()
                .bookingId(booking.getId())
                .bookingRef(booking.getBookingRef())
                .trekTitle(booking.getBatch().getTrek().getTitle())
                .trekSlug(booking.getBatch().getTrek().getSlug())
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
                .map(t -> "- " + t.getName() + " (" + t.getAge() + " yrs"
                        + (Boolean.TRUE.equals(t.getIsLeader()) ? ", Leader" : "") + ")")
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
                Traveler List:
                %s

                Please carry a government ID, required trek gear, and this ticket at reporting.
                """.formatted(
                booking.getBookingRef(),
                booking.getStatus(),
                booking.getBatch().getTrek().getTitle(),
                booking.getBatch().getTrek().getLocation(),
                booking.getBatch().getTrek().getState(),
                booking.getTrekDate().format(DOC_DATE),
                endDate.format(DOC_DATE),
                booking.getNumAdults() + booking.getNumChildren(),
                valueOrDash(booking.getEmergencyContact()),
                valueOrDash(booking.getEmergencyPhone()),
                travelers);
    }

    private String buildInvoiceDocument(Booking booking) {
        Payment payment = booking.getPayment();
        return """
                ADVENTURE PLATFORM - TAX INVOICE
                Invoice For: %s
                Booking Ref: %s
                Payment Status: %s
                UTR Number: %s

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
                payment != null ? valueOrDash(payment.getUtrNumber()) : "-",
                booking.getBatch().getTrek().getTitle(),
                booking.getTrekDate().format(DOC_DATE),
                booking.getBaseAmount(),
                booking.getDiscountAmount(),
                booking.getTaxAmount(),
                booking.getFinalAmount());
    }

    private LocalDate resolveEndDate(Booking booking) {
        return booking.getBatch().getTrek().getDurationDays() != null
                ? booking.getTrekDate().plusDays(Math.max(booking.getBatch().getTrek().getDurationDays() - 1, 0))
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
                "<< /Length " + stream.getBytes(StandardCharsets.US_ASCII).length + " >>\nstream\n" + stream
                        + "\nendstream");

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
        if (normalized.length() <= maxLength)
            return List.of(normalized);

        List<String> lines = new ArrayList<>();
        int start = 0;
        while (start < normalized.length()) {
            int end = Math.min(start + maxLength, normalized.length());
            int breakAt = normalized.lastIndexOf(' ', end);
            if (breakAt <= start)
                breakAt = end;
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
        if (value == null)
            return "";
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
            Coupon coupon) {
    }
}
