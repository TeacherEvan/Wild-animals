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
     * @param {MouseEvent|TouchEvent} dragEvent - The drag event
     * @param {HTMLElement} draggableElement - The element being dragged
     */
    handleDragStart(dragEvent, draggableElement) {
        this.draggedElement = draggableElement;
        draggableElement.classList.add('dragging');
        
        // Create a visual clone for dragging
        const cloneElement = draggableElement.cloneNode(true);
        cloneElement.classList.add('drag-clone');
        cloneElement.style.position = 'fixed';
        cloneElement.style.pointerEvents = 'none';
        cloneElement.style.zIndex = this.DRAG_Z_INDEX.toString();
        
        const elementBoundingRect = draggableElement.getBoundingClientRect();
        if (dragEvent.type.includes('touch')) {
            cloneElement.style.left = (dragEvent.touches[0].clientX - elementBoundingRect.width / 2) + 'px';
            cloneElement.style.top = (dragEvent.touches[0].clientY - elementBoundingRect.height / 2) + 'px';
        } else {
            cloneElement.style.left = (dragEvent.clientX - elementBoundingRect.width / 2) + 'px';
            cloneElement.style.top = (dragEvent.clientY - elementBoundingRect.height / 2) + 'px';
        }
        
        document.body.appendChild(cloneElement);
        this.dragClone = cloneElement;
        
        // Play pickup sound - DISABLED (only pronunciation allowed)
        // window.realAnimalSounds?.playUISound('select');
        
        dragEvent.preventDefault();
    }

    /**
     * Handle drag move event
     * @param {MouseEvent|TouchEvent} dragEvent - The drag event
     */
    handleDragMove(dragEvent) {
        if (!this.dragClone) return;
        
        const cursorX = dragEvent.type.includes('touch') ? dragEvent.touches[0].clientX : dragEvent.clientX;
        const cursorY = dragEvent.type.includes('touch') ? dragEvent.touches[0].clientY : dragEvent.clientY;
        
        this.dragClone.style.left = (cursorX - this.dragClone.offsetWidth / 2) + 'px';
        this.dragClone.style.top = (cursorY - this.dragClone.offsetHeight / 2) + 'px';
        
        // Throttle drop zone highlight checks for better performance
        const currentTimestamp = Date.now();
        if (!this.lastHighlightCheck || currentTimestamp - this.lastHighlightCheck > this.HIGHLIGHT_THROTTLE) {
            this.lastHighlightCheck = currentTimestamp;
            
            // Highlight drop zones when dragging over them
            const elementUnderCursor = document.elementFromPoint(cursorX, cursorY);
            const targetDropZone = elementUnderCursor?.closest('.drop-zone');
            
            // Cache drop zones if not already cached
            if (!this.dropZonesCache) {
                this.dropZonesCache = Array.from(document.querySelectorAll('.drop-zone'));
            }
            
            this.dropZonesCache.forEach(dropZone => {
                dropZone.classList.remove('drag-over');
            });
            
            if (targetDropZone && this.isValidDrop(this.draggedElement, targetDropZone)) {
                targetDropZone.classList.add('drag-over');
            }
        }
    }

    /**
     * Handle drag end event
     * @param {MouseEvent|TouchEvent} dragEvent - The drag event
     */
    handleDragEnd(dragEvent) {
        if (!this.draggedElement) return;
        
        const finalCursorX = dragEvent.type.includes('touch') ? dragEvent.changedTouches[0].clientX : dragEvent.clientX;
        const finalCursorY = dragEvent.type.includes('touch') ? dragEvent.changedTouches[0].clientY : dragEvent.clientY;
        
        const elementUnderCursor = document.elementFromPoint(finalCursorX, finalCursorY);
        const targetDropZone = elementUnderCursor?.closest('.drop-zone');
        
        if (targetDropZone && this.isValidDrop(this.draggedElement, targetDropZone)) {
            this.handleSuccessfulDrop(this.draggedElement, targetDropZone);
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
            this.dropZonesCache.forEach(dropZone => {
                dropZone.classList.remove('drag-over');
            });
        } else {
            document.querySelectorAll('.drop-zone').forEach(dropZone => {
                dropZone.classList.remove('drag-over');
            });
        }
        
        // Clear the highlight check timestamp
        this.lastHighlightCheck = null;
    }

    /**
     * Handle drag over event
     * @param {DragEvent} dragOverEvent - The drag event
     */
    handleDragOver(dragOverEvent) {
        dragOverEvent.preventDefault();
    }

    /**
     * Handle drop event
     * @param {DragEvent} dropEvent - The drop event
     * @param {HTMLElement} _targetDropZone - The drop zone element (unused, handled by handleDragEnd)
     */
    handleDrop(dropEvent, _targetDropZone) {
        dropEvent.preventDefault();
    }

    /**
     * Handle touch move event
     * @param {TouchEvent} touchMoveEvent - The touch event
     */
    handleTouchMove(touchMoveEvent) {
        if (this.draggedElement) {
            touchMoveEvent.preventDefault();
        }
    }

    /**
     * Handle touch end event
     * @param {TouchEvent} touchEndEvent - The touch event
     * @param {HTMLElement} _targetDropZone - The drop zone element (unused, handled by handleDragEnd)
     */
    handleTouchEnd(touchEndEvent, _targetDropZone) {
        this.handleDragEnd(touchEndEvent);
    }

    /**
     * Check if drop is valid
     * @param {HTMLElement} draggableElement - The draggable element
     * @param {HTMLElement} targetDropZone - The drop zone element
     * @returns {boolean} True if drop is valid
     */
    isValidDrop(draggableElement, targetDropZone) {
        // Check if the drop is valid based on data attributes
        const draggableType = draggableElement.dataset.type;
        const acceptedDropType = targetDropZone.dataset.accepts;
        
        return acceptedDropType === 'any' || acceptedDropType === draggableType;
    }

    /**
     * Handle successful drop
     * @param {HTMLElement} draggableElement - The draggable element
     * @param {HTMLElement} targetDropZone - The drop zone element
     */
    handleSuccessfulDrop(draggableElement, targetDropZone) {
        // Visual feedback
        targetDropZone.classList.add('drop-success');
        
        // Add the item to the drop zone
        const droppedItem = draggableElement.cloneNode(true);
        droppedItem.classList.remove('dragging');
        droppedItem.classList.add('dropped-item');
        targetDropZone.appendChild(droppedItem);
        
        // Play success sound - DISABLED (only pronunciation allowed)
        // window.realAnimalSounds?.playUISound('correct');
        
        // Create celebration particles
        this.createCelebrationParticles(targetDropZone);
        
        // Update score
        this.updateScore(this.SCORE_INCREMENT);
        
        // Remove success class after animation
        setTimeout(() => {
            targetDropZone.classList.remove('drop-success');
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
     * @param {HTMLElement} targetElement - Element to create particles around
     */
    createCelebrationParticles(targetElement) {
        const elementRect = targetElement.getBoundingClientRect();
        const totalParticles = this.PARTICLE_COUNT;
        const particleColors = ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98'];
        
        for (let particleIndex = 0; particleIndex < totalParticles; particleIndex++) {
            const particleElement = document.createElement('div');
            particleElement.className = 'celebration-particle';
            particleElement.style.left = (elementRect.left + elementRect.width / 2) + 'px';
            particleElement.style.top = (elementRect.top + elementRect.height / 2) + 'px';
            particleElement.style.setProperty('--random-x', (Math.random() - 0.5) * this.PARTICLE_SPREAD + 'px');
            particleElement.style.setProperty('--random-y', (Math.random() - 0.5) * this.PARTICLE_SPREAD + 'px');
            particleElement.style.backgroundColor = particleColors[Math.floor(Math.random() * particleColors.length)];
            
            document.body.appendChild(particleElement);
            
            setTimeout(() => particleElement.remove(), this.PARTICLE_ANIMATION_DURATION);
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
                ${Object.keys(this.habitats).map(habitatName => `
                    <div class="habitat-zone drop-zone habitat-${habitatName}" data-accepts="${habitatName}">
                        <h3>${habitatName.charAt(0).toUpperCase() + habitatName.slice(1)}</h3>
                        <div class="dropped-animals"></div>
                    </div>
                `).join('')}
            </div>
            <div class="animals-pool">
                ${Object.entries(this.habitats).map(([habitatName, animalList]) => 
                    animalList.map(animalName => `
                        <div class="animal-card draggable" data-type="${habitatName}" data-animal="${animalName}">
                            <span class="animal-emoji">${this.getAnimalEmoji(animalName)}</span>
                            <span class="animal-name">${animalName}</span>
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

    getAnimalEmoji(animalName) {
        const animalEmojiMap = {
            'Lion': '🦁', 'Tiger': '🐯', 'Elephant': '🐘', 'Giraffe': '🦒',
            'Bear': '🐻', 'Zebra': '🦓', 'Rhino': '🦏', 'Wolf': '🐺',
            'Fox': '🦊', 'Leopard': '🐆', 'Kangaroo': '🦘', 'Koala': '🐨',
            'Monkey': '🐵', 'Gorilla': '🦍', 'Penguin': '🐧', 'Eagle': '🦅',
            'Octopus': '🐙', 'Dolphin': '🐬', 'Shark': '🦈', 'Frog': '🐸',
            'Camel': '🐪', 'Crocodile': '🐊', 'Hippo': '🦛', 'Cheetah': '🐆',
            'Parrot': '🦜', 'Turtle': '🐢', 'Owl': '🦉', 'Squirrel': '🐿️',
            'Hedgehog': '🦔', 'Bee': '🐝'
        };
        return animalEmojiMap[animalName] || '🐾';
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
        const availableAnimals = Object.keys(this.feedingData);
        const randomAnimalName = availableAnimals[Math.floor(Math.random() * availableAnimals.length)];
        this.showAnimalToFeed(randomAnimalName);
    }

    /**
     * Show animal to feed
     * @param {string} _selectedAnimalName - Name of the animal (unused - method stub for future implementation)
     */
    showAnimalToFeed(_selectedAnimalName) {
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
        const availableAnimals = ['Lion', 'Tiger', 'Elephant', 'Monkey', 'Wolf', 'Dolphin'];
        this.currentAnimal = availableAnimals[Math.floor(Math.random() * availableAnimals.length)];
        window.realAnimalSounds?.playAnimalSound(this.currentAnimal);
        
        // Show animal options
        this.showAnimalOptions();
    }

    /**
     * Show animal options for current round
     */
    showAnimalOptions() {
        // Create options for the current round
        const animalOptions = this.generateSoundGameOptions();
        const optionsGridElement = document.querySelector('.animal-options-grid');
        
        if (!optionsGridElement) return;
        
        optionsGridElement.innerHTML = '';
        animalOptions.forEach(animalName => {
            const optionButton = document.createElement('button');
            optionButton.className = 'animal-option-btn';
            optionButton.innerHTML = `
                <span class="animal-emoji">${this.getAnimalEmoji(animalName)}</span>
                <span class="animal-name">${animalName}</span>
            `;
            optionButton.onclick = () => this.checkAnswer(animalName);
            optionsGridElement.appendChild(optionButton);
        });
    }

    /**
     * Generate random options for sound game
     * @returns {Array<string>} Array of animal names
     */
    generateSoundGameOptions() {
        // Get 3 wrong answers + 1 correct answer
        const allAvailableAnimals = ['Lion', 'Tiger', 'Elephant', 'Monkey', 'Wolf', 'Dolphin', 'Bear', 'Fox', 'Frog', 'Eagle'];
        const incorrectAnimals = allAvailableAnimals.filter(animalName => animalName !== this.currentAnimal);
        const selectedIncorrectAnimals = incorrectAnimals.sort(() => Math.random() - 0.5).slice(0, 3);
        
        // Combine and shuffle
        const allOptionsForRound = [this.currentAnimal, ...selectedIncorrectAnimals];
        return allOptionsForRound.sort(() => Math.random() - 0.5);
    }

    /**
     * Check if answer is correct
     * @param {string} selectedAnimalName - Selected animal name
     */
    checkAnswer(selectedAnimalName) {
        const isCorrectAnswer = selectedAnimalName === this.currentAnimal;
        
        // Update score
        if (isCorrectAnswer) {
            this.correctAnswers++;
            window.interactiveFeatures.updateScore(window.interactiveFeatures.SCORE_INCREMENT);
            this.showFeedback('Correct! 🎉', 'correct');
        } else {
            this.showFeedback(`Oops! It was a ${this.currentAnimal} 😊`, 'incorrect');
        }
        
        // Disable all buttons and show correct/incorrect states
        const allOptionButtons = document.querySelectorAll('.animal-option-btn');
        allOptionButtons.forEach(optionButton => {
            optionButton.disabled = true;
            if (optionButton.textContent.includes(this.currentAnimal)) {
                optionButton.classList.add('correct');
            } else if (optionButton.textContent.includes(selectedAnimalName) && !isCorrectAnswer) {
                optionButton.classList.add('incorrect');
            }
        });
        
        // Next round after delay
        setTimeout(() => {
            this.nextRound();
        }, window.interactiveFeatures.GAME_COMPLETE_DELAY);
    }

    /**
     * Show feedback message
     * @param {string} feedbackMessage - Feedback message
     * @param {string} feedbackType - Feedback type ('correct' or 'incorrect')
     */
    showFeedback(feedbackMessage, feedbackType) {
        let feedbackElement = document.querySelector('.sound-feedback');
        if (!feedbackElement) {
            feedbackElement = document.createElement('div');
            feedbackElement.className = 'sound-feedback';
            document.querySelector('.sound-game-area').appendChild(feedbackElement);
        }
        
        feedbackElement.textContent = feedbackMessage;
        feedbackElement.className = `sound-feedback ${feedbackType}`;
    }

    getAnimalEmoji(animalName) {
        const animalEmojiMap = {
            'Lion': '🦁', 'Tiger': '🐯', 'Elephant': '🐘', 'Monkey': '🐵',
            'Wolf': '🐺', 'Dolphin': '🐬', 'Bear': '🐻', 'Fox': '🦊',
            'Frog': '🐸', 'Eagle': '🦅'
        };
        return animalEmojiMap[animalName] || '🐾';
    }

    /**
     * Move to next round
     */
    nextRound() {
        this.rounds++;
        
        const maxRounds = 5;
        if (this.rounds > maxRounds) {
            // Game complete
            this.showCompletionScreen();
            return;
        }
        
        // Clear feedback
        const feedbackElement = document.querySelector('.sound-feedback');
        if (feedbackElement) feedbackElement.textContent = '';
        
        // Clear options
        const optionsGridElement = document.querySelector('.animal-options-grid');
        if (optionsGridElement) optionsGridElement.innerHTML = '';
        
        // Update round counter if it exists
        const roundCounterElement = document.getElementById('sound-round');
        if (roundCounterElement) roundCounterElement.textContent = this.rounds;
    }

    showCompletionScreen() {
        const gameContainerElement = document.querySelector('.sound-game-container');
        const scorePercentage = Math.round((this.correctAnswers / window.interactiveFeatures.TOTAL_QUESTIONS) * 100);
        
        let completionMessage = '';
        if (scorePercentage >= window.interactiveFeatures.PASSING_SCORE_PERCENTAGE) {
            completionMessage = '🌟 Amazing! You know your animal sounds!';
        } else if (scorePercentage >= 60) {
            completionMessage = '👏 Good job! Keep listening!';
        } else {
            completionMessage = '😊 Nice try! Practice makes perfect!';
        }
        
        gameContainerElement.innerHTML = `
            <div class="sound-completion">
                <h2>${completionMessage}</h2>
                <div class="final-score">Final Score: ${this.correctAnswers}/5 (${scorePercentage}%)</div>
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