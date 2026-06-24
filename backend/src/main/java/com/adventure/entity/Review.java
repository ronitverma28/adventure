package com.adventure.entity;

import com.adventure.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Review extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trek_id", nullable = false)
    private Trek trek;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id")
    private Booking booking;

    @Column(nullable = false)
    private Integer rating;

    @Column(length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String body;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "review_photos", joinColumns = @JoinColumn(name = "review_id"))
    @OrderColumn(name = "sort_order")
    @Column(name = "value", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> photos = new ArrayList<>();

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "is_approved")
    @Builder.Default
    private Boolean isApproved = false;

    @Column(name = "helpful_count")
    @Builder.Default
    private Integer helpfulCount = 0;
}
