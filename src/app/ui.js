import { GAME_CONFIG } from './config.js';

function standardMarkup() {
  return `
    <div class="timer-container is-hidden" id="timerContainer">
      <div class="timer-bar"><div class="timer-fill" id="timerFill"></div></div>
      <div class="timer-text" id="timerText">Time: ${GAME_CONFIG.speedSeconds}s</div>
    </div>
    <div class="powerups" id="powerups">
      <button class="powerup-btn" id="hintBtn" data-action="hint">Hint</button>
      <button class="powerup-btn" id="eliminateBtn" data-action="eliminate">Eliminate</button>
      <button class="powerup-btn" id="skipBtn" data-action="skip">Skip</button>
    </div>
    <div class="animal-display" id="animalDisplay" role="button" tabindex="0" aria-label="Play animal sound">
      <div class="animal-emoji" id="animalEmoji">🦁</div>
      <div class="question" id="question">What animal is this?</div>
      <div class="tap-hint" id="questionClue">Tap the animal to hear its sound.</div>
    </div>
    <div class="options" id="options"></div>
    <div class="feedback" id="feedback" aria-live="polite"></div>
    <button class="next-btn" id="nextBtn" data-action="next" disabled>Next Animal →</button>
  `;
}

export class UIManager {
  constructor(root = document) {
    this.root = root;
    this.soundBtn = root.getElementById('soundBtn');
    this.highScore = root.getElementById('highScore');
    this.score = root.getElementById('score');
    this.currentQuestion = root.getElementById('currentQuestion');
    this.totalQuestions = root.getElementById('totalQuestions');
    this.streak = root.getElementById('streak');
    this.gameArea = root.getElementById('gameArea');
    this.cacheStandardElements();
  }

  cacheStandardElements() {
    this.timerContainer = this.root.getElementById('timerContainer');
    this.timerFill = this.root.getElementById('timerFill');
    this.timerText = this.root.getElementById('timerText');
    this.hintBtn = this.root.getElementById('hintBtn');
    this.eliminateBtn = this.root.getElementById('eliminateBtn');
    this.skipBtn = this.root.getElementById('skipBtn');
    this.animalDisplay = this.root.getElementById('animalDisplay');
    this.animalEmoji = this.root.getElementById('animalEmoji');
    this.question = this.root.getElementById('question');
    this.questionClue = this.root.getElementById('questionClue');
    this.options = this.root.getElementById('options');
    this.feedback = this.root.getElementById('feedback');
    this.nextBtn = this.root.getElementById('nextBtn');
  }

  restoreStandardMarkup() {
    this.gameArea.innerHTML = standardMarkup();
    this.cacheStandardElements();
  }

  setActiveMode(mode) {
    this.root.querySelectorAll('.mode-btn').forEach((button) => {
      const active = button.dataset.mode === mode;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }

  updateDashboard({ score, questionNumber, totalQuestions, streak, highScore, powerups }) {
    this.score.textContent = String(score);
    this.currentQuestion.textContent = String(questionNumber);
    this.totalQuestions.textContent = totalQuestions;
    this.streak.textContent = String(streak);
    this.highScore.textContent = `High Score: ${highScore}`;
    if (!this.hintBtn || !this.eliminateBtn || !this.skipBtn) {
      return;
    }
    this.hintBtn.textContent = `Hint (${powerups.hints})`;
    this.hintBtn.disabled = powerups.hints < 1;
    this.eliminateBtn.textContent = `Eliminate (${powerups.eliminates})`;
    this.eliminateBtn.disabled = powerups.eliminates < 1;
    this.skipBtn.textContent = `Skip (${powerups.skips})`;
    this.skipBtn.disabled = powerups.skips < 1;
  }

  renderQuestion(question, hiddenAnswers = []) {
    this.animalEmoji.textContent = question.emoji;
    this.question.textContent = question.prompt;
    this.questionClue.textContent = question.clue;
    this.options.innerHTML = question.options.map((option) => `
      <button class="option-btn" data-answer="${option}" data-correct="${String(option === question.correctAnswer)}" ${hiddenAnswers.includes(option) ? 'disabled hidden' : ''}>
        ${option}
      </button>
    `).join('');
    this.feedback.textContent = '';
    this.feedback.className = 'feedback';
    this.nextBtn.disabled = true;
  }

  lockOptions(correctAnswer) {
    this.options.querySelectorAll('.option-btn').forEach((button) => {
      const isCorrect = button.dataset.answer === correctAnswer;
      button.disabled = true;
      button.classList.toggle('correct', isCorrect);
    });
  }

  highlightHint(answer) {
    const button = this.options.querySelector(`[data-answer="${CSS.escape(answer)}"]`);
    button?.classList.add('hinted');
  }

  setFeedback(message, type = 'info') {
    this.feedback.textContent = message;
    this.feedback.className = `feedback ${type}`;
  }

  updateTimer(timeLeft, isVisible) {
    if (!this.timerContainer || !this.timerText || !this.timerFill) {
      return;
    }
    this.timerContainer.classList.toggle('is-hidden', !isVisible);
    this.timerText.textContent = `Time: ${timeLeft}s`;
    this.timerFill.style.width = `${(timeLeft / GAME_CONFIG.speedSeconds) * 100}%`;
  }

  updateSoundButton(enabled) {
    this.soundBtn.textContent = enabled ? '🔊' : '🔇';
    this.soundBtn.setAttribute('aria-pressed', String(enabled));
  }

  renderResult(summary) {
    this.gameArea.innerHTML = `
      <section class="result-card">
        <h2>${summary.title}</h2>
        <p>${summary.message}</p>
        <p><strong>Score:</strong> ${summary.score}</p>
        <p><strong>Mode:</strong> ${summary.mode}</p>
        <button class="restart-btn" data-action="restart">Play Again</button>
      </section>
    `;
    this.cacheStandardElements();
  }

  renderInteractive(content) {
    this.gameArea.innerHTML = content;
    this.cacheStandardElements();
  }
}
