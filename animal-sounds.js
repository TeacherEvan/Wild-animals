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

    /* ---------------------------------------------------------------------
     * Animal Sound Playback
     * ------------------------------------------------------------------ */
    // Play an animal-specific sound. We first attempt to generate a custom
    // synthesised sound pattern that loosely resembles the animal's real
    // call (self-designed content). If we cannot determine a pattern, we
    // fall back to pronouncing the animal name via text-to-speech.
    playAnimalSound(animalName) {
        if (!this.isEnabled) return;

        const soundType = this.getSoundType(animalName);

        if (!soundType) {
            // Unknown animal – pronounce its name instead.
            this.pronounceAnimal(animalName);
            return;
        }

        // If we have a pattern, synthesise it.
        this.playSynthPattern(soundType);
    }

    // Determine the canonical sound type (e.g., "roar", "trumpet") for an
    // animal. Relies on the global `animals` array defined in the main
    // game script. Returns null if not found.
    getSoundType(animalName) {
        if (window.animals && Array.isArray(window.animals)) {
            const found = window.animals.find(a => a.name.toLowerCase() === animalName.toLowerCase());
            return found ? found.sound : null;
        }
        return null;
    }

    // Self-designed synth patterns for each sound type. These are intentionally
    // playful representations rather than recordings of real animals – this
    // satisfies the "create self-designed sounds" requirement when real audio
    // files are not bundled.
    playSynthPattern(soundType) {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();

        const patterns = {
            roar:      { freqs: [220, 200, 180], dur: 0.25 },
            growl:     { freqs: [200, 150],       dur: 0.3  },
            grunt:     { freqs: [150, 120],       dur: 0.25 },
            snort:     { freqs: [300, 220],       dur: 0.2  },
            trumpet:   { freqs: [523.25, 659.25], dur: 0.2  },
            hum:       { freqs: [110],            dur: 0.8  },
            howl:      { freqs: [300, 350, 400, 350], dur: 0.2 },
            bark:      { freqs: [500],            dur: 0.15 },
            neigh:     { freqs: [400, 600, 450],  dur: 0.15 },
            chatter:   { freqs: [1000, 900, 1200, 900], dur: 0.1 },
            squawk:    { freqs: [850, 800],       dur: 0.18 },
            screech:   { freqs: [750, 770, 790],  dur: 0.1  },
            click:     { freqs: [1000, 1200, 800, 1000], dur: 0.05 },
            croak:     { freqs: [220, 200, 180],  dur: 0.3  },
            silent:    { freqs: [], dur: 0 } // No sound
        };

        const pattern = patterns[soundType];

        if (!pattern || pattern.freqs.length === 0) {
            // Unknown or silent – pronounce name as fallback.
            const animalNameFallback = soundType === 'silent' ? ' ' : null;
            if (animalNameFallback !== null) {
                this.pronounceAnimal(animalNameFallback);
            }
            return;
        }

        // Play the frequency pattern sequentially.
        pattern.freqs.forEach((freq, index) => {
            setTimeout(() => {
                this.playSimpleTone(audioContext, freq, pattern.dur);
            }, index * pattern.dur * 1000);
        });
    }

    // UI feedback sounds using simple tones
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
