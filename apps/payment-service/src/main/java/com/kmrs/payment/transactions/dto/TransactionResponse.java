package com.kmrs.payment.transactions.dto;

import com.kmrs.payment.transactions.PaymentTransaction;
import com.kmrs.payment.transactions.TransactionStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record TransactionResponse(
    UUID id,
    UUID paymentId,
    BigDecimal amount,
    String currency,
    String provider,
    String providerTransactionId,
    TransactionStatus status,
    Instant createdAt) {
  public static TransactionResponse from(PaymentTransaction transaction) {
    return new TransactionResponse(
        transaction.getId(),
        transaction.getPaymentId(),
        transaction.getAmount(),
        transaction.getCurrency(),
        transaction.getProvider(),
        transaction.getProviderTransactionId(),
        transaction.getStatus(),
        transaction.getCreatedAt());
  }
}
