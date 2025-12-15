## 🔧 Audio System Troubleshooting Guide

### ❌ Problem: Audio not playing at all

**Solution 1: Verify files exist**

```bash
# Check if audio/sounds/ directory exists
ls audio/sounds/  (Mac/Linux)
dir audio\sounds  (Windows)

# You should see MP3 files like:
# roar.mp3
# waddle-waddle.mp3
# etc.
```

**Solution 2: Check browser console for errors**

1. Press F12 to open Developer Tools
2. Go to Console tab
3. Look for errors like:
   - "Failed to load audio: audio/sounds/roar.mp3"
   - "Audio file not found"
4. This tells you exactly which file is missing

**Solution 3: Verify filenames match exactly**

- Check the AUDIO_IMPLEMENTATION.md for the exact mapping
- File names are case-sensitive on Mac/Linux
- No extra spaces or characters allowed
- ✅ roar.mp3
- ❌ roar (no extension)
- ❌ roar .mp3 (extra space)
- ❌ ROAR.mp3 (wrong case on Unix)

---

### ⏱️ Problem: Slow first playback (delay before sound)

**Expected behavior** - This is normal!

- First play: 100-500ms delay (Web Audio API decoding)
- Subsequent plays: Instant (from cache)

**To minimize delay:**

1. Pre-load audio files by clicking animals during app startup
2. Reduce MP3 file size (longer files take longer to decode)
3. Use mono instead of stereo audio (smaller file size)

---

### 🔊 Problem: Hearing text-to-speech instead of human voice

**This means:** Audio files not found or Web Audio API issue

**Step 1: Check if files exist**

```bash
# Verify files in audio/sounds/
ls audio/sounds/roar.mp3  (Mac/Linux)
dir audio\sounds\roar.mp3  (Windows)

# Should respond with file size, not "file not found"
```

**Step 2: Verify correct directory**

- Files must be in: `audio/sounds/`
- Not in: `audio/` alone
- Not in: `sounds/`
- Full path should be: `[website]/audio/sounds/roar.mp3`

**Step 3: Check file format**

- Only MP3 format supported
- ❌ WAV, OGG, AAC, M4A won't work
- Convert files using Audacity or similar tool

**Step 4: Verify Web Audio API available**
Open browser console and run:

```javascript
console.log(typeof window.AudioContext || window.webkitAudioContext);
```

Should output: `"function"`

If output is `"undefined"`, browser doesn't support Web Audio API (very rare)

---

### 📋 Problem: Wrong sounds for certain animals

**Example:** Penguin playing "roar" instead of "waddle-waddle"

**Solution: Check the mapping**
Open `audio/sound-loader.js` and verify the `animalSoundMap` object.

Expected for Penguin:

```javascript
'Penguin': 'waddle-waddle'
```

To fix:

1. Verify `waddle-waddle.mp3` file exists
2. Verify filename exactly matches the mapping
3. Restart browser (clear audio cache)
4. Try different browser to confirm

---

### 🔇 Problem: Sound works but volume is too low/high

**Solution: Adjust volume**
Open browser console and run:

```javascript
// Set volume to 50%
window.soundLoader.setVolume(0.5);

// Set volume to 100%
window.soundLoader.setVolume(1.0);

// Set volume to 25%
window.soundLoader.setVolume(0.25);
```

To make this permanent, edit `audio/sound-loader.js`:

```javascript
this.masterVolume = 0.8; // Change to 0.5, 1.0, etc.
```

---

### 🌐 Problem: Works locally but not on live server

**Most common issue:** CORS (Cross-Origin Resource Sharing) errors

**Check browser console** - Look for:

```
Access to XMLHttpRequest... has been blocked by CORS policy
```

**Solutions:**

1. **If hosting on same domain:**
   - Make sure `audio/sounds/` directory is publicly accessible
   - Test with: `curl https://yoursite.com/audio/sounds/roar.mp3`
   - Should return audio data, not "404 Not Found"

2. **If hosting on different domain:**
   - Add CORS headers to server
   - For Apache: Add to .htaccess
   - For Node.js: Use CORS middleware
   - For static hosting (GitHub Pages, Vercel): Usually works by default

3. **Alternative: Use base64 encoded audio**
   - More complex but avoids CORS issues
   - See AUDIO_IMPLEMENTATION.md for details

---

### 🎯 Problem: Need to add a new animal sound

**Steps:**

1. Get audio file or create it:
   - Use Google Translate method
   - Or record yourself
   - Or use TTS service

2. Save with correct filename to `audio/sounds/`

3. Add mapping in `audio/sound-loader.js`:

   ```javascript
   'NewAnimal': 'sound-filename'  // without .mp3 extension
   ```

4. Add animal to index.html game modes

5. Test by clicking the animal

---

### 💾 Problem: Audio files too large, slow to download

**Solutions:**

1. **Reduce audio quality in MP3 settings:**
   - Use lower bitrate (128 kbps instead of 320 kbps)
   - Reduces file size 50-75%
   - Most people won't notice quality loss
   - Use Audacity: File → Export → Options → Bitrate

2. **Use mono instead of stereo:**
   - Reduces file size by 50%
   - For voice recordings, mono sounds identical

3. **Trim silence:**
   - Remove long pauses at start/end
   - Shorten total duration

4. **Test file size:**

   ```bash
   # Check file size (Mac/Linux)
   ls -lh audio/sounds/roar.mp3

   # Check file size (Windows)
   dir audio\sounds\roar.mp3
   ```

   Good target: < 50KB per file

---

### 🎮 Problem: Sound plays but no visual feedback (waves, animation)

**Solution: Check CSS and HTML**

- Verify `animalEmoji` element has correct ID
- Check that sound wave CSS exists in styles.css
- Make sure animations aren't disabled in browser settings
- Open console to verify no JavaScript errors

---

### 🔄 Problem: Audio plays multiple times when clicking quickly

**This is expected behavior** - Intentional design:

- Clicking quickly fires multiple play requests
- Each request plays independently
- Users can create sound layering effect

**To prevent (if desired):**
Edit `real-animal-sounds.js`:

```javascript
stopCurrentSound(); // Add before playing
```

---

### 📱 Problem: Audio not working on mobile

**Common issues on mobile:**

1. **Audio context locked by browser:**
   - Some browsers require user interaction first
   - Solution: Click an animal first, then others will work

2. **Speaker/mute switch:**
   - Check device isn't muted
   - Check volume isn't at 0

3. **Browser autoplay policy:**
   - Safari/Chrome restrict autoplay audio
   - Solution: Audio only plays on user click (already implemented)

4. **Network latency:**
   - Mobile networks slower
   - First play may have longer delay
   - Subsequent plays still cached and instant

**Test on mobile:**

```
1. Open http://localhost:8080 on phone
2. Tap an animal
3. Should hear human voice or text-to-speech
4. Check F12 console for errors
```

---

### 💬 Quick Debug Checklist

When something isn't working, check these in order:

1. ✅ Audio files exist in `audio/sounds/`
2. ✅ Filenames match the mapping exactly
3. ✅ Files are MP3 format (not WAV, OGG, etc.)
4. ✅ Check browser console (F12) for errors
5. ✅ Try different browser
6. ✅ Clear browser cache (Ctrl+Shift+Delete)
7. ✅ Restart web server
8. ✅ Check network tab in DevTools to verify file downloads
9. ✅ Verify Web Audio API is available
10. ✅ Check volume isn't muted (0%)

---

### 📞 Still Need Help?

1. Check the error message in browser console (F12)
2. Search this file for that error
3. Read AUDIO_IMPLEMENTATION.md for technical details
4. Check QUICK_AUDIO_SETUP.md for setup instructions
5. Verify all files are in correct locations
6. Test with simple MP3 files first (any will work)

The system is designed to be forgiving - it will always fall back to text-to-speech if anything goes wrong!
