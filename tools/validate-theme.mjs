#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const repositoryRoot = path.resolve(process.argv[2] || '.');
const themeRoot = path.join(repositoryRoot, 'wp-content', 'themes', 'ecowise-custom');
const capturedRoutes = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'audit', 'captured-routes.json'), 'utf8'));
const indexedRoutes = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'audit', 'indexed-routes.json'), 'utf8'));
const uploadManifest = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'audit', 'source', 'uploads-manifest.json'), 'utf8'));
const backupRoutes = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'audit', 'source', 'backup-routes.json'), 'utf8'));
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
const errors = [];
const warnings = [];

function countMatches(value, pattern) {
  return [...value.matchAll(pattern)].length;
}

for (const route of capturedRoutes) {
  const file = path.join(repositoryRoot, ...route.snapshot.split('/'));
  if (!fs.existsSync(file)) {
    errors.push(`${route.route}: snapshot is missing (${route.snapshot})`);
    continue;
  }

  const html = fs.readFileSync(file, 'utf8');
  contactFormCount += countMatches(html, /name=["']form_id["'][^>]*value=["']68574d28["']/gi);
  newsletterFormCount += countMatches(html, /name=["']form_id["'][^>]*value=["']1b3fffa7["']/gi);
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
if (facebookEmbedCount !== 80) errors.push(`expected 80 restored Facebook embed instances; found ${facebookEmbedCount}`);
if (facebookEmbedUrls.size !== 20) errors.push(`expected 20 unique restored Facebook post URLs; found ${facebookEmbedUrls.size}`);
if (pdfViewerCount !== 16) errors.push(`expected 16 archive PDF viewers; found ${pdfViewerCount}`);
if (contactFormCount !== 1) errors.push(`expected one captured contact form identity; found ${contactFormCount}`);
if (newsletterFormCount !== 3) errors.push(`expected three captured newsletter form identities; found ${newsletterFormCount}`);
for (const route of ['/news/', '/author/admin/', '/category/uncategorized/', '/2024/09/22/']) {
  const actual = pdfViewersByRoute.get(route) || [];
  if (actual.length !== 4 || archivePdfPaths.some((pdf) => !actual.includes(pdf))) errors.push(`${route}: archive PDF viewer set is incomplete or incorrect`);
}

const routeMapPhp = fs.readFileSync(path.join(themeRoot, 'snapshots', 'routes.php'), 'utf8');
const mappedRoutes = new Map([...routeMapPhp.matchAll(/^\s*'([^']+)'\s*=>\s*'([^']+)',?$/gm)].map((match) => [match[1], match[2]]));
if (mappedRoutes.size !== capturedRoutes.length) errors.push(`snapshot PHP route map has ${mappedRoutes.size} entries; expected ${capturedRoutes.length}`);
for (const route of capturedRoutes) {
  const expectedSnapshot = route.snapshot.split('/snapshots/html/')[1];
  if (mappedRoutes.get(route.route) !== expectedSnapshot) errors.push(`${route.route}: PHP route map does not point to ${expectedSnapshot}`);
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
