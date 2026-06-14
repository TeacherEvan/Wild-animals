/**
 * Sound Loader Module - Loads and manages human voice animal sounds
 * Handles fallback to text-to-speech if audio files are unavailable
 */

class SoundLoader {
  constructor() {
    this.soundCache = new Map();
    this.failedCache = new Set();
    this.audioContext = null;
    this.masterVolume = 0.8;
    this.loadingPromises = new Map();
    this.supportedExtensions = ["mp3", "wav"];

    // Initialize Web Audio API context for better audio control
    this.initAudioContext();

    // Map animals to their specific sound identifiers (internal keys matching actual filenames)
    this.animalSoundMap = {
      Lion: "lion_roar",
      Tiger: "tiger_roar",
      Elephant: "elephant_rumble",
      Monkey: "ooh-ooh-ah-ah",
      Wolf: "wolf_howl",
      Bear: "grizzly_bear_growl",
      Dolphin: "dolphin_clicks",
      Frog: "frog_croak",
      Eagle: "eagle_scream",
      Penguin: "waddle-waddle",
      Giraffe: "giraffe_sound",
      Zebra: "zebra_sound",
      Rhino: "snort",
      Fox: "fox_bark",
      Leopard: "leopard_roar",
      Kangaroo: "grunt",
      Koala: "snore",
      Gorilla: "gorilla_grunt",
      Shark: "splash",
      Octopus: "whoosh",
      Camel: "grunt",
      Crocodile: "crocodile_hiss",
      Hippo: "grunt",
      Cheetah: "cheetah_chirp",
      Parrot: "parrot_call",
      Turtle: "silent",
      Owl: "owl_hoot",
      Squirrel: "chatter",
      Hedgehog: "snuffle",
      Bee: "buzz",
    };

    // Explicit manifest of known-good assets.
    // Maps each animal to actual audio file paths (using real downloaded files).
    // Falls back to TTS if audio file not found.
    this.assetManifest = Object.fromEntries(
      Object.entries(this.animalSoundMap).map(([animal, soundKey]) => [
        animal,
        this.supportedExtensions.map((ext) => `audio/sounds/${soundKey}.${ext}`),
      ])
    );
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
   * Get the sound key for an animal
   * @param {string} animalName - Name of the animal
   * @returns {string} Sound key
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
    try {
      // Skip if no audio context
      if (!this.audioContext) {
        console.warn("Audio context not available for:", soundName);
        return null;
      }

      const candidatePaths = this._candidatePathsForSound(soundName);

      // Avoid re-attempting assets already known to be missing.
      if (candidatePaths.every((path) => this.failedCache.has(path))) {
        return null;
      }

      for (const audioPath of candidatePaths) {
        const audioBuffer = await this._fetchAndDecodeAudio(audioPath);
        if (audioBuffer) {
          this.soundCache.set(cacheKey, audioBuffer);
          return audioBuffer;
        }

        this.failedCache.add(audioPath);
      }

      console.warn(`Audio file not found for ${soundName} (${this.supportedExtensions.join(", ")})`);
      return null;
    } catch (error) {
      console.warn(`Failed to load audio for ${soundName}`, error);
      return null;
    }
  }

  /**
   * Resolve candidate asset paths for a sound name.
   * Prefer explicit manifest when available.
   * @private
   * @param {string} soundName
   * @returns {string[]}
   */
  _candidatePathsForSound(soundName) {
    const entry = this.assetManifest && this.assetManifest[soundName];
    if (entry) {
      return entry;
    }

    return this.supportedExtensions.map((extension) => `audio/sounds/${soundName}.${extension}`);
  }

  /**
   * Fetch and decode a candidate audio file.
   * @param {string} audioPath - Relative path to the audio file
   * @returns {Promise<AudioBuffer|null>} Decoded audio or null when unavailable
   */
  async _fetchAndDecodeAudio(audioPath) {
    try {
      const response = await fetch(audioPath);
      if (!response.ok) {
        return null;
      }

      const arrayBuffer = await response.arrayBuffer();
      return await this.audioContext.decodeAudioData(arrayBuffer);
    } catch (error) {
      console.warn(`Failed to decode audio: ${audioPath}`, error);
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
    this.playTextToSpeech(soundName, onEnd);
  }

  /**
   * Play text-to-speech fallback
   * @param {string} soundName - Sound name to speak
   * @param {Function} onEnd - Callback when sound ends
   */
  playTextToSpeech(soundName, onEnd) {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(soundName);
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      utterance.volume = 0.8;

      utterance.onend = () => {
        if (onEnd) onEnd(soundName);
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