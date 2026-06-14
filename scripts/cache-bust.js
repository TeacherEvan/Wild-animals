#!/usr/bin/env node
/**
 * Cache-Busting Build Script
 * Generates content hashes for static assets and updates HTML references
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { createHash } from 'crypto';
import { join, extname, basename } from 'path';

const ASSET_DIRS = [
  '.',
  './audio',
];

const ASSET_EXTS = ['.js', '.css', '.html', '.json'];

function getFileHash(filePath) {
  const content = readFileSync(filePath);
  return createHash('sha256').update(content).digest('hex').substring(0, 8);
}

function findAssets(dir) {
  const assets = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules' && entry.name !== 'test') {
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
  
  // Update index.html
  updateHtmlWithHashes('./index.html', hashes);
  
  // Generate asset manifest for service worker / debugging
  writeFileSync('./asset-manifest.json', JSON.stringify(hashes, null, 2));
  console.log('Generated asset-manifest.json');
  
  console.log('Cache-busting complete!');
}

main();