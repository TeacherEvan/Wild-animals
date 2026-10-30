#!/usr/bin/env node
/**
 * Cache-Busting Build Script
 * Generates content hashes for static assets and updates HTML references
 */

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'fs';
import { createHash } from 'crypto';
import { join, extname, basename, dirname, resolve } from 'path';

const ASSET_DIRS = [
  '.',
  './audio',
];

const ASSET_EXTS = ['.js', '.css', '.html', '.json'];

const EXCLUDED_DIRECTORIES = new Set([
  'node_modules',
  'test',
  'test-results',
  'playwright-report',
  'coverage',
  'docs',
]);

const GENERATED_ASSET_FILES = new Set([
  'asset-manifest.json',
  'sw.js',
]);

function getFileHash(filePath) {
  const content = readFileSync(filePath);
  return createHash('sha256').update(content).digest('hex').substring(0, 8);
}

function findAssets(dir) {
  const assets = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && !EXCLUDED_DIRECTORIES.has(entry.name)) {
      assets.push(...findAssets(fullPath));
    } else if (entry.isFile() && ASSET_EXTS.includes(extname(entry.name))) {
      if (GENERATED_ASSET_FILES.has(entry.name)) continue;
      assets.push(fullPath);
    }
  }
  return assets;
}

function updateHtmlWithHashes(htmlPath, hashes) {
  let html = readFileSync(htmlPath, 'utf-8');
  
  // Update script and link references with hash
  for (const [file, hash] of Object.entries(hashes)) {
    const fileName = basename(file);
    
    // Create regex that matches both literal and escaped dots
    const pattern = fileName.replace(/\./g, '\\.'); // literal regex for file name
    
    // Update preload links
    const preloadRegex = new RegExp(`(href=["'])${pattern}(\\?v=[^"']*)?(["'])`, 'g');
    html = html.replace(preloadRegex, `$1${fileName}?v=${hash}$3`);
    
    // Update script src
    const scriptRegex = new RegExp(`(src=["'])${pattern}(\\?v=[^"']*)?(["'])`, 'g');
    html = html.replace(scriptRegex, `$1${fileName}?v=${hash}$3`);
    
    // Update module imports
    const importRegex = new RegExp(`(from ["'])\\.?/${pattern}(\\?v=[^"']*)?(["'])`, 'g');
    html = html.replace(importRegex, `$1./${fileName}?v=${hash}$3`);
    
    // Update stylesheet links
    const stylesheetRegex = new RegExp(`(href=["'])${pattern}(\\?v=[^"']*)?(["'])`, 'g');
    html = html.replace(stylesheetRegex, `$1${fileName}?v=${hash}$3`);
  }
  
  writeFileSync(htmlPath, html);
  console.log(`Updated ${htmlPath} with cache-busting hashes`);
}

/**
 * Rewrite ES module import specifiers inside a .js file so a changed module
 * can never be served from a stale cache under an old ?v= URL.
 *
 * index.html alone is not enough: init-game.js imports game-core.js by URL, and
 * an un-rewritten specifier keeps pointing at the old hash forever.
 *
 * Only explicit relative module specifiers (`./x.js`, `../x.js`) are touched.
 * Bare imports (`vitest/config`) and string literals stay untouched, and the
 * target is resolved against the importing file's directory so two modules with
 * the same basename in different folders can never swap hashes.
 *
 * @param {string} jsPath - JavaScript file to update
 * @param {Map<string, string>} hashIndex - absolute path -> content hash
 * @returns {boolean} true when the file changed on disk
 */
function updateJsImportsWithHashes(jsPath, hashIndex) {
  const originalSource = readFileSync(jsPath, 'utf-8');
  const importPattern = /(\bfrom\s*|\bimport\s*\(\s*)(["'])([^"']+)(["'])/g;

  const updatedSource = originalSource.replace(importPattern, (match, prefix, quoteStart, specifier, quoteEnd) => {
    const [pathPart] = specifier.split('?');

    if (!/^\.{1,2}\//.test(pathPart)) return match;
    if (!/\.m?js$/.test(pathPart)) return match;

    const targetPath = resolve(dirname(jsPath), pathPart);
    const targetHash = hashIndex.get(targetPath);
    if (!targetHash) return match;

    return `${prefix}${quoteStart}${pathPart}?v=${targetHash}${quoteEnd}`;
  });

  if (updatedSource === originalSource) return false;

  writeFileSync(jsPath, updatedSource);
  return true;
}

/**
 * @param {Record<string, string>} hashes - asset path -> content hash
 * @returns {Map<string, string>} absolute path -> content hash
 */
function buildHashIndex(hashes) {
  const index = new Map();
  for (const [assetPath, hash] of Object.entries(hashes)) {
    index.set(resolve(assetPath), hash);
  }
  return index;
}

/**
 * Recompute hashes for every JavaScript asset after import rewriting.
 * @param {string[]} assets - all asset paths
 * @param {Record<string, string>} hashes - mutable hash map
 * @returns {void}
 */
function refreshJavaScriptHashes(assets, hashes) {
  for (const asset of assets) {
    if (!asset.endsWith('.js')) continue;
    hashes[asset] = getFileHash(asset);
  }
}

/**
 * Collect every URL the app shell needs, using the hashed references that were
 * just written into index.html plus the audio cues and PWA icons.
 *
 * @returns {string[]} absolute same-origin URLs
 */
function collectPrecacheUrls() {
  const indexHtml = readFileSync('./index.html', 'utf-8');
  const references = [...indexHtml.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((match) => match[1])
    .filter((url) => !/^(?:[a-z]+:)?\/\//i.test(url))
    .filter((url) => !url.startsWith('data:'))
    .filter((url) => !url.startsWith('#'))
    .map((url) => `/${url.replace(/^\.?\//, '')}`);

  const audioCues = readdirSync('./audio/sounds')
    .filter((file) => file.endsWith('.mp3'))
    .sort()
    .map((file) => `/audio/sounds/${file}`);

  const icons = readdirSync('./icons')
    .filter((file) => file.endsWith('.png'))
    .sort()
    .map((file) => `/icons/${file}`);

  return [...new Set(['/', '/index.html', ...references, ...audioCues, ...icons])];
}

/**
 * Generate sw.js from the current build. Precaching the shell and all 28 cues
 * costs ~1.5 MB and makes the game work in an offline classroom.
 *
 * @returns {void}
 */
function generateServiceWorker() {
  const precacheUrls = collectPrecacheUrls();

  const missingFiles = precacheUrls
    .filter((url) => url !== '/')
    .filter((url) => !existsSync(`.${url.split('?')[0]}`));

  if (missingFiles.length > 0) {
    throw new Error(`Service worker precache is missing: ${missingFiles.join(', ')}`);
  }

  const contentFingerprint = precacheUrls
    .filter((url) => url !== '/')
    .map((url) => getFileHash(`.${url.split('?')[0]}`))
    .join('');
  const cacheVersion = createHash('sha256')
    .update(`${precacheUrls.join('|')}|${contentFingerprint}`)
    .digest('hex')
    .slice(0, 12);

  const serviceWorker = `/* Generated by scripts/cache-bust.js — do not edit by hand. */
const CACHE_NAME = 'wild-animals-${cacheVersion}';
const PRECACHE_URLS = ${JSON.stringify(precacheUrls, null, 2)};

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((key) => key.startsWith('wild-animals-') && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put('/index.html', copy));
          return response;
        })
        .catch(() => caches.match('/index.html').then((cached) => cached || caches.match('/')))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;

      return fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(() => new Response('Offline', { status: 503, statusText: 'Offline' }));
    })
  );
});
`;

  writeFileSync('./sw.js', serviceWorker);
  console.log(`Generated ./sw.js — ${precacheUrls.length} precache URLs, cache ${cacheVersion}`);
}

function main() {
  console.log('Generating cache-busting hashes...');
  
  const allAssets = [];
  for (const dir of ASSET_DIRS) {
    allAssets.push(...findAssets(dir));
  }
  
  const hashes = {};
  for (const asset of allAssets) {
    try {
      const hash = getFileHash(asset);
      hashes[asset] = hash;
      console.log(`  ${asset}: ${hash}`);
    } catch (e) {
      console.warn(`Failed to hash ${asset}: ${e.message}`);
    }
  }

  // Pass over JS import specifiers until stable. A dependency chain may need
  // several rounds; cap at 10 and warn loudly rather than shipping a stale
  // specifier when a cycle prevents convergence.
  const MAX_HASH_PASSES = 10;
  let converged = false;

  for (let pass = 0; pass < MAX_HASH_PASSES; pass++) {
    refreshJavaScriptHashes(allAssets, hashes);
    const hashIndex = buildHashIndex(hashes);
    let changedAny = false;

    for (const asset of allAssets) {
      if (!asset.endsWith('.js')) continue;
      if (updateJsImportsWithHashes(asset, hashIndex)) changedAny = true;
    }

    if (!changedAny) {
      converged = true;
      break;
    }
  }

  if (!converged) {
    console.warn(
      `[cache-bust] Import hashes did not converge after ${MAX_HASH_PASSES} passes. ` +
      'A module import cycle is likely; check the ?v= specifiers manually.'
    );
  }

  // After a no-change pass the hashes already match the content; refresh once
  // more so the manifest and index.html always describe the files on disk.
  refreshJavaScriptHashes(allAssets, hashes);
  
  // Update index.html
  updateHtmlWithHashes('./index.html', hashes);

  // Generate the offline shell after index.html carries the final hashes.
  generateServiceWorker();
  
  // Generate asset manifest for service worker / debugging
  writeFileSync('./asset-manifest.json', JSON.stringify(hashes, null, 2));
  console.log('Generated asset-manifest.json');
  
  console.log('Cache-busting complete!');
}


main();