/**
 * Enhanced Animal Sounds Module - Text-to-Speech Pronunciation System
 * Provides audio feedback for animal names using browser's speech synthesis API.
 * Note: Audio context and sound effects are disabled - only pronunciation is allowed.
 * 
 * @class AnimalSounds
 */
class AnimalSounds {
    /**
     * Initialize the Animal Sounds module
     * Sets up speech synthesis and touch gesture handlers
     */
    constructor() {
        this.isEnabled = true;
        this.currentSelection = null;
        this.speechSynthesis = window.speechSynthesis;
        this.voices = [];
        // Fallback flag for TTS availability
        this.speechSupported = !!this.speechSynthesis;

        // Audio context disabled - only text-to-speech pronunciation allowed

        this.audioContext = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.initAudio();
        this.initVoices();
        this.initTouchGestures();
    }

    /**
     * Initialize audio system (disabled - only text-to-speech allowed)
     */
    initAudio() {
        // Audio context disabled - only text-to-speech pronunciation allowed
        this.audioContext = null;
        this.isInitialized = false;
        console.log('Audio context disabled - only pronunciation sounds enabled');
    }

    /**
     * Initialize speech synthesis voices
     */
    initVoices() {
        if (this.speechSupported) {
            this.loadVoices();
            if (this.speechSynthesis.onvoiceschanged !== undefined) {
                this.speechSynthesis.onvoiceschanged = () => this.loadVoices();
            }
        }
    }

    /**
     * Load available speech synthesis voices
     */
    loadVoices() {
        if (this.speechSupported) {
            this.voices = this.speechSynthesis.getVoices();
            console.log(`Loaded ${this.voices.length} speech synthesis voices`);
        }
    }

    /**
     * Initialize touch gesture support for mobile devices
     * Handles swipe gestures for replay and skip functionality
     */
    initTouchGestures() {
        // Add touch gesture support for mobile devices
        document.addEventListener('touchstart', (e) => {
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', (e) => {
            if (!this.touchStartX || !this.touchStartY) return;

            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;

            const deltaX = touchEndX - this.touchStartX;
            const deltaY = touchEndY - this.touchStartY;

            // Handle swipe gestures
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 50) {
                    this.handleSwipeRight();
                } else if (deltaX < -50) {
                    this.handleSwipeLeft();
                }
            }

            this.touchStartX = 0;
            this.touchStartY = 0;
        });
    }

    /**
     * Handle swipe right gesture - replay animal sound
     */
    handleSwipeRight() {
        // Swipe right to hear animal sound again
        const currentAnimalEmoji = document.getElementById('animalEmoji');
        if (currentAnimalEmoji) {
            this.addScreenShake();
            this.playAnimalSound(window.currentAnimal?.name || 'Lion');
        }
    }

    /**
     * Handle swipe left gesture - skip to next question
     */
    handleSwipeLeft() {
        // Swipe left to skip to next question (if available)
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn && !nextBtn.disabled) {
            this.playUISound('select');
            nextBtn.click();
        }
    }



    // Create realistic animal sounds using Web Audio API - DISABLED

    // Create roar sound (Lion, Tiger) - DISABLED

    // Create trumpet sound (Elephant)

    // Create growl sound (Bear, Wolf)

    // Create howl sound (Wolf)

    // Create bark sound (Dog)

    // Create meow sound (Cat)

    // Create moo sound (Cow)

    // Create baa sound (Sheep)

    // Create neigh sound (Horse)

    // Create oink sound (Pig)

    // Create cock sound (Rooster)

    // Create quack sound (Duck)

    // Create hoot sound (Owl)

    // Create ribbit sound (Frog)

    // Create chatter sound (Monkey)

    // Create tweet sound (Bird)

    // Create hiss sound (Snake)

    // Create buzz sound (Bee)

    // Create click sound (Dolphin)

    // Create whale sound (Whale)

    /**
     * Enhanced animal sound player - ONLY pronunciation allowed
     * @param {string} animalName - Name of the animal to pronounce
     */
    playAnimalSound(animalName) {
        if (!this.isEnabled) return;

        console.log(`Playing pronunciation for: ${animalName}`);

        // Only play pronunciation - no animal sound effects
        this.pronounceAnimal(animalName);

        // Add minimal visual feedback
        this.addAnimalReaction(animalName);
    }

    /**
     * Add minimal visual reaction when animal pronunciation is played
     * @param {string} animalName - Name of the animal (unused but kept for API compatibility)
     */
    addAnimalReaction(animalName) { // eslint-disable-line no-unused-vars
        const animalEmoji = document.getElementById('animalEmoji');
        if (!animalEmoji) return;

        // Add gentle bounce effect only
        animalEmoji.style.transform = 'scale(1.1)';
        animalEmoji.style.transition = 'transform 0.2s ease';

        // Reset after animation
        setTimeout(() => {
            animalEmoji.style.transform = 'scale(1)';
        }, 200);
    }

    /**
     * Screen shake effect - DISABLED (only pronunciation allowed)
     */
    addScreenShake() {
        // No screen shake - silently ignore
    }

    /**
     * Create particle effects for sound - DISABLED (only pronunciation allowed)
     */
    createSoundParticles() {
        // No sound particles - silently ignore
    }

    /**
     * Pronounce animal name using text-to-speech
     * @param {string} animalName - Name of the animal to pronounce
     */
    pronounceAnimal(animalName) {
        if (!this.isEnabled || !this.speechSynthesis) {
            console.log('Speech synthesis not available or disabled');
            return;
        }

        const utterance = new SpeechSynthesisUtterance(animalName);
        utterance.rate = 0.7; // Slower for kindergarten students
        utterance.pitch = 1.2; // Higher pitch for child-friendly sound
        utterance.volume = 0.8;
        this.speechSynthesis.speak(utterance);
    }









    // Fallback to text-to-speech when Web Audio API is not available

    // UI feedback sounds - DISABLED (only pronunciation allowed)
    playUISound(type) {
        if (!this.isEnabled) return;

        console.log(`UI sound disabled: ${type} - only pronunciation sounds allowed`);
        // No UI sounds - silently ignore
    }

    /**
     * Play a simple tone for UI feedback - DISABLED
     * @param {number} _frequency - Frequency parameter (unused)
     * @param {number} _duration - Duration parameter (unused)
     */
    playSimpleTone(_frequency, _duration) {
        // No sound generation - silently ignore
    }

    /**
     * Play enhanced tone with better sound quality - DISABLED
     * @param {number} _frequency - Frequency parameter (unused)
     * @param {number} _duration - Duration parameter (unused)
     */
    playEnhancedTone(_frequency, _duration) {
        // No sound generation - silently ignore
    }

    /**
     * Play a melody for UI feedback - DISABLED
     * @param {Array<number>} _frequencies - Frequencies array (unused)
     * @param {number} _noteDuration - Note duration parameter (unused)
     */
    playMelody(_frequencies, _noteDuration) {
        // No sound generation - silently ignore
    }

    // Play success sound (correct answer) - DISABLED
    playSuccessSound() {
        console.log('Success sound disabled - only pronunciation allowed');
        // No sound generation - silently ignore
    }

    // Play error sound (incorrect answer) - DISABLED
    playErrorSound() {
        console.log('Error sound disabled - only pronunciation allowed');
        // No sound generation - silently ignore
    }

    // Play victory sound (game complete) - DISABLED
    playVictorySound() {
        console.log('Victory sound disabled - only pronunciation allowed');
        // No sound generation - silently ignore
    }

    // Play powerup sound - DISABLED
    playPowerupSound() {
        console.log('Powerup sound disabled - only pronunciation allowed');
        // No sound generation - silently ignore
    }

    /**
     * Toggle sound on/off
     * @returns {boolean} New sound enabled state
     */
    toggleSound() {
        this.isEnabled = !this.isEnabled;

        // Visual feedback
        const soundBtn = document.getElementById('soundBtn');
        if (soundBtn) {
            soundBtn.style.transform = 'scale(1.1)';
            setTimeout(() => {
                soundBtn.style.transform = 'scale(1)';
            }, 200);
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
     * Method to check if the module is properly initialized
     * @returns {boolean} Initialization state
     */
    isReady() {
        return this.isInitialized;
    }
}

// Create global instance - legacy namespace only
// Note: real-animal-sounds.js creates window.realAnimalSounds
// This file maintains window.animalSounds for backward compatibility
window.animalSounds = new AnimalSounds();
