# Attention & Sensory Audit — Wild Animals Adventure

**Date:** 2026-10-30  
**Scope:** `index.html`, `styles.css`, `game-core.js`, `interactive-features.js`, `real-animal-sounds.js`, `audio/sound-loader.js`, build + test tooling  
**Audience:** Lea (product), Evan (technical review), any teacher using the game  
**Status:** Implemented and verified (unit + browser tests below)

---

## 1. Why this pass exists

Kindergarten children (4–6) sustain attention for roughly **8–12 minutes at age 4** and **12–18 minutes at age 6** in optimal conditions (clinical summaries of sustained-attention norms). A ten-question round can exceed that window, especially when a child replays. The game already had strong visual feedback, six modes and animal sounds, but it had **no attention-reset ritual, no movement break, no visible session structure, and no way for a child or grown-up to turn the sensory volume up or down.**

This pass audits the existing experience, checks what the external early-childhood literature actually recommends, and applies the parts that translate honestly into a browser game — without turning the toy into a classroom worksheet.

---

## 2. Method

1. **Code audit** — grep + read of every runtime file, checking for existing attention, sensory, break, chunking, persistence and haptic support.
2. **External investigation** — classroom practice guides and research summaries, prioritising sources that describe *what to do*, not just *why it matters*.
3. **Translation filter** — only techniques that (a) a 4–6-year-old can use without reading, (b) do not require a teacher present, and (c) fit the existing audio constraint (synthesised UI tones are disabled by product decision) were implemented.
4. **Verification** — Vitest unit suite, Playwright browser suite, ESLint, and the cache-busting build, all run locally (commands and results in §7).

---

## 3. Research findings → what shipped

| # | Technique (external evidence) | Source | Applied in this build |
|---|---|---|---|
| 1 | **Call-and-response attention getter.** A simple, taught cue (“Eyes on me” → “Eyes on you”) that the child answers; includes a deliberate pause before instructions. | Australian Education Research Organisation (AERO), *Gaining all students’ attention*, Dec 2023 — recommends countdown, call-and-response, or a visual cue, and says the routine must be taught and rehearsed. | **👀 Eyes on me** button opens a full-screen cue: spoken call, “You say: Eyes on you!”, a slow breath cycle, one big “I’m ready” action, then play resumes. The speed clock pauses. |
| 2 | **Movement brain break.** 1–5 minutes of structured movement or mindfulness, with a visual timer and a calm countdown back to work. | Understood.org, *Brain breaks: An evidence-based behavior strategy* (expert-reviewed, updated 2026) — movement increases blood flow and focus; use a visual timer; end with a calm 10-second countdown. | **🐾 Wiggle break**: four 6-second animal moves (elephant stomps → eagle flaps → giraffe stretch → sleepy-wolf breath), progress bar, countdown, skip button. Offered (never forced) at the halfway point. |
| 3 | **Multisensory / embodied learning.** Pair visual, auditory, kinesthetic and tactile channels; let the body carry part of the concept. | Volpe & Gori, *Multisensory Interactive Technologies for Primary Education*, Frontiers in Psychology, 2019 — reviews visual/auditory/kinesthetic/tactile instruction and embodied/enactive design. | Each answer now touches **four channels**: sight (chunk dots, cue rings, movement cards), sound (spoken cue + animal name/sound), touch (haptics for correct/incorrect/tap), and movement (wiggle break). |
| 4 | **Chunking and a visible schedule.** Short sets with a clear “you are here” marker reduce the open-ended feel of a task and support working memory. | Sustained-attention norms (age 4: 8–12 min; age 6: 12–18 min) plus standard early-years practice of breaking tasks into small sets. | **Set 1 of 2** plus ten dots in the scoreboard; “Halfway Hero” acknowledgement at question 5; break invitation at the same boundary. |
| 5 | **Child-controlled sensory load.** Let the user mute sound, reduce animation and adjust feedback; do not impose maximum stimulation. | Practitioner UX guidance for children’s apps (e.g. Ungrammary, *Designing for Kids*; StoryToys, *Neurodiversity and Designing Children’s Apps*) — recommend customisation, gentle haptics and reduced-animation options. | **⚙️ Sensory settings**: sound, gentle motion, gentle buzz (haptics), high contrast. Persisted in `localStorage`; defaults to gentle motion when the OS requests reduced motion. |
| 6 | **Immediate, positive feedback and curiosity hooks.** Correct answers should be acknowledged at once and followed by something worth wondering about. | Understood/AERO both emphasise immediate acknowledgement; the existing product already had positive feedback. | Success feedback now appends the animal’s authored fact (“🐾 Did you know? …”), turning a correct tap into a curiosity nudge. |

**Sources**

- AERO (2023). *Gaining all students’ attention — classroom management practice guide.* <https://www.edresearch.edu.au/sites/default/files/2023-12/gaining-all-students-attention-aa.pdf>
- Understood.org. *Brain breaks: An evidence-based behavior strategy.* <https://www.understood.org/en/articles/evidence-based-behavior-strategy-brain-breaks>
- Volpe, G. & Gori, M. (2019). *Multisensory Interactive Technologies for Primary Education: From Science to Technology.* Frontiers in Psychology 10:1076. <https://pmc.ncbi.nlm.nih.gov/articles/PMC6611336/>
- Attention-span norms (secondary clinical summaries): <https://www.cnld.org/how-long-should-a-childs-attention-span-be> and <https://www.brainbalancecenters.com/blog/normal-attention-span-expectations-by-age>
- Practitioner UX guidance: <https://www.ungrammary.com/post/designing-for-kids-ux-design-tips-for-children-apps>, <https://storytoys.com/blog/neurodiversity-and-designing-childrens-apps>
- Call-and-response classroom examples: <https://www.edutopia.org/article/7-attention-getters-use-instead-raising-your-voice>

> Evidence note: AERO and Understood are practice guides synthesising research, not single trials. The attention-span figures are clinical summaries with wide ranges. The implementation therefore favours **optional, skippable, low-cost cues** over hard rules like “the game stops after 8 minutes”.

---

## 4. Audit findings

### 4.1 Gaps (now closed)

| ID | Finding | Evidence before | Resolution |
|---|---|---|---|
| G1 | No attention getter, call-and-response or reset ritual anywhere | `grep -ri attention` → 0 hits in runtime JS | 👀 attention cue with spoken call, breath and ready action |
| G2 | No movement or brain break | `grep -ri "brain\|breath\|movement"` → 0 runtime hits | 🐾 four-move wiggle break with progress, countdown and skip |
| G3 | No chunk or set structure; only “Question 6 / 10” | `game-core.js` scoreboard + `loadNextQuestion` | Set label + ten-dot schedule + halfway acknowledgement |
| G4 | No persisted sensory preferences; only an ephemeral sound toggle | `game-core.js` `toggleSound()` | Four persisted preferences; OS reduced-motion becomes the default |
| G5 | Haptics existed only on animal tap, not on answers, and could not be disabled | `game-core.js` `playCurrentAnimalSound()` | Correct/incorrect/tap patterns, gated by the haptics switch |
| G6 | Authored animal facts were never surfaced in classic play | `animals[]` data vs `displaySuccessFeedback()` | “Did you know?” nudge after a correct answer |

### 4.2 Defects found and fixed

| ID | Defect | Evidence | Fix |
|---|---|---|---|
| B1 | **Stale module cache.** `init-game.js` imported `game-core.js?v=4d0489cc` while the real content hash was `1436adda`; the build only rewrote `index.html`, so returning browsers could keep an old game core forever. | `init-game.js:5` vs `asset-manifest.json` | `scripts/cache-bust.js` now rewrites ES import specifiers in JS files, iterates to a stable hash (max 3 passes), then writes the manifest. Verified idempotent. |
| B2 | **Speed timer stayed red.** The low-time gradient was set inline and never cleared, so every later question started red. | `game-core.js` `startCountdownTimer()` | Reset `background`, width and classes at the start of every question. |
| B3 | **End-of-round percentage could exceed 100%.** Speed bonuses were added to the numerator but not the denominator. | `game-core.js` `endGame()` | Clamp to 0–100. |
| B4 | **Unguarded celebration containers.** `createParticles()` / `showConfetti()` assumed `.animal-display` and `#celebration` existed. | `game-core.js` | Null guards; both no-op safely. |
| B5 | **Restart lost accessibility parity.** `restartGame()` rebuilt the animal display as a `div` with no ARIA label, tap hint or keyboard binding. | `game-core.js` `restartGame()` | Rebuilt as a real button with label, hint and `setupKeyboardSupport()` re-bound. |
| B6 | **Sound toggle assumed the button existed.** | `game-core.js` `toggleSound()` | Guarded and mirrored into the sensory preference. |
| B7 | **CSP silently disabled every inline control.** The page ships `script-src 'self'`, which blocks inline `onclick` attributes. Mode buttons, Next, power-ups, the speaker button and the animal tap all had `element.onclick === null` in the browser — a child could answer but never advance, switch mode or use a hint. The E2E suite hid it by calling `window.selectMode` directly. | `index.html` CSP at :19-20; browser probe returned `onclickIsNull: true` for `#nextBtn`, `.mode-btn`, `#soundBtn`, `#hintBtn` | Removed every inline handler; `bindStaticControls()` attaches real listeners, dynamic screens use `data-action` delegation, and the E2E suite now uses real clicks (mode switch, Next advance, speaker toggle, hint spend). |
| B8 | **Body containment trapped fixed overlays.** Even `contain: layout` on `body` makes it the containing block for `position: fixed` descendants. At a 740×360 viewport the attention overlay measured 1563px tall and the card sat at y=-19.5; the sensory toolbar scrolled away with the page. | `styles.css` body rule; measured overlay `height: 1563`, `card.top: -19.5`, and 0/360 after `contain: none` | Removed containment from `body`; overlays and cards gained `overflow-y: auto` and `max-height: calc(100vh - 40px)`. Regression tests for both scroll-fixed toolbar and short-viewport card. |
| B9 | **Persisted “sound off” did not reach the audio engine on reload.** The coach mounts before `real-animal-sounds.js` (classic defer) exists, so the first `applyPreferences()` found no audio module; the module then constructed with `isEnabled = true` and nothing re-synced. Button showed 🔇 while animal audio still played. | `attention-sensory.js` `mount()` / `syncAudioPreference()`; `real-animal-sounds.js:22` | Re-apply preferences on `window.load` (or immediately when the document is already complete), so the stored preference is enforced after every script has run. Verified by reload probe: button 🔇 and `isEnabled === false`. |
| B10 | **`aria-modal="true"` without a focus trap.** Tab from “I’m ready” moved to hidden controls behind the overlay; screen readers could still reach the background. | `attention-sensory.js` overlay templates + `handleKeydown` | Background body children are marked `inert` while a modal is open, Tab/Shift+Tab is cycled inside the overlay, and the state is removed on close. E2E checks focus stays on `#attentionReady` and `#main-content` is inert. |
| B11 | **Dark-theme headings failed contrast on light cards.** `--color-primary` becomes #3CB371 in dark mode while the cue/panel cards stay near-white: 2.62:1 and 2.44:1, below even the 3:1 large-text threshold. | `styles.css` `.attention-title`, `.sensory-panel-title` vs dark theme at :2019 | Pinned both headings to #1F5F3A (≈7.9:1) like `.wiggle-title`; the panel close button also grew from 40px to 48px for small hands. |
| B12 | **Cache-bust loop could exit without converging.** A third-pass rewrite refreshed hashes but never rewrote specifiers again, and matching by basename could swap hashes between same-named files in different folders. | `scripts/cache-bust.js` loop + import matcher | Iterates until a no-change pass (cap 10, warns on a cycle), resolves each specifier against the importing file’s directory, and only rewrites explicit relative `.js` imports. |
| B13 | **`destroy()` leaked its keydown listener** and left `attention-paused` / `break-active` classes and inert attributes behind. | `attention-sensory.js` `destroy()` | Stores the bound handler, removes it, clears modal classes, restores inert state and resets open flags. |

### 4.3 Deliberately not changed

- **Synthesised UI tones stay off.** `real-animal-sounds.js` `playUISound()` is a no-op by product decision (“only pronunciation sounds allowed”). Re-enabling beeps would contradict an explicit prior choice, so the new auditory channel uses **speech only**, through the already-approved `speechSynthesis` path.
- **Breaks are invitations, not interruptions.** The half-way prompt fades after 9 seconds and the manual break is always skippable. Forcing a break on a child mid-flow is a classroom move, not a solo-app move.
- **No leaderboards, badges or streak pressure added.** Those raise arousal, not attention, and conflict with the “protective, calm” product tone.
- **No new audio assets.** The repo’s sound library is already curated; this pass adds no downloads.

---

## 5. What a child now experiences

1. **Start of a round** — scoreboard shows “Set 1 of 2” with ten dots, one highlighted.
2. **Any moment** — three large round controls at the top-left: 👀 (eyes on me), 🐾 (wiggle), ⚙️ (sensory settings).
3. **Eyes on me** — spoken “Eyes on me. You say, eyes on you.”, a slow breathing ring, and one big “I’m ready 🐾” button. The speed clock pauses; if a question was mid-advance, it resumes after the cue.
4. **Question 5 answered** — “🌟 Halfway Hero! 🌟” and a gentle “Wiggle break?” invitation. Accept → four animal moves; ignore → it fades away.
5. **Correct answer** — positive message + the animal’s fact, plus a short triple-buzz (if haptics are on).
6. **Settings** — sound / gentle motion / gentle buzz / high contrast, remembered on the device. Gentle motion also suppresses particles and confetti.

---

## 6. Files changed

| File | Change |
|---|---|
| `attention-sensory.js` | **New** module: `AttentionCoach`, pure chunk/preference helpers, overlays, break, settings, haptics, speech; re-applies preferences on load, traps focus with an inert background, and uses the injected speech constructor |
| `index.html` | Sensory control group, chunk item + dots, overlay mount point, module script/preload, all inline handlers removed |
| `styles.css` | ~400 lines: controls, panel, attention cue, wiggle break, invitation, chunk dots, gentle-motion and high-contrast modes, mobile rules |
| `game-core.js` | Coach bridge, chunk/break hooks, haptic feedback, fact nudge, timer reset + pause guard, score clamp, null guards, restart accessibility fix, CSP-safe control binding |
| `interactive-features.js` | Replaced inline handlers on dynamic completion/hint screens with `data-action` delegation |
| `scripts/cache-bust.js` | Rewrites JS import specifiers to content hashes; stable multi-pass hashing |
| `test/attention-sensory.test.js` | **New** 30 unit tests (helpers + DOM behaviour) |
| `test/e2e/attention-sensory.spec.js` | **New** 7 browser tests |
| `test/e2e/game.spec.js` | Mode test no longer calls `selectMode` directly; added real-click tests for Next, speaker and hint |
| `docs/plans/2026-10-30-attention-sensory.agentplan.md` | Blueprint + plan ledger for this pass |

---

## 7. Verification (real command output)

```bash
npm run test:unit    # 2 files, 58 tests passed
npm run lint         # 0 errors, 0 warnings
npm run build        # cache-busting complete; second run is idempotent
npm run test:e2e     # 32 Playwright chromium tests passed
```

The E2E suite covers the three controls, the attention cue, the wiggle break, preference persistence across reload (including the audio engine), high contrast, dark-mode heading ink, the chunk schedule, gentle-motion particle suppression, real-click mode switching, Next advancement, speaker toggling, hint spending, fixed-toolbar scroll behaviour, short-viewport card fit, focus trapping/inert background, speed-clock pause and pending-advance resume.

---

## 8. Suggested next steps (not in this pass)

1. **Adaptive break timing** — move the invitation earlier for a child who misses two answers in a row, later for a child on a streak.
2. **Teacher/parent card** — a one-page printable explaining the cue and break so the language is shared between home and classroom.
3. **Sound-level preview** — a “test my sound” button inside settings, using the existing animal pronunciation rather than a new tone.
4. **Per-animal movement prompts** — replace the generic four moves with animal-specific actions (hop like a frog, swim like a dolphin) tied to the current question.
