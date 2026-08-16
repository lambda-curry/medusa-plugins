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
Registry: always pass `--registry=https://registry.npmjs.org` on `npm whoami`, `npm view`, and `npm publish` (including dry-run).

```text
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
4. Require a clean plugin worktree before comparing history (pack/publish use the working tree):

```bash
git status --short -- plugins/braintree-payment
```

**Fail** if any staged, unstaged, or untracked paths appear under `plugins/braintree-payment`. Summarize the dirty paths and stop. (Do not publish undocumented local edits.)

5. Resolve `PREV_COMMIT` as the previous *release* boundary — the commit that **added** `PREV_VERSION` to `package.json`, not a later commit that removed it when bumping to `LOCAL_VERSION`. Fall back to the commit that introduced the `## PREV_VERSION` changelog header.

```bash
# Prefer the commit that introduced PREV_VERSION in package.json (addition only).
PREV_COMMIT=$(
  git log -S"\"version\": \"$PREV_VERSION\"" --diff-filter=A --format=%H -- \
    plugins/braintree-payment/package.json | tail -1
)

# Fallback: commit that introduced the PREV_VERSION changelog header.
if [ -z "$PREV_COMMIT" ]; then
  PREV_COMMIT=$(
    git log -S"## $PREV_VERSION" --diff-filter=A --format=%H -- \
      plugins/braintree-payment/CHANGELOG.md | tail -1
  )
fi

if [ -z "$PREV_COMMIT" ]; then
  echo "Could not resolve PREV_COMMIT for $PREV_VERSION" >&2
  exit 1
fi

git log --oneline "${PREV_COMMIT}..HEAD" -- plugins/braintree-payment
git diff "${PREV_COMMIT}..HEAD" --stat -- plugins/braintree-payment
```

6. Compare those commits/diffs to the `## LOCAL_VERSION` changelog section.
   - User-facing fixes, improvements, breaking changes, and docs updates must appear.
   - Ignore noise: lockfile-only, formatting-only, or leftover `.tgz` artifacts unless the release intentionally changes packaging.
7. **Fail** if the top section is missing, mismatched, empty when there are meaningful changes, or omits notable behavior/API/packaging changes. Summarize the gaps and stop.

## Gate 2 — Version is bumped

**Release policy**

- Stable `LOCAL_VERSION` (no `-` prerelease id): compare against the highest **stable** published version. Publish without a custom dist-tag (npm default `latest`).
- Prerelease `LOCAL_VERSION` (contains `-`, e.g. `0.2.0-next`): compare against the highest published version in the **same prerelease channel** (same suffix after `-`). Publish with `--tag <channel>` (e.g. `--tag next`). Never let a prerelease update `latest`.

1. Read local version:

```bash
node -p "require('./plugins/braintree-payment/package.json').version"
```

2. Read the full published version list (not the `latest` dist-tag alone):

```bash
npm view @lambdacurry/medusa-payment-braintree versions --json \
  --registry=https://registry.npmjs.org
```

3. Filter that list per the release policy above, take the highest allowed published version as `HIGHEST_ALLOWED`, and **fail** unless `LOCAL_VERSION` is strictly greater (semver).
4. Exact-version guard (separate from the highest-version check):

```bash
npm view "@lambdacurry/medusa-payment-braintree@$LOCAL_VERSION" version \
  --registry=https://registry.npmjs.org
```

**Fail** if that command returns `LOCAL_VERSION` (already published).
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

`prepublishOnly` builds via `npx medusa plugin:build`, but **`npm pack` does not run `prepublishOnly`**. Build explicitly before packing.

From repo root:

```bash
yarn workspace @lambdacurry/medusa-payment-braintree build
npm pack ./plugins/braintree-payment
```

Confirm the tarball is created and contains the built `.medusa/server` output that `files` includes:

```bash
tar -tzf lambdacurry-medusa-payment-braintree-*.tgz | head -50
tar -tzf lambdacurry-medusa-payment-braintree-*.tgz | grep -E '\.medusa/server/' | head -20
```

**Fail** if `.medusa/server` paths are missing from the tarball.

Report the tarball name (e.g. `lambdacurry-medusa-payment-braintree-X.Y.Z.tgz`).

Do not commit generated `.tgz` files.

## Gate 6 — Publish

Confirm npm auth before publishing:

```bash
npm whoami --registry=https://registry.npmjs.org
```

If unauthenticated, stop and tell the user to log in (`npm login` or configure a token). Do not publish anonymously.

Publish the package directory (matches CI in `.github/workflows/publish.yml`). For prereleases, include `--tag <channel>` per the release policy:

```bash
# Stable example:
npm publish ./plugins/braintree-payment --access public \
  --registry=https://registry.npmjs.org

# Prerelease example (0.2.0-next → tag next):
npm publish ./plugins/braintree-payment --access public --tag next \
  --registry=https://registry.npmjs.org
```

Verify the **exact** version (not the `latest` dist-tag), with `--prefer-online` and bounded retries for registry propagation:

```bash
LOCAL_VERSION="$(node -p "require('./plugins/braintree-payment/package.json').version")"
for i in 1 2 3 4 5; do
  PUBLISHED="$(
    npm view "@lambdacurry/medusa-payment-braintree@$LOCAL_VERSION" version \
      --registry=https://registry.npmjs.org \
      --prefer-online 2>/dev/null || true
  )"
  if [ "$PUBLISHED" = "$LOCAL_VERSION" ]; then
    echo "Verified $LOCAL_VERSION on npm"
    break
  fi
  if [ "$i" -eq 5 ]; then
    echo "Timed out waiting for $LOCAL_VERSION on npm (last: ${PUBLISHED:-none})" >&2
    exit 1
  fi
  sleep $((i * 3))
done
```

## Done report

After success, report:

- Published version and dist-tag used
- npm package URL: `https://www.npmjs.com/package/@lambdacurry/medusa-payment-braintree`
- Whether changelog/version gates were clean
- Typecheck/lint/pack/publish results
- Reminder: merging to `main` also triggers CI publish; if this version is already on npm, CI will skip it

## Dry run

If the user asks for a dry run, complete Gates 1–5 only, then run:

```bash
npm publish ./plugins/braintree-payment --access public --dry-run \
  --registry=https://registry.npmjs.org
```

For prerelease dry-runs, include the same `--tag <channel>` you would use for a real publish.

Do not publish for real.
