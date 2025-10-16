// Enhanced Animal Sounds Module - Real Animal Sounds & Interactive Features
class AnimalSounds {
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

    initAudio() {
        // Audio context disabled - only text-to-speech pronunciation allowed
        this.audioContext = null;
        this.isInitialized = false;
        console.log('Audio context disabled - only pronunciation sounds enabled');
    }

    initVoices() {
        if (this.speechSupported) {
            this.loadVoices();
            if (this.speechSynthesis.onvoiceschanged !== undefined) {
                this.speechSynthesis.onvoiceschanged = () => this.loadVoices();
            }
        }
    }

    loadVoices() {
        if (this.speechSupported) {
            this.voices = this.speechSynthesis.getVoices();
            console.log(`Loaded ${this.voices.length} speech synthesis voices`);
        }
    }

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

    handleSwipeRight() {
        // Swipe right to hear animal sound again
        const currentAnimalEmoji = document.getElementById('animalEmoji');
        if (currentAnimalEmoji) {
            this.addScreenShake();
            this.playAnimalSound(window.currentAnimal?.name || 'Lion');
        }
    }

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

    // Enhanced animal sound player - ONLY pronunciation allowed
    playAnimalSound(animalName) {
        if (!this.isEnabled) return;

        console.log(`Playing pronunciation for: ${animalName}`);
        
        // Only play pronunciation - no animal sound effects
        this.pronounceAnimal(animalName);
        
        // Add minimal visual feedback
        this.addAnimalReaction(animalName);
    }

    // Add minimal visual reaction when animal pronunciation is played
    addAnimalReaction(animalName) {
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

    // Screen shake effect - DISABLED (only pronunciation allowed)
    addScreenShake() {
        console.log('Screen shake disabled - only pronunciation allowed');
        // No screen shake - silently ignore
    }

    // Create particle effects for sound - DISABLED (only pronunciation allowed)
    createSoundParticles() {
        console.log('Sound particles disabled - only pronunciation allowed');
        // No sound particles - silently ignore
    }

    // Pronounce animal name using text-to-speech
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

    // Play a simple tone for UI feedback - DISABLED
    playSimpleTone(frequency, duration) {
        console.log(`Simple tone disabled - only pronunciation allowed`);
        // No sound generation - silently ignore
    }

    // Play enhanced tone with better sound quality - DISABLED
    playEnhancedTone(frequency, duration) {
        console.log(`Enhanced tone disabled - only pronunciation allowed`);
        // No sound generation - silently ignore
    }

    // Play a melody for UI feedback - DISABLED
    playMelody(frequencies, noteDuration) {
        console.log(`Melody disabled - only pronunciation allowed`);
        // No sound generation - silently ignore
    }

    // Play success sound (correct answer)
    playSuccessSound() {
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.playEnhancedTone(freq, 0.3);
            }, index * 100);
        });
    }

    // Play error sound (incorrect answer)
    playErrorSound() {
        const notes = [220, 196]; // A3, G3
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.playEnhancedTone(freq, 0.4);
            }, index * 200);
        });
    }

    // Play victory sound (game complete)
    playVictorySound() {
        const melody = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6
        melody.forEach((freq, index) => {
            setTimeout(() => {
                this.playEnhancedTone(freq, 0.25);
            }, index * 120);
        });
    }

    // Play powerup sound
    playPowerupSound() {
        const notes = [440, 554.37, 659.25]; // A4, C#5, E5
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.playEnhancedTone(freq, 0.2);
            }, index * 80);
        });
    }

    // Toggle sound on/off
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

    // Check if sound is enabled
    isSoundEnabled() {
        return this.isEnabled;
    }

    // Method to check if the module is properly initialized
    isReady() {
        return this.isInitialized;
    }
}

// Create global instance and expose under the new namespace
window.realAnimalSounds = new AnimalSounds();

// ---------------------------------------------------------------------------
// Backward-compatibility shim
// ---------------------------------------------------------------------------
// Older game logic (or cached versions) may still reference "window.animalSounds".
// To avoid breaking those calls during/after the migration, alias the new
// implementation to the legacy name **only if it isn't already defined**.
// This keeps a single shared instance and prevents duplicate objects.
if (!window.animalSounds) {
    window.animalSounds = window.realAnimalSounds;
}
