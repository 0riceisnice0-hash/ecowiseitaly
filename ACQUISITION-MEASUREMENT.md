# First-party acquisition reporting

## Implementation

The custom theme's `inc/acquisition.php` owns the `{$wpdb->prefix}ecowise_acquisition` table and the administrator-only Tools → Acquisition report screen. `assets/js/acquisition.js` receives the endpoint and approved campaign list from `ecowise_acquisition_markup()`. Both fidelity routes and the native school template load it. No external analytics service or subscription is involved.

Rows are daily aggregates of page, broad source, allowlisted campaign and allowlisted event. There are no visitor IDs, cookies, localStorage/sessionStorage, full referrers, device fingerprints, per-recipient tags or individual browsing histories. Approved campaign tags propagate through internal links in the URL and into enquiry fields. Direct returns and untagged journeys cannot be matched to earlier visits. The report is not an email-open, unique-visitor, delivery or booking report.

The current route allowlist is the eleven paths in `ecowise_seo_profiles()`, including the main school funnel and contact page. Other routes are not counted by this collector. Do not call the page-load sum total website traffic or compare it directly with a whole-site analytics report.

Browser events include page loads, guide/partner download clicks, contact-link clicks, proposal CTA and form starts. Each event name is counted at most once per document load. Counts can include refreshes, automated traffic and owner activity. Browser user agents advertising bots, Do Not Track visitors and logged-in administrators are excluded, but this is not a bot-proof measurement system. QA visits on launch day are part of the initial aggregate baseline and must not be described as external campaign interest.

An `enquiry_recorded` event is generated server-side when a private enquiry is saved. The public endpoint rejects attempts to submit that event. **A saved form is not a qualified lead**: advertisements, spam and irrelevant messages can still create records. Use the private ledger to qualify them, and preserve original records rather than silently deleting them.

## Retention and safeguards

The public aggregate endpoint accepts POST only, requires a matching Origin host, bounds events/routes/campaigns/sources and uses temporary keyed network hashes for two-minute abuse throttling. It never stores raw IPs in the reporting table. Aggregate rows older than 90 days are removed by a daily WP-Cron job. Actual timing depends on WP-Cron execution. The site footer explains this measurement; embedded third-party services and hosting logs have separate processing.

Only administrators with `manage_options` can read the report. Public event collection does not expose the table. Counts are indicative and can be spoofed; do not use them as billing evidence or claim identified people visited.

## Rebuild and validation

Activation installs the table and cleanup schedule via `ecowise_acquisition_install()`. Re-activating a previous theme does not delete stored counts. `wp eval-file tools/test-acquisition.php` checks insert/increment logic in a rolled-back InnoDB transaction, rejects unknown events/routes and checks the five required enquiry controls. The public route/SEO gate remains `node tools/validate-deployment.mjs https://ecowiseitaly.com`.

New campaign slugs must be added to the allowlist and deployed before their links are used. Do not recycle an October campaign name for a November campaign simply to obtain counts. The proposed European campaign is not yet enabled, scheduled or sent.

Removal: remove the acquisition include and markup calls, stop the scheduled cleanup hook and retain/export the private aggregate table as required before separately approving any deletion. Removing measurement must not remove the private enquiry ledger or enquiry routing.
