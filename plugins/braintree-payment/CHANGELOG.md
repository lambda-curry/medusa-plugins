# Changelog

## 0.1.2

### Fixes

- Surface Braintree processor decline / settlement decline details on refund and void failures via `throwOnBraintreeFailure` (including cases where `success` is true but status is declined).
- Fix Yarn 4 packaging by publishing `.medusa/server/**/*` instead of a bare directory name.

### Improvements

- Gate refund path tracing (`[Braintree refund]` JSON logs) behind provider `logging` (same flag as `logDebug` / `logErrorDetail`).
- Enforce sandbox-only `TEST_FORCE_SETTLED` — settle-before-refund is ignored with a warning outside `environment: sandbox`.
- Tighten refund path typing (guard missing transaction id; avoid casting session data for authorize debug logs).

### Documentation

- Document `BRAINTREE_LOGGING`, sandbox requirement for `TEST_FORCE_SETTLED`, and upgrading notes for explicit logging configuration.
