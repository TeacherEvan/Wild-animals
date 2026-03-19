import { shuffleArray } from '../../app/utils.js';
import { GAME_CONFIG } from '../../app/config.js';

export class SoundGame {
  constructor({ root, animals, audio, onUpdate }) {
    this.root = root;
    this.animals = animals;
    this.audio = audio;
    this.onUpdate = onUpdate;
    this.score = 0;
    this.roundIndex = 0;
    this.handleClick = this.handleClick.bind(this);
  }

  start() {
    this.rounds = shuffleArray(this.animals).slice(0, GAME_CONFIG.soundRounds);
    this.score = 0;
    this.roundIndex = 0;
    this.renderRound();
  }

  renderRound() {
    this.currentAnimal = this.rounds[this.roundIndex];
    const others = shuffleArray(this.animals.filter((animal) => animal.name !== this.currentAnimal.name)).slice(0, 3);
    const options = shuffleArray([this.currentAnimal, ...others]);

    this.root.innerHTML = `
      <section class="interactive-card sound-game-card">
        <h2>Sound Game</h2>
        <p>Round ${this.roundIndex + 1} of ${this.rounds.length}</p>
        <button class="big-play-button" data-action="play-sound">Play Animal Sound</button>
        <div class="options sound-options">
          ${options.map((animal) => `
            <button class="option-btn" data-answer="${animal.name}" data-correct="${String(animal.name === this.currentAnimal.name)}">
              ${animal.name}
            </button>
          `).join('')}
        </div>
        <div class="feedback" id="soundFeedback"></div>
        <button class="next-btn" id="nextSoundRound" disabled>Next Round →</button>
      </section>
    `;
    this.root.removeEventListener('click', this.handleClick);
    this.root.addEventListener('click', this.handleClick);
    this.emitUpdate('Press play to hear the animal sound.');
  }

  handleClick(event) {
    const playButton = event.target.closest('[data-action="play-sound"]');
    if (playButton) {
      this.audio.playAnimalSound(this.currentAnimal.name);
      return;
    }

    const answerButton = event.target.closest('.option-btn');
    if (answerButton) {
      this.chooseAnswer(answerButton.dataset.answer);
      return;
    }

    if (event.target.id === 'nextSoundRound') {
      this.nextRound();
    }

    if (event.target.id === 'restartSoundGame') {
      this.start();
    }
  }

  chooseAnswer(answer) {
    const correct = answer === this.currentAnimal.name;
    const feedback = this.root.querySelector('#soundFeedback');
    this.root.querySelectorAll('.option-btn').forEach((button) => {
      button.disabled = true;
      button.classList.toggle('correct', button.dataset.answer === this.currentAnimal.name);
    });
    if (correct) {
      this.score += 10;
    }
    feedback.textContent = correct ? 'Correct! You found the animal.' : `It was ${this.currentAnimal.name}.`;
    this.root.querySelector('#nextSoundRound').disabled = false;
    this.emitUpdate(feedback.textContent);
  }

  nextRound() {
    this.roundIndex += 1;
    if (this.roundIndex >= this.rounds.length) {
      this.root.innerHTML = `
        <section class="result-card">
          <h2>Sound Game complete!</h2>
          <p>You scored ${this.score} points.</p>
          <button class="restart-btn" id="restartSoundGame">Play Again</button>
        </section>
      `;
      this.emitUpdate('Sound Game complete!');
      return;
    }
    this.renderRound();
  }

  emitUpdate(feedback) {
    this.onUpdate({
      score: this.score,
      questionNumber: this.roundIndex + 1,
      totalQuestions: String(this.rounds.length),
      feedback
    });
  }

  destroy() {
    this.root.removeEventListener('click', this.handleClick);
  }
}
