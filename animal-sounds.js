// Animal Sounds Module - Text-to-Speech Pronunciation
class AnimalSounds {
    constructor() {
        this.isEnabled = true;
        this.currentSelection = null;
        this.speechSynthesis = window.speechSynthesis;
        this.voices = [];
        this.initVoices();
    }

    initVoices() {
        // Load available voices
        this.loadVoices();
        
        // Some browsers load voices asynchronously
        if (this.speechSynthesis.onvoiceschanged !== undefined) {
            this.speechSynthesis.onvoiceschanged = () => {
                this.loadVoices();
            };
        }
    }

    loadVoices() {
        this.voices = this.speechSynthesis.getVoices();
        console.log('Available voices:', this.voices.length);
    }

    // Get the best voice for pronunciation (prefer English voices)
    getBestVoice() {
        // Try to find an English voice
        let voice = this.voices.find(v => v.lang.includes('en-US')) ||
                   this.voices.find(v => v.lang.includes('en-GB')) ||
                   this.voices.find(v => v.lang.includes('en')) ||
                   this.voices[0]; // Fallback to first available voice
        
        return voice;
    }

    // Pronounce animal name using text-to-speech
    pronounceAnimal(animalName) {
        if (!this.isEnabled || !this.speechSynthesis) {
            console.log('Speech synthesis not available or disabled');
            return;
        }

        // Cancel any ongoing speech
        this.speechSynthesis.cancel();

        // Create speech utterance
        const utterance = new SpeechSynthesisUtterance(animalName);
        
        // Configure speech settings
        const voice = this.getBestVoice();
        if (voice) {
            utterance.voice = voice;
        }
        
        utterance.rate = 0.8; // Slightly slower for clarity
        utterance.pitch = 1.1; // Slightly higher pitch for child-friendly sound
        utterance.volume = 0.8;
        
        // Add event listeners for debugging
        utterance.onstart = () => {
            console.log(`Speaking: ${animalName}`);
        };
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
        };
        
        // Speak the animal name
        this.speechSynthesis.speak(utterance);
    }

    // Play animal sound based on name (now pronounces the name)
    playAnimalSound(animalName) {
        this.pronounceAnimal(animalName);
    }    // UI feedback sounds using simple tones
    playUISound(type) {
        if (!this.isEnabled) return;
        
        // Create simple beep sounds for UI feedback
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        switch(type) {
            case 'select':
                this.playSimpleTone(audioContext, 440, 0.2);
                break;
            case 'correct':
                this.playMelody(audioContext, [523.25, 659.25, 783.99], 0.2);
                break;
            case 'incorrect':
                this.playMelody(audioContext, [220, 196], 0.3);
                break;
            case 'complete':
                this.playMelody(audioContext, [523.25, 659.25, 783.99, 1046.5], 0.2);
                break;
            case 'powerup':
                this.playMelody(audioContext, [440, 554.37], 0.15);
                break;
        }
    }

    // Play a simple tone for UI feedback
    playSimpleTone(audioContext, frequency, duration) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    }

    // Play a melody for UI feedback
    playMelody(audioContext, frequencies, noteDuration) {
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playSimpleTone(audioContext, freq, noteDuration);
            }, index * noteDuration * 1000);
        });
    }

    // Selection management
    selectOption(option) {
        this.currentSelection = option;
        this.playUISound('select');
        
        // Visual feedback for selection
        this.updateSelectionUI(option);
    }

    updateSelectionUI(selectedOption) {
        // Remove previous selection styling
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Add selection styling to current option
        const buttons = document.querySelectorAll('.option-btn');
        buttons.forEach(btn => {
            if (btn.textContent === selectedOption) {
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

    // Toggle sound on/off
    toggleSound() {
        this.isEnabled = !this.isEnabled;
        return this.isEnabled;
    }

    // Check if sound is enabled
    isSoundEnabled() {
        return this.isEnabled;
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
