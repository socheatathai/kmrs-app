package com.kmrs.payment.payments.dto;

import com.kmrs.payment.payments.Payment;
import com.kmrs.payment.payments.PaymentStatus;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PaymentResponse(
    UUID id,
    UUID userId,
    UUID planId,
    UUID subscriptionId,
    BigDecimal amount,
    String currency,
    PaymentStatus status,
    String provider,
    String providerTransactionId,
    String checkoutUrl,
    Instant createdAt,
    Instant updatedAt) {
  public static PaymentResponse from(Payment payment) {
    return new PaymentResponse(
        payment.getId(),
        payment.getUserId(),
        payment.getPlanId(),
        payment.getSubscriptionId(),
        payment.getAmount(),
        payment.getCurrency(),
        payment.getStatus(),
        payment.getProvider(),
        payment.getProviderTransactionId(),
        payment.getCheckoutUrl(),
        payment.getCreatedAt(),
        payment.getUpdatedAt());
  }
}
