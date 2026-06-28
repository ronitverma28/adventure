package com.adventure.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "booking_travelers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingTraveler {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false)
    private Booking booking;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false)
    private Integer age;

    @Column(nullable = false, length = 20)
    private String gender;

    @Column(name = "id_type", nullable = false, length = 40)
    private String idType;

    @Column(name = "id_number", nullable = false, length = 80)
    private String idNumber;

    @Column(name = "medical_conditions", columnDefinition = "TEXT")
    private String medicalConditions;

    @Column(name = "is_leader")
    @Builder.Default
    private Boolean isLeader = false;
}
