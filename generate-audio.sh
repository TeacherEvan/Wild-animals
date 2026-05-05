#!/bin/bash
set -euo pipefail

# Generate placeholder WAV files for local testing.
# Preferred production assets are still MP3 voice clips, but these files let the
# application exercise the non-TTS audio path without external tools.

mkdir -p audio/sounds

python3 <<'PY'
import math
import os
import struct
import wave

sample_rate = 22050
duration_seconds = 0.45
fade_seconds = 0.04
output_dir = os.path.join("audio", "sounds")

sound_frequencies = {
    "roar": 180,
    "waddle-waddle": 220,
    "trumpet": 260,
    "ooh-ooh-ah-ah": 300,
    "howl": 340,
    "growl": 160,
    "click-click": 880,
    "ribbit": 420,
    "screech": 700,
    "hum": 240,
    "neigh": 520,
    "snort": 200,
    "yip-yip": 620,
    "grunt": 140,
    "snore": 120,
    "hoo-hoo": 360,
    "splash": 460,
    "whoosh": 500,
    "hiss": 540,
    "chirp": 760,
    "squawk": 640,
    "silent": 80,
    "hoot": 280,
    "chatter": 680,
    "snuffle": 150,
    "buzz": 920,
}

frame_count = int(sample_rate * duration_seconds)
fade_frames = max(1, int(sample_rate * fade_seconds))

for index, (sound_name, base_frequency) in enumerate(sound_frequencies.items()):
    wav_path = os.path.join(output_dir, f"{sound_name}.wav")
    with wave.open(wav_path, "w") as wav_file:
        wav_file.setnchannels(1)
        wav_file.setsampwidth(2)
        wav_file.setframerate(sample_rate)

        frames = []
        for frame_index in range(frame_count):
            time_point = frame_index / sample_rate
            harmonic = math.sin(2 * math.pi * base_frequency * time_point)
            overtone = 0.35 * math.sin(2 * math.pi * (base_frequency * 1.5) * time_point)
            envelope = 1.0
            if frame_index < fade_frames:
                envelope = frame_index / fade_frames
            elif frame_index > frame_count - fade_frames:
                envelope = (frame_count - frame_index) / fade_frames

            sample = int(22000 * envelope * (harmonic + overtone) / 1.35)
            frames.append(struct.pack("<h", sample))

        frame_bytes = b"".join(frames)
        wav_file.writeframes(frame_bytes)

    mp3_compat_path = os.path.join(output_dir, f"{sound_name}.mp3")
    with open(wav_path, "rb") as source_file, open(mp3_compat_path, "wb") as target_file:
        target_file.write(source_file.read())

print(f"Generated {len(sound_frequencies)} placeholder WAV files in {output_dir}")
PY

echo ""
echo "Generated placeholder WAV files and MP3 compatibility copies for local testing."
echo "Replace the placeholder .mp3 files with real voice recordings when production assets are ready."
