# Changelog

## 0.2.0-next

### Fixes

- Keep refund/void history on `braintreeRefunds[]` (same key as 0.1.8). Read leftover `braintreeRefund` arrays from the 0.2.0-next regression and migrate them onto `braintreeRefunds` on the next refund so both keys cannot drift.

### Improvements

- Add `disableVoidTransactions` option: when enabled, refunds never void. Only `settled`/`settling` may be refunded; `authorized`/`submitted_for_settlement` throw `INVALID_DATA` with “cannot be refunded right now”; other statuses throw `NOT_FOUND` with “cannot be refunded” (late requirement for future partial order refunds and order edits).
- Move sandbox settle-before-refund from reading `process.env.TEST_FORCE_SETTLED` inside the provider to a `testForceSettled` option (wire `TEST_FORCE_SETTLED` in `medusa-config` if you still use the env var).

## 0.1.8

### Fixes

- Preserve the original Braintree transaction on refund/void instead of overwriting payment data with the refund or void transaction.
- Track refund/void history as `braintreeRefunds[]` (supports multiple partial refunds) instead of a single `braintreeRefund` field.
- Guard non-array `braintreeRefunds` values when appending to refund history.
- Include transaction status in the error when a refund is rejected for an unsupported status.

### Improvements

- Assign `init()` return value to `this.gateway` and tighten `validateOptions` typing with `keyof BraintreeOptions`.

## 0.1.5

### Fixes

- Format Braintree validation errors with a `BT:` prefix and optional attribute (e.g. `BT: amount: Refund amount is too large. (91517)`).
- Publish `.medusa/server/**/*` so Yarn 4 packages include built plugin files correctly.

### Improvements

- Remove dedicated `[Braintree refund]` JSON path tracing; refund debugging remains available via provider `logging` (`logDebug` / `logErrorDetail`).
- Bump Medusa peer dependencies to `2.15.2` and `braintree` to `^3.38.0`.
- Expand import-provider tests for processor declines and validation errors on void/refund.

## 0.1.2

### Fixes

- Surface Braintree processor decline / settlement decline details on refund and void failures via `throwOnBraintreeFailure` (including cases where `success` is true but status is declined).

### Improvements

- Enforce sandbox-only `TEST_FORCE_SETTLED` — settle-before-refund is ignored with a warning outside `environment: sandbox`.
- Tighten refund path typing (guard missing transaction id).

### Documentation

- Document `BRAINTREE_LOGGING`, sandbox requirement for `TEST_FORCE_SETTLED`, and upgrading notes for explicit logging configuration.
