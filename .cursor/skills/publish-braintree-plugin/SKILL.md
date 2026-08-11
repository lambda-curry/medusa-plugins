---
name: publish-braintree-plugin
description: >-
  Publish @lambdacurry/medusa-payment-braintree to npm. Checks CHANGELOG coverage
  of latest plugin changes, verifies the package version is bumped above the
  published npm version, runs typecheck and Biome lint, then packs and publishes.
  Use when the user asks to publish the Braintree plugin, release medusa-payment-braintree,
  or ship a new Braintree package version.
disable-model-invocation: true
---

# Publish Braintree Plugin

Publish `@lambdacurry/medusa-payment-braintree` from `plugins/braintree-payment`.

**Hard rule:** Do not pack or publish until every gate below passes. If a gate fails, stop, report what is missing, and wait for the user. Do not invent changelog entries or bump versions unless the user explicitly asks you to fix them.

Package root: `plugins/braintree-payment`  
Package name: `@lambdacurry/medusa-payment-braintree`  
Changelog: `plugins/braintree-payment/CHANGELOG.md`

```
Publish Progress:
- [ ] 1. Changelog covers latest plugin changes
- [ ] 2. Version bumped above npm
- [ ] 3. Typecheck passes
- [ ] 4. Lint passes
- [ ] 5. Pack succeeds
- [ ] 6. Publish succeeds
```

## Gate 1 — Changelog covers latest changes

1. Read `plugins/braintree-payment/package.json` and note `version` as `LOCAL_VERSION`.
2. Read `plugins/braintree-payment/CHANGELOG.md`. The topmost `## X.Y.Z` section must equal `LOCAL_VERSION`.
3. Find the previous changelog version header (the next `##` below the top). Call it `PREV_VERSION`.
4. Collect changes since that previous release that touch the plugin:

```bash
# Prefer the commit that last changed package.json version for PREV_VERSION,
# otherwise use the first commit that introduced the PREV_VERSION changelog header.
git log --oneline -- plugins/braintree-payment
git log -p --since="$(git log -1 --format=%cI -S"\"version\": \"$PREV_VERSION\"" -- plugins/braintree-payment/package.json)" -- plugins/braintree-payment
```

Practical check (run from repo root):

```bash
# Commits since PREV_VERSION was set in package.json
PREV_COMMIT=$(git log -1 --format=%H -S"\"version\": \"$PREV_VERSION\"" -- plugins/braintree-payment/package.json)
git log --oneline "${PREV_COMMIT}..HEAD" -- plugins/braintree-payment
git diff "${PREV_COMMIT}..HEAD" --stat -- plugins/braintree-payment
```

5. Compare those commits/diffs to the `## LOCAL_VERSION` changelog section.
   - User-facing fixes, improvements, breaking changes, and docs updates must appear.
   - Ignore noise: lockfile-only, formatting-only, or leftover `.tgz` artifacts unless the release intentionally changes packaging.
6. **Fail** if the top section is missing, mismatched, empty when there are meaningful changes, or omits notable behavior/API/packaging changes. Summarize the gaps and stop.

## Gate 2 — Version is bumped

1. Read local version:

```bash
node -p "require('./plugins/braintree-payment/package.json').version"
```

2. Read published version:

```bash
npm view @lambdacurry/medusa-payment-braintree version
```

3. **Fail** unless `LOCAL_VERSION` is strictly greater than the published version (semver).
4. **Fail** if `npm view @lambdacurry/medusa-payment-braintree@$LOCAL_VERSION version` already returns that version (already published).
5. Confirm `CHANGELOG.md` top section matches `LOCAL_VERSION` (already required by Gate 1).

## Gate 3 — Typecheck

From repo root:

```bash
yarn workspace @lambdacurry/medusa-payment-braintree typecheck
```

**Fail** on any TypeScript error. Do not continue.

## Gate 4 — Lint

Biome is the repo linter/formatter (`biome.json` at repo root). From repo root:

```bash
yarn biome check plugins/braintree-payment/src
```

**Fail** on diagnostics. Do not auto-fix unless the user asks; if they ask, run `yarn biome check --write plugins/braintree-payment/src`, re-run check, then continue.

## Gate 5 — Pack

From repo root:

```bash
npm pack ./plugins/braintree-payment
```

`prepublishOnly` / pack lifecycle builds via `npx medusa plugin:build`. Confirm the tarball is created and that packaged files look right (built `.medusa/server` output is what `files` includes).

Report the tarball name (e.g. `lambdacurry-medusa-payment-braintree-X.Y.Z.tgz`).

Optional inspection:

```bash
tar -tzf lambdacurry-medusa-payment-braintree-*.tgz | head -50
```

Do not commit generated `.tgz` files.

## Gate 6 — Publish

Confirm npm auth before publishing:

```bash
npm whoami
```

If unauthenticated, stop and tell the user to log in (`npm login` or configure a token). Do not publish anonymously.

Then publish the package directory (matches CI in `.github/workflows/publish.yml`):

```bash
npm publish ./plugins/braintree-payment --access public
```

Verify:

```bash
npm view @lambdacurry/medusa-payment-braintree version
```

It must equal `LOCAL_VERSION`.

## Done report

After success, report:

- Published version
- npm package URL: `https://www.npmjs.com/package/@lambdacurry/medusa-payment-braintree`
- Whether changelog/version gates were clean
- Typecheck/lint/pack/publish results
- Reminder: merging to `main` also triggers CI publish; if this version is already on npm, CI will skip it

## Dry run

If the user asks for a dry run, complete Gates 1–5 only, then run:

```bash
npm publish ./plugins/braintree-payment --access public --dry-run
```

Do not publish for real.
