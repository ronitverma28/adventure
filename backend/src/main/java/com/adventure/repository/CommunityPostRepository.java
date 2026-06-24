package com.adventure.repository;

import com.adventure.entity.CommunityPost;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface CommunityPostRepository extends JpaRepository<CommunityPost, Long> {

    @Query("""
        SELECT p FROM CommunityPost p
        WHERE p.isPublished = true
        AND (:type IS NULL OR p.type = :type)
        ORDER BY p.createdAt DESC
        """)
    Page<CommunityPost> findFeed(@Param("type") String type, Pageable pageable);

    Page<CommunityPost> findByAuthorIdAndIsPublishedTrue(Long authorId, Pageable pageable);

    long countByAuthorId(Long authorId);
}
