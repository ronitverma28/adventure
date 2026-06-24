package com.adventure.entity;

import com.adventure.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "guides")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Guide extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "photo_url", length = 500)
    private String photoUrl;

    @Column(length = 20)
    private String phone;

    @Column(length = 150)
    private String email;

    @Column(name = "experience_years")
    @Builder.Default
    private Integer experienceYears = 0;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "guide_languages", joinColumns = @JoinColumn(name = "guide_id"))
    @OrderColumn(name = "sort_order")
    @Column(name = "value", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> languages = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "guide_certifications", joinColumns = @JoinColumn(name = "guide_id"))
    @OrderColumn(name = "sort_order")
    @Column(name = "value", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> certifications = new ArrayList<>();

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "guide_specializations", joinColumns = @JoinColumn(name = "guide_id"))
    @OrderColumn(name = "sort_order")
    @Column(name = "value", columnDefinition = "TEXT")
    @Builder.Default
    private List<String> specializations = new ArrayList<>();

    @Column(name = "avg_rating", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal avgRating = BigDecimal.ZERO;

    @Column(name = "total_treks")
    @Builder.Default
    private Integer totalTreks = 0;

    @Column(name = "is_available")
    @Builder.Default
    private Boolean isAvailable = true;

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = false;

    @ManyToMany(mappedBy = "guides")
    @Builder.Default
    private Set<Trek> treks = new HashSet<>();
}
