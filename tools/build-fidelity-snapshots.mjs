#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const [inventoryFile, mirrorRoot, themeRoot, auditRoot, sitemapFile] = process.argv.slice(2);

if (!inventoryFile || !mirrorRoot || !themeRoot || !auditRoot) {
  throw new Error('Usage: node tools/build-fidelity-snapshots.mjs <page-inventory.csv> <mirror-root> <theme-root> <audit-root> [sitemap-urls.csv]');
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
    const targetPath = normalizeMirrorFilename(decodeURI(resolved.pathname));
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

function repairDocument(html, canonical) {
  const escapeAttribute = (value) => value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;');
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
    );

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

  return result;
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
const htmlRoot = path.join(themeRoot, 'snapshots', 'html');
const routes = {};
const routeAudit = [];

fs.mkdirSync(htmlRoot, { recursive: true });
fs.mkdirSync(auditRoot, { recursive: true });

for (const page of inventory) {
  if (!page.url || !page.local_path || page.status !== '200') continue;

  const route = routeFromUrl(page.url);
  const relative = snapshotRelativePath(route).replaceAll('\\', '/');
  const source = path.join(mirrorRoot, ...page.local_path.split(/[\\/]+/));
  const destination = path.join(htmlRoot, ...relative.split('/'));
  const document = repairDocument(fs.readFileSync(source, 'utf8'), page.canonical_url || page.url);

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, document, 'utf8');
  routes[route] = relative;
  routeAudit.push({
    url: page.url,
    route,
    pageType: page.page_type,
    wordpressObjectId: page.wp_object_id ? Number(page.wp_object_id) : null,
    title: page.title,
    h1: page.h1,
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
