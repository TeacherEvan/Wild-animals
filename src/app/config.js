export const GAME_CONFIG = {
  pointsPerCorrect: 10,
  speedBonusThreshold: 5,
  totalQuestions: 10,
  speedSeconds: 10,
  soundRounds: 5,
  initialHints: 3,
  initialEliminates: 2,
  initialSkips: 1,
  answerCount: 4,
  maxLineCount: 200,
  highScoreKey: 'wildAnimalsHighScore'
};

export const QUIZ_TYPES = ['name', 'fact', 'habitat', 'diet'];

export const STANDARD_MODES = ['classic', 'speed', 'survival', 'quiz'];

export const INTERACTIVE_MODES = ['habitat', 'sounds'];

export const FEEDBACK_MESSAGES = {
  correct: 'Correct! Great job! 🎉',
  wrong: 'Not quite. Keep trying! 😊',
  timeout: 'Time is up. Let us try another one! ⏰',
  hint: 'A hint is glowing for you! 💡',
  skip: 'Skipped. Here comes a new animal! ⏭️'
};
