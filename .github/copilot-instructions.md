# Wild Animals Adventure - GitHub Copilot Instructions

Always reference these instructions first and fallback to search or bash commands only when you encounter unexpected information that does not match the info here.

## Working Effectively

### Repository Overview
Wild Animals Adventure is a client-side educational web application designed for kindergarten students to learn about animals through interactive games. The application runs entirely in the browser with no server-side dependencies.

### Bootstrap and Run the Application
- `cd /home/runner/work/Wild-animals/Wild-animals`
- `python3 -m http.server 8080` -- starts local web server instantly
- Open browser to `http://localhost:8080/` to access the application
- **No build process required** - the application runs directly in the browser

### Application Architecture
- **Primary file**: `index.html` (65KB) - Complete single-page application
- **Audio system**: `animal-sounds.js` (48KB) + `real-animal-sounds.js` (5KB)
- **Interactive features**: `interactive-features.js` (23KB)
- **Total size**: ~138KB for complete application (3 JavaScript files)
- **Dependencies**: None - pure HTML/CSS/JavaScript (3 files total)

### GitHub Actions Status
- **CRITICAL**: The `.github/workflows/node.js.yml` workflow expects npm commands but **no package.json exists**
- `npm ci` will fail with "cannot install without package-lock.json"
- `npm run build --if-present` will fail with "Could not read package.json"
- `npm test` will fail with "Could not read package.json"
- **Solution**: Either remove the GitHub workflow or create a minimal package.json

## Application Features and Testing

### Core Game Modes (6 total)
1. **Classic Mode** - 10 animal identification questions
2. **Speed Mode** - Time-based challenges with countdown timer
3. **Survival Mode** - Play until first mistake
4. **Quiz Mode** - Mixed question types (habitat, diet, sounds)
5. **Habitat Match** - Drag & drop animals to correct habitats (18 animals, 4 habitats)
6. **Sound Game** - Audio-based animal identification

### Validation Scenarios
**ALWAYS test these complete user workflows after making changes:**

1. **Basic Game Flow Test**:
   - Load application
   - Click "Classic Mode" 
   - Select an answer option (observe selection feedback)
   - Click "Next Animal →" button
   - Verify question counter advances (1/10 → 2/10)
   - Verify new animal and options appear

2. **Interactive Mode Test**:
   - Click "Habitat Match" mode
   - Verify 4 habitat zones appear (Savanna, Forest, Ocean, Jungle)
   - Verify 18 animal cards appear in bottom pool
   - Test drag and drop functionality (if supported in test environment)

3. **Audio System Test**:
   - Click animal emoji to trigger sound pronunciation
   - Toggle sound button (🔊/🔇) in top-right corner
   - Verify text-to-speech pronunciation works
   - Test in "Sound Game" mode with play button

4. **Cross-Mode Navigation Test**:
   - Switch between all 6 game modes
   - Verify each mode loads correctly
   - Check for JavaScript console errors (minor errors expected during mode switching)

### Performance Expectations
- **Page load**: <0.01 seconds (instant for static files)
- **Mode switching**: Immediate (no loading time)
- **Audio response**: 200-500ms for text-to-speech initialization
- **File sizes**: No large downloads - entire app is ~138KB

## Browser Compatibility and Testing

### Supported Browsers
- ✅ Chrome (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile) 
- ✅ Safari (Desktop & Mobile)
- ✅ Edge (Desktop & Mobile)
- ✅ Mobile browsers (iOS Safari, Android Chrome)

### Audio System Details
- **Primary**: Web Audio API (disabled in current implementation)
- **Fallback**: Speech Synthesis API (text-to-speech)
- **Features**: Animal name pronunciation, UI sound effects
- **Graceful degradation**: Application works even if audio fails

### Testing in Browser Environment
- Use browser automation tools for comprehensive testing
- Take screenshots to verify visual layout
- Test touch/click interactions on all buttons
- Verify responsive design on different screen sizes

## Common Development Tasks

### Debugging Application Issues
- Open browser developer console to check for JavaScript errors
- Verify all JavaScript modules load correctly:
  - `window.realAnimalSounds` should be available
  - `window.animalSounds` should be available (backward compatibility)
  - `window.interactiveFeatures` should be available
- Check console for audio system initialization messages

### Making Code Changes
- **CRITICAL**: This is a single-page application - most logic is in `index.html`
- Audio modifications go in `animal-sounds.js` or `real-animal-sounds.js`
- Interactive features (drag & drop) are in `interactive-features.js`
- Test changes immediately by refreshing browser - no build step needed

### Common File Locations
```
/home/runner/work/Wild-animals/Wild-animals/
├── index.html                    # Main application (65KB)
├── animal-sounds.js              # Audio system (48KB)
├── real-animal-sounds.js         # Audio fallback (5KB)
├── interactive-features.js       # Drag & drop features (23KB)
├── README.md                     # Project documentation
├── BUG_FIX_SUMMARY.md           # Bug fix history
├── KINDERGARTEN_ENHANCEMENTS.md # Feature documentation
└── .github/
    └── workflows/
        └── node.js.yml          # ⚠️ Problematic workflow (no package.json)
```

## Known Issues and Limitations

### GitHub Actions Workflow Issue
- **Problem**: Workflow expects Node.js/npm setup but no package.json exists
- **Impact**: CI builds will fail
- **Solutions**: 
  1. Remove `.github/workflows/node.js.yml` (simplest)
  2. Create minimal `package.json` with empty scripts
  3. Update workflow to skip npm commands

### Minor JavaScript Errors
- **Expected**: Some console errors during game mode switching
- **Impact**: Does not affect functionality
- **Root cause**: Complex state management between different game modes
- **Action**: These are cosmetic and can be ignored unless fixing specific mode switching

### Audio Limitations
- **Text-to-speech only**: Real animal sound CDN links removed to avoid blocking
- **Browser dependency**: Requires Speech Synthesis API support
- **Graceful degradation**: Game works without audio

## Development Environment Setup

### Minimal Setup
```bash
cd /home/runner/work/Wild-animals/Wild-animals
python3 -m http.server 8080 &
# Application now available at http://localhost:8080/
```

### No Build Dependencies Required
- No npm install needed
- No webpack/bundling required
- No transpilation needed
- No CSS preprocessing required

### For Comprehensive Testing
```bash
# Start server
python3 -m http.server 8080 &

# Test basic connectivity
curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/
# Should return: 200

# Check file sizes (for performance reference)
wc -c *.html *.js
# Should show ~138KB total

# Stop server when done
pkill -f "python3 -m http.server"
```

## Educational Context

### Target Audience
- **Age group**: Kindergarten students (ages 4-6)
- **Learning goals**: Animal recognition, name pronunciation, habitat knowledge
- **Interaction style**: Touch-friendly, visual feedback, positive reinforcement

### Accessibility Features
- Large buttons and touch targets (minimum 44px, recommended 60px)
- High contrast colors and clear visual hierarchy
- Text-to-speech for audio accessibility
- Keyboard navigation support
- Works on touch devices and desktop

### Content Structure
- **20 animals**: Lion, Tiger, Elephant, Bear, Wolf, Fox, etc.
- **4 habitats**: Savanna, Forest, Ocean, Jungle
- **Interactive elements**: Drag & drop, sound effects, animations
- **Progressive difficulty**: Multiple game modes from simple to complex

## Quick Reference Commands

```bash
# Start application
python3 -m http.server 8080

# Test load time
time curl -s http://localhost:8080/ > /dev/null

# Check application size
du -sh *.html *.js

# View application structure
ls -la *.html *.js *.md

# Stop server
pkill -f "python3 -m http.server"
```

Remember: This is a **static web application** that requires no build process and runs entirely in the browser with just 3 JavaScript files. Focus on browser-based testing and user experience validation rather than traditional software build/test cycles.