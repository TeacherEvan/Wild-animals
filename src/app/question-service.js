import { GAME_CONFIG, QUIZ_TYPES } from './config.js';
import { pickRandom, shuffleArray, uniqueValues } from './utils.js';

function getQuestionType(mode) {
  return mode === 'quiz' ? pickRandom(QUIZ_TYPES) : 'name';
}

function buildAnswerPool(type, currentAnimal, animals) {
  if (type === 'name' || type === 'fact') {
    return uniqueValues(animals.map(({ name }) => name)).filter((name) => name !== currentAnimal.name);
  }

  return uniqueValues(animals.map((animal) => animal[type])).filter((value) => value !== currentAnimal[type]);
}

function buildPrompt(type, animal) {
  const prompts = {
    name: { emoji: animal.emoji, label: 'What animal is this?', clue: 'Tap the animal to hear its sound.' },
    fact: { emoji: '❓', label: 'Which animal matches this clue?', clue: animal.fact },
    habitat: { emoji: animal.emoji, label: 'Where does this animal live?', clue: animal.fact },
    diet: { emoji: animal.emoji, label: 'What does this animal eat?', clue: animal.fact }
  };

  return prompts[type];
}

function getCorrectAnswer(type, animal) {
  if (type === 'name' || type === 'fact') {
    return animal.name;
  }

  return animal[type];
}

export function createQuestion(mode, animal, animals) {
  const type = getQuestionType(mode);
  const correctAnswer = getCorrectAnswer(type, animal);
  const wrongAnswers = shuffleArray(buildAnswerPool(type, animal, animals)).slice(0, GAME_CONFIG.answerCount - 1);
  const prompt = buildPrompt(type, animal);

  return {
    type,
    animal,
    correctAnswer,
    options: shuffleArray([correctAnswer, ...wrongAnswers]),
    prompt: prompt.label,
    clue: prompt.clue,
    emoji: prompt.emoji
  };
}

export function buildResultMessage(mode, score, streak, wrongAnswer) {
  if (mode === 'survival' && wrongAnswer) {
    return {
      title: 'Survival run complete!',
      message: `You reached a streak of ${streak}. The correct answer was ${wrongAnswer}.`
    };
  }

  if (score >= 80) {
    return { title: 'Amazing work!', message: 'You know your wild animals very well.' };
  }

  if (score >= 50) {
    return { title: 'Nice job!', message: 'You are learning more every round.' };
  }

  return { title: 'Great practice!', message: 'Play again to keep learning.' };
}
