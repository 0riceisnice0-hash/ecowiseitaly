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

## What is implemented

The theme has two front-end paths:

1. The fidelity renderer serves reviewed static HTML documents for 36 known public routes. Canonicals were repaired to absolute production URLs, mirror query-hash artifacts were removed, captured analytics was disabled, and required CSS/JS/font files—including the static PDF viewer and 84 on-demand interaction chunks—were vendored beneath the custom theme. Public photographs continue to resolve from the restored WordPress uploads directory.
2. Native PHP templates handle unmapped pages, future posts, search, 404s and other normal WordPress requests. They do not call Elementor or ACF.

Logged-in users and previews bypass fidelity snapshots so editors can inspect the native WordPress result. Admin, REST, AJAX, feeds and sitemaps are never intercepted.

Forms inside fidelity documents are intercepted by `assets/js/fidelity.js` and sent to a nonce-protected, rate-limited WordPress handler in `inc/forms.php`. The renderer also adds a nonce-protected native POST action and hidden fields so submission still reaches the handler when JavaScript is blocked. The recipient defaults to the WordPress administration email and can be changed through the `ecowise_form_recipient` filter.

The four archive captures intentionally retain 20 unique Facebook post embeds, the contact page retains its Google map, and two travel pages retain eight historical web.archive.org airline links. These are external content dependencies and should be permitted by the production content-security policy or reviewed before launch. Captured Google Tag Manager and Microsoft Clarity execution is removed by the snapshot compiler.

## Backup facts that matter

The supplied backup has two WordPress table prefixes:

- `wp_*` is the substantive legacy site: 30 published pages, three published posts, the front page, news page, menus, 413 attachments and all Elementor source data.
- `qnj_*` is a small fresh SiteGround installation and is not the content source for this reconstruction.

The WordPress configuration used for restoration must point `$table_prefix` to `wp_`, or the content will appear missing. The backup contains 1,950 upload files (approximately 348 MB); all 512 upload paths referenced by published content were present during analysis.

The database has no meaningful Yoast, Rank Math, AIOSEO or SEOPress metadata. Historical SEO coverage is therefore primarily the exact permalink/content inventory and WordPress core sitemap, not plugin-authored descriptions or schema.

## Staging deployment

1. Create a disposable staging WordPress installation using the production PHP and WordPress versions.
2. Restore the supplied database and `uploads` archive. Confirm `$table_prefix = 'wp_';` before opening wp-admin.
3. Keep the restored plugin/theme files available for rollback, but deactivate Elementor, Elementor Pro, ElementsKit, Hello Elementor and ACF after activating `ecowise-custom`. The fidelity assets required by visitors are committed inside this theme.
4. Copy `wp-content/themes/ecowise-custom` from this repository and activate it.
5. In Settings → Reading, confirm front page ID 6 and posts page ID 2448 (`/news/`).
6. In Settings → Permalinks, use `/%postname%/` and save once.
7. Assign the recovered primary/footer menus if WordPress did not retain their locations.
8. Set the administration email to the monitored Ecowise inbox or configure the `ecowise_form_recipient` filter.
9. Configure a real SMTP/mail transport and submit the contact and post forms.
10. Purge caches, then run the validation checklist below before exposing staging to search engines.

## Validation checklist

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

The reference site itself has no meta descriptions or JSON-LD, many blank image alt values, missing canonicals on four archive-style routes, two duplicate-H1 school pages and six footer school links pointing to `/`. Fidelity snapshots preserve presentation, but these defects should be corrected deliberately after screenshot parity is signed off. Fixes that change visible layout must not be mixed into fidelity verification.

## Safe rollback

Keep a database dump and complete `wp-content` copy immediately before activation. Rollback is switching to the previous theme and restoring the pre-activation database only if a later migration has changed content. Theme activation itself performs no database writes or destructive migration.
