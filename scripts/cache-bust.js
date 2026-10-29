#!/usr/bin/env node
/**
 * Cache-Busting Build Script
 * Generates content hashes for static assets and updates HTML references
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
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
  
  // Generate asset manifest for service worker / debugging
  writeFileSync('./asset-manifest.json', JSON.stringify(hashes, null, 2));
  console.log('Generated asset-manifest.json');
  
  console.log('Cache-busting complete!');
}


main();