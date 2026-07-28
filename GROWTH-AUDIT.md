# SEO, UX and lead-generation audit

Audit date: 26 July 2026

Site: `https://ecowiseitaly.com/`

Scope: live technical SEO, search positioning, customer journeys, conversion systems, offer clarity and a practical lead-growth roadmap.

## Executive verdict

EcoWise Italy does not have an offer-quality problem. It has a packaging, routing and measurement problem.

The strongest commercial proposition is unusually credible:

- more than 20 years of delivery;
- named testimonials from principals, IB teachers and international schools;
- day and residential programmes;
- curriculum alignment, including IB Biology, Environmental Systems and Societies and PYP;
- risk assessment, pastoral support, logistics support and professional trip photography;
- expert environmental interpretation in English and Italian;
- a distinctive Piemonte base and real relationships with regional schools and protected-area partners.

The website currently presents that proof as a large brochure archive. It does not consistently tell a visitor what to book, whether it fits their group, what happens next or why they should enquire now. Most commercial pages lack a contextual call to action. There is no dependable lead ledger, active conversion analytics, privacy layer, verified mail-delivery system or search-performance baseline.

Adam Rose confirmed the growth priority on 28 July 2026:

1. **Schools**, with the UK as the principal missed market.
2. **Families and private eco-adventures**.
3. **Corporate nature team building and retreats**.

Within the school audience, maintain the existing Italian/international-school base while developing direct outreach and licensed travel partnerships for UK schools, followed by the Netherlands and Northern Europe. Schools should lead because the business already has strong proof, repeat customers, curriculum expertise and high-value tailored programmes. The owner-approved operating detail is maintained in `BUSINESS-BRIEF.md`.

## Stop-the-line finding: leads are going outside the business

The imported Elementor database configured forms with the following recipients:

- contact form: `adamecorose@gmail.com`, plus a secondary recipient at `saqibbalii099@gmail.com`;
- newsletter form: `saqibbalii099@gmail.com`;
- legacy sender domain: `email@dev3.saqib07.com`.

The custom handler correctly removed Elementor as a dependency, but initially preserved the newsletter form's old default recipient. On 28 July 2026, Adam confirmed that he owns every lead and that all forms should use `adamecorose@gmail.com`; theme 1.0.18 removes the former-development recipient and makes the validator reject its return. Newsletter submissions are still emails rather than records in an owned mailing list or CRM.

The backup proves this configuration predates the custom theme. Public search results associate `saqib07.com` with a freelance web developer, which is consistent with a former development address, but does not by itself prove malicious intent. Regardless of intent, sending current visitor data there is not acceptable.

Before paid acquisition:

1. route every active form to Adam's owner-approved inbox (completed in theme code);
2. remove every former-developer recipient/sender from active WordPress options and historical form configuration;
3. configure authenticated SMTP and test actual delivery, not merely `wp_mail()` success;
4. store every enquiry in an owned lead ledger/CRM with timestamps, source and status;
5. add an autoresponder and monitored failure alert;
6. publish a privacy notice before collecting further newsletter data.

This is both a lead-loss issue and a data-protection issue. The European Commission states that people must be told who is collecting their data, why, how long it is kept and who receives it at the point of collection: [European Commission GDPR guidance](https://commission.europa.eu/law/law-topic/data-protection/rules-business-and-organisations/principles-gdpr/what-information-must-be-given-individuals-whose-data-collected_en).

## What EcoWise Italy should be found for

These are intent clusters, not claimed search-volume figures. Search Console and a paid keyword dataset are required before assigning reliable volume.

### Primary English school cluster

| Search intent | Target page | Commercial value |
| --- | --- | --- |
| outdoor education Italy | `/for-schools/` | Core category |
| school trips Italy nature | `/for-schools/` | High |
| residential school trips Italy | `/for-schools/residential-field-trips/` | High |
| international school trips Italy | New focused landing page or expanded schools hub | High |
| environmental education trips Italy | `/for-schools/science-ecology-environment-field-trips/` | High |
| IB Biology field trip Italy | `/for-schools/science-field-work-data-collection-trips/` | Very high |
| IB ESS fieldwork Italy | Same fieldwork page with a dedicated section | Very high |
| PYP outdoor learning Italy | Schools hub/programme page | High |
| service learning trips Italy | `/for-schools/outdoor-service-education-projects/` | High |
| ecoliteracy camps Italy | Wilderness/camps page | Medium-high |
| English language nature camp Italy | Italian schools page / future camp page | High |

### Primary Italian school cluster

| Search intent | Target page |
| --- | --- |
| gite scolastiche Piemonte | `/per-le-scuole-italiane/` |
| gite didattiche natura Piemonte | Italian schools page |
| educazione ambientale Piemonte scuole | Italian schools page |
| campi scuola Piemonte | Italian residential section/page |
| gite scolastiche Torino natura | Italian location/programme page |
| gite scolastiche Asti | Italian location/programme page |
| educazione ambientale in inglese Piemonte | Italian schools page |
| laboratori CLIL scienze natura | New section/page |
| campi estivi in inglese Piemonte | Future camp page when dates exist |

The terminology is aligned with active regional demand. Regione Piemonte explicitly promotes “Green Education” and collaboration between schools and environmental organisations: [Regione Piemonte sustainability education](https://www.regione.piemonte.it/web/temi/ambiente-territorio/green-economy/educazione-alla-sostenibilita). Gran Paradiso markets its landscape as an outdoor teaching laboratory with tailored school programmes: [Gran Paradiso environmental education](https://www.pngp.it/Educazione-ambientale).

### Corporate cluster

| Search intent | Target page |
| --- | --- |
| team building Piemonte | `/corporate-team-building-vacation/` |
| team building natura Piemonte | Corporate page |
| team building sostenibile Torino | Corporate page or city-specific section |
| corporate retreat Piemonte | Corporate page |
| eco team building Italy | Corporate page |
| outdoor team building northern Italy | Corporate page |
| CSR team building Italy | Future impact/service programme |

Competitors currently win with named case studies, outcomes, group sizes, catalogues, FAQs and immediate consultation calls. WildSteps displays recognisable corporate clients, an NPS claim and a direct meeting CTA: [WildSteps corporate site](https://wildsteps.com/en/). zeroCO2 explains activities, seasons, group sizes, services and repeatedly asks for a consultation: [zeroCO2 team building](https://zeroco2.eco/it/servizi/organizza-eventi-e-team-building/).

### Family and private-group cluster

| Search intent | Target page |
| --- | --- |
| family eco adventure Italy | `/family-ecoadventures/` |
| family nature holiday Piemonte | Family page |
| wildlife tour Piemonte | `/gateways/italian-wildlife-ecology-tour/` |
| wolf tracking Italy / Piemonte | Wildlife page, only with precise expectation-setting |
| eco retreat Piemonte | `/gateways/green-retreats/` |
| nature retreat northern Italy | Green retreats page |

Do not invest heavily in these terms until the business confirms available dates, minimum group size, “from” pricing, fitness level, accommodation responsibility, cancellation terms and whether a licensed tour operator/DMC contracts the travel components.

## Search visibility and technical SEO

### What is working

- All 35 sitemap URLs return HTTP 200.
- Each indexed route has one H1.
- Existing routes have correct HTTPS self-canonicals.
- Internal links tested during the audit resolve.
- `robots.txt` is valid and advertises the WordPress sitemap.
- The full 36-route compatibility contract and 35-URL sitemap survived the custom-theme migration.
- Current server response time was healthy in a simple UK connection test: approximately 0.13–0.14 seconds to first byte on the homepage, schools and contact routes. This is not a substitute for Core Web Vitals.

### Critical SEO gaps

All 36 fidelity documents lack:

- unique meta descriptions;
- Open Graph metadata;
- Twitter card metadata;
- JSON-LD structured data.

Google can generate snippets from page copy, but explicitly recommends useful, page-specific descriptions where they better describe the result: [Google snippet guidance](https://developers.google.com/search/docs/appearance/snippet). Structured data helps Google understand an organisation and its content: [Google structured-data overview](https://developers.google.com/search/docs/appearance).

The homepage title is only `EcoWise Italy`. Commercial page titles mostly describe a generic service without the audience or location. Suggested first title set:

| Route | Recommended title |
| --- | --- |
| `/` | `Outdoor Education & School Trips in Italy | EcoWise Italy` |
| `/for-schools/` | `Outdoor Education & School Trips in Italy | EcoWise Italy` |
| `/for-schools/residential-field-trips/` | `Residential School Trips in Italy | EcoWise Italy` |
| `/for-schools/science-field-work-data-collection-trips/` | `IB Biology & ESS Fieldwork in Italy | EcoWise Italy` |
| `/per-le-scuole-italiane/` | `Gite Scolastiche e Outdoor Education in Piemonte | EcoWise Italy` |
| `/corporate-team-building-vacation/` | `Corporate Team Building in Piemonte, Italy | EcoWise Italy` |
| `/family-ecoadventures/` | `Family Eco Adventures in Piemonte | EcoWise Italy` |
| `/gateways/` | `Nature Retreats & Eco Tours in Piemonte | EcoWise Italy` |

Metadata must be implemented inside the custom fidelity renderer or baked into the snapshots. Mapped routes exit before normal `wp_head` execution, so installing an SEO plugin alone will not change these pages.

Recommended route-keyed SEO manifest:

- title;
- unique description;
- canonical;
- OG title/description/image/type;
- Twitter card;
- robots directive;
- language/hreflang;
- Organization/LocalBusiness data;
- Service data for commercial pages;
- Article data for real posts;
- BreadcrumbList data.

### Duplicate and low-value indexation

`/news/`, `/author/admin/` and `/category/uncategorized/` render effectively the same archive with separate self-canonicals. `/2024/09/22/` is also indexable outside the sitemap.

Recommended destination:

- keep `/news/` as the canonical archive;
- redirect or noindex the author, uncategorized and date archives;
- remove user/category sitemap providers;
- avoid publicly exposing `/author/admin/`.

Because the project rulebook currently preserves every indexed route, make this change only with a recorded redirect/noindex migration and Search Console evidence. Do not simply delete URLs.

### Language and local SEO

`/per-le-scuole-italiane/` is Italian content served as `en-US`, with no hreflang. It is also poorly linked. Set the correct `it-IT` language for that route, expose it from the schools journey and add English/Italian alternates only where true counterparts exist.

The contact page contains a physical address, phone and email, but the global footer omits the address. Add consistent business identity and NAP data sitewide. An official Piemonte operator listing records EcoWise Italy and its environmental-education/ecotourism history: [Regione Piemonte operator record](https://secure.regione.piemonte.it/fpl/elenco/eael.htm). Business/legal details must be checked with the owner/accountant before publishing schema or footer identifiers.

Claim and complete an owner-controlled Google Business Profile if the address is customer-facing and eligible. Use current photos, service areas, categories, phone, website and reviews. Do not create a misleading storefront if customers are not received there.

### Content and link quality

Several commercial routes are thin after repeated navigation/footer text is removed, especially corporate, gallery, contact, wilderness camps, mindfulness, science fieldwork and short getaway pages.

Add useful buying information rather than filler:

- intended audience and age/year group;
- learning outcomes;
- day/residential duration;
- typical group size;
- location and travel time;
- season and weather alternative;
- inclusions/exclusions;
- accommodation/transport responsibility;
- accessibility and fitness;
- risk/safeguarding process;
- sample itinerary;
- indicative “from” price or quote factors;
- relevant testimonial/case study;
- FAQ;
- one contextual enquiry action.

Many programme pages receive only one or two contextual internal links. Create clear school, corporate and family hubs and cross-link by real user need.

Replace stale Wayback links on transport/accommodation pages with current authoritative sources. One archived car-hire destination now resolves to a parked domain.

### Performance risks

The homepage HTML is roughly 85 KB and references about 28 scripts and 31 stylesheets. Local referenced assets total roughly 5.46 MB. Three recent homepage JPGs are approximately 1.67 MB, 1.44 MB and 0.86 MB.

Priorities:

1. generate correctly sized WebP/AVIF variants for hero/collage images;
2. preload only the first meaningful hero image;
3. lazy-load below-fold media;
4. remove unused bundled Elementor/ElementsKit compatibility assets route by route;
5. reduce the 451 KB ElementsKit stylesheet and other legacy payloads;
6. review the `private, max-age=300` snapshot cache policy for anonymous users;
7. verify mobile Core Web Vitals using Search Console field data after analytics ownership is established.

No PageSpeed score is claimed because the PageSpeed API was rate-limited during this audit.

## UX and customer journey

### Current homepage problem

The hero offers five equal actions:

- Schools & Education;
- Service Education Projects;
- Outdoor Education Tutorials;
- Corporate Team Building;
- Vacations and Eco Adventures.

This mixes buyers, products and editorial resources. There is no dominant lead action. The poetic statement is distinctive but does not immediately answer:

- who this is for;
- where it happens;
- what can be booked;
- why EcoWise Italy is trusted;
- what the visitor should do next.

Recommended homepage sequence:

1. clear proposition: outdoor education and tailored nature programmes in Piemonte;
2. primary action: `Request a school trip proposal`;
3. secondary action: `Explore programmes`;
4. three audience cards: Schools, Families, Teams;
5. proof strip: 20+ years, IB experience, named schools, risk assessed, Piemonte;
6. three-step process;
7. selected audience-relevant testimonials;
8. practical CTA;
9. resources/news below the commercial journey.

### Navigation

Recommended primary navigation:

- Schools
- Families
- Corporate
- About & Safety
- Resources
- `Plan a trip` button

Expose Italian schools as a clear language/audience route if that segment is approved. Corporate should not be discoverable only from a homepage button. Keep News and Gallery available, but not ahead of buying paths.

### Commercial-page template

Every programme page should follow:

1. audience-fit summary;
2. outcomes;
3. programme choices/sample itinerary;
4. practical facts;
5. safety and trust proof;
6. relevant testimonial/case study;
7. FAQ;
8. contextual form or proposal CTA.

The current schools page contains excellent proof but no in-content conversion action. The family page is a very long mobile scroll through essay-length concepts. The corporate page is extremely short and contains no corporate case study, package, logistics, price guidance or CTA.

### Contact and form friction

The current form requires email, phone and subject while leaving the actual message optional. It has no stated response time, programme selector, privacy link or consent.

Replace it with audience-specific forms.

School proposal fields:

- school and contact role;
- country/city;
- age/year group;
- number of students/adults;
- preferred dates;
- day or residential;
- curriculum/learning objectives;
- accessibility/dietary considerations at a high level;
- message;
- source/UTM captured automatically.

Family fields:

- adults and children's ages;
- date range/nights;
- interests;
- fitness/accessibility;
- accommodation preference;
- approximate budget range.

Corporate fields:

- company and role;
- headcount;
- dates/location;
- desired outcomes;
- duration;
- approximate budget;
- message.

Each flow should promise a realistic response time, show a thank-you page, send an owner notification and visitor confirmation, and create a lead record even if email fails.

### Trust deployment

Move proof closer to decisions:

- named school logos with permission;
- a “20 years in outdoor education” fact;
- IB/PYP/ESS experience;
- a plain-language safety process;
- downloadable sample risk pack or trip-planning guide;
- staff qualifications and responsibilities;
- insurance/safeguarding facts after verification;
- current partner/case-study pages;
- programme-specific testimonials.

The current 2026 Ranger Camp partnership is strong external proof of active delivery: [Ranger Camp in the Maritime Alps](https://www.areeprotettealpimarittime.it/agenda/4529/ranger-camp-ii-edizione). Turn completed programmes like this into durable case studies with outcomes, ages, partner quotes, photos and a next-season interest form.

Competitors demonstrate why this matters. World Expeditions immediately combines tailored itineraries, scale, service-learning proof and risk management with a consultation CTA: [World Expeditions Schools](https://worldexpeditionsschools.com/countries/italy).

## Lead engine

### Required operating stack

Do not buy traffic before this exists:

1. domain inboxes such as `schools@ecowiseitaly.com` and `hello@ecowiseitaly.com`;
2. authenticated SMTP with SPF, DKIM and DMARC;
3. a CRM/lead ledger with owner access;
4. automatic source/UTM capture;
5. owner notification, visitor confirmation and failure alert;
6. GA4 or privacy-conscious equivalent;
7. Google Search Console;
8. conversion events for successful forms, proposal CTA, telephone, email, WhatsApp and scheduled call;
9. privacy/cookie notices and consent controls appropriate to the chosen tools;
10. monthly dashboard: leads, qualified leads, proposals, wins and revenue by source.

Search Console is essential because it reports the queries that actually expose the site and highlights high-impression/low-CTR opportunities: [Google Search Console performance guidance](https://support.google.com/webmasters/answer/17010961?hl=en).

### Lead magnets

Build assets that are useful to decision-makers:

- School Trip Planning Pack for Piemonte;
- sample two-day and three-day itineraries;
- IB Biology/ESS fieldwork menu;
- Outdoor Education Risk-Planning Checklist;
- programme-by-age guide;
- Ranger Camp/new-season priority list;
- Corporate Nature Retreat Planner.

Do not gate every resource. Use one or two high-value downloads to earn an email; leave core safety and suitability facts open.

### Follow-up

Minimum lead stages:

`New → Contacted → Qualified → Proposal sent → Follow-up → Won/Lost`

Service standard:

- immediate confirmation;
- human reply within one working day;
- discovery call offered when useful;
- proposal within an agreed deadline;
- scheduled follow-up rather than relying on memory;
- lost reason recorded.

## Ninety-day roadmap

### Days 0–7: stop losing leads

- remove the former developer's email from every form path;
- approve owner/domain inbox routing;
- configure and test SMTP;
- create a simple owned lead ledger/CRM;
- add privacy information and compliant newsletter consent;
- add a visible `Plan a school trip` CTA to the homepage and Schools page;
- add tracked phone/email/WhatsApp actions;
- set up Search Console and conversion analytics;
- test every form end to end.

Success gate: five controlled submissions from different routes/devices appear in the lead ledger, reach the correct owners and produce confirmations.

### Days 8–30: build the school sales path

- reposition the homepage around three audiences with Schools dominant;
- rebuild the Schools hub around fit, outcomes, safety, logistics and proof;
- create the school proposal form and thank-you page;
- publish sample itineraries and risk-planning lead magnet;
- optimise titles/descriptions/social cards/schema for priority routes;
- correct the Italian page language and make it discoverable;
- create the IB Biology/ESS fieldwork landing experience;
- add contextual CTAs to every school programme;
- publish one current case study.

Success gate: visitors can establish fit and request a qualified proposal without searching the site or writing an unstructured email.

### Days 31–60: establish authority

- publish two school case studies;
- publish practical teacher resources answering real planning questions;
- request permission for school logos and fresh reviews;
- build relevant links/partnership citations from schools, protected areas, accommodation partners and education directories;
- update Google Business Profile;
- remove or migrate duplicate archives with redirect/noindex controls;
- replace stale transport/accommodation links;
- optimise heavy images and legacy assets.

Success gate: non-branded Search Console impressions grow across the agreed school-intent cluster.

### Days 61–90: launch the second engine

- interview the owners to define three real corporate packages;
- create a corporate case study or pilot offer;
- add outcomes, group sizes, seasonality, logistics and indicative pricing;
- launch a corporate proposal/call flow;
- decide whether family adventures have genuine availability and compliant booking partners;
- condense family concepts into three or four bookable options if approved.

Success gate: each active audience has a defined offer, proof, qualification form, owner and follow-up process.

## Measures that matter

Baseline these before judging SEO:

- non-branded organic impressions;
- clicks and CTR by target query cluster;
- organic landing-page sessions;
- proposal CTA click rate;
- form start and completion rate;
- qualified leads by audience/source;
- median response time;
- proposals sent;
- lead-to-proposal rate;
- proposal-to-win rate;
- booked revenue by source;
- lost-lead reason.

Initial directional targets after a clean baseline:

- 100% of submissions stored and delivered;
- response within one working day;
- at least 3–5% conversion from qualified commercial landing-page visits to enquiry;
- increasing non-branded impressions month over month;
- every new article/case study linked to one commercial next step.

Do not optimise for raw traffic, Facebook embed count or newsletter signups that are not followed up. The unit that matters is a qualified conversation.

## Owner answers and remaining evidence

Adam answered the following operating questions on 28 July 2026. The answers and safe publishing boundaries are now captured in `BUSINESS-BRIEF.md`; this list is retained as the audit trail of what was asked:

1. Which work should be prioritised: schools, families, corporate or a specific mix?
2. Which email/phone/WhatsApp should receive each lead?
3. Who owns reply and follow-up?
4. What response time can be promised?
5. Which 2026–2027 dates are genuinely available?
6. What are typical group sizes, ages, durations and minimum prices?
7. What is included/excluded?
8. Who contracts transport and accommodation?
9. What insurance, qualifications, safeguarding and cancellation terms can be published?
10. Which school/company logos and testimonials have permission?
11. Is the Via Mazzini address customer-facing and current?
12. Are the legal entity, VAT number and business details still current?

The remaining blockers are supporting specifics rather than strategic decisions: exact ages and staffing ratios; the corrected longer-trip duration; sample or indicative pricing; calendar-confirmed dates; current insurance, qualification, safeguarding and cancellation documents; logo/testimonial permissions; and verified legal/VAT wording.

## Recommended implementation order

1. Lead routing, privacy and delivery reliability.
2. Measurement.
3. Schools conversion path.
4. Priority metadata/schema.
5. Case studies and proof.
6. Italian school route.
7. Corporate offer.
8. Family offer.
9. Performance cleanup.
10. Paid search only after conversion tracking and offer fit are proven.

The fastest path to leads is not “more SEO content.” It is converting the site’s existing school credibility into a clear proposal journey, then using search content and partnerships to feed that journey.
