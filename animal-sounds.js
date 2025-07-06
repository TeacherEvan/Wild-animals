// Animal Sounds Module - Text-to-Speech Pronunciation
class AnimalSounds {
    constructor() {
        this.isEnabled = true;
        this.currentSelection = null;
        this.speechSynthesis = window.speechSynthesis;
        this.voices = [];
        // Fallback flag for TTS availability
        this.speechSupported = !!this.speechSynthesis;

        // NEW: mapping of animal names to audio file URLs (place files in ./sounds or use remote links)
        this.soundMap = {
            // Using Mixkit and Pixabay CDN links (royalty-free, no attribution required)
            Lion: 'https://assets.mixkit.co/sfx/preview/mixkit-wild-lion-animal-roar-6.mp3',
            Tiger: 'https://assets.mixkit.co/sfx/preview/mixkit-wild-lion-animal-roar-6.mp3', // placeholder
            Elephant: 'https://assets.mixkit.co/sfx/preview/mixkit-elephant-blowing-water-1452.mp3',
            Bear: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_a6a1430e72.mp3?filename=angry-bear-110521.mp3',
            Wolf: 'https://assets.mixkit.co/sfx/preview/mixkit-wolf-howler-45.mp3',
            Fox: 'https://cdn.pixabay.com/download/audio/2021/09/20/audio_6b05b4f07e.mp3?filename=fox-bark-7074.mp3',
            Monkey: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_ae684fbc32.mp3?filename=monkey-110527.mp3',
            Dolphin: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_7a6db4fccd.mp3?filename=dolphin-110525.mp3',
            Eagle: 'https://cdn.pixabay.com/download/audio/2021/11/30/audio_ff1aa8b0d8.mp3?filename=eagle-scream-9259.mp3',
            Frog: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_ea996a96f2.mp3?filename=frog-croaking-110526.mp3',
            Zebra: 'https://cdn.pixabay.com/download/audio/2022/07/20/audio_f033f25e76.mp3?filename=zebra-bray-112087.mp3'
        };

        // Holds currently playing Audio object so we can stop it if needed
        this.currentAudio = null;

        // Simple browser audio capability detection (mp3)
        const testAudio = document.createElement('audio');
        this.audioSupported = !!testAudio.canPlayType && testAudio.canPlayType('audio/mpeg') !== '';

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

    // Play animal sound based on name (now prefers real audio, falls back to pronunciation)
    playAnimalSound(animalName) {
        if (!this.isEnabled) return;

        // Stop any previous audio
        if (this.currentAudio) {
            try { this.currentAudio.pause(); } catch (e) {}
            this.currentAudio = null;
        }

        const emojiEl = document.getElementById('animalEmoji');
        if (emojiEl) emojiEl.classList.add('playing');

        const audioUrl = this.soundMap[animalName];

        const cleanupVisual = () => {
            if (emojiEl) emojiEl.classList.remove('playing');
        };

        const playFallbackTTS = () => {
            this.pronounceAnimal(animalName);
            // Remove visual glow when TTS is done
            if (this.speechSynthesis) {
                const timer = setInterval(() => {
                    if (!this.speechSynthesis.speaking) {
                        clearInterval(timer);
                        cleanupVisual();
                    }
                }, 200);
            } else {
                cleanupVisual();
            }
        };

        if (this.audioSupported && audioUrl) {
            this.currentAudio = new Audio(audioUrl);
            // Some browsers block autoplay – play after user interaction only (the app already requires clicks)
            this.currentAudio.play().then(() => {
                this.currentAudio.onended = cleanupVisual;
            }).catch(() => {
                // Playback failed (maybe CORS or autoplay) -> fallback
                playFallbackTTS();
            });
        } else {
            // Fallback to TTS pronunciation
            playFallbackTTS();
        }
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
        if (!this.isEnabled && this.currentAudio) {
            try { this.currentAudio.pause(); } catch (e) {}
            this.currentAudio = null;
        }
        return this.isEnabled;
    }

    // Check if sound is enabled
    isSoundEnabled() {
        return this.isEnabled;
    }
}

// Create global instance
window.animalSounds = new AnimalSounds();
