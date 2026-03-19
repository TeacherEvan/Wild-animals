import { habitatZones } from '../../data/animals.js';

export class HabitatGame {
  constructor({ root, animals, onUpdate }) {
    this.root = root;
    this.animals = animals;
    this.onUpdate = onUpdate;
    this.matched = 0;
    this.score = 0;
  }

  start() {
    this.render();
    this.bindEvents();
    this.emitUpdate('Match each animal to the right habitat.');
  }

  render() {
    this.root.innerHTML = `
      <section class="interactive-card habitat-board">
        <h2>Habitat Match</h2>
        <p id="interactiveStatus">Drag each animal into the correct home.</p>
        <div class="habitat-grid">
          ${habitatZones.map((habitat) => `
            <section class="drop-zone" data-habitat="${habitat}">
              <h3>${habitat}</h3>
              <div class="drop-slot"></div>
            </section>
          `).join('')}
        </div>
        <div class="animal-pool" id="animalPool">
          ${this.animals.map((animal) => `
            <button class="draggable animal-card" draggable="true" data-animal="${animal.name}" data-habitat="${animal.habitat}">
              <span class="card-emoji">${animal.emoji}</span>
              <span>${animal.name}</span>
            </button>
          `).join('')}
        </div>
      </section>
    `;
  }

  bindEvents() {
    this.handleDragStart = (event) => {
      const card = event.target.closest('.draggable');
      if (!card) {
        return;
      }
      event.dataTransfer?.setData('text/plain', card.dataset.animal || '');
    };

    this.handleDrop = (event) => {
      const zone = event.target.closest('.drop-zone');
      if (!zone) {
        return;
      }
      event.preventDefault();
      const animalName = event.dataTransfer?.getData('text/plain');
      const card = this.root.querySelector(`[data-animal="${CSS.escape(animalName || '')}"]`);
      if (card) {
        this.placeCard(card, zone);
      }
    };

    this.handleDragOver = (event) => {
      if (event.target.closest('.drop-zone')) {
        event.preventDefault();
      }
    };

    this.root.addEventListener('dragstart', this.handleDragStart);
    this.root.addEventListener('dragover', this.handleDragOver);
    this.root.addEventListener('drop', this.handleDrop);
  }

  placeCard(card, zone) {
    const correct = card.dataset.habitat === zone.dataset.habitat;
    const status = this.root.querySelector('#interactiveStatus');

    if (!correct) {
      status.textContent = `${card.dataset.animal} does not live in ${zone.dataset.habitat}. Try again!`;
      return;
    }

    zone.querySelector('.drop-slot')?.appendChild(card);
    card.disabled = true;
    card.draggable = false;
    this.matched += 1;
    this.score += 10;
    status.textContent = `Great! ${card.dataset.animal} belongs in the ${zone.dataset.habitat}.`;
    this.emitUpdate(status.textContent);

    if (this.matched === this.animals.length) {
      this.root.innerHTML = `
        <section class="result-card">
          <h2>Habitat Match complete!</h2>
          <p>You matched all ${this.animals.length} animals.</p>
          <button class="restart-btn" id="restartHabitatGame">Play Again</button>
        </section>
      `;
      this.root.querySelector('#restartHabitatGame')?.addEventListener('click', () => this.start());
    }
  }

  emitUpdate(feedback) {
    this.onUpdate({
      score: this.score,
      questionNumber: this.matched,
      totalQuestions: String(this.animals.length),
      feedback
    });
  }

  destroy() {
    this.root.removeEventListener('dragstart', this.handleDragStart);
    this.root.removeEventListener('dragover', this.handleDragOver);
    this.root.removeEventListener('drop', this.handleDrop);
  }
}
