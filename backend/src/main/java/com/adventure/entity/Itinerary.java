package com.adventure.entity;

import com.adventure.enums.DifficultyLevel;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "itinerary")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Itinerary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trek_id", nullable = false)
    private Trek trek;

    @Column(name = "day_number", nullable = false)
    private Integer dayNumber;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "distance_km", precision = 6, scale = 2)
    private BigDecimal distanceKm;

    @Column(name = "elevation_gain")
    private Integer elevationGain;

    @Column(name = "elevation_loss")
    private Integer elevationLoss;

    @Column(name = "max_altitude")
    private Integer maxAltitude;

    @Column(length = 200)
    private String accommodation;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "itinerary_meals_included", joinColumns = @JoinColumn(name = "itinerary_id"))
    @OrderColumn(name = "sort_order")
    @Column(name = "value", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> mealsIncluded = new ArrayList<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_day")
    private DifficultyLevel difficultyDay;

    @Column(columnDefinition = "TEXT")
    private String tips;
}
