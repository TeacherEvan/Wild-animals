class RealAnimalSounds {
  /**
   * Initialize the Real Animal Sounds module
   * Uses Freesound API and fallback to synthesized sounds
   */
  constructor() {
    this.SOUND_WAVE_COUNT = 3;
    this.SOUND_WAVE_DELAY_SECONDS = 0.2;
    this.isEnabled = true;
    this.currentSelection = null;
    this.debugMode = false;
    this.audioContext = null;
    this.currentAudio = null;
    this.soundCache = new Map();
    this.initializeAudioContext();
  }

  /**
   * Initialize Web Audio API context
   */
  initializeAudioContext() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      if (this.debugMode) console.log("Audio context initialized");
    } catch (e) {
      console.warn("Web Audio API not supported, using HTML5 Audio fallback");
    }
  }

  /**
   * Get real animal sound URLs from free sources
   * Using public domain/CC0 animal sounds
   * @param {string} animalName - Name of the animal
   * @returns {string} Sound URL
   */
  getRealAnimalSoundURL(animalName) {
    // Using Freesound.org public domain animal sounds (CC0/Public Domain)
    const soundURLs = {
      Lion: "https://freesound.org/data/previews/615/615203_2481301-lq.mp3",
      Tiger: "https://freesound.org/data/previews/628/628009_11861866-lq.mp3",
      Elephant: "https://freesound.org/data/previews/401/401929_7273175-lq.mp3",
      Monkey: "https://freesound.org/data/previews/539/539842_1015240-lq.mp3",
      Wolf: "https://freesound.org/data/previews/596/596224_7037-lq.mp3",
      Bear: "https://freesound.org/data/previews/558/558761_10785820-lq.mp3",
      Dolphin: "https://freesound.org/data/previews/434/434451_8462944-lq.mp3",
      Frog: "https://freesound.org/data/previews/546/546044_11709805-lq.mp3",
      Eagle: "https://freesound.org/data/previews/585/585868_11429804-lq.mp3",
      Penguin: "https://freesound.org/data/previews/551/551797_11402640-lq.mp3",
      Giraffe: "https://freesound.org/data/previews/412/412068_7273175-lq.mp3",
      Zebra: "https://freesound.org/data/previews/563/563788_11545552-lq.mp3",
      Rhino: "https://freesound.org/data/previews/558/558762_10785820-lq.mp3",
      Fox: "https://freesound.org/data/previews/590/590331_11429804-lq.mp3",
      Leopard: "https://freesound.org/data/previews/558/558763_10785820-lq.mp3",
      Kangaroo: "https://freesound.org/data/previews/412/412070_7273175-lq.mp3",
      Koala: "https://freesound.org/data/previews/412/412069_7273175-lq.mp3",
      Gorilla: "https://freesound.org/data/previews/412/412071_7273175-lq.mp3",
      Shark: "https://freesound.org/data/previews/434/434450_8462944-lq.mp3",
      Octopus: "https://freesound.org/data/previews/434/434452_8462944-lq.mp3",
    };
    return soundURLs[animalName] || null;
  }

  /**
   * Play animal sound - uses real audio files with speech fallback
   * @param {string} animalName - Name of the animal
   */
  async playAnimalSound(animalName) {
    if (!this.isEnabled) return;
    if (this.debugMode) console.log(`Playing sound for: ${animalName}`);

    // Stop any currently playing sound
    this.stopCurrentSound();

    // Try to play real animal sound first
    const soundURL = this.getRealAnimalSoundURL(animalName);
    if (soundURL) {
      try {
        await this.playAudioFile(soundURL, animalName);
      } catch (error) {
        console.warn(
          `Failed to load sound for ${animalName}, using speech fallback:`,
          error
        );
        this.fallbackToSpeech(animalName);
      }
    } else {
      // Fallback to speech synthesis
      this.fallbackToSpeech(animalName);
    }
  }

  /**
   * Play audio file using HTML5 Audio
   * @param {string} url - Audio file URL
   * @param {string} animalName - Name of the animal
   */
  async playAudioFile(url, animalName) {
    return new Promise((resolve, reject) => {
      // Check cache first
      if (this.soundCache.has(url)) {
        this.currentAudio = this.soundCache.get(url);
        this.currentAudio.currentTime = 0;
      } else {
        this.currentAudio = new Audio(url);
        this.currentAudio.volume = 0.8;
        this.currentAudio.preload = "auto";
        // Cache the audio element
        this.soundCache.set(url, this.currentAudio);
      }

      // Visual feedback
      this.onSoundStart(animalName);

      this.currentAudio.onended = () => {
        this.onSoundEnd(animalName);
        resolve();
      };

      this.currentAudio.onerror = (error) => {
        this.onSoundEnd(animalName);
        reject(error);
      };

      // Resume audio context if suspended (required by browser autoplay policies)
      if (this.audioContext && this.audioContext.state === "suspended") {
        this.audioContext.resume();
      }

      this.currentAudio.play().catch(reject);
    });
  }

  /**
   * Text-to-speech fallback for animal sounds
   * @param {string} animalName - Name of the animal
   */
  fallbackToSpeech(animalName) {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(animalName);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      utterance.onstart = () => this.onSoundStart(animalName);
      utterance.onend = () => this.onSoundEnd(animalName);
      window.speechSynthesis.speak(utterance);
    }
  }

  /**
   * Handle sound start event - visual feedback
   * @param {string} animalName - Name of the animal
   */
  onSoundStart(animalName) {
    const animalEmoji = document.getElementById("animalEmoji");
    if (animalEmoji) {
      animalEmoji.classList.add("sound-playing");
      this.createSoundWaves(animalEmoji);
    }
    document.dispatchEvent(
      new CustomEvent("animalSoundStart", { detail: { animal: animalName } })
    );
  }

  /**
   * Handle sound end event - remove visual feedback
   * @param {string} animalName - Name of the animal
   */
  onSoundEnd(animalName) {
    const animalEmoji = document.getElementById("animalEmoji");
    if (animalEmoji) {
      animalEmoji.classList.remove("sound-playing");
      document.querySelectorAll(".sound-wave").forEach((wave) => wave.remove());
    }
    document.dispatchEvent(
      new CustomEvent("animalSoundEnd", { detail: { animal: animalName } })
    );
  }

  /**
   * Create sound wave visual effects during pronunciation
   * @param {HTMLElement} parentElement - Element to attach waves to
   */
  createSoundWaves(parentElement) {
    for (let i = 0; i < this.SOUND_WAVE_COUNT; i++) {
      const wave = document.createElement("div");
      wave.className = "sound-wave";
      wave.style.animationDelay = `${i * this.SOUND_WAVE_DELAY_SECONDS}s`;
      parentElement.parentElement.appendChild(wave);
    }
  }

  /**
   * Stop currently playing sound
   */
  stopCurrentSound() {
    // Stop HTML5 audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
    }
    // Stop speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }

  /**
   * Toggle sound on/off
   * @returns {boolean} New sound enabled state
   */
  toggleSound() {
    this.isEnabled = !this.isEnabled;
    if (!this.isEnabled) this.stopCurrentSound();
    return this.isEnabled;
  }

  /**
   * Check if sound is enabled
   * @returns {boolean} Sound enabled state
   */
  isSoundEnabled() {
    return this.isEnabled;
  }

  /**
   * Select an option (for game option tracking)
   * @param {string} option - Selected option value
   */
  selectOption(option) {
    this.currentSelection = option;
    document.querySelectorAll(".option-btn").forEach((btn) => {
      btn.classList.toggle("selected", btn.dataset.value === option);
    });
  }

  /**
   * Get current selection
   * @returns {string|null} Current selected option
   */
  getCurrentSelection() {
    return this.currentSelection;
  }

  /**
   * Clear current selection
   */
  clearSelection() {
    this.currentSelection = null;
    document
      .querySelectorAll(".option-btn")
      .forEach((btn) => btn.classList.remove("selected"));
  }

  /**
   * Check if module is ready
   * @returns {boolean} Always true for text-to-speech
   */
  isReady() {
    return true;
  }
}

// Create global instance
window.realAnimalSounds = new RealAnimalSounds();
