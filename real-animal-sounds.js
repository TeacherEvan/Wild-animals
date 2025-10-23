/**
 * Real Animal Sounds Module - Enhanced for Kindergarten Students
 * Provides text-to-speech pronunciation with animal sound descriptions
 * Note: Real animal sound CDN URLs removed to avoid blocking issues
 * 
 * @class RealAnimalSounds
 */
class RealAnimalSounds {
    /**
     * Initialize the Real Animal Sounds module
     */
    constructor() {
        this.isEnabled = true;
        this.currentAudio = null;
        this.audioCache = {};
        this.isLoading = false;
        this.currentSelection = null; // Track user's selected option
        this.debugMode = false; // Set to true for verbose logging

        // Initialize audio context for better control
        this.initAudioContext();

        // Note: Real animal sound CDN URLs removed to avoid blocking issues
        // Using text-to-speech with animal sound descriptions instead
        if (this.debugMode) {
            console.log('Real animal sounds module initialized with text-to-speech fallback');
        }
    }

    /**
     * Initialize audio context (disabled - only text-to-speech allowed)
     */
    initAudioContext() {
        // Audio context disabled - only text-to-speech pronunciation allowed
        this.audioContext = null;
        if (this.debugMode) {
            console.log('Audio context disabled - only pronunciation sounds enabled');
        }
    }

    /**
     * Play animal sound with options
     * @param {string} animalName - Name of the animal
     * @param {Object} _options - Options object (unused)
     */
    async playAnimalSound(animalName, _options = {}) {
        if (!this.isEnabled) return;

        if (this.debugMode) {
            console.log(`Playing pronunciation for: ${animalName}`);
        }

        // Only play pronunciation - no real animal sounds or CDN audio
        this.fallbackToSpeech(animalName);
    }

    /**
     * Fallback to speech synthesis for animal sounds
     * @param {string} animalName - Name of the animal
     */
    fallbackToSpeech(animalName) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(`${animalName} says ${this.getAnimalOnomatopoeia(animalName)}`);
            utterance.rate = 0.8;
            utterance.pitch = 1.1;
            utterance.volume = 0.8;

            utterance.onstart = () => this.onSoundStart(animalName);
            utterance.onend = () => this.onSoundEnd(animalName);

            window.speechSynthesis.speak(utterance);
        }
    }

    /**
     * Get animal sound onomatopoeia
     * @param {string} animalName - Name of the animal
     * @returns {string} Sound description
     */
    getAnimalOnomatopoeia(animalName) {
        const sounds = {
            'Lion': 'roar',
            'Tiger': 'roar',
            'Elephant': 'trumpet',
            'Monkey': 'ooh ooh ah ah',
            'Wolf': 'howl',
            'Bear': 'growl',
            'Dolphin': 'click click',
            'Frog': 'ribbit ribbit',
            'Eagle': 'screech',
            'Penguin': 'waddle waddle',
            'Giraffe': 'hum',
            'Zebra': 'neigh',
            'Rhino': 'snort',
            'Fox': 'yip yip',
            'Leopard': 'growl',
            'Kangaroo': 'grunt',
            'Koala': 'snore',
            'Gorilla': 'hoo hoo',
            'Shark': 'splash',
            'Octopus': 'whoosh'
        };
        return sounds[animalName] || 'sound';
    }

    /**
     * Handle sound start event
     * @param {string} animalName - Name of the animal
     */
    onSoundStart(animalName) {
        // Add visual feedback when sound starts
        const animalEmoji = document.getElementById('animalEmoji');
        if (animalEmoji) {
            animalEmoji.classList.add('sound-playing');

            // Add sound waves animation
            this.createSoundWaves(animalEmoji);
        }

        // Trigger custom event
        document.dispatchEvent(new CustomEvent('animalSoundStart', {
            detail: { animal: animalName }
        }));
    }

    /**
     * Handle sound end event
     * @param {string} animalName - Name of the animal
     */
    onSoundEnd(animalName) {
        // Remove visual feedback when sound ends
        const animalEmoji = document.getElementById('animalEmoji');
        if (animalEmoji) {
            animalEmoji.classList.remove('sound-playing');

            // Remove sound waves
            const waves = document.querySelectorAll('.sound-wave');
            waves.forEach(wave => wave.remove());
        }

        // Trigger custom event
        document.dispatchEvent(new CustomEvent('animalSoundEnd', {
            detail: { animal: animalName }
        }));
    }

    /**
     * Create sound wave visual effects
     * @param {HTMLElement} element - Element to attach waves to
     */
    createSoundWaves(element) {
        for (let i = 0; i < 3; i++) {
            const wave = document.createElement('div');
            wave.className = 'sound-wave';
            wave.style.animationDelay = `${i * 0.2}s`;
            element.parentElement.appendChild(wave);
        }
    }

    /**
     * Stop currently playing sound
     */
    stopCurrentSound() {
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
            this.currentAudio = null;
        }

        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }

    /**
     * Play UI feedback sounds - DISABLED (only pronunciation allowed)
     * @param {string} _type - Sound type (unused)
     */
    playUISound(_type) {
        // No UI sounds - silently ignore
    }

    /**
     * Play melody - DISABLED (only pronunciation sounds allowed)
     * @param {Array<number>} _frequencies - Frequencies array (unused)
     * @param {number} _duration - Duration parameter (unused)
     */
    playMelody(_frequencies, _duration) {
        // No sound generation - silently ignore
    }

    /**
     * Toggle sound on/off
     * @returns {boolean} New sound enabled state
     */
    toggleSound() {
        this.isEnabled = !this.isEnabled;

        if (!this.isEnabled) {
            this.stopCurrentSound();
        }

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
     * Select an option in the game
     * @param {string} option - Selected option value
     */
    selectOption(option) {
        this.currentSelection = option;

        // Add visual feedback to selected option
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        const buttons = document.querySelectorAll('.option-btn');
        buttons.forEach(btn => {
            if (btn.dataset.value === option) {
                btn.classList.add('selected');
            }
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
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }

    /**
     * Additional methods for API compatibility with AnimalSounds class
     * Pronounce animal name
     * @param {string} animalName - Name of the animal
     */
    pronounceAnimal(animalName) {
        // Delegate to playAnimalSound for consistency
        this.fallbackToSpeech(animalName);
    }

    /**
     * Play success sound - DISABLED
     */
    playSuccessSound() {
        // No sound generation - silently ignore
    }

    /**
     * Play error sound - DISABLED
     */
    playErrorSound() {
        // No sound generation - silently ignore
    }

    /**
     * Play victory sound - DISABLED
     */
    playVictorySound() {
        // No sound generation - silently ignore
    }

    /**
     * Play powerup sound - DISABLED
     */
    playPowerupSound() {
        // No sound generation - silently ignore
    }

    /**
     * Add animal reaction visual effect
     * @param {string} _animalName - Name of the animal (unused but kept for API compatibility)
     */
    addAnimalReaction(_animalName) {
        // Add visual feedback when animal is pronounced
        const animalEmoji = document.getElementById('animalEmoji');
        if (!animalEmoji) return;

        animalEmoji.style.transform = 'scale(1.1)';
        animalEmoji.style.transition = 'transform 0.2s ease';

        setTimeout(() => {
            animalEmoji.style.transform = 'scale(1)';
        }, 200);
    }

    /**
     * Add screen shake - DISABLED
     */
    addScreenShake() {
        // No screen shake - silently ignore
    }

    /**
     * Create sound particles - DISABLED
     */
    createSoundParticles() {
        // No sound particles - silently ignore
    }

    /**
     * Check if module is ready
     * @returns {boolean} Always true for text-to-speech
     */
    isReady() {
        return true; // Always ready for text-to-speech
    }
}

// Create global instance
window.realAnimalSounds = new RealAnimalSounds();