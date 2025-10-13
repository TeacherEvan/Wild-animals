// Enhanced Animal Sounds Module - Real Animal Sounds & Interactive Features
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

    initAudioContext() {
        // Audio context disabled - only text-to-speech pronunciation allowed
        this.audioContext = null;
        this.isInitialized = false;
        console.log('Audio context disabled - only pronunciation sounds enabled');
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


    // Create realistic animal sounds using Web Audio API - DISABLED
    playRealAnimalSound(animalName) {
        console.log(`Real animal sound disabled for ${animalName} - only pronunciation allowed`);
        // No sound generation - silently ignore
        return;
    }

    // Create roar sound (Lion, Tiger) - DISABLED
    createRoarSound(variation = 1) {
        console.log(`Roar sound disabled - only pronunciation allowed`);
        // No sound generation - silently ignore
    }

    // Create trumpet sound (Elephant)
    createTrumpetSound() {
        const duration = 2;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + duration);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Create growl sound (Bear, Wolf)
    createGrowlSound() {
        const duration = 1.2;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(40, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(30, this.audioContext.currentTime + duration);
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.25, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Create howl sound (Wolf)
    createHowlSound() {
        const duration = 2.5;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(220, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, this.audioContext.currentTime + duration/2);
        oscillator.frequency.exponentialRampToValueAtTime(220, this.audioContext.currentTime + duration);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Create bark sound (Dog)
    createBarkSound() {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const duration = 0.2;
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(300, this.audioContext.currentTime);
                oscillator.type = 'square';
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
            }, i * 300);
        }
    }

    // Create meow sound (Cat)
    createMeowSound() {
        const duration = 1;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(350, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + duration);
        oscillator.type = 'triangle';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Create moo sound (Cow)
    createMooSound() {
        const duration = 1.5;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + duration);
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.25, this.audioContext.currentTime + 0.2);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Create baa sound (Sheep)
    createBaaSound() {
        const duration = 1;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(150, this.audioContext.currentTime + duration);
        oscillator.type = 'square';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Create neigh sound (Horse)
    createNeighSound() {
        const duration = 1.8;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + duration);
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Create oink sound (Pig)
    createOinkSound() {
        for (let i = 0; i < 2; i++) {
            setTimeout(() => {
                const duration = 0.3;
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(250, this.audioContext.currentTime);
                oscillator.type = 'square';
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.25, this.audioContext.currentTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
            }, i * 400);
        }
    }

    // Create cock sound (Rooster)
    createCockSound() {
        const duration = 2;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, this.audioContext.currentTime + duration);
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Create quack sound (Duck)
    createQuackSound() {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const duration = 0.2;
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
                oscillator.type = 'square';
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.25, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
            }, i * 250);
        }
    }

    // Create hoot sound (Owl)
    createHootSound() {
        for (let i = 0; i < 2; i++) {
            setTimeout(() => {
                const duration = 0.5;
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.1);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
            }, i * 600);
        }
    }

    // Create ribbit sound (Frog)
    createRibbitSound() {
        for (let i = 0; i < 2; i++) {
            setTimeout(() => {
                const duration = 0.3;
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(100, this.audioContext.currentTime);
                oscillator.type = 'square';
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
            }, i * 350);
        }
    }

    // Create chatter sound (Monkey)
    createChatterSound() {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const duration = 0.1;
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(300 + Math.random() * 200, this.audioContext.currentTime);
                oscillator.type = 'square';
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
            }, i * 150);
        }
    }

    // Create tweet sound (Bird)
    createTweetSound() {
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const duration = 0.3;
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(800 + Math.random() * 400, this.audioContext.currentTime);
                oscillator.type = 'sine';
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.05);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
            }, i * 200);
        }
    }

    // Create hiss sound (Snake)
    createHissSound() {
        const duration = 1.5;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(8000, this.audioContext.currentTime);
        oscillator.type = 'triangle';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Create buzz sound (Bee)
    createBuzzSound() {
        const duration = 1;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(200, this.audioContext.currentTime);
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

    // Create click sound (Dolphin)
    createClickSound() {
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                const duration = 0.05;
                const oscillator = this.audioContext.createOscillator();
                const gainNode = this.audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.audioContext.destination);
                
                oscillator.frequency.setValueAtTime(1000 + Math.random() * 500, this.audioContext.currentTime);
                oscillator.type = 'square';
                
                gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
                gainNode.gain.linearRampToValueAtTime(0.2, this.audioContext.currentTime + 0.01);
                gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
                
                oscillator.start(this.audioContext.currentTime);
                oscillator.stop(this.audioContext.currentTime + duration);
            }, i * 100);
        }
    }

    // Create whale sound (Whale)
    createWhaleSound() {
        const duration = 3;
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(80, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(200, this.audioContext.currentTime + duration/2);
        oscillator.frequency.exponentialRampToValueAtTime(80, this.audioContext.currentTime + duration);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }

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
    // Play animal sound based on name - ONLY pronunciation allowed
    playAnimalSound(animalName) {
        if (!this.isEnabled) return;

        console.log(`Playing pronunciation for: ${animalName}`);
        
        // Only play pronunciation - no real audio or sound effects
        this.pronounceAnimal(animalName);
        
        // Add minimal visual feedback
        const emojiEl = document.getElementById('animalEmoji');
        if (emojiEl) emojiEl.classList.add('playing');
        
        // Remove visual glow when TTS is done
        if (this.speechSynthesis) {
            const timer = setInterval(() => {
                if (!this.speechSynthesis.speaking) {
                    clearInterval(timer);
                    if (emojiEl) emojiEl.classList.remove('playing');
                }
            }, 200);
        } else {
            // Remove visual feedback after short delay if TTS unavailable
            setTimeout(() => {
                if (emojiEl) emojiEl.classList.remove('playing');
            }, 1000);
        }
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

    // Selection management with enhanced feedback
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
            if (btn.dataset.value === selectedOption) {
                btn.classList.add('selected');
                // Add pulse effect
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
