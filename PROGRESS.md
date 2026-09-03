# Progress log

## 2026-09-03

- Incorporated Adam's final campaign corrections: EcoWise Italy has designed and tailored outdoor education for more than 20 years; the offer combines environmental science and ecology with storytelling, environmental art, teamwork, nature awareness and forest schooling away from screens; programmes may extend to multi-week immersion; delivery is available year-round, including spring and summer.
- Built a transparent school-outreach register containing the complete current GIAS universe of 1,548 open English independent schools serving secondary-age pupils, an initial 39-school continental-European research list, 40 publicly displayed generic inboxes found among the first 80 prioritised UK prospects, formula-driven prioritisation, launch gates, campaign copy, send audit and suppression controls.
- Created matching responsive HTML and plain-text campaign versions and a rendered visual preview. The cold introduction contains no tracking pixel or third-party analytics.
- Drafted the outreach privacy notice and legitimate-interests assessment with explicit owner/legal review gates rather than presenting them as approved legal advice.
- Verified live DNS has SiteGround mail exchange records, SPF, the default DKIM record and DMARC. No public `/privacy-policy/` page was found, so privacy information remains a launch blocker.
- No prospect was marked approved, no email was sent and no external account was changed. Remaining launch gates are the actual sending mailbox and inbox-placement tests, privacy information, recipient verification/approval and explicit batch authorisation.

## 2026-08-23

- Recovered the 33-photo `zac website` Google Photos album from `zac website-1-001.zip`, resolved its true shared-album order and generated WebP theme derivatives limited to 2,000 pixels with camera metadata removed; the originals remain untouched outside Git.
- Added every owner photo to a new responsive Gallery section in album order, with meaningful alt text and direct full-image links.
- Applied the approved route assignments: Corporate hero image 15 plus support images 2/3; Science hero 10 plus goat/mountain/science carousel images 6/7/9 while retaining the orange-net fieldwork image; Team Building inherited balloon-jump hero plus retained rafting image and replacements 25/26.
- Made `content/owner-media-updates.json`, `assets/css/owner-media.css` and `MEDIA-UPDATES.md` the deterministic media contract; captured snapshots are regenerated rather than hand-edited.
- Replaced the school funnel's four generic programme cards with all six full inherited programme categories and clarified how Adam shapes activities, timing and level for each school.
- Added the owner-confirmed usual planning ratio of one accompanying adult to 10 pupils, carefully qualified by age/programme/site, and stated that current public-liability evidence is supplied privately rather than published. Recorded that school logos are not needed for this phase.
- Normalised the visible “Science trips” shorthand and lower-case “Field trips” instances to the full “Science, Ecology & Environment Field Trips” title.
- Audited the supplied Mailchimp campaign and created `SCHOOL-OUTREACH.md`: target roles, official data sources, suppression/compliance controls, September pilot schedule, subject lines, initial email, follow-up and pre-send blockers. No email was sent and no external account was changed.
- Confirmed the supplied Facebook story is not publicly accessible and did not import an unstable/private post; a public permalink or exported media is still required.
- Passed static validation, PHP 8.2 syntax lint across 19 files and the complete Local HTTP deployment contract: 36 preserved routes, one native growth route, exact 36-URL sitemap, four child sitemaps, native endpoints, redirects and HEAD handling.
- Browser-verified Local at desktop and 390-pixel mobile widths: the school header/hero does not overlap, all six cards render responsively, every assigned hero/gallery source is correct, the new Gallery contains 33 ordered images, no modified route has horizontal overflow and no console errors were recorded.
- Built and deployed the owner-media release, then caught a production-only asset-path problem during browser QA: new snapshot images still referenced the stable development directory while production uses versioned theme directories. Added a renderer-level active-theme asset resolver and redeployed before handoff.
- Built deterministic theme 1.1.6 package v29: 773 verified files, 49,551,599 bytes, SHA-256 `1313177B38DFE8E4D6706A380D227950FEF0FB6D61D4855E57059ED73ABE0664`.
- Deployed 1.1.6 to production at `ecowise-custom-v30`, retaining 1.1.5 at `ecowise-custom-v29` and 1.1.4 at `ecowise-custom-v28` for rollback. The current deployment bundle is `/home/customer/ecowise-deploy-20260823-v29`.
- Re-passed the complete production HTTP contract and browser-verified the live school funnel and four media routes at 1280px and 390px: all new asset references resolve through `ecowise-custom-v30`, all 33 gallery files return HTTP 200, the six programme headings are present, no checked route has horizontal overflow and the sole administrator remains `marketinghydron@gmail.com`.
- Corrected the Corporate Activities photo pair after owner review: the inherited Elementor rule forced both 4:3 landscape images into fixed 340px-tall portrait crops. Theme 1.1.9 applies an explicit route-scoped override so both complete images retain their natural composition at desktop and mobile widths.
- Built deterministic package v30 (773 files, 49,551,753 bytes, SHA-256 `D330A10BCBE67E3CA30A020F2D75077FA434C88E58E6E7C1B28F751739E8BE1A`) and deployed it at `ecowise-custom-v31`, retaining v30 for immediate rollback. Live measurements confirm `object-fit: contain`, both 2,000×1,500 source images, no horizontal overflow and the complete production route/sitemap contract.
- Increased the same Corporate Activities photographs after owner review showed that uncropped side-by-side images were too small. Theme 1.1.10 stacks them at the full 308px desktop column width (355px mobile), retaining their complete landscape composition. Package v31 contains 773 files, 49,551,754 bytes and SHA-256 `52CB0C29C69F36CE981FF26005AF3E30B3AA9B9E7E3C877193897603AB3AA5D9`; it is live at `ecowise-custom-v32` with v31 retained for rollback.

## 2026-08-07

- Corrected the owner-approved mission statement to add science and read: “EcoWise Italy connects people to nature through science, storytelling, mindfulness, and unplugged outdoor adventure.” The existing second sentence remains unchanged.
- Added the complete mission statement to the beginning of the homepage About section while retaining it in the homepage hero and the dedicated `/what-is-ecowise/` section.
- Made `content/homepage-updates.json` the single source for all three mission instances and added static and deployment validation to prevent wording drift or reintroduction of the inherited `unplugged-outdoor` error.
- Built deterministic theme 1.1.4 package v27: 739 verified files, 30,017,837 bytes, SHA-256 `A67226D9DD0F5DC93E247CCFAF13A3661CE57A20F51CF2BCF734F7FF509CD88B`.
- Deployed 1.1.4 to production at the fresh `ecowise-custom-v28` path, retaining 1.1.3 at `ecowise-custom-v27` for immediate rollback and purging SiteGround caches.
- Passed the complete production route/sitemap gate and browser-verified both mission routes at 1440px and 390px: correct instance counts, no legacy wording, no horizontal overflow, no broken images and no console errors. The longer About copy remains balanced beside the framed-photo collage and readable as one column on mobile.

## 2026-08-06

- Incorporated Adam's detailed operational corrections into `/school-trips-italy/`: EcoWise Italy selects the programme site, checks availability and books accommodation/food on the school's behalf as an included coordination service; the school arranges main travel and pays the separate programme, accommodation/food and travel invoices.
- Repositioned the recommended international residential from three days/two nights to five days/four nights, added seven days/six nights as the full-immersion option, and retained shorter residentials and day visits as available formats.
- Expanded the programme story beyond field science to include storytelling, story-sharing, myth-making, environmental art, drama, role-play, sensory and physical discovery, teamwork, creativity, problem-solving, adventure and critical thinking.
- Added accurate customer guidance that EcoWise Italy does not sell travel or provide travel insurance, and that ATOL financial protection for qualifying UK flight-inclusive packages is separate from travel insurance.
- Updated the commercial brief, owner-question list, school-funnel handover and automated content/deployment contracts so these approved facts cannot silently regress.
- Built deterministic theme 1.1.3 package v26: 739 verified files, 30,017,470 bytes, SHA-256 `7D5516BFB2678CCCC27E4978BB88E339D54D87803993D53F55C3755BF95DBAF8`.
- Deployed 1.1.3 to production at the fresh `ecowise-custom-v27` path, retained 1.1.2 at `ecowise-custom-v26` for immediate rollback, purged SiteGround caches and reconfirmed the sole WordPress administrator/email as `marketinghydron@gmail.com`.
- Passed the complete production deployment contract and browser-verified the live page at 1440px and 375px: one H1, no broken images, no horizontal overflow, clear header separation, balanced two-column/one-column programme cards, responsive residential options and readable booking responsibilities; no browser console errors were recorded.

## 2026-07-28

- Corrected the wide-desktop school-funnel header collision reported from production. Theme 1.1.2 increases the desktop hero's reserved height and moves its content below the captured overlay header while leaving the 1024px-and-below rules unchanged. Live measurement at the reproduced desktop layout gives 171px between the header bottom and eyebrow, with no horizontal overflow.
- Built deterministic v25 (739 files, 30,014,071 bytes, SHA-256 `25103CB8193C48D76033E5468281A7720D21191D67D8F71EE128457C177AA420`), deployed it at `ecowise-custom-v26`, purged SiteGround caches and passed the complete production deployment gate.
- Rebuilt `/school-trips-italy/` after visual review showed that the first native campaign treatment did not belong to the reconstructed site. Version 1.1.1 now uses the exact captured Schools header/footer shell, mountain hero, centred logo/navigation, Outfit/Rubik typography, map backgrounds, photographic framing and established red/yellow/green palette without loading Elementor.
- Replaced the original planning timeline with a clear photograph-and-four-step customer journey, simplified the enquiry form's initial view, rewrote responsibilities as customer-facing guidance and removed internal/developer language about future document confirmation.
- Passed the updated static gate and complete local HTTP deployment contract: 36 preserved routes, one native growth route, 36 sitemap URLs, four child sitemaps, four native endpoints, two redirects and HEAD handling.
- Built deterministic Ecowise Custom 1.1.1 package v24: 739 files, 30,013,931 bytes, SHA-256 `DCBECE27071703AD6F8ADA567C0D0820362F5552E28B0956C4CD5A4F00CEDA4D`.
- Deployed 1.1.1 to production at the fresh `ecowise-custom-v25` path with the previous 1.1.0 path retained for immediate rollback. Production passed the complete route/sitemap/redirect/HEAD gate; the live funnel has the captured shell, one canonical, one schema graph, no broken images or horizontal overflow, and no internal document-confirmation language.
- Incorporated Adam's second commercial briefing: prioritised UK independent schools within the schools-first strategy, identified specialist school-tour operators as the highest-leverage distribution route, separated direct-school and operator-partner acquisition paths, and recorded historical UK school interest as private prospect context rather than public proof.
- Recorded the premium, innovative and personal positioning while forbidding unsupported superiority claims or competitor attacks. Adam's private financial figures were deliberately excluded from Git and all public/customer-facing systems.
- Built Phase 1 of the school lead-generation system as the native, code-owned `/school-trips-italy/` route without changing any of the 36 preserved fidelity pages.
- Added a teacher-focused journey covering group fit, curriculum-linked programme paths, an illustrative three-day residential itinerary, responsibilities, educator proof, seasonality, planning steps, FAQ and a detailed proposal request.
- Added the secure `ecowise_school_enquiry` handler with nonce, honeypot, server-side validation, rate limiting, explicit data-use acknowledgement, UTM/referrer capture and delivery to Adam.
- Added the administrator-only `ecowise_enquiry` lead ledger; inherited contact and newsletter forms now create owned lead records as well as sending email.
- Added responsive proposal banners to the Schools hub and five high-intent programme pages at runtime while leaving generated snapshots untouched.
- Added owner-safe titles, descriptions, Open Graph, Twitter metadata and Organization/page/service schema to nine priority routes, including the new funnel and Italian school page.
- Added privacy-safe `ecowise:conversion` and optional existing-`dataLayer` events without installing any third-party tracker or making new analytics requests.
- Added `audit/native-routes.json`, preserved native routes during snapshot rebuilds and expanded validation to 36 indexed URLs while keeping the 36-route fidelity contract unchanged.
- Added idempotent `tools/provision-growth-pages.php`, WordPress checks for 31 published pages/no funnel Elementor data, and `ADAM-QUESTIONS.md` for the remaining evidence and owner decisions.
- Local WordPress QA passed the complete route/sitemap contract, PHP lint, native menu fallback, responsive overflow checks, a real test proposal submission, private-ledger creation and Mailpit delivery to Adam's configured address; the synthetic QA lead was deleted afterwards.
- Built deterministic theme 1.1.0 package v23 with 739 verified files, 30,011,321 bytes and SHA-256 `9447BC9F55CEB53F1939718989807451280DE93D7869C0526084C21FB303F098`.
- Deployed Phase 1 to production and provisioned the native funnel as page ID 4080.
- Diagnosed a SiteGround PHP opcode-cache split state that initially served the new template without loading the new bootstrap modules. Activated the same verified package under the fresh `ecowise-custom-v24` filesystem path to force a clean compile; no content or URL changed.
- Passed the production HTTP gate across 36 preserved routes, one native growth route, the exact 36-URL sitemap, four child sitemaps, four native endpoints, two redirects and HEAD handling.
- Browser-verified the live funnel at 1280 and 375 pixels: correct title, description and route stylesheet; one H1; no broken media; no horizontal overflow; and responsive navigation, form and hero composition.
- Converted Adam Rose's answers to the 12 growth-audit questions into `BUSINESS-BRIEF.md`, the durable source of truth for priorities, leads, seasonality, group fit, contracting responsibilities, compliance limits and outstanding evidence.
- Confirmed commercial priority as schools first, families second and corporate third; identified UK schools as the principal missed market and the Netherlands/Northern Europe as secondary school markets.
- Recorded November–March as the urgent capacity gap, typical groups of 20–30 within a 15–80 range, the common three-day/two-night format and bespoke per-person pricing.
- Documented the separate-contract/invoice model and the constraint that EcoWise Italy does not hold an ATOL licence; prioritised licensed school-travel-operator/DMC partnerships rather than presenting EcoWise Italy as a package organiser.
- Recorded Adam Rose as owner of all enquiry replies and follow-up with a public response commitment of within 24 hours.
- Changed the newsletter form default from the inherited former-development address to Adam's owner-approved `adamecorose@gmail.com`; both active form contracts now route to Adam.
- Added a validation gate that rejects former-development recipient/sender addresses if they reappear in the active form handler.
- Reframed the acquisition roadmap around a UK-school landing page, winter-capacity offer, teacher planning pack, named school outreach, licensed operator partnerships and a written success-fee model.
- Built deterministic theme 1.0.18 package v22 with 733 verified files, 29,955,039 bytes and SHA-256 `2AC466D15C56195382D7ADC47C99DA66A5756A9CD1F1B2A30F3120477C717143`.
- Created the production rollback bundle `/home/customer/ecowise-deploy-20260728-v22`, deployed theme 1.0.18 and purged SiteGround caches.
- Revalidated production after deployment: all 36 routes, 35 sitemap URLs, four child sitemaps, native endpoints, redirects and HEAD handling pass; both active recipients are Adam's address, the modified PHP lints cleanly, and the sole WordPress administrator remains `marketinghydron@gmail.com`.

## 2026-07-26

- Completed a live SEO, UX, customer-journey, search-market and lead-generation audit and recorded the prioritised strategy in `GROWTH-AUDIT.md`.
- Verified all 35 sitemap URLs return 200 with one H1 and correct self-canonicals, while identifying sitewide missing descriptions/social metadata/schema, duplicate indexable archives, weak commercial intent targeting and substantial legacy asset weight.
- Identified the highest-value acquisition wedge as international/bilingual schools, followed by Italian schools in Piemonte; positioned corporate retreats as the second offer engine and family travel as conditional on operational/pricing clarity.
- Found that the inherited newsletter form still routes visitor data to former-development address `saqibbalii099@gmail.com`, with the legacy database referencing `email@dev3.saqib07.com`; made correction and owned lead delivery the stop-the-line recommendation before traffic acquisition.
- Audited desktop customer paths and found no active conversion analytics, no CRM/lead ledger, no verified SMTP, no privacy layer, generic contact qualification and missing contextual CTAs across most commercial pages.
- Diagnosed the public outage as a SiteGround malware suspension returning HTTP 429 with `X-Limited: 1`; WordPress and the custom theme remained reachable and healthy over SSH.
- Confirmed the infection predated the custom-theme release: SiteGround had quarantined 48 fabricated PHP files across WordPress core, inactive themes and legacy plugins, and the PHP log identified a random-name malicious plugin writing payloads on 23 July.
- Removed three unauthorized administrator accounts: `articles_table`, `devoption` and `webtable`; reassigned any owned content to the sole retained administrator.
- Deleted all 12 unused legacy or malicious plugin trees, including Elementor, Elementor Pro, WP File Manager, PHP Console and the random-name `chagirein-riereagaigol` plugin.
- Reinstalled SiteGround Speed Optimizer 7.8.0 from WordPress.org as the sole active normal plugin.
- Upgraded and replaced WordPress core from the official 6.8.6 distribution and removed every non-core file reported by checksum verification.
- Replaced the active custom theme from the verified 1.0.17 v21 archive, reinstalled a clean Twenty Twenty-Five fallback and removed poisoned server rollback bundles v18/v20.
- Removed executable PHP from uploads, rotated WordPress salts, flushed rewrites/object cache and purged SiteGround Dynamic Cache.
- Passed post-cleanup checks: official WordPress core checksums, official active-plugin checksums, 733 exact custom-theme package files, zero permission-quarantined webroot files, zero PHP files in uploads and only `sg-cachepress` active.
- Forensically confirmed the persistence was inherited from the supplied 21 July backup: its SQL already contained all three rogue users, its plugin payload contained PHP Console and WP File Manager, and its archived Hello Elementor theme already contained injected `sidebar-soap.php`.
- Recorded the evidentiary limit: logs prove the random-name malicious plugin wrote payloads on 23 July, but neither the first exploit nor a responsible human can be attributed from the retained evidence.
- Locked WordPress ownership to the sole administrator at `marketinghydron@gmail.com`: registration remains disabled, all sessions and application passwords were destroyed, and dashboard PHP editing was disabled with `DISALLOW_FILE_EDIT`.
- Replaced the sole administrator's former password with a newly generated WordPress password and sent the notification only to `marketinghydron@gmail.com`, then destroyed sessions and application passwords again.
- Extended the read-only WordPress validator with `ECOWISE_EXPECTED_ADMIN_EMAIL` so deployment checks fail if another user, a different owner, public registration or an application password reappears.
- Stored the cleanup script in `tools/siteground-malware-cleanup-2026-07-26.sh` and server-side incident inventories outside the webroot at `/home/customer/ecowise-security-cleanup-20260726`.
- SiteGround accepted the cleanup and restored public access. Reverified HTTP 200, all 36 routes, all 35 sitemap URLs, four child sitemaps, native endpoints, redirects and the live custom homepage presentation.

## 2026-07-24

- Added `content/homepage-updates.json` as the deterministic source for homepage hero and About-collage image assignments.
- Replaced the five rotating hero slides with `Ecowise-Italy-211.jpg`, `mindfulll.jpg`, `Ecowise-Italy-254.jpg`, the supplied river-fieldwork photograph and `ecowisely-tour-22.jpg`.
- Selected `ecowisely-tour-22.jpg` as the fifth slide because the brief supplied four concrete files plus the Gallery page, but requested five images.
- Kept the complete `Ecowise-Italy-211.jpg` landscape visible with a contained background treatment while retaining cover cropping for the other slides.
- Replaced the About collage with the city-square group in the central red frame, the field group in the bottom-left yellow frame and the natural-pool group in the top-right yellow frame.
- Normalized customer-facing snapshot, native footer and form-email branding to `EcoWise Italy`, while excluding the logo artwork, domain, URLs, slugs, filenames and code identifiers.
- Added deterministic compiler and validation contracts for all eight image assignments, image availability, the special landscape fit and public brand presentation.
- Built deterministic theme 1.0.16 package v20 with 733 verified files, 29,954,964 bytes and SHA-256 `1AFE6319E0ECA9B42B80F96F3C5861B736A69FE4FEEF3C8C43D5EC1A52E17BFA`.
- Deployed theme 1.0.16 to production with an exact 1.0.15 rollback archive, updated the WordPress site name to `EcoWise Italy`, deactivated the unexpectedly reactivated Elementor and Duplicate Page plugins, and purged SiteGround Dynamic Cache.
- Browser QA caught the existing unversioned homepage stylesheet in a returning browser cache; added theme-version query strings to compiler-injected stylesheets and advanced the corrective release to 1.0.17.
- Built deterministic theme 1.0.17 package v21 with 733 verified files, 29,955,041 bytes and SHA-256 `1EF89BFBDEA1F03DFF53FA4384A51EAA23460783B4AAF379B1C68C05929F5969`.
- Deployed the corrective 1.0.17 release, purged SiteGround Dynamic Cache and passed the complete production validator: 36 routes, 35 sitemap URLs, four child sitemaps, four native endpoints, two redirects and HEAD handling.
- Browser-verified production at 1440×900 and 390×844: exact five-slide order, contained mountain landscape, correct city/field/pool collage assignments, red/yellow/yellow frames, `EcoWise Italy` presentation, zero broken images, zero horizontal overflow and zero console warnings/errors.

## 2026-07-23

- Repaired and started the existing Local site at `C:\Users\zacpl\Local Sites\ecowise` without replacing its preserved rollback SQL.
- Recreated the missing MySQL runtime, repaired the incomplete WordPress core with WordPress 6.8.6, restored the substantive `wp_` backup database, copied all 1,950 uploads and activated Ecowise Custom with no legacy plugins active.
- Set the Local URL to `http://ecowise.local/`, retained a port-independent `localhost` database host and performed a serialization-safe production-to-Local database URL replacement.
- Passed the read-only WordPress preflight against 30 pages, three posts, 413 attachments and the complete upload tree.
- Added configurable deployment-validator concurrency for constrained environments and passed all 36 routes, 35 sitemap URLs, four child sitemaps, four native endpoints, two redirects and HEAD handling against Local.
- Added render-time rewriting for interactive snapshot links on non-production installations while preserving production canonical metadata.
- Browser-confirmed the Local homepage dimensions match production and verified Local navigation remains within `ecowise.local`.
- Documented the exact customization boundary: the theme is builder-independent and code-customizable, while the 36 fidelity snapshots are intentionally not WYSIWYG editor templates.
- Built deterministic theme 1.0.12 package v16 with 727 verified files, 25,197,848 bytes and SHA-256 `0CD41469DF0F84FFA616F58213D42DE7AB7C259244F1341E43E95F5B39E54BB3`.
- Translated the supplied WhatsApp brief into a deterministic editorial overlay without changing the approved homepage.
- Moved the four outdoor-education article/PDF resources out of News and added them as visible, clearly named reading cards on Outdoor Education Tutorials.
- Resolved three Facebook share links to stable Ecowise Italy post URLs and added the Road Less Traveled updates to News, equivalent archive views and Outdoor Service Education Projects.
- Added `content/editorial-updates.json` as the maintainable source for future resources and Facebook posts, plus a responsive editorial stylesheet and compiler/validator contracts.
- Browser-verified the new sections at 1440px and 390px: resource grids, social grids, headings, iframe counts and horizontal overflow all passed with zero console errors.
- Built deterministic theme 1.0.13 package v17 with 728 verified files, 25,187,807 bytes and SHA-256 `F882A70D243BBFD5AE8A2CDA4D77FBB455073F559EBF543B2F5111908DCAE4E1`.
- Changed only the approved homepage collage frames: the large 14px frame is red `#CF2E2E`, while both tilted 10px frames are yellow `#FCB900`; image geometry, rotations, overlap and shadows are unchanged.
- Added compiler and validation contracts for the homepage frame stylesheet and browser-verified the result at 1440px and 390px with no overflow or console errors.
- Built deterministic theme 1.0.14 package v18 with 729 verified files, 25,188,336 bytes and SHA-256 `8EF974FA930D80D1A545A724BD1FB65019D222058B26E401C1EFD309ADB6B530`.
- Created an additional SSH rollback bundle at `/home/customer/ecowise-deploy-20260723-v18`, including a pre-cutover database dump, Hello Elementor archive, exact theme/plugin option records, inventories and the verified v18 package.
- Deployed Ecowise Custom 1.0.14 to the production WordPress 6.8.1 installation without replacing its substantive database or larger production uploads tree.
- Activated the custom theme, deactivated all 11 legacy plugins, flushed WordPress rewrites/object cache and confirmed front page ID 6, posts page ID 2448, `/%postname%/` permalinks and the production home URL remain intact.
- Verified uncached production output at desktop and mobile sizes: zero broken images or horizontal overflow, red/yellow/yellow homepage collage frames, correct News canonical and all 23 Facebook embeds.
- Identified two bare-URL deployment-validator failures as stale SiteGround Dynamic Cache responses; documented the required Dynamic Cache/CDN purge and retained final bare-URL validation as the last launch gate.
- Reproduced the visibly broken first production response and confirmed SiteGround Dynamic Cache was serving legacy Elementor HTML after the legacy theme/plugins had been deactivated.
- Installed the official SiteGround Speed Optimizer solely for supported cache operations, ran `wp sg purge`, and immediately restored the complete custom-theme presentation.
- Passed the full 36-route/35-sitemap-URL production validator after the purge; browser verification found correct homepage styling, the approved red frame, no broken images, no overflow and no console errors.
- Fixed the separate administrator-view defect: mapped routes no longer fall back to unfinished native templates merely because the visitor is logged in.
- Made authenticated snapshot responses `private, no-store`, added a regression contract for the logged-in renderer and released the correction as theme 1.0.15.
- Built deterministic theme 1.0.15 package v19 with 729 verified files, 25,188,534 bytes and SHA-256 `F6BDE814BF3AF6913FF10CF2D4044723F8CA14F8DFE848625D78898612EE9A17`.

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
- Added a GitHub Actions regression gate that syntax-checks the build/validation tools, validates the complete fidelity contract and lints every theme PHP file on each push and pull request.
- Added a zero-dependency deployment validator for the complete HTTP route, title, canonical, sitemap, native endpoint, redirect and HEAD contract on staging or production.
- Added a read-only WP-CLI restore preflight for the substantive database, theme/options/plugin state and all 1,950 uploads; documented staging URL overrides and a complete legacy rollback procedure.
- Added a deterministic, self-verifying theme ZIP builder and incorporated release packaging into continuous integration.
- Corrected all 16 archive PDF viewers to open the four original Ecowise PDFs recovered from Elementor widget data instead of PDF.js's bundled sample document.
- Removed a captured HTML 404 masquerading as a Themify font (including dormant legacy tracker markup), rewrote the font fallback to the valid vendored EOT and added packaged-asset tracker/font validation.
- Removed stale captured plugin AJAX endpoints/nonces, rendered a real server-observable form honeypot, capped accepted form fields/payloads and eliminated long stale-cache reuse of nonce-bearing pages.
- Repeated the full real-WordPress suite after hardening: 72 desktop/mobile browser checks, 36 fidelity responses, exact 35-URL sitemap, native endpoints, redirects, form submission and the 1,950-file restore preflight all passed with no WordPress debug log.
- Built deterministic theme 1.0.5 package v9 with 727 verified files and SHA-256 `84C40EEA3135449A2EBD59A3A52775DE7E11071320D8498F0F007A23403883EF`.
- Restored the original per-form inbox routing and schemas from the backup: contact and newsletter submissions retain distinct recipients, contact email labels/required fields match Elementor, and no-JavaScript submissions return to an accessible on-page result instead of raw JSON.
- Re-tested the restored forms inside WordPress: contact validation and 303 return flow passed, newsletter submission passed, and the intercepted mail payloads selected the two exact recovered recipients.
- Added extension-signature/HTML-masquerade checks for packaged assets and made release generation cross-platform deterministic by normalizing approved text assets; CI now builds twice and verifies `release/theme-package.json`.
- Built deterministic theme 1.0.6 package v10 with 727 verified files, 25,154,039 bytes and SHA-256 `9424E1B44390AAA5F80F913CD9278874B6F40B7380EB7BD6DC40B3AE83ED3871`.
- Prevented the dormant vendored Elementor form listener from competing with the custom handler, changed fidelity responses to private caching, and confirmed in a real browser that one click produces one successful WordPress mail event with no console errors.
- Re-ran the restored WordPress route, sitemap, endpoint, redirect, native/JavaScript form and cache-header suites with zero failures.
- Built deterministic theme 1.0.7 package v11 with 727 verified files, 25,154,099 bytes and SHA-256 `E903CDC6D1AA5B1F9A5D09E3E494305B8EA7571EE728F5013A184F5C798B86B5`.
- Repaired the six inherited `#` footer placeholders on every fidelity page to their exact restored school-program routes; all 216 links now resolve to HTTP 200 without visual or sitemap changes, and the compiler/validator enforce the mapping.
- Built deterministic theme 1.0.8 package v12 with 727 verified files, 25,165,367 bytes and SHA-256 `3BE711C38C9B62B8596359F1A96E8ACF68292429A03C4C1D9C76DB62BBE25344`.
- Completed a fresh 390×844 browser interaction pass: mobile navigation expanded with all seven links, the image lightbox opened/closed, YouTube and the restored MP4 loaded responsively, all four archive PDF viewers exposed their correct document text and controls, a repaired footer link navigated to its local restored route, and the console remained clean.
- Audited every homepage flip-card title against its CTA and corrected the only two mismatches inherited from Elementor: team building and mindfulness now open their exact restored program pages; both destinations return HTTP 200 and the compiler/validator enforce the widget-specific targets.
- Built deterministic theme 1.0.9 package v13 with 727 verified files, 25,165,316 bytes and SHA-256 `7FF56CF72019CADED4F04F6B3928F9E3E04C6D71BC2D29214BC12E61158D0936`.
- Completed a cross-page visible-link semantics sweep: only contextual labels (`Learn more`, article comments and archive read-more links) intentionally map to multiple destinations; all other repeated labels have one consistent target. Validation now locks all six homepage service cards to their exact routes.
- Repaired the final captured heading-outline defects: the homepage hero is now its sole H1, and duplicate H1s on the conflict-resolution and team-building pages are semantic H2s with their original responsive H1 typography preserved exactly.
- Made heading repair route- and widget-specific in the snapshot compiler, updated the generated homepage H1 audit value, and expanded validation so every one of the 36 captured routes must contain exactly one H1.
- Browser-compared the three repaired headings against production at 1440, 1024 and 390 pixels; computed typography, wrapping, bounding rectangles and widget height matched exactly at every breakpoint.
- Built deterministic theme 1.0.10 package v14 with 727 verified files, 25,166,073 bytes and SHA-256 `B844618F4AFD5467D4FD65BFBC8F37FB424E39107A8E5F16281848ECBCBF2626`.
- Repaired the inherited skip navigation on all 36 fidelity routes by giving each document exactly one main target, plus explicit banner/contentinfo landmarks and distinct labels for all six repeated navigation regions.
- Removed the remaining unnamed customer actions: all 330 formerly silent logo, gallery, post-thumbnail and standalone lightbox links now have authoritative alt text or stable accessible labels; validation requires zero unnamed anchors.
- Added titles to all 96 formerly untitled Facebook/PDF frames, direct no-JavaScript links for all six YouTube widgets and direct-download fallbacks plus accessible names for all four hosted-video instances.
- Converted the visible contact email and telephone into native `mailto:`/`tel:` actions and changed the phone field from numeric input semantics to `type="tel"` with telephone autocomplete/input-mode hints.
- Browser-compared homepage, contact, gallery and News against production at desktop and 390-pixel mobile widths. Parent geometry, document height, typography, color and form-control dimensions remained exact; the gallery lightbox opened and the local MP4 reached ready state 4 with no media error.
- Repeated the exhaustive 72-route desktop/mobile interaction sweep after the repairs; all routes, menus, carousels, lightbox, lazy assets and restored PDF viewers completed with zero local HTTP failures or page exceptions.
- Built deterministic theme 1.0.11 package v15 with 727 verified files, 25,196,831 bytes and SHA-256 `E2C504FF3DEB0DF34C95EC323F92D9FBCC542B25801540CDA5AB9C2B215C26D2`.
