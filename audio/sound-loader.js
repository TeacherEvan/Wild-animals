/**
 * Sound Loader Module - Loads and manages human voice animal sounds
 * Handles fallback to text-to-speech if audio files are unavailable
 */

class SoundLoader {
  constructor() {
    this.soundCache = new Map();
    this.audioContext = null;
    this.masterVolume = 0.8;
    this.loadingPromises = new Map();

    // Initialize Web Audio API context for better audio control
    this.initAudioContext();

    // Map animals to their specific sounds
    this.animalSoundMap = {
      Lion: "roar",
      Tiger: "roar",
      Elephant: "trumpet",
      Monkey: "ooh-ooh-ah-ah",
      Wolf: "howl",
      Bear: "growl",
      Dolphin: "click-click",
      Frog: "ribbit",
      Eagle: "screech",
      Penguin: "waddle-waddle",
      Giraffe: "hum",
      Zebra: "neigh",
      Rhino: "snort",
      Fox: "yip-yip",
      Leopard: "growl",
      Kangaroo: "grunt",
      Koala: "snore",
      Gorilla: "hoo-hoo",
      Shark: "splash",
      Octopus: "whoosh",
    };
  }

  /**
   * Initialize Web Audio API context
   */
  initAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
    } catch (e) {
      console.warn("Web Audio API not available:", e);
      this.audioContext = null;
    }
  }

  /**
   * Get the sound name for an animal
   * @param {string} animalName - Name of the animal
   * @returns {string} Sound name
   */
  getSoundName(animalName) {
    return this.animalSoundMap[animalName] || animalName.toLowerCase();
  }

  /**
   * Load audio file for an animal
   * @param {string} animalName - Name of the animal
   * @returns {Promise<AudioBuffer|null>} Loaded audio buffer or null
   */
  async loadAnimalSound(animalName) {
    const soundName = this.getSoundName(animalName);
    const cacheKey = `${animalName}-${soundName}`;

    // Return from cache if available
    if (this.soundCache.has(cacheKey)) {
      return this.soundCache.get(cacheKey);
    }

    // Return existing loading promise to avoid duplicate requests
    if (this.loadingPromises.has(cacheKey)) {
      return this.loadingPromises.get(cacheKey);
    }

    // Load audio file
    const loadPromise = this._loadAudioFile(soundName, cacheKey);
    this.loadingPromises.set(cacheKey, loadPromise);

    const result = await loadPromise;
    this.loadingPromises.delete(cacheKey);
    return result;
  }

  /**
   * Internal method to load audio file
   * @private
   */
  async _loadAudioFile(soundName, cacheKey) {
    const audioPath = `audio/sounds/${soundName}.mp3`;

    try {
      // Skip if no audio context
      if (!this.audioContext) {
        console.warn("Audio context not available for:", soundName);
        return null;
      }

      const response = await fetch(audioPath);
      if (!response.ok) {
        console.warn(`Audio file not found: ${audioPath}`);
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);

      // Cache the decoded audio
      this.soundCache.set(cacheKey, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.warn(`Failed to load audio: ${audioPath}`, error);
      return null;
    }
  }

  /**
   * Play audio buffer using Web Audio API
   * @param {AudioBuffer} audioBuffer - Audio buffer to play
   * @returns {AudioBufferSource} Audio source node for control
   */
  playAudioBuffer(audioBuffer) {
    if (!this.audioContext || !audioBuffer) {
      return null;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = audioBuffer;

    // Create gain node for volume control
    const gainNode = this.audioContext.createGain();
    gainNode.gain.value = this.masterVolume;

    source.connect(gainNode);
    gainNode.connect(this.audioContext.destination);

    source.start(0);
    return source;
  }

  /**
   * Play animal sound with fallback to text-to-speech
   * @param {string} animalName - Name of the animal
   * @param {Function} onStart - Callback when sound starts
   * @param {Function} onEnd - Callback when sound ends
   */
  async playSound(animalName, onStart, onEnd) {
    const soundName = this.getSoundName(animalName);

    // Notify start
    if (onStart) onStart(animalName);

    // Try to load and play audio file
    const audioBuffer = await this.loadAnimalSound(animalName);
    if (audioBuffer) {
      const source = this.playAudioBuffer(audioBuffer);
      if (source) {
        source.onended = () => {
          if (onEnd) onEnd(animalName);
        };
        return;
      }
    }

    // Fallback to text-to-speech if audio file not available
    console.log(`Falling back to text-to-speech for ${animalName}`);
    this.playTextToSpeech(animalName, onEnd);
  }

  /**
   * Play text-to-speech fallback
   * @param {string} animalName - Animal name
   * @param {Function} onEnd - Callback when sound ends
   */
  playTextToSpeech(animalName, onEnd) {
    const soundName = this.getSoundName(animalName);

    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(soundName);
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;

      utterance.onend = () => {
        if (onEnd) onEnd(animalName);
      };

      window.speechSynthesis.speak(utterance);
    }
  }

  /**
   * Set master volume
   * @param {number} volume - Volume level (0-1)
   */
  setVolume(volume) {
    this.masterVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Stop all playing sounds
   */
  stopAll() {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }
}

// Create global instance
window.soundLoader = new SoundLoader();
