import { getAnimalSound } from './sound-map.js';

export class SoundLoader {
  constructor() {
    this.volume = 0.8;
  }

  playSound(animalName, onStart, onEnd) {
    const phrase = `${animalName} says ${getAnimalSound(animalName)}`;
    onStart?.(animalName);

    if (!('speechSynthesis' in window) || typeof window.SpeechSynthesisUtterance === 'undefined') {
      window.setTimeout(() => onEnd?.(animalName), 250);
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const utterance = new window.SpeechSynthesisUtterance(phrase);
      utterance.rate = 0.85;
      utterance.pitch = 1.05;
      utterance.volume = this.volume;
      utterance.onend = () => {
        onEnd?.(animalName);
        resolve();
      };
      utterance.onerror = () => {
        onEnd?.(animalName);
        resolve();
      };
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    });
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  stopAll() {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }
}

export function createSoundLoaderInstance() {
  return new SoundLoader();
}
