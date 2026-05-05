# 📁 Wild Animals Audio Setup

## BEFORE (Current State)

```
Wild-animals/
├── index.html
├── real-animal-sounds.js
├── animal-sounds.js
├── interactive-features.js
└── audio/
    └── sound-loader.js ✓ ADDED
```

## AFTER (What You Need to Add or Replace)

```
Wild-animals/
├── index.html (✓ Modified)
├── real-animal-sounds.js (✓ Modified)
├── animal-sounds.js
├── interactive-features.js
└── audio/
    ├── sound-loader.js ✓
    └── sounds/ ← CREATE THIS FOLDER
        ├── roar.mp3 ← PLACEHOLDER EXISTS, LICENSED REPLACEMENT OPTIONAL
        ├── roar.wav ← GENERATED PLACEHOLDER ALSO WORKS
        ├── waddle-waddle.mp3
        ├── trumpet.mp3
        ├── ooh-ooh-ah-ah.mp3
        ├── howl.mp3
        ├── growl.mp3
        ├── click-click.mp3
        ├── ribbit.mp3
        ├── screech.mp3
        ├── hum.mp3
        ├── neigh.mp3
        ├── snort.mp3
        ├── yip-yip.mp3
        ├── grunt.mp3
        ├── snore.mp3
        ├── hoo-hoo.mp3
        ├── splash.mp3
        └── whoosh.mp3
```

## THREE PRACTICAL WAYS TO HANDLE AUDIO FILES

### 🎤 Method 1: Generate Placeholders (FASTEST)

1. Run `bash generate-audio.sh`
2. Confirm files appear in `audio/sounds/`
3. Use these placeholders only for local testing

Animals you need sounds for:

- roar (for Lion, Tiger)
- waddle-waddle (for Penguin)
- trumpet (for Elephant)
- ooh ooh ah ah (for Monkey)
- howl (for Wolf)
- growl (for Bear, Leopard)
- click click (for Dolphin)
- ribbit (for Frog)
- screech (for Eagle)
- hum (for Giraffe)
- neigh (for Zebra)
- snort (for Rhino)
- yip yip (for Fox)
- grunt (for Kangaroo)
- snore (for Koala)
- hoo hoo (for Gorilla)
- splash (for Shark)
- whoosh (for Octopus)

### 🎙️ Method 2: Use Licensed Replacements

1. Prefer your own recordings, Freesound `CC0` or `CC-BY`, or compatible Wikimedia Commons files
2. Replace matching filenames in `audio/sounds/`
3. Keep attribution and license notes with the project

### 🤖 Method 3: Avoid Arbitrary Scraping

1. Xeno-Canto is bot-protected and not suitable for unattended scraping here
2. Freesound requires login/API handling and per-file license checks
3. Public web audio is not automatically reusable

## FILE NAMING RULES ⚠️

IMPORTANT: File names MUST match exactly:

- ✅ roar.mp3
- ❌ roar.mp3.mp3
- ❌ ROAR.mp3 (case sensitive on some systems)
- ❌ roar wave.mp3 (spaces not in mapping)

## VERIFICATION CHECKLIST ✓

After adding files:

- [x] Folder exists: audio/sounds/
- [x] At least one audio file in audio/sounds/
- [x] File names match the mapping list
- [x] Files are in MP3 format or generated WAV placeholders
- [x] File names have no extra spaces or characters

## TEST IT

```bash
# 1. Start web server
python -m http.server 8080

# 2. Open in browser
http://localhost:8080/

# 3. Click on any animal
# Should hear a local audio file or fall back to text-to-speech

# 4. Check browser console (F12) for any errors
```

## HOW IT WORKS

Player clicks animal → Audio system tries to load MP3 → If missing, tries WAV placeholder → If still missing, falls back to text-to-speech pronunciation

Everything is automatic! 🎉

## NEED HELP?

- Check AUDIO_IMPLEMENTATION.md for detailed info
- Look at browser console (F12) for error messages
- Verify files are in: audio/sounds/
- Verify file names are correct
- Try a different browser if issues persist
