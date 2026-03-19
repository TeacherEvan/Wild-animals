import { FEEDBACK_MESSAGES, GAME_CONFIG } from './config.js';
import { buildResultMessage, createQuestion } from './question-service.js';
import { shuffleArray } from './utils.js';

function createPowerups() {
  return {
    hints: GAME_CONFIG.initialHints,
    eliminates: GAME_CONFIG.initialEliminates,
    skips: GAME_CONFIG.initialSkips
  };
}

export class GameSession {
  constructor(animals) {
    this.animals = animals;
    this.highScore = Number.parseInt(localStorage.getItem(GAME_CONFIG.highScoreKey) || '0', 10);
    this.start('classic');
  }

  start(mode) {
    this.mode = mode;
    this.score = 0;
    this.streak = 0;
    this.questionIndex = 0;
    this.finished = false;
    this.lastWrongAnswer = '';
    this.powerups = createPowerups();
    this.hiddenAnswers = [];
    this.questions = shuffleArray(this.animals);
    this.loadQuestion();
  }

  loadQuestion() {
    if (this.mode !== 'survival' && this.questionIndex >= GAME_CONFIG.totalQuestions) {
      this.finished = true;
      this.currentQuestion = null;
      return null;
    }

    if (this.questionIndex >= this.questions.length) {
      this.questions.push(...shuffleArray(this.animals));
    }

    this.currentAnimal = this.questions[this.questionIndex];
    this.currentQuestion = createQuestion(this.mode, this.currentAnimal, this.animals);
    this.hiddenAnswers = [];
    this.answered = false;
    return this.currentQuestion;
  }

  submitAnswer(answer, timeLeft = GAME_CONFIG.speedSeconds) {
    if (this.answered || this.finished || !this.currentQuestion) {
      return null;
    }

    this.answered = true;
    const correct = answer === this.currentQuestion.correctAnswer;
    const timedOut = answer === '__TIMEOUT__';

    if (correct) {
      const speedBonus = this.mode === 'speed' && timeLeft > GAME_CONFIG.speedBonusThreshold ? timeLeft - GAME_CONFIG.speedBonusThreshold : 0;
      this.score += GAME_CONFIG.pointsPerCorrect + speedBonus;
      this.streak += 1;
      this.highScore = Math.max(this.highScore, this.score);
      localStorage.setItem(GAME_CONFIG.highScoreKey, String(this.highScore));
    } else {
      this.lastWrongAnswer = this.currentQuestion.correctAnswer;
      this.streak = 0;
      if (this.mode === 'survival') {
        this.finished = true;
      }
    }

    return {
      correct,
      timedOut,
      correctAnswer: this.currentQuestion.correctAnswer,
      feedback: correct ? FEEDBACK_MESSAGES.correct : (timedOut ? FEEDBACK_MESSAGES.timeout : FEEDBACK_MESSAGES.wrong),
      finished: this.finished
    };
  }

  moveToNextQuestion() {
    if (this.finished) {
      return null;
    }

    this.questionIndex += 1;
    return this.loadQuestion();
  }

  useHint() {
    if (this.answered || this.powerups.hints < 1) {
      return null;
    }

    this.powerups.hints -= 1;
    const hintOption = this.currentQuestion.options.find((option) => option === this.currentQuestion.correctAnswer);
    return { answer: hintOption, feedback: FEEDBACK_MESSAGES.hint };
  }

  eliminateWrongAnswers() {
    if (this.answered || this.powerups.eliminates < 1) {
      return null;
    }

    this.powerups.eliminates -= 1;
    const hidden = this.currentQuestion.options.filter((option) => option !== this.currentQuestion.correctAnswer).slice(0, 2);
    this.hiddenAnswers = hidden;
    return { hiddenAnswers: hidden, feedback: FEEDBACK_MESSAGES.hint };
  }

  skipQuestion() {
    if (this.answered || this.powerups.skips < 1) {
      return null;
    }

    this.powerups.skips -= 1;
    this.questionIndex += 1;
    const nextQuestion = this.loadQuestion();
    return { nextQuestion, feedback: FEEDBACK_MESSAGES.skip };
  }

  getProgressLabel() {
    return this.mode === 'survival' ? '∞' : String(GAME_CONFIG.totalQuestions);
  }

  getSummary() {
    const result = buildResultMessage(this.mode, this.score, this.questionIndex, this.lastWrongAnswer);
    return {
      score: this.score,
      title: result.title,
      message: result.message,
      mode: this.mode,
      highScore: this.highScore
    };
  }
}
