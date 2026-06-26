import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type CreatePaymentInput = {
  userId: string;
  planId?: string;
  subscriptionId?: string;
  amount: string;
  currency?: string;
  provider?: string;
};

type PaymentResponse = {
  id: string;
  userId: string;
  planId?: string;
  subscriptionId?: string;
  amount: string;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED';
  provider?: string;
  providerTransactionId?: string;
  checkoutUrl?: string;
  createdAt: string;
  updatedAt: string;
};

@Injectable()
export class PaymentClientService {
  constructor(private readonly configService: ConfigService) {}

  createPayment(input: CreatePaymentInput) {
    return this.request<PaymentResponse>('/payments', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  findPayment(paymentId: string) {
    return this.request<PaymentResponse>(`/payments/${paymentId}`);
  }

  findUserPayments(userId: string) {
    return this.request<PaymentResponse[]>(`/users/${userId}/payments`);
  }

  markPaid(paymentId: string, providerTransactionId?: string) {
    return this.request<PaymentResponse>(
      `/internal/payments/${paymentId}/mark-paid`,
      {
        method: 'PATCH',
        body: JSON.stringify({ providerTransactionId }),
      },
    );
  }

  private async request<T>(path: string, init: RequestInit = {}) {
    const baseUrl = this.configService.get<string>('paymentService.baseUrl');
    const token = this.configService.get<string>('paymentService.token');

    if (!baseUrl || !token) {
      throw new InternalServerErrorException(
        'Payment service configuration is missing',
      );
    }

    const response = await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        'content-type': 'application/json',
        'x-internal-service-token': token,
        ...init.headers,
      },
    });

    if (!response.ok) {
      throw new BadGatewayException('Payment service request failed');
    }

    return (await response.json()) as T;
  }
}
