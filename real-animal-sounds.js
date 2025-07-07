// Real Animal Sounds Module - Enhanced for Kindergarten Students
class RealAnimalSounds {
    constructor() {
        this.isEnabled = true;
        this.currentAudio = null;
        this.audioCache = {};
        this.isLoading = false;
        
        // Real animal sound URLs from CDN (using placeholder URLs - replace with actual CDN links)
        this.animalSounds = {
            'Lion': {
                soundUrl: 'https://cdn.freesound.org/previews/316/316920_5123451-lq.mp3',
                duration: 3000,
                description: 'Powerful roar'
            },
            'Tiger': {
                soundUrl: 'https://cdn.freesound.org/previews/372/372577_6988871-lq.mp3',
                duration: 2500,
                description: 'Deep growl'
            },
            'Elephant': {
                soundUrl: 'https://cdn.freesound.org/previews/457/457838_9499683-lq.mp3',
                duration: 3500,
                description: 'Trumpet call'
            },
            'Monkey': {
                soundUrl: 'https://cdn.freesound.org/previews/403/403006_5837110-lq.mp3',
                duration: 2000,
                description: 'Playful chatter'
            },
            'Wolf': {
                soundUrl: 'https://cdn.freesound.org/previews/415/415209_5837110-lq.mp3',
                duration: 4000,
                description: 'Haunting howl'
            },
            'Bear': {
                soundUrl: 'https://cdn.freesound.org/previews/416/416733_5837110-lq.mp3',
                duration: 2500,
                description: 'Deep growl'
            },
            'Dolphin': {
                soundUrl: 'https://cdn.freesound.org/previews/14/14607_71257-lq.mp3',
                duration: 2000,
                description: 'Happy clicks'
            },
            'Frog': {
                soundUrl: 'https://cdn.freesound.org/previews/540/540964_11795227-lq.mp3',
                duration: 1500,
                description: 'Ribbit ribbit'
            },
            'Eagle': {
                soundUrl: 'https://cdn.freesound.org/previews/409/409035_5837110-lq.mp3',
                duration: 2000,
                description: 'Majestic cry'
            },
            'Penguin': {
                soundUrl: 'https://cdn.freesound.org/previews/450/450622_5837110-lq.mp3',
                duration: 2500,
                description: 'Funny waddle sound'
            }
        };

        // Initialize audio context for better control
        this.initAudioContext();
        
        // Preload common sounds
        this.preloadSounds(['Lion', 'Tiger', 'Elephant', 'Monkey']);
    }

    initAudioContext() {
        if (window.AudioContext || window.webkitAudioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    async preloadSounds(animalNames) {
        for (const animal of animalNames) {
            if (this.animalSounds[animal]) {
                await this.loadSound(animal);
            }
        }
    }

    async loadSound(animalName) {
        if (this.audioCache[animalName]) {
            return this.audioCache[animalName];
        }

        const soundData = this.animalSounds[animalName];
        if (!soundData) {
            console.warn(`No sound available for ${animalName}`);
            return null;
        }

        try {
            const audio = new Audio(soundData.soundUrl);
            audio.preload = 'auto';
            
            // Create a promise that resolves when the audio is loaded
            await new Promise((resolve, reject) => {
                audio.addEventListener('canplaythrough', resolve, { once: true });
                audio.addEventListener('error', reject, { once: true });
                
                // Timeout after 5 seconds
                setTimeout(() => reject(new Error('Audio load timeout')), 5000);
            });

            this.audioCache[animalName] = audio;
            return audio;
        } catch (error) {
            console.error(`Failed to load sound for ${animalName}:`, error);
            return null;
        }
    }

    async playAnimalSound(animalName, options = {}) {
        if (!this.isEnabled) return;

        // Stop current sound if playing
        this.stopCurrentSound();

        // Show loading indicator
        this.showSoundLoading(animalName);

        try {
            // Try to play real animal sound first
            let audio = this.audioCache[animalName];
            
            if (!audio) {
                audio = await this.loadSound(animalName);
            }

            if (audio) {
                // Clone the audio to allow multiple plays
                this.currentAudio = audio.cloneNode();
                this.currentAudio.volume = options.volume || 0.7;
                
                // Add visual feedback during playback
                this.currentAudio.addEventListener('play', () => {
                    this.onSoundStart(animalName);
                });
                
                this.currentAudio.addEventListener('ended', () => {
                    this.onSoundEnd(animalName);
                });

                await this.currentAudio.play();
            } else {
                // Fallback to text-to-speech if real sound not available
                this.fallbackToSpeech(animalName);
            }
        } catch (error) {
            console.error('Error playing sound:', error);
            this.fallbackToSpeech(animalName);
        } finally {
            this.hideSoundLoading();
        }
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

    showSoundLoading(animalName) {
        const loadingDiv = document.createElement('div');
        loadingDiv.id = 'sound-loading';
        loadingDiv.className = 'sound-loading';
        loadingDiv.innerHTML = `
            <div class="loading-spinner"></div>
            <p>Loading ${animalName} sound...</p>
        `;
        document.body.appendChild(loadingDiv);
    }

    hideSoundLoading() {
        const loadingDiv = document.getElementById('sound-loading');
        if (loadingDiv) {
            loadingDiv.remove();
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

    // Play UI feedback sounds
    playUISound(type) {
        if (!this.isEnabled) return;
        
        const frequencies = {
            'select': [440, 550],
            'correct': [523, 659, 784, 1047],
            'incorrect': [220, 196, 174],
            'complete': [523, 659, 784, 880, 1047],
            'powerup': [440, 554, 659],
            'hint': [659, 784, 880]
        };

        if (frequencies[type]) {
            this.playMelody(frequencies[type], 0.15);
        }
    }

    playMelody(frequencies, duration) {
        if (!this.audioContext) return;

        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
            }, index * duration * 1000);
        });
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
}

// Create global instance
window.realAnimalSounds = new RealAnimalSounds();