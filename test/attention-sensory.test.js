/**
 * Unit tests for the attention & sensory layer.
 *
 * The pure helpers are the contract that the game loop and the classroom
 * research both depend on; the class tests cover the DOM surfaces a child
 * actually touches.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
  AttentionCoach,
  DEFAULT_SENSORY_PREFERENCES,
  SENSORY_PREFERENCES_KEY,
  WIGGLE_MOVES,
  buildChunkLabel,
  createAttentionCoach,
  getChunkCount,
  getChunkDots,
  getChunkIndex,
  getDefaultSensoryPreferences,
  isChunkBoundary,
  normaliseSensoryPreferences,
  readSensoryPreferences,
  saveSensoryPreferences,
  shouldOfferWiggleBreak,
} from '../attention-sensory.js';

const mountTestDOM = () => {
  document.body.innerHTML = `
    <button id="soundBtn" aria-pressed="true">🔊</button>
    <button id="attentionBtn"></button>
    <button id="wiggleBtn"></button>
    <button id="sensoryBtn" aria-expanded="false"></button>
    <div class="score-board">
      <div class="chunk-item" id="chunkItem">
        <span id="chunkProgress"></span>
        <span id="chunkDots"></span>
      </div>
    </div>
    <div class="game-container">
      <div class="game-area" id="gameArea"></div>
    </div>
    <div id="celebration"></div>
    <div id="sensoryLayer"></div>
  `;
};

const createSpeechMock = () => ({
  speak: vi.fn(),
  cancel: vi.fn(),
});

beforeEach(() => {
  mountTestDOM();
  localStorage.clear();
  window.realAnimalSounds = { isEnabled: true, stopCurrentSound: vi.fn() };
  Object.defineProperty(window.navigator, 'vibrate', {
    value: vi.fn(),
    configurable: true,
  });
  // jsdom ships no Web Speech API; provide the minimal constructor the coach
  // checks for so the spoken channel is exercised rather than skipped.
  globalThis.SpeechSynthesisUtterance = class SpeechSynthesisUtteranceMock {
    constructor(text) {
      this.text = text;
      this.rate = 1;
      this.pitch = 1;
      this.volume = 1;
    }
  };
});

afterEach(() => {
  document.body.innerHTML = '';
  delete window.realAnimalSounds;
  delete globalThis.SpeechSynthesisUtterance;
});

describe('sensory preference normalisation', () => {
  it('defaults sound and haptics on, motion and contrast off', () => {
    expect(normaliseSensoryPreferences()).toEqual({
      sound: true,
      gentleMotion: false,
      haptics: true,
      highContrast: false,
    });
  });

  it('keeps explicit false values', () => {
    expect(normaliseSensoryPreferences({ sound: false, haptics: false })).toMatchObject({
      sound: false,
      haptics: false,
    });
  });

  it('drops unknown keys so storage cannot leak state into the UI', () => {
    const result = normaliseSensoryPreferences({ sound: true, evil: 'payload' });
    expect(result).not.toHaveProperty('evil');
    expect(Object.keys(result).sort()).toEqual(['gentleMotion', 'haptics', 'highContrast', 'sound']);
  });

  it('turns on gentle motion when the OS asks for reduced motion', () => {
    expect(getDefaultSensoryPreferences(true).gentleMotion).toBe(true);
    expect(getDefaultSensoryPreferences(false).gentleMotion).toBe(false);
  });
});

describe('sensory preference persistence', () => {
  it('falls back to defaults when storage is unavailable', () => {
    expect(readSensoryPreferences(null)).toEqual(DEFAULT_SENSORY_PREFERENCES);
  });

  it('round-trips a saved preference object', () => {
    saveSensoryPreferences({ sound: false, gentleMotion: true, haptics: false, highContrast: true }, localStorage);

    expect(readSensoryPreferences(localStorage)).toEqual({
      sound: false,
      gentleMotion: true,
      haptics: false,
      highContrast: true,
    });
  });

  it('falls back to defaults when stored JSON is corrupt', () => {
    localStorage.setItem(SENSORY_PREFERENCES_KEY, '{not-json');
    expect(readSensoryPreferences(localStorage)).toEqual(DEFAULT_SENSORY_PREFERENCES);
  });

  it('returns false instead of throwing when storage rejects a write', () => {
    const hostileStorage = {
      getItem: () => null,
      setItem: () => { throw new Error('quota'); },
    };

    expect(saveSensoryPreferences({ sound: true }, hostileStorage)).toBe(false);
  });
});

describe('chunking helpers', () => {
  it('detects chunk boundaries and rejects zero or negative sizes', () => {
    expect(isChunkBoundary(5)).toBe(true);
    expect(isChunkBoundary(10)).toBe(true);
    expect(isChunkBoundary(6)).toBe(false);
    expect(isChunkBoundary(0)).toBe(false);
    expect(isChunkBoundary(5, 0)).toBe(false);
  });

  it('numbers sets from one', () => {
    expect(getChunkIndex(1)).toBe(1);
    expect(getChunkIndex(5)).toBe(1);
    expect(getChunkIndex(6)).toBe(2);
    expect(getChunkIndex(10)).toBe(2);
  });

  it('counts sets for finite and open-ended runs', () => {
    expect(getChunkCount(10)).toBe(2);
    expect(getChunkCount(11)).toBe(3);
    expect(getChunkCount(0)).toBe(1);
    expect(getChunkCount(Infinity)).toBe(1);
  });

  it('builds a child-readable set label', () => {
    expect(buildChunkLabel(1, 10)).toBe('Set 1 of 2');
    expect(buildChunkLabel(6, 10)).toBe('Set 2 of 2');
    expect(buildChunkLabel(1, Infinity)).toBe('Set 1');
  });

  it('marks done, current and upcoming questions', () => {
    expect(getChunkDots(3, 5)).toEqual(['done', 'done', 'current', 'todo', 'todo']);
  });

  it('offers breaks only in untimed, linear modes', () => {
    expect(shouldOfferWiggleBreak(5, 'classic')).toBe(true);
    expect(shouldOfferWiggleBreak(5, 'quiz')).toBe(true);
    expect(shouldOfferWiggleBreak(5, 'speed')).toBe(false);
    expect(shouldOfferWiggleBreak(5, 'survival')).toBe(false);
    expect(shouldOfferWiggleBreak(6, 'classic')).toBe(false);
  });
});

describe('AttentionCoach DOM behaviour', () => {
  let coach;

  beforeEach(() => {
    coach = createAttentionCoach({
      document,
      window,
      storage: localStorage,
      speechSynthesis: createSpeechMock(),
    });
    coach.mount();
  });

  afterEach(() => {
    coach.destroy();
  });

  it('mounts the overlays and panel once', () => {
    expect(coach.mounted).toBe(true);
    expect(document.getElementById('attentionOverlay')).not.toBeNull();
    expect(document.getElementById('wiggleOverlay')).not.toBeNull();
    expect(document.getElementById('sensoryPanel')).not.toBeNull();
    expect(document.getElementById('wiggleInvite')).not.toBeNull();
  });

  it('starts in full motion and normal contrast', () => {
    expect(document.documentElement.dataset.motion).toBe('full');
    expect(document.documentElement.dataset.contrast).toBe('normal');
  });

  it('applies and persists the gentle-motion preference', () => {
    expect(coach.setPreference('gentleMotion', true)).toBe(true);
    expect(document.documentElement.dataset.motion).toBe('gentle');

    const stored = JSON.parse(localStorage.getItem(SENSORY_PREFERENCES_KEY));
    expect(stored.gentleMotion).toBe(true);
  });

  it('mirrors the sound preference onto the audio module and speaker button', () => {
    coach.setPreference('sound', false);

    expect(window.realAnimalSounds.isEnabled).toBe(false);
    expect(window.realAnimalSounds.stopCurrentSound).toHaveBeenCalled();
    expect(document.getElementById('soundBtn').textContent).toBe('🔇');
  });

  it('ignores unknown preference keys', () => {
    expect(coach.setPreference('volume', 11)).toBe(false);
  });

  it('opens the attention cue, speaks the call, and releases on finish', () => {
    expect(coach.startAttentionCue()).toBe(true);

    const overlay = document.getElementById('attentionOverlay');
    expect(overlay.hidden).toBe(false);
    expect(document.body.classList.contains('attention-paused')).toBe(true);
    expect(coach.speech.speak).toHaveBeenCalled();
    expect(coach.speech.speak.mock.calls[0][0].text).toContain('Eyes on me');

    coach.finishAttentionCue();

    expect(overlay.hidden).toBe(true);
    expect(document.body.classList.contains('attention-paused')).toBe(false);
  });

  it('refuses a second cue while one is already open', () => {
    expect(coach.startAttentionCue()).toBe(true);
    expect(coach.startAttentionCue()).toBe(false);
    coach.finishAttentionCue();
  });

  it('runs a four-move wiggle break and closes it', () => {
    expect(coach.startWiggleBreak()).toBe(true);
    expect(document.getElementById('wiggleTitle').textContent).toBe(WIGGLE_MOVES[0].title);

    coach.advanceWiggleStep();
    expect(document.getElementById('wiggleTitle').textContent).toBe(WIGGLE_MOVES[1].title);

    coach.advanceWiggleStep();
    coach.advanceWiggleStep();
    coach.advanceWiggleStep();
    expect(coach.breakOpen).toBe(false);
    expect(document.getElementById('wiggleOverlay').hidden).toBe(true);
  });

  it('does not vibrate when haptics are switched off', () => {
    coach.setPreference('haptics', false);
    coach.haptic([30, 40]);

    expect(window.navigator.vibrate).not.toHaveBeenCalled();
  });

  it('vibrates when haptics are on', () => {
    coach.haptic([30, 40]);
    expect(window.navigator.vibrate).toHaveBeenCalledWith([30, 40]);
  });

  it('offers the halfway break only at a chunk boundary', () => {
    expect(coach.maybeOfferWiggleBreak(5, 'classic')).toBe(true);
    expect(document.getElementById('wiggleInvite').hidden).toBe(false);

    coach.hideBreakInvite();
    expect(document.getElementById('wiggleInvite').hidden).toBe(true);

    expect(coach.maybeOfferWiggleBreak(6, 'classic')).toBe(false);
  });

  it('paints the set label and ten-dot schedule', () => {
    coach.updateChunk(6, 10, 'classic');

    expect(document.getElementById('chunkItem').hidden).toBe(false);
    expect(document.getElementById('chunkProgress').textContent).toBe('Set 2 of 2');

    const dots = document.querySelectorAll('#chunkDots .chunk-dot');
    expect(dots).toHaveLength(10);
    expect(dots[4].dataset.state).toBe('done');
    expect(dots[5].dataset.state).toBe('current');
  });

  it('hides the chunk schedule in non-linear modes', () => {
    coach.updateChunk(1, 10, 'habitat');
    expect(document.getElementById('chunkItem').hidden).toBe(true);
  });

  it('toggles the settings panel and exposes its expanded state', () => {
    const button = document.getElementById('sensoryBtn');

    expect(coach.openSettingsPanel()).toBe(true);
    expect(button.getAttribute('aria-expanded')).toBe('true');

    coach.closeSettingsPanel();
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('does not steal focus on Escape when no surface is open', () => {
    const outsideInput = document.createElement('input');
    document.body.appendChild(outsideInput);
    outsideInput.focus();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(document.activeElement).toBe(outsideInput);
  });

  it('does not speak when sound is switched off', () => {
    coach.setPreference('sound', false);
    coach.speech.speak.mockClear();

    coach.startAttentionCue();

    expect(coach.speech.speak).not.toHaveBeenCalled();
    coach.finishAttentionCue();
  });

  it('is constructed through the factory', () => {
    expect(coach).toBeInstanceOf(AttentionCoach);
  });
});
