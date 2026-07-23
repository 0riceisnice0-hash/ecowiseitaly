#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const repositoryRoot = path.resolve(process.argv[2] || '.');
const themeRoot = path.join(repositoryRoot, 'wp-content', 'themes', 'ecowise-custom');
const capturedRoutes = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'audit', 'captured-routes.json'), 'utf8'));
const indexedRoutes = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'audit', 'indexed-routes.json'), 'utf8'));
const uploadManifest = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'audit', 'source', 'uploads-manifest.json'), 'utf8'));
const backupRoutes = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'audit', 'source', 'backup-routes.json'), 'utf8'));
const editorialUpdates = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'content', 'editorial-updates.json'), 'utf8'));
const backupObjectIds = new Map(backupRoutes.filter((item) => item.route && item.id).map((item) => [item.route, Number(item.id)]));
const uploadPaths = new Set(uploadManifest.map((item) => item.path.replaceAll('\\', '/')));
const referencedUploads = new Set();
const internalPageLinks = new Set();
let facebookEmbedCount = 0;
const facebookEmbedUrls = new Set();
let pdfViewerCount = 0;
const archivePdfPaths = [
  '/wp-content/uploads/2024/12/PG_SPR_2020_Rose-dragged.pdf',
  '/wp-content/uploads/2024/12/PG_SPR_2020_Rose-dragged-2.pdf',
  '/wp-content/uploads/2024/12/PG_SPR_2020_Rose-dragged-1.pdf',
  '/wp-content/uploads/2024/12/PG_Autumn_2014_ROSE-3_2.pdf',
];
const pdfViewersByRoute = new Map();
let contactFormCount = 0;
let newsletterFormCount = 0;
let unnamedAnchorCount = 0;
let untitledIframeCount = 0;
let lightboxActionCount = 0;
let unlabeledLightboxActionCount = 0;
let youtubeFallbackCount = 0;
let hostedVideoFallbackCount = 0;
const accessibleImageAltCounts = new Map([
  ['67', { text: 'Ecowise Italy', expected: 108, actual: 0 }],
  ['94', { text: 'A rare sighting of Wolves', expected: 9, actual: 0 }],
  ['129', { text: 'Spring Friends', expected: 10, actual: 0 }],
  ['25', { text: 'Tracks in the Snow', expected: 7, actual: 0 }],
  ['2598', { text: 'Adam Rose', expected: 3, actual: 0 }],
  ['2622', { text: 'Yenka Honig', expected: 3, actual: 0 }],
]);
const footerSchoolLinks = new Map([
  ['/for-schools/science-ecology-environment-field-trips/', 'Science, Ecology &amp; Environment Field trips'],
  ['/for-schools/outdoor-service-education-projects/', 'Outdoor Service Education Projects'],
  ['/for-schools/storytelling-drama-experiences-in-nature/', 'Storytelling &amp; Drama Experiences in Nature'],
  ['/for-schools/team-building-wild-rites-of-passage/', 'Team Building &amp; Wild Rites of Passage'],
  ['/for-schools/mindfulness-and-nature-awareness-workshops/', 'Mindfulness and Nature Awareness Workshops'],
  ['/for-schools/wilderness-encounter-groups-ecoliteracy-camps/', 'Wilderness encounter groups &amp; Ecoliteracy Camps'],
]);
const footerSchoolLinkCounts = new Map([...footerSchoolLinks.keys()].map((route) => [route, 0]));
const headingContracts = new Map([
  ['/', [{ elementId: '952c8e2', tagName: 'h1' }]],
  ['/for-schools/conflict-resolution-program/', [
    { elementId: 'bb0246b', tagName: 'h1' },
    { elementId: '3bac217', tagName: 'h2', preservesH1Typography: true },
  ]],
  ['/for-schools/team-building-wild-rites-of-passage/', [
    { elementId: '9819aa8', tagName: 'h1' },
    { elementId: '799a1c0', tagName: 'h2', preservesH1Typography: true },
  ]],
]);
const errors = [];
const warnings = [];

function countMatches(value, pattern) {
  return [...value.matchAll(pattern)].length;
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

for (const route of capturedRoutes) {
  const file = path.join(repositoryRoot, ...route.snapshot.split('/'));
  if (!fs.existsSync(file)) {
    errors.push(`${route.route}: snapshot is missing (${route.snapshot})`);
    continue;
  }

  const html = fs.readFileSync(file, 'utf8');
  const contentTargetCount = countMatches(html, /\bid=["']content["']/gi);
  if (contentTargetCount !== 1) errors.push(`${route.route}: expected one #content skip-link target; found ${contentTargetCount}`);
  if (countMatches(html, /<a\b[^>]*\bhref=["']#content["']/gi) !== 1) errors.push(`${route.route}: expected one skip link to #content`);
  if (countMatches(html, /\brole=["']main["']/gi) !== 1) errors.push(`${route.route}: expected one main landmark`);
  if (countMatches(html, /\brole=["']main["'][^>]*\btabindex=["']-1["']/gi) !== 1) errors.push(`${route.route}: expected a keyboard-focusable main landmark`);
  if (countMatches(html, /\brole=["']banner["']/gi) !== 1) errors.push(`${route.route}: expected one banner landmark`);
  if (countMatches(html, /\brole=["']contentinfo["']/gi) !== 1) errors.push(`${route.route}: expected one contentinfo landmark`);
  for (const label of ['Primary services navigation', 'Primary services dropdown navigation', 'Information navigation', 'Information dropdown navigation', 'Mobile navigation', 'Mobile dropdown navigation']) {
    if (countMatches(html, new RegExp(`<nav\\b[^>]*\\baria-label=["']${escapeRegExp(label)}["']`, 'gi')) !== 1) errors.push(`${route.route}: expected one ${label} landmark`);
  }
  for (const image of html.matchAll(/<img\b[^>]*>/gi)) {
    for (const [attachmentId, contract] of accessibleImageAltCounts) {
      if (new RegExp(`\\bwp-image-${attachmentId}\\b`).test(image[0]) && new RegExp(`\\balt=["']${escapeRegExp(contract.text)}["']`, 'i').test(image[0])) {
        contract.actual += 1;
      }
    }
  }
  for (const anchor of html.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/gi)) {
    const attributes = anchor[1];
    const body = anchor[2];
    const ariaLabel = attributes.match(/\baria-label\s*=\s*["']([^"']*)/i)?.[1] || '';
    const title = attributes.match(/\btitle\s*=\s*["']([^"']*)/i)?.[1] || '';
    const imageAlts = [...body.matchAll(/<img\b[^>]*\balt\s*=\s*["']([^"']*)/gi)].map((match) => match[1]).join('');
    const text = body.replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, '').replace(/&nbsp;|&#160;/gi, ' ').trim();
    if (!(ariaLabel || title || imageAlts || text)) unnamedAnchorCount += 1;
    if (/\bdata-elementor-open-lightbox=["']yes["']/i.test(attributes)) {
      lightboxActionCount += 1;
      if (!ariaLabel) unlabeledLightboxActionCount += 1;
    }
  }
  for (const iframe of html.matchAll(/<iframe\b[^>]*>/gi)) {
    if (!/\btitle\s*=\s*["'][^"']+["']/i.test(iframe[0])) untitledIframeCount += 1;
  }
  youtubeFallbackCount += countMatches(html, /<noscript><p><a href=["']https:\/\/www\.youtube\.com\/watch\?v=[^"']+["']>Watch this Ecowise video on YouTube<\/a><\/p><\/noscript>/gi);
  hostedVideoFallbackCount += countMatches(html, /<video\b(?=[^>]*\baria-label=["']Ecowise Italy trip video["'])[^>]*>\s*<a href=["'][^"']+\.mp4["']>Download the Ecowise video<\/a>\s*<\/video>/gi);
  const h1Count = countMatches(html, /<h1\b/gi);
  if (h1Count !== 1) errors.push(`${route.route}: expected one H1; found ${h1Count}`);
  for (const headingContract of headingContracts.get(route.route) || []) {
    const widgetPattern = new RegExp(`data-id="${headingContract.elementId}"[^>]*>\\s*<div class="elementor-widget-container">\\s*<${headingContract.tagName}\\b([^>]*)>`, 'i');
    const widgetMatch = html.match(widgetPattern);
    if (!widgetMatch) {
      errors.push(`${route.route}: heading widget ${headingContract.elementId} is not ${headingContract.tagName}`);
    } else if (headingContract.preservesH1Typography && !/font-size:var\(--e-global-typography-583e54c-font-size\)/i.test(widgetMatch[1])) {
      errors.push(`${route.route}: semantic H2 widget ${headingContract.elementId} does not preserve its captured H1 typography`);
    }
  }
  contactFormCount += countMatches(html, /name=["']form_id["'][^>]*value=["']68574d28["']/gi);
  newsletterFormCount += countMatches(html, /name=["']form_id["'][^>]*value=["']1b3fffa7["']/gi);
  for (const [footerRoute, label] of footerSchoolLinks) {
    const footerPattern = new RegExp(`<a href=["']${escapeRegExp(footerRoute)}["']>\\s*<span class=["']elementor-icon-list-text["']>${escapeRegExp(label)}</span>`, 'gi');
    footerSchoolLinkCounts.set(footerRoute, footerSchoolLinkCounts.get(footerRoute) + countMatches(html, footerPattern));
  }
  if (backupObjectIds.has(route.route) && route.wordpressObjectId !== backupObjectIds.get(route.route)) {
    errors.push(`${route.route}: audit object ID ${route.wordpressObjectId} does not match backup ID ${backupObjectIds.get(route.route)}`);
  }
  const canonicalCount = countMatches(html, /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi);
  if (canonicalCount !== 1) errors.push(`${route.route}: expected one canonical; found ${canonicalCount}`);
  if (!html.includes(`href="${route.canonical}" rel="canonical"`)) errors.push(`${route.route}: canonical does not match ${route.canonical}`);
  if (/__q_[0-9a-f]+/i.test(html)) errors.push(`${route.route}: mirror query-hash artifact remains`);
  if (/google_gtagjs-js/i.test(html)) errors.push(`${route.route}: captured analytics script remains`);
  if (/www\.clarity\.ms|vf3beobmuf/i.test(html)) errors.push(`${route.route}: captured Microsoft Clarity tracker remains`);
  if (/wp-admin\\?\/admin-ajax\.php|d495937646|4170390df8|139b2d20a6/i.test(html)) errors.push(`${route.route}: captured plugin endpoint or stale nonce remains`);
  if (/https:\\?\/\\?\/ecowiseitaly\.com\\?\/wp-content\\?\/plugins\\?\/(?:elementor|elementor-pro)\\?\/assets\\?\//i.test(html)) {
    errors.push(`${route.route}: legacy Elementor runtime asset base remains`);
  }

  for (const match of html.matchAll(/(?:href|src)=["'](\/wp-content\/themes\/ecowise-custom\/assets\/fidelity\/site\/[^"']+)["']/gi)) {
    const local = path.join(themeRoot, 'assets', 'fidelity', 'site', ...match[1].split('/assets/fidelity/site/')[1].split('/'));
    if (!fs.existsSync(local)) errors.push(`${route.route}: vendored asset is missing (${match[1]})`);
  }

  for (const attribute of html.matchAll(/\b(?:href|src|poster|srcset)=["']([^"']+)["']/gi)) {
    const values = attribute[1].split(',').map((candidate) => candidate.trim().split(/\s+/)[0]);
    for (const value of values) {
      if (!value || /^(?:data:|mailto:|tel:|#)/i.test(value)) continue;
      try {
        const publicUrl = new URL(value.replaceAll('&amp;', '&'), route.canonical);
        if (!publicUrl.pathname.startsWith('/wp-content/uploads/')) continue;
        const uploadPath = decodeURIComponent(publicUrl.pathname.slice('/wp-content/uploads/'.length));
        referencedUploads.add(uploadPath);
        if (!uploadPaths.has(uploadPath)) errors.push(`${route.route}: referenced upload is missing from backup (${uploadPath})`);
      } catch {
        warnings.push(`${route.route}: could not parse asset URL (${value})`);
      }
    }
  }

  for (const anchor of html.matchAll(/<a\b[^>]*\bhref=["']([^"']+)["']/gi)) {
    const value = anchor[1];
    if (!value || /^(?:mailto:|tel:|javascript:|#)/i.test(value)) continue;
    try {
      const target = new URL(value.replaceAll('&amp;', '&'), route.canonical);
      if (target.hostname !== 'ecowiseitaly.com' && target.hostname !== 'www.ecowiseitaly.com') continue;
      if (/\/index\.html$/i.test(target.pathname)) errors.push(`${route.route}: mirror-style page link remains (${value})`);
      if (!target.pathname.startsWith('/wp-content/') && !target.pathname.startsWith('/wp-json/') && !target.pathname.startsWith('/wp-admin/')) {
        internalPageLinks.add(`${target.pathname}${target.search}`);
      }
    } catch {
      warnings.push(`${route.route}: could not parse internal link (${value})`);
    }
  }

  for (const form of html.matchAll(/<form\b[^>]*\baction=["']([^"']+)["']/gi)) {
    if (/index\.html/i.test(form[1])) errors.push(`${route.route}: mirror-style form action remains (${form[1]})`);
  }

  for (const iframe of html.matchAll(/<iframe\b[^>]*\bsrc=["']([^"']+)["']/gi)) {
    const value = iframe[1].replaceAll('&amp;', '&');
    if (/(?:\.\.\/)+(?:www\.|maps\.|gmpg\.)/i.test(value)) errors.push(`${route.route}: mirror-style external iframe remains (${iframe[1]})`);
    try {
      const target = new URL(value, route.canonical);
      if (target.hostname === 'www.facebook.com' && target.pathname === '/plugins/post.php') {
        facebookEmbedCount += 1;
        const postUrl = target.searchParams.get('href');
        if (!postUrl) errors.push(`${route.route}: Facebook embed is missing its post URL`);
        else facebookEmbedUrls.add(postUrl);
      }
      if (target.pathname.endsWith('/assets/fidelity/supplemental/pdfjs/web/viewer.html')) {
        pdfViewerCount += 1;
        const pdfFile = target.searchParams.get('file');
        if (!pdfFile) {
          errors.push(`${route.route}: PDF viewer has no file target`);
        } else {
          const routeViewers = pdfViewersByRoute.get(route.route) || [];
          routeViewers.push(pdfFile);
          pdfViewersByRoute.set(route.route, routeViewers);
          if (!pdfFile.startsWith('/wp-content/uploads/')) errors.push(`${route.route}: PDF viewer target is not a WordPress upload (${pdfFile})`);
          else {
            const uploadPath = decodeURIComponent(pdfFile.slice('/wp-content/uploads/'.length));
            referencedUploads.add(uploadPath);
            if (!uploadPaths.has(uploadPath)) errors.push(`${route.route}: PDF viewer upload is missing from backup (${uploadPath})`);
          }
        }
      }
    } catch {
      warnings.push(`${route.route}: could not parse iframe URL (${iframe[1]})`);
    }
  }
}

if (capturedRoutes.length !== 36) errors.push(`expected 36 captured routes; found ${capturedRoutes.length}`);
if (indexedRoutes.length !== 35) errors.push(`expected 35 indexed routes; found ${indexedRoutes.length}`);
const expectedFacebookEmbedCount = 80 + (editorialUpdates.serviceFacebookPosts.length * 5);
const expectedUniqueFacebookPosts = 20 + editorialUpdates.serviceFacebookPosts.length;
if (facebookEmbedCount !== expectedFacebookEmbedCount) errors.push(`expected ${expectedFacebookEmbedCount} Facebook embed instances; found ${facebookEmbedCount}`);
if (facebookEmbedUrls.size !== expectedUniqueFacebookPosts) errors.push(`expected ${expectedUniqueFacebookPosts} unique Facebook post URLs; found ${facebookEmbedUrls.size}`);
if (pdfViewerCount !== 16) errors.push(`expected 16 archive PDF viewers; found ${pdfViewerCount}`);
if (contactFormCount !== 1) errors.push(`expected one captured contact form identity; found ${contactFormCount}`);
if (newsletterFormCount !== 3) errors.push(`expected three captured newsletter form identities; found ${newsletterFormCount}`);
if (unnamedAnchorCount !== 0) errors.push(`expected every anchor to have an accessible name; found ${unnamedAnchorCount} unnamed anchors`);
if (untitledIframeCount !== 0) errors.push(`expected every iframe to have a title; found ${untitledIframeCount} untitled iframes`);
if (lightboxActionCount !== 237) errors.push(`expected 237 lightbox actions; found ${lightboxActionCount}`);
if (unlabeledLightboxActionCount !== 0) errors.push(`expected every lightbox action to have an accessible label; found ${unlabeledLightboxActionCount} unlabeled actions`);
if (youtubeFallbackCount !== 6) errors.push(`expected six YouTube no-JavaScript fallbacks; found ${youtubeFallbackCount}`);
if (hostedVideoFallbackCount !== 4) errors.push(`expected four hosted-video fallbacks; found ${hostedVideoFallbackCount}`);
for (const [attachmentId, contract] of accessibleImageAltCounts) {
  if (contract.actual !== contract.expected) errors.push(`expected ${contract.expected} accessible alt values for attachment ${attachmentId}; found ${contract.actual}`);
}
for (const [footerRoute, count] of footerSchoolLinkCounts) {
  if (count !== capturedRoutes.length) errors.push(`expected one repaired footer link to ${footerRoute} on every snapshot; found ${count}`);
}
for (const route of ['/news/', '/author/admin/', '/category/uncategorized/', '/2024/09/22/']) {
  const actual = pdfViewersByRoute.get(route) || [];
  if (actual.length !== 4 || archivePdfPaths.some((pdf) => !actual.includes(pdf))) errors.push(`${route}: archive PDF viewer set is incomplete or incorrect`);
}

const archiveEditorialRoutes = ['/news/', '/author/admin/', '/category/uncategorized/', '/2024/09/22/'];
for (const route of archiveEditorialRoutes) {
  const routeAudit = capturedRoutes.find((item) => item.route === route);
  const html = fs.readFileSync(path.join(repositoryRoot, ...routeAudit.snapshot.split('/')), 'utf8');
  if (countMatches(html, /data-ecowise-editorial=["']latest-service-updates["']/gi) !== 1) errors.push(`${route}: latest service update section is missing or duplicated`);
  if (/elementor-element-302344d/i.test(html)) errors.push(`${route}: the former hidden article block was not moved out of News`);
  for (const post of editorialUpdates.serviceFacebookPosts) {
    if (countMatches(html, new RegExp(`facebook\\.com%2FEcowiseitaly%2Fposts%2F${escapeRegExp(new URL(post.facebookUrl).pathname.split('/').filter(Boolean).at(-1))}%2F`, 'gi')) !== 1) {
      errors.push(`${route}: expected one embed for ${post.facebookUrl}`);
    }
  }
}

const tutorialHtml = fs.readFileSync(path.join(themeRoot, 'snapshots', 'html', 'outdoor-education-tutorials', 'index.html'), 'utf8');
if (countMatches(tutorialHtml, /data-ecowise-editorial=["']outdoor-education-resources["']/gi) !== 1) errors.push('outdoor education resource section is missing or duplicated');
for (const resource of editorialUpdates.outdoorEducationResources) {
  if (countMatches(tutorialHtml, new RegExp(`href=["']${escapeRegExp(resource.url)}["']`, 'gi')) !== 1) errors.push(`outdoor education resource is missing or duplicated (${resource.url})`);
}

const serviceHtml = fs.readFileSync(path.join(themeRoot, 'snapshots', 'html', 'for-schools', 'outdoor-service-education-projects', 'index.html'), 'utf8');
if (countMatches(serviceHtml, /data-ecowise-editorial=["']service-project-updates["']/gi) !== 1) errors.push('service project update section is missing or duplicated');
for (const post of editorialUpdates.serviceFacebookPosts) {
  const postId = new URL(post.facebookUrl).pathname.split('/').filter(Boolean).at(-1);
  if (countMatches(serviceHtml, new RegExp(`facebook\\.com%2FEcowiseitaly%2Fposts%2F${escapeRegExp(postId)}%2F`, 'gi')) !== 1) {
    errors.push(`service project page: expected one embed for ${post.facebookUrl}`);
  }
}

const contactHtml = fs.readFileSync(path.join(themeRoot, 'snapshots', 'html', 'contact-us', 'index.html'), 'utf8');
if (countMatches(contactHtml, /href=["']mailto:adamecorose@gmail\.com["']/gi) !== 1) errors.push('contact page does not expose exactly one direct email action');
if (countMatches(contactHtml, /href=["']tel:\+393421363274["']/gi) !== 1) errors.push('contact page does not expose exactly one direct telephone action');
if (!/<input\b(?=[^>]*\bid=["']form-field-field_44bd0eb["'])(?=[^>]*\btype=["']tel["'])(?=[^>]*\bautocomplete=["']tel["'])(?=[^>]*\binputmode=["']tel["'])[^>]*>/i.test(contactHtml)) {
  errors.push('contact phone field does not use telephone input semantics');
}

const routeMapPhp = fs.readFileSync(path.join(themeRoot, 'snapshots', 'routes.php'), 'utf8');
const mappedRoutes = new Map([...routeMapPhp.matchAll(/^\s*'([^']+)'\s*=>\s*'([^']+)',?$/gm)].map((match) => [match[1], match[2]]));
if (mappedRoutes.size !== capturedRoutes.length) errors.push(`snapshot PHP route map has ${mappedRoutes.size} entries; expected ${capturedRoutes.length}`);
for (const route of capturedRoutes) {
  const expectedSnapshot = route.snapshot.split('/snapshots/html/')[1];
  if (mappedRoutes.get(route.route) !== expectedSnapshot) errors.push(`${route.route}: PHP route map does not point to ${expectedSnapshot}`);
}

const homepageHtml = fs.readFileSync(path.join(themeRoot, 'snapshots', 'html', 'home.html'), 'utf8');
for (const [elementId, expectedRoute] of [
  ['41d2c8b8', '/for-schools/science-ecology-environment-field-trips/'],
  ['81eb065', '/for-schools/outdoor-service-education-projects/'],
  ['4f9a4fda', '/for-schools/team-building-wild-rites-of-passage/'],
  ['5c33720d', '/for-schools/residential-field-trips/'],
  ['5a79a029', '/for-schools/storytelling-drama-experiences-in-nature/'],
  ['6f744906', '/for-schools/mindfulness-and-nature-awareness-workshops/'],
]) {
  const widgetPattern = new RegExp(`<div class="elementor-element[^>]*data-id="${elementId}"[\\s\\S]*?<a class="elementor-flip-box__button[^>]*href="([^"]+)"`);
  const actualHref = homepageHtml.match(widgetPattern)?.[1];
  const actualRoute = actualHref ? new URL(actualHref, 'https://ecowiseitaly.com/').pathname : '';
  if (actualRoute !== expectedRoute) errors.push(`homepage card ${elementId} points to ${actualRoute || 'nothing'} instead of ${expectedRoute}`);
}

const capturedPaths = new Set(capturedRoutes.map((route) => route.route));
const allowedInternalPaths = new Set(['/feed/', '/comments/feed/', '/home/']);
for (const target of internalPageLinks) {
  let targetPath = target.split('?')[0] || '/';
  if (targetPath !== '/' && !targetPath.includes('.')) targetPath = `${targetPath.replace(/\/+$/, '')}/`;
  if (!capturedPaths.has(targetPath) && !allowedInternalPaths.has(targetPath)) errors.push(`internal page link has no captured or allowed target (${target})`);
}

const requiredDocs = ['ai.md', 'HANDOVER.md', 'STYLE.md', 'HOMEPAGE.md', 'PROGRESS.md'];
for (const document of requiredDocs) {
  if (!fs.existsSync(path.join(repositoryRoot, document))) errors.push(`required documentation is missing: ${document}`);
}

const supplementalPdfViewer = path.join(themeRoot, 'assets', 'fidelity', 'supplemental', 'pdfjs', 'web', 'viewer.html');
if (!fs.existsSync(supplementalPdfViewer)) errors.push('supplemental PDF.js viewer is missing');
const lazyRuntimeRoot = path.join(themeRoot, 'assets', 'fidelity', 'supplemental', 'runtime');
const lazyRuntimeFiles = [];
function collectLazyRuntime(directory) {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const item = path.join(directory, entry.name);
    if (entry.isDirectory()) collectLazyRuntime(item);
    else lazyRuntimeFiles.push(item);
  }
}
collectLazyRuntime(lazyRuntimeRoot);
if (lazyRuntimeFiles.filter((file) => file.endsWith('.bundle.min.js')).length !== 84) {
  errors.push(`expected 84 vendored Elementor lazy runtime chunks; found ${lazyRuntimeFiles.filter((file) => file.endsWith('.bundle.min.js')).length}`);
}
for (const lightboxAsset of [
  'wp-content/plugins/elementor/assets/css/conditionals/dialog.min.css',
  'wp-content/plugins/elementor/assets/css/conditionals/lightbox.min.css',
  'wp-content/plugins/elementor/assets/lib/dialog/dialog.min.js',
  'wp-content/plugins/elementor/assets/lib/share-link/share-link.min.js',
]) {
  if (!fs.existsSync(path.join(lazyRuntimeRoot, ...lightboxAsset.split('/')))) errors.push(`supplemental lightbox dependency is missing (${lightboxAsset})`);
}
for (const route of capturedRoutes.filter((item) => ['/news/', '/author/admin/', '/category/uncategorized/', '/2024/09/22/'].includes(item.route))) {
  const file = path.join(repositoryRoot, ...route.snapshot.split('/'));
  const html = fs.readFileSync(file, 'utf8');
  if (html.includes('/wp-content/plugins/pdfjs-viewer-for-elementor/')) errors.push(`${route.route}: legacy PDF viewer plugin path remains`);
}

const fidelitySiteRoot = path.join(themeRoot, 'assets', 'fidelity', 'site');
const cssFiles = [];
function collectCss(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const item = path.join(directory, entry.name);
    if (entry.isDirectory()) collectCss(item);
    else if (entry.name.endsWith('.css')) cssFiles.push(item);
  }
}
collectCss(fidelitySiteRoot);
for (const cssFile of cssFiles) {
  const css = fs.readFileSync(cssFile, 'utf8');
  for (const match of css.matchAll(/url\((?:['"]?)([^)'"\s]+)(?:['"]?)\)/gi)) {
    const value = match[1];
    if (value.startsWith('/wp-content/themes/ecowise-custom/assets/fidelity/site/')) {
      const relative = value.slice('/wp-content/themes/ecowise-custom/assets/fidelity/site/'.length);
      if (!fs.existsSync(path.join(fidelitySiteRoot, ...relative.split('/')))) errors.push(`${path.relative(repositoryRoot, cssFile)}: CSS dependency is missing (${value})`);
    } else if (value.startsWith('/wp-content/uploads/')) {
      const uploadPath = decodeURIComponent(value.slice('/wp-content/uploads/'.length).split(/[?#]/)[0]);
      referencedUploads.add(uploadPath);
      if (!uploadPaths.has(uploadPath)) errors.push(`${path.relative(repositoryRoot, cssFile)}: CSS upload is missing from backup (${uploadPath})`);
    }
  }
}

const phpFiles = [];
function collectPhp(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const item = path.join(directory, entry.name);
    if (entry.isDirectory()) collectPhp(item);
    else if (entry.name.endsWith('.php')) phpFiles.push(item);
  }
}
collectPhp(themeRoot);
for (const file of phpFiles) {
  const source = fs.readFileSync(file, 'utf8');
  if (!source.includes('<?php')) errors.push(`${path.relative(repositoryRoot, file)}: missing PHP opening tag`);
  if (source.includes('get_field(') || source.includes('the_field(')) errors.push(`${path.relative(repositoryRoot, file)}: ACF API reference found`);
  if (/Elementor\\|elementor\/includes|elementor_pro/i.test(source)) errors.push(`${path.relative(repositoryRoot, file)}: Elementor PHP runtime reference found`);
}

const fidelityPhp = fs.readFileSync(path.join(themeRoot, 'inc', 'fidelity.php'), 'utf8');
for (const dynamicGuard of ['is_search()', 'is_feed()', "isset( $_GET['rest_route'] )", "get_query_var( 'sitemap' )", 'is_paged()']) {
  if (!fidelityPhp.includes(dynamicGuard)) errors.push(`fidelity renderer is missing dynamic-request guard (${dynamicGuard})`);
}
for (const formFallback of ['fallback_fields', 'admin-post.php', "name=\"nonce\""]) {
  if (!fidelityPhp.includes(formFallback)) errors.push(`fidelity renderer is missing progressive form fallback (${formFallback})`);
}
for (const formHardening of ['name=\"website\"', 'must-revalidate']) {
  if (!fidelityPhp.includes(formHardening)) errors.push(`fidelity renderer is missing form/cache hardening (${formHardening})`);
}
const fidelityJs = fs.readFileSync(path.join(themeRoot, 'assets', 'js', 'fidelity.js'), 'utf8');
if (/data\.set\(\s*['"]website['"]\s*,\s*['"]['"]\s*\)/.test(fidelityJs)) errors.push('form enhancement clears the honeypot before submission');
for (const submissionGuard of ['stopImmediatePropagation()', 'capture: true']) {
  if (!fidelityJs.includes(submissionGuard)) errors.push(`form enhancement does not suppress the captured Elementor submit handler (${submissionGuard})`);
}
const formsPhp = fs.readFileSync(path.join(themeRoot, 'inc', 'forms.php'), 'utf8');
for (const formContract of ['68574d28', '1b3fffa7', 'adamecorose@gmail.com', 'saqibbalii099@gmail.com', 'ecowise_form_respond', 'field_44bd0eb', 'field_6fef306']) {
  if (!formsPhp.includes(formContract)) errors.push(`form handler is missing captured routing/schema contract (${formContract})`);
}

const malformedThemify = path.join(themeRoot, 'assets', 'fidelity', 'site', 'wp-content', 'plugins', 'skyboot-custom-icons-for-elementor', 'assets', 'css', '_', 'fonts', 'themify.eot');
if (fs.existsSync(malformedThemify)) errors.push('captured HTML/404 masquerading as themify.eot remains');
const validThemify = path.join(themeRoot, 'assets', 'fidelity', 'site', 'wp-content', 'plugins', 'skyboot-custom-icons-for-elementor', 'assets', 'fonts', 'themify.eot');
if (!fs.existsSync(validThemify)) errors.push('valid Themify EOT font is missing');
else if (/<!doctype|<html/i.test(fs.readFileSync(validThemify).subarray(0, 128).toString('utf8'))) errors.push('Themify EOT font contains HTML instead of font data');

const assetFiles = [];
function collectAssetFiles(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const item = path.join(directory, entry.name);
    if (entry.isDirectory()) collectAssetFiles(item);
    else assetFiles.push(item);
  }
}
collectAssetFiles(path.join(themeRoot, 'assets'));
const assetSignatures = new Map([
  ['.woff', [[0x77, 0x4f, 0x46, 0x46]]],
  ['.woff2', [[0x77, 0x4f, 0x46, 0x32]]],
  ['.ttf', [[0x00, 0x01, 0x00, 0x00], [0x4f, 0x54, 0x54, 0x4f]]],
  ['.otf', [[0x4f, 0x54, 0x54, 0x4f]]],
  ['.png', [[0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]]],
  ['.jpg', [[0xff, 0xd8, 0xff]]],
  ['.jpeg', [[0xff, 0xd8, 0xff]]],
  ['.gif', [[0x47, 0x49, 0x46, 0x38]]],
  ['.webp', [[0x52, 0x49, 0x46, 0x46]]],
  ['.pdf', [[0x25, 0x50, 0x44, 0x46, 0x2d]]],
]);
for (const file of assetFiles) {
  const content = fs.readFileSync(file);
  if (!content.length) errors.push(`${path.relative(repositoryRoot, file)}: packaged asset is empty`);
  const signatures = assetSignatures.get(path.extname(file).toLowerCase());
  if (signatures && !signatures.some((signature) => signature.every((byte, index) => content[index] === byte))) {
    errors.push(`${path.relative(repositoryRoot, file)}: file signature does not match its extension`);
  }
  if (/^\s*(?:<!doctype\s+html\b|<html\b)/i.test(content.subarray(0, 256).toString('utf8')) && !['.html', '.htm', '.js'].includes(path.extname(file).toLowerCase())) {
    errors.push(`${path.relative(repositoryRoot, file)}: binary/static asset begins with an HTML document`);
  }
  if (content.includes(Buffer.from('GT-WFMMH42J')) || content.includes(Buffer.from('vf3beobmuf')) || content.includes(Buffer.from('www.clarity.ms'))) {
    errors.push(`${path.relative(repositoryRoot, file)}: captured tracker marker remains in packaged assets`);
  }
}

if (!process.env.PHP_BINARY) warnings.push('PHP_BINARY was not set; run PHP syntax lint in staging/CI.');

if (errors.length) {
  process.stderr.write(`Theme validation failed (${errors.length}):\n- ${errors.join('\n- ')}\n`);
  process.exit(1);
}

process.stdout.write(`Theme validation passed: ${capturedRoutes.length} captured routes, ${indexedRoutes.length} indexed routes, ${phpFiles.length} PHP files, ${referencedUploads.size} uploads, ${internalPageLinks.size} internal link targets and ${facebookEmbedCount} Facebook embed instances (${facebookEmbedUrls.size} unique posts) verified.\n`);
if (warnings.length) process.stdout.write(`Warnings:\n- ${warnings.join('\n- ')}\n`);
