package com.adventure.repository;

import com.adventure.entity.Booking;
import com.adventure.enums.BookingStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    Page<Booking> findByUserId(Long userId, Pageable pageable);
    Page<Booking> findByTrekId(Long trekId, Pageable pageable);

    Optional<Booking> findByBookingRef(String bookingRef);
    Optional<Booking> findByBookingRefAndUserId(String bookingRef, Long userId);

    List<Booking> findByTrekIdAndTrekDateAndStatusIn(
        Long trekId, LocalDate trekDate, List<BookingStatus> statuses
    );

    @Query("""
        SELECT COALESCE(SUM(b.numAdults + b.numChildren), 0)
        FROM Booking b
        WHERE b.trek.id = :trekId
        AND b.trekDate = :trekDate
        AND b.status IN ('PENDING', 'CONFIRMED')
        """)
    Integer countConfirmedPersonsForTrekDate(
        @Param("trekId") Long trekId,
        @Param("trekDate") LocalDate trekDate
    );

    @Query("SELECT COALESCE(SUM(b.finalAmount), 0) FROM Booking b WHERE b.status = 'COMPLETED'")
    BigDecimal getTotalRevenue();

    @Query("""
        SELECT COALESCE(SUM(b.finalAmount), 0) FROM Booking b
        WHERE b.status = 'COMPLETED'
        AND b.createdAt >= :from
        """)
    BigDecimal getRevenueFrom(@Param("from") Instant from);

    long countByStatus(BookingStatus status);

    @Query("""
        SELECT b FROM Booking b
        WHERE (:status IS NULL OR b.status = :status)
        AND (:search IS NULL
             OR LOWER(b.bookingRef) LIKE LOWER(CONCAT('%', :search, '%'))
             OR LOWER(b.user.email) LIKE LOWER(CONCAT('%', :search, '%'))
             OR LOWER(b.trek.title) LIKE LOWER(CONCAT('%', :search, '%')))
        """)
    Page<Booking> searchBookings(
        @Param("status") BookingStatus status,
        @Param("search") String search,
        Pageable pageable
    );
}
