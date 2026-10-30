/**
 * PWA asset guard.
 *
 * The manifest must point at real PNG icons (the old data-URL SVG icons are not
 * installable everywhere), the generated service worker must exist, and the
 * registration entry point must ship.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest = JSON.parse(fs.readFileSync(path.join(projectRoot, 'manifest.json'), 'utf8'));

const pngSize = (filePath) => {
  const buffer = fs.readFileSync(filePath);
  expect(buffer.subarray(1, 4).toString('ascii')).toBe('PNG');
  return {
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  };
};

describe('PWA assets', () => {
  it('declares a standalone, scoped app', () => {
    expect(manifest.start_url).toBe('/');
    expect(manifest.scope).toBe('/');
    expect(manifest.display).toBe('standalone');
    expect(manifest.id).toBe('/');
  });

  it('ships real PNG icons at the declared sizes', () => {
    expect(manifest.icons.length).toBeGreaterThanOrEqual(3);

    for (const icon of manifest.icons) {
      expect(icon.src).toMatch(/^icons\/.*\.png$/);
      expect(icon.type).toBe('image/png');

      const filePath = path.join(projectRoot, icon.src);
      expect(fs.existsSync(filePath), `${icon.src} exists`).toBe(true);

      const [width, height] = icon.sizes.split('x').map(Number);
      expect(pngSize(filePath)).toEqual({ width, height });
    }
  });

  it('includes a maskable icon and an apple touch icon', () => {
    expect(manifest.icons.some((icon) => icon.purpose === 'maskable')).toBe(true);
    expect(fs.existsSync(path.join(projectRoot, 'icons/apple-touch-icon-180.png'))).toBe(true);
    expect(pngSize(path.join(projectRoot, 'icons/apple-touch-icon-180.png'))).toEqual({
      width: 180,
      height: 180,
    });
  });

  it('ships the service worker and its registration entry point', () => {
    const serviceWorker = fs.readFileSync(path.join(projectRoot, 'sw.js'), 'utf8');

    expect(serviceWorker).toContain('PRECACHE_URLS');
    expect(serviceWorker).toContain("addEventListener('install'");
    expect(serviceWorker).toContain("addEventListener('fetch'");
    expect(serviceWorker).toContain('wild-animals-');
    expect(fs.existsSync(path.join(projectRoot, 'pwa.js'))).toBe(true);
  });

  it('precaches every animal cue and every icon', () => {
    const serviceWorker = fs.readFileSync(path.join(projectRoot, 'sw.js'), 'utf8');

    const cues = fs.readdirSync(path.join(projectRoot, 'audio', 'sounds'))
      .filter((file) => file.endsWith('.mp3'));
    const icons = fs.readdirSync(path.join(projectRoot, 'icons'))
      .filter((file) => file.endsWith('.png'));

    for (const cue of cues) expect(serviceWorker).toContain(`/audio/sounds/${cue}`);
    for (const icon of icons) expect(serviceWorker).toContain(`/icons/${icon}`);
  });
});
