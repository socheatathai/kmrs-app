package com.kmrs.payment.payments;

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
@Table(name = "payments")
public class Payment {
  @Id
  private UUID id;

  @Column(name = "user_id", nullable = false)
  private UUID userId;

  @Column(name = "plan_id")
  private UUID planId;

  @Column(name = "subscription_id")
  private UUID subscriptionId;

  @Column(nullable = false, precision = 10, scale = 2)
  private BigDecimal amount;

  @Column(nullable = false)
  private String currency;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private PaymentStatus status;

  private String provider;

  @Column(name = "provider_transaction_id")
  private String providerTransactionId;

  @Column(name = "checkout_url")
  private String checkoutUrl;

  @Column(name = "created_at", nullable = false)
  private Instant createdAt;

  @Column(name = "updated_at", nullable = false)
  private Instant updatedAt;

  protected Payment() {}

  public Payment(UUID userId, UUID planId, UUID subscriptionId, BigDecimal amount, String currency, String provider) {
    Instant now = Instant.now();

    this.id = UUID.randomUUID();
    this.userId = userId;
    this.planId = planId;
    this.subscriptionId = subscriptionId;
    this.amount = amount;
    this.currency = currency;
    this.provider = provider;
    this.status = PaymentStatus.PENDING;
    this.createdAt = now;
    this.updatedAt = now;
  }

  public void markPaid(String providerTransactionId) {
    this.status = PaymentStatus.PAID;
    this.providerTransactionId = providerTransactionId;
    this.updatedAt = Instant.now();
  }

  public UUID getId() {
    return id;
  }

  public UUID getUserId() {
    return userId;
  }

  public UUID getPlanId() {
    return planId;
  }

  public UUID getSubscriptionId() {
    return subscriptionId;
  }

  public BigDecimal getAmount() {
    return amount;
  }

  public String getCurrency() {
    return currency;
  }

  public PaymentStatus getStatus() {
    return status;
  }

  public String getProvider() {
    return provider;
  }

  public String getProviderTransactionId() {
    return providerTransactionId;
  }

  public String getCheckoutUrl() {
    return checkoutUrl;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }
}
