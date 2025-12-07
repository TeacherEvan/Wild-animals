/**
 * Animal Sounds Module - Backward Compatibility Layer
 * This module maintains backward compatibility with legacy code.
 * All functionality is delegated to RealAnimalSounds (AudioManager).
 * 
 * Note: This is a compatibility layer that aliases window.realAnimalSounds
 * to maintain backward compatibility with existing code that uses window.animalSounds.
 */

// Wait for real-animal-sounds.js to load, then alias
if (typeof window.realAnimalSounds !== 'undefined') {
    window.animalSounds = window.realAnimalSounds;
} else {
    // Fallback: Create when realAnimalSounds becomes available
    Object.defineProperty(window, 'animalSounds', {
        get: function() {
            if (typeof window.realAnimalSounds === 'undefined') {
                console.warn('RealAnimalSounds not loaded yet. Returning placeholder.');
                // Return a minimal fallback object to prevent runtime errors
                return {
                    playAnimalSound: () => console.warn('Audio not ready'),
                    toggleSound: () => false,
                    isSoundEnabled: () => true,
                    pronounceAnimal: () => console.warn('Audio not ready')
                };
            }
            return window.realAnimalSounds;
        },
        configurable: true
    });
}
