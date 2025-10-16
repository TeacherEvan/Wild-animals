// Real Animal Sounds Module - Enhanced for Kindergarten Students
class RealAnimalSounds {
    constructor() {
        this.isEnabled = true;
        this.currentAudio = null;
        this.audioCache = {};
        this.isLoading = false;
        this.currentSelection = null; // Track user's selected option

        // Initialize audio context for better control
        this.initAudioContext();

        // Note: Real animal sound CDN URLs removed to avoid blocking issues
        // Using text-to-speech with animal sound descriptions instead
        console.log('Real animal sounds module initialized with text-to-speech fallback');
    }

    initAudioContext() {
        // Audio context disabled - only text-to-speech pronunciation allowed
        this.audioContext = null;
        console.log('Audio context disabled - only pronunciation sounds enabled');
    }

    async playAnimalSound(animalName, options = {}) {
        if (!this.isEnabled) return;

        console.log(`Playing pronunciation for: ${animalName}`);

        // Only play pronunciation - no real animal sounds or CDN audio
        this.fallbackToSpeech(animalName);
    }

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

    createSoundWaves(element) {
        for (let i = 0; i < 3; i++) {
            const wave = document.createElement('div');
            wave.className = 'sound-wave';
            wave.style.animationDelay = `${i * 0.2}s`;
            element.parentElement.appendChild(wave);
        }
    }

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

    // Play UI feedback sounds - DISABLED (only pronunciation allowed)
    playUISound(type) {
        if (!this.isEnabled) return;

        console.log(`UI sound disabled: ${type} - only pronunciation sounds allowed`);
        // No UI sounds - silently ignore
    }

    playMelody(frequencies, duration) {
        console.log(`Melody disabled - only pronunciation sounds allowed`);
        // No sound generation - silently ignore
    }

    toggleSound() {
        this.isEnabled = !this.isEnabled;

        if (!this.isEnabled) {
            this.stopCurrentSound();
        }

        return this.isEnabled;
    }

    isSoundEnabled() {
        return this.isEnabled;
    }

    // Selection management methods for game logic
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

    getCurrentSelection() {
        return this.currentSelection;
    }

    clearSelection() {
        this.currentSelection = null;
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
    }

    // Additional methods for API compatibility with AnimalSounds class
    pronounceAnimal(animalName) {
        // Delegate to playAnimalSound for consistency
        this.fallbackToSpeech(animalName);
    }

    playSuccessSound() {
        console.log('Success sound disabled - only pronunciation allowed');
    }

    playErrorSound() {
        console.log('Error sound disabled - only pronunciation allowed');
    }

    playVictorySound() {
        console.log('Victory sound disabled - only pronunciation allowed');
    }

    playPowerupSound() {
        console.log('Powerup sound disabled - only pronunciation allowed');
    }

    addAnimalReaction(animalName) {
        // Add visual feedback when animal is pronounced
        const animalEmoji = document.getElementById('animalEmoji');
        if (!animalEmoji) return;

        animalEmoji.style.transform = 'scale(1.1)';
        animalEmoji.style.transition = 'transform 0.2s ease';

        setTimeout(() => {
            animalEmoji.style.transform = 'scale(1)';
        }, 200);
    }

    addScreenShake() {
        console.log('Screen shake disabled - only pronunciation allowed');
    }

    createSoundParticles() {
        console.log('Sound particles disabled - only pronunciation allowed');
    }

    isReady() {
        return true; // Always ready for text-to-speech
    }
}

// Create global instance
window.realAnimalSounds = new RealAnimalSounds();