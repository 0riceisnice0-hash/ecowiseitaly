# Homepage architecture

## Approved July 2026 image configuration

`content/homepage-updates.json` is the source of truth for the five hero slides and the three About-collage photographs. The approved hero order is `Ecowise-Italy-211.jpg`, `mindfulll.jpg`, `Ecowise-Italy-254.jpg`, the locally retained `river-fieldwork.jpeg`, and `ecowisely-tour-22.jpg`. The first four were supplied directly; the fifth is the first image from the supplied Gallery page because only four concrete hero files accompanied the five-image request.

`Ecowise-Italy-211.jpg` uses `background-size: contain` so its complete landscape remains visible; the other slides retain cover cropping. The About collage places the city-square group in the central red frame, the field group in the bottom-left yellow frame and the natural-pool group in the top-right yellow frame.

Customer-facing homepage copy uses `EcoWise Italy`. This presentation rule does not alter the logo artwork, domain, URLs, slugs, media filenames or technical identifiers.

The visible hero statement, “EcoWise Italy: Bringing nature to learning, bringing learning to life!”, is the page's sole H1. Its fidelity classes and widget-specific typography remain unchanged; only the semantic tag differs from the faulty live capture.

## Purpose

The homepage is a service gateway, not a generic brand manifesto. A visitor should understand within one screen that Ecowise Italy connects learning and nature, then choose the relevant school, service, corporate or eco-adventure path.

The canonical homepage is `/` and corresponds to WordPress page ID 6. `/home/` is an alias and must redirect to `/`.

## Reference sequence

1. Overlay header and centered brand/navigation.
2. Full-width slideshow hero using the five entries in `content/homepage-updates.json`.
3. Main promise: “EcoWise Italy: Bringing nature to learning, bringing learning to life!”
4. Supporting explanation about storytelling, mindfulness and unplugged outdoor adventure.
5. Five portal calls to action:
   - Schools & Education
   - Service Education Projects
   - Outdoor Education Tutorials
   - Corporate Team Building
   - Vacations and Eco Adventures
6. Pyramid/mountain bottom divider.
7. About EcoWise Italy split-media section with layered, slightly rotated photography and “Who we are / About EcoWise Italy” copy.
8. “What we offer Schools” section with six interactive service cards linking to the existing school routes.
9. Testimonial section and rotating testimonial content.
10. Global green footer with organization, service and contact information.

Do not place an unrelated announcement, blog feed or lead magnet above the five primary portal choices without explicit approval.

## Hero behavior

The five images rotate every 5,000ms with an approximately 500ms fade and restrained Ken Burns movement. The sequence loops. Text remains readable with a stable overlay and does not shift as images load.

Requirements:

- Preload only the first image; lazy-load the remainder.
- Reserve hero height to prevent layout shift.
- Stop decorative zoom and autoplay for reduced-motion visitors.
- Pause when the page is hidden; avoid needless background work.
- Keep every text/button interaction independent of slideshow state.
- On mobile, crop deliberately around subjects instead of shrinking the entire desktop composition.

## Portal calls to action

The five choices are part of the hero information architecture. Keep their labels and destinations stable. At desktop sizes they may occupy grouped rows; on mobile they become full-width, comfortably separated controls. Their hierarchy is peer-level even if “Schools & Education” has stronger visual emphasis.

## About section

The image collage is an important handmade cue. It uses real EcoWise Italy imagery, restrained rotation and overlap. The large photograph has its captured 14px frame in red `#CF2E2E`; the two smaller tilted photographs retain their captured 10px frames in yellow `#FCB900`. These approved colors live in `assets/css/homepage.css`; do not change the image dimensions, rotations, overlap or shadows when maintaining them. The copy must remain the original three-paragraph explanation about reinforcing school teaching, Piemonte and UNESCO recognition unless content owners approve an editorial change.

## School offer cards

The six cards summarize distinct school services and link to their established child pages. Preserve both short and expanded descriptions from the current page. A desktop hover reveal must have a keyboard and tap equivalent; the card title and destination are always discoverable.

## Testimonials

Testimonials are evidence, not decoration. Preserve full attribution and role/school context. One item may be emphasized at a time, but all content must remain available without autoplay. Provide controls and prevent a long quote from causing disruptive height changes where possible.

## Homepage SEO and accessibility

The captured homepage has no H1 and no meta description. During fidelity sign-off this is documented rather than silently changing layout. The first native homepage migration should promote the main promise to the single H1 and add an owner-approved description without changing visible wording.

All meaningful images need alt text, controls need accessible names, focus order follows visual order, and the pale-green/white combinations must be checked for sufficient contrast.

## Acceptance checks

- Section order, copy, links and image identity match the reference.
- Header overlay and hero height match at 1440, 1024, 768 and 390px.
- First meaningful content paints without waiting for slideshow JavaScript.
- All five portals and all six school cards work by keyboard and touch.
- Reduced motion disables zoom/autoplay.
- Canonical is exactly `https://ecowiseitaly.com/` and only one canonical is present.
- No Elementor/ACF PHP API, shortcode or editor dependency is required.
