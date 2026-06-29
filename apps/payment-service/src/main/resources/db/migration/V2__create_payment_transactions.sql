CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY,
  payment_id UUID NOT NULL REFERENCES payments(id),
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL,
  provider TEXT NOT NULL,
  provider_transaction_id TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_payment_transactions_payment_id ON payment_transactions(payment_id);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_provider_transaction_id
  ON payment_transactions(provider_transaction_id);
