# Plastic Surgery Blueprint: Wild Animals Adventure

## 1. Alignment & Workspace Theme Lock

- **Collaboration Matrix:** `Hybrid` (mobile-first responsive, desktop enhanced) + `Private` (educational, non-commercial) + `All Audiences` (kindergarten children, families, educators)
- **Workspace Theme & Stack:** Educational game for early childhood | Vanilla ES modules, CSS Custom Properties, PWA, Web Speech API, Web Audio API
- **Investigated Modern Techniques Selected:**
  1. **Perceptual `oklch()` Color System** — replaces hex/sRGB tokens with mathematically verified contrast pairs; eliminates banding on OLED dark surfaces; future-proofs against CSS Color 5.
  2. **Compositor-Only Animation Architecture** — eliminates all 12 layout-thrashing transitions (`width`, `height`, `top`, `left`) by converting to `transform`/`opacity`; removes 10 `transition: all` hazards.
  3. **Six-State Tactile Button Spec (WCAG 2.2 Baseline)** — 44×44 px coarse-touch targets, `@media (prefers-reduced-motion: reduce)`, `@media (prefers-contrast: more)`, `@media (forced-colors: active)`, `scroll-margin-top` for sticky headers, `font-variant-numeric: tabular-nums` on live metrics.
  4. **Sub-Perceptual OLED Dither Layer** — 1.5 % fractal noise behind dark gradients to suppress 8-bit banding without affecting text.
  5. **Frame-Rate Independent Kinetic Primitives** — `expDecay()` for UI follow animations; sub-stepped spring solver (`MAX_FRAME_DT = 0.1`, `MAX_SUB_DT = 0.00833`) for any physics-driven motion.

## 2. Perceptual Token & Typography System

| Token | Value (`oklch` / Hex) | Role & Contrast Spec |
| :--- | :--- | :--- |
| `--surface-void` | `oklch(0.12 0.015 265)` | Base void (`Y ≈ 0.00173`) |
| `--surface-canvas` | `oklch(0.15 0.018 265)` | Page canvas (`Y ≈ 0.00338`) |
| `--surface-card` | `oklch(0.18 0.020 265)` | Elevated card / panel (`Y ≈ 0.00583`) |
| `--surface-card-hover` | `oklch(0.21 0.022 265)` | Hover elevation (`Y ≈ 0.00926`) |
| `--accent-primary` | `oklch(0.70 0.150 260)` | Primary action fill (`Y ≈ 0.339`, sRGB in-gamut) |
| `--accent-primary-hover` | `oklch(0.72 0.140 260)` | Hover state (`Y ≈ 0.370`) |
| `--accent-primary-active` | `oklch(0.65 0.170 260)` | Active/pressed (`Y ≈ 0.269`) |
| `--text-on-accent` | `oklch(0.12 0.020 265)` | Foreground on accent (`CR = 7.53:1` WCAG AAA) |
| `--text-primary` | `oklch(0.96 0.005 265)` | Primary text (`APCA -86 Lc`, LC 75+ AAA) |
| `--text-secondary` | `oklch(0.79 0.015 265)` | Secondary content (`APCA -66.8 Lc`, LC 65+ AA) |
| `--text-muted` | `oklch(0.66 0.020 265)` | Muted labels (`APCA -45.9 Lc`, LC 45) |
| `--text-telemetry` | `oklch(0.98 0.002 265)` | High-priority readouts (`tabular-nums`) |
| `--specular-top-subtle` | `inset 0 1px 0 0 oklch(1 0 0 / 0.08)` | Top-edge highlight (cards) |
| `--specular-top-elevated` | `inset 0 1px 0 0 oklch(1 0 0 / 0.16)` | Top-edge highlight (buttons hover) |
| `--specular-top-active` | `inset 0 1px 0 0 oklch(1 0 0 / 0.24)` | Top-edge highlight (buttons active) |
| `--status-nominal` | `oklch(0.72 0.170 145)` | Success / correct (Emerald) |
| `--status-warning` | `oklch(0.78 0.160 75)` | Warning / streak (Amber) |
| `--status-critical` | `oklch(0.65 0.220 25)` | Error / incorrect (Crimson) |

> **Contrast Rule**: `--accent-primary` **must** pair with `--text-on-accent` (`7.53:1`). Pairing with `--text-primary` yields only `2.40:1` — fails WCAG AA.

## 3. Six-State Tactile Button & Control Specification

Applies to: `.mode-btn`, `.option-btn`, `.sound-btn`, `.next-btn`, `.powerup-btn`, `.restart-btn`, `.play-again-btn`, `.attention-ready`, `.wiggle-skip`, `.wiggle-invite-start`, `.wiggle-invite-later`, sensory panel switches.

| State | Visual Spec |
| :--- | :--- |
| **Default** | Gradient `--surface-card` → `--surface-card`, 1px border `oklch(1 0 0 / 0.12)`, `--specular-top-subtle`, dual shadow, **no resting `translate3d`** |
| **Hover** (`@media (hover: hover) and (pointer: fine)`) | `border-color: oklch(1 0 0 / 0.24)`, `transform: translate3d(0, -1px, 0) scale(1.005)`, `::after` glow overlay `opacity: 1` (140 ms `cubic-bezier(0.22, 1, 0.36, 1)`) |
| **Active / Pressed** | `transition-duration: 25ms`, `transform: translate3d(0, 1px, 0) scale(0.985)`, inset shadow inversion, `::after` `opacity: 0` |
| **Focus-Visible** | `outline: 2px solid var(--accent-primary)`, `outline-offset: 2px`, `scroll-margin-top: 5rem` |
| **Disabled** | `opacity: 0.45`, `cursor: not-allowed`, `filter: grayscale(40%)`, `box-shadow: none`, `transform: none !important`, pointer events **preserved** |
| **Loading** (`[data-loading="true"]`) | Width-locked box, `.btn-label { visibility: hidden }`, inline spinner, `cursor: wait` |

**Coarse Touch** (`@media (any-pointer: coarse)`): `min-height: 44px`, `min-width: 44px`, `padding: 0.625rem 1.125rem`.

**Reduced Motion** (`@media (prefers-reduced-motion: reduce)`): All transitions `0.01ms`, `transform: none !important`, spinner `animation-duration: 1.5s`.

**High Contrast** (`@media (prefers-contrast: more)`): Border `var(--text-primary)`, focus outline `3px`.

**Forced Colors** (`@media (forced-colors: active)`): `border: 1px solid ButtonText`, `background: ButtonFace`, `color: ButtonText`, `box-shadow: none`, focus `outline: 2px solid Highlight`.

## 4. Rendering & Smoothness Execution Plan

- **DOM / Layout:**
  - Replace every `transition: width/height/top/left` with `transform: scaleX/scaleY/translateX/translateY`.
  - Replace `transition: all` with explicit compositor-only lists (`transform`, `opacity`, `border-color`, `box-shadow`).
  - Add `contain: layout style` to `.game-container`, `.score-board`, `.options`, `.animal-display`, `.game-area`, `.mode-selection`.
  - Add `font-variant-numeric: tabular-nums` to `#score`, `#currentQuestion`, `#totalQuestions`, `#streak`, `#timerText`, `#chunkProgress`.
  - Add `scroll-margin-top: 5rem` to `:focus-visible` and `[data-focus-target]`.

- **Canvas / Game Loop:**
  - DPR clamp: `Math.min(window.devicePixelRatio || 1, 2)` in any canvas contexts.
  - Particle/confetti loops: `requestAnimationFrame` + `IntersectionObserver` pause when off-screen.
  - No per-frame `new THREE.Vector3()` equivalent allocations (not applicable — no Three.js).

- **3D / WebGL:** N/A (no Three.js/WebGL in this project).

- **Preserved Bindings Check (Immutable):**
  - IDs: `#soundBtn`, `#attentionBtn`, `#wiggleBtn`, `#sensoryBtn`, `#main-content`, `#highScore`, `#modeSelection`, `#score`, `#currentQuestion`, `#totalQuestions`, `#streak`, `#chunkItem`, `#chunkProgress`, `#chunkDots`, `#timerContainer`, `#timerFill`, `#timerText`, `#powerups`, `#hintBtn`, `#eliminateBtn`, `#skipBtn`, `#animalEmoji`, `#question`, `#options`, `#feedback`, `#questionTransition`, `#questionTransitionFill`, `#questionTransitionLabel`, `#nextBtn`, `#celebration`, `#sensoryLayer`, `#sensoryPanel`, `#attentionOverlay`, `#attentionReady`, `#attentionBreath`, `#wiggleOverlay`, `#wiggleEmoji`, `#wiggleTitle`, `#wiggleCue`, `#wiggleProgressFill`, `#wiggleCount`, `#wiggleSkip`, `#wiggleInvite`, `#wiggleInviteStart`, `#wiggleInviteSkip`.
  - `data-testid` / `data-action` attributes, `onclick` handlers via `bindStaticControls()`, `window.initGame`, `window.selectMode`, `window.nextQuestion`, `window.useHint`, `window.eliminateWrong`, `window.skipQuestion`, `window.restartGame`, `window.toggleSound`, `window.playCurrentAnimalSound`, `window.GAME_CONFIG`, `window.animals`, `window.PerformanceUtils`, `window.attentionCoach`, `window.interactiveFeatures`, `document` event listeners for `wildanimals:attentionstart`, `wildanimals:breakstart`, `wildanimals:attentionend`, `wildanimals:breakend`, `wildanimals:sensorychange`.
  - All game logic in `game-core.js`, `interactive-features.js`, `attention-sensory.js`, `real-animal-sounds.js`, `animal-sounds.js`, `audio/sound-loader.js`, `error-logger.js`, `init-game.js`.

## 5. Specific Defect Remediation Map

| Defect | File:Line | Fix |
| :--- | :--- | :--- |
| `LAYOUT_THRASHING_ANIMATION` (skip-link `top`) | `styles.css:87` | Animate `transform: translateY(-100%)` → `translateY(0)` instead of `top` |
| `LAYOUT_THRASHING_ANIMATION` (ripple `width`/`height`) | `styles.css:394` | Use `transform: scale(0)` → `scale(4)` on `::after` pseudo-element |
| `LAYOUT_THRASHING_ANIMATION` (shimmer `left`) | `styles.css:776` | Use `transform: translateX(-100%)` → `translateX(100%)` |
| `LAYOUT_THRASHING_ANIMATION` (timer-fill `width`) | `styles.css:829` | Use `transform: scaleX(0)` → `scaleX(1)` with `transform-origin: left` |
| `LAYOUT_THRASHING_ANIMATION` (sound-wave `width`/`height` @keyframes) | `styles.css:1262-1269` | Use `transform: scale(0)` → `scale(4)` + `opacity` |
| `LAYOUT_THRASHING_ANIMATION` (loading-shimmer `left`) | `styles.css:1796,1799` | Use `transform: translateX(-100%)` → `translateX(100%)` |
| `LAYOUT_THRASHING_ANIMATION` (skeleton `width`) | `styles.css:2632` | Use `transform: scaleX(0)` → `scaleX(1)` |
| `TRANSITION_ALL_HAZARD` (8 instances in `styles.css`) | `styles.css:352,682,703,745,855,1202,1457,1560,1581,1669` | Replace with explicit property list: `transform`, `opacity`, `border-color`, `box-shadow`, `background-color` |
| `WCAG_MISSING_CONTRAST_OR_FORCED_COLORS` | `attention-sensory.js:289` | Add `@media (prefers-contrast: more)` and `@media (forced-colors: active)` blocks in CSS; the JS check is fine but CSS must implement the tokens |

---

## 6. Phase 4 Verification (measured, not asserted)

### Contrasts — real OKLCH→sRGB conversion (Ottosson matrices)

`test/contrast.test.js` parses the `@supports oklch` block from `styles.css`, converts each token to linear sRGB, checks gamut, and locks ratios to 4 decimals. No placeholder assertions.

| Pair | WCAG | APCA \|Lc\| |
| :--- | --- | --- |
| `--accent-primary` / `--text-on-accent` | **7.5260:1** AAA | 53.5 |
| `--text-primary` / `--surface-card` | 16.7503:1 AAA | 99.5 |
| `--text-secondary` / `--surface-card` | 9.7295:1 AA | 67.9 |
| `--text-muted` / `--surface-card` | 6.0456:1 UI | 46.8 |
| `--text-telemetry` / `--surface-void` | 19.1655:1 AAA | 104.3 |
| `--status-critical` / `--surface-card` | 5.2373:1 AA | 42.9 |

All 16 tokens are verified sRGB-in-gamut. Note: saturated crimson scores lower on APCA than WCAG; WCAG is the contract used by axe and the gates, so it remains authoritative.

### Live browser checks (CDP, 390×844 touch @2×)

- `scrollWidth === innerWidth === 390` — no horizontal overflow.
- 19 visible controls, minimum rendered height **44px**; none under 24px.
- Computed `transition-property: transform, border-color, box-shadow`, duration `0.14s` (matches `--transition-fast: 140ms`) — no global override.
- `prefers-reduced-motion: reduce`: all 17 named animations finite (`iteration-count: 1`) and collapsed to `1e-05s`; `scroll-behavior: auto`; functional spinner retains `1.5s`.
- `forced-colors: active`: `ButtonFace` / `ButtonText` / `Highlight` applied to controls and panels.
- `prefers-contrast: more`: `--surface-card` elevated to `oklch(0.20 0.02 265)`.
- Screenshots captured and visually inspected at 390px and desktop.

### Defects found by visual QA (invisible to the static linter and existing E2E)

| Defect | Evidence | Fix |
| :--- | :--- | :--- |
| `.tap-hint` inherited `rgb(0,0,0)` on the dark card (~1.3:1); axe reports "incomplete" because the ancestor paints a gradient | Live computed style | `styles.css`: `.tap-hint { color: var(--text-secondary) }` → 9.73:1 |
| `.score-board` children overflowed the card at 390px (`right=367` vs card `right=329`) and wrapped to 234px tall | Live bounding boxes | `styles.css` mobile block: `flex-wrap: wrap`, `justify-content: center`, `gap`, `font-size: 0.95em`, `white-space: nowrap` → card height 90px, zero overflow |
| Scanner HIGH/MEDIUM in `docs/audit.html` | Regex matches minified Lighthouse JS as CSS `@keyframes` / `transition: all` | Documented false positive (scanner notes §"Common False Positives"). Runtime-only gate passes 100/100, exit 0 |

`test/e2e/responsive.spec.js` now contains a regression test for the two real defects.

## 7. Corrections Found During Full E2E Re-run

The first visual rewrite was **not** regression-free, and an earlier summary wrongly
reported `167 passed, 9 skipped` as a pass — that run also contained failures.

| Regression | Evidence | Fix |
| :--- | :--- | :--- |
| 109 CSS selectors silently deleted (all `.attention-*`, `.wiggle-*`, `.sensory-*`, high-contrast and gentle-motion variants); 2907 → 1326 lines | 48 E2E failures across 5 projects; WebKit clicks never became "stable" | Restored complete baseline CSS underneath the skin as an overriding layer; re-applied 7 precise compositor fixes to the restored legacy rules |
| `.attention-title` lost `#1F5F3A` | `toHaveCSS('color','rgb(31,95,58)')` received `rgb(0,0,0)` in all 5 projects | Restored by the CSS merge; verified `rgb(31,95,58)` in-browser |
| Live `filter: url(#dither-noise)` on a full-viewport `::before` | 26 remaining WebKit/mobile-safari failures; disabling just that filter made the test pass | Removed the dither layer entirely (live filter, SVG tile and PNG tile all destabilised WebKit; visual gain was only ~1.5%). Removed the injection from `init-game.js` and the inert CSS rules |

Baseline comparison in a detached worktree confirmed WebKit passes on unmodified code,
so the remaining 26 failures were mine, not environmental.

**Status (final):** Runtime visual gate 100/100 exit 0; unit 101 passed; WebKit project 43 passed / 3 skipped / 0 failed; full E2E **221 passed, 9 skipped, 0 failed**.