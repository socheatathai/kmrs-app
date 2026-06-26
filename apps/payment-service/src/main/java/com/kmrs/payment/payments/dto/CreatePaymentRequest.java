package com.kmrs.payment.payments.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record CreatePaymentRequest(
    @NotNull UUID userId,
    UUID planId,
    UUID subscriptionId,
    @NotNull @DecimalMin("0.01") BigDecimal amount,
    String currency,
    String provider) {}
