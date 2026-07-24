#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const [inventoryFile, mirrorRoot, themeRoot, auditRoot, sitemapFile] = process.argv.slice(2);

if (!inventoryFile || !mirrorRoot || !themeRoot || !auditRoot) {
  throw new Error('Usage: node tools/build-fidelity-snapshots.mjs <page-inventory.csv> <mirror-root> <theme-root> <audit-root> [sitemap-urls.csv]');
}

const repositoryRoot = path.resolve(import.meta.dirname, '..');
const editorialUpdatesFile = path.join(repositoryRoot, 'content', 'editorial-updates.json');
const editorialUpdates = JSON.parse(fs.readFileSync(editorialUpdatesFile, 'utf8'));
const homepageUpdatesFile = path.join(repositoryRoot, 'content', 'homepage-updates.json');
const homepageUpdates = JSON.parse(fs.readFileSync(homepageUpdatesFile, 'utf8'));
const themeVersion = fs.readFileSync(path.join(themeRoot, 'style.css'), 'utf8').match(/^Version:\s*(\S+)/m)?.[1];

if (!themeVersion) {
  throw new Error('Theme Version header is missing from style.css');
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function themeStylesheet(document, id, filename) {
  if (document.includes(`id="${id}"`)) return document;
  return document.replace(
    '</head>',
    `<link href="/wp-content/themes/ecowise-custom/assets/css/${filename}?ver=${escapeHtml(themeVersion)}" id="${id}" rel="stylesheet"/>\n</head>`
  );
}

function editorialStylesheet(document) {
  return themeStylesheet(document, 'ecowise-editorial-styles', 'editorial.css');
}

function normalizedBrandCopy(value) {
  const placeholder = '__ECOWISE_ITALY_BRAND__';
  return String(value)
    .replace(/\bEcoWise Italy\b/gi, placeholder)
    .replace(/\bEcoWise\b/gi, placeholder)
    .replaceAll(placeholder, 'EcoWise Italy');
}

function normalizeBrandPresentation(document) {
  return document.replace(
    /<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<[^>]+>|[^<]+/gi,
    (token) => {
      if (/^<(?:script|style)\b/i.test(token)) return token;
      if (!token.startsWith('<')) return normalizedBrandCopy(token);
      return token.replace(/\b(aria-label|title|alt)=(["'])(.*?)\2/gi, (attribute, name, quote, value) => {
        if (name.toLowerCase() === 'alt' && /\bwp-image-67\b/.test(token)) return attribute;
        return `${name}=${quote}${normalizedBrandCopy(value)}${quote}`;
      });
    }
  );
}

function applyHomepageImages(document, canonical) {
  let result = document;
  let slideshowCount = 0;
  result = result.replace(
    /(<div class="elementor-element[^>]*\bdata-id="c82fb10"[^>]*\bdata-settings=')([^']+)('>)/i,
    (match, prefix, settingsJson, suffix) => {
      slideshowCount += 1;
      const settings = JSON.parse(settingsJson.replaceAll('&quot;', '"'));
      settings.background_slideshow_gallery = homepageUpdates.heroSlides.map(({ id, url }) => ({ id, url }));
      return `${prefix}${JSON.stringify(settings)}${suffix}`;
    }
  );
  if (slideshowCount !== 1) throw new Error(`${canonical}: expected one homepage hero slideshow; found ${slideshowCount}`);

  for (const image of homepageUpdates.aboutImages) {
    let imageCount = 0;
    const widgetPattern = new RegExp(
      `(<div class="elementor-element[^>]*\\bdata-id="${image.elementId}"[\\s\\S]*?<div class="elementor-widget-container">\\s*)<img\\b[^>]*>(\\s*</div>)`
    );
    result = result.replace(widgetPattern, (match, prefix, suffix) => {
      imageCount += 1;
      return `${prefix}<img alt="${escapeHtml(image.alt)}" class="attachment-full size-full" decoding="async" height="${Number(image.height)}" src="${escapeHtml(image.url)}" width="${Number(image.width)}"/>${suffix}`;
    });
    if (imageCount !== 1) throw new Error(`${canonical}: expected one homepage image widget ${image.elementId}; found ${imageCount}`);
  }

  return result;
}

function insertBeforeMarker(document, marker, markup, canonical, label) {
  const index = document.indexOf(marker);
  if (index === -1) throw new Error(`${canonical}: could not find insertion marker for ${label}`);
  if (document.indexOf(marker, index + marker.length) !== -1) throw new Error(`${canonical}: found more than one insertion marker for ${label}`);
  return `${document.slice(0, index)}${markup}\n${document.slice(index)}`;
}

function replaceBetweenMarkers(document, startMarker, endMarker, markup, canonical, label) {
  const start = document.indexOf(startMarker);
  const end = document.indexOf(endMarker);
  if (start === -1 || end === -1 || end <= start) throw new Error(`${canonical}: could not locate ${label}`);
  return `${document.slice(0, start)}${markup}\n${document.slice(end)}`;
}

function resourceSectionMarkup(resources) {
  const cards = resources.map((resource) => `
<a class="ecowise-editorial-card ecowise-resource-card" href="${escapeHtml(resource.url)}" target="_blank">
  <span aria-hidden="true" class="ecowise-resource-icon">PDF</span>
  <span>
    <h3>${escapeHtml(resource.title)}</h3>
    <p>${escapeHtml(resource.description)}</p>
  </span>
</a>`).join('');

  return `<section aria-labelledby="ecowise-resources-title" class="ecowise-editorial-section" data-ecowise-editorial="outdoor-education-resources">
  <div class="ecowise-editorial-inner">
    <p class="ecowise-editorial-eyebrow">Articles and teaching resources</p>
    <h2 class="ecowise-editorial-title" id="ecowise-resources-title">Outdoor education reading</h2>
    <p class="ecowise-editorial-intro">Explore articles by Adam Rose on outdoor education, geography and meaningful connections with the natural world.</p>
    <div class="ecowise-editorial-grid ecowise-resource-grid">${cards}
    </div>
  </div>
</section>`;
}

function facebookSectionMarkup(posts, options = {}) {
  const cards = posts.map((post) => {
    const pluginUrl = `https://www.facebook.com/plugins/post.php?href=${encodeURIComponent(post.facebookUrl)}&show_text=true&width=500`;
    return `
<article class="ecowise-editorial-card ecowise-facebook-card">
  <iframe allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" allowfullscreen="true" height="${Number(post.height) || 820}" loading="lazy" scrolling="no" src="${escapeHtml(pluginUrl)}" title="${escapeHtml(post.title)}" width="500"></iframe>
  <p class="ecowise-facebook-fallback"><a href="${escapeHtml(post.facebookUrl)}" rel="noopener" target="_blank">View ${escapeHtml(post.title)} on Facebook</a></p>
</article>`;
  }).join('');

  const sectionClass = options.white ? ' ecowise-editorial-section--white' : '';
  return `<section aria-labelledby="${escapeHtml(options.id)}-title" class="ecowise-editorial-section${sectionClass}" data-ecowise-editorial="${escapeHtml(options.id)}">
  <div class="ecowise-editorial-inner">
    <p class="ecowise-editorial-eyebrow">${escapeHtml(options.eyebrow)}</p>
    <h2 class="ecowise-editorial-title" id="${escapeHtml(options.id)}-title">${escapeHtml(options.title)}</h2>
    <p class="ecowise-editorial-intro">${escapeHtml(options.intro)}</p>
    <div class="ecowise-editorial-grid">${cards}
    </div>
  </div>
</section>`;
}

function parseCsv(input) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < input.length; i += 1) {
    const char = input[i];
    if (quoted) {
      if (char === '"' && input[i + 1] === '"') {
        field += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        field += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(field);
      field = '';
    } else if (char === '\n') {
      row.push(field.replace(/\r$/, ''));
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += char;
    }
  }

  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }

  const headers = rows.shift();
  return rows.filter((values) => values.length === headers.length).map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index]]))
  );
}

function routeFromUrl(url) {
  const pathname = new URL(url).pathname;
  return pathname === '/' ? '/' : `${pathname.replace(/\/+$/, '')}/`;
}

function snapshotRelativePath(route) {
  return route === '/' ? 'home.html' : `${route.replace(/^\//, '')}index.html`;
}

function walkFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const item = path.join(directory, entry.name);
    return entry.isDirectory() ? walkFiles(item) : [item];
  });
}

function normalizeMirrorFilename(value) {
  return value.replace(/__q_[0-9a-f]+(?=\.[a-z0-9]+$)/i, '');
}

function shouldVendor(publicPath) {
  if (publicPath === '/wp-content/plugins/skyboot-custom-icons-for-elementor/assets/css/_/fonts/themify.eot') return false;
  return publicPath.startsWith('/wp-content/plugins/')
    || publicPath.startsWith('/wp-content/themes/hello-elementor/')
    || publicPath.startsWith('/wp-includes/')
    || publicPath.startsWith('/wp-content/uploads/elementor/css/')
    || publicPath.startsWith('/wp-content/uploads/elementor/google-fonts/');
}

const publicThemeAssetRoot = '/wp-content/themes/ecowise-custom/assets/fidelity/site';
const mirrorSiteRoot = path.join(mirrorRoot, 'site', 'ecowiseitaly.com');
const fidelityAssetRoot = path.join(themeRoot, 'assets', 'fidelity', 'site');
const mirroredAssets = new Map();

for (const sourceFile of walkFiles(mirrorSiteRoot)) {
  const relative = path.relative(mirrorSiteRoot, sourceFile).replaceAll('\\', '/');
  const publicPath = `/${normalizeMirrorFilename(relative)}`;
  if (shouldVendor(publicPath) && !mirroredAssets.has(publicPath)) {
    mirroredAssets.set(publicPath, sourceFile);
  }
}

function vendoredUrl(publicPath) {
  return `${publicThemeAssetRoot}${publicPath}`;
}

function rewriteCssUrls(css, sourcePublicPath) {
  const base = new URL(sourcePublicPath, 'https://ecowiseitaly.com/');
  return css.replace(/url\((['"]?)([^)'"\s]+)\1\)/gi, (match, quote, value) => {
    if (/^(?:data:|https?:\/\/|#)/i.test(value)) return match;
    const resolved = new URL(value, base);
    let targetPath = normalizeMirrorFilename(decodeURI(resolved.pathname));
    if (targetPath === '/wp-content/plugins/skyboot-custom-icons-for-elementor/assets/css/_/fonts/themify.eot') {
      targetPath = '/wp-content/plugins/skyboot-custom-icons-for-elementor/assets/fonts/themify.eot';
    }
    const replacement = mirroredAssets.has(targetPath) ? vendoredUrl(targetPath) : targetPath;
    return `url(${quote}${replacement}${quote})`;
  });
}

fs.rmSync(fidelityAssetRoot, { recursive: true, force: true });
for (const [publicPath, sourceFile] of mirroredAssets) {
  const destination = path.join(fidelityAssetRoot, ...publicPath.replace(/^\//, '').split('/'));
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  if (path.extname(publicPath).toLowerCase() === '.css') {
    const css = rewriteCssUrls(fs.readFileSync(sourceFile, 'utf8'), publicPath);
    fs.writeFileSync(destination, css, 'utf8');
  } else {
    fs.copyFileSync(sourceFile, destination);
  }
}

const supplementalRuntimeRoot = path.join(themeRoot, 'assets', 'fidelity', 'supplemental', 'runtime');
if (fs.existsSync(supplementalRuntimeRoot)) {
  for (const sourceFile of walkFiles(supplementalRuntimeRoot)) {
    const relative = path.relative(supplementalRuntimeRoot, sourceFile);
    const destination = path.join(fidelityAssetRoot, relative);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(sourceFile, destination);
  }
}

function repairDocument(html, canonical) {
  const escapeAttribute = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
  const canonicalPath = new URL(canonical).pathname;
  let result = html.replace(/\b(href|src)=(['"])([^'"]+)\2/gi, (match, attribute, quote, value) => {
    try {
      const resolved = new URL(value.replaceAll('&amp;', '&'), canonical);
      if (resolved.origin === 'https://ecowiseitaly.com' && externalMirrorUrls.has(decodeURI(resolved.pathname))) {
        return `${attribute}=${quote}${escapeAttribute(externalMirrorUrls.get(decodeURI(resolved.pathname)))}${quote}`;
      }
    } catch {
      return match;
    }
    return match;
  });

  // The mirror encoded query strings in local filenames as __q_<hash>.
  // Production WordPress exposes the same assets at their original filenames.
  result = result.replace(/__q_[0-9a-f]+(?=\.[a-z0-9]+(?:[?#"'])?)/gi, '');
  const canonicalTag = `<link href="${canonical}" rel="canonical"/>`;
  const canonicalPattern = /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*\/?>/i;

  if (canonicalPattern.test(result)) {
    result = result.replace(canonicalPattern, canonicalTag);
  } else {
    result = result.replace('</head>', `${canonicalTag}\n</head>`);
  }

  // Remove mirror-only query-hash endpoints. WordPress may emit fresh oEmbed
  // links itself on native routes; captured GTM must never be replayed.
  result = result
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, (script) => /www\.clarity\.ms|vf3beobmuf/i.test(script) ? '' : script)
    .replace(/(<meta content="Site Kit by Google[^>]*\/?>)[ \t]+\r?\n/gi, '$1\n')
    .replace(/<script\b[^>]*google_gtagjs-js[^>]*>[\s\S]*?<\/script>\s*/gi, '')
    .replace(/<link\b[^>]*www\.googletagmanager\.com[^>]*\/?>\s*/gi, '')
    .replace(/<link\b[^>]*(?:rel=["'](?:alternate|shortlink)["']|__q_)[^>]*\/?>\s*/gi, '')
    .replace(
      /(?:\.\.\/)+maps\.google\.com\/maps__q_[0-9a-f]+/gi,
      'https://www.google.com/maps/embed?origin=mfe&amp;pb=!1m4!2m1!1sVia+Mazzini+97+14020+Aramengo+%E2%80%93+Asti+%E2%80%93+Italy!5e0!6i14'
    )
    .replace(
      /(?:\.\.\/)*wp-content\/plugins\/pdfjs-viewer-for-elementor\/assets\/js\/pdfjs\//gi,
      '/wp-content/themes/ecowise-custom/assets/fidelity/supplemental/pdfjs/'
    )
    .replaceAll(
      'https:\\/\\/ecowiseitaly.com\\/wp-content\\/plugins\\/elementor\\/assets\\/',
      '\\/wp-content\\/themes\\/ecowise-custom\\/assets\\/fidelity\\/site\\/wp-content\\/plugins\\/elementor\\/assets\\/'
    )
    .replaceAll(
      'https:\\/\\/ecowiseitaly.com\\/wp-content\\/plugins\\/elementor-pro\\/assets\\/',
      '\\/wp-content\\/themes\\/ecowise-custom\\/assets\\/fidelity\\/site\\/wp-content\\/plugins\\/elementor-pro\\/assets\\/'
    )
    .replaceAll(
      'https:\\/\\/ecowiseitaly.com\\/wp-content\\/plugins\\/elementor-pro\\/modules\\/lottie\\/assets\\/animations\\/default.json',
      '\\/wp-content\\/themes\\/ecowise-custom\\/assets\\/fidelity\\/site\\/wp-content\\/plugins\\/elementor-pro\\/modules\\/lottie\\/assets\\/animations\\/default.json'
    )
    .replace(/"ajaxurl":"https:\\\/\\\/ecowiseitaly\.com\\\/wp-admin\\\/admin-ajax\.php"/g, '"ajaxurl":""')
    .replace(/"nonces":\{"floatingButtonsClickTracking":"[^"]*"\}/g, '"nonces":{}')
    .replace(/"nonce":"[a-f0-9]+"/gi, '"nonce":""')
    .replace(/"rest":"https:\\\/\\\/ecowiseitaly\.com\\\/wp-json\\\/"/g, '"rest":""');

  const archivePdfPaths = [
    '/wp-content/uploads/2024/12/PG_SPR_2020_Rose-dragged.pdf',
    '/wp-content/uploads/2024/12/PG_SPR_2020_Rose-dragged-2.pdf',
    '/wp-content/uploads/2024/12/PG_SPR_2020_Rose-dragged-1.pdf',
    '/wp-content/uploads/2024/12/PG_Autumn_2014_ROSE-3_2.pdf',
  ];
  if (['/news/', '/author/admin/', '/category/uncategorized/', '/2024/09/22/'].includes(canonicalPath)) {
    let pdfIndex = 0;
    result = result.replace(
      /\/wp-content\/themes\/ecowise-custom\/assets\/fidelity\/supplemental\/pdfjs\/web\/viewer\.html(?!\?file=)/g,
      (viewer) => `${viewer}?file=${encodeURIComponent(archivePdfPaths[pdfIndex++])}`
    );
  }

  result = result.replace(/\b(href|src|action)=(['"])([^'"#][^'"]*)\2/gi, (match, attribute, quote, value) => {
    if (/^(?:data:|mailto:|tel:|javascript:)/i.test(value)) return match;
    try {
      const resolved = new URL(value.replaceAll('&amp;', '&'), canonical);
      const publicPath = normalizeMirrorFilename(decodeURI(resolved.pathname));
      if (['href', 'action'].includes(attribute.toLowerCase()) && resolved.origin === 'https://ecowiseitaly.com' && mirrorHtmlRoutes.has(publicPath)) {
        return `${attribute}=${quote}${mirrorHtmlRoutes.get(publicPath)}${quote}`;
      }
      if (mirroredAssets.has(publicPath)) {
        return `${attribute}=${quote}${vendoredUrl(publicPath)}${quote}`;
      }
    } catch {
      return match;
    }
    return match;
  });

  result = result.replace(
    /<meta\s+content=["'][^"']*Elementor[^"']*["']\s+name=["']generator["']\s*\/?>/gi,
    '<meta content="Ecowise Custom fidelity capture" name="generator"/>'
  );

  // The captured footer shipped with six inert placeholder anchors even
  // though every corresponding school page exists in the restored site.
  const footerSchoolLinks = new Map([
    ['Science, Ecology &amp; Environment Field trips', '/for-schools/science-ecology-environment-field-trips/'],
    ['Outdoor Service Education Projects', '/for-schools/outdoor-service-education-projects/'],
    ['Storytelling &amp; Drama Experiences in Nature', '/for-schools/storytelling-drama-experiences-in-nature/'],
    ['Team Building &amp; Wild Rites of Passage', '/for-schools/team-building-wild-rites-of-passage/'],
    ['Mindfulness and Nature Awareness Workshops', '/for-schools/mindfulness-and-nature-awareness-workshops/'],
    ['Wilderness encounter groups &amp; Ecoliteracy Camps', '/for-schools/wilderness-encounter-groups-ecoliteracy-camps/'],
  ]);
  for (const [label, route] of footerSchoolLinks) {
    result = result.replaceAll(
      `<a href="#">\n<span class="elementor-icon-list-text">${label}</span>`,
      `<a href="${route}">\n<span class="elementor-icon-list-text">${label}</span>`
    );
  }

  const homepageCardLinks = new Map([
    ['4f9a4fda', '/for-schools/team-building-wild-rites-of-passage/'],
    ['6f744906', '/for-schools/mindfulness-and-nature-awareness-workshops/'],
  ]);
  for (const [elementId, route] of homepageCardLinks) {
    const widgetPattern = new RegExp(`(<div class="elementor-element[^>]*data-id="${elementId}"[\\s\\S]*?<a class="elementor-flip-box__button[^>]*href=")[^"]+("[^>]*>)`);
    result = result.replace(widgetPattern, `$1${route}$2`);
  }

  // Repair the captured document outline without changing Elementor's visual
  // classes. The live homepage omitted its primary H1, while two school pages
  // repeated the same H1 in later content widgets.
  const headingRepairs = new Map([
    ['/', { elementId: '952c8e2', fromTag: 'h2', toTag: 'h1' }],
    ['/for-schools/conflict-resolution-program/', { elementId: '3bac217', fromTag: 'h1', toTag: 'h2', preserveH1Typography: true }],
    ['/for-schools/team-building-wild-rites-of-passage/', { elementId: '799a1c0', fromTag: 'h1', toTag: 'h2', preserveH1Typography: true }],
  ]);
  const headingRepair = headingRepairs.get(canonicalPath);
  if (headingRepair) {
    const { elementId, fromTag, toTag, preserveH1Typography } = headingRepair;
    const widgetPattern = new RegExp(`(<div class="elementor-element[^>]*data-id="${elementId}"[^>]*>\\s*<div class="elementor-widget-container">\\s*<)${fromTag}([^>]*>[\\s\\S]*?</)${fromTag}(>)`);
    const visualStyle = preserveH1Typography
      ? ' style="font-family:var(--e-global-typography-583e54c-font-family), Sans-serif;font-size:var(--e-global-typography-583e54c-font-size);font-weight:var(--e-global-typography-583e54c-font-weight);line-height:var(--e-global-typography-583e54c-line-height);letter-spacing:var(--e-global-typography-583e54c-letter-spacing);word-spacing:var(--e-global-typography-583e54c-word-spacing)"'
      : '';
    let repairCount = 0;
    result = result.replace(widgetPattern, (match, prefix, body, suffix) => {
      repairCount += 1;
      return `${prefix}${toTag}${visualStyle}${body}${toTag}${suffix}`;
    });
    if (repairCount !== 1) throw new Error(`${canonical}: expected one ${fromTag} heading in widget ${elementId}; found ${repairCount}`);
  }

  // Give the inherited skip link a real primary-content destination on every
  // captured document. Header and footer Elementor roots are intentionally
  // excluded from this contract.
  let contentTargetCount = 0;
  result = result.replace(/<div\b(?=[^>]*\bdata-elementor-type=["'](?:wp-page|single-post|archive)["'])[^>]*>/gi, (tag) => {
    contentTargetCount += 1;
    return tag.replace(/^<div\b/i, '<div id="content" role="main" tabindex="-1"');
  });
  if (contentTargetCount !== 1) throw new Error(`${canonical}: expected one primary Elementor content root; found ${contentTargetCount}`);

  const landmarkRoles = new Map([
    ['header', 'banner'],
    ['footer', 'contentinfo'],
  ]);
  for (const [elementorType, role] of landmarkRoles) {
    let landmarkCount = 0;
    const pattern = new RegExp(`<div\\b(?=[^>]*\\bdata-elementor-type=["']${elementorType}["'])[^>]*>`, 'gi');
    result = result.replace(pattern, (tag) => {
      landmarkCount += 1;
      return tag.replace(/^<div\b/i, `<div role="${role}"`);
    });
    if (landmarkCount !== 1) throw new Error(`${canonical}: expected one ${elementorType} landmark; found ${landmarkCount}`);
  }

  const navigationLabels = new Map([
    ['4248a07b', 'Primary services'],
    ['546f765', 'Information'],
    ['7a19714', 'Mobile'],
  ]);
  result = result.replace(/<nav\b([^>]*)>\s*<ul class="elementor-nav-menu" id="menu-([12])-(4248a07b|546f765|7a19714)"/gi, (match, attributes, menuVariant, widgetId) => {
    const suffix = menuVariant === '1' ? 'navigation' : 'dropdown navigation';
    const label = `${navigationLabels.get(widgetId)} ${suffix}`;
    const labeledAttributes = /\baria-label\s*=/i.test(attributes)
      ? attributes.replace(/\baria-label=(['"])[^'"]*\1/i, `aria-label="${label}"`)
      : ` aria-label="${label}"${attributes}`;
    return `<nav${labeledAttributes}>\n<ul class="elementor-nav-menu" id="menu-${menuVariant}-${widgetId}"`;
  });

  // Restore high-confidence accessible names from the backup object IDs. The
  // linked site logos and recurring post thumbnails otherwise expose empty
  // links to assistive technology.
  const imageAltRepairs = new Map([
    ['67', 'Ecowise Italy'],
    ['94', 'A rare sighting of Wolves'],
    ['129', 'Spring Friends'],
    ['25', 'Tracks in the Snow'],
    ['2598', 'Adam Rose'],
    ['2622', 'Yenka Honig'],
  ]);
  result = result.replace(/<img\b[^>]*>/gi, (tag) => {
    for (const [attachmentId, altText] of imageAltRepairs) {
      if (new RegExp(`\\bwp-image-${attachmentId}\\b`).test(tag)) {
        return tag.replace(/\balt=(['"])\s*\1/i, `alt="${altText}"`);
      }
    }
    return tag;
  });

  // Name every lightbox action and its CSS-background gallery image. These
  // labels are invisible and do not alter Elementor's lightbox behavior.
  let lightboxIndex = 0;
  result = result.replace(/<a\b(?=[^>]*\bdata-elementor-open-lightbox=["']yes["'])[^>]*>[\s\S]*?<\/a>/gi, (block) => {
    lightboxIndex += 1;
    return block
      .replace(/^<a\b/i, `<a aria-label="Open Ecowise image ${lightboxIndex}"`)
      .replace(/<div aria-label="" class="e-gallery-image\b/i, `<div aria-label="Ecowise gallery image ${lightboxIndex}" class="e-gallery-image`);
  });

  // Embedded Facebook posts and PDF.js documents inherited no accessible
  // titles. The contact map and existing titled embeds are left unchanged.
  result = result.replace(/<iframe\b[^>]*>/gi, (tag) => {
    if (/\btitle\s*=/i.test(tag)) return tag;
    if (/www\.facebook\.com\/plugins\/post\.php/i.test(tag)) return tag.replace(/^<iframe\b/i, '<iframe title="Facebook post from Ecowise Italy"');
    if (/assets\/fidelity\/supplemental\/pdfjs\/web\/viewer\.html/i.test(tag)) return tag.replace(/^<iframe\b/i, '<iframe title="Ecowise archive PDF document"');
    return tag;
  });

  const archiveRoutes = ['/news/', '/author/admin/', '/category/uncategorized/', '/2024/09/22/'];
  const youtubeFallbacks = new Map([
    ['/news/', { elementId: '511b624', url: 'https://www.youtube.com/watch?v=3ESLqgSMh2M' }],
    ['/author/admin/', { elementId: '511b624', url: 'https://www.youtube.com/watch?v=3ESLqgSMh2M' }],
    ['/category/uncategorized/', { elementId: '511b624', url: 'https://www.youtube.com/watch?v=3ESLqgSMh2M' }],
    ['/2024/09/22/', { elementId: '511b624', url: 'https://www.youtube.com/watch?v=3ESLqgSMh2M' }],
    ['/outdoor-education-tutorials/', { elementId: 'e8754d6', url: 'https://www.youtube.com/watch?v=3ESLqgSMh2M' }],
    ['/for-schools/outdoor-service-education-projects/', { elementId: 'e13bc0c', url: 'https://www.youtube.com/watch?v=jpTeuLSY-24' }],
  ]);
  const youtubeFallback = youtubeFallbacks.get(canonicalPath);
  if (youtubeFallback) {
    const pattern = new RegExp(`(<div class="elementor-element[^>]*data-id="${youtubeFallback.elementId}"[\\s\\S]*?<div class="elementor-video"></div>)`);
    let fallbackCount = 0;
    result = result.replace(pattern, (match) => {
      fallbackCount += 1;
      return `${match}<noscript><p><a href="${youtubeFallback.url}">Watch this Ecowise video on YouTube</a></p></noscript>`;
    });
    if (fallbackCount !== 1) throw new Error(`${canonical}: expected one YouTube widget ${youtubeFallback.elementId}; found ${fallbackCount}`);
  }

  if (archiveRoutes.includes(canonicalPath)) {
    let hostedVideoCount = 0;
    result = result.replace(/<video\b([^>]*\bsrc=(['"])([^'"]+)\2[^>]*)><\/video>/gi, (match, attributes, quote, source) => {
      hostedVideoCount += 1;
      return `<video aria-label="Ecowise Italy trip video"${attributes}><a href="${source}">Download the Ecowise video</a></video>`;
    });
    if (hostedVideoCount !== 1) throw new Error(`${canonical}: expected one hosted video; found ${hostedVideoCount}`);
  }

  if (canonicalPath === '/contact-us/') {
    const contactRepairs = [
      {
        pattern: /(<p class="elementor-icon-box-description">\s*)adamecorose@gmail\.com(\s*<\/p>)/i,
        replacement: '$1<a href="mailto:adamecorose@gmail.com" style="color:inherit;text-decoration:inherit">adamecorose@gmail.com</a>$2',
        label: 'email action',
      },
      {
        pattern: /(<p class="elementor-icon-box-description">\s*)\+39 3421363274(\s*<\/p>)/i,
        replacement: '$1<a href="tel:+393421363274" style="color:inherit;text-decoration:inherit">+39 3421363274</a>$2',
        label: 'telephone action',
      },
    ];
    for (const repair of contactRepairs) {
      const before = result;
      result = result.replace(repair.pattern, repair.replacement);
      if (result === before) throw new Error(`${canonical}: contact ${repair.label} was not repaired`);
    }
    let phoneInputCount = 0;
    result = result.replace(/<input\b(?=[^>]*\bid="form-field-field_44bd0eb")[^>]*>/i, (tag) => {
      phoneInputCount += 1;
      return tag.replace(/\btype="number"/i, 'type="tel" autocomplete="tel" inputmode="tel"');
    });
    if (phoneInputCount !== 1) throw new Error(`${canonical}: expected one contact phone input; found ${phoneInputCount}`);
  }

  const editorialArchiveRoutes = ['/news/', '/author/admin/', '/category/uncategorized/', '/2024/09/22/'];
  if (editorialArchiveRoutes.includes(canonicalPath)) {
    const latestUpdates = facebookSectionMarkup(editorialUpdates.serviceFacebookPosts, {
      id: 'latest-service-updates',
      eyebrow: 'Latest from Ecowise',
      title: 'Service education in action',
      intro: 'Recent projects with Road Less Traveled and our partner communities in Piemonte.',
      white: true,
    });
    result = replaceBetweenMarkers(
      result,
      '<div class="elementor-element elementor-element-302344d ',
      '<div class="elementor-element elementor-element-3e4a64df ',
      latestUpdates,
      canonical,
      'archive resource block'
    );
    result = editorialStylesheet(result);
  }

  if (canonicalPath === '/outdoor-education-tutorials/') {
    result = insertBeforeMarker(
      result,
      '<div class="elementor-element elementor-element-22b29b1 ',
      resourceSectionMarkup(editorialUpdates.outdoorEducationResources),
      canonical,
      'outdoor education resources'
    );
    result = editorialStylesheet(result);
  }

  if (canonicalPath === '/for-schools/outdoor-service-education-projects/') {
    const serviceUpdates = facebookSectionMarkup(editorialUpdates.serviceFacebookPosts, {
      id: 'service-project-updates',
      eyebrow: 'Recent projects',
      title: 'Road Less Traveled in Piemonte',
      intro: 'See how visiting students have supported rural communities through practical service and environmental education.',
    });
    result = insertBeforeMarker(
      result,
      '<div class="elementor-element elementor-element-a62d698 ',
      serviceUpdates,
      canonical,
      'service education updates'
    );
    result = editorialStylesheet(result);
  }

  if (canonicalPath === '/') {
    result = applyHomepageImages(result, canonical);
    result = themeStylesheet(result, 'ecowise-homepage-styles', 'homepage.css');
  }

  return normalizeBrandPresentation(result).replace(/[ \t]+$/gm, '');
}

const inventory = parseCsv(fs.readFileSync(inventoryFile, 'utf8').replace(/^\uFEFF/, ''));
const manifestFile = path.join(mirrorRoot, 'manifest.csv');
const externalMirrorUrls = new Map();
if (fs.existsSync(manifestFile)) {
  const manifest = parseCsv(fs.readFileSync(manifestFile, 'utf8').replace(/^\uFEFF/, ''));
  for (const item of manifest) {
    const localPath = item.local_path.replaceAll('\\', '/');
    if (!localPath.startsWith('site/') || localPath.startsWith('site/ecowiseitaly.com/')) continue;
    externalMirrorUrls.set(`/${localPath.slice('site/'.length)}`, item.url);
  }
}
const mirrorHtmlRoutes = new Map(inventory.map((page) => {
  const mirrorPath = `/${page.local_path.replaceAll('\\', '/').replace(/^site\/ecowiseitaly\.com\//, '')}`;
  return [mirrorPath, page.canonical_url || page.url];
}));
const sitemapUrls = sitemapFile && fs.existsSync(sitemapFile)
  ? new Set(parseCsv(fs.readFileSync(sitemapFile, 'utf8').replace(/^\uFEFF/, '')).map((row) => row.url).filter((url) => url && !url.endsWith('.xml')))
  : new Set();
const backupRoutesFile = path.join(auditRoot, 'source', 'backup-routes.json');
const backupRouteIds = fs.existsSync(backupRoutesFile)
  ? new Map(JSON.parse(fs.readFileSync(backupRoutesFile, 'utf8')).filter((item) => item.route && item.id).map((item) => [item.route, Number(item.id)]))
  : new Map();
const htmlRoot = path.join(themeRoot, 'snapshots', 'html');
const routes = {};
const routeAudit = [];

fs.mkdirSync(htmlRoot, { recursive: true });
fs.mkdirSync(auditRoot, { recursive: true });

for (const page of inventory) {
  if (!page.url || !page.local_path || page.status !== '200') continue;

  const route = routeFromUrl(page.url);
  const relative = snapshotRelativePath(route).replaceAll('\\', '/');
  let source = path.join(mirrorRoot, ...page.local_path.split(/[\\/]+/));
  if (!fs.existsSync(source) && /^site[\\/]ecowiseitaly\.com[\\/]/i.test(page.local_path)) {
    source = path.join(mirrorRoot, ...page.local_path.replace(/^site[\\/]ecowiseitaly\.com/i, 'raw/ecowiseitaly.com').split(/[\\/]+/));
  }
  const destination = path.join(htmlRoot, ...relative.split('/'));
  const document = repairDocument(fs.readFileSync(source, 'utf8'), page.canonical_url || page.url);

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, document, 'utf8');
  routes[route] = relative;
  routeAudit.push({
    url: page.url,
    route,
    pageType: page.page_type,
    wordpressObjectId: backupRouteIds.get(route) ?? (page.wp_object_id ? Number(page.wp_object_id) : null),
    title: page.title,
    h1: route === '/' ? 'Ecowise Italy: Bringing nature to learning, bringing learning to life!' : page.h1,
    canonical: page.canonical_url || page.url,
    robots: page.robots,
    sourceSha256: page.html_sha256,
    inSitemap: sitemapUrls.size ? sitemapUrls.has(page.url) : null,
    snapshot: `wp-content/themes/ecowise-custom/snapshots/html/${relative}`,
  });
}

const phpMap = `<?php\n/** Generated by tools/build-fidelity-snapshots.mjs. */\nreturn ${JSON.stringify(routes, null, 2)
  .replaceAll('{', 'array(')
  .replaceAll('}', ')')
  .replace(/"([^"\n]+)":/g, "'$1' =>")
  .replaceAll('"', "'")};\n`;

fs.writeFileSync(path.join(themeRoot, 'snapshots', 'routes.php'), phpMap, 'utf8');
fs.writeFileSync(path.join(auditRoot, 'captured-routes.json'), `${JSON.stringify(routeAudit, null, 2)}\n`, 'utf8');
fs.writeFileSync(path.join(auditRoot, 'indexed-routes.json'), `${JSON.stringify(routeAudit.filter((route) => route.inSitemap !== false), null, 2)}\n`, 'utf8');

process.stdout.write(`Built ${routeAudit.length} fidelity snapshots and vendored ${mirroredAssets.size} runtime assets.\n`);
