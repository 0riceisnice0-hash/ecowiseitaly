# Current site handover

## Objective and source of truth

Ecowise Italy is being moved from Hello Elementor/Elementor Pro to the custom `ecowise-custom` WordPress theme. The visual and behavioral reference is the public site captured on 21 July 2026. The content and media recovery source is the Updraft-style backup created the same day.

The immediate compatibility contract is:

- 35 URLs listed by WordPress core sitemaps remain indexable.
- The linked date archive `/2024/09/22/` remains available even though it is not in the sitemap.
- `/gateways/` retains its established spelling.
- `/home/` continues to resolve to `/`.
- Existing HTTP and `www` variants canonicalize to HTTPS non-`www`.
- Titles, content, images, links, archives, feeds and the current header/footer presentation remain recognizable and stable.

The 35-route sitemap contract is in `audit/indexed-routes.json`; the 36-route captured contract, including the date archive, is in `audit/captured-routes.json`. Supporting source inventories are in `audit/source/`.

## Current release

The current theme is version 1.0.11. The deterministic handoff archive is `ecowise-custom-theme-2026-07-22-v15.zip`: 727 verified theme files, 25,196,831 bytes, SHA-256 `E2C504FF3DEB0DF34C95EC323F92D9FBCC542B25801540CDA5AB9C2B215C26D2`. Its machine-readable contract is `release/theme-package.json`. Rebuild future archives with `python3 tools/package-theme.py <output.zip>` and use the checksum printed by the command; do not manually re-zip the directory. The packager normalizes approved text-file line endings and writes a fixed stored-ZIP structure so the same source produces the same archive on Windows and Linux.

## What is implemented

The final package source was also activated in a disposable WordPress 6.8.6 installation backed by MariaDB 11.4.12 and the substantive `wp_` database from the supplied backup. All legacy plugins were absent/deactivated, all 1,950 upload files were restored, both captured form contracts and native redirects passed, and WordPress produced no debug log during the complete route and interaction test suite.

The theme has two front-end paths:

1. The fidelity renderer serves reviewed static HTML documents for 36 known public routes. Canonicals were repaired to absolute production URLs, mirror query-hash artifacts were removed, captured analytics was disabled, and required CSS/JS/font files—including the static PDF viewer and 84 on-demand interaction chunks—were vendored beneath the custom theme. Public photographs continue to resolve from the restored WordPress uploads directory.
2. Native PHP templates handle unmapped pages, future posts, search, 404s and other normal WordPress requests. They do not call Elementor or ACF.

Logged-in users and previews bypass fidelity snapshots so editors can inspect the native WordPress result. Admin, REST, AJAX, feeds and sitemaps are never intercepted.

Forms inside fidelity documents are intercepted in the capture phase by `assets/js/fidelity.js`, which suppresses the dormant captured Elementor handler and sends exactly one request to a nonce-protected, rate-limited WordPress handler in `inc/forms.php`. The renderer also adds a nonce-protected native POST action and hidden fields; without JavaScript, WordPress redirects back to the source form with an accessible success/error result. Captured routing is preserved: contact form `68574d28` defaults to `adamecorose@gmail.com`, while newsletter form `1b3fffa7` defaults to `saqibbalii099@gmail.com`. The `ecowise_form_recipient` filter receives the default recipient, form type and sanitized fields when production needs an explicit override. Fidelity responses are private-cacheable so a shared cache cannot leak an anonymous snapshot into an editor session; form-result responses are always private and `no-store`.

The four archive captures intentionally retain 20 unique Facebook post embeds, the contact page retains its Google map, and two travel pages retain eight historical web.archive.org airline links. These are external content dependencies and should be permitted by the production content-security policy or reviewed before launch. Captured Google Tag Manager and Microsoft Clarity execution is removed by the snapshot compiler.

The compiler also repairs the six inherited `#` footer placeholders to their existing school-program routes and corrects two mismatched homepage service-card CTAs (team building and mindfulness). These changes affect no styling or sitemap membership, but restore accurate customer navigation.

The captured document outline is repaired deterministically: every one of the 36 fidelity routes has exactly one H1, the homepage hero is the homepage H1, and the repeated headings on the conflict-resolution and team-building pages are semantic H2s. The two demoted headings retain the captured H1 typography through widget-local responsive custom properties, so the accessibility/SEO correction does not change their measured layout.

The fidelity documents now also expose a complete structural and action layer without altering layout: the inherited skip link resolves to a unique main landmark on every route; header/footer landmarks and six repeated navigation regions are named; all image-only links have accessible names; 96 Facebook/PDF frames have titles; six YouTube widgets and four hosted videos have direct fallbacks; and the contact email, telephone and telephone field use native customer-action semantics. Known logo, author and post-thumbnail images received authoritative alt text. Uncertain documentary/gallery images were not given invented descriptions; their link actions are named independently.

## Backup facts that matter

The supplied backup has two WordPress table prefixes:

- `wp_*` is the substantive legacy site: 30 published pages, three published posts, the front page, news page, menus, 413 attachments and all Elementor source data.
- `qnj_*` is a small fresh SiteGround installation and is not the content source for this reconstruction.

The WordPress configuration used for restoration must point `$table_prefix` to `wp_`, or the content will appear missing. The backup contains 1,950 upload files (approximately 348 MB); all 512 upload paths referenced by published content were present during analysis.

The database has no meaningful Yoast, Rank Math, AIOSEO or SEOPress metadata. Historical SEO coverage is therefore primarily the exact permalink/content inventory and WordPress core sitemap, not plugin-authored descriptions or schema.

## Staging deployment

1. Create a disposable staging WordPress installation using the production PHP and WordPress versions. Install at the domain root with the standard `/wp-content/` path; the fidelity documents intentionally use production-style root-relative asset URLs.
2. Restore the supplied database and `uploads` archive. Confirm `$table_prefix = 'wp_';` before opening wp-admin. The restored `home` and `siteurl` values point to production, so set staging explicitly before the first web request: either define `WP_HOME` and `WP_SITEURL` as the staging URL in `wp-config.php`, or run `wp option update home https://staging-host.example` and `wp option update siteurl https://staging-host.example` from the WordPress root.
3. Record the original theme and exact `active_plugins` value before changing them. Activate `ecowise-custom`, then deactivate the 11 recovered legacy plugins listed under **Plugin disposition and rollback**. The fidelity assets required by visitors are committed inside this theme.
4. Copy `wp-content/themes/ecowise-custom` from this repository and activate it.
5. In Settings → Reading, confirm front page ID 6 and posts page ID 2448 (`/news/`).
6. In Settings → Permalinks, use `/%postname%/` and save once.
7. Assign the recovered primary/footer menus if WordPress did not retain their locations.
8. Confirm the two captured form recipients above are still monitored, or configure the `ecowise_form_recipient` filter with an explicit per-form routing policy.
9. Configure a real SMTP/mail transport and submit the contact and post forms.
10. From this repository, run `ECOWISE_EXPECTED_URL=https://staging-host.example wp --path=/absolute/wordpress/path eval-file tools/validate-wordpress.php` to verify the actual database, options, plugin state and all restored upload files.
11. Purge caches, then run the validation checklist below before exposing staging to search engines.

## Plugin disposition and rollback

The substantive backup had these 11 plugins active: Duplicate Page, Elementor Pro, Elementor, ElementsKit Lite, Google Site Kit, Microsoft Clarity, PDF.js Viewer for Elementor, PHP Console, Skyboot Custom Icons for Elementor, UpdraftPlus and WP File Manager. Deactivate all 11 for the custom-theme launch. Add only a reviewed SMTP, caching or security plugin afterward when operationally required; do not reactivate a page builder for public rendering.

Before cutover, save `wp option get template`, `wp option get stylesheet` and `wp option get active_plugins --format=json`, plus a database dump and complete `wp-content` copy. To roll back the legacy presentation, restore those exact option values (or reactivate Hello Elementor and the captured 11-plugin set), flush rewrites, and purge server/CDN caches. Switching themes alone is not a complete rollback because the former pages require Elementor, Elementor Pro, ElementsKit and their supporting assets.

## Validation checklist

- Run `node tools/validate-deployment.mjs https://staging-host.example` from this repository. It automates the route, title, canonical, sitemap, native endpoint, redirect and HEAD checks below; resolve every failure before launch.
- Run the WP-CLI preflight from staging and require a pass for the substantive `wp_` database, Ecowise Custom activation, Reading/permalink options, legacy-plugin denylist and all 1,950 uploads.
- Request all 36 entries in `audit/indexed-routes.json`; expect 200 and one correct absolute canonical each.
- Request `/wp-sitemap.xml` and its four child maps; confirm the same 35 indexed content URLs.
- Add a clean permanent redirect from `/sitemap.xml` to `/wp-sitemap.xml`; the stored legacy rewrite is malformed.
- Check `/feed/`, post feeds, REST and wp-admin to confirm the fidelity renderer does not intercept them.
- Compare `/`, `/for-schools/`, one nested school page, `/gateways/`, `/contact-us/`, `/news/` and a post at 1440, 1024, 768 and 390 CSS pixels.
- Verify desktop split navigation, sticky/overlay header behavior, mobile menu, hero slideshow, card hover/focus, galleries, video/PDF fallbacks and testimonial controls.
- Submit every form and verify success, inbox delivery, reply-to address, failure messaging and rate limiting.
- Crawl for 404 assets. Visible media should resolve under `/wp-content/uploads/`; runtime CSS/JS/fonts should resolve under the custom theme's `assets/fidelity/` directory.
- Confirm canonical redirects for HTTP, `www`, `/home/` and any uppercase/trailing-slash variants handled by the server.
- Keep staging `noindex` until visual and mail checks pass; remove it before launch.

## Known source-site defects

The reference site itself has no meta descriptions or JSON-LD. The rebuild repairs its four missing archive canonicals, homepage/duplicate-H1 outline defects, broken skip-link targets, unnamed customer actions, untitled embeds and six inherited footer placeholders without changing presentation. Meta descriptions, social cards and structured data remain a deliberate editorial SEO phase because adding them would require approved copy, schema choices and share imagery that do not exist on the reference site.

## Safe rollback

Keep a database dump, complete `wp-content` copy, active theme values and exact plugin list immediately before activation. Follow **Plugin disposition and rollback** above; restoring the old theme without its plugins is insufficient. Theme activation itself performs no database writes or destructive migration.
