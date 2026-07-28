# School lead-generation funnel

## Purpose

`/school-trips-italy/` is the first code-owned commercial landing page. It targets UK and international school decision-makers without claiming that EcoWise Italy has already served a UK school.

The page is a native WordPress route rendered by `page-school-trips-italy.php`. It does not use Elementor or ACF and does not replace `/for-schools/` or any preserved route. The preserved Schools hub remains the programme catalogue; the new route is the proposal and qualification journey.

## Customer journey

The page answers, in order:

1. Is this relevant to my school?
2. What group and trip formats fit?
3. What can pupils learn?
4. What might a three-day journey look like?
5. Who is responsible for programme, travel and accommodation?
6. Is there credible educator proof?
7. How does planning work?
8. When might capacity be available?
9. What does Adam need to prepare a proposal?

Every date is provisional until Adam checks the calendar. Pricing is described only as a bespoke per-person quote. The page does not present a combined travel package or imply ATOL protection.

## Lead handling

The proposal form posts to the nonce-protected `ecowise_school_enquiry` WordPress action in `inc/leads.php`.

Protection and handling include:

- honeypot field;
- required server-side fields;
- email validation;
- per-IP/email rate limiting;
- sanitisation and length limits;
- explicit data-use acknowledgement;
- a warning not to submit pupil names or medical information;
- attribution fields for source URL, referrer and UTM parameters;
- delivery to `adamecorose@gmail.com`;
- an administrator-only `ecowise_enquiry` ledger in wp-admin;
- recorded email-delivery status.

The inherited contact and newsletter forms also write to the private ledger before email delivery. A retention period is deliberately not automated until Adam answers `ADAM-QUESTIONS.md`.

## Discovery

`inc/growth.php` injects one responsive proposal banner into the preserved Schools hub and five high-intent programme pages at runtime. The snapshot files remain generated source and are not hand-edited.

The new page is provisioned idempotently with:

`wp eval-file tools/provision-growth-pages.php`

The script creates or updates the published WordPress page, removes any Elementor metadata and flushes rewrite rules. It never runs on theme activation.

## SEO foundation

Packaged metadata is in `config/seo-metadata.json`. Nine priority routes receive owner-safe:

- search titles and descriptions;
- Open Graph metadata;
- Twitter card metadata;
- Organization plus page/service structured data;
- production canonicals;
- Italian locale presentation for `/per-le-scuole-italiane/`.

Fidelity metadata is added at render time because preserved documents exit before normal `wp_head` execution. Native metadata uses normal WordPress hooks. No analytics network request is activated; both front-end runtimes emit local `ecowise:conversion` events and push only when an owner-controlled `dataLayer` already exists.

## Validation contract

- `audit/native-routes.json` owns code-created routes.
- `audit/captured-routes.json` remains the 36-route fidelity contract.
- `audit/indexed-routes.json` merges the 35 imported indexed URLs with the native route.
- The snapshot compiler preserves native routes when rebuilding the indexed inventory.
- Static validation checks page claims, form security, lead routing, metadata profiles and native-route files.
- Deployment validation checks the native H1/content, priority metadata/schema and exact 36-URL sitemap.
- WordPress validation requires 31 published pages and forbids Elementor data on the funnel page.

## Editing

Change page copy and structure in `page-school-trips-italy.php`, page styling in `assets/css/school-funnel.css`, form processing in `inc/leads.php`, preserved-page banners in `inc/growth.php`, and metadata in `config/seo-metadata.json`.

Any new claim about ages, ratios, qualifications, insurance limits, safety record, current dates, prices, curriculum coverage or permissioned logos must first be recorded in `BUSINESS-BRIEF.md`.
