# Payment backend: prepared, not open for sales

> RETIRED FOR SITE A PART A (2026-09-23): This is a historical test-scaffold note, not current setup guidance. `/api/checkout` and `/api/payments/stripe/webhook` now return HTTP 410 for every request; no storefront, cart, or payment UI is active. Do not follow the setup steps below for the educational site or set payment variables in its environment. Historical test code and records are preserved only for audit/migration review.

This is a **test-only foundation**. Live Stripe keys are rejected. The storefront still has placeholder prices and a disabled checkout button. No credentials, database, Stripe account, webhook, or hosting settings were provisioned. No actual payment has been made.

## Architecture

`POST /api/checkout` → validated cart → server-owned catalog → persisted order → selected payment adapter → hosted checkout URL.

`POST /api/payments/stripe/webhook` → raw-body signature verification → normalized payment event → locked order + deduplicated event + fulfillment outbox in one SQL transaction.

- `netlify/functions/lib/commerce/types.ts`: shared provider/session/event contract.
- `stripe.ts`: first adapter, using the official Stripe SDK. Card entry stays on Stripe, never on this server.
- `config.ts`: enabled-provider registry; test authorization, fixed return origin, sanitized errors.
- `catalog.ts`: server-only SKU prices, **intentionally empty**. Browser totals/prices are rejected.
- `orders.ts`: PostgreSQL persistence, row locks, stable retry keys, monotonic paid status, transactional outbox.
- `migrations/001-commerce.sql`: orders, deduplicated payment events, fulfillment outbox. Apply manually to a dedicated test database.

No automatic processor failover: a timeout may mean the original payment request succeeded. Retries use the same order ID and processor. A reused key with a different cart gets 409. Uncertain intents older than 20 hours are blocked for review before the processor can forget the key. Returning from checkout never marks an order paid.

## Prepare a sandbox

Configure these **server-only** variables using Netlify's Functions scope (or an ignored local environment file). Never use `VITE_` variables for secrets or paste keys in chat.

| Variable | Value/purpose |
| --- | --- |
| `PAYMENTS_MODE` | `disabled` by default; explicitly set `test` for sandbox work. No live mode is implemented. |
| `PAYMENT_PROVIDERS` | `stripe` initially; comma-separated adapter IDs after additional adapters are built. |
| `STRIPE_SECRET_KEY` | Stripe test secret beginning `sk_test_`. |
| `STRIPE_WEBHOOK_SECRET` | Matching test endpoint/CLI signing secret beginning `whsec_`. |
| `COMMERCE_DATABASE_URL` | Pooled PostgreSQL connection URL for a dedicated test database, with verified TLS. Use least-privilege credentials. |
| `COMMERCE_SITE_ORIGIN` | Exact trusted origin, e.g. `https://shop.example.com`; no trailing slash/path. Localhost HTTP is allowed for local tests. |
| `COMMERCE_TEST_TOKEN` | Random secret of at least 32 bytes for server-side sandbox requests. Never put it in the browser. |

1. Create the dedicated test database and apply the SQL migration. Use a distinct database for each test/deploy environment; do not point previews at production orders.
2. Add clearly named test SKUs to the server catalog using integer cents and `enabled: true`. Do not copy the UI's `$XX.XX` values. Do not invent final product prices.
3. Configure the variables above and a Stripe **test** webhook pointing to `/api/payments/stripe/webhook`.
4. Subscribe to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, and `checkout.session.expired`. Card-only checkout is enabled initially; delayed-event handling is prepared for later methods.
5. From a trusted development client, POST JSON with `Authorization: Bearer <test token>`, `Content-Type: application/json`, and `Idempotency-Key: <new UUID v4>`:

```json
{"provider":"stripe","items":[{"sku":"your-test-sku","quantity":1}]}
```

Reuse the key when retrying the same request. Use a new key for a changed cart. The response contains `checkoutUrl`, `orderId`, `expiresAt`, and `mode: "test"`. No public order lookup endpoint is exposed.

6. Complete sandbox success, cancellation, decline, expiration, webhook replay, and timeout/retry scenarios. Verify exactly one order/event/outbox record where appropriate. A canceled redirect leaves an order pending until its session expires; it is not proof of failure or payment.

## Add another processor

Implement `PaymentProvider` with hosted-session creation, stable idempotency, and provider-native signature verification. Normalize its notifications into `PaymentEvent`; add its factory to `config.ts` and a dedicated webhook route. Use the same SQL repository and validation. Enable its ID in `PAYMENT_PROVIDERS`. Do not share webhook secrets or turn one processor's failure into an automatic charge attempt with another.

Only Stripe is implemented today. Apple Pay and Google Pay are payment methods, not additional processor adapters; their availability/settings are a separate activation decision.

## Verification and launch work remaining

- `npm run test:payments`: offline tests for validation, limits, tampering, signatures/replays, unpaid completion, event normalization, state rules, request construction, and disabled endpoints. No external Stripe requests.
- `npm run test:payments:db`: optional integration suite requiring explicit `COMMERCE_TEST_DATABASE_URL` and an already-migrated **dedicated test database**. It creates and removes only its own test rows. Not run without a supplied database.
- Database concurrency/transaction behavior and real Stripe sandbox round trips still require integration verification. Unit tests do not establish production readiness.
- Before public checkout: confirm processor approval for the exact catalog; finalize product eligibility, variants, prices, inventory, shipping, taxes, and policies. Complete database deployment/retention/backups, session/CSRF controls and rate limiting, browser checkout wiring, order confirmation/status authorization, reconciliation, operational alerting, refunds/disputes, and idempotent fulfillment/email workers.
- The outbox currently records a paid-order handoff but has **no fulfillment worker**. No shipping, emails, or customer notifications are sent. No address collection, shipping fees, discounts, tax calculation, subscriptions, refunds, or live-mode switch are enabled.
- `npm audit` reports six high findings in the existing Netlify/image-tooling dependency chain (`sharp`, `ipx` and Netlify wrappers), with no automatic fix reported. Review before production activation; do not run a blind force upgrade.

## Implementation references

- [Stripe Checkout Sessions](https://docs.stripe.com/api/checkout/sessions/create)
- [Stripe signature verification](https://docs.stripe.com/webhooks/signature)
- [Stripe retry/idempotency behavior](https://docs.stripe.com/api/idempotent_requests)
- [PostgreSQL client transactions](https://node-postgres.com/features/transactions)
- [Netlify server-side environment variables](https://docs.netlify.com/build/functions/environment-variables/)
