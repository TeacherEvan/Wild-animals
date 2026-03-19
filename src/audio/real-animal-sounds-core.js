import { clearSoundPlaying, showSoundPlaying } from './visual-effects.js';

export class RealAnimalSounds {
  constructor({ loader, root = document }) {
    this.loader = loader;
    this.root = root;
    this.enabled = true;
    this.currentSelection = null;
  }

  async playAnimalSound(animalName) {
    if (!this.enabled || !animalName) {
      return;
    }

    await this.loader.playSound(
      animalName,
      () => {
        showSoundPlaying(this.root);
        this.root.dispatchEvent(new CustomEvent('animalSoundStart', { detail: { animal: animalName } }));
      },
      () => {
        clearSoundPlaying(this.root);
        this.root.dispatchEvent(new CustomEvent('animalSoundEnd', { detail: { animal: animalName } }));
      }
    );
  }

  stopCurrentSound() {
    this.loader.stopAll();
    clearSoundPlaying(this.root);
  }

  toggleSound() {
    this.enabled = !this.enabled;
    if (!this.enabled) {
      this.stopCurrentSound();
    }
    return this.enabled;
  }

  isEnabled() {
    return this.enabled;
  }

  playUISound() {}

  playMelody() {}

  selectOption(value) {
    this.currentSelection = value;
  }

  clearSelection() {
    this.currentSelection = null;
  }
}

export function createRealAnimalSoundsInstance(options) {
  return new RealAnimalSounds(options);
}
