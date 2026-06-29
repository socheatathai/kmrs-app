package com.kmrs.payment.transactions;

import java.util.List;
import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, UUID> {
  List<PaymentTransaction> findByPaymentIdOrderByCreatedAtDesc(UUID paymentId);
}
