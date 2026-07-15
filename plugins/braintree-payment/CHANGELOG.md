# Changelog

## 0.1.2

### Fixes

- Surface Braintree processor decline / settlement decline details on refund and void failures via `throwOnBraintreeFailure` (including cases where `success` is true but status is declined).

### Improvements

- Enforce sandbox-only `TEST_FORCE_SETTLED` — settle-before-refund is ignored with a warning outside `environment: sandbox`.
- Tighten refund path typing (guard missing transaction id).

### Documentation

- Document `BRAINTREE_LOGGING`, sandbox requirement for `TEST_FORCE_SETTLED`, and upgrading notes for explicit logging configuration.
