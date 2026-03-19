import { GAME_CONFIG, INTERACTIVE_MODES } from './config.js';
import { GameSession } from './game-session.js';
import { UIManager } from './ui.js';
import { animals } from '../data/animals.js';
import { createSoundLoaderInstance } from '../audio/sound-loader-core.js';
import { createRealAnimalSoundsInstance } from '../audio/real-animal-sounds-core.js';
import { createInteractiveFeatures } from '../games/interactive/controller.js';
export class AppController {
  constructor(root = document) {
    this.root = root;
    this.ui = new UIManager(root);
    this.session = new GameSession(animals);
    this.soundLoader = createSoundLoaderInstance();
    this.audio = createRealAnimalSoundsInstance({ loader: this.soundLoader, root });
    this.interactiveFeatures = createInteractiveFeatures({ root, audio: this.audio, onUpdate: (stats) => this.updateInteractiveStats(stats) });
    this.currentMode = 'classic';
    this.timeLeft = GAME_CONFIG.speedSeconds;
    this.showingResult = false;
  }
  bootstrap() {
    window.soundLoader = this.soundLoader;
    window.realAnimalSounds = this.audio;
    window.animalSounds = this.audio;
    window.interactiveFeatures = this.interactiveFeatures;
    window.currentAnimal = null;
    this.bindEvents();
    this.toggleSoundButton();
    this.selectMode('classic');
  }
  bindEvents() {
    this.root.getElementById('soundBtn').addEventListener('click', () => this.toggleSound());
    this.root.getElementById('modeSelection').addEventListener('click', (event) => this.handleModeClick(event));
    this.root.getElementById('gameArea').addEventListener('click', (event) => this.handleGameAreaClick(event));
    this.root.addEventListener('keydown', (event) => this.handleKeydown(event));
  }
  handleModeClick(event) {
    const button = event.target.closest('.mode-btn');
    if (button) {
      this.selectMode(button.dataset.mode);
    }
  }
  handleGameAreaClick(event) {
    const optionButton = event.target.closest('.option-btn');
    if (optionButton && !INTERACTIVE_MODES.includes(this.currentMode)) {
      this.handleAnswer(optionButton.dataset.answer);
      return;
    }
    const actionButton = event.target.closest('[data-action]');
    if (!actionButton) {
      return;
    }
    const actions = {
      next: () => this.nextStep(),
      restart: () => this.selectMode(this.currentMode),
      hint: () => this.useHint(),
      eliminate: () => this.eliminateWrongAnswers(),
      skip: () => this.skipQuestion(),
      playCurrentSound: () => this.playCurrentAnimalSound()
    };
    actions[actionButton.dataset.action]?.();
  }
  handleKeydown(event) {
    if (event.target.id === 'animalDisplay' && ['Enter', ' '].includes(event.key)) {
      event.preventDefault();
      this.playCurrentAnimalSound();
    }
  }
  selectMode(mode) {
    this.stopTimer();
    this.currentMode = mode;
    this.showingResult = false;
    this.ui.setActiveMode(mode);
    if (INTERACTIVE_MODES.includes(mode)) {
      this.interactiveFeatures.startGame(mode);
      return;
    }
    this.ui.restoreStandardMarkup();
    this.session.start(mode);
    this.renderStandardQuestion();
  }
  renderStandardQuestion(feedback = '') {
    window.currentAnimal = this.session.currentAnimal;
    this.ui.updateDashboard(this.dashboardState());
    this.ui.renderQuestion(this.session.currentQuestion, this.session.hiddenAnswers);
    if (feedback) {
      this.ui.setFeedback(feedback, 'info');
    }
    if (this.currentMode === 'speed') {
      this.startTimer();
    } else {
      this.ui.updateTimer(GAME_CONFIG.speedSeconds, false);
    }
  }
  handleAnswer(answer) {
    const result = this.session.submitAnswer(answer, this.timeLeft);
    if (!result) {
      return;
    }
    this.stopTimer();
    this.ui.lockOptions(result.correctAnswer);
    this.ui.setFeedback(result.correct ? result.feedback : `${result.feedback} Answer: ${result.correctAnswer}`, result.correct ? 'correct' : 'wrong');
    this.ui.nextBtn.disabled = false;
    this.showingResult = result.finished || (this.currentMode !== 'survival' && this.session.questionIndex >= GAME_CONFIG.totalQuestions - 1);
  }
  nextStep() {
    if (this.showingResult) {
      this.ui.renderResult(this.session.getSummary());
      return;
    }
    this.session.moveToNextQuestion();
    this.renderStandardQuestion();
  }
  useHint() {
    const hint = this.session.useHint();
    if (hint) {
      this.ui.highlightHint(hint.answer);
      this.ui.updateDashboard(this.dashboardState());
      this.ui.setFeedback(hint.feedback, 'info');
    }
  }
  eliminateWrongAnswers() {
    const result = this.session.eliminateWrongAnswers();
    if (result) {
      this.ui.renderQuestion(this.session.currentQuestion, result.hiddenAnswers);
      this.ui.updateDashboard(this.dashboardState());
      this.ui.setFeedback(result.feedback, 'info');
    }
  }
  skipQuestion() {
    const result = this.session.skipQuestion();
    if (result?.nextQuestion) {
      this.stopTimer();
      this.renderStandardQuestion(result.feedback);
    }
  }
  startTimer() {
    this.stopTimer();
    this.timeLeft = GAME_CONFIG.speedSeconds;
    this.ui.updateTimer(this.timeLeft, true);
    this.timer = window.setInterval(() => {
      this.timeLeft -= 1;
      this.ui.updateTimer(this.timeLeft, true);
      if (this.timeLeft <= 0) {
        this.handleAnswer('__TIMEOUT__');
      }
    }, 1000);
  }
  stopTimer() {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }
  updateInteractiveStats({ score, questionNumber, totalQuestions, streak = 0, feedback = '' }) {
    this.ui.updateDashboard(this.dashboardState({
      score,
      questionNumber,
      totalQuestions,
      streak,
      powerups: { hints: 0, eliminates: 0, skips: 0 }
    }));
    if (feedback) {
      this.ui.setFeedback(feedback, 'info');
    }
  }
  dashboardState(overrides = {}) {
    return {
      score: this.session.score,
      questionNumber: this.session.questionIndex + 1,
      totalQuestions: this.session.getProgressLabel(),
      streak: this.session.streak,
      highScore: this.session.highScore,
      powerups: this.session.powerups,
      ...overrides
    };
  }
  toggleSound() {
    this.audio.toggleSound();
    this.toggleSoundButton();
  }
  toggleSoundButton() {
    this.ui.updateSoundButton(this.audio.isEnabled());
  }
  playCurrentAnimalSound() {
    if (this.session.currentAnimal) {
      this.audio.playAnimalSound(this.session.currentAnimal.name);
    }
  }
}
