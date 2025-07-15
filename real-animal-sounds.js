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
        // Audio context disabled - only text-to-speech pronunciation allowed
        this.audioContext = null;
        console.log('Audio context disabled - only pronunciation sounds enabled');
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
}

// Create global instance
window.realAnimalSounds = new RealAnimalSounds();