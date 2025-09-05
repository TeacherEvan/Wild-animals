// Interactive Features Module for Kindergarten Students
class InteractiveFeatures {
    constructor() {
        this.draggedElement = null;
        this.currentGame = null;
        this.score = 0;
        this.touchSupported = 'ontouchstart' in window;
        
        this.initializeFeatures();
    }

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

    setupDragAndDrop() {
        // Setup drag and drop for existing elements
        this.initializeDragAndDrop();
        
        // Also setup on DOMContentLoaded for initial page load
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initializeDragAndDrop());
        }
    }

    initializeDragAndDrop() {
        const draggables = document.querySelectorAll('.draggable');
        const dropZones = document.querySelectorAll('.drop-zone');

        console.log(`Initializing drag and drop: ${draggables.length} draggables, ${dropZones.length} drop zones`);

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

    handleDragStart(e, element) {
        this.draggedElement = element;
        element.classList.add('dragging');
        
        // Create a visual clone for dragging
        const clone = element.cloneNode(true);
        clone.classList.add('drag-clone');
        clone.style.position = 'fixed';
        clone.style.pointerEvents = 'none';
        clone.style.zIndex = '1000';
        
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

    handleDragMove(e) {
        if (!this.dragClone) return;
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
        
        this.dragClone.style.left = (clientX - this.dragClone.offsetWidth / 2) + 'px';
        this.dragClone.style.top = (clientY - this.dragClone.offsetHeight / 2) + 'px';
        
        // Highlight drop zones when dragging over them
        const elementBelow = document.elementFromPoint(clientX, clientY);
        const dropZone = elementBelow?.closest('.drop-zone');
        
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.classList.remove('drag-over');
        });
        
        if (dropZone && this.isValidDrop(this.draggedElement, dropZone)) {
            dropZone.classList.add('drag-over');
        }
    }

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
        
        document.querySelectorAll('.drop-zone').forEach(zone => {
            zone.classList.remove('drag-over');
        });
    }

    handleDragOver(e) {
        e.preventDefault();
    }

    handleDrop(e, dropZone) {
        e.preventDefault();
    }

    handleTouchMove(e) {
        if (this.draggedElement) {
            e.preventDefault();
        }
    }

    handleTouchEnd(e, dropZone) {
        this.handleDragEnd(e);
    }

    isValidDrop(draggable, dropZone) {
        // Check if the drop is valid based on data attributes
        const dragType = draggable.dataset.type;
        const dropType = dropZone.dataset.accepts;
        
        return dropType === 'any' || dropType === dragType;
    }

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
        this.updateScore(10);
        
        // Remove success class after animation
        setTimeout(() => {
            dropZone.classList.remove('drop-success');
        }, 1000);
        
        // Check if game is complete
        if (this.currentGame) {
            this.currentGame.checkCompletion();
        }
    }

    handleFailedDrop() {
        // Play error sound - DISABLED (only pronunciation allowed)
        // window.realAnimalSounds?.playUISound('incorrect');
        
        // Visual shake effect
        if (this.draggedElement) {
            this.draggedElement.classList.add('shake-animation');
            setTimeout(() => {
                this.draggedElement.classList.remove('shake-animation');
            }, 500);
        }
    }

    createCelebrationParticles(element) {
        const rect = element.getBoundingClientRect();
        const particles = 20;
        
        for (let i = 0; i < particles; i++) {
            const particle = document.createElement('div');
            particle.className = 'celebration-particle';
            particle.style.left = (rect.left + rect.width / 2) + 'px';
            particle.style.top = (rect.top + rect.height / 2) + 'px';
            particle.style.setProperty('--random-x', (Math.random() - 0.5) * 200 + 'px');
            particle.style.setProperty('--random-y', (Math.random() - 0.5) * 200 + 'px');
            particle.style.backgroundColor = ['#FFD700', '#FF69B4', '#87CEEB', '#98FB98'][Math.floor(Math.random() * 4)];
            
            document.body.appendChild(particle);
            
            setTimeout(() => particle.remove(), 1000);
        }
    }

    updateScore(points) {
        this.score += points;
        
        // Update main score
        const scoreElement = document.getElementById('interactive-score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
            scoreElement.classList.add('score-bump');
            setTimeout(() => scoreElement.classList.remove('score-bump'), 300);
        }
        
        // Update sound game score
        const soundScoreElement = document.getElementById('sound-score');
        if (soundScoreElement) {
            soundScoreElement.textContent = this.currentGame?.correctAnswers || 0;
            soundScoreElement.classList.add('score-bump');
            setTimeout(() => soundScoreElement.classList.remove('score-bump'), 300);
        }
    }

    startGame(gameType) {
        if (this.games[gameType]) {
            this.currentGame = this.games[gameType];
            this.currentGame.start();
        }
    }
}

// Habitat Matching Game
class HabitatMatchingGame {
    constructor() {
        this.habitats = {
            'savanna': ['Lion', 'Elephant', 'Giraffe', 'Zebra', 'Rhino'],
            'forest': ['Bear', 'Wolf', 'Fox', 'Leopard', 'Koala'],
            'ocean': ['Dolphin', 'Shark', 'Octopus', 'Penguin'],
            'jungle': ['Monkey', 'Gorilla', 'Tiger', 'Frog']
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
                    <div class="habitat-zone drop-zone" data-accepts="${habitat}">
                        <div class="habitat-bg habitat-${habitat}"></div>
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
            'Octopus': '🐙', 'Dolphin': '🐬', 'Shark': '🦈', 'Frog': '🐸'
        };
        return emojis[animal] || '🐾';
    }

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

// Animal Feeding Game
class AnimalFeedingGame {
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

    nextAnimal() {
        const animals = Object.keys(this.feedingData);
        const randomAnimal = animals[Math.floor(Math.random() * animals.length)];
        this.showAnimalToFeed(randomAnimal);
    }

    showAnimalToFeed(animalName) {
        // Implementation details...
    }
}

// Sound Matching Game
class SoundMatchingGame {
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

    playRandomSound() {
        // Play a random animal sound - KEEP (pronunciation only)
        const animals = ['Lion', 'Tiger', 'Elephant', 'Monkey', 'Wolf', 'Dolphin'];
        this.currentAnimal = animals[Math.floor(Math.random() * animals.length)];
        window.realAnimalSounds?.playAnimalSound(this.currentAnimal);
        
        // Show animal options
        this.showAnimalOptions();
    }

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

    generateSoundGameOptions() {
        // Get 3 wrong answers + 1 correct answer
        const allAnimals = ['Lion', 'Tiger', 'Elephant', 'Monkey', 'Wolf', 'Dolphin', 'Bear', 'Fox', 'Frog', 'Eagle'];
        const wrongAnimals = allAnimals.filter(animal => animal !== this.currentAnimal);
        const randomWrong = wrongAnimals.sort(() => Math.random() - 0.5).slice(0, 3);
        
        // Combine and shuffle
        const options = [this.currentAnimal, ...randomWrong];
        return options.sort(() => Math.random() - 0.5);
    }

    checkAnswer(selectedAnimal) {
        const isCorrect = selectedAnimal === this.currentAnimal;
        
        // Update score
        if (isCorrect) {
            this.correctAnswers++;
            window.interactiveFeatures.updateScore(10);
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
        }, 2000);
    }

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
        const percentage = Math.round((this.correctAnswers / 5) * 100);
        
        let message = '';
        if (percentage >= 80) {
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