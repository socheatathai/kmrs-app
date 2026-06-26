CREATE TABLE payments (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  plan_id UUID,
  subscription_id UUID,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL,
  provider TEXT,
  provider_transaction_id TEXT,
  checkout_url TEXT,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_provider_transaction_id ON payments(provider_transaction_id);

CREATE TABLE payment_events (
  id UUID PRIMARY KEY,
  payment_id UUID NOT NULL REFERENCES payments(id),
  event_type TEXT NOT NULL,
  payload TEXT,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX idx_payment_events_payment_id ON payment_events(payment_id);
