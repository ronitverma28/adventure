package com.adventure.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "trek_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrekImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trek_id", nullable = false)
    private Trek trek;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "public_id", length = 300)
    private String publicId;

    @Column(name = "alt_text", length = 200)
    private String altText;

    @Column(length = 300)
    private String caption;

    @Column(name = "is_cover")
    @Builder.Default
    private Boolean isCover = false;

    @Column(name = "display_order")
    @Builder.Default
    private Integer displayOrder = 0;
}
