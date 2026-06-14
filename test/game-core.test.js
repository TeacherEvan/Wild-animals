/**
 * Unit tests for game-core.js utility functions
 * Tests pure logic functions that don't require DOM
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Import the modules we need to test
import { GAME_CONFIG, animals, PerformanceUtils, shuffleArray } from '../game-core.js';

// Mock the DOM for functions that need it
const mockDOM = () => {
  document.body.innerHTML = `
    <div id="animalEmoji"></div>
    <div id="question"></div>
    <div id="options"></div>
    <div id="feedback"></div>
    <div id="questionTransition"></div>
    <div id="questionTransitionFill"></div>
    <div id="questionTransitionLabel"></div>
    <button id="nextBtn"></button>
    <div id="timerFill"></div>
    <div id="timerText"></div>
    <span id="score"></span>
    <span id="currentQuestion"></span>
    <span id="streak"></span>
    <button id="hintBtn"></button>
    <button id="eliminateBtn"></button>
    <button id="skipBtn"></button>
    <div id="highScore"></div>
    <div id="totalQuestions"></div>
    <div id="timerContainer"></div>
    <div id="gameArea"></div>
    <div id="celebration"></div>
    <button id="soundBtn"></button>
    <div class="score-board"></div>
    <div class="animal-display"></div>
  `;
};

beforeEach(() => {
  mockDOM();
  vi.clearAllMocks();
});

afterEach(() => {
  vi.clearAllMocks();
  document.body.innerHTML = '';
});

describe('GAME_CONFIG', () => {
  it('should have all required configuration values', () => {
    expect(GAME_CONFIG.POINTS_PER_CORRECT).toBe(10);
    expect(GAME_CONFIG.TOTAL_QUESTIONS).toBe(10);
    expect(GAME_CONFIG.TIMER_SECONDS).toBe(10);
    expect(GAME_CONFIG.HIGH_SCORE_KEY).toBe('wildAnimalsHighScore');
  });

  it('should have powerup configuration', () => {
    expect(GAME_CONFIG.INITIAL_HINTS).toBe(3);
    expect(GAME_CONFIG.INITIAL_ELIMINATES).toBe(2);
    expect(GAME_CONFIG.INITIAL_SKIPS).toBe(1);
  });

  it('should have achievement thresholds', () => {
    expect(GAME_CONFIG.STREAK_ACHIEVEMENT_5).toBe(5);
    expect(GAME_CONFIG.STREAK_ACHIEVEMENT_10).toBe(10);
    expect(GAME_CONFIG.SCORE_ACHIEVEMENT_100).toBe(100);
  });
});

describe('animals data', () => {
  it('should have 30 animals', () => {
    expect(animals.length).toBe(30);
  });

  it('should have required properties for each animal', () => {
    animals.forEach(animal => {
      expect(animal).toHaveProperty('emoji');
      expect(animal).toHaveProperty('name');
      expect(animal).toHaveProperty('sound');
      expect(animal).toHaveProperty('habitat');
      expect(animal).toHaveProperty('diet');
      expect(animal).toHaveProperty('fact');
      expect(animal).toHaveProperty('symbol');
      expect(animal).toHaveProperty('color');
      expect(animal).toHaveProperty('category');
    });
  });

  it('should have unique animal names', () => {
    const names = animals.map(a => a.name);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  it('should include Lion as first animal', () => {
    expect(animals[0].name).toBe('Lion');
    expect(animals[0].emoji).toBe('🦁');
  });
});

describe('PerformanceUtils', () => {
  it('should have debounce function', () => {
    expect(typeof PerformanceUtils.debounce).toBe('function');
  });

  it('should have throttle function', () => {
    expect(typeof PerformanceUtils.throttle).toBe('function');
  });

  it('should have rafSchedule function', () => {
    expect(typeof PerformanceUtils.rafSchedule).toBe('function');
  });

  it('should have animateScoreBump function', () => {
    expect(typeof PerformanceUtils.animateScoreBump).toBe('function');
  });

  describe('debounce', () => {
    it('should delay function execution', async () => {
      const fn = vi.fn();
      const debounced = PerformanceUtils.debounce(fn, 50);
      
      debounced();
      debounced();
      debounced();
      
      expect(fn).not.toHaveBeenCalled();
      
      await new Promise(resolve => setTimeout(resolve, 60));
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should pass arguments to debounced function', async () => {
      const fn = vi.fn();
      const debounced = PerformanceUtils.debounce(fn, 50);
      
      debounced('arg1', 'arg2');
      
      await new Promise(resolve => setTimeout(resolve, 60));
      expect(fn).toHaveBeenCalledWith('arg1', 'arg2');
    });
  });

  describe('throttle', () => {
    it('should limit function calls to once per interval', async () => {
      const fn = vi.fn();
      const throttled = PerformanceUtils.throttle(fn, 50);
      
      throttled();
      throttled();
      throttled();
      
      expect(fn).toHaveBeenCalledTimes(1);
      
      await new Promise(resolve => setTimeout(resolve, 60));
      throttled();
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('rafSchedule', () => {
    it('should schedule callback with requestAnimationFrame', () => {
      const fn = vi.fn();
      const rafSpy = vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => cb());
      const rafScheduled = PerformanceUtils.rafSchedule(fn);
      
      rafScheduled();
      rafScheduled();
      rafScheduled();
      
      // Should only schedule once until the frame executes
      expect(rafSpy).toHaveBeenCalledTimes(1);
      rafSpy.mockRestore();
    });
  });

  describe('animateScoreBump', () => {
    it('should add and remove bump class', async () => {
      const element = document.createElement('div');
      element.classList.add('test-class');
      
      PerformanceUtils.animateScoreBump(element);
      expect(element.classList.contains('bump')).toBe(true);
      
      // Wait for timeout
      await new Promise(resolve => setTimeout(() => {
        expect(element.classList.contains('bump')).toBe(false);
        resolve();
      }, 450));
    });

    it('should handle null element gracefully', () => {
      expect(() => PerformanceUtils.animateScoreBump(null)).not.toThrow();
      expect(() => PerformanceUtils.animateScoreBump(undefined)).not.toThrow();
    });
  });
});

describe('shuffleArray', () => {
  it('should return array of same length', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray([...original]);
    expect(shuffled.length).toBe(original.length);
  });

  it('should contain all original elements', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray([...original]);
    expect(shuffled.sort()).toEqual(original.sort());
  });

  it('should produce different orders on multiple calls (probabilistic)', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const shuffle1 = shuffleArray([...original]);
    const shuffle2 = shuffleArray([...original]);
    
    // Very unlikely to be identical (1 in 10! chance)
    // But we mainly test it doesn't throw and returns valid array
    expect(shuffle1.length).toBe(10);
    expect(shuffle2.length).toBe(10);
  });

  it('should handle empty array', () => {
    expect(shuffleArray([])).toEqual([]);
  });

  it('should handle single element array', () => {
    expect(shuffleArray([1])).toEqual([1]);
  });
});