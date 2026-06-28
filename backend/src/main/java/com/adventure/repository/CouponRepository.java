package com.adventure.repository;

import com.adventure.entity.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Long> {
    Optional<Coupon> findByCodeIgnoreCase(String code);

    @Query("""
        SELECT COUNT(b) FROM Booking b
        WHERE b.coupon.id = :couponId
        AND b.user.id = :userId
        AND b.status IN ('PENDING', 'CONFIRMED', 'COMPLETED')
        """)
    long countUsageByUser(@Param("couponId") Long couponId, @Param("userId") Long userId);
}
