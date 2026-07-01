package com.adventure.entity;

import com.adventure.enums.DifficultyLevel;
import com.adventure.enums.Meals;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.Set;

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

    @ElementCollection
    @CollectionTable(
            name = "itinerary_meals",
            joinColumns = @JoinColumn(name = "itinerary_id")
    )
    @Column(name = "meal")
    private Set<Meals> mealsIncluded = new HashSet<>();

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_day")
    private DifficultyLevel difficultyDay;

    @Column(columnDefinition = "TEXT")
    private String tips;
}
