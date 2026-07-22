# Ecowise Italy custom WordPress theme

This repository contains the code-driven replacement for the former Elementor site at `ecowiseitaly.com`.

The implementation has two deliberate layers:

1. **Fidelity snapshots** preserve the exact public HTML for the current indexed routes while the site is moved off Elementor.
2. **Native templates** render archives, search, errors and any new WordPress content without Elementor or ACF.

The WordPress database and uploads are deployment inputs and are intentionally not stored in Git. See `HANDOVER.md` for restoration and activation instructions.

## Theme location

`wp-content/themes/ecowise-custom`

## First deployment

1. Restore the supplied database and uploads backup to staging.
2. Copy this repository's `wp-content/themes/ecowise-custom` directory into WordPress.
3. Activate **Ecowise Custom**.
4. Save **Settings → Permalinks** once.
5. Validate the URL inventory in `audit/indexed-routes.json` and the checklist in `HANDOVER.md` before changing DNS or production files.

## Validation

Run the repository's complete static contract check from the repository root:

```sh
node tools/validate-theme.mjs .
```

The check verifies the captured and indexed route inventories, PHP syntax when PHP is available, internal links, referenced uploads, vendored runtime assets, canonical repairs and external embeds. GitHub Actions runs it with PHP 8.3, plus a separate lint of every theme PHP file, on every push and pull request.

After deploying to staging or production, run the HTTP contract check:

```sh
node tools/validate-deployment.mjs https://staging.example.test
```

It verifies all 36 public routes, exact sitemap membership, titles, production canonicals, native REST/feed/search/robots responses, permanent legacy redirects and HEAD handling. It makes read-only requests and has no package dependencies.

Validate the restored WordPress database, options, active theme/plugins and all 1,950 uploads through WP-CLI:

```sh
ECOWISE_EXPECTED_URL=https://staging.example.test wp eval-file tools/validate-wordpress.php
```

Build a deterministic, self-verifying release ZIP with Python 3:

```sh
python3 tools/package-theme.py dist/ecowise-custom-theme.zip
```

The builder normalizes approved text assets, verifies every archived byte and produces the same ZIP on Windows and Linux. Pass `--check-manifest` to compare the build with `release/theme-package.json`; CI performs two independent builds and requires byte-identical output.
