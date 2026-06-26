package com.kmrs.payment.payments;

import com.kmrs.payment.payments.dto.CreatePaymentRequest;
import com.kmrs.payment.payments.dto.PaymentResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

@Service
public class PaymentService {
  private final PaymentRepository paymentRepository;

  public PaymentService(PaymentRepository paymentRepository) {
    this.paymentRepository = paymentRepository;
  }

  @Transactional
  public PaymentResponse create(CreatePaymentRequest request) {
    String currency = request.currency() == null || request.currency().isBlank()
        ? "USD"
        : request.currency().trim().toUpperCase();
    String provider = request.provider() == null || request.provider().isBlank()
        ? "manual"
        : request.provider().trim();

    Payment payment = new Payment(
        request.userId(),
        request.planId(),
        request.subscriptionId(),
        request.amount(),
        currency,
        provider);

    return PaymentResponse.from(paymentRepository.save(payment));
  }

  @Transactional(readOnly = true)
  public PaymentResponse findOne(UUID paymentId) {
    return paymentRepository
        .findById(paymentId)
        .map(PaymentResponse::from)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));
  }

  @Transactional(readOnly = true)
  public List<PaymentResponse> findByUser(UUID userId) {
    return paymentRepository.findByUserIdOrderByCreatedAtDesc(userId)
        .stream()
        .map(PaymentResponse::from)
        .toList();
  }

  @Transactional
  public PaymentResponse markPaid(UUID paymentId, String providerTransactionId) {
    Payment payment = paymentRepository.findById(paymentId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));

    payment.markPaid(providerTransactionId);

    return PaymentResponse.from(payment);
  }
}
