#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const repositoryRoot = path.resolve(process.argv[2] || '.');
const themeRoot = path.join(repositoryRoot, 'wp-content', 'themes', 'ecowise-custom');
const capturedRoutes = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'audit', 'captured-routes.json'), 'utf8'));
const indexedRoutes = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'audit', 'indexed-routes.json'), 'utf8'));
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
}

if (capturedRoutes.length !== 36) errors.push(`expected 36 captured routes; found ${capturedRoutes.length}`);
if (indexedRoutes.length !== 35) errors.push(`expected 35 indexed routes; found ${indexedRoutes.length}`);

const requiredDocs = ['ai.md', 'HANDOVER.md', 'STYLE.md', 'HOMEPAGE.md', 'PROGRESS.md'];
for (const document of requiredDocs) {
  if (!fs.existsSync(path.join(repositoryRoot, document))) errors.push(`required documentation is missing: ${document}`);
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

process.stdout.write(`Theme validation passed: ${capturedRoutes.length} captured routes, ${indexedRoutes.length} indexed routes, ${phpFiles.length} PHP files.\n`);
if (warnings.length) process.stdout.write(`Warnings:\n- ${warnings.join('\n- ')}\n`);

