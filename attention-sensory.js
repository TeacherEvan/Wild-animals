/**
 * Attention & Sensory Layer for Wild Animals Adventure
 *
 * Applies early-childhood attention techniques that are well represented in
 * classroom practice and in the research literature:
 *
 *  - Call-and-response attention cue ("Eyes on me" / "Eyes on you") with a
 *    deliberate pause, a slow breath, and a single clear action to resume.
 *  - Movement brain break (1-5 minutes in classrooms; ~24s in-app) built from
 *    animal role-play, ending with a calming breath.
 *  - Chunked progress cues (sets of five questions) so the session has visible
 *    structure instead of an open-ended run.
 *  - Child-controlled sensory preferences: sound, gentle motion, haptics and
 *    high contrast, persisted between visits.
 *
 * Design constraints inherited from the existing app:
 *  - Synthesised UI tones are disabled by product decision
 *    (real-animal-sounds.js playUISound is a no-op). All spoken cues therefore
 *    go through speechSynthesis, the channel already approved for animal names.
 *  - Reduced-motion is already honoured globally; this module adds an explicit
 *    "gentle motion" switch that also suppresses particles and confetti.
 *
 * @module attention-sensory
 * @version 1.0.0
 */

export const SENSORY_PREFERENCES_KEY = 'wildAnimalsSensoryPrefs';
export const DEFAULT_CHUNK_SIZE = 5;

/** How long the attention cue stays open before it releases on its own. */
export const ATTENTION_CUE_DURATION = 12000;

/** Seconds per movement in the wiggle break. */
export const BREAK_MOVE_SECONDS = 6;

/** Preference shape. Sound and haptics default on; extra motion defaults off
 *  when the operating system asks for reduced motion. */
export const DEFAULT_SENSORY_PREFERENCES = Object.freeze({
  sound: true,
  gentleMotion: false,
  haptics: true,
  highContrast: false,
});

/** Four-step animal movement break: three energising moves, one calm finish. */
export const WIGGLE_MOVES = Object.freeze([
  Object.freeze({
    emoji: '🐘',
    title: 'Stomp like an elephant',
    cue: 'Stomp, stomp, stomp!',
    spoken: 'Stomp like an elephant. Stomp, stomp, stomp!',
  }),
  Object.freeze({
    emoji: '🦅',
    title: 'Flap like an eagle',
    cue: 'Flap your big wings!',
    spoken: 'Flap like an eagle. Flap, flap, flap!',
  }),
  Object.freeze({
    emoji: '🦒',
    title: 'Stretch like a giraffe',
    cue: 'Reach up high!',
    spoken: 'Stretch like a giraffe. Reach up high!',
  }),
  Object.freeze({
    emoji: '🐺',
    title: 'Breathe like a sleepy wolf',
    cue: 'Breathe in… and out…',
    spoken: 'Breathe in. And slowly out. Well done.',
  }),
]);

const PREFERENCE_KEYS = ['sound', 'gentleMotion', 'haptics', 'highContrast'];

/**
 * Coerce stored or partial preferences into a complete, typed object.
 * Unknown keys are dropped so a corrupted localStorage entry cannot leak
 * arbitrary state into the UI.
 *
 * @param {Object} [rawPreferences] - Partial preference object
 * @returns {{sound: boolean, gentleMotion: boolean, haptics: boolean, highContrast: boolean}}
 */
export function normaliseSensoryPreferences(rawPreferences = {}) {
  const source = rawPreferences && typeof rawPreferences === 'object' ? rawPreferences : {};

  return {
    sound: source.sound !== false,
    gentleMotion: source.gentleMotion === true,
    haptics: source.haptics !== false,
    highContrast: source.highContrast === true,
  };
}

/**
 * Build the starting preferences for a first-time visitor.
 *
 * @param {boolean} prefersReducedMotion - OS reduced-motion signal
 * @returns {{sound: boolean, gentleMotion: boolean, haptics: boolean, highContrast: boolean}}
 */
export function getDefaultSensoryPreferences(prefersReducedMotion = false) {
  return normaliseSensoryPreferences({
    ...DEFAULT_SENSORY_PREFERENCES,
    gentleMotion: prefersReducedMotion === true,
  });
}

/**
 * Read persisted preferences without ever throwing (private mode, quota, or
 * blocked storage all fall back to defaults).
 *
 * @param {Storage|null} storage - localStorage-like object
 * @param {boolean} prefersReducedMotion - OS reduced-motion signal
 * @returns {{sound: boolean, gentleMotion: boolean, haptics: boolean, highContrast: boolean}}
 */
export function readSensoryPreferences(storage, prefersReducedMotion = false) {
  const defaults = getDefaultSensoryPreferences(prefersReducedMotion);

  if (!storage || typeof storage.getItem !== 'function') return defaults;

  try {
    const storedValue = storage.getItem(SENSORY_PREFERENCES_KEY);
    if (!storedValue) return defaults;

    const parsed = JSON.parse(storedValue);
    if (!parsed || typeof parsed !== 'object') return defaults;

    return normaliseSensoryPreferences({ ...defaults, ...parsed });
  } catch {
    return defaults;
  }
}

/**
 * Persist preferences. Returns false when storage is unavailable.
 *
 * @param {Object} preferences - Preference object
 * @param {Storage|null} storage - localStorage-like object
 * @returns {boolean} true when written
 */
export function saveSensoryPreferences(preferences, storage) {
  if (!storage || typeof storage.setItem !== 'function') return false;

  try {
    storage.setItem(SENSORY_PREFERENCES_KEY, JSON.stringify(normaliseSensoryPreferences(preferences)));
    return true;
  } catch {
    return false;
  }
}

/**
 * True when a finished-question count lands on a chunk boundary.
 *
 * @param {number} completedQuestions - Questions answered so far (1-based count)
 * @param {number} [chunkSize] - Questions per set
 * @returns {boolean}
 */
export function isChunkBoundary(completedQuestions, chunkSize = DEFAULT_CHUNK_SIZE) {
  return (
    Number.isInteger(completedQuestions) &&
    Number.isInteger(chunkSize) &&
    chunkSize > 0 &&
    completedQuestions > 0 &&
    completedQuestions % chunkSize === 0
  );
}

/**
 * Which set a question belongs to (1-based).
 *
 * @param {number} questionNumber - 1-based question number
 * @param {number} [chunkSize] - Questions per set
 * @returns {number}
 */
export function getChunkIndex(questionNumber, chunkSize = DEFAULT_CHUNK_SIZE) {
  if (!Number.isFinite(questionNumber) || questionNumber <= 0) return 1;
  return Math.ceil(questionNumber / chunkSize);
}

/**
 * How many sets a run contains.
 *
 * @param {number} totalQuestions - Total questions in the run
 * @param {number} [chunkSize] - Questions per set
 * @returns {number}
 */
export function getChunkCount(totalQuestions, chunkSize = DEFAULT_CHUNK_SIZE) {
  if (!Number.isFinite(totalQuestions) || totalQuestions <= 0) return 1;
  return Math.max(1, Math.ceil(totalQuestions / chunkSize));
}

/**
 * Human-readable set label, e.g. "Set 1 of 2".
 *
 * @param {number} questionNumber - 1-based question number
 * @param {number} totalQuestions - Total questions in the run
 * @param {number} [chunkSize] - Questions per set
 * @returns {string}
 */
export function buildChunkLabel(questionNumber, totalQuestions, chunkSize = DEFAULT_CHUNK_SIZE) {
  if (!Number.isFinite(totalQuestions) || totalQuestions <= 0) {
    return `Set ${getChunkIndex(questionNumber, chunkSize)}`;
  }

  return `Set ${getChunkIndex(questionNumber, chunkSize)} of ${getChunkCount(totalQuestions, chunkSize)}`;
}

/**
 * Visual schedule for the run: one entry per question.
 *
 * @param {number} questionNumber - 1-based current question
 * @param {number} totalQuestions - Total questions in the run
 * @returns {Array<'done'|'current'|'todo'>}
 */
export function getChunkDots(questionNumber, totalQuestions) {
  const safeTotal = Number.isFinite(totalQuestions) && totalQuestions > 0 ? Math.floor(totalQuestions) : 0;
  const dots = [];

  for (let dotIndex = 1; dotIndex <= safeTotal; dotIndex++) {
    if (dotIndex < questionNumber) dots.push('done');
    else if (dotIndex === questionNumber) dots.push('current');
    else dots.push('todo');
  }

  return dots;
}

/**
 * Should the app offer a movement break after this many completed questions?
 * Timed and drag-and-drop modes are excluded: a break there would corrupt the
 * activity rather than reset attention.
 *
 * @param {number} completedQuestions - Questions answered so far
 * @param {string} mode - Current game mode
 * @param {number} [chunkSize] - Questions per set
 * @returns {boolean}
 */
export function shouldOfferWiggleBreak(completedQuestions, mode, chunkSize = DEFAULT_CHUNK_SIZE) {
  const breakFriendlyModes = ['classic', 'quiz'];
  return breakFriendlyModes.includes(mode) && isChunkBoundary(completedQuestions, chunkSize);
}

/**
 * Owns the attention cue, wiggle break, chunk indicator and sensory panel.
 */
export class AttentionCoach {
  /**
   * @param {Object} [options]
   * @param {Document} [options.document]
   * @param {Window} [options.window]
   * @param {Storage|null} [options.storage]
   * @param {Function|null} [options.speechSynthesis]
   */
  constructor(options = {}) {
    this.doc = options.document || (typeof document !== 'undefined' ? document : null);
    this.win = options.window || (typeof window !== 'undefined' ? window : null);
    this.storage = options.storage !== undefined
      ? options.storage
      : (this.win && this.win.localStorage ? this.win.localStorage : null);
    this.speech = options.speechSynthesis !== undefined
      ? options.speechSynthesis
      : (this.win && this.win.speechSynthesis ? this.win.speechSynthesis : null);

    this.mounted = false;
    this.attentionOpen = false;
    this.breakOpen = false;
    this.breakStepIndex = 0;
    this.breakSecondsLeft = BREAK_MOVE_SECONDS;
    this.attentionTimer = null;
    this.attentionBreathTimer = null;
    this.breakTicker = null;
    this.breakInviteTimer = null;
    this.lastFocusedElement = null;
    this.boundKeydown = null;
    this.inertedElements = [];
    this.preferences = getDefaultSensoryPreferences(this.prefersReducedMotion());

    this.elements = {};
  }

  /**
   * @returns {boolean} OS-level reduced-motion preference
   */
  prefersReducedMotion() {
    if (!this.win || typeof this.win.matchMedia !== 'function') return false;

    try {
      return this.win.matchMedia('(prefers-reduced-motion: reduce)').matches === true;
    } catch {
      return false;
    }
  }

  /**
   * Build the DOM once and bind every control. Safe to call repeatedly.
   * @returns {AttentionCoach}
   */
  mount() {
    if (this.mounted || !this.doc || !this.doc.body) return this;

    this.preferences = readSensoryPreferences(this.storage, this.prefersReducedMotion());
    this.buildLayer();
    this.bindControls();
    this.applyPreferences();
    this.mounted = true;

    // Classic defer scripts (real-animal-sounds.js) execute after this module,
    // so the first apply cannot reach the audio engine. Re-apply on load so a
    // persisted "sound off" is honoured on the very first question.
    if (this.win && typeof this.win.addEventListener === 'function') {
      if (this.doc.readyState === 'complete') {
        this.applyPreferences();
      } else {
        this.win.addEventListener('load', () => this.applyPreferences(), { once: true });
      }
    }

    return this;
  }

  /**
   * Create (or reuse) the overlay layer and the four UI surfaces.
   * @returns {void}
   */
  buildLayer() {
    const doc = this.doc;
    let layer = doc.getElementById('sensoryLayer');

    if (!layer) {
      layer = doc.createElement('div');
      layer.id = 'sensoryLayer';
      layer.className = 'sensory-layer';
      doc.body.appendChild(layer);
    }

    if (!doc.getElementById('sensoryPanel')) {
      layer.insertAdjacentHTML('beforeend', this.templateSettingsPanel());
    }
    if (!doc.getElementById('attentionOverlay')) {
      layer.insertAdjacentHTML('beforeend', this.templateAttentionOverlay());
    }
    if (!doc.getElementById('wiggleOverlay')) {
      layer.insertAdjacentHTML('beforeend', this.templateWiggleOverlay());
    }
    if (!doc.getElementById('wiggleInvite')) {
      const gameArea = doc.getElementById('gameArea');
      if (gameArea && gameArea.parentElement) {
        // Outside #gameArea: end-of-round and interactive modes replace its
        // innerHTML, which would detach the invitation node.
        gameArea.insertAdjacentHTML('beforebegin', this.templateWiggleInvite());
      } else {
        doc.body.insertAdjacentHTML('beforeend', this.templateWiggleInvite());
      }
    }

    this.elements = {
      layer,
      panel: doc.getElementById('sensoryPanel'),
      panelButton: doc.getElementById('sensoryBtn'),
      attentionButton: doc.getElementById('attentionBtn'),
      wiggleButton: doc.getElementById('wiggleBtn'),
      attentionOverlay: doc.getElementById('attentionOverlay'),
      attentionReady: doc.getElementById('attentionReady'),
      attentionBreath: doc.getElementById('attentionBreath'),
      wiggleOverlay: doc.getElementById('wiggleOverlay'),
      wiggleEmoji: doc.getElementById('wiggleEmoji'),
      wiggleTitle: doc.getElementById('wiggleTitle'),
      wiggleCue: doc.getElementById('wiggleCue'),
      wiggleProgressFill: doc.getElementById('wiggleProgressFill'),
      wiggleCount: doc.getElementById('wiggleCount'),
      wiggleSkip: doc.getElementById('wiggleSkip'),
      wiggleInvite: doc.getElementById('wiggleInvite'),
      wiggleInviteStart: doc.getElementById('wiggleInviteStart'),
      wiggleInviteSkip: doc.getElementById('wiggleInviteSkip'),
      chunkItem: doc.getElementById('chunkItem'),
      chunkProgress: doc.getElementById('chunkProgress'),
      chunkDots: doc.getElementById('chunkDots'),
    };
  }

  /** @returns {string} settings panel markup */
  templateSettingsPanel() {
    return `
      <div class="sensory-panel" id="sensoryPanel" role="dialog" aria-modal="false"
           aria-labelledby="sensoryPanelTitle" hidden>
        <div class="sensory-panel-header">
          <h2 class="sensory-panel-title" id="sensoryPanelTitle">🐾 How do you like it?</h2>
          <button type="button" class="sensory-close" data-sensory-close aria-label="Close sensory settings">✕</button>
        </div>
        <label class="sensory-row">
          <span class="sensory-row-label">🔊 Sounds and voice</span>
          <input class="sensory-switch" type="checkbox" role="switch" data-pref="sound">
        </label>
        <label class="sensory-row">
          <span class="sensory-row-label">🌀 Gentle motion</span>
          <input class="sensory-switch" type="checkbox" role="switch" data-pref="gentleMotion">
        </label>
        <label class="sensory-row">
          <span class="sensory-row-label">🐾 Gentle buzz</span>
          <input class="sensory-switch" type="checkbox" role="switch" data-pref="haptics">
        </label>
        <label class="sensory-row">
          <span class="sensory-row-label">🌗 High contrast</span>
          <input class="sensory-switch" type="checkbox" role="switch" data-pref="highContrast">
        </label>
        <p class="sensory-note">Grown-ups can change this any time. It is remembered on this device.</p>
      </div>
    `;
  }

  /** @returns {string} attention cue markup */
  templateAttentionOverlay() {
    return `
      <div class="attention-overlay" id="attentionOverlay" role="dialog" aria-modal="true"
           aria-labelledby="attentionTitle" hidden>
        <div class="attention-card">
          <div class="attention-orbit" aria-hidden="true">
            <span class="attention-face">👀</span>
          </div>
          <h2 class="attention-title" id="attentionTitle">Eyes on me!</h2>
          <p class="attention-call" id="attentionCall">You say: <strong>“Eyes on you!”</strong></p>
          <p class="attention-breath" id="attentionBreath">Breathe in… 🐾</p>
          <button type="button" class="attention-ready" id="attentionReady">I’m ready 🐾</button>
          <p class="attention-hint">Tap when your eyes and ears are here.</p>
        </div>
      </div>
    `;
  }

  /** @returns {string} wiggle break markup */
  templateWiggleOverlay() {
    return `
      <div class="wiggle-overlay" id="wiggleOverlay" role="dialog" aria-modal="true"
           aria-labelledby="wiggleTitle" hidden>
        <div class="wiggle-card">
          <p class="wiggle-kicker">🐾 Wiggle break</p>
          <div class="wiggle-emoji" id="wiggleEmoji" aria-hidden="true">🐘</div>
          <h2 class="wiggle-title" id="wiggleTitle">Stomp like an elephant</h2>
          <p class="wiggle-cue" id="wiggleCue">Stomp, stomp, stomp!</p>
          <div class="wiggle-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100"
               aria-valuenow="0" aria-label="Break time remaining">
            <div class="wiggle-progress-fill" id="wiggleProgressFill"></div>
          </div>
          <p class="wiggle-count" id="wiggleCount">${BREAK_MOVE_SECONDS}</p>
          <button type="button" class="wiggle-skip" id="wiggleSkip">Skip break</button>
        </div>
      </div>
    `;
  }

  /** @returns {string} non-blocking break invitation markup */
  templateWiggleInvite() {
    return `
      <div class="wiggle-invite" id="wiggleInvite" role="status" aria-live="polite" hidden>
        <span class="wiggle-invite-text">🐾 Halfway there! Wiggle break?</span>
        <button type="button" class="wiggle-invite-start" id="wiggleInviteStart">Let’s wiggle</button>
        <button type="button" class="wiggle-invite-later" id="wiggleInviteSkip" aria-label="Dismiss break invitation">Later</button>
      </div>
    `;
  }

  /**
   * Bind every control with JS listeners (no new inline handlers).
   * @returns {void}
   */
  bindControls() {
    const elements = this.elements;
    const doc = this.doc;

    if (elements.attentionButton) {
      elements.attentionButton.addEventListener('click', () => this.startAttentionCue());
    }
    if (elements.wiggleButton) {
      elements.wiggleButton.addEventListener('click', () => this.startWiggleBreak({ auto: false }));
    }
    if (elements.panelButton) {
      elements.panelButton.addEventListener('click', () => this.toggleSettingsPanel());
    }
    if (elements.attentionReady) {
      elements.attentionReady.addEventListener('click', () => this.finishAttentionCue());
    }
    if (elements.wiggleSkip) {
      elements.wiggleSkip.addEventListener('click', () => this.finishWiggleBreak('skipped'));
    }
    if (elements.wiggleInviteStart) {
      elements.wiggleInviteStart.addEventListener('click', () => {
        this.hideBreakInvite();
        this.startWiggleBreak({ auto: true });
      });
    }
    if (elements.wiggleInviteSkip) {
      elements.wiggleInviteSkip.addEventListener('click', () => this.hideBreakInvite());
    }

    if (elements.panel) {
      elements.panel.querySelectorAll('[data-sensory-close]').forEach((closeButton) => {
        closeButton.addEventListener('click', () => this.closeSettingsPanel());
      });
      elements.panel.querySelectorAll('[data-pref]').forEach((switchElement) => {
        switchElement.addEventListener('change', () => {
          this.setPreference(switchElement.dataset.pref, switchElement.checked);
        });
      });
    }

    doc.addEventListener('keydown', this.boundKeydown = (event) => this.handleKeydown(event));
  }

  /**
   * Make everything outside the modal layer inert so focus and screen readers
   * cannot reach controls hidden behind the cue. `aria-modal` alone is only a
   * promise; this is the enforcement.
   *
   * @param {boolean} shouldBeInert
   * @returns {void}
   */
  setBackgroundInert(shouldBeInert) {
    if (!this.doc || !this.doc.body) return;

    if (shouldBeInert) {
      this.inertedElements = [];

      Array.from(this.doc.body.children).forEach((childElement) => {
        if (childElement === this.elements.layer) return;
        if (childElement.hasAttribute('inert')) return;

        childElement.setAttribute('inert', '');
        this.inertedElements.push(childElement);
      });

      return;
    }

    this.inertedElements.forEach((element) => element.removeAttribute('inert'));
    this.inertedElements = [];
  }

  /**
   * Escape closes whichever surface is open; the attention cue also releases
   * on Enter so a keyboard user is never trapped.
   * @param {KeyboardEvent} event
   * @returns {void}
   */
  handleKeydown(event) {
    if (event.key === 'Tab' && (this.attentionOpen || this.breakOpen)) {
      const overlay = this.attentionOpen ? this.elements.attentionOverlay : this.elements.wiggleOverlay;
      const focusableElements = overlay
        ? Array.from(overlay.querySelectorAll('button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])'))
        : [];

      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const focusIsInside = overlay.contains(this.doc.activeElement);

      if (event.shiftKey && (!focusIsInside || this.doc.activeElement === firstElement)) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && (!focusIsInside || this.doc.activeElement === lastElement)) {
        event.preventDefault();
        firstElement.focus();
      }
      return;
    }

    if (event.key === 'Escape') {
      if (this.breakOpen) this.finishWiggleBreak('escape');
      else if (this.attentionOpen) this.finishAttentionCue();
      else if (this.elements.panel && !this.elements.panel.hidden) this.closeSettingsPanel();
      return;
    }

    if (event.key === 'Enter' && this.attentionOpen) {
      this.finishAttentionCue();
    }
  }

  /**
   * Push preferences into the document and the audio module.
   * @returns {void}
   */
  applyPreferences() {
    if (!this.doc || !this.doc.documentElement) return;

    const root = this.doc.documentElement;
    root.dataset.motion = this.preferences.gentleMotion ? 'gentle' : 'full';
    root.dataset.contrast = this.preferences.highContrast ? 'high' : 'normal';

    this.syncAudioPreference();
    this.syncSwitches();

    if (this.win && typeof CustomEvent === 'function') {
      this.doc.dispatchEvent(new CustomEvent('wildanimals:sensorychange', {
        detail: { ...this.preferences },
      }));
    }
  }

  /**
   * Mirror the sound preference onto the existing audio module and its button.
   * Direct assignment (not toggleSound) avoids feedback loops with the
   * legacy speaker button, which calls back into setPreference.
   * @returns {void}
   */
  syncAudioPreference() {
    if (!this.doc) return;

    const sounds = this.win ? this.win.realAnimalSounds : null;
    if (sounds && typeof sounds === 'object') {
      sounds.isEnabled = this.preferences.sound;
      if (!this.preferences.sound && typeof sounds.stopCurrentSound === 'function') {
        sounds.stopCurrentSound();
      }
    }

    const soundButton = this.doc.getElementById('soundBtn');
    if (soundButton) {
      soundButton.textContent = this.preferences.sound ? '🔊' : '🔇';
      soundButton.setAttribute('aria-pressed', String(this.preferences.sound));
    }
  }

  /**
   * Check the panel switches without firing change handlers.
   * @returns {void}
   */
  syncSwitches() {
    if (!this.elements.panel) return;

    this.elements.panel.querySelectorAll('[data-pref]').forEach((switchElement) => {
      const preferenceKey = switchElement.dataset.pref;
      if (PREFERENCE_KEYS.includes(preferenceKey)) {
        switchElement.checked = this.preferences[preferenceKey] === true;
      }
    });
  }

  /**
   * Change one preference, persist it, and apply it immediately.
   *
   * @param {'sound'|'gentleMotion'|'haptics'|'highContrast'} key
   * @param {boolean} value
   * @returns {boolean} whether the change was accepted
   */
  setPreference(key, value) {
    if (!PREFERENCE_KEYS.includes(key)) return false;

    this.preferences = normaliseSensoryPreferences({
      ...this.preferences,
      [key]: value === true,
    });

    saveSensoryPreferences(this.preferences, this.storage);
    this.applyPreferences();

    return true;
  }

  /** @returns {Object} a copy of the current preferences */
  getPreferences() {
    return { ...this.preferences };
  }

  /**
   * Short tactile pattern, gated by the haptics preference.
   * @param {number|number[]} pattern - vibration duration(s) in ms
   * @returns {void}
   */
  haptic(pattern) {
    if (!this.preferences.haptics) return;
    if (!this.win || !this.win.navigator || typeof this.win.navigator.vibrate !== 'function') return;

    try {
      this.win.navigator.vibrate(pattern);
    } catch {
      // Vibration is a bonus, never a failure path.
    }
  }

  /**
   * Spoken cue, gated by the sound preference and routed through the same
   * speech channel the app already uses for animal names.
   * @param {string} text
   * @returns {void}
   */
  speak(text) {
    if (!this.preferences.sound || !text || !this.speech) return;
    if (typeof this.speech.speak !== 'function') return;

    // Resolve from the injected window first: tests and embedded contexts may
    // not expose the constructor as a page global.
    const UtteranceConstructor = (this.win && this.win.SpeechSynthesisUtterance)
      || (typeof SpeechSynthesisUtterance !== 'undefined' ? SpeechSynthesisUtterance : null);
    if (!UtteranceConstructor) return;

    try {
      this.speech.cancel();
      const utterance = new UtteranceConstructor(text);
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      utterance.volume = 0.9;
      this.speech.speak(utterance);
    } catch {
      // A blocked utterance must never block the visual cue.
    }
  }

  // --------------------------------------------------------------------------
  // Attention cue ("Eyes on me")
  // --------------------------------------------------------------------------

  /**
   * Open the call-and-response attention cue.
   * @returns {boolean} true when the cue opened
   */
  startAttentionCue() {
    if (!this.mounted || this.attentionOpen || this.breakOpen) return false;
    if (!this.elements.attentionOverlay) return false;

    this.attentionOpen = true;
    this.lastFocusedElement = this.doc.activeElement;
    this.closeSettingsPanel({ restoreFocus: false });
    this.doc.body.classList.add('attention-paused');
    this.setBackgroundInert(true);
    this.elements.attentionOverlay.hidden = false;

    this.speak('Eyes on me. You say, eyes on you.');
    this.haptic([40, 60, 40]);
    this.startBreathCycle();

    if (this.elements.attentionReady) {
      this.elements.attentionReady.focus();
    }

    this.attentionTimer = this.win.setTimeout(() => this.finishAttentionCue(), ATTENTION_CUE_DURATION);
    this.emit('wildanimals:attentionstart');

    return true;
  }

  /**
   * Cycle "in / out" breath copy for the duration of the cue.
   * @returns {void}
   */
  startBreathCycle() {
    let breathIn = true;

    if (this.elements.attentionBreath) {
      this.elements.attentionBreath.textContent = 'Breathe in… 🌬️';
    }

    this.attentionBreathTimer = this.win.setInterval(() => {
      breathIn = !breathIn;
      if (this.elements.attentionBreath) {
        this.elements.attentionBreath.textContent = breathIn ? 'Breathe in… 🌬️' : 'Breathe out… 🐺';
      }
    }, 3000);
  }

  /**
   * Close the attention cue and restore the pre-cue focus.
   * @returns {void}
   */
  finishAttentionCue() {
    if (!this.attentionOpen) return;

    this.attentionOpen = false;
    this.doc.body.classList.remove('attention-paused');
    this.setBackgroundInert(false);

    if (this.elements.attentionOverlay) this.elements.attentionOverlay.hidden = true;
    if (this.attentionTimer) {
      this.win.clearTimeout(this.attentionTimer);
      this.attentionTimer = null;
    }
    if (this.attentionBreathTimer) {
      this.win.clearInterval(this.attentionBreathTimer);
      this.attentionBreathTimer = null;
    }

    this.haptic(30);
    this.restoreFocus();
    this.emit('wildanimals:attentionend');
  }

  // --------------------------------------------------------------------------
  // Wiggle break
  // --------------------------------------------------------------------------

  /**
   * @param {Object} [options]
   * @param {boolean} [options.auto] - true when started from the halfway invite
   * @returns {boolean} true when the break opened
   */
  startWiggleBreak(options = {}) {
    if (!this.mounted || this.breakOpen || this.attentionOpen) return false;
    if (!this.elements.wiggleOverlay) return false;

    this.breakOpen = true;
    this.breakAutoStarted = options.auto === true;
    this.breakStepIndex = 0;
    this.lastFocusedElement = this.doc.activeElement;

    this.closeSettingsPanel({ restoreFocus: false });
    this.doc.body.classList.add('break-active');
    this.setBackgroundInert(true);
    this.elements.wiggleOverlay.hidden = false;
    this.renderWiggleStep();
    this.startBreakTicker();

    if (this.elements.wiggleSkip) this.elements.wiggleSkip.focus();
    this.emit('wildanimals:breakstart');

    return true;
  }

  /**
   * Paint the current movement and its countdown.
   * @returns {void}
   */
  renderWiggleStep() {
    const move = WIGGLE_MOVES[this.breakStepIndex];
    if (!move) return;

    this.breakSecondsLeft = BREAK_MOVE_SECONDS;

    if (this.elements.wiggleEmoji) this.elements.wiggleEmoji.textContent = move.emoji;
    if (this.elements.wiggleTitle) this.elements.wiggleTitle.textContent = move.title;
    if (this.elements.wiggleCue) this.elements.wiggleCue.textContent = move.cue;
    if (this.elements.wiggleCount) this.elements.wiggleCount.textContent = String(this.breakSecondsLeft);
    this.updateBreakProgress();

    this.speak(move.spoken);
    this.haptic(move.emoji === '🐺' ? 20 : [25, 40, 25]);
  }

  /**
   * One-second countdown that advances through the movement list.
   * @returns {void}
   */
  startBreakTicker() {
    if (this.breakTicker) this.win.clearInterval(this.breakTicker);

    this.breakTicker = this.win.setInterval(() => {
      this.breakSecondsLeft -= 1;

      if (this.breakSecondsLeft <= 0) {
        this.advanceWiggleStep();
        return;
      }

      if (this.elements.wiggleCount) this.elements.wiggleCount.textContent = String(this.breakSecondsLeft);
      this.updateBreakProgress();
    }, 1000);
  }

  /**
   * Progress bar across the whole break, not just the current move.
   * @returns {void}
   */
  updateBreakProgress() {
    const totalSeconds = WIGGLE_MOVES.length * BREAK_MOVE_SECONDS;
    const elapsedBeforeMove = this.breakStepIndex * BREAK_MOVE_SECONDS;
    const elapsed = elapsedBeforeMove + (BREAK_MOVE_SECONDS - this.breakSecondsLeft);
    const percentage = Math.min(100, Math.round((elapsed / totalSeconds) * 100));

    if (this.elements.wiggleProgressFill) {
      this.elements.wiggleProgressFill.style.width = `${percentage}%`;
    }

    const progressBar = this.elements.wiggleProgressFill
      ? this.elements.wiggleProgressFill.parentElement
      : null;
    if (progressBar) progressBar.setAttribute('aria-valuenow', String(percentage));
  }

  /**
   * Move to the next movement, or finish after the last one.
   * @returns {void}
   */
  advanceWiggleStep() {
    if (!this.breakOpen) return;

    if (this.breakStepIndex >= WIGGLE_MOVES.length - 1) {
      this.finishWiggleBreak('complete');
      return;
    }

    this.breakStepIndex += 1;
    this.renderWiggleStep();
  }

  /**
   * @param {'complete'|'skipped'|'escape'} reason
   * @returns {void}
   */
  finishWiggleBreak(reason = 'complete') {
    if (!this.breakOpen) return;

    this.breakOpen = false;
    this.doc.body.classList.remove('break-active');
    this.setBackgroundInert(false);

    if (this.elements.wiggleOverlay) this.elements.wiggleOverlay.hidden = true;
    if (this.breakTicker) {
      this.win.clearInterval(this.breakTicker);
      this.breakTicker = null;
    }

    this.haptic(30);
    this.restoreFocus();
    this.emit('wildanimals:breakend', { reason });
  }

  /**
   * Offer (do not force) a break at a chunk boundary. The invitation fades
   * after 9 seconds so play is never blocked by an ignored prompt.
   *
   * @param {number} completedQuestions - Questions answered so far
   * @param {string} mode - Current game mode
   * @returns {boolean} true when the invitation was shown
   */
  maybeOfferWiggleBreak(completedQuestions, mode, chunkSize = DEFAULT_CHUNK_SIZE) {
    if (!this.mounted || !this.elements.wiggleInvite) return false;
    if (!shouldOfferWiggleBreak(completedQuestions, mode, chunkSize)) return false;

    this.hideBreakInvite();
    this.elements.wiggleInvite.hidden = false;
    this.breakInviteTimer = this.win.setTimeout(() => this.hideBreakInvite(), 9000);

    return true;
  }

  /** @returns {void} */
  hideBreakInvite() {
    if (this.breakInviteTimer) {
      this.win.clearTimeout(this.breakInviteTimer);
      this.breakInviteTimer = null;
    }
    if (this.elements.wiggleInvite) this.elements.wiggleInvite.hidden = true;
  }

  // --------------------------------------------------------------------------
  // Chunk / visual schedule
  // --------------------------------------------------------------------------

  /**
   * Update the "Set 1 of 2" label and the ten-dot visual schedule.
   * Hidden for modes where a run length is not meaningful.
   *
   * @param {number} questionNumber - 1-based current question
   * @param {number} totalQuestions - Total questions in the run
   * @param {string} mode - Current game mode
   * @returns {void}
   */
  updateChunk(questionNumber, totalQuestions, mode, chunkSize = DEFAULT_CHUNK_SIZE) {
    if (!this.mounted) return;

    const structuredModes = ['classic', 'speed', 'quiz'];
    const showChunk = structuredModes.includes(mode) && Number.isFinite(totalQuestions);

    if (this.elements.chunkItem) {
      this.elements.chunkItem.hidden = !showChunk;
    }

    if (!showChunk) return;

    if (this.elements.chunkProgress) {
      this.elements.chunkProgress.textContent = buildChunkLabel(questionNumber, totalQuestions, chunkSize);
    }

    if (this.elements.chunkDots) {
      const dots = getChunkDots(questionNumber, totalQuestions);
      this.elements.chunkDots.innerHTML = '';

      dots.forEach((state, dotIndex) => {
        const dot = this.doc.createElement('span');
        dot.className = `chunk-dot chunk-dot-${state}`;
        dot.dataset.state = state;
        dot.setAttribute('aria-hidden', 'true');
        if ((dotIndex + 1) % chunkSize === 0) {
          dot.classList.add('chunk-dot-set-end');
        }
        this.elements.chunkDots.appendChild(dot);
      });
    }
  }

  // --------------------------------------------------------------------------
  // Settings panel
  // --------------------------------------------------------------------------

  /** @returns {boolean} whether the panel is now open */
  toggleSettingsPanel() {
    if (this.elements.panel && !this.elements.panel.hidden) {
      this.closeSettingsPanel();
      return false;
    }
    return this.openSettingsPanel();
  }

  /** @returns {boolean} */
  openSettingsPanel() {
    if (!this.elements.panel) return false;

    this.elements.panel.hidden = false;
    if (this.elements.panelButton) this.elements.panelButton.setAttribute('aria-expanded', 'true');
    this.syncSwitches();

    const firstSwitch = this.elements.panel.querySelector('[data-pref]');
    if (firstSwitch) firstSwitch.focus();

    return true;
  }

  /**
   * @param {Object} [options]
   * @param {boolean} [options.restoreFocus] - return focus to the gear button
   * @returns {void}
   */
  closeSettingsPanel({ restoreFocus = true } = {}) {
    if (!this.elements.panel) return;

    const wasOpen = this.elements.panel.hidden === false;
    this.elements.panel.hidden = true;
    if (this.elements.panelButton) {
      this.elements.panelButton.setAttribute('aria-expanded', 'false');
      if (wasOpen && restoreFocus) this.elements.panelButton.focus();
    }
  }

  // --------------------------------------------------------------------------
  // Utilities
  // --------------------------------------------------------------------------

  /**
   * @param {string} eventName
   * @param {Object} [detail]
   * @returns {void}
   */
  emit(eventName, detail = {}) {
    if (!this.doc) return;
    this.doc.dispatchEvent(new CustomEvent(eventName, { detail }));
  }

  /** @returns {void} */
  restoreFocus() {
    if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function') {
      try {
        this.lastFocusedElement.focus();
      } catch {
        // Element may have left the DOM; focus is best-effort.
      }
    }
    this.lastFocusedElement = null;
  }

  /** Tear down timers, listeners and modal state (used by tests). @returns {void} */
  destroy() {
    if (this.attentionTimer) this.win.clearTimeout(this.attentionTimer);
    if (this.attentionBreathTimer) this.win.clearInterval(this.attentionBreathTimer);
    if (this.breakTicker) this.win.clearInterval(this.breakTicker);
    if (this.breakInviteTimer) this.win.clearTimeout(this.breakInviteTimer);

    if (this.doc && this.boundKeydown) {
      this.doc.removeEventListener('keydown', this.boundKeydown);
    }
    this.boundKeydown = null;

    if (this.doc && this.doc.body) {
      this.doc.body.classList.remove('attention-paused', 'break-active');
    }

    this.setBackgroundInert(false);

    this.attentionTimer = null;
    this.attentionBreathTimer = null;
    this.breakTicker = null;
    this.breakInviteTimer = null;
    this.attentionOpen = false;
    this.breakOpen = false;
    this.mounted = false;
  }
}

/**
 * Factory used by the browser bootstrap and by tests.
 * @param {Object} [options]
 * @returns {AttentionCoach}
 */
export function createAttentionCoach(options = {}) {
  return new AttentionCoach(options);
}

// Browser bootstrap: only when the page actually ships the controls. Tests that
// import this module against an empty jsdom body never auto-mount.
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const mountWhenReady = () => {
    if (document.getElementById('attentionBtn') || document.getElementById('sensoryLayer')) {
      window.attentionCoach = createAttentionCoach();
      window.attentionCoach.mount();
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountWhenReady, { once: true });
  } else {
    mountWhenReady();
  }
}
