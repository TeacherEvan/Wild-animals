# 🦁 Wild Animals Adventure - Enhanced Edition 🐯

An interactive educational game designed for kindergarten students to learn about wild animals through fun, engaging activities and real animal sounds!

## � New Features

### 🔊 Real Animal Sounds
- **Authentic Audio**: Real animal sounds from high-quality audio sources
- **Visual Feedback**: Sound wave animations when animals make sounds
- **Loading Indicators**: Child-friendly loading animations while sounds load
- **Fallback Support**: Text-to-speech backup if audio files fail to load

### 🎮 Interactive Game Modes

#### 🏠 Habitat Matching (NEW!)
- **Drag & Drop**: Kids can drag animals to their correct habitats
- **Visual Learning**: Colorful habitat backgrounds (savanna, forest, ocean, jungle)
- **Touch Support**: Works on tablets and touchscreen devices
- **Celebration Effects**: Confetti and particles when matching correctly

#### 🔊 Sound Guessing Game (NEW!)
- **Audio Recognition**: Play animal sounds and guess which animal it is
- **Big Play Button**: Easy-to-tap button for young children
- **Visual Options**: Animal pictures to choose from

#### Classic Modes (Enhanced)
- **🎯 Classic Mode**: 10 questions with staged answer feedback and guided auto-advance
- **⚡ Speed Mode**: Time-based challenges with bonus points
- **🔥 Survival Mode**: Keep playing until you make a mistake
- **🧠 Quiz Mode**: Mixed question types about habitats, diet, and sounds

### 👀 Attention & Sensory Tools (NEW!)

- **Eyes on Me Cue**: A call-and-response reset (“Eyes on me” → “Eyes on you!”) with a slow breath and one big “I’m ready” action. The speed clock pauses while it is open.
- **Wiggle Break**: Four six-second animal movements (elephant stomps, eagle flaps, giraffe stretch, sleepy-wolf breath) with a progress bar, countdown and skip button. Offered gently at the halfway point.
- **Set Progress**: The round is chunked into “Set 1 of 2” with ten progress dots, plus a “Halfway Hero” acknowledgement at question five.
- **Sensory Settings**: Sound, gentle motion, gentle buzz (haptics) and high contrast — remembered on the device. Gentle motion follows the operating system’s reduced-motion setting and also suppresses particles and confetti.
- **Curiosity Nudge**: Correct answers now show the animal’s fact (“Did you know? …”) to turn a right answer into a wondering moment.

### 📲 Installable & Offline (NEW!)

- **Real app icons**: 192 px, 512 px, maskable 512 px, Apple touch icon and favicon.
- **Offline play**: a generated service worker precaches the shell, all 28 animal cues and the icons (~1.9 MB total), so the game keeps working in a classroom with no Wi-Fi after the first visit.
- **Update-safe caching**: the cache name changes whenever any precached file changes, and old caches are deleted.
- **Installable**: standalone manifest with a scoped start URL and maskable icon.

See `docs/PWA_OFFLINE.md` for the cache strategy and update behaviour.

### 🎨 Visual Enhancements
#### Animations
- **Animal Movements**: Animals bounce, shake, and roar
- **Classic Quiz Handoffs**: Answer commit, progress cue, and next-animal entrance work as one sequence
- **Sound Waves**: Visual ripples when sounds play
- **Drag Effects**: Smooth dragging with shadow effects
- **Celebration Particles**: Colorful particles for correct answers
- **Score Bumps**: Numbers grow when points are earned

#### Kid-Friendly Design
- **Large Buttons**: Easy to tap for small fingers
- **Bright Colors**: Engaging color palette
- **Clear Emojis**: Large, recognizable animal emojis
- **Simple Navigation**: Clear mode selection

### 📱 Cross-Browser Compatibility
- ✅ Google Chrome
- ✅ Microsoft Edge
- ✅ Mozilla Firefox
- ✅ Safari
- ✅ Mobile browsers (iOS/Android)
- ✅ Automated Playwright matrix: Chromium, Firefox, WebKit, Pixel 7 and iPhone 13

## 🧪 Quality Gates

- **Unit**: 90 Vitest tests, including audio payload, PWA assets and deterministic WCAG contrast tokens.
- **Accessibility**: axe WCAG 2.1 A/AA on the main screen, attention cue, sensory panel, wiggle break and dark theme; fails on critical and serious violations.
- **Browser matrix**: Chromium, Firefox, WebKit, Pixel 7 and iPhone 13.
- **Responsive**: 320×568, 390×844 and 844×390, plus a real touchscreen tap on mobile projects.
- **Offline**: the generated service worker is installable and serves the shell and animal audio with no network.
- **Budget**: initial shell under 600 KB and no animal audio fetched before a tap.

See `docs/QUALITY_GATES.md` for the full gate list and known limits.

## 🚀 Getting Started

1. Start a local static server from the repository root: `python3 -m http.server 8080`
2. Open `http://localhost:8080/` in any modern web browser
3. Click on a game mode to start playing
4. Turn sound on/off using the speaker button in the top-right

## 🌐 Deployment

- Deploy the repository directly to any static host
- No image build or application server is required
- Recommended targets: GitHub Pages, Netlify, Vercel, or any CDN-backed static host

## � How to Play

### Classic Animal Quiz
1. Look at the animal emoji
2. Click on animal names to hear their sounds
3. Pick the answer and watch the progress cue prepare the next animal automatically
4. Earn points and build streaks!

### Classic Mode Motion Notes
- Answer choices lock immediately so children can clearly see what they picked.
- A visible "Next animal is getting ready..." progress cue explains the short auto-advance pause.
- Reduced-motion users keep the same feedback and timing without the animated scene handoff.

### Habitat Matching Game
1. Drag animals from the bottom pool
2. Drop them into their correct habitat
3. Match all animals to complete the game
4. Try to get a perfect score!

### Sound Guessing Game
1. Click the big play button to hear an animal sound
2. Choose which animal makes that sound
3. Score points for correct guesses

## 🛠️ Technical Features

### Audio System
- Preloaded common animal sounds for faster playback
- Audio caching to reduce loading times
- Web Audio API for UI sound effects
- Graceful fallback to text-to-speech

### Interaction System
- Mouse and touch event support
- Drag and drop with visual feedback
- Accessible button sizes and spacing
- Responsive design for all screen sizes

### Educational Value
- **Animal Recognition**: Visual learning with emojis
- **Sound Association**: Connect animals to their sounds
- **Habitat Learning**: Understand where animals live
- **Diet Categories**: Learn about carnivores, herbivores, omnivores
- **Memory Skills**: Remember animal characteristics
- **Motor Skills**: Drag and drop activities

## 🎓 For Educators

This game supports early childhood education by:
- Building vocabulary (animal names)
- Developing classification skills
- Encouraging audio-visual association
- Supporting fine motor skill development
- Providing positive reinforcement

## 🔧 Customization

To add more animals, edit the `animals` array in `index.html`:

```javascript
{ 
    emoji: '🦁', 
    name: 'Lion', 
    sound: 'roar', 
    habitat: 'Savanna', 
    diet: 'Carnivore' 
}
```

## 📝 Files Structure

- `index.html` - Main game file with all game logic
- `styles.css` - Shared presentation and responsive layout
- `animal-sounds.js` - Text-to-speech pronunciation system
- `real-animal-sounds.js` - Real animal audio playback system
- `interactive-features.js` - Drag & drop and interactive games
- `attention-sensory.js` - Attention cue, wiggle break, chunk schedule and sensory preferences
- `pwa.js` - Service-worker registration
- `sw.js` - Generated offline cache (do not edit by hand)
- `icons/` - PNG app icons and maskable icon
- `scripts/optimize-audio.py` - Trims and compresses animal cues (see `docs/AUDIO_DIET.md`)
- `manifest.json` - PWA metadata for installable browser support
- `README.md` - This documentation file

## 🌈 Future Enhancements

- Animal fact cards with more information
- Drawing mode to color animals
- More puzzle games
- Achievement badges
- Multi-language support
- Offline mode with cached sounds

## 🙏 Credits

Created with ❤️ for kindergarten students to make learning about animals fun and interactive!

---

**Note**: For best experience, ensure your device volume is turned up and you have a stable internet connection for loading animal sounds.
