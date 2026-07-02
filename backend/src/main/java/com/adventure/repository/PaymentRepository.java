package com.adventure.repository;

import com.adventure.entity.Payment;
import com.adventure.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    boolean existsByUtrNumber(String utrNumber);

    List<Payment> findByStatus(PaymentStatus status);
}
