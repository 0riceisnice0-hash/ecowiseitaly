# Progress log

## 2026-07-22

- Cloned the empty `0riceisnice0-hash/ecowiseitaly` repository and established a code-driven WordPress theme structure.
- Audited the 21 July mirror: 748 fetch records, 36 public HTML routes, 35 sitemap content URLs, 34 REST objects, five sitemap documents and 673 captured assets.
- Audited the live site and verified all 35 sitemap URLs plus the linked date archive return 200.
- Audited the WordPress backup and identified `wp_*` as the substantive dataset and `qnj_*` as a small fresh install.
- Verified 30 published pages, three posts, 14 menu items, 413 attachments, 1,950 upload files and complete published-content media coverage in the backup.
- Recovered exact route hierarchy, including the established `/gateways/` spelling, front page ID 6 and `/news/` posts page.
- Recovered visual tokens, header/footer/template IDs, page-specific CSS sources and recurring component patterns.
- Added `ai.md`, `HANDOVER.md`, `STYLE.md`, `HOMEPAGE.md` and this dated log with separated ownership.
- Built the `ecowise-custom` theme with native setup, navigation, footer, archive, page, post, search/empty and 404 behavior.
- Added a conservative native canonical helper that defers to recognized SEO plugins.
- Generated an exact-route fidelity layer for all 36 captured public documents.
- Repaired snapshot canonicals, removed mirror query-hash/oEmbed/shortlink artifacts and prevented replay of captured Google Tag Manager.
- Vendored 126 required CSS, JavaScript and font/runtime assets (about 4.6 MB) into the custom theme so inactive Elementor/Hello files are not filesystem dependencies.
- Kept photographs and documents in standard `/wp-content/uploads/` paths so the restored media library remains authoritative.
- Added a nonce-protected, rate-limited, builder-independent WordPress mail handler for forms inside fidelity documents.
- Added machine-readable route and source audit artifacts under `audit/` and a repeatable snapshot build tool under `tools/`.
- Browser-compared the live and reconstructed homepage at 1440×900 and 390×844; measured header, hero, headline, introduction and primary CTA geometry/styles matched exactly at both sizes.
- Browser-compared a representative nested school route; title, canonical, H1 text/geometry and image loading matched the live route, and the local contact page reported no console errors.
- Passed PHP 8.3 syntax lint across all 16 theme PHP files and passed the custom 36-route/35-indexed-route validation gate.
