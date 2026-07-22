# Site-wide visual system

## Heading semantics and visual fidelity

Each captured route must expose exactly one H1. Semantic tag corrections must retain the existing Elementor classes and computed typography, including responsive font-size variables, so document-outline improvements never alter wrapping, section height or rhythm.

## Character

The site combines a practical outdoor-education service with the warmth of a nature journal. It should feel knowledgeable, friendly and grounded: large documentary photography, deep dark text, fresh greens, rounded calls to action and generous breathing room. Avoid glossy corporate gradients, generic SaaS cards or decorative effects that compete with the photographs.

## Core tokens

| Role | Value |
|---|---|
| Heading family | Outfit |
| Body family | Rubik |
| Primary green | `#45A14E` |
| Pale leaf | `#E6EFB7` |
| Main ink | `#171818` |
| Deep night | `#080C14` |
| Body grey | `#666666` |
| White | `#FFFFFF` |
| Light surfaces | `#EAEDF1`, `#F6F7FB`, `#DCDCDE`, `#D5D5D5` |
| Warm accent | `#EEA731` |
| Maximum content width | `1280px` |
| Standard component gap | `20px` |
| Pill/button radius | `30px` |
| Input radius | `7px` |

Use the CSS custom properties in `assets/css/site.css`. Add a token only when the value recurs or represents a durable role.

## Typography

Desktop reference sizes:

- H1: 48px / 1.2
- H2: 39px / 1.2
- H3: 31px / 1.3
- H4: 25px / 1.3
- H5: 20px / 1.4
- H6/eyebrow: 14px uppercase with 1px tracking
- Body: 16px / 1.4
- Display: 61px desktop, 44px tablet, 32px mobile

Tablet H1/H2/H3 reduce to 37/31/25px. Mobile reduces to 30/24/20px. Headings use Outfit and should normally balance across lines; paragraphs use Rubik. Keep prose measures near 65–75 characters.

## Header and navigation

On photographic hero pages, the desktop header visually overlays the hero with white navigation, a translucent bottom border and high stacking context. The desktop composition splits navigation around a centered logo. Tablet/mobile uses a dedicated compact header and burger control; do not merely squeeze the desktop row.

Navigation is Outfit 15px weight 600. Hover and focus use pale leaf/green contrast. Dropdowns must be keyboard operable and remain inside the viewport. Sticky behavior must not cover anchor targets.

## Buttons and form controls

Primary buttons are Outfit 13px weight 600, uppercase, white on primary green, with a 1px green border and 30px radius. Provide a clear hover and focus change and a visible focus ring independent of color. Minimum touch height is 44px.

Inputs use Rubik 14px on a light grey surface, 7px radius and persistent visible labels. Focus changes to white with a green border and outline. Error text sits beside the relevant field and is also announced programmatically.

## Section rhythm

Use strong alternation between open white sections, pale natural surfaces, photographic bands and green/dark calls to action. Desktop vertical padding generally falls between 80 and 130px; tablet between 64 and 96px; mobile between 48 and 72px. Do not stack several unrelated sections with identical white backgrounds and spacing.

The original site frequently uses a pyramid/mountain SVG divider at the bottom of heroes. Preserve it where it anchors the page identity, but do not introduce it to templates that did not have it.

## Imagery

Photography is documentary rather than stock-like: real groups, outdoor learning, Piemonte landscapes, wildlife and hands-on activity. Preserve the selected source image for each reference route. Use responsive WordPress derivatives, explicit dimensions and `object-fit: cover` only when the reference crops the image.

Collage images may use slight rotation and overlap. Keep faces and learning activity visible at every breakpoint. Decorative images use empty alt text; meaningful images need concise alt text that describes purpose, not filenames.

## Components

The recurring native vocabulary is: Hero, Section, SplitMedia, PortalLinks, CardGrid, FlipCard, IconList, CTA, Testimonials, Gallery, Video, PdfEmbed, PostGrid, ContactForm, Map and SiteFooter. Prefer these shared structures over route-specific markup.

Flip interactions need equivalent focus/tap behavior and cannot hide essential information behind hover alone. Carousels require previous/next controls, sensible announcements, swipe support and a reduced-motion mode. Embeds require a useful link fallback.

## Responsive and motion rules

Primary breakpoints are 1024px and 767px. Always inspect 1440, 1024, 768 and 390px widths. At narrow widths, preserve content order, avoid horizontal scrolling, convert multi-column cards to one column and keep buttons from becoming cramped.

Honor `prefers-reduced-motion`. Ken Burns, carousel autoplay and decorative transitions must stop or become effectively instant. Content cannot depend on animation to appear.
