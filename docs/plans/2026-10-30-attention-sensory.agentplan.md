# Attention & Sensory Layer — Blueprint + Plan

```agentplan
@META id=BP-2026-1030-01|repo=Wild-animals|head=e0dcced|branch=main
@STACK static-js|npm|vitest+playwright|github-actions
@GATE build=npm run build|test=npm test|lint=npm run lint|types=n/a
@ENTRY initializeGame() on DOM ready|init-game.js:5
@FACT F1 every runtime UI file lives at repo root; audio/ holds assets only — ONE parent scope|ls -la
@FACT F2 GAME_CONFIG centralises timings, thresholds, counts|game-core.js:91
@FACT F3 index.html loads one module entry then deferred classic scripts|index.html:125-129
@FACT F4 playUISound is a deliberate no-op; only pronunciation audio is sanctioned|real-animal-sounds.js:232-257
@FACT F5 speechSynthesis is the approved auditory channel (rate .8 / pitch 1.1)|real-animal-sounds.js:88-91
@FACT F6 reduced-motion is already honoured globally in CSS|styles.css:62-71,1935-1960
@FACT F7 E2E contract: 6 mode buttons, 4 options, #score/#currentQuestion/#totalQuestions/#streak, speed timer visible|test/e2e/game.spec.js:31-79
@FACT F8 cache-bust rewrites index.html only, never JS import specifiers|scripts/cache-bust.js:38-67
@RISK R1 inserting a module script before init-game.js can reorder boot if it is not also a module|blast=wide
@RISK R2 any added score-board child must stay inside .score-board flex so E2E ids survive|blast=narrow
@GAP G1 no attention getter / call-and-response cue anywhere|conf=high|checked=game-core.js,interactive-features.js,index.html
@GAP G2 no brain break or movement break|conf=high|checked=grep brain|breath|movement
@GAP G3 no chunk / set progress cue|conf=high|checked=game-core.js:567-620,index.html:65-71
@GAP G4 no persisted sensory preferences; only an ephemeral sound toggle|conf=high|checked=game-core.js:1439-1449
@GAP G5 init-game.js imports game-core.js?v=4d0489cc but real hash is 1436adda — stale module cache|conf=high|checked=init-game.js:5 vs asset-manifest.json
@GAP G8 every control used inline onclick, which CSP script-src 'self' blocks; element.onclick was null in the live browser|conf=high|checked=browser probe of #nextBtn/.mode-btn/#soundBtn/#hintBtn
@GAP G6 speed timer never clears the inline red gradient from a previous question|conf=high|checked=game-core.js:677-700
@GAP G7 endGame percentage can exceed 100 once speed bonuses are added|conf=high|checked=game-core.js:1205-1212
@DONE D1 reduced-motion support|styles.css:62
@DONE D2 sound on/off toggle|game-core.js:1439
@DONE D3 30 animal facts already authored in data|game-core.js:155-190
@DONE D4 vibration on animal tap|game-core.js:1455
@DONE D5 classic answer-commit/progress/entrance stagecraft|game-core.js:958-1156
@BAN .env|node_modules|.github|audio/sounds/** (no asset churn)
@NOTE N1 all jobs share one parent folder ⇒ Worker/Verifier fan-out has no disjoint scope; build serially per pitfall 2026-08-13

@JOB J1 [X] scope=./|goal=fix stale module hash, timer gradient reset, score clamp, null guards|needs=F8,G5,G6,G7|gate=npm run test:unit && npm run lint
@JOB J2 [X] scope=./|goal=ship attention cue, wiggle break, chunk cue, sensory preferences, haptics|needs=F1,F2,F4,F5,F6,G1,G2,G3,G4|gate=npm run test:unit
@JOB J3 [X] scope=test|goal=unit + e2e coverage for the attention/sensory layer|needs=J2|gate=npm test
@JOB J4 [X] scope=docs|goal=audit doc with external evidence + README section + roadmap ticks|needs=J2,J3|gate=npm run build
@JOB J5 [X] scope=./|goal=replace CSP-blocked inline handlers with bound listeners and data-action delegation|needs=G8|gate=npm run test:e2e
@JOB J6 [X] scope=./|goal=apply post-build review: focus trap, dark-card ink, cache-bust convergence, cleanup|needs=J5|gate=npm test
@SEQ J1->J2->J3->J4->J5->J6
@EXIT all JOB=[X] && GATE(test)=0 && GATE(lint)=0 && GATE(build)=0
```

@RESULT lint=0|unit=58 passed|e2e=32 passed|build=idempotent|playwright=chromium 1234
