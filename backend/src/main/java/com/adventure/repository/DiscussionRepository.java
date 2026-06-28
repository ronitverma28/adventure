package com.adventure.repository;

import com.adventure.entity.Discussion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface DiscussionRepository extends JpaRepository<Discussion, Long> {

    @Query("""
        SELECT d FROM Discussion d
        WHERE (:category IS NULL OR d.category = :category)
        AND (:search IS NULL
             OR LOWER(d.title) LIKE LOWER(CONCAT('%', :search, '%')))
        ORDER BY d.isPinned DESC, d.createdAt DESC
        """)
    Page<Discussion> findAll(
        @Param("category") String category,
        @Param("search") String search,
        Pageable pageable
    );
}
