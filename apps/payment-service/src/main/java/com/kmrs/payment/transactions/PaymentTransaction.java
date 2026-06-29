package com.kmrs.payment.transactions;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payment_transactions")
public class PaymentTransaction {
  @Id
  private UUID id;

  @Column(name = "payment_id", nullable = false)
  private UUID paymentId;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal amount;

  @Column(nullable = false)
  private String currency;

  @Column(nullable = false)
  private String provider;

  @Column(name = "provider_transaction_id")
  private String providerTransactionId;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private TransactionStatus status;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  protected PaymentTransaction() {}

  public PaymentTransaction(
      UUID paymentId,
      BigDecimal amount,
      String currency,
      String provider,
      String providerTransactionId,
      TransactionStatus status) {
    this.id = UUID.randomUUID();
    this.paymentId = paymentId;
    this.amount = amount;
    this.currency = currency;
    this.provider = provider;
    this.providerTransactionId = providerTransactionId;
    this.status = status;
    this.createdAt = Instant.now();
  }

  public UUID getId() {
    return id;
  }

  public UUID getPaymentId() {
    return paymentId;
  }

  public BigDecimal getAmount() {
    return amount;
  }

  public String getCurrency() {
    return currency;
  }

  public String getProvider() {
    return provider;
  }

  public String getProviderTransactionId() {
    return providerTransactionId;
  }

  public TransactionStatus getStatus() {
    return status;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }
}
