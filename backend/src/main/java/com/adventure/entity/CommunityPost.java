package com.adventure.entity;

import com.adventure.entity.base.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "community_posts")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CommunityPost extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trek_id")
    private Trek trek;

    @Column(nullable = false, length = 300)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    // Comma-separated image URLs stored as TEXT
    @Column(name = "image_urls", columnDefinition = "TEXT")
    private String imageUrls;

    @Column(length = 50)
    @Builder.Default
    private String type = "EXPERIENCE"; // EXPERIENCE | PHOTO | QUESTION

    @Column(name = "like_count")
    @Builder.Default
    private Integer likeCount = 0;

    @Column(name = "comment_count")
    @Builder.Default
    private Integer commentCount = 0;

    @Column(name = "is_published")
    @Builder.Default
    private Boolean isPublished = true;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CommunityComment> comments = new ArrayList<>();

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<CommunityLike> likes = new ArrayList<>();
}
