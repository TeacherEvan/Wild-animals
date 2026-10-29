# Audio Diet — 2026-10-30

## Why

The game shipped **631 MB** of audio. The loader referenced **124.6 MB** of it, and one cue — the parrot — was a **34 MB, 186-second** field recording fetched when a child tapped the parrot. On a classroom tablet or mobile data, that is not a sound effect; it is a download.

A second defect surfaced while measuring: `audio/sound-loader.js` preferred any `.mp3` over a `.wav`, so four real recordings (Monkey, Shark, Squirrel, Bee) were masked by 0.4-second placeholder MP3s.

## What changed

- Source selection is now **by duration, not extension**. The longest candidate wins, so a real 31-second splash recording beats a 0.4-second placeholder.
- Each cue is trimmed to the **loudest ~5-second window**, with 80 ms fade-in and 120 ms fade-out.
- Loudness is normalised toward **-18 dB RMS**, capped at **-1 dB peak** and **+30 dB gain**, so quiet field recordings (zebra, fox, owl, bee) are audible without clipping.
- Encoded as **mono MP3, 44.1 kHz, 96 kbps**.
- Short cues (< 1 second) are left untouched; they are already small.
- All originals are archived outside the repo at
  `~/Lea/wild-animals-audio-archive/2026-10-30-originals/audio/sounds/`
  before anything is replaced or removed.

## Result

| Metric | Before | After |
|---|---:|---:|
| Deployed audio folder | 631 MB | **1.34 MB** |
| Referenced audio | 124.6 MB | **1.34 MB** |
| Unreferenced audio | 538.5 MB | 0 (archived) |
| Working tree (excluding node_modules/.git) | 634 MB | **5.1 MB** |
| Largest cue | 34.1 MB (186 s) | **59 KB (5 s)** |

28 unique sound keys cover all 30 animals (grunt is shared by kangaroo, camel and hippo).

## Reproduce / extend

```bash
npm run audio:diet:check   # dry run: prints the plan, writes nothing
npm run audio:diet         # archive originals, trim, encode
npm run test:unit          # includes test/audio-assets.test.js
```

The guard test fails if any cue exceeds 200 KB, if the total exceeds 3 MB, if an animal loses its MP3, or if a WAV file reappears in `audio/sounds/`.

To add a new animal:

1. Put the best available recording in `audio/sounds/<sound_key>.wav` (or `.mp3`).
2. Map the animal in `animalSoundMap` inside `audio/sound-loader.js`.
3. Run `npm run audio:diet` and then `npm run test:unit`.
4. Listen to the generated cue before committing. The script picks the loudest 5-second window automatically; if the interesting call sits elsewhere, adjust `TARGET_SECONDS` or the window logic rather than shipping the raw field recording.

## Known limitation

Git history still contains the original 440 MB pack. The working tree and every future deploy are small, but clones remain heavy until history is rewritten. That is a separate, destructive operation (`git filter-repo`) and should be done with Evan's sign-off and a fresh backup mirror.
