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
- Exhaustively compared all 36 desktop routes against production. Thirty-two normal routes had zero differences across document metadata, body classes, content counts and detailed element geometry/styles; four archive routes required iframe-aware inspection because their nested PDF viewers capture evaluation focus.
- Verified the reconstructed and live mobile menus expose the same control state, navigation order, labels and destinations.
- Removed the last restored-plugin filesystem dependency by vendoring the archive PDF.js viewer and rewriting all four archive routes to the custom-theme copy.
- Restored mirror-rewritten `index.html` navigation links to their canonical production permalinks and added all-snapshot internal-link integrity validation.
- Recovered all 20 original Facebook post embed URLs from the crawl manifest, including their lost query parameters, and removed remaining mirror-local external-domain references.
- Hardened the fidelity renderer so query-string search, feeds, REST, sitemaps, pagination, embeds, robots and trackbacks always remain native WordPress requests instead of falling through to a matching snapshot path.
- Corrected four route audit object IDs from the authoritative backup and taught the snapshot compiler to prefer backup IDs during future regeneration.
- Added native canonical fallbacks for the posts page and date archives when fidelity snapshots are bypassed.
- Removed captured Microsoft Clarity execution from all snapshots, documented intentional external embeds, and mapped the legacy contact form's opaque subject/message field IDs in the custom mail handler.
- Vendored all 84 on-demand Elementor/Elementor Pro browser chunks from the backup and rewrote captured asset-base configuration to the custom theme, removing the final lazy-interaction dependency on inactive plugin directories.
- Headless-browser tested homepage and school carousels, gallery lightbox, contact form enhancement, News widgets, desktop navigation and the mobile menu; added four dynamically discovered lightbox dependencies and reached zero local HTTP or page errors.
- Added a nonce-protected native form action and hidden-field fallback at render time so enquiry submissions still reach WordPress when browser JavaScript is blocked.
- Exhaustively exercised all 36 captured routes at 1440×900 and 390×844 in headless Chrome after scrolling lazy content into view; all 72 checks completed with zero local HTTP failures or page exceptions.
- Compared every route against production at 390×844 across visible text, titles, body classes, H1s, element/link/form counts and key header/content/footer geometry. All 36 matched; the only initial metadata differences were the four intentional canonical repairs.
- Built a disposable WordPress 6.8.6/MariaDB 11.4.12 restore from the supplied backup, confirmed the substantive `wp_` database (3,899 posts and 30 published pages), restored all 1,950 uploads, disabled all legacy plugins and activated Ecowise Custom.
- Against real WordPress, verified 36 fidelity responses, the four-child/35-URL native sitemap, search, feeds, REST, robots, legacy redirects, HEAD handling and a nonce-validated form submission. WordPress emitted no debug log.
- Repeated all 72 desktop/mobile browser checks through the real WordPress renderer and restored media tree; every route and interaction completed with zero local HTTP failures or page exceptions.
