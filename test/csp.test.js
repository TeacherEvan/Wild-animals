/**
 * CSP regression guard.
 *
 * `script-src 'self'` blocks inline event handlers. A previous release shipped
 * onclick attributes that silently did nothing in production; these assertions
 * stop that class of regression from coming back.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) => fs.readFileSync(path.join(projectRoot, file), 'utf8');

describe('CSP and handler wiring', () => {
  it('ships no inline onclick attributes', () => {
    const markup = read('index.html');
    expect(markup).not.toMatch(/\sonclick\s*=/i);

    for (const file of ['game-core.js', 'interactive-features.js', 'attention-sensory.js']) {
      expect(read(file), file).not.toMatch(/\sonclick\s*=/i);
    }
  });

  it('ships no inline script blocks', () => {
    const markup = read('index.html');
    const inlineScripts = markup.match(/<script(?![^>]*\bsrc=)[^>]*>[\s\S]*?<\/script>/gi) || [];

    expect(inlineScripts).toEqual([]);
    expect(markup).toContain('src="error-logger.js');
    expect(fs.existsSync(path.join(projectRoot, 'error-logger.js'))).toBe(true);
  });

  it('declares script and worker self-origins, and frame protection in headers', () => {
    const markup = read('index.html');
    expect(markup).toContain("script-src 'self'");
    expect(markup).toContain("worker-src 'self'");
    expect(markup).not.toContain("'unsafe-inline' 'self'");
    // frame-ancestors is ignored in a meta tag; it must travel as a header.
    expect(markup).not.toContain('frame-ancestors');
    expect(read('_headers')).toContain("Content-Security-Policy: frame-ancestors 'none'");

    const vercel = JSON.parse(read('vercel.json'));
    const globalHeaders = vercel.headers.find((entry) => entry.source === '/(.*)').headers;
    expect(globalHeaders).toContainEqual({
      key: 'Content-Security-Policy',
      value: "frame-ancestors 'none'",
    });
  });

  it('loads the PWA registration before the game module', () => {
    const markup = read('index.html');
    const pwaIndex = markup.indexOf('src="pwa.js');
    const gameIndex = markup.indexOf('src="init-game.js');

    expect(pwaIndex).toBeGreaterThan(-1);
    expect(gameIndex).toBeGreaterThan(-1);
    expect(pwaIndex).toBeLessThan(gameIndex);
  });
});
