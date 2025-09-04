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
        // Make draggable elements
        document.addEventListener('DOMContentLoaded', () => {
            const draggables = document.querySelectorAll('.draggable');
            const dropZones = document.querySelectorAll('.drop-zone');

            draggables.forEach(draggable => {
                // Mouse events
                draggable.addEventListener('mousedown', (e) => this.handleDragStart(e, draggable));
                
                // Touch events
                draggable.addEventListener('touchstart', (e) => this.handleDragStart(e, draggable), {passive: false});
            });

            dropZones.forEach(zone => {
                zone.addEventListener('dragover', (e) => this.handleDragOver(e));
                zone.addEventListener('drop', (e) => this.handleDrop(e, zone));
                zone.addEventListener('touchmove', (e) => this.handleTouchMove(e), {passive: false});
                zone.addEventListener('touchend', (e) => this.handleTouchEnd(e, zone));
            });

            // Global mouse/touch events
            document.addEventListener('mousemove', (e) => this.handleDragMove(e));
            document.addEventListener('mouseup', (e) => this.handleDragEnd(e));
            document.addEventListener('touchmove', (e) => this.handleDragMove(e), {passive: false});
            document.addEventListener('touchend', (e) => this.handleDragEnd(e));
        });
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
        const scoreElement = document.getElementById('interactive-score');
        if (scoreElement) {
            scoreElement.textContent = this.score;
            scoreElement.classList.add('score-bump');
            setTimeout(() => scoreElement.classList.remove('score-bump'), 300);
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
        window.interactiveFeatures.setupDragAndDrop();
        
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
            </div>
            <div class="score-display">Score: <span id="sound-score">0</span></div>
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
        const animals = ['Lion', 'Tiger', 'Elephant', 'Monkey', 'Wolf', 'Dolphin', 'Bear', 'Fox'];
        
        // Generate random options including the correct answer
        const options = [this.currentAnimal];
        const availableAnimals = animals.filter(animal => animal !== this.currentAnimal);
        
        // Add 3 random wrong answers
        while (options.length < 4) {
            const randomAnimal = availableAnimals[Math.floor(Math.random() * availableAnimals.length)];
            if (!options.includes(randomAnimal)) {
                options.push(randomAnimal);
            }
        }
        
        // Shuffle options
        options.sort(() => Math.random() - 0.5);
        
        // Create options HTML
        const optionsContainer = document.querySelector('.animal-options-grid');
        optionsContainer.innerHTML = options.map(animal => `
            <button class="sound-option-btn" onclick="window.interactiveFeatures.currentGame.selectAnimal('${animal}')">
                <span class="option-emoji">${this.getAnimalEmoji(animal)}</span>
                <span class="option-name">${animal}</span>
            </button>
        `).join('');
        
        optionsContainer.style.display = 'grid';
    }

    nextRound() {
        this.rounds++;
        // Clear previous options
        const optionsContainer = document.querySelector('.animal-options-grid');
        if (optionsContainer) {
            optionsContainer.innerHTML = '';
            optionsContainer.style.display = 'none';
        }
        // Ready for next sound to be played
    }

    selectAnimal(selectedAnimal) {
        const isCorrect = selectedAnimal === this.currentAnimal;
        
        if (isCorrect) {
            this.correctAnswers++;
            this.showFeedback('Correct! 🎉', 'success');
            this.updateScore(10);
        } else {
            this.showFeedback(`Wrong! It was ${this.currentAnimal} 🦁`, 'error');
        }
        
        // Move to next round after a delay
        setTimeout(() => this.nextRound(), 2000);
    }
    
    getAnimalEmoji(animal) {
        const emojis = {
            'Lion': '🦁', 'Tiger': '🐯', 'Elephant': '🐘', 'Monkey': '🐵',
            'Wolf': '🐺', 'Dolphin': '🐬', 'Bear': '🐻', 'Fox': '🦊',
            'Giraffe': '🦒', 'Zebra': '🦓', 'Rhino': '🦏', 'Leopard': '🐆',
            'Koala': '🐨', 'Gorilla': '🦍', 'Penguin': '🐧', 'Eagle': '🦅',
            'Octopus': '🐙', 'Shark': '🦈', 'Frog': '🐸'
        };
        return emojis[animal] || '🐾';
    }
    
    showFeedback(message, type) {
        const feedback = document.createElement('div');
        feedback.className = `sound-feedback ${type}`;
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: ${type === 'success' ? '#4CAF50' : '#f44336'};
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 1.5em;
            font-weight: bold;
            z-index: 1000;
            animation: fadeInOut 2s ease-in-out;
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => feedback.remove(), 2000);
    }
    
    updateScore(points) {
        const scoreElement = document.getElementById('sound-score');
        if (scoreElement) {
            const currentScore = parseInt(scoreElement.textContent) + points;
            scoreElement.textContent = currentScore;
        }
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