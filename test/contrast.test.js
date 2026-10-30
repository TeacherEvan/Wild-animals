/**
 * Deterministic WCAG contrast checks.
 *
 * Axe reports colour-contrast as "incomplete" when an ancestor paints a
 * gradient, which the page body does. These tests compute the real relative
 * luminance ratios for the ink/surface pairs used by the UI, reading the ink
 * values from styles.css so the test cannot drift from the theme.
 *
 * Surface literals mirror the gradient stops in styles.css. They are listed
 * here because a gradient cannot be evaluated by axe; update them with the
 * gradient when the palette changes.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const css = fs.readFileSync(path.join(projectRoot, 'styles.css'), 'utf8');

const ruleBlock = (selector) => {
  const marker = `${selector} {`;
  const start = css.indexOf(marker);
  if (start === -1) throw new Error(`Missing rule: ${selector}`);
  const bodyStart = start + marker.length;
  const end = css.indexOf('}', bodyStart);
  return css.slice(bodyStart, end);
};

const colorOf = (selector, property = 'color') => {
  const match = ruleBlock(selector).match(new RegExp(`${property}:\\s*(#[0-9a-fA-F]{3,8})`));
  if (!match) throw new Error(`No ${property} in ${selector}`);
  return match[1];
};

const hexToRgb = (hex) => {
  const value = hex.replace('#', '');
  const expanded = value.length === 3
    ? value.split('').map((character) => character + character).join('')
    : value;
  return {
    r: parseInt(expanded.slice(0, 2), 16) / 255,
    g: parseInt(expanded.slice(2, 4), 16) / 255,
    b: parseInt(expanded.slice(4, 6), 16) / 255,
  };
};

const relativeLuminance = (hex) => {
  const { r, g, b } = hexToRgb(hex);
  const channel = (value) => (
    value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  );
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
};

const contrastRatio = (foreground, background) => {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));
  return (lighter + 0.05) / (darker + 0.05);
};

const pairs = [
  {
    label: 'score ink on scoreboard',
    foreground: colorOf('.score-board .score-item'),
    backgrounds: ['#F0F8FF', '#E6F3FF'],
    minimum: 4.5,
  },
  {
    label: 'attention title on cue card',
    foreground: colorOf('.attention-title'),
    backgrounds: ['#FFFDF5', '#EAF7FF'],
    minimum: 3,
  },
  {
    label: 'attention call strong on cue card',
    foreground: colorOf('.attention-call strong'),
    backgrounds: ['#FFFDF5', '#EAF7FF'],
    minimum: 4.5,
  },
  {
    label: 'attention hint on cue card',
    foreground: colorOf('.attention-hint'),
    backgrounds: ['#FFFDF5', '#EAF7FF'],
    minimum: 4.5,
  },
  {
    label: 'sensory note on panel',
    foreground: colorOf('.sensory-note'),
    backgrounds: [colorOf('.sensory-panel', 'background')],
    minimum: 4.5,
  },
  {
    label: 'sensory panel title on panel',
    foreground: colorOf('.sensory-panel-title'),
    backgrounds: [colorOf('.sensory-panel', 'background')],
    minimum: 4.5,
  },
  {
    label: 'wiggle kicker on break card',
    foreground: colorOf('.wiggle-kicker'),
    backgrounds: ['#FFFFFF', '#FFF7DC'],
    minimum: 4.5,
  },
  {
    label: 'wiggle count on break card',
    foreground: colorOf('.wiggle-count'),
    backgrounds: ['#FFFFFF', '#FFF7DC'],
    minimum: 3,
  },
  {
    label: 'break invitation text',
    foreground: colorOf('.wiggle-invite'),
    backgrounds: [colorOf('.wiggle-invite', 'background')],
    minimum: 4.5,
  },
  {
    label: 'break invitation primary button',
    foreground: colorOf('.wiggle-invite-start'),
    backgrounds: [colorOf('.wiggle-invite-start', 'background')],
    minimum: 4.5,
  },
  {
    label: 'high contrast body ink',
    foreground: '#000000',
    backgrounds: ['#FFFFFF'],
    minimum: 7,
  },
  {
    label: 'dark theme heading on dark card',
    foreground: '#3CB371',
    backgrounds: ['#1E1E1E'],
    minimum: 3,
  },
];

describe('WCAG contrast tokens', () => {
  for (const pair of pairs) {
    for (const background of pair.backgrounds) {
      it(`${pair.label} (${background}) is at least ${pair.minimum}:1`, () => {
        const ratio = contrastRatio(pair.foreground, background);
        expect(ratio, `${pair.foreground} on ${background} = ${ratio.toFixed(2)}:1`)
          .toBeGreaterThanOrEqual(pair.minimum);
      });
    }
  }
});
