# AI agent rulebook

## Mission

Maintain Ecowise Italy as a fast, accessible, code-driven WordPress site that preserves the public URL structure, content meaning and recognizable visual identity of the reference site.

## Non-negotiable constraints

- Do not introduce Elementor, ACF, another page builder, or builder-generated shortcodes.
- Do not change an existing public permalink without an explicit redirect and an update to the route audit.
- Do not delete indexed pages, posts, media, metadata, schema or sitemap coverage merely because the content appears duplicated.
- Treat `https://ecowiseitaly.com/` and the committed route inventory as the compatibility contract.
- Keep presentation in the theme, content in WordPress, and migration-only logic in clearly named tools or admin commands.
- Preserve user changes in the database. Never make activation destructive.
- Escape output, sanitize input, use nonces for mutations, and keep WordPress capability checks on administrative actions.
- Prefer semantic HTML, keyboard-operable controls, visible focus, useful alternative text and reduced-motion support.
- Do not add external trackers, fonts or third-party scripts without documenting purpose, consent implications and removal steps.

## Architecture rules

- Theme code lives in `wp-content/themes/ecowise-custom`.
- `inc/` contains isolated PHP concerns; templates should remain small and readable.
- `template-parts/` contains reusable view fragments.
- `assets/css/site.css` is the source of global styling. Use existing custom properties before adding colors or spacing values.
- `assets/js/site.js` is progressive enhancement only. Core navigation and content must remain usable without JavaScript.
- `snapshots/` is a fidelity compatibility layer, not an authoring system. Do not hand-edit a snapshot when the source can be regenerated or a native template can replace it safely.
- Any new route-specific behavior must have a native WordPress fallback.

## SEO rules

- Exactly one indexable canonical URL per content item.
- Preserve titles, descriptions, heading hierarchy, image alt text, internal links and structured data during template migrations.
- Keep WordPress core sitemap compatibility. If an SEO plugin owns sitemap/canonical output, avoid duplicate theme output.
- Redirect removed aliases with permanent redirects and no chains.
- After route changes, compare status, canonical, title, description and inclusion in the sitemap against `audit/indexed-routes.json`.

## Quality gate

Before committing, run `node tools/validate-theme.mjs .`, verify PHP syntax, inspect changed templates, test desktop and mobile navigation when presentation or interaction code changes, and update the relevant documentation. The same static validation, PHP lint and deterministic package build run in GitHub Actions on every push and pull request. Before a staging or production cutover, run both `wp eval-file tools/validate-wordpress.php` against the restored WordPress instance and `node tools/validate-deployment.mjs <base-url>` against its public HTTP surface. Dated work belongs only in `PROGRESS.md`.

## Documentation ownership

- `ai.md`: durable agent rules only.
- `HANDOVER.md`: current context, deployment state and operational handover.
- `STYLE.md`: site-wide design system and responsive rules.
- `HOMEPAGE.md`: homepage architecture and behavior.
- `PROGRESS.md`: dated work log.
