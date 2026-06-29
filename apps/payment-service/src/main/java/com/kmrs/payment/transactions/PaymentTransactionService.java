package com.kmrs.payment.transactions;

import com.kmrs.payment.payments.Payment;
import com.kmrs.payment.payments.PaymentRepository;
import com.kmrs.payment.transactions.dto.CreateTransactionRequest;
import com.kmrs.payment.transactions.dto.TransactionResponse;
import java.util.List;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PaymentTransactionService {
  private final PaymentRepository paymentRepository;
  private final PaymentTransactionRepository transactionRepository;

  public PaymentTransactionService(
      PaymentRepository paymentRepository,
      PaymentTransactionRepository transactionRepository) {
    this.paymentRepository = paymentRepository;
    this.transactionRepository = transactionRepository;
  }

  @Transactional
  public TransactionResponse create(CreateTransactionRequest request) {
    Payment payment = paymentRepository.findById(request.paymentId())
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found"));

    String currency = request.currency() == null || request.currency().isBlank()
        ? payment.getCurrency()
        : request.currency().trim().toUpperCase();
    TransactionStatus status = request.status() == null
        ? TransactionStatus.PENDING
        : request.status();

    PaymentTransaction transaction = new PaymentTransaction(
        payment.getId(),
        request.amount(),
        currency,
        request.provider().trim(),
        request.providerTransactionId(),
        status);

    PaymentTransaction saved = transactionRepository.save(transaction);

    if (status == TransactionStatus.SUCCEEDED) {
      payment.markPaid(request.providerTransactionId());
    }

    return TransactionResponse.from(saved);
  }

  @Transactional(readOnly = true)
  public List<TransactionResponse> findByPayment(UUID paymentId) {
    if (!paymentRepository.existsById(paymentId)) {
      throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Payment not found");
    }

    return transactionRepository.findByPaymentIdOrderByCreatedAtDesc(paymentId)
        .stream()
        .map(TransactionResponse::from)
        .toList();
  }
}
