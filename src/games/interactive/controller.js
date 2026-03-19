import { habitatMatchAnimals, soundGameAnimals } from '../../data/animals.js';
import { HabitatGame } from './habitat-game.js';
import { SoundGame } from './sound-game.js';

export class InteractiveFeatures {
  constructor({ root, audio, onUpdate }) {
    this.root = root;
    this.audio = audio;
    this.onUpdate = onUpdate;
    this.currentGame = null;
  }

  startGame(mode) {
    this.currentGame?.destroy?.();
    const gameArea = this.root.getElementById('gameArea');
    const sharedOptions = { root: gameArea, audio: this.audio, onUpdate: this.onUpdate };
    this.currentGame = mode === 'habitat'
      ? new HabitatGame({ ...sharedOptions, animals: habitatMatchAnimals })
      : new SoundGame({ ...sharedOptions, animals: soundGameAnimals });
    this.currentGame.start();
  }
}

export function createInteractiveFeatures(options) {
  return new InteractiveFeatures(options);
}
