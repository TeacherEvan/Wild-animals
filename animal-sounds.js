cursor/fix-sound-migration-and-error-handling-a131


     
// Enhanced Animal Sounds Module - Real Animal Sounds & Interactive Features
class AnimalSounds {
    constructor() {
        this.isEnabled = true;
        this.currentSelection = null;
        this.speechSynthesis = window.speechSynthesis;
        this.voices = [];
        this.audioContext = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.initAudio();
        this.initVoices();
        this.initTouchGestures();
    }

    initAudio() {
        try {
            // Initialize Web Audio API for better cross-browser support
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Resume audio context for Chrome autoplay policy
            if (this.audioContext.state === 'suspended') {
                document.addEventListener('click', () => {
                    this.audioContext.resume();
                }, { once: true });
            }
        } catch (error) {
            console.log('Web Audio API not supported, using fallback');
        }
 main
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

    loadVoices() {
        this.voices = this.speechSynthesis.getVoices();
        console.log('Available voices:', this.voices.length);
 main
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


    // Create realistic animal sounds using Web Audio API
    playRealAnimalSound(animalName) {
        if (!this.isEnabled || !this.audioContext) return;

        const soundMap = {
            'Lion': () => this.createRoarSound(),
            'Tiger': () => this.createRoarSound(0.8),
            'Elephant': () => this.createTrumpetSound(),
            'Bear': () => this.createGrowlSound(),
            'Wolf': () => this.createHowlSound(),
            'Dog': () => this.createBarkSound(),
            'Cat': () => this.createMeowSound(),
            'Cow': () => this.createMooSound(),
            'Sheep': () => this.createBaaSound(),
            'Horse': () => this.createNeighSound(),
            'Pig': () => this.createOinkSound(),
            'Rooster': () => this.createCockSound(),
            'Duck': () => this.createQuackSound(),
            'Owl': () => this.createHootSound(),
            'Frog': () => this.createRibbitSound(),
            'Monkey': () => this.createChatterSound(),
            'Bird': () => this.createTweetSound(),
            'Snake': () => this.createHissSound(),
            'Bee': () => this.createBuzzSound(),
            'Dolphin': () => this.createClickSound(),
            'Whale': () => this.createWhaleSound()
        };

        const soundFunction = soundMap[animalName] || soundMap['Lion'];
        soundFunction();
    }

    // Create roar sound (Lion, Tiger)
    createRoarSound(variation = 1) {
        const duration = 1.5;
 main
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        


        oscillator.frequency.setValueAtTime(80 * variation, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(60 * variation, this.audioContext.currentTime + duration);
        oscillator.type = 'sawtooth';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.1);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
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

    // Enhanced animal sound player with real sounds
    playAnimalSound(animalName) {
        if (!this.isEnabled) return;

        // Play real animal sound
        this.playRealAnimalSound(animalName);
        
        // Add visual feedback
        this.addAnimalReaction(animalName);
        
        // Also pronounce the name after the sound
        setTimeout(() => {
            this.pronounceAnimal(animalName);
        }, 1000);
    }

    // Add visual reaction when animal sound is played
    addAnimalReaction(animalName) {
        const animalEmoji = document.getElementById('animalEmoji');
        if (!animalEmoji) return;

        // Add bounce effect
        animalEmoji.style.transform = 'scale(1.2)';
        animalEmoji.style.transition = 'transform 0.3s ease';
        
        // Add screen shake effect
        this.addScreenShake();
        
        // Add particle burst
        this.createSoundParticles();
        
        // Reset after animation
        setTimeout(() => {
            animalEmoji.style.transform = 'scale(1)';
        }, 300);
    }

    // Add screen shake effect
    addScreenShake() {
        const gameContainer = document.querySelector('.game-container');
        if (!gameContainer) return;

        gameContainer.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            gameContainer.style.animation = '';
        }, 500);
    }

    // Create particle effects for sound
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
            
            // Animate particle
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

    // Pronounce animal name using text-to-speech
    pronounceAnimal(animalName) {
        if (!this.isEnabled || !this.speechSynthesis) {
            console.log('Speech synthesis not available or disabled');
            return;
        }
 main

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
        
 cursor/fix-sound-migration-and-error-handling-a131
        // Frequency modulation for croak
        oscillator.frequency.setValueAtTime(frequencies[0], this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(frequencies[1], this.audioContext.currentTime + duration * 0.5);
        oscillator.frequency.exponentialRampToValueAtTime(frequencies[2], this.audioContext.currentTime + duration);
        utterance.rate = 0.7; // Slower for kindergarten students
        utterance.pitch = 1.2; // Higher pitch for child-friendly sound
        utterance.volume = 0.8;
 main
        
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

cursor/fix-sound-migration-and-error-handling-a131
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

 cursor/fix-sound-migration-and-error-handling-a131
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

 main

    // Enhanced UI sounds with better feedback
main
    playUISound(type) {
        if (!this.isEnabled || !this.audioContext) return;
        
        switch(type) {
            case 'select':
                this.playEnhancedTone(440, 0.15);
                break;
            case 'correct':
                this.playSuccessSound();
                break;
            case 'incorrect':
                this.playErrorSound();
                break;
            case 'complete':
                this.playVictorySound();
                break;
            case 'powerup':
                this.playPowerupSound();
                break;
        }
    }

    // Play enhanced tone with better sound quality
    playEnhancedTone(frequency, duration) {
 main
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
 cursor/fix-sound-migration-and-error-handling-a131
        gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.05);

        gainNode.gain.linearRampToValueAtTime(0.15, this.audioContext.currentTime + 0.02);
 main
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
 cursor/fix-sound-migration-and-error-handling-a131
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
 main
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
                // Add pulse effect
                btn.style.animation = 'pulse 0.3s ease';
                setTimeout(() => {
                    btn.style.animation = '';
                }, 300);
            }
        });
 main
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

 cursor/fix-sound-migration-and-error-handling-a131

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
main
