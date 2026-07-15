# Changelog

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
