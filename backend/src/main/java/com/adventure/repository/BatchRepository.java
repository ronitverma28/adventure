package com.adventure.repository;

import com.adventure.entity.Batch;
import com.adventure.enums.BatchStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BatchRepository extends JpaRepository<Batch, Long> {
    List<Batch> findByTrekIdAndStartDateGreaterThanEqualAndStatusOrderByStartDateAsc(
            Long trekId,
            LocalDate startDate,
            BatchStatus status
    );
}
