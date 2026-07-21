#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const repositoryRoot = path.resolve(process.argv[2] || '.');
const themeRoot = path.join(repositoryRoot, 'wp-content', 'themes', 'ecowise-custom');
const capturedRoutes = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'audit', 'captured-routes.json'), 'utf8'));
const indexedRoutes = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'audit', 'indexed-routes.json'), 'utf8'));
const uploadManifest = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'audit', 'source', 'uploads-manifest.json'), 'utf8'));
const uploadPaths = new Set(uploadManifest.map((item) => item.path.replaceAll('\\', '/')));
const referencedUploads = new Set();
const internalPageLinks = new Set();
let facebookEmbedCount = 0;
const facebookEmbedUrls = new Set();
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
  const canonicalCount = countMatches(html, /<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/gi);
  if (canonicalCount !== 1) errors.push(`${route.route}: expected one canonical; found ${canonicalCount}`);
  if (!html.includes(`href="${route.canonical}" rel="canonical"`)) errors.push(`${route.route}: canonical does not match ${route.canonical}`);
  if (/__q_[0-9a-f]+/i.test(html)) errors.push(`${route.route}: mirror query-hash artifact remains`);
  if (/google_gtagjs-js/i.test(html)) errors.push(`${route.route}: captured analytics script remains`);

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
    } catch {
      warnings.push(`${route.route}: could not parse iframe URL (${iframe[1]})`);
    }
  }
}

if (capturedRoutes.length !== 36) errors.push(`expected 36 captured routes; found ${capturedRoutes.length}`);
if (indexedRoutes.length !== 35) errors.push(`expected 35 indexed routes; found ${indexedRoutes.length}`);
if (facebookEmbedCount !== 80) errors.push(`expected 80 restored Facebook embed instances; found ${facebookEmbedCount}`);
if (facebookEmbedUrls.size !== 20) errors.push(`expected 20 unique restored Facebook post URLs; found ${facebookEmbedUrls.size}`);

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

if (!process.env.PHP_BINARY) warnings.push('PHP_BINARY was not set; run PHP syntax lint in staging/CI.');

if (errors.length) {
  process.stderr.write(`Theme validation failed (${errors.length}):\n- ${errors.join('\n- ')}\n`);
  process.exit(1);
}

process.stdout.write(`Theme validation passed: ${capturedRoutes.length} captured routes, ${indexedRoutes.length} indexed routes, ${phpFiles.length} PHP files, ${referencedUploads.size} uploads, ${internalPageLinks.size} internal link targets and ${facebookEmbedCount} Facebook embed instances (${facebookEmbedUrls.size} unique posts) verified.\n`);
if (warnings.length) process.stdout.write(`Warnings:\n- ${warnings.join('\n- ')}\n`);
