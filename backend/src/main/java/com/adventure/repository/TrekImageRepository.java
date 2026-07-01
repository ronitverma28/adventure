package com.adventure.repository;

import com.adventure.entity.TrekImage;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TrekImageRepository extends JpaRepository<TrekImage, Long> {
}
