package com.adventure.entity;

import com.adventure.entity.base.BaseEntity;
import com.adventure.enums.DifficultyLevel;
import com.adventure.enums.TrekStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "treks")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trek extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, unique = true, length = 220)
    private String slug;

    @Column(name = "short_description", nullable = false, length = 500)
    private String shortDescription;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "trek_highlights", joinColumns = @JoinColumn(name = "trek_id"))
    @OrderColumn(name = "sort_order")
    @Column(name = "value", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> highlights = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "trek_inclusions", joinColumns = @JoinColumn(name = "trek_id"))
    @OrderColumn(name = "sort_order")
    @Column(name = "value", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> inclusions = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "trek_exclusions", joinColumns = @JoinColumn(name = "trek_id"))
    @OrderColumn(name = "sort_order")
    @Column(name = "value", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> exclusions = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "trek_things_to_carry", joinColumns = @JoinColumn(name = "trek_id"))
    @OrderColumn(name = "sort_order")
    @Column(name = "value", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> thingsToCarry = new ArrayList<>();

    @Column(nullable = false, length = 200)
    private String location;

    @Column(nullable = false, length = 100)
    private String state;

    @Column(length = 100)
    private String region;

    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "altitude_max")
    private Integer altitudeMax;

    @Column(name = "altitude_base")
    private Integer altitudeBase;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays;

    @Column(name = "duration_nights", nullable = false)
    private Integer durationNights;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private DifficultyLevel difficulty;

    @Column(name = "group_size_min")
    @Builder.Default
    private Integer groupSizeMin = 4;

    @Column(name = "group_size_max")
    @Builder.Default
    private Integer groupSizeMax = 20;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "meeting_point", length = 300)
    private String meetingPoint;

    @Column(name = "nearest_airport", length = 200)
    private String nearestAirport;

    @Column(name = "nearest_railway", length = 200)
    private String nearestRailway;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private TrekStatus status = TrekStatus.DRAFT;

    @Column(name = "is_featured")
    @Builder.Default
    private Boolean isFeatured = false;

    @Column(name = "is_bestseller")
    @Builder.Default
    private Boolean isBestseller = false;

    @Column(name = "avg_rating", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal avgRating = BigDecimal.ZERO;

    @Column(name = "total_reviews")
    @Builder.Default
    private Integer totalReviews = 0;

    @Column(name = "total_bookings")
    @Builder.Default
    private Integer totalBookings = 0;

    @Column(name = "cover_image_url", length = 500)
    private String coverImageUrl;

    @Column(name = "meta_title", length = 200)
    private String metaTitle;

    @Column(name = "meta_description", length = 500)
    private String metaDescription;

    // Relationships
    @OneToMany(mappedBy = "trek", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("displayOrder ASC")
    @Builder.Default
    private List<TrekImage> images = new ArrayList<>();

    @OneToMany(mappedBy = "trek", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("dayNumber ASC")
    @Builder.Default
    private List<Itinerary> itinerary = new ArrayList<>();

    @OneToMany(mappedBy = "trek", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Batch> batches = new ArrayList<>();

    @OneToMany(mappedBy = "trek")
    @Builder.Default
    private List<Review> reviews = new ArrayList<>();
}
