// Real Animal Sounds Module - Comprehensive Audio System
class RealAnimalSounds {
    constructor() {
        this.isEnabled = true;
        this.currentSelection = null;
        this.audioContext = null;
        this.soundCache = new Map();
        this.isInitialized = false;
        this.initAudioContext();
        this.loadAnimalSounds();
    }

    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isInitialized = true;
        } catch (error) {
            console.warn('Audio context not available, using fallback text-to-speech');
            this.isInitialized = false;
        }
    }

    // Load and cache animal sounds
    loadAnimalSounds() {
        this.animalSoundMap = {
            'Lion': { frequencies: [100, 80, 60, 40], duration: 1.5, type: 'roar' },
            'Tiger': { frequencies: [120, 100, 80, 60], duration: 1.3, type: 'roar' },
            'Elephant': { frequencies: [60, 40, 30, 20], duration: 2.0, type: 'trumpet' },
            'Bear': { frequencies: [80, 60, 40], duration: 1.2, type: 'growl' },
            'Wolf': { frequencies: [200, 150, 100], duration: 2.5, type: 'howl' },
            'Fox': { frequencies: [300, 250, 200], duration: 0.8, type: 'bark' },
            'Monkey': { frequencies: [400, 350, 300, 250], duration: 1.0, type: 'chatter' },
            'Frog': { frequencies: [150, 100, 150], duration: 0.5, type: 'croak' },
            'Dolphin': { frequencies: [800, 1000, 1200], duration: 0.6, type: 'click' },
            'Penguin': { frequencies: [250, 200, 150], duration: 0.8, type: 'squawk' },
            'Eagle': { frequencies: [500, 400, 300], duration: 1.2, type: 'screech' },
            'Zebra': { frequencies: [200, 180, 160], duration: 1.0, type: 'neigh' },
            'Giraffe': { frequencies: [80, 60, 40], duration: 0.7, type: 'hum' },
            'Rhino': { frequencies: [100, 80, 60], duration: 0.8, type: 'snort' },
            'Kangaroo': { frequencies: [120, 100, 80], duration: 0.6, type: 'grunt' },
            'Koala': { frequencies: [150, 120, 100], duration: 0.7, type: 'grunt' },
            'Gorilla': { frequencies: [100, 80, 60], duration: 1.0, type: 'grunt' },
            'Leopard': { frequencies: [110, 90, 70], duration: 1.2, type: 'roar' },
            'Shark': { frequencies: [40, 30, 20], duration: 0.5, type: 'silent' },
            'Octopus': { frequencies: [30, 25, 20], duration: 0.3, type: 'silent' }
        };
    }

    // Create realistic animal sound using Web Audio API
    createAnimalSound(soundConfig) {
        if (!this.audioContext || !this.isInitialized) {
            return this.fallbackTextToSpeech(soundConfig.animal);
        }

        const { frequencies, duration, type } = soundConfig;
        
        // Create different sound types
        switch(type) {
            case 'roar':
                return this.createRoarSound(frequencies, duration);
            case 'howl':
                return this.createHowlSound(frequencies, duration);
            case 'trumpet':
                return this.createTrumpetSound(frequencies, duration);
            case 'bark':
                return this.createBarkSound(frequencies, duration);
            case 'chatter':
                return this.createChatterSound(frequencies, duration);
            case 'croak':
                return this.createCroakSound(frequencies, duration);
            case 'click':
                return this.createClickSound(frequencies, duration);
            case 'screech':
                return this.createScreechSound(frequencies, duration);
            case 'neigh':
                return this.createNeighSound(frequencies, duration);
            case 'grunt':
                return this.createGruntSound(frequencies, duration);
            case 'squawk':
                return this.createSquawkSound(frequencies, duration);
            case 'hum':
                return this.createHumSound(frequencies, duration);
            case 'snort':
                return this.createSnortSound(frequencies, duration);
            default:
                return this.createGenericSound(frequencies, duration);
        }
    }

    createRoarSound(frequencies, duration) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        const filterNode = this.audioContext.createBiquadFilter();
        
        oscillator.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Low-pass filter for growl effect
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(200, this.audioContext.currentTime);
        
        // Frequency modulation for roar
        oscillator.frequency.setValueAtTime(frequencies[0], this.audioContext.currentTime);
        frequencies.forEach((freq, index) => {
            const time = this.audioContext.currentTime + (index * duration / frequencies.length);
            oscillator.frequency.exponentialRampToValueAtTime(freq, time);
        });
        
        // Volume envelope
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.type = 'sawtooth';
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    createHowlSound(frequencies, duration) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Smooth frequency sweep for howl
        oscillator.frequency.setValueAtTime(frequencies[0], this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequencies[1], this.audioContext.currentTime + duration * 0.5);
        oscillator.frequency.exponentialRampToValueAtTime(frequencies[2], this.audioContext.currentTime + duration);
        
        // Volume envelope with sustain
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime + duration * 0.7);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.type = 'sine';
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    createTrumpetSound(frequencies, duration) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Deep, resonant trumpet sound
        oscillator.frequency.setValueAtTime(frequencies[0], this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequencies[1], this.audioContext.currentTime + duration * 0.3);
        oscillator.frequency.exponentialRampToValueAtTime(frequencies[2], this.audioContext.currentTime + duration * 0.7);
        oscillator.frequency.exponentialRampToValueAtTime(frequencies[3], this.audioContext.currentTime + duration);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.4, this.audioContext.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.type = 'square';
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    createBarkSound(frequencies, duration) {
        // Short, sharp bark
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequencies[0], this.audioContext.currentTime);
        
        // Quick attack and decay
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.type = 'square';
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    createChatterSound(frequencies, duration) {
        // Rapid sequence of short sounds
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.02);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                
                oscillator.type = 'sine';
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.1);
            }, index * 100);
        });
    }

    createCroakSound(frequencies, duration) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Frequency modulation for croak
        oscillator.frequency.setValueAtTime(frequencies[0], this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequencies[1], this.audioContext.currentTime + duration * 0.5);
        oscillator.frequency.exponentialRampToValueAtTime(frequencies[2], this.audioContext.currentTime + duration);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.25, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.type = 'square';
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    createClickSound(frequencies, duration) {
        // High frequency clicks for dolphins
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
                
                oscillator.type = 'sine';
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + 0.05);
            }, index * 50);
        });
    }

    createScreechSound(frequencies, duration) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // High pitch screech
        oscillator.frequency.setValueAtTime(frequencies[0], this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequencies[1], this.audioContext.currentTime + duration * 0.3);
        oscillator.frequency.exponentialRampToValueAtTime(frequencies[2], this.audioContext.currentTime + duration);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.type = 'triangle';
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    createNeighSound(frequencies, duration) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Whinny sound
        oscillator.frequency.setValueAtTime(frequencies[0], this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequencies[1], this.audioContext.currentTime + duration * 0.5);
        oscillator.frequency.exponentialRampToValueAtTime(frequencies[2], this.audioContext.currentTime + duration);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.25, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.type = 'sawtooth';
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    createGruntSound(frequencies, duration) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequencies[0], this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.type = 'square';
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    createSquawkSound(frequencies, duration) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Sharp, quick squawk
        oscillator.frequency.setValueAtTime(frequencies[0], this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequencies[1], this.audioContext.currentTime + duration * 0.3);
        oscillator.frequency.exponentialRampToValueAtTime(frequencies[2], this.audioContext.currentTime + duration);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.type = 'triangle';
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    createHumSound(frequencies, duration) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Soft, low hum
        oscillator.frequency.setValueAtTime(frequencies[0], this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.type = 'sine';
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    createSnortSound(frequencies, duration) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        // Short, sharp snort
        oscillator.frequency.setValueAtTime(frequencies[0], this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.type = 'square';
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    createGenericSound(frequencies, duration) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequencies[0], this.audioContext.currentTime);
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.type = 'sine';
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Fallback to text-to-speech when Web Audio API is not available
    fallbackTextToSpeech(animalName) {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(animalName);
            utterance.rate = 0.8;
            utterance.pitch = 1.1;
            utterance.volume = 0.8;
            window.speechSynthesis.speak(utterance);
        } else {
            console.log(`${animalName} sound (text-to-speech not available)`);
        }
    }

    // Main method to play animal sound
    playAnimalSound(animalName) {
        if (!this.isEnabled) return;
        
        try {
            const soundConfig = this.animalSoundMap[animalName];
            if (soundConfig) {
                this.createAnimalSound({ ...soundConfig, animal: animalName });
            } else {
                // Fallback for unknown animals
                this.fallbackTextToSpeech(animalName);
            }
        } catch (error) {
            console.error('Error playing animal sound:', error);
            this.fallbackTextToSpeech(animalName);
        }
    }

    // UI feedback sounds using simple tones
    playUISound(type) {
        if (!this.isEnabled) return;
        
        try {
            if (!this.audioContext || !this.isInitialized) {
                console.log(`UI Sound: ${type}`);
                return;
            }
            
            switch(type) {
                case 'select':
                    this.playSimpleTone(440, 0.2);
                    break;
                case 'correct':
                    this.playMelody([523.25, 659.25, 783.99], 0.2);
                    break;
                case 'incorrect':
                    this.playMelody([220, 196], 0.3);
                    break;
                case 'complete':
                    this.playMelody([523.25, 659.25, 783.99, 1046.5], 0.2);
                    break;
                case 'powerup':
                    this.playMelody([440, 554.37], 0.15);
                    break;
            }
        } catch (error) {
            console.error('Error playing UI sound:', error);
        }
    }

    // Play a simple tone for UI feedback
    playSimpleTone(frequency, duration) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Play a melody for UI feedback
    playMelody(frequencies, noteDuration) {
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playSimpleTone(freq, noteDuration);
            }, index * noteDuration * 1000);
        });
    }

    // Selection management methods
    selectOption(option) {
        this.currentSelection = option;
        this.playUISound('select');
        this.updateSelectionUI(option);
    }

    updateSelectionUI(selectedOption) {
        // Remove previous selection styling
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Add selection styling to current option
        if (selectedOption && selectedOption !== 'TIME_UP') {
            const buttons = document.querySelectorAll('.option-btn');
            buttons.forEach(btn => {
                if (btn.textContent === selectedOption) {
                    btn.classList.add('selected');
                }
            });
        }
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

    // Toggle sound on/off
    toggleSound() {
        this.isEnabled = !this.isEnabled;
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

// Create global instance as realAnimalSounds
window.realAnimalSounds = new RealAnimalSounds();

// Maintain backward compatibility
window.animalSounds = window.realAnimalSounds;
