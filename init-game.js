/**
 * Game initialization module
 * Initializes the game when DOM is ready
 */
import { initializeGame } from './game-core.js?v=4d0489cc';

// Initialize the game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeGame);
} else {
  initializeGame();
}