/**
 * Wild Animals Adventure - Core Game Module
 * Main game logic extracted from index.html for better maintainability
 * 
 * @module game-core
 * @version 2.0.0
 */

// ============================================================================
// Performance Utility Functions
// Implements debouncing, throttling, and requestAnimationFrame wrappers
// ============================================================================

/**
 * Performance utility functions for animation and event optimization
 * @namespace PerformanceUtils
 */
export const PerformanceUtils = {
  /**
   * Debounce function - delays execution until after wait time has elapsed
   * @param {Function} func - Function to debounce
   * @param {number} wait - Milliseconds to wait
   * @returns {Function} Debounced function
   */
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  /**
   * Throttle function - ensures function is called at most once per interval
   * @param {Function} func - Function to throttle
   * @param {number} limit - Milliseconds between calls
   * @returns {Function} Throttled function
   */
  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * RequestAnimationFrame wrapper for smooth animations
   * @param {Function} callback - Animation callback
   * @returns {Function} RAF-scheduled function
   */
  rafSchedule(callback) {
    let rafId = null;
    return function (...args) {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        callback(...args);
        rafId = null;
      });
    };
  },

  /**
   * Add bump animation to score display for visual feedback
   * @param {HTMLElement} element - Element to animate
   */
  animateScoreBump(element) {
    if (!element) return;
    element.classList.add('bump');
    setTimeout(() => element.classList.remove('bump'), 400);
  },
};

// ============================================================================
// Game Configuration Constants
// All magic numbers and configurable values centralized for easy maintenance
// ============================================================================

/**
 * Game configuration constants
 * @readonly
 * @enum {Object}
 */
export const GAME_CONFIG = {
  // Scoring configuration
  POINTS_PER_CORRECT: 10,
  POINTS_FOR_SKIP: 5,
  SPEED_BONUS_THRESHOLD: 5,   // Time left in seconds to get bonus
  SPEED_BONUS_MULTIPLIER: 2,  // Points per second over threshold

  // Timer configuration
  TIMER_SECONDS: 10,

  // Questions configuration
  TOTAL_QUESTIONS: 10,
  SURVIVAL_INITIAL_QUESTIONS: 20,
  SURVIVAL_BATCH_SIZE: 10,
  WRONG_OPTIONS_COUNT: 3,

  // Powerup configuration
  INITIAL_HINTS: 3,
  INITIAL_ELIMINATES: 2,
  INITIAL_SKIPS: 1,
  ELIMINATE_COUNT: 2,

  // Visual effects configuration
  PARTICLE_COUNT: 15,
  CONFETTI_COUNT: 50,

  // Timing delays (in milliseconds)
  AUTO_ADVANCE_DELAY: 2000,
  CLASSIC_NEXT_DELAY: 900,
  PARTICLE_LIFETIME: 2000,
  INDICATOR_LIFETIME: 2000,
  ACHIEVEMENT_LIFETIME: 3000,
  SKIP_DELAY: 1000,
  CONFETTI_LIFETIME: 3000,
  ANIMATION_DURATION: 1000,
  SCALE_RESET_DELAY: 200,

  // Achievement thresholds
  STREAK_ACHIEVEMENT_5: 5,
  STREAK_ACHIEVEMENT_10: 10,
  SCORE_ACHIEVEMENT_100: 100,
  COMBO_THRESHOLD: 3,

  // Percentage thresholds
  EXCELLENT_THRESHOLD: 90,
  GREAT_THRESHOLD: 70,
  GOOD_THRESHOLD: 50,

  // Storage keys
  HIGH_SCORE_KEY: 'wildAnimalsHighScore',
};

// ============================================================================
// Enhanced Game Data
// Visual symbols and categories for non-reading kids
// ============================================================================

/**
 * Animal database with metadata for the game
 * @type {Array<Object>}
 */
export const animals = [
  { emoji: '🦁', name: 'Lion', sound: 'roar', habitat: 'Savanna', diet: 'Carnivore', fact: 'A lion is the king of the jungle', symbol: '👑', color: '#FFD700', category: 'Big Cats' },
  { emoji: '🐯', name: 'Tiger', sound: 'roar', habitat: 'Jungle', diet: 'Carnivore', fact: 'A tiger has orange fur with black stripes', symbol: '🐅', color: '#FF6347', category: 'Big Cats' },
  { emoji: '🐘', name: 'Elephant', sound: 'trumpet', habitat: 'Savanna', diet: 'Herbivore', fact: 'An elephant is the biggest land animal', symbol: '🐽', color: '#808080', category: 'Giants' },
  { emoji: '🦒', name: 'Giraffe', sound: 'hum', habitat: 'Savanna', diet: 'Herbivore', fact: 'A giraffe has a very long neck', symbol: '📏', color: '#DEB887', category: 'Giants' },
  { emoji: '🐻', name: 'Bear', sound: 'growl', habitat: 'Forest', diet: 'Omnivore', fact: 'A bear sleeps all winter long', symbol: '🍯', color: '#8B4513', category: 'Forest Friends' },
  { emoji: '🦓', name: 'Zebra', sound: 'neigh', habitat: 'Savanna', diet: 'Herbivore', fact: 'A zebra has black and white stripes', symbol: '⚫⚪', color: '#000000', category: 'Striped' },
  { emoji: '🦏', name: 'Rhino', sound: 'snort', habitat: 'Savanna', diet: 'Herbivore', fact: 'A rhino has a big horn on its nose', symbol: '🔺', color: '#696969', category: 'Giants' },
  { emoji: '🐺', name: 'Wolf', sound: 'howl', habitat: 'Forest', diet: 'Carnivore', fact: 'A wolf howls at the moon', symbol: '🌙', color: '#708090', category: 'Wild Dogs' },
  { emoji: '🦊', name: 'Fox', sound: 'bark', habitat: 'Forest', diet: 'Omnivore', fact: 'A fox has a fluffy tail', symbol: '🧠', color: '#FF4500', category: 'Smart Animals' },
  { emoji: '🐆', name: 'Leopard', sound: 'roar', habitat: 'Forest', diet: 'Carnivore', fact: 'A leopard can climb trees very well', symbol: '🌳', color: '#DAA520', category: 'Big Cats' },
  { emoji: '🦘', name: 'Kangaroo', sound: 'grunt', habitat: 'Grassland', diet: 'Herbivore', fact: 'A kangaroo carries its baby in a pouch', symbol: '👶', color: '#CD853F', category: 'Hoppers' },
  { emoji: '🐨', name: 'Koala', sound: 'grunt', habitat: 'Forest', diet: 'Herbivore', fact: 'A koala sleeps most of the day', symbol: '😴', color: '#A9A9A9', category: 'Sleepy Animals' },
  { emoji: '🐵', name: 'Monkey', sound: 'chatter', habitat: 'Jungle', diet: 'Omnivore', fact: 'A monkey loves to eat bananas', symbol: '🍌', color: '#F4A460', category: 'Primates' },
  { emoji: '🦍', name: 'Gorilla', sound: 'grunt', habitat: 'Jungle', diet: 'Herbivore', fact: 'A gorilla is very strong', symbol: '💪', color: '#2F4F4F', category: 'Primates' },
  { emoji: '🐧', name: 'Penguin', sound: 'squawk', habitat: 'Antarctica', diet: 'Carnivore', fact: 'A penguin cannot fly but can swim', symbol: '🏊', color: '#000080', category: 'Ocean Birds' },
  { emoji: '🦅', name: 'Eagle', sound: 'screech', habitat: 'Mountains', diet: 'Carnivore', fact: 'An eagle can see very far away', symbol: '👁️', color: '#8B4513', category: 'Flying Hunters' },
  { emoji: '🐙', name: 'Octopus', sound: 'silent', habitat: 'Ocean', diet: 'Carnivore', fact: 'An octopus has eight legs', symbol: '8️⃣', color: '#800080', category: 'Ocean Creatures' },
  { emoji: '🐬', name: 'Dolphin', sound: 'click', habitat: 'Ocean', diet: 'Carnivore', fact: 'A dolphin is very smart and friendly', symbol: '🧠', color: '#4682B4', category: 'Smart Ocean' },
  { emoji: '🦈', name: 'Shark', sound: 'silent', habitat: 'Ocean', diet: 'Carnivore', fact: 'A shark has many sharp teeth', symbol: '⚡', color: '#708090', category: 'Ocean Hunters' },
  { emoji: '🐸', name: 'Frog', sound: 'croak', habitat: 'Pond', diet: 'Carnivore', fact: 'A frog can jump very high', symbol: '🌊', color: '#32CD32', category: 'Water Hoppers' },
  { emoji: '🐪', name: 'Camel', sound: 'grunt', habitat: 'Desert', diet: 'Herbivore', fact: 'A camel can go without water for days', symbol: '💧', color: '#C19A6B', category: 'Desert Animals' },
  { emoji: '🐊', name: 'Crocodile', sound: 'hiss', habitat: 'River', diet: 'Carnivore', fact: 'A crocodile has very strong jaws', symbol: '💪', color: '#556B2F', category: 'Reptiles' },
  { emoji: '🦛', name: 'Hippo', sound: 'grunt', habitat: 'River', diet: 'Herbivore', fact: 'A hippo spends most of its day in water', symbol: '💦', color: '#696969', category: 'River Giants' },
  { emoji: '🐆', name: 'Cheetah', sound: 'chirp', habitat: 'Savanna', diet: 'Carnivore', fact: 'A cheetah is the fastest land animal', symbol: '⚡', color: '#F4A460', category: 'Fast Cats' },
  { emoji: '🦜', name: 'Parrot', sound: 'squawk', habitat: 'Jungle', diet: 'Omnivore', fact: 'A parrot can learn to talk', symbol: '🗣️', color: '#FF1493', category: 'Tropical Birds' },
  { emoji: '🐢', name: 'Turtle', sound: 'silent', habitat: 'Ocean', diet: 'Omnivore', fact: 'A turtle can live for over 100 years', symbol: '⏰', color: '#228B22', category: 'Slow Movers' },
  { emoji: '🦉', name: 'Owl', sound: 'hoot', habitat: 'Forest', diet: 'Carnivore', fact: 'An owl can turn its head almost all the way around', symbol: '🔄', color: '#8B4513', category: 'Night Birds' },
  { emoji: '🐿️', name: 'Squirrel', sound: 'chatter', habitat: 'Forest', diet: 'Omnivore', fact: 'A squirrel stores nuts for winter', symbol: '🌰', color: '#A0522D', category: 'Tree Climbers' },
  { emoji: '🦔', name: 'Hedgehog', sound: 'snuffle', habitat: 'Forest', diet: 'Omnivore', fact: 'A hedgehog has spiky quills for protection', symbol: '🛡️', color: '#8B7355', category: 'Spiky Animals' },
  { emoji: '🐝', name: 'Bee', sound: 'buzz', habitat: 'Garden', diet: 'Herbivore', fact: 'A bee makes honey from flower nectar', symbol: '🍯', color: '#FFD700', category: 'Insects' },
];

// ============================================================================
// DOM Element Cache
// For better performance - initialized on first use
// ============================================================================

/**
 * Cached DOM elements for optimal performance
 * @type {Object}
 */
const cachedDOMElements = {
  animalEmoji: null,
  questionElement: null,
  optionsContainer: null,
  feedback: null,
  questionTransition: null,
  questionTransitionFill: null,
  questionTransitionLabel: null,
  nextBtn: null,
  timerFill: null,
  timerText: null,
  score: null,
  currentQuestion: null,
  streak: null,
  hintBtn: null,
  eliminateBtn: null,
  skipBtn: null,
};

/**
 * Initialize DOM element cache for performance optimization
 * @returns {void}
 */
function initializeDOMElementCache() {
  cachedDOMElements.animalEmoji = document.getElementById('animalEmoji');
  cachedDOMElements.questionElement = document.getElementById('question');
  cachedDOMElements.optionsContainer = document.getElementById('options');
  cachedDOMElements.feedback = document.getElementById('feedback');
  cachedDOMElements.questionTransition = document.getElementById('questionTransition');
  cachedDOMElements.questionTransitionFill = document.getElementById('questionTransitionFill');
  cachedDOMElements.questionTransitionLabel = document.getElementById('questionTransitionLabel');
  cachedDOMElements.nextBtn = document.getElementById('nextBtn');
  cachedDOMElements.timerFill = document.getElementById('timerFill');
  cachedDOMElements.timerText = document.getElementById('timerText');
  cachedDOMElements.score = document.getElementById('score');
  cachedDOMElements.currentQuestion = document.getElementById('currentQuestion');
  cachedDOMElements.streak = document.getElementById('streak');
  cachedDOMElements.hintBtn = document.getElementById('hintBtn');
  cachedDOMElements.eliminateBtn = document.getElementById('eliminateBtn');
  cachedDOMElements.skipBtn = document.getElementById('skipBtn');
}

// ============================================================================
// Game State Variables
// Centralized game state management
// ============================================================================

let currentQuestionIndex = 0;
let score = 0;
let streak = 0;
let maxStreak = 0;
let currentAnimal = null;
let gameQuestions = [];
let gameMode = 'classic';
let questionTypes = ['name', 'fact', 'habitat', 'diet'];
let currentQuestionType = 'name';
let timer = null;
let questionAdvanceTimeout = null;
let questionExitTimeout = null;
let questionEntryTimeout = null;
let timeLeft = GAME_CONFIG.TIMER_SECONDS;
let powerups = {
  hints: GAME_CONFIG.INITIAL_HINTS,
  eliminate: GAME_CONFIG.INITIAL_ELIMINATES,
  skip: GAME_CONFIG.INITIAL_SKIPS,
};
let highScore = parseInt(localStorage.getItem(GAME_CONFIG.HIGH_SCORE_KEY) || '0');
let achievements = [];

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Shuffle array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Determine correct answer based on current question type
 * @returns {string} The correct answer text
 */
function getCorrectAnswer() {
  switch (currentQuestionType) {
    case 'name': return currentAnimal.name;
    case 'fact': return currentAnimal.fact;
    case 'habitat': return currentAnimal.habitat;
    case 'diet': return currentAnimal.diet;
    default: return currentAnimal.name;
  }
}

/**
 * Generate pool of incorrect answer options
 * Uses Set for deduplication and better performance
 * @returns {Array<string>} Array of incorrect answers
 */
function generateIncorrectAnswerOptionsPool() {
  const validTypes = ['name', 'fact', 'habitat', 'diet'];
  const prop = validTypes.includes(currentQuestionType) ? currentQuestionType : 'name';
  const currentValue = currentAnimal[prop];

  return [...new Set(
    animals
      .filter(animal => animal[prop] !== currentValue)
      .map(animal => animal[prop])
  )];
}

/**
 * Randomly select incorrect answers from pool
 * @param {Array<string>} incorrectAnswersPool - Pool of incorrect answers
 * @param {number} count - Number of incorrect answers to select
 * @returns {Array<string>} Selected incorrect answers
 */
function selectRandomIncorrectAnswers(incorrectAnswersPool, count) {
  const shuffled = shuffleArray([...incorrectAnswersPool]);
  return shuffled.slice(0, count);
}

/**
 * Get feedback message based on question type and correct answer
 * @param {string} correctAnswerText - The correct answer
 * @returns {string} Feedback message
 */
function getFeedbackMessage(correctAnswerText = currentAnimal.name) {
  switch (currentQuestionType) {
    case 'name': return `It is a ${correctAnswerText}`;
    case 'fact': return currentAnimal.fact;
    case 'habitat': return `${currentAnimal.name}s live in the ${currentAnimal.habitat}`;
    case 'diet': return `${currentAnimal.name}s are ${currentAnimal.diet}s`;
    default: return `It is a ${correctAnswerText}`;
  }
}

// ============================================================================
// Core Game Functions
// ============================================================================

/**
 * Initialize the educational game session
 * Sets up game state, shuffles animals, and loads first question
 * @returns {void}
 */
export function initGame() {
  updateHighScoreDisplay();
  resetPowerupInventory();

  // Initialize DOM element cache for performance
  initializeDOMElementCache();

  // Shuffle and select random animals using Fisher-Yates algorithm
  const shuffledAnimalsCollection = shuffleArray([...animals]);
  const questionCountForCurrentMode = gameMode === 'survival'
    ? GAME_CONFIG.SURVIVAL_INITIAL_QUESTIONS
    : GAME_CONFIG.TOTAL_QUESTIONS;
  gameQuestions = shuffledAnimalsCollection.slice(0, questionCountForCurrentMode);

  // Reset game state variables
  currentQuestionIndex = 0;
  score = 0;
  streak = 0;
  maxStreak = 0;
  achievements = [];

  updateScoreBoardDisplay();
  loadNextQuestion();
}

/**
 * Select and initialize game mode with lazy loading support
 * @param {string} mode - The game mode to activate
 * @param {HTMLButtonElement | null} triggerButton - The mode button that initiated the switch
 * @returns {Promise<void>}
 */
export async function selectMode(mode, triggerButton = null) {
  // Clear any existing timer before mode switch to prevent memory leaks
  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  gameMode = mode;

  // Update UI to reflect active mode with smooth transition
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.setAttribute('aria-pressed', 'false');
  });
  if (triggerButton) {
    triggerButton.classList.add('active');
    triggerButton.setAttribute('aria-pressed', 'true');
  }

  // Check if it's an interactive game mode requiring lazy loading
  if (mode === 'habitat' || mode === 'sounds') {
    const gameAreaElement = document.getElementById('gameArea');
    showLoadingSkeleton(gameAreaElement);

    try {
      if (window.interactiveFeatures && typeof window.interactiveFeatures.startGame === 'function') {
        await new Promise(resolve => setTimeout(resolve, 150));
        gameAreaElement.innerHTML = '';
        await window.interactiveFeatures.startGame(mode);
      } else {
        throw new Error('Interactive features module not loaded');
      }
    } catch (error) {
      console.error('Failed to load interactive game mode:', error);
      showErrorMessage(gameAreaElement, 'Failed to load game. Please try again.');
      return;
    }

    // Hide regular game elements with smooth fade
    const scoreBoardElement = document.querySelector('.score-board');
    if (scoreBoardElement) {
      scoreBoardElement.style.transition = 'opacity 0.3s ease';
      scoreBoardElement.style.opacity = '0';
      setTimeout(() => {
        scoreBoardElement.style.display = 'none';
        scoreBoardElement.style.opacity = '1';
      }, 300);
    }
    return;
  }

  // Show regular game elements for standard modes with smooth fade-in
  const scoreBoardElement = document.querySelector('.score-board');
  if (scoreBoardElement) {
    scoreBoardElement.style.display = 'flex';
    scoreBoardElement.style.opacity = '0';
    setTimeout(() => {
      scoreBoardElement.style.transition = 'opacity 0.3s ease';
      scoreBoardElement.style.opacity = '1';
    }, 10);
  }

  // Update total questions display
  const totalQuestionsDisplayElement = document.getElementById('totalQuestions');
  if (totalQuestionsDisplayElement) {
    totalQuestionsDisplayElement.textContent = mode === 'survival' ? '∞' : GAME_CONFIG.TOTAL_QUESTIONS;
  }

  // Show/hide timer based on mode
  const timerContainerElement = document.getElementById('timerContainer');
  if (timerContainerElement) {
    timerContainerElement.style.transition = 'opacity 0.3s ease, height 0.3s ease';
    if (mode === 'speed') {
      timerContainerElement.style.display = 'block';
      setTimeout(() => { timerContainerElement.style.opacity = '1'; }, 10);
    } else {
      timerContainerElement.style.opacity = '0';
      setTimeout(() => { timerContainerElement.style.display = 'none'; }, 300);
    }
  }

  await initializeGameWithLoadingState();
}

/**
 * Display loading skeleton for better perceived performance
 * @param {HTMLElement} containerElement - The container to show skeleton in
 * @returns {void}
 */
function showLoadingSkeleton(containerElement) {
  containerElement.innerHTML = `
    <div class="skeleton-loader skeleton-animal" role="status" aria-live="polite" aria-label="Loading game..."></div>
    <div class="options" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px;">
      <div class="skeleton-loader skeleton-option"></div>
      <div class="skeleton-loader skeleton-option"></div>
      <div class="skeleton-loader skeleton-option"></div>
      <div class="skeleton-loader skeleton-option"></div>
    </div>
  `;
}

/**
 * Display error message with user-friendly UI
 * @param {HTMLElement} containerElement - The container to show error in
 * @param {string} errorMessage - The error message to display
 * @returns {void}
 */
function showErrorMessage(containerElement, errorMessage) {
  containerElement.innerHTML = `
    <div style="padding: 40px; text-align: center; background: #fff3cd; border-radius: 15px; border: 3px solid #ffc107;">
      <p style="font-size: 1.3em; color: #856404; margin-bottom: 20px;">⚠️ ${errorMessage}</p>
      <button class="restart-btn" onclick="location.reload()">Retry</button>
    </div>
  `;
}

/**
 * Initialize game with loading state for better UX
 * @returns {Promise<void>}
 */
async function initializeGameWithLoadingState() {
  const gameAreaElement = document.getElementById('gameArea');
  if (gameAreaElement) {
    gameAreaElement.classList.add('loading-state');
  }

  await new Promise(resolve => setTimeout(resolve, 150));
  initGame();

  if (gameAreaElement) {
    gameAreaElement.classList.remove('loading-state');
  }
}

/**
 * Update high score display in the UI
 * @returns {void}
 */
function updateHighScoreDisplay() {
  const highScoreElement = document.getElementById('highScore');
  if (highScoreElement) {
    highScoreElement.textContent = `🏆 High Score: ${highScore}`;
    highScoreElement.classList.add('haptic-pulse');
    setTimeout(() => highScoreElement.classList.remove('haptic-pulse'), 300);
  }
}

/**
 * Reset powerup inventory to initial state
 * @returns {void}
 */
function resetPowerupInventory() {
  powerups = {
    hints: GAME_CONFIG.INITIAL_HINTS,
    eliminate: GAME_CONFIG.INITIAL_ELIMINATES,
    skip: GAME_CONFIG.INITIAL_SKIPS,
  };
  updatePowerupButtonDisplay();
}

/**
 * Update powerup button states and labels
 * @returns {void}
 */
function updatePowerupButtonDisplay() {
  if (cachedDOMElements.hintBtn) {
    cachedDOMElements.hintBtn.textContent = `💡 Hint (${powerups.hints})`;
    cachedDOMElements.hintBtn.disabled = powerups.hints <= 0;
    cachedDOMElements.hintBtn.setAttribute('aria-label', `Use hint power-up, ${powerups.hints} remaining`);
  }
  if (cachedDOMElements.eliminateBtn) {
    cachedDOMElements.eliminateBtn.textContent = `❌ Eliminate (${powerups.eliminate})`;
    cachedDOMElements.eliminateBtn.disabled = powerups.eliminate <= 0;
    cachedDOMElements.eliminateBtn.setAttribute('aria-label', `Eliminate wrong answers, ${powerups.eliminate} remaining`);
  }
  if (cachedDOMElements.skipBtn) {
    cachedDOMElements.skipBtn.textContent = `⏭️ Skip (${powerups.skip})`;
    cachedDOMElements.skipBtn.disabled = powerups.skip <= 0;
    cachedDOMElements.skipBtn.setAttribute('aria-label', `Skip question, ${powerups.skip} remaining`);
  }
}

/**
 * Load and display the next question with smooth transitions
 * @returns {void}
 */
function loadNextQuestion() {
  resetQuestionTransitionCue();
  resetClassicQuestionStage();

  if (gameMode === 'survival') {
    if (currentQuestionIndex >= gameQuestions.length) {
      const additionalAnimalsForSurvival = [...animals]
        .sort(() => Math.random() - 0.5)
        .slice(0, GAME_CONFIG.SURVIVAL_BATCH_SIZE);
      gameQuestions.push(...additionalAnimalsForSurvival);
    }
  } else if (currentQuestionIndex >= GAME_CONFIG.TOTAL_QUESTIONS) {
    endGame();
    return;
  }

  currentAnimal = gameQuestions[currentQuestionIndex];
  window.currentAnimal = currentAnimal;

  if (gameMode === 'quiz') {
    currentQuestionType = questionTypes[Math.floor(Math.random() * questionTypes.length)];
  } else {
    currentQuestionType = 'name';
  }

  setupQuestionDisplay();

  if (gameMode === 'speed') {
    startCountdownTimer();
  }

  generateAnswerOptionsForCurrentQuestion();

  if (cachedDOMElements.feedback) cachedDOMElements.feedback.textContent = '';
  if (cachedDOMElements.nextBtn) cachedDOMElements.nextBtn.disabled = true;

  if (window.realAnimalSounds && window.realAnimalSounds.clearSelection) {
    window.realAnimalSounds.clearSelection();
  }

  if (cachedDOMElements.currentQuestion) {
    cachedDOMElements.currentQuestion.textContent = currentQuestionIndex + 1;
    PerformanceUtils.animateScoreBump(cachedDOMElements.currentQuestion);
  }

  addAnimalEntranceAnimation();

  if (isClassicStagecraftMode()) {
    playClassicQuestionEntry();
  }
}

/**
 * Setup question display elements based on question type
 * @returns {void}
 */
function setupQuestionDisplay() {
  if (!cachedDOMElements.animalEmoji || !cachedDOMElements.questionElement) {
    initializeDOMElementCache();
  }

  const animalEmojiElement = cachedDOMElements.animalEmoji;
  const questionTextElement = cachedDOMElements.questionElement;

  switch (currentQuestionType) {
    case 'name':
      animalEmojiElement.textContent = currentAnimal.emoji;
      questionTextElement.textContent = 'What animal is this?';
      break;
    case 'fact':
      animalEmojiElement.textContent = currentAnimal.emoji;
      questionTextElement.textContent = 'Learn about this animal!';
      break;
    case 'habitat':
      animalEmojiElement.textContent = currentAnimal.emoji;
      questionTextElement.textContent = 'Where does this animal live?';
      break;
    case 'diet':
      animalEmojiElement.textContent = currentAnimal.emoji;
      questionTextElement.textContent = 'What does this animal eat?';
      break;
  }
}

/**
 * Add engaging entrance animation to animal emoji
 * @returns {void}
 */
function addAnimalEntranceAnimation() {
  if (!cachedDOMElements.animalEmoji) {
    initializeDOMElementCache();
  }

  const animalEmojiElement = cachedDOMElements.animalEmoji;
  if (!animalEmojiElement) return;

  const animationVariants = ['roar', 'jump', 'shake'];
  const selectedAnimation = animationVariants[Math.floor(Math.random() * animationVariants.length)];

  animalEmojiElement.className = 'animal-emoji ' + selectedAnimation;

  setTimeout(() => {
    animalEmojiElement.className = 'animal-emoji';
  }, GAME_CONFIG.ANIMATION_DURATION);
}

/**
 * Start countdown timer for speed mode
 * @returns {void}
 */
function startCountdownTimer() {
  timeLeft = GAME_CONFIG.TIMER_SECONDS;

  if (!cachedDOMElements.timerFill || !cachedDOMElements.timerText) {
    initializeDOMElementCache();
  }

  const timerFillElement = cachedDOMElements.timerFill;
  const timerTextElement = cachedDOMElements.timerText;

  if (timer) clearInterval(timer);

  timer = setInterval(() => {
    timeLeft--;
    const remainingTimePercentage = (timeLeft / GAME_CONFIG.TIMER_SECONDS) * 100;

    if (timerFillElement) {
      timerFillElement.style.width = remainingTimePercentage + '%';
      timerFillElement.classList.add('animated-progress');

      if (timeLeft <= 3) {
        timerFillElement.style.background = 'linear-gradient(90deg, #FF6347, #FF4500)';
      }
    }

    if (timerTextElement) {
      timerTextElement.textContent = `Time: ${timeLeft}s`;
      if (timeLeft <= 3) {
        timerTextElement.classList.add('haptic-pulse');
        setTimeout(() => timerTextElement.classList.remove('haptic-pulse'), 300);
      }
    }

    if (timeLeft <= 0) {
      clearInterval(timer);
      timer = null;

      if (window.realAnimalSounds && window.realAnimalSounds.playUISound) {
        window.realAnimalSounds.playUISound('timeout');
      }

      if (window.realAnimalSounds && window.realAnimalSounds.selectOption) {
        window.realAnimalSounds.selectOption('TIME_UP');
      }

      if (cachedDOMElements.nextBtn) {
        cachedDOMElements.nextBtn.disabled = false;
      }
    }
  }, 1000);
}

/**
 * Generate answer options for current question
 * @returns {void}
 */
function generateAnswerOptionsForCurrentQuestion() {
  if (!cachedDOMElements.optionsContainer) {
    initializeDOMElementCache();
  }
  const answerOptionsContainer = cachedDOMElements.optionsContainer;
  if (!answerOptionsContainer) return;

  answerOptionsContainer.innerHTML = '';

  const correctAnswerText = getCorrectAnswer();
  const incorrectAnswerOptions = generateIncorrectAnswerOptionsPool();
  const selectedIncorrectAnswers = selectRandomIncorrectAnswers(
    incorrectAnswerOptions,
    GAME_CONFIG.WRONG_OPTIONS_COUNT
  );

  const allAnswerOptions = shuffleArray([correctAnswerText, ...selectedIncorrectAnswers]);

  allAnswerOptions.forEach((answerText, index) => {
    const optionButton = createAnswerOptionButton(answerText, currentAnimal, index);
    answerOptionsContainer.appendChild(optionButton);
  });
}

/**
 * Create an answer option button with enhanced UX
 * @param {string} answerText - The answer text to display
 * @param {Object} _animalData - The animal data for emoji display (unused)
 * @param {number} _index - Button index for stagger animation (unused)
 * @returns {HTMLButtonElement} The created button element
 */
function createAnswerOptionButton(answerText, _animalData, _index) {
  const buttonElement = document.createElement('button');
  buttonElement.className = 'option-btn';
  buttonElement.dataset.value = answerText;

  if (currentQuestionType === 'name') {
    const matchingAnimal = animals.find(a => a.name === answerText);
    buttonElement.textContent = `${matchingAnimal?.emoji || ''} ${answerText}`;
  } else {
    buttonElement.textContent = answerText;
  }

  buttonElement.onclick = function () {
    handleAnswerSelection(answerText, buttonElement);
  };

  buttonElement.setAttribute('aria-label', `Select answer: ${answerText}`);
  buttonElement.setAttribute('tabindex', '0');

  return buttonElement;
}

/**
 * Handle answer selection with immediate feedback
 * @param {string} selectedAnswerText - The selected answer text
 * @param {HTMLButtonElement} selectedButton - The clicked button element
 * @returns {void}
 */
function handleAnswerSelection(selectedAnswerText, selectedButton) {
  processAnswerSubmission(selectedAnswerText, selectedButton);

  if (questionAdvanceTimeout) {
    clearTimeout(questionAdvanceTimeout);
    questionAdvanceTimeout = null;
  }

  if (gameMode === 'classic') {
    prepareClassicNextStep();
    return;
  }

  questionAdvanceTimeout = setTimeout(() => {
    currentQuestionIndex++;
    loadNextQuestion();
    questionAdvanceTimeout = null;
  }, GAME_CONFIG.AUTO_ADVANCE_DELAY);
}

/**
 * Process answer submission and provide immediate feedback
 * @param {string} selectedAnswerText - The answer selected by user
 * @param {HTMLButtonElement} selectedButtonElement - The button that was clicked
 * @returns {void}
 */
function processAnswerSubmission(selectedAnswerText, selectedButtonElement) {
  const correctAnswerText = getCorrectAnswer();
  const isAnswerCorrect = selectedAnswerText === correctAnswerText;
  const allAnswerButtons = document.querySelectorAll('.option-btn');

  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  allAnswerButtons.forEach(buttonElement => {
    buttonElement.disabled = true;
    if (buttonElement === selectedButtonElement) {
      buttonElement.classList.add('selected');
    }
    if (buttonElement.dataset.value === correctAnswerText) {
      buttonElement.classList.add('correct');
    } else if (buttonElement === selectedButtonElement && !isAnswerCorrect) {
      buttonElement.classList.add('incorrect');
    }
  });

  if (currentQuestionType === 'name' && window.realAnimalSounds && window.realAnimalSounds.playAnimalSound) {
    window.realAnimalSounds.playAnimalSound(correctAnswerText);
  }

  if (isAnswerCorrect && selectedAnswerText !== 'TIME_UP') {
    let earnedPoints = GAME_CONFIG.POINTS_PER_CORRECT;

    if (gameMode === 'speed' && timeLeft > GAME_CONFIG.SPEED_BONUS_THRESHOLD) {
      earnedPoints += (timeLeft - GAME_CONFIG.SPEED_BONUS_THRESHOLD) * GAME_CONFIG.SPEED_BONUS_MULTIPLIER;
    }

    score += earnedPoints;
    streak++;
    maxStreak = Math.max(maxStreak, streak);

    displaySuccessFeedback(correctAnswerText);
    playSuccessSound();
    createParticles();

    if (streak >= GAME_CONFIG.COMBO_THRESHOLD) {
      showComboIndicator();
      showConfetti();
    }

    checkAchievements();
  } else {
    if (gameMode === 'survival') {
      endGame();
      return;
    }
    streak = 0;
    displayFailureFeedback(selectedAnswerText, correctAnswerText);
    playFailureSound();
  }

  updateScoreBoardDisplay();
}

/**
 * Display success feedback with positive reinforcement
 * @param {string} correctAnswerText - The correct answer
 * @returns {void}
 */
function displaySuccessFeedback(correctAnswerText) {
  const classicPrompt = gameMode === 'classic' ? ' Tap next when you are ready.' : '';
  const feedbackText = `Excellent! ${getFeedbackMessage(correctAnswerText)}!${classicPrompt} 🎉`;
  showFeedback(feedbackText, 'correct');
}

/**
 * Display failure feedback with encouragement
 * @param {string} selectedAnswerText - The incorrect answer selected
 * @param {string} correctAnswerText - The correct answer
 * @returns {void}
 */
function displayFailureFeedback(selectedAnswerText, correctAnswerText) {
  const prefix = selectedAnswerText === 'TIME_UP' ? "Time's up!" : 'Oops!';
  const classicPrompt = gameMode === 'classic' ? ' Tap next when you are ready.' : ' Try again next time!';
  const feedbackText = `${prefix} ${getFeedbackMessage(correctAnswerText)}.${classicPrompt} 😊`;
  showFeedback(feedbackText, 'incorrect');
}

/**
 * Play success sound with error handling
 * @returns {void}
 */
function playSuccessSound() {
  if (window.realAnimalSounds && window.realAnimalSounds.playUISound) {
    window.realAnimalSounds.playUISound('correct');
  }
}

/**
 * Play failure sound with error handling
 * @returns {void}
 */
function playFailureSound() {
  if (window.realAnimalSounds && window.realAnimalSounds.playUISound) {
    window.realAnimalSounds.playUISound('incorrect');
  }
}

/**
 * Next question function - used by power-ups like skip
 * @returns {void}
 */
export function nextQuestion() {
  if (questionAdvanceTimeout) {
    clearTimeout(questionAdvanceTimeout);
    questionAdvanceTimeout = null;
  }

  if (gameMode === 'classic') {
    startQuestionTransitionCue(GAME_CONFIG.CLASSIC_NEXT_DELAY, 'Next animal is getting ready...');
    startClassicQuestionTransition(GAME_CONFIG.CLASSIC_NEXT_DELAY);

    if (cachedDOMElements.nextBtn) {
      cachedDOMElements.nextBtn.disabled = true;
      cachedDOMElements.nextBtn.textContent = 'Next Animal →';
      cachedDOMElements.nextBtn.setAttribute('aria-label', 'Proceed to the next animal');
    }

    questionAdvanceTimeout = setTimeout(() => {
      currentQuestionIndex++;
      loadNextQuestion();
      questionAdvanceTimeout = null;
    }, GAME_CONFIG.CLASSIC_NEXT_DELAY);
    return;
  }

  currentQuestionIndex++;
  loadNextQuestion();
}

/**
 * Prepare classic next step - enable next button
 * @returns {void}
 */
function prepareClassicNextStep() {
  if (!cachedDOMElements.nextBtn) {
    initializeDOMElementCache();
  }

  if (cachedDOMElements.nextBtn) {
    cachedDOMElements.nextBtn.disabled = false;
    cachedDOMElements.nextBtn.textContent = "Next Animal When I'm Ready →";
    cachedDOMElements.nextBtn.setAttribute('aria-label', 'Go to the next animal when ready');
  }
}

/**
 * Create celebration particles
 * @returns {void}
 */
function createParticles() {
  const animalDisplayContainer = document.querySelector('.animal-display');
  const particleColors = ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98', '#FFA500'];
  for (let particleIndex = 0; particleIndex < GAME_CONFIG.PARTICLE_COUNT; particleIndex++) {
    const particleElement = document.createElement('div');
    particleElement.className = 'particle';
    particleElement.style.left = Math.random() * 100 + '%';
    particleElement.style.backgroundColor = particleColors[Math.floor(Math.random() * particleColors.length)];
    particleElement.style.width = particleElement.style.height = Math.random() * 10 + 5 + 'px';
    animalDisplayContainer.appendChild(particleElement);

    setTimeout(() => particleElement.remove(), GAME_CONFIG.PARTICLE_LIFETIME);
  }
}

/**
 * Show combo indicator for streaks
 * @returns {void}
 */
function showComboIndicator() {
  const comboIndicatorElement = document.createElement('div');
  comboIndicatorElement.className = 'combo-indicator';
  comboIndicatorElement.textContent = `🔥 ${streak} COMBO! 🔥`;
  document.body.appendChild(comboIndicatorElement);

  setTimeout(() => comboIndicatorElement.remove(), GAME_CONFIG.INDICATOR_LIFETIME);
}

/**
 * Check and award achievements
 * @returns {void}
 */
function checkAchievements() {
  const newAchievements = [];

  if (streak === GAME_CONFIG.STREAK_ACHIEVEMENT_5 && !achievements.includes('streak5')) {
    newAchievements.push({ text: '🔥 5 Streak Master!', id: 'streak5' });
  }
  if (streak === GAME_CONFIG.STREAK_ACHIEVEMENT_10 && !achievements.includes('streak10')) {
    newAchievements.push({ text: '🌟 Perfect Streak!', id: 'streak10' });
  }
  if (score >= GAME_CONFIG.SCORE_ACHIEVEMENT_100 && !achievements.includes('score100')) {
    newAchievements.push({ text: '💯 Century Club!', id: 'score100' });
  }

  newAchievements.forEach(achievement => {
    achievements.push(achievement.id);
    showAchievement(achievement.text);
  });
}

/**
 * Show achievement notification
 * @param {string} achievementText - Achievement message
 * @returns {void}
 */
function showAchievement(achievementText) {
  const achievementElement = document.createElement('div');
  achievementElement.className = 'achievement';
  achievementElement.textContent = achievementText;
  document.body.appendChild(achievementElement);

  setTimeout(() => achievementElement.remove(), GAME_CONFIG.ACHIEVEMENT_LIFETIME);
}

/**
 * Show feedback message
 * @param {string} feedbackMessage - Feedback text
 * @param {string} feedbackType - Feedback type ('correct' or 'incorrect')
 * @returns {void}
 */
function showFeedback(feedbackMessage, feedbackType) {
  if (!cachedDOMElements.feedback) {
    initializeDOMElementCache();
  }
  const feedbackElement = cachedDOMElements.feedback;
  if (feedbackElement) {
    feedbackElement.textContent = feedbackMessage;
    feedbackElement.className = `feedback ${feedbackType}-feedback`;
  }
}

/**
 * Start question transition cue with progress bar
 * @param {number} duration - Duration in milliseconds
 * @param {string} label - Label text
 * @returns {void}
 */
function startQuestionTransitionCue(duration = GAME_CONFIG.AUTO_ADVANCE_DELAY, label = 'Next animal is getting ready...') {
  if (!cachedDOMElements.questionTransition || !cachedDOMElements.questionTransitionFill || !cachedDOMElements.questionTransitionLabel) {
    initializeDOMElementCache();
  }

  const transitionElement = cachedDOMElements.questionTransition;
  const transitionFillElement = cachedDOMElements.questionTransitionFill;
  const transitionLabelElement = cachedDOMElements.questionTransitionLabel;

  if (!transitionElement || !transitionFillElement || !transitionLabelElement) return;

  transitionLabelElement.textContent = label;
  transitionElement.classList.add('active');
  transitionElement.setAttribute('aria-hidden', 'false');

  transitionFillElement.style.transition = 'none';
  transitionFillElement.style.transform = 'scaleX(0)';

  requestAnimationFrame(() => {
    transitionFillElement.style.transition = `transform ${duration}ms linear`;
    transitionFillElement.style.transform = 'scaleX(1)';
  });
}

/**
 * Check if classic stagecraft mode is active
 * @returns {boolean}
 */
function isClassicStagecraftMode() {
  return gameMode === 'classic';
}

/**
 * Start classic question transition animation
 * @param {number} duration - Duration in milliseconds
 * @returns {void}
 */
function startClassicQuestionTransition(duration = GAME_CONFIG.AUTO_ADVANCE_DELAY) {
  const gameAreaElement = document.getElementById('gameArea');
  if (!gameAreaElement) return;

  if (questionExitTimeout) clearTimeout(questionExitTimeout);

  gameAreaElement.classList.add('classic-transition-active');
  gameAreaElement.classList.remove('classic-question-entering');

  const exitDelay = Math.max(240, duration - 320);
  questionExitTimeout = setTimeout(() => {
    gameAreaElement.classList.add('classic-question-exiting');
    questionExitTimeout = null;
  }, exitDelay);
}

/**
 * Reset classic question stage
 * @returns {void}
 */
function resetClassicQuestionStage() {
  const gameAreaElement = document.getElementById('gameArea');
  if (!gameAreaElement) return;

  if (questionExitTimeout) {
    clearTimeout(questionExitTimeout);
    questionExitTimeout = null;
  }
  if (questionEntryTimeout) {
    clearTimeout(questionEntryTimeout);
    questionEntryTimeout = null;
  }

  gameAreaElement.classList.remove('classic-transition-active', 'classic-question-exiting', 'classic-question-entering');
}

/**
 * Play classic question entry animation
 * @returns {void}
 */
function playClassicQuestionEntry() {
  const gameAreaElement = document.getElementById('gameArea');
  if (!gameAreaElement) return;

  requestAnimationFrame(() => {
    gameAreaElement.classList.add('classic-question-entering');
    questionEntryTimeout = setTimeout(() => {
      gameAreaElement.classList.remove('classic-question-entering');
      questionEntryTimeout = null;
    }, 520);
  });
}

/**
 * Reset question transition cue
 * @returns {void}
 */
function resetQuestionTransitionCue() {
  if (!cachedDOMElements.questionTransition || !cachedDOMElements.questionTransitionFill || !cachedDOMElements.questionTransitionLabel) {
    initializeDOMElementCache();
  }

  const transitionElement = cachedDOMElements.questionTransition;
  const transitionFillElement = cachedDOMElements.questionTransitionFill;
  const transitionLabelElement = cachedDOMElements.questionTransitionLabel;

  if (!transitionElement || !transitionFillElement || !transitionLabelElement) return;

  transitionElement.classList.remove('active');
  transitionElement.setAttribute('aria-hidden', 'true');
  transitionLabelElement.textContent = 'Next animal is getting ready...';
  transitionFillElement.style.transition = 'none';
  transitionFillElement.style.transform = 'scaleX(0)';
}

/**
 * Update score board display with engaging micro-interaction animations
 * Uses cached DOM elements and requestAnimationFrame for smooth 60fps updates
 * @returns {void}
 */
const updateScoreBoardDisplay = PerformanceUtils.rafSchedule(() => {
  if (cachedDOMElements.score) {
    cachedDOMElements.score.textContent = score;
    PerformanceUtils.animateScoreBump(cachedDOMElements.score.parentElement);
  }
  if (cachedDOMElements.streak) {
    cachedDOMElements.streak.textContent = streak;
    if (streak > 0) {
      PerformanceUtils.animateScoreBump(cachedDOMElements.streak.parentElement);
    }
    if (streak >= GAME_CONFIG.COMBO_THRESHOLD) {
      cachedDOMElements.streak.parentElement.classList.add('haptic-pulse');
      setTimeout(() => {
        cachedDOMElements.streak.parentElement.classList.remove('haptic-pulse');
      }, 300);
    }
  }
});

/**
 * End the game and show results
 * @returns {void}
 */
function endGame() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem(GAME_CONFIG.HIGH_SCORE_KEY, highScore.toString());
    showAchievement('🏆 NEW HIGH SCORE! 🏆');
  }

  const gameArea = document.getElementById('gameArea');
  const questionsAnswered = gameMode === 'survival' ? currentQuestionIndex : GAME_CONFIG.TOTAL_QUESTIONS;
  const percentage = Math.round((score / (questionsAnswered * GAME_CONFIG.POINTS_PER_CORRECT)) * 100);

  let message = '';
  let emoji = '';

  if (percentage >= GAME_CONFIG.EXCELLENT_THRESHOLD) {
    message = "Amazing! You're a Wild Animal Expert! 🌟";
    emoji = '🏆';
    showConfetti();
  } else if (percentage >= GAME_CONFIG.GREAT_THRESHOLD) {
    message = 'Great job! You know your animals well! 👏';
    emoji = '🥈';
  } else if (percentage >= GAME_CONFIG.GOOD_THRESHOLD) {
    message = 'Good effort! Keep learning about animals! 👍';
    emoji = '🥉';
  } else {
    message = 'Nice try! Practice makes perfect! 😊';
    emoji = '🌟';
  }

  let modeText = '';
  switch (gameMode) {
    case 'survival': modeText = `Survival Mode - ${currentQuestionIndex} questions!`; break;
    case 'speed': modeText = 'Speed Mode - Time Challenge!'; break;
    case 'quiz': modeText = 'Quiz Mode - Mixed Questions!'; break;
    default: modeText = 'Classic Mode Completed!';
  }

  gameArea.innerHTML = `
    <div class="game-complete">
      <div style="font-size: 4em; margin-bottom: 20px;">${emoji}</div>
      <h2 style="color: #2E8B57; margin-bottom: 15px;">${message}</h2>
      <div style="font-size: 1.3em; margin-bottom: 15px; color: #8B4513;">
        ${modeText}
      </div>
      <div style="font-size: 1.5em; margin-bottom: 15px;">
        Final Score: <strong>${score}</strong>
      </div>
      <div style="font-size: 1.2em; margin-bottom: 15px;">
        Best Streak: <strong>${maxStreak}</strong> 🔥
      </div>
      <div style="font-size: 1.1em; margin-bottom: 20px; color: #666;">
        High Score: <strong>${highScore}</strong> 🏆
      </div>
      <button class="restart-btn" onclick="restartGame()">🎮 Play Again!</button>
    </div>
  `;

  if (window.realAnimalSounds && window.realAnimalSounds.playUISound) {
    window.realAnimalSounds.playUISound('complete');
  }
}

// ============================================================================
// Power-up Functions
// ============================================================================

/**
 * Use hint power-up
 * @returns {void}
 */
export function useHint() {
  if (powerups.hints <= 0) return;

  powerups.hints--;
  updatePowerupButtons();

  const correctAnswer = getCorrectAnswer();
  const feedback = document.getElementById('feedback');
  feedback.textContent = `💡 Hint: The answer starts with "${correctAnswer.charAt(0)}"`;
  feedback.className = 'feedback';
  if (window.realAnimalSounds && window.realAnimalSounds.playUISound) {
    window.realAnimalSounds.playUISound('powerup');
  }
}

/**
 * Update powerup buttons (alias for updatePowerupButtonDisplay)
 * @returns {void}
 */
function updatePowerupButtons() {
  updatePowerupButtonDisplay();
}

/**
 * Eliminate wrong answers power-up
 * @returns {void}
 */
export function eliminateWrong() {
  if (powerups.eliminate <= 0) return;

  powerups.eliminate--;
  updatePowerupButtons();

  const correctAnswer = getCorrectAnswer();
  const allOptionButtons = Array.from(document.querySelectorAll('.option-btn'));
  const incorrectOptionButtons = allOptionButtons.filter(optionButton => optionButton.dataset.value !== correctAnswer);

  for (let eliminateIndex = 0; eliminateIndex < GAME_CONFIG.ELIMINATE_COUNT && eliminateIndex < incorrectOptionButtons.length; eliminateIndex++) {
    incorrectOptionButtons[eliminateIndex].style.opacity = '0.3';
    incorrectOptionButtons[eliminateIndex].disabled = true;
  }

  if (window.realAnimalSounds && window.realAnimalSounds.playUISound) {
    window.realAnimalSounds.playUISound('powerup');
  }
}

/**
 * Skip question power-up
 * @returns {void}
 */
export function skipQuestion() {
  if (powerups.skip <= 0) return;

  powerups.skip--;
  updatePowerupButtons();

  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  showFeedback('⏭️ Question skipped!', 'correct');
  score += GAME_CONFIG.POINTS_FOR_SKIP;
  updateScoreBoardDisplay();

  setTimeout(() => {
    currentQuestionIndex++;
    loadNextQuestion();
  }, GAME_CONFIG.SKIP_DELAY);

  if (window.realAnimalSounds && window.realAnimalSounds.playUISound) {
    window.realAnimalSounds.playUISound('powerup');
  }
}

/**
 * Restart the game
 * @returns {void}
 */
export function restartGame() {
  document.querySelectorAll('.option-btn').forEach(btn => {
    btn.classList.remove('correct', 'incorrect');
    btn.disabled = false;
  });

  if (timer) {
    clearInterval(timer);
    timer = null;
  }

  document.getElementById('gameArea').innerHTML = `
    <div class="timer-container" id="timerContainer" style="display: none;">
      <div class="timer-bar">
        <div class="timer-fill" id="timerFill"></div>
      </div>
      <div class="timer-text" id="timerText">Time: 10s</div>
    </div>

    <div class="powerups" id="powerups">
      <button class="powerup-btn" id="hintBtn" onclick="useHint()">💡 Hint (3)</button>
      <button class="powerup-btn" id="eliminateBtn" onclick="eliminateWrong()">❌ Eliminate (2)</button>
      <button class="powerup-btn" id="skipBtn" onclick="skipQuestion()">⏭️ Skip (1)</button>
    </div>

    <div class="animal-display">
      <div class="animal-emoji" id="animalEmoji">🦁</div>
      <div class="question" id="question">What animal is this?</div>
    </div>

    <div class="options" id="options">
      <!-- Options will be generated by JavaScript -->
    </div>

    <div class="feedback" id="feedback"></div>

    <button class="next-btn" id="nextBtn" onclick="nextQuestion()" disabled>Next Animal →</button>
  `;

  initializeDOMElementCache();

  if (cachedDOMElements.animalEmoji) {
    cachedDOMElements.animalEmoji.onclick = playCurrentAnimalSound;
    cachedDOMElements.animalEmoji.classList.add('clickable');
  }

  const timerContainer = document.getElementById('timerContainer');
  if (gameMode === 'speed') {
    timerContainer.style.display = 'block';
  }

  initGame();
}

/**
 * Show confetti celebration
 * @returns {void}
 */
function showConfetti() {
  const celebrationContainer = document.getElementById('celebration');
  celebrationContainer.innerHTML = '';

  const confettiFragment = document.createDocumentFragment();
  const confettiColors = ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98', '#FFA500'];
  const createdConfettiElements = [];

  for (let confettiIndex = 0; confettiIndex < GAME_CONFIG.CONFETTI_COUNT; confettiIndex++) {
    const confettiElement = document.createElement('div');
    confettiElement.className = 'confetti';
    confettiElement.style.left = Math.random() * 100 + '%';
    confettiElement.style.animationDelay = Math.random() * 3 + 's';
    confettiElement.style.backgroundColor = confettiColors[Math.floor(Math.random() * confettiColors.length)];
    confettiFragment.appendChild(confettiElement);
    createdConfettiElements.push(confettiElement);
  }

  celebrationContainer.appendChild(confettiFragment);

  setTimeout(() => {
    createdConfettiElements.forEach(confettiElement => confettiElement.remove());
  }, GAME_CONFIG.CONFETTI_LIFETIME);
}

/**
 * Toggle sound on/off
 * @returns {void}
 */
export function toggleSound() {
  const isEnabled = window.realAnimalSounds && window.realAnimalSounds.toggleSound
    ? window.realAnimalSounds.toggleSound() : false;

  const soundBtn = document.getElementById('soundBtn');
  soundBtn.textContent = isEnabled ? '🔊' : '🔇';
}

/**
 * Play current animal sound when display is clicked
 * @returns {void}
 */
export function playCurrentAnimalSound() {
  if (window.currentAnimal && window.animalSounds) {
    window.animalSounds.playAnimalSound(window.currentAnimal.name);

    if ('vibrate' in navigator) {
      navigator.vibrate(100);
    }

    const animalEmoji = document.getElementById('animalEmoji');
    if (animalEmoji) {
      animalEmoji.style.transform = 'scale(1.2)';
      animalEmoji.style.transition = 'transform 0.2s ease';
      setTimeout(() => {
        animalEmoji.style.transform = 'scale(1)';
      }, GAME_CONFIG.SCALE_RESET_DELAY);
    }
  }
}

/**
 * Add keyboard support for animal display
 * @returns {void}
 */
function setupKeyboardSupport() {
  const animalDisplay = document.querySelector('.animal-display');
  if (animalDisplay) {
    animalDisplay.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        playCurrentAnimalSound();
      }
    });
  }
}

// ============================================================================
// Initialization
// ============================================================================

/**
 * Initialize the game when page loads
 * @returns {void}
 */
export function initializeGame() {
  updateHighScoreDisplay();
  initGame();
  setupKeyboardSupport();

  if (window.realAnimalSounds) {
    console.log('Real Animal sounds module loaded successfully');
    if (window.realAnimalSounds.isReady && window.realAnimalSounds.isReady()) {
      console.log('Web Audio API initialized successfully');
    } else {
      console.log('Using fallback audio system');
    }
  } else {
    console.warn('Real Animal sounds module not available');
  }
}

// Export for global access (backward compatibility)
window.initGame = initGame;
window.selectMode = selectMode;
window.nextQuestion = nextQuestion;
window.useHint = useHint;
window.eliminateWrong = eliminateWrong;
window.skipQuestion = skipQuestion;
window.restartGame = restartGame;
window.toggleSound = toggleSound;
window.playCurrentAnimalSound = playCurrentAnimalSound;
window.GAME_CONFIG = GAME_CONFIG;
window.animals = animals;
window.PerformanceUtils = PerformanceUtils;