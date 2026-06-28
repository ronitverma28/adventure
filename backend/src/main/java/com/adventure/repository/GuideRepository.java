package com.adventure.repository;

import com.adventure.entity.Guide;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GuideRepository extends JpaRepository<Guide, Long> {
    Page<Guide> findAll(Pageable pageable);
    long countByIsVerified(Boolean isVerified);
}
