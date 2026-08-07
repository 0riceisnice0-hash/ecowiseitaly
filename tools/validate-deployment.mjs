#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

const repositoryRoot = path.resolve(import.meta.dirname, '..');
const capturedRoutes = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'audit', 'captured-routes.json'), 'utf8'));
const nativeRoutes = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'audit', 'native-routes.json'), 'utf8'));
const indexedRoutes = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'audit', 'indexed-routes.json'), 'utf8'));
const seoProfiles = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'wp-content', 'themes', 'ecowise-custom', 'config', 'seo-metadata.json'), 'utf8'));
const homepageUpdates = JSON.parse(fs.readFileSync(path.join(repositoryRoot, 'content', 'homepage-updates.json'), 'utf8'));
const targetArgument = process.argv[2];

if (!targetArgument || targetArgument === '--help' || targetArgument === '-h') {
  process.stdout.write('Usage: node tools/validate-deployment.mjs <base-url>\nExample: node tools/validate-deployment.mjs https://staging.example.test\n');
  process.exit(targetArgument ? 0 : 2);
}

let target;
try {
  target = new URL(targetArgument);
} catch {
  process.stderr.write(`Invalid base URL: ${targetArgument}\n`);
  process.exit(2);
}

if (!['http:', 'https:'].includes(target.protocol)) {
  process.stderr.write('The base URL must use HTTP or HTTPS.\n');
  process.exit(2);
}
target.pathname = '/';
target.search = '';
target.hash = '';

const errors = [];
const warnings = [];
const timeoutMs = 20_000;
const requestedConcurrency = Number.parseInt(process.env.ECOWISE_DEPLOYMENT_CONCURRENCY || '6', 10);
const deploymentConcurrency = Number.isInteger(requestedConcurrency) && requestedConcurrency >= 1 && requestedConcurrency <= 16
  ? requestedConcurrency
  : 6;

function deploymentUrl(route) {
  return new URL(route.replace(/^\//, ''), target);
}

async function request(route, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(deploymentUrl(route), {
      redirect: options.redirect || 'follow',
      method: options.method || 'GET',
      headers: { 'user-agent': 'Ecowise deployment validator/1.0' },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

function normalizeText(value) {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
    .replace(/&#x([0-9a-f]+);/gi, (_, number) => String.fromCodePoint(Number.parseInt(number, 16)))
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#0?39;|&apos;/gi, "'")
    .replace(/&ndash;|&#8211;/gi, '–')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeBrandPresentation(value) {
  const placeholder = '__ECOWISE_ITALY_BRAND__';
  return value
    .replace(/\bEcowise Italy\b/gi, placeholder)
    .replace(/\bEcowise\b/gi, placeholder)
    .replaceAll(placeholder, 'EcoWise Italy');
}

function extractTag(html, pattern) {
  const match = html.match(pattern);
  return match ? normalizeText(match[1]) : '';
}

function extractCanonical(html) {
  const links = [...html.matchAll(/<link\b[^>]*>/gi)].map((match) => match[0]);
  const canonical = links.find((tag) => /\brel=["'][^"']*\bcanonical\b[^"']*["']/i.test(tag));
  if (!canonical) return '';
  return canonical.match(/\bhref=["']([^"']+)["']/i)?.[1]?.replaceAll('&amp;', '&') || '';
}

function extractMeta(html, attribute, value) {
  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tags = [...html.matchAll(/<meta\b[^>]*>/gi)].map((match) => match[0]);
  const tag = tags.find((candidate) => new RegExp(`\\b${attribute}=["']${escaped}["']`, 'i').test(candidate));
  return tag?.match(/\bcontent=["']([^"']*)["']/i)?.[1]?.replaceAll('&amp;', '&') || '';
}

async function validateRoute(route) {
  let response;
  try {
    response = await request(route.route);
  } catch (error) {
    errors.push(`${route.route}: request failed (${error.message})`);
    return;
  }

  if (response.status !== 200) {
    errors.push(`${route.route}: expected 200, received ${response.status}`);
    return;
  }
  if (!response.headers.get('content-type')?.toLowerCase().includes('text/html')) {
    errors.push(`${route.route}: response is not HTML (${response.headers.get('content-type') || 'no content type'})`);
    return;
  }

  const html = await response.text();
  if (/fatal error|uncaught (?:error|exception)|wordpress database error/i.test(html)) errors.push(`${route.route}: WordPress/PHP error text is present`);

  const title = extractTag(html, /<title\b[^>]*>([\s\S]*?)<\/title>/i);
  const seoProfile = seoProfiles[route.route];
  const expectedTitle = seoProfile ? seoProfile.title : normalizeBrandPresentation(normalizeText(route.title));
  if (title !== expectedTitle) errors.push(`${route.route}: title mismatch (expected "${expectedTitle}", received "${title || '[missing]'}")`);

  const canonical = extractCanonical(html);
  if (canonical !== route.canonical) errors.push(`${route.route}: canonical mismatch (expected ${route.canonical}, received ${canonical || '[missing]'})`);

  if (seoProfile) {
    const metadataContracts = [
      ['name', 'description', seoProfile.description],
      ['property', 'og:title', seoProfile.title],
      ['property', 'og:description', seoProfile.description],
      ['property', 'og:url', seoProfile.canonical],
      ['property', 'og:type', 'website'],
      ['property', 'og:site_name', 'EcoWise Italy'],
      ['property', 'og:locale', seoProfile.locale],
      ['name', 'twitter:card', 'summary_large_image'],
      ['name', 'twitter:title', seoProfile.title],
      ['name', 'twitter:description', seoProfile.description],
    ];
    for (const [attribute, key, expected] of metadataContracts) {
      const actual = normalizeText(extractMeta(html, attribute, key));
      if (actual !== normalizeText(expected)) errors.push(`${route.route}: ${key} mismatch`);
    }
    const schemaMatch = html.match(/<script\b[^>]*\bid=["']ecowise-schema["'][^>]*>([\s\S]*?)<\/script>/i);
    if (!schemaMatch) {
      errors.push(`${route.route}: structured data is missing`);
    } else {
      try {
        const schema = JSON.parse(schemaMatch[1]);
        if (schema['@context'] !== 'https://schema.org' || !Array.isArray(schema['@graph']) || schema['@graph'].length < 2) {
          errors.push(`${route.route}: structured data graph is incomplete`);
        }
      } catch {
        errors.push(`${route.route}: structured data is invalid JSON`);
      }
    }
  }

  if (route.pageType === 'native-page') {
    const h1 = extractTag(html, /<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1 !== route.h1) errors.push(`${route.route}: native H1 mismatch (expected "${route.h1}", received "${h1 || '[missing]'}")`);
    for (const marker of ['data-school-enquiry', 'Tell Adam what your school is looking for', '15–80', '5 days / 4 nights', '7 days / 6 nights', 'Books accommodation and food', 'storytelling', 'ATOL protection is separate from travel insurance', 'November to March', 'elementor-location-header', 'ecowise-school-funnel-css']) {
      if (!html.includes(marker)) errors.push(`${route.route}: native school funnel is missing ${marker}`);
    }
  }

  if (route.route === '/' || route.route === '/what-is-ecowise/') {
    const expectedMissionCount = route.route === '/' ? 2 : 1;
    const actualMissionCount = html.split(homepageUpdates.missionStatement).length - 1;
    if (actualMissionCount !== expectedMissionCount) errors.push(`${route.route}: expected ${expectedMissionCount} approved mission statement instance(s), found ${actualMissionCount}`);
  }

  const isProductionTarget = ['ecowiseitaly.com', 'www.ecowiseitaly.com'].includes(target.hostname.toLowerCase());
  const productionAnchor = html.match(/<a\b[^>]*\bhref=["'](?:https?:)?\/\/(?:www\.)?ecowiseitaly\.com(?:\/|["'])/i);
  if (!isProductionTarget && productionAnchor) {
    errors.push(`${route.route}: an interactive link still points to production instead of ${target.origin}`);
  }
}

async function mapWithConcurrency(items, concurrency, callback) {
  let index = 0;
  async function worker() {
    while (index < items.length) {
      const item = items[index];
      index += 1;
      await callback(item);
    }
  }
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, worker));
}

async function validateSitemap() {
  let indexResponse;
  try {
    indexResponse = await request('/wp-sitemap.xml');
  } catch (error) {
    errors.push(`/wp-sitemap.xml: request failed (${error.message})`);
    return;
  }
  if (indexResponse.status !== 200) {
    errors.push(`/wp-sitemap.xml: expected 200, received ${indexResponse.status}`);
    return;
  }

  const indexXml = await indexResponse.text();
  const childPaths = [...indexXml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((match) => new URL(match[1].replaceAll('&amp;', '&')).pathname);
  if (childPaths.length !== 4) errors.push(`/wp-sitemap.xml: expected four child sitemaps, found ${childPaths.length}`);

  const sitemapPaths = new Set();
  await mapWithConcurrency(childPaths, Math.min(deploymentConcurrency, 4), async (childPath) => {
    try {
      const response = await request(childPath);
      if (response.status !== 200) {
        errors.push(`${childPath}: expected 200, received ${response.status}`);
        return;
      }
      const xml = await response.text();
      for (const match of xml.matchAll(/<loc>([^<]+)<\/loc>/gi)) {
        sitemapPaths.add(new URL(match[1].replaceAll('&amp;', '&')).pathname);
      }
    } catch (error) {
      errors.push(`${childPath}: request failed (${error.message})`);
    }
  });

  const expectedPaths = new Set(indexedRoutes.map((route) => new URL(route.canonical).pathname));
  for (const expected of expectedPaths) if (!sitemapPaths.has(expected)) errors.push(`/wp-sitemap.xml: missing indexed route ${expected}`);
  for (const actual of sitemapPaths) if (!expectedPaths.has(actual)) errors.push(`/wp-sitemap.xml: unexpected indexed route ${actual}`);
}

async function validateNativeEndpoint(route, expectedType) {
  try {
    const response = await request(route);
    if (response.status !== 200) {
      errors.push(`${route}: expected 200, received ${response.status}`);
      return;
    }
    const contentType = response.headers.get('content-type')?.toLowerCase() || '';
    if (!contentType.includes(expectedType)) errors.push(`${route}: expected ${expectedType} response, received ${contentType || '[missing]'}`);
  } catch (error) {
    errors.push(`${route}: request failed (${error.message})`);
  }
}

async function validateRedirect(route, expectedPath) {
  try {
    const response = await request(route, { redirect: 'manual' });
    const location = response.headers.get('location');
    if (![301, 308].includes(response.status)) {
      errors.push(`${route}: expected permanent redirect, received ${response.status}`);
      return;
    }
    if (!location || new URL(location, target).pathname !== expectedPath) errors.push(`${route}: expected redirect to ${expectedPath}, received ${location || '[missing]'}`);
  } catch (error) {
    errors.push(`${route}: redirect check failed (${error.message})`);
  }
}

await mapWithConcurrency([...capturedRoutes, ...nativeRoutes], deploymentConcurrency, validateRoute);
await validateSitemap();
await mapWithConcurrency([
  () => validateNativeEndpoint('/wp-json/', 'application/json'),
  () => validateNativeEndpoint('/feed/', 'xml'),
  () => validateNativeEndpoint('/robots.txt', 'text/plain'),
  () => validateNativeEndpoint('/?s=ecowise', 'text/html'),
  () => validateRedirect('/home/', '/'),
  () => validateRedirect('/sitemap.xml', '/wp-sitemap.xml'),
], deploymentConcurrency, (check) => check());

try {
  const response = await request('/', { method: 'HEAD' });
  if (response.status !== 200) errors.push(`HEAD /: expected 200, received ${response.status}`);
} catch (error) {
  errors.push(`HEAD /: request failed (${error.message})`);
}

if (errors.length) {
  process.stderr.write(`Deployment validation failed for ${target.origin} (${errors.length}):\n- ${errors.join('\n- ')}\n`);
  process.exit(1);
}

process.stdout.write(`Deployment validation passed for ${target.origin}: ${capturedRoutes.length} preserved routes, ${nativeRoutes.length} native growth route, ${indexedRoutes.length} sitemap URLs, four child sitemaps, four native endpoints, two redirects and HEAD handling verified.\n`);
if (warnings.length) process.stdout.write(`Warnings:\n- ${warnings.join('\n- ')}\n`);
