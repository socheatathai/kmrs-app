package com.kmrs.payment.transactions.dto;

import com.kmrs.payment.transactions.TransactionStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public record CreateTransactionRequest(
    @NotNull UUID paymentId,
    @NotNull @DecimalMin("0.01") BigDecimal amount,
    String currency,
    @NotBlank String provider,
    String providerTransactionId,
    TransactionStatus status) {}
