package com.kmrs.payment.payments;

import com.kmrs.payment.payments.dto.CreatePaymentRequest;
import com.kmrs.payment.payments.dto.MarkPaidRequest;
import com.kmrs.payment.payments.dto.PaymentResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PaymentController {
  private final PaymentService paymentService;

  public PaymentController(PaymentService paymentService) {
    this.paymentService = paymentService;
  }

  @PostMapping("/payments")
  public PaymentResponse create(@Valid @RequestBody CreatePaymentRequest request) {
    return paymentService.create(request);
  }

  @GetMapping("/payments/{paymentId}")
  public PaymentResponse findOne(@PathVariable UUID paymentId) {
    return paymentService.findOne(paymentId);
  }

  @GetMapping("/users/{userId}/payments")
  public List<PaymentResponse> findByUser(@PathVariable UUID userId) {
    return paymentService.findByUser(userId);
  }

  @PatchMapping("/internal/payments/{paymentId}/mark-paid")
  public PaymentResponse markPaid(
      @PathVariable UUID paymentId,
      @RequestBody MarkPaidRequest request) {
    return paymentService.markPaid(paymentId, request.providerTransactionId());
  }
}
