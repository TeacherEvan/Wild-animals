/**
 * Interactive Features Module for Kindergarten Students
 * Provides drag-and-drop functionality and interactive games
 * 
 * @class InteractiveFeatures
 */
class InteractiveFeatures {
    /**
     * Initialize Interactive Features module
     */
    constructor() {
        // Configuration constants
        this.DRAG_Z_INDEX = 1000; // Z-index for dragged elements
        this.HIGHLIGHT_THROTTLE = 100; // Throttle highlight checks (ms)
        this.SCORE_INCREMENT = 10; // Points per correct answer
        this.SUCCESS_DELAY = 1000; // Delay before next question (ms)
        this.FEEDBACK_DURATION = 500; // Duration of feedback animations (ms)
        this.PARTICLE_COUNT = 20; // Number of celebration particles
        this.PARTICLE_SPREAD = 200; // Spread distance for particles (px)
        this.PARTICLE_ANIMATION_DURATION = 1000; // Duration of particle animation (ms)
        this.SCORE_ANIMATION_DURATION = 300; // Score bump animation (ms)
        this.GAME_COMPLETE_DELAY = 2000; // Delay before showing results (ms)
        this.PASSING_SCORE_PERCENTAGE = 80; // Minimum percentage to pass
        this.TOTAL_QUESTIONS = 5; // Total questions per game
        
        this.draggedElement = null;
        this.currentGame = null;
        this.score = 0;
        this.touchSupported = 'ontouchstart' in window;
        this.dropZonesCache = null;
        this.lastHighlightCheck = null;
        this.debugMode = false; // Set to true for verbose logging
        
        this.initializeFeatures();
    }

    /**
     * Initialize all interactive features and games
     */
    initializeFeatures() {
        // Add touch/mouse event listeners for drag and drop
        this.setupDragAndDrop();
        
        // Initialize interactive games
        this.games = {
            'habitat': new HabitatMatchingGame(),
            'feeding': new AnimalFeedingGame(),
            'sounds': new SoundMatchingGame(),
            'puzzle': new AnimalPuzzleGame()
        };
    }

    /**
     * Setup drag and drop functionality
     */
    setupDragAndDrop() {
        // Setup drag and drop for existing elements
        this.initializeDragAndDrop();
        
        // Also setup on DOMContentLoaded for initial page load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeDragAndDrop());
        }
    }

    /**
     * Initialize drag and drop for all draggable elements
     */
    initializeDragAndDrop() {
        const draggables = document.querySelectorAll('.draggable');
        const dropZones = document.querySelectorAll('.drop-zone');

        if (this.debugMode) {
            console.log(`Initializing drag and drop: ${draggables.length} draggables, ${dropZones.length} drop zones`);
        }

        draggables.forEach(draggable => {
            // Remove existing listeners to avoid duplicates
            draggable.removeEventListener('mousedown', draggable._handleDragStart);
            draggable.removeEventListener('touchstart', draggable._handleTouchStart);
            
            // Create bound event handlers
            draggable._handleDragStart = (e) => this.handleDragStart(e, draggable);
            draggable._handleTouchStart = (e) => this.handleDragStart(e, draggable);
            
            // Mouse events
            draggable.addEventListener('mousedown', draggable._handleDragStart);
            
            // Touch events
            draggable.addEventListener('touchstart', draggable._handleTouchStart, {passive: false});
        });

        dropZones.forEach(zone => {
            // Remove existing listeners to avoid duplicates
            zone.removeEventListener('dragover', zone._handleDragOver);
            zone.removeEventListener('drop', zone._handleDrop);
            zone.removeEventListener('touchmove', zone._handleTouchMove);
            zone.removeEventListener('touchend', zone._handleTouchEnd);
            
            // Create bound event handlers
            zone._handleDragOver = (e) => this.handleDragOver(e);
            zone._handleDrop = (e) => this.handleDrop(e, zone);
            zone._handleTouchMove = (e) => this.handleTouchMove(e);
            zone._handleTouchEnd = (e) => this.handleTouchEnd(e, zone);
            
            zone.addEventListener('dragover', zone._handleDragOver);
            zone.addEventListener('drop', zone._handleDrop);
            zone.addEventListener('touchmove', zone._handleTouchMove, {passive: false});
            zone.addEventListener('touchend', zone._handleTouchEnd);
        });

        // Global mouse/touch events (remove and re-add to avoid duplicates)
        document.removeEventListener('mousemove', this._handleDragMove);
        document.removeEventListener('mouseup', this._handleDragEnd);
        document.removeEventListener('touchmove', this._handleTouchDragMove);
        document.removeEventListener('touchend', this._handleTouchDragEnd);
        
        this._handleDragMove = (e) => this.handleDragMove(e);
        this._handleDragEnd = (e) => this.handleDragEnd(e);
        this._handleTouchDragMove = (e) => this.handleDragMove(e);
        this._handleTouchDragEnd = (e) => this.handleDragEnd(e);
        
        document.addEventListener('mousemove', this._handleDragMove);
        document.addEventListener('mouseup', this._handleDragEnd);
        document.addEventListener('touchmove', this._handleTouchDragMove, {passive: false});
        document.addEventListener('touchend', this._handleTouchDragEnd);
    }

    /**
     * Handle drag start event
     * @param {MouseEvent|TouchEvent} e - The drag event
     * @param {HTMLElement} element - The element being dragged
     */
    handleDragStart(e, element) {
        this.draggedElement = element;
        element.classList.add('dragging');
        
        // Create a visual clone for dragging
        const clone = element.cloneNode(true);
        clone.classList.add('drag-clone');
        clone.style.position = 'fixed';
        clone.style.pointerEvents = 'none';
        clone.style.zIndex = this.DRAG_Z_INDEX.toString();
        
        const rect = element.getBoundingClientRect();
        if (e.type.includes('touch')) {
            clone.style.left = (e.touches[0].clientX - rect.width / 2) + 'px';
            clone.style.top = (e.touches[0].clientY - rect.height / 2) + 'px';
        } else {
            clone.style.left = (e.clientX - rect.width / 2) + 'px';
            clone.style.top = (e.clientY - rect.height / 2) + 'px';
        }
        
        document.body.appendChild(clone);
        this.dragClone = clone;
        
        // Play pickup sound - DISABLED (only pronunciation allowed)
        // window.realAnimalSounds?.playUISound('select');
        
        e.preventDefault();
    }

    /**
     * Handle drag move event
     * @param {MouseEvent|TouchEvent} e - The drag event
     */
    handleDragMove(e) {
        if (!this.dragClone) return;
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        this.dragClone.style.left = (clientX - this.dragClone.offsetWidth / 2) + 'px';
        this.dragClone.style.top = (clientY - this.dragClone.offsetHeight / 2) + 'px';
        
        // Throttle drop zone highlight checks for better performance
        if (!this.lastHighlightCheck || Date.now() - this.lastHighlightCheck > this.HIGHLIGHT_THROTTLE) {
            this.lastHighlightCheck = Date.now();
            
            // Highlight drop zones when dragging over them
            const elementBelow = document.elementFromPoint(clientX, clientY);
            const dropZone = elementBelow?.closest('.drop-zone');
            
            // Cache drop zones if not already cached
            if (!this.dropZonesCache) {
                this.dropZonesCache = Array.from(document.querySelectorAll('.drop-zone'));
            }
            
            this.dropZonesCache.forEach(zone => {
                zone.classList.remove('drag-over');
            });
            
            if (dropZone && this.isValidDrop(this.draggedElement, dropZone)) {
                dropZone.classList.add('drag-over');
            }
        }
    }

    /**
     * Handle drag end event
     * @param {MouseEvent|TouchEvent} e - The drag event
     */
    handleDragEnd(e) {
        if (!this.draggedElement) return;
        
        const clientX = e.type.includes('touch') ? e.changedTouches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.changedTouches[0].clientY : e.clientY;
        
        const elementBelow = document.elementFromPoint(clientX, clientY);
        const dropZone = elementBelow?.closest('.drop-zone');
        
        if (dropZone && this.isValidDrop(this.draggedElement, dropZone)) {
            this.handleSuccessfulDrop(this.draggedElement, dropZone);
        } else {
            this.handleFailedDrop();
        }
        
        // Cleanup
        if (this.dragClone) {
            this.dragClone.remove();
            this.dragClone = null;
        }
        
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
            this.draggedElement = null;
        }
        
        // Use cached drop zones if available
        if (this.dropZonesCache) {
            this.dropZonesCache.forEach(zone => {
                zone.classList.remove('drag-over');
            });
        } else {
            document.querySelectorAll('.drop-zone').forEach(zone => {
                zone.classList.remove('drag-over');
            });
        }
        
        // Clear the highlight check timestamp
        this.lastHighlightCheck = null;
    }

    /**
     * Handle drag over event
     * @param {DragEvent} e - The drag event
     */
    handleDragOver(e) {
        e.preventDefault();
    }

    /**
     * Handle drop event
     * @param {DragEvent} e - The drop event
     * @param {HTMLElement} _dropZone - The drop zone element (unused, handled by handleDragEnd)
     */
    handleDrop(e, _dropZone) {
        e.preventDefault();
    }

    /**
     * Handle touch move event
     * @param {TouchEvent} e - The touch event
     */
    handleTouchMove(e) {
        if (this.draggedElement) {
            e.preventDefault();
        }
    }

    /**
     * Handle touch end event
     * @param {TouchEvent} e - The touch event
     * @param {HTMLElement} _dropZone - The drop zone element (unused, handled by handleDragEnd)
     */
    handleTouchEnd(e, _dropZone) {
        this.handleDragEnd(e);
    }

    /**
     * Check if drop is valid
     * @param {HTMLElement} draggable - The draggable element
     * @param {HTMLElement} dropZone - The drop zone element
     * @returns {boolean} True if drop is valid
     */
    isValidDrop(draggable, dropZone) {
        // Check if the drop is valid based on data attributes
        const dragType = draggable.dataset.type;
        const dropType = dropZone.dataset.accepts;
        
        return dropType === 'any' || dropType === dragType;
    }

    /**
     * Handle successful drop
     * @param {HTMLElement} draggable - The draggable element
     * @param {HTMLElement} dropZone - The drop zone element
     */
    handleSuccessfulDrop(draggable, dropZone) {
        // Visual feedback
        dropZone.classList.add('drop-success');
        
        // Add the item to the drop zone
        const item = draggable.cloneNode(true);
        item.classList.remove('dragging');
        item.classList.add('dropped-item');
        dropZone.appendChild(item);
        
        // Play success sound - DISABLED (only pronunciation allowed)
        // window.realAnimalSounds?.playUISound('correct');
        
        // Create celebration particles
        this.createCelebrationParticles(dropZone);
        
        // Update score
        this.updateScore(this.SCORE_INCREMENT);
        
        // Remove success class after animation
        setTimeout(() => {
            dropZone.classList.remove('drop-success');
        }, this.SUCCESS_DELAY);
        
        // Check if game is complete
        if (this.currentGame) {
            this.currentGame.checkCompletion();
        }
    }

    /**
     * Handle failed drop
     */
    handleFailedDrop() {
        // Play error sound - DISABLED (only pronunciation allowed)
        // window.realAnimalSounds?.playUISound('incorrect');
        
        // Visual shake effect
        if (this.draggedElement) {
            this.draggedElement.classList.add('shake-animation');
            setTimeout(() => {
                this.draggedElement.classList.remove('shake-animation');
            }, this.FEEDBACK_DURATION);
        }
    }

    /**
     * Create celebration particle effects
     * @param {HTMLElement} element - Element to create particles around
     */
    createCelebrationParticles(element) {
        const rect = element.getBoundingClientRect();
        const particles = this.PARTICLE_COUNT;
        
        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.className = 'celebration-particle';
            particle.style.left = (rect.left + rect.width / 2) + 'px';
            particle.style.top = (rect.top + rect.height / 2) + 'px';
            particle.style.setProperty('--random-x', (Math.random() - 0.5) * this.PARTICLE_SPREAD + 'px');
            particle.style.setProperty('--random-y', (Math.random() - 0.5) * this.PARTICLE_SPREAD + 'px');
            particle.style.backgroundColor = ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98'][Math.floor(Math.random() * 4)];
            
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), this.PARTICLE_ANIMATION_DURATION);
        }
    }

    /**
     * Update score
     * @param {number} points - Points to add
     */
    updateScore(points) {
        this.score += points;
        
        // Update main score
        const scoreElement = document.getElementById('interactive-score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
            scoreElement.classList.add('score-bump');
            setTimeout(() => scoreElement.classList.remove('score-bump'), this.SCORE_ANIMATION_DURATION);
        }
        
        // Update sound game score
        const soundScoreElement = document.getElementById('sound-score');
        if (soundScoreElement) {
            soundScoreElement.textContent = this.currentGame?.correctAnswers || 0;
            soundScoreElement.classList.add('score-bump');
            setTimeout(() => soundScoreElement.classList.remove('score-bump'), this.SCORE_ANIMATION_DURATION);
        }
    }

    /**
     * Start a specific game
     * @param {string} gameType - Type of game to start ('habitat', 'feeding', 'sounds', 'puzzle')
     */
    startGame(gameType) {
        if (this.games[gameType]) {
            this.currentGame = this.games[gameType];
            this.currentGame.start();
        }
    }
}

/**
 * Habitat Matching Game
 * Drag and drop animals to their correct habitats
 * 
 * @class HabitatMatchingGame
 */
class HabitatMatchingGame {
    /**
     * Initialize Habitat Matching Game
     */
    constructor() {
        this.habitats = {
            'savanna': ['Lion', 'Elephant', 'Giraffe', 'Zebra', 'Rhino', 'Cheetah'],
            'forest': ['Bear', 'Wolf', 'Fox', 'Leopard', 'Koala', 'Owl', 'Squirrel', 'Hedgehog'],
            'ocean': ['Dolphin', 'Shark', 'Octopus', 'Penguin', 'Turtle'],
            'jungle': ['Monkey', 'Gorilla', 'Tiger', 'Parrot']
        };
        this.completed = 0;
        this.total = 0;
    }

    start() {
        const gameContainer = document.createElement('div');
        gameContainer.className = 'habitat-game-container';
        gameContainer.innerHTML = `
            <h2 class="game-title">🏠 Match Animals to Their Homes! 🏠</h2>
            <div class="habitats-grid">
                ${Object.keys(this.habitats).map(habitat => `
                    <div class="habitat-zone drop-zone habitat-${habitat}" data-accepts="${habitat}">
                        <h3>${habitat.charAt(0).toUpperCase() + habitat.slice(1)}</h3>
                        <div class="dropped-animals"></div>
                    </div>
                `).join('')}
            </div>
            <div class="animals-pool">
                ${Object.entries(this.habitats).map(([habitat, animals]) => 
                    animals.map(animal => `
                        <div class="animal-card draggable" data-type="${habitat}" data-animal="${animal}">
                            <span class="animal-emoji">${this.getAnimalEmoji(animal)}</span>
                            <span class="animal-name">${animal}</span>
                        </div>
                    `).join('')
                ).join('')}
            </div>
        `;
        
        document.querySelector('.game-area').appendChild(gameContainer);
        
        // Initialize drag and drop for new elements
        window.interactiveFeatures.initializeDragAndDrop();
        
        // Set total animals count
        this.total = document.querySelectorAll('.animal-card').length;
    }

    getAnimalEmoji(animal) {
        const emojis = {
            'Lion': '🦁', 'Tiger': '🐯', 'Elephant': '🐘', 'Giraffe': '🦒',
            'Bear': '🐻', 'Zebra': '🦓', 'Rhino': '🦏', 'Wolf': '🐺',
            'Fox': '🦊', 'Leopard': '🐆', 'Kangaroo': '🦘', 'Koala': '🐨',
            'Monkey': '🐵', 'Gorilla': '🦍', 'Penguin': '🐧', 'Eagle': '🦅',
            'Octopus': '🐙', 'Dolphin': '🐬', 'Shark': '🦈', 'Frog': '🐸',
            'Camel': '🐪', 'Crocodile': '🐊', 'Hippo': '🦛', 'Cheetah': '🐆',
            'Parrot': '🦜', 'Turtle': '🐢', 'Owl': '🦉', 'Squirrel': '🐿️',
            'Hedgehog': '🦔', 'Bee': '🐝'
        };
        return emojis[animal] || '🐾';
    }

    /**
     * Check if game is complete
     */
    checkCompletion() {
        this.completed++;
        if (this.completed >= this.total) {
            this.showCompletionScreen();
        }
    }

    showCompletionScreen() {
        // Play completion sound - DISABLED (only pronunciation allowed)
        // window.realAnimalSounds?.playUISound('complete');
        
        const completion = document.createElement('div');
        completion.className = 'game-completion';
        completion.innerHTML = `
            <h1>🎉 Amazing Job! 🎉</h1>
            <p>You matched all animals to their homes!</p>
            <div class="star-rating">⭐⭐⭐</div>
            <button class="play-again-btn" onclick="window.interactiveFeatures.startGame('habitat')">Play Again</button>
        `;
        
        document.querySelector('.habitat-game-container').appendChild(completion);
    }
}

/**
 * Animal Feeding Game
 * Feed animals their correct food
 * 
 * @class AnimalFeedingGame
 */
class AnimalFeedingGame {
    /**
     * Initialize Animal Feeding Game
     */
    constructor() {
        this.feedingData = {
            'Lion': { foods: ['🥩', '🍖'], type: 'carnivore' },
            'Elephant': { foods: ['🌿', '🥬', '🍃'], type: 'herbivore' },
            'Monkey': { foods: ['🍌', '🍎', '🥜'], type: 'omnivore' },
            'Giraffe': { foods: ['🌿', '🍃'], type: 'herbivore' },
            'Bear': { foods: ['🐟', '🍯', '🫐'], type: 'omnivore' }
        };
    }

    start() {
        // Implementation for feeding game
        const gameContainer = document.createElement('div');
        gameContainer.className = 'feeding-game-container';
        gameContainer.innerHTML = `
            <h2 class="game-title">🍽️ Feed the Animals! 🍽️</h2>
            <div class="feeding-area">
                <div class="current-animal">
                    <div id="hungry-animal" class="animal-display"></div>
                    <div class="speech-bubble">I'm hungry!</div>
                </div>
                <div class="food-options"></div>
            </div>
        `;
        
        document.querySelector('.game-area').appendChild(gameContainer);
        this.nextAnimal();
    }

    /**
     * Show next animal to feed
     */
    nextAnimal() {
        const animals = Object.keys(this.feedingData);
        const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
        this.showAnimalToFeed(randomAnimal);
    }

    /**
     * Show animal to feed
     * @param {string} _animalName - Name of the animal (unused - method stub)
     */
    showAnimalToFeed(_animalName) {
        // Implementation details...
    }
}

/**
 * Sound Matching Game
 * Listen and guess the animal sound
 * 
 * @class SoundMatchingGame
 */
class SoundMatchingGame {
    /**
     * Initialize Sound Matching Game
     */
    constructor() {
        this.rounds = 0;
        this.correctAnswers = 0;
    }

    start() {
        const gameContainer = document.createElement('div');
        gameContainer.className = 'sound-game-container';
        gameContainer.innerHTML = `
            <h2 class="game-title">🔊 Guess the Animal Sound! 🔊</h2>
            <div class="sound-game-area">
                <button class="big-play-button" onclick="window.interactiveFeatures.currentGame.playRandomSound()">
                    <span class="play-icon">▶️</span>
                    <span>Play Sound</span>
                </button>
                <div class="animal-options-grid"></div>
                <div class="sound-feedback"></div>
            </div>
            <div class="score-display">
                Round: <span id="sound-round">0</span>/5 | Score: <span id="sound-score">0</span>
            </div>
        `;
        
        document.querySelector('.game-area').appendChild(gameContainer);
        this.nextRound();
    }

    /**
     * Play random animal sound
     */
    playRandomSound() {
        // Play a random animal sound - KEEP (pronunciation only)
        const animals = ['Lion', 'Tiger', 'Elephant', 'Monkey', 'Wolf', 'Dolphin'];
        this.currentAnimal = animals[Math.floor(Math.random() * animals.length)];
        window.realAnimalSounds?.playAnimalSound(this.currentAnimal);
        
        // Show animal options
        this.showAnimalOptions();
    }

    /**
     * Show animal options for current round
     */
    showAnimalOptions() {
        // Create options for the current round
        const options = this.generateSoundGameOptions();
        const optionsGrid = document.querySelector('.animal-options-grid');
        
        if (!optionsGrid) return;
        
        optionsGrid.innerHTML = '';
        options.forEach(animal => {
            const optionButton = document.createElement('button');
            optionButton.className = 'animal-option-btn';
            optionButton.innerHTML = `
                <span class="animal-emoji">${this.getAnimalEmoji(animal)}</span>
                <span class="animal-name">${animal}</span>
            `;
            optionButton.onclick = () => this.checkAnswer(animal);
            optionsGrid.appendChild(optionButton);
        });
    }

    /**
     * Generate random options for sound game
     * @returns {Array<string>} Array of animal names
     */
    generateSoundGameOptions() {
        // Get 3 wrong answers + 1 correct answer
        const allAnimals = ['Lion', 'Tiger', 'Elephant', 'Monkey', 'Wolf', 'Dolphin', 'Bear', 'Fox', 'Frog', 'Eagle'];
        const wrongAnimals = allAnimals.filter(animal => animal !== this.currentAnimal);
        const randomWrong = wrongAnimals.sort(() => Math.random() - 0.5).slice(0, 3);
        
        // Combine and shuffle
        const options = [this.currentAnimal, ...randomWrong];
        return options.sort(() => Math.random() - 0.5);
    }

    /**
     * Check if answer is correct
     * @param {string} selectedAnimal - Selected animal name
     */
    checkAnswer(selectedAnimal) {
        const isCorrect = selectedAnimal === this.currentAnimal;
        
        // Update score
        if (isCorrect) {
            this.correctAnswers++;
            window.interactiveFeatures.updateScore(window.interactiveFeatures.SCORE_INCREMENT);
            this.showFeedback('Correct! 🎉', 'correct');
        } else {
            this.showFeedback(`Oops! It was a ${this.currentAnimal} 😊`, 'incorrect');
        }
        
        // Disable all buttons
        document.querySelectorAll('.animal-option-btn').forEach(btn => {
            btn.disabled = true;
            if (btn.textContent.includes(this.currentAnimal)) {
                btn.classList.add('correct');
            } else if (btn.textContent.includes(selectedAnimal) && !isCorrect) {
                btn.classList.add('incorrect');
            }
        });
        
        // Next round after delay
        setTimeout(() => {
            this.nextRound();
        }, window.interactiveFeatures.GAME_COMPLETE_DELAY);
    }

    /**
     * Show feedback message
     * @param {string} message - Feedback message
     * @param {string} type - Feedback type ('correct' or 'incorrect')
     */
    showFeedback(message, type) {
        let feedback = document.querySelector('.sound-feedback');
        if (!feedback) {
            feedback = document.createElement('div');
            feedback.className = 'sound-feedback';
            document.querySelector('.sound-game-area').appendChild(feedback);
        }
        
        feedback.textContent = message;
        feedback.className = `sound-feedback ${type}`;
    }

    getAnimalEmoji(animal) {
        const emojis = {
            'Lion': '🦁', 'Tiger': '🐯', 'Elephant': '🐘', 'Monkey': '🐵',
            'Wolf': '🐺', 'Dolphin': '🐬', 'Bear': '🐻', 'Fox': '🦊',
            'Frog': '🐸', 'Eagle': '🦅'
        };
        return emojis[animal] || '🐾';
    }

    /**
     * Move to next round
     */
    nextRound() {
        this.rounds++;
        
        if (this.rounds > 5) {
            // Game complete
            this.showCompletionScreen();
            return;
        }
        
        // Clear feedback
        const feedback = document.querySelector('.sound-feedback');
        if (feedback) feedback.textContent = '';
        
        // Clear options
        const optionsGrid = document.querySelector('.animal-options-grid');
        if (optionsGrid) optionsGrid.innerHTML = '';
        
        // Update round counter if it exists
        const roundCounter = document.getElementById('sound-round');
        if (roundCounter) roundCounter.textContent = this.rounds;
    }

    showCompletionScreen() {
        const gameArea = document.querySelector('.sound-game-container');
        const percentage = Math.round((this.correctAnswers / window.interactiveFeatures.TOTAL_QUESTIONS) * 100);
        
        let message = '';
        if (percentage >= window.interactiveFeatures.PASSING_SCORE_PERCENTAGE) {
            message = '🌟 Amazing! You know your animal sounds!';
        } else if (percentage >= 60) {
            message = '👏 Good job! Keep listening!';
        } else {
            message = '😊 Nice try! Practice makes perfect!';
        }
        
        gameArea.innerHTML = `
            <div class="sound-completion">
                <h2>${message}</h2>
                <div class="final-score">Final Score: ${this.correctAnswers}/5 (${percentage}%)</div>
                <button class="play-again-btn" onclick="window.interactiveFeatures.startGame('sounds')">
                    🎮 Play Again
                </button>
            </div>
        `;
    }
}

// Animal Puzzle Game
class AnimalPuzzleGame {
    constructor() {
        this.puzzlePieces = 9; // 3x3 puzzle
        this.currentAnimal = null;
    }

    start() {
        const gameContainer = document.createElement('div');
        gameContainer.className = 'puzzle-game-container';
        gameContainer.innerHTML = `
            <h2 class="game-title">🧩 Animal Puzzle! 🧩</h2>
            <div class="puzzle-board">
                <div class="puzzle-grid"></div>
                <div class="puzzle-preview"></div>
            </div>
            <button class="hint-button" onclick="window.interactiveFeatures.currentGame.showHint()">
                💡 Hint
            </button>
        `;
        
        document.querySelector('.game-area').appendChild(gameContainer);
        this.createPuzzle();
    }

    createPuzzle() {
        // Create a jigsaw puzzle with animal images
        // Implementation details...
    }

    showHint() {
        // Show a hint for the puzzle - DISABLED (only pronunciation allowed)
        // window.realAnimalSounds?.playUISound('hint');
    }
}

// Initialize interactive features
window.interactiveFeatures = new InteractiveFeatures();