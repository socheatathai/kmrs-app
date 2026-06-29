package com.kmrs.payment.transactions;

import com.kmrs.payment.transactions.dto.CreateTransactionRequest;
import com.kmrs.payment.transactions.dto.TransactionResponse;
import jakarta.validation.Valid;
import java.util.List;
import java.util.UUID;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PaymentTransactionController {
  private final PaymentTransactionService transactionService;

  public PaymentTransactionController(PaymentTransactionService transactionService) {
    this.transactionService = transactionService;
  }

  @PostMapping("/transactions")
  public TransactionResponse create(@Valid @RequestBody CreateTransactionRequest request) {
    return transactionService.create(request);
  }

  @GetMapping("/payments/{paymentId}/transactions")
  public List<TransactionResponse> findByPayment(@PathVariable UUID paymentId) {
    return transactionService.findByPayment(paymentId);
  }
}
