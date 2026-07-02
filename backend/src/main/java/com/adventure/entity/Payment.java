package com.adventure.entity;

import com.adventure.entity.base.BaseEntity;
import com.adventure.enums.PaymentMethod;
import com.adventure.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;

@Entity
@Table(name = "payments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(length = 10)
    @Builder.Default
    private String currency = "INR";

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private PaymentMethod method = PaymentMethod.UPI;

    @Column(name = "utr_number", unique = true, length = 50)
    private String utrNumber;

    @Column(name = "payment_screenshot")
    private String paymentScreenshot;

    @Column(name = "cloudinary_public_id")
    private String cloudinaryPublicId;

    @Column(name = "admin_remark", length = 500)
    private String adminRemark;

    @Column(name = "verified_at")
    private Instant verifiedAt;


    @Column(name = "paid_at")
    private Instant paidAt;

    @Column(name = "refund_amount", precision = 10, scale = 2)
    private BigDecimal refundAmount;

    @Column(name = "refund_id", length = 200)
    private String refundId;

    @Column(name = "refunded_at")
    private Instant refundedAt;

    @Column(name = "failure_reason", length = 500)
    private String failureReason;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSON")
    private Map<String, Object> metadata;
}
