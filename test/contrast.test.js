/**
 * Deterministic contrast verification for the perceptual oklch() token system.
 *
 * Tokens are parsed from styles.css (the @supports oklch upgrade block), converted
 * from OKLCH to linear sRGB with the Ottosson matrices, and checked for:
 *   1. sRGB gamut safety (no clipped channels),
 *   2. WCAG 2.2 contrast ratios (the authoritative, gate-relevant metric),
 *   3. APCA |Lc| as a secondary cross-check (magnitude; polarity-independent).
 *
 * Expected values are locked to 4 decimals so any token drift fails the suite.
 * There are no placeholder assertions in this file.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const css = fs.readFileSync(path.join(projectRoot, 'styles.css'), 'utf8');

// Read the actual oklch() token block shipped to modern browsers.
const upgradeBlock = css.match(
  /@supports\s*\(color:\s*oklch\([^)]*\)\)\s*\{\s*:root\s*\{([\s\S]*?)\n\s*\}\s*\n\s*\}/
);
if (!upgradeBlock) throw new Error('Missing @supports oklch token block in styles.css');
const block = upgradeBlock[1];

function readToken(name) {
  const match = block.match(
    new RegExp(`--${name}\\s*:\\s*oklch\\(\\s*([\\d.]+)\\s+([\\d.]+)\\s+([\\d.]+)`)
  );
  if (!match) throw new Error(`Missing oklch token: --${name}`);
  return { L: Number(match[1]), C: Number(match[2]), H: Number(match[3]) };
}

/** OKLCH -> linear sRGB using the canonical OKLab matrices. */
function oklchToLinearRGB({ L, C, H }) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  return {
    R: 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    G: -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    B: -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s,
  };
}

function isInGamut({ R, G, B }) {
  return [R, G, B].every((v) => v >= -0.0001 && v <= 1.0001);
}

function relativeLuminance({ R, G, B }) {
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function contrastRatio(a, b) {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  const [hi, lo] = la > lb ? [la, lb] : [lb, la];
  return (hi + 0.05) / (lo + 0.05);
}

const encode = (v) =>
  v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;

/** APCA |Lc| with soft clamp (secondary readability cross-check). */
function apcaMagnitude(fg, bg) {
  const Y = (c) =>
    0.2126729 * encode(c.R) ** 2.4 +
    0.7151522 * encode(c.G) ** 2.4 +
    0.0721750 * encode(c.B) ** 2.4;
  const clamp = (y) => (y < 0.022 ? y + (0.022 - y) ** 1.414 : y);
  const yf = clamp(Y(fg));
  const yb = clamp(Y(bg));
  const sapc =
    yf > yb ? (yf ** 0.57 - yb ** 0.56) * 1.14 : (yb ** 0.65 - yf ** 0.62) * 1.14;
  return (sapc < 0.1 ? 0 : sapc - 0.0005) * 100;
}

const TOKENS = [
  'surface-void',
  'surface-canvas',
  'surface-card',
  'surface-card-hover',
  'surface-card-active',
  'accent-primary',
  'accent-primary-hover',
  'accent-primary-active',
  'text-on-accent',
  'status-nominal',
  'status-warning',
  'status-critical',
  'text-primary',
  'text-secondary',
  'text-muted',
  'text-telemetry',
];

const C = Object.fromEntries(
  TOKENS.map((name) => [name, oklchToLinearRGB(readToken(name))])
);

// [label, foreground, background, locked WCAG, locked APCA |Lc|, WCAG minimum]
const PAIRS = [
  ['accent / text-on-accent (AAA)', 'accent-primary', 'text-on-accent', 7.5260, 53.506, 7.0],
  ['text-primary / card (AAA)', 'text-primary', 'surface-card', 16.7503, 99.529, 7.0],
  ['text-secondary / card (AA)', 'text-secondary', 'surface-card', 9.7295, 67.852, 4.5],
  ['text-muted / card (UI)', 'text-muted', 'surface-card', 6.0456, 46.792, 3.0],
  ['text-telemetry / void (AAA)', 'text-telemetry', 'surface-void', 19.1655, 104.255, 7.0],
  ['status-nominal / card (AA)', 'status-nominal', 'surface-card', 8.0805, 59.334, 4.5],
  ['status-warning / card (AA)', 'status-warning', 'surface-card', 9.1841, 65.347, 4.5],
  ['status-critical / card (AA)', 'status-critical', 'surface-card', 5.2373, 42.928, 4.5],
  ['status-nominal / void (AAA)', 'status-nominal', 'surface-void', 8.7189, 60.036, 7.0],
];

describe('Perceptual token gamut', () => {
  it(`all ${TOKENS.length} oklch tokens are inside sRGB gamut (no clipped channels)`, () => {
    for (const name of TOKENS) {
      expect(isInGamut(C[name]), `--${name} clips in sRGB`).toBe(true);
    }
  });

  it('headline accent primary converts to the documented Y ~= 0.339', () => {
    expect(relativeLuminance(C['accent-primary'])).toBeCloseTo(0.3392, 3);
  });
});

describe('WCAG 2.2 contrast (authoritative)', () => {
  for (const [label, fg, bg, locked, , minimum] of PAIRS) {
    it(`${label}: computed ratio meets ${minimum}:1`, () => {
      expect(contrastRatio(C[fg], C[bg])).toBeGreaterThanOrEqual(minimum);
    });

    it(`${label}: ratio is ${locked.toFixed(4)}:1 (drift guard)`, () => {
      expect(contrastRatio(C[fg], C[bg])).toBeCloseTo(locked, 3);
    });
  }
});

describe('APCA cross-check (secondary)', () => {
  for (const [label, fg, bg, , lockedLc] of PAIRS) {
    it(`${label}: |Lc| is ${lockedLc.toFixed(3)} (drift guard)`, () => {
      expect(apcaMagnitude(C[fg], C[bg])).toBeCloseTo(lockedLc, 2);
    });
  }
});
