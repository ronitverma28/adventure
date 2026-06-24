package com.adventure.repository;

import com.adventure.entity.Trek;
import com.adventure.enums.DifficultyLevel;
import com.adventure.enums.TrekStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface TrekRepository extends JpaRepository<Trek, Long> {

    Optional<Trek> findBySlug(String slug);

    Page<Trek> findByStatus(TrekStatus status, Pageable pageable);

    List<Trek> findByIsFeaturedTrueAndStatus(TrekStatus status);

    @Query("""
        SELECT t FROM Trek t
        WHERE t.status = 'ACTIVE'
        AND (:state IS NULL OR LOWER(t.state) = LOWER(:state))
        AND (:difficulty IS NULL OR t.difficulty = :difficulty)
        AND (:minPrice IS NULL OR t.pricePerPerson >= :minPrice)
        AND (:maxPrice IS NULL OR t.pricePerPerson <= :maxPrice)
        AND (:minDays IS NULL OR t.durationDays >= :minDays)
        AND (:maxDays IS NULL OR t.durationDays <= :maxDays)
        AND (:search IS NULL OR LOWER(t.title) LIKE LOWER(CONCAT('%', :search, '%'))
             OR LOWER(t.location) LIKE LOWER(CONCAT('%', :search, '%')))
        """)
    Page<Trek> findWithFilters(
        @Param("state") String state,
        @Param("difficulty") DifficultyLevel difficulty,
        @Param("minPrice") BigDecimal minPrice,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("minDays") Integer minDays,
        @Param("maxDays") Integer maxDays,
        @Param("search") String search,
        Pageable pageable
    );

    boolean existsBySlug(String slug);
}
