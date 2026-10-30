/**
 * Game initialization module
 * Initializes the game when DOM is ready
 */
import { initializeGame } from './game-core.js?v=883eb29b';

// Initialize the game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeGame);
} else {
  initializeGame();
}