/**
 * Game initialization module
 * Initializes the game when DOM is ready
 * Applies WCAG 2.4.11 focus margins
 */
import { initializeGame } from './game-core.js?v=883eb29b';

/**
 * Apply scroll-margin-top to all focusable targets for WCAG 2.4.11.
 * Sticky header height ~5rem.
 */
function applyFocusMargins() {
  const stickyHeight = '5rem';
  document.querySelectorAll('section[id], [data-focus-target]').forEach(el => {
    el.style.scrollMarginTop = stickyHeight;
    el.style.scrollMarginBottom = '4rem';
  });
}

// The dither layer is a pre-rasterised CSS background tile (see styles.css);
// no runtime SVG filter is injected, so no layout/paint stall occurs.

// Initialize the game when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    applyFocusMargins();
    initializeGame();
  });
} else {
  applyFocusMargins();
  initializeGame();
}
