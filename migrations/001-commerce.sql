-- Apply only to a dedicated TEST database for this scaffold. Not run automatically.
BEGIN;
CREATE TABLE IF NOT EXISTS commerce_orders (
  id uuid PRIMARY KEY,
  provider text NOT NULL,
  fingerprint text NOT NULL,
  plan jsonb NOT NULL,
  total integer NOT NULL CHECK (total > 0),
  currency text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid','failed','expired')),
  session_id text,
  session jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (provider, session_id)
);
CREATE TABLE IF NOT EXISTS commerce_payment_events (
  provider text NOT NULL,
  event_id text NOT NULL,
  order_id uuid NOT NULL REFERENCES commerce_orders(id),
  status text NOT NULL CHECK (status IN ('paid','failed','expired')),
  received_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (provider, event_id)
);
CREATE TABLE IF NOT EXISTS commerce_fulfillment_outbox (
  order_id uuid PRIMARY KEY REFERENCES commerce_orders(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz
);
COMMIT;
