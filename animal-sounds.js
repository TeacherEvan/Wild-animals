// Enhanced Animal Sounds Module - Consolidated Version
class AnimalSounds {
    constructor() {
        this.isEnabled = true;
        this.currentSelection = null;
        this.currentAudio = null;
        this.speechSynthesis = window.speechSynthesis;
        this.voices = [];
        this.audioContext = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.isInitialized = false;
        
        // Real animal sound URLs (using free CDN resources)
        this.soundMap = {
            Lion: 'https://cdn.pixabay.com/audio/2021/08/09/audio_0625c1539c.mp3',
            Tiger: 'https://cdn.pixabay.com/audio/2022/03/15/audio_ff1aa8b0d8.mp3',
            Elephant: 'https://cdn.pixabay.com/audio/2021/08/09/audio_12b0c7a05e.mp3',
            Bear: 'https://cdn.pixabay.com/audio/2022/03/15/audio_a6a1430e72.mp3',
            Wolf: 'https://cdn.pixabay.com/audio/2021/08/09/audio_ef1e628d96.mp3',
            Fox: 'https://cdn.pixabay.com/audio/2021/09/20/audio_6b05b4f07e.mp3',
            Monkey: 'https://cdn.pixabay.com/audio/2022/03/15/audio_ae684fbc32.mp3',
            Dolphin: 'https://cdn.pixabay.com/audio/2022/03/15/audio_7a6db4fccd.mp3',
            Eagle: 'https://cdn.pixabay.com/audio/2021/11/30/audio_ff1aa8b0d8.mp3',
            Frog: 'https://cdn.pixabay.com/audio/2022/03/15/audio_ea996a96f2.mp3'
        };

        // Animal sound configurations for Web Audio API fallback
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

        this.initAudio();
        this.initVoices();
        this.initTouchGestures();
        this.loadAnimalSounds();
    }

    initAudio() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.isInitialized = true;
            
            // Resume audio context for Chrome autoplay policy
            if (this.audioContext.state === 'suspended') {
                document.addEventListener('click', () => {
                    this.audioContext.resume();
                }, { once: true });
            }
        } catch (error) {
            console.log('Web Audio API not supported, using fallback');
            this.isInitialized = false;
        }
    }

    initVoices() {
        if (this.speechSynthesis) {
            this.voices = this.speechSynthesis.getVoices();
            this.speechSynthesis.onvoiceschanged = () => {
                this.voices = this.speechSynthesis.getVoices();
            };
        }
    }

    loadAnimalSounds() {
        // Preload some common animal sounds
        const commonAnimals = ['Lion', 'Tiger', 'Elephant', 'Bear'];
        commonAnimals.forEach(animal => {
            if (this.soundMap[animal]) {
                const audio = new Audio(this.soundMap[animal]);
                audio.preload = 'auto';
            }
        });
    }

    initTouchGestures() {
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
        const currentAnimalEmoji = document.getElementById('animalEmoji');
        if (currentAnimalEmoji) {
            this.addScreenShake();
            this.playAnimalSound(window.currentAnimal?.name || 'Lion');
        }
    }

    handleSwipeLeft() {
        const nextBtn = document.getElementById('nextBtn');
        if (nextBtn && !nextBtn.disabled) {
            this.playUISound('select');
            nextBtn.click();
        }
    }

    // Main method to play animal sounds
    playAnimalSound(animalName) {
        if (!this.isEnabled) return;

        // Stop any current audio
        if (this.currentAudio) {
            this.currentAudio.pause();
            this.currentAudio.currentTime = 0;
        }

        // Add visual feedback
        this.addAnimalReaction(animalName);

        // Try to play real animal sound first
        const soundUrl = this.soundMap[animalName];
        if (soundUrl) {
            this.currentAudio = new Audio(soundUrl);
            this.currentAudio.volume = 0.7;
            
            // Set onended callback BEFORE calling play() to prevent race condition
            this.currentAudio.onended = () => {
                this.pronounceAnimal(animalName);
            };
            
            const playPromise = this.currentAudio.play();
            
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    // Sound played successfully - onended callback already set
                }).catch(error => {
                    console.log('Audio playback failed, using fallback:', error);
                    this.fallbackToSynthesis(animalName);
                });
            } else {
                // Older browsers - onended callback is already set above
                // Audio will play and trigger the callback when finished
            }
        } else {
            // No audio file available, use synthesis
            this.fallbackToSynthesis(animalName);
        }
    }

    fallbackToSynthesis(animalName) {
        // Use Web Audio API to create synthetic sound
        if (this.audioContext && this.isInitialized) {
            const soundConfig = this.animalSoundMap[animalName];
            if (soundConfig) {
                this.createAnimalSound(soundConfig);
            }
        }
        
        // Also pronounce the animal name
        setTimeout(() => {
            this.pronounceAnimal(animalName);
        }, 1000);
    }

    createAnimalSound(soundConfig) {
        const { frequencies, duration, type } = soundConfig;
        
        switch(type) {
            case 'roar':
                this.createRoarSound(frequencies, duration);
                break;
            case 'howl':
                this.createHowlSound(frequencies, duration);
                break;
            case 'trumpet':
                this.createTrumpetSound(frequencies, duration);
                break;
            case 'bark':
                this.createBarkSound(frequencies, duration);
                break;
            case 'chatter':
                this.createChatterSound(frequencies, duration);
                break;
            case 'croak':
                this.createCroakSound(frequencies, duration);
                break;
            case 'click':
                this.createClickSound(frequencies, duration);
                break;
            case 'screech':
                this.createScreechSound(frequencies, duration);
                break;
            case 'neigh':
                this.createNeighSound(frequencies, duration);
                break;
            case 'grunt':
                this.createGruntSound(frequencies, duration);
                break;
            case 'squawk':
                this.createSquawkSound(frequencies, duration);
                break;
            case 'hum':
                this.createHumSound(frequencies, duration);
                break;
            case 'snort':
                this.createSnortSound(frequencies, duration);
                break;
            default:
                this.createGenericSound(frequencies, duration);
        }
    }

    createRoarSound(frequencies, duration) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequencies[0], this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequencies[1], this.audioContext.currentTime + duration);
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    createHowlSound(frequencies, duration) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequencies[0], this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequencies[1], this.audioContext.currentTime + duration * 0.5);
        oscillator.frequency.exponentialRampToValueAtTime(frequencies[2], this.audioContext.currentTime + duration);
        
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
        
        oscillator.frequency.setValueAtTime(frequencies[0], this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequencies[1], this.audioContext.currentTime + duration);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    createBarkSound(frequencies, duration) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequencies[0], this.audioContext.currentTime);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    createChatterSound(frequencies, duration) {
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.02);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
                
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
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(freq, this.audioContext.currentTime);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.05);
                
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
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    createSquawkSound(frequencies, duration) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
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
        
        oscillator.frequency.setValueAtTime(frequencies[0], this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    createSnortSound(frequencies, duration) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequencies[0], this.audioContext.currentTime);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    createGenericSound(frequencies, duration) {
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequencies[0], this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Text-to-speech for animal names
    pronounceAnimal(animalName) {
        if (!this.isEnabled || !this.speechSynthesis) return;

        const utterance = new SpeechSynthesisUtterance(animalName);
        utterance.rate = 0.7;
        utterance.pitch = 1.2;
        utterance.volume = 0.8;
        
        // Find a suitable voice
        const voices = this.speechSynthesis.getVoices();
        const englishVoice = voices.find(voice => voice.lang.includes('en'));
        if (englishVoice) {
            utterance.voice = englishVoice;
        }
        
        this.speechSynthesis.speak(utterance);
    }

    // Visual feedback methods
    addAnimalReaction(animalName) {
        const animalEmoji = document.getElementById('animalEmoji');
        if (!animalEmoji) return;

        animalEmoji.style.transform = 'scale(1.2)';
        animalEmoji.style.transition = 'transform 0.3s ease';
        
        this.addScreenShake();
        this.createSoundParticles();
        
        setTimeout(() => {
            animalEmoji.style.transform = 'scale(1)';
        }, 300);
    }

    addScreenShake() {
        const gameContainer = document.querySelector('.game-container');
        if (!gameContainer) return;

        gameContainer.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            gameContainer.style.animation = '';
        }, 500);
    }

    createSoundParticles() {
        const animalDisplay = document.querySelector('.animal-display');
        if (!animalDisplay) return;

        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'sound-particle';
            particle.style.position = 'absolute';
            particle.style.width = '6px';
            particle.style.height = '6px';
            particle.style.backgroundColor = '#FFD700';
            particle.style.borderRadius = '50%';
            particle.style.left = '50%';
            particle.style.top = '50%';
            particle.style.transform = 'translate(-50%, -50%)';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '1000';
            
            animalDisplay.appendChild(particle);
            
            const angle = (i / 8) * Math.PI * 2;
            const distance = 50 + Math.random() * 30;
            const finalX = Math.cos(angle) * distance;
            const finalY = Math.sin(angle) * distance;
            
            particle.animate([
                { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
                { transform: `translate(${finalX}px, ${finalY}px) scale(1)`, opacity: 0 }
            ], {
                duration: 800,
                easing: 'ease-out'
            }).onfinish = () => {
                particle.remove();
            };
        }
    }

    // UI sound effects
    playUISound(type) {
        if (!this.isEnabled) return;
        
        switch(type) {
            case 'select':
                this.playTone(440, 0.15);
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
    }

    playTone(frequency, duration) {
        if (!this.audioContext || !this.isInitialized) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    playMelody(frequencies, noteDuration) {
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.playTone(freq, noteDuration);
            }, index * noteDuration * 1000);
        });
    }

    // CRITICAL: Selection management methods for animal buttons
    selectOption(option) {
        this.currentSelection = option;
        this.playUISound('select');
        this.updateSelectionUI(option);
        
        // Add haptic feedback for mobile devices
        if ('vibrate' in navigator) {
            navigator.vibrate(50);
        }
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
                btn.style.animation = 'pulse 0.3s ease';
                setTimeout(() => {
                    btn.style.animation = '';
                }, 300);
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

    // Sound control methods
    toggleSound() {
        this.isEnabled = !this.isEnabled;
        
        // Update sound button
        const soundBtn = document.getElementById('soundBtn');
        if (soundBtn) {
            soundBtn.textContent = this.isEnabled ? '🔊' : '🔇';
            soundBtn.style.transform = 'scale(1.1)';
            setTimeout(() => {
                soundBtn.style.transform = 'scale(1)';
            }, 200);
        }
        
        return this.isEnabled;
    }

    isSoundEnabled() {
        return this.isEnabled;
    }

    isReady() {
        return this.isInitialized;
    }
}

// Create global instance
window.realAnimalSounds = new AnimalSounds();

// Maintain backward compatibility
if (!window.animalSounds) {
    window.animalSounds = window.realAnimalSounds;
}
