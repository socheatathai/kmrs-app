package com.kmrs.payment.payments;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {
  List<Payment> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
