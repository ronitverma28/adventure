package com.adventure.repository;

import com.adventure.entity.Review;
import com.adventure.entity.Trek;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    Page<Review> findByTrekId(Long trekId, Pageable pageable);
    Page<Review> findByTrekIdAndIsApproved(Long trekId, Boolean isApproved, Pageable pageable);
    Page<Review> findByUserId(Long userId, Pageable pageable);
    Page<Review> findByIsApproved(Boolean isApproved, Pageable pageable);
    boolean existsByTrekIdAndUserId(Long trekId, Long userId);
    long countByIsApproved(Boolean isApproved);
    long countByTrekIdAndIsApproved(Long trekId, Boolean isApproved);
    long countByTrekIdAndIsApprovedAndRating(Long trekId, Boolean isApproved, Integer rating);
    List<Review> findAllByTrekAndIsApprovedTrue(Trek trek);
}
