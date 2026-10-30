# Quality Gates — 2026-10-30

## What runs

| Gate | Command | What it proves |
|---|---|---|
| Lint | `npm run lint` | ESLint 10 clean, generated artefacts excluded |
| Unit + coverage | `npm run test:unit -- --coverage` | 90 tests; coverage floor 35% statements / 30% branches / 30% functions / 35% lines |
| Audio guard | inside unit suite | every animal has an MP3, each cue <200 KB, total <3 MB, no WAVs |
| PWA guard | inside unit suite | real PNG icons at declared sizes, maskable icon, Apple touch icon, generated SW + registration |
| Contrast tokens | inside unit suite | deterministic WCAG ratios for ink/surface pairs that axe cannot evaluate over gradients |
| E2E matrix | `npm run test:e2e` | 225 cases across Chromium, Firefox, WebKit, Pixel 7 and iPhone 13 |
| Accessibility | inside E2E | axe WCAG 2.1 A/AA; fails on critical **and** serious violations |
| Responsive | inside E2E | 320×568, 390×844, 844×390: no horizontal overflow, fixed tools in bounds, cue card fits |
| Touch | inside E2E | real `page.touchscreen.tap()` on mobile projects |
| Payload budget | inside E2E | shell <600 KB and zero animal-audio requests before a tap |
| Offline | inside E2E | installable with no CDP installability errors; reload offline; decode a cue from cache |
| Build | `npm run build` | cache-busting, generated `sw.js`, idempotent on a second run |

## Browser matrix

`playwright.config.js` runs the same suite on:

- Desktop Chrome
- Desktop Firefox
- Desktop Safari (WebKit)
- Pixel 7 (Chromium, touch, mobile viewport)
- iPhone 13 (WebKit, touch, mobile viewport)

Fast local loops:

```bash
npm run test:e2e:chromium
npm run test:e2e:mobile
```

## Accessibility policy

- Axe gate asserts `critical` and `serious`; a `critical`-only gate would hide colour-contrast and label failures.
- Axe runs after a 400 ms settle so a mid-fade opacity is not mistaken for a contrast failure.
- Colour contrast is checked deterministically in `test/contrast.test.js` because gradient backgrounds make axe return `incomplete` rather than a violation.
- Visible text and accessible name must agree. This pass removed mismatched `aria-label` attributes from mode buttons, power-ups, the Next button and the animal display; the visible text is now the name.
- Modals (`aria-modal="true"`) set `inert` on the background and trap Tab, so `aria-modal` is enforced rather than promised.

## Known limits

- Hosted GitHub Actions runners are currently not allocating jobs for this account; the workflow is configured for the full matrix but will not execute until that is resolved. `npm run ci` is the local equivalent.
- The offline spec runs on Chromium only. Firefox and WebKit load the app but Playwright's offline emulation is less reliable there; the generated worker is still installed and used by both.
- Coverage is 36.6% statements overall; `game-core.js` remains the largest untested surface (9.65%). The floor prevents regression but does not replace game-loop unit tests.
