#!/usr/bin/env python3
"""
Audio diet for Wild Animals Adventure.

Why: the game shipped 631 MB of audio, 124.6 MB of it referenced by the loader,
including a 34 MB / 186-second parrot recording fetched when a child taps the
parrot. This script picks the best source per animal, trims it to a short cue,
normalises loudness, and encodes a small mono MP3.

It also fixes a loader-content bug: the old preference order took any .mp3 over
a .wav, so four real recordings (Monkey, Shark, Squirrel, Bee) were masked by
0.4-second placeholder MP3s. Source selection here is by duration, not extension.

Usage:
    python3 scripts/optimize-audio.py --dry-run
    python3 scripts/optimize-audio.py --apply

Originals are copied to ~/Lea/wild-animals-audio-archive/<date>-originals/
before anything is replaced or removed. Nothing is deleted outright.
"""

from __future__ import annotations

import argparse
import json
import re
import shutil
import subprocess
import sys
from datetime import date
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SOUNDS_DIR = ROOT / "audio" / "sounds"
LOADER_PATH = ROOT / "audio" / "sound-loader.js"
ARCHIVE_ROOT = Path.home() / "Lea" / "wild-animals-audio-archive"
ARCHIVE_DIR = ARCHIVE_ROOT / f"{date.today().isoformat()}-originals" / "audio" / "sounds"

TARGET_SECONDS = 5.0
TARGET_RMS_DB = -18.0
PEAK_CEILING_DB = -1.0
MAX_GAIN_DB = 30.0
BITRATE = "96k"
SAMPLE_RATE = 44100
ANALYSIS_RATE = 16000
MIN_SOURCE_SECONDS = 1.0


def parse_sound_map() -> list[tuple[str, str]]:
    """Return (animal, sound_key) pairs from audio/sound-loader.js."""
    source = LOADER_PATH.read_text(encoding="utf-8")
    block = source.split("this.animalSoundMap = {", 1)[1].split("};", 1)[0]
    return re.findall(r'([A-Za-z]+):\s*"([^"]+)"', block)


def probe_duration(path: Path) -> float:
    output = subprocess.check_output(
        [
            "ffprobe", "-v", "error",
            "-show_entries", "format=duration",
            "-of", "csv=p=0", str(path),
        ],
        text=True,
    ).strip()
    return float(output)


def decode_mono(path: Path) -> np.ndarray:
    raw = subprocess.check_output(
        [
            "ffmpeg", "-v", "error", "-i", str(path),
            "-ac", "1", "-ar", str(ANALYSIS_RATE),
            "-f", "s16le", "-",
        ]
    )
    return np.frombuffer(raw, dtype=np.int16).astype(np.float64) / 32768.0


def choose_window(samples: np.ndarray, seconds: float) -> tuple[float, float, float, float]:
    """Return (start, duration, rms_db, peak_db) for the loudest window."""
    total_seconds = len(samples) / ANALYSIS_RATE
    window_seconds = min(seconds, total_seconds)
    window_samples = max(1, int(window_seconds * ANALYSIS_RATE))

    if window_samples >= len(samples):
        window = samples
        start = 0.0
    else:
        squared = samples * samples
        cumulative = np.concatenate(([0.0], np.cumsum(squared)))
        sums = cumulative[window_samples:] - cumulative[:-window_samples]
        start_index = int(np.argmax(sums))
        window = samples[start_index:start_index + window_samples]
        start = start_index / ANALYSIS_RATE

    rms = float(np.sqrt(np.mean(window * window) + 1e-15))
    peak = float(np.max(np.abs(window)) + 1e-15)
    return start, window_seconds, 20 * np.log10(rms), 20 * np.log10(peak)


def encode_cue(source: Path, target: Path, start: float, duration: float, gain_db: float) -> None:
    """Trim, fade, gain and encode one cue as mono MP3."""
    fade_out_start = max(0.0, duration - 0.12)
    filters = (
        f"volume={gain_db:.2f}dB,"
        f"afade=t=in:st=0:d=0.08,"
        f"afade=t=out:st={fade_out_start:.2f}:d=0.12"
    )
    subprocess.run(
        [
            "ffmpeg", "-y", "-v", "error",
            "-ss", f"{start:.3f}", "-t", f"{duration:.3f}",
            "-i", str(source),
            "-af", filters,
            "-ac", "1", "-ar", str(SAMPLE_RATE),
            "-b:a", BITRATE,
            str(target),
        ],
        check=True,
    )


def choose_source(animal: str, key: str) -> tuple[Path, float] | None:
    """Pick the longest candidate for an animal (best content, not first extension).

    Sources may live in the live sound directory or in the archive, so the
    script can be re-run after the first pass without restoring WAVs.
    """
    candidates: list[tuple[Path, float]] = []
    for directory in (SOUNDS_DIR, ARCHIVE_DIR):
        for extension in ("mp3", "wav"):
            candidate = directory / f"{key}.{extension}"
            if candidate.exists():
                try:
                    candidates.append((candidate, probe_duration(candidate)))
                except subprocess.CalledProcessError:
                    continue

    if not candidates:
        print(f"  ! {animal:10s} no file for {key}")
        return None

    candidate, duration = max(
        candidates,
        key=lambda item: (item[1], item[0].suffix.lower() == ".wav"),
    )
    return candidate, duration


def main() -> int:
    parser = argparse.ArgumentParser(description="Trim and compress animal sound cues")
    parser.add_argument("--apply", action="store_true", help="write files (default is dry-run)")
    parser.add_argument("--keep-wavs", action="store_true", help="do not archive source WAVs")
    args = parser.parse_args()

    pairs = parse_sound_map()
    if not pairs:
        print("Could not parse animalSoundMap", file=sys.stderr)
        return 1

    before_total = sum(
        path.stat().st_size for path in SOUNDS_DIR.iterdir()
        if path.is_file() and path.suffix.lower() in {".mp3", ".wav"}
    )

    if args.apply:
        ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)

    print(f"{'animal':10s} {'source':30s} {'src MB':>7s} {'src s':>7s} {'cue s':>6s} {'gain':>6s} {'out KB':>7s}")
    print("-" * 84)

    planned: list[dict] = []
    skipped: list[str] = []

    for animal, key in pairs:
        source_info = choose_source(animal, key)
        if not source_info:
            continue

        source, source_duration = source_info
        if source_duration < MIN_SOURCE_SECONDS:
            skipped.append(animal)
            print(f"{animal:10s} {source.name:30s} {source.stat().st_size/1048576:7.2f} {source_duration:7.1f} "
                  f"{'keep':>6s} {'-':>6s} {'-':>7s}")
            continue

        samples = decode_mono(source)
        start, cue_seconds, rms_db, peak_db = choose_window(samples, TARGET_SECONDS)

        gain_db = min(TARGET_RMS_DB - rms_db, PEAK_CEILING_DB - peak_db, MAX_GAIN_DB)
        gain_db = max(gain_db, 0.0)

        target = SOUNDS_DIR / f"{key}.mp3"
        projected_bytes = int(cue_seconds * int(BITRATE.rstrip("k")) * 1000 / 8 * 1.05)

        planned.append({
            "animal": animal,
            "key": key,
            "source": source,
            "target": target,
            "start": start,
            "duration": cue_seconds,
            "gain_db": gain_db,
            "source_mb": source.stat().st_size / 1048576,
            "source_seconds": source_duration,
            "projected_bytes": projected_bytes,
        })

        print(f"{animal:10s} {source.name:30s} {source.stat().st_size/1048576:7.2f} {source_duration:7.1f} "
              f"{cue_seconds:6.1f} {gain_db:+6.1f} {projected_bytes/1024:7.0f}")

    projected_total = sum(item["projected_bytes"] for item in planned)
    for animal in skipped:
        key = dict(pairs)[animal]
        existing_mp3 = SOUNDS_DIR / f"{key}.mp3"
        if existing_mp3.exists():
            projected_total += existing_mp3.stat().st_size

    print("-" * 84)
    print(f"planned cues: {len(planned)} | untouched short cues: {len(skipped)}")
    print(f"audio before: {before_total/1048576:.1f} MB")
    print(f"projected referenced mp3 total: {projected_total/1048576:.2f} MB")

    if not args.apply:
        print("\nDry run only. Re-run with --apply to write files.")
        return 0

    # Archive every original that will be replaced or removed.
    for item in planned:
        for extension in ("mp3", "wav"):
            original = SOUNDS_DIR / f"{item['key']}.{extension}"
            destination = ARCHIVE_DIR / original.name
            if original.exists() and not destination.exists():
                shutil.copy2(original, destination)

    # Also archive every unreferenced audio file before removing any WAV.
    referenced_keys = {key for _, key in pairs}
    for path in sorted(SOUNDS_DIR.iterdir()):
        if not path.is_file() or path.suffix.lower() not in {".mp3", ".wav"}:
            continue
        stem = path.stem
        if stem not in referenced_keys and not (ARCHIVE_DIR / path.name).exists():
            shutil.move(str(path), str(ARCHIVE_DIR / path.name))

    for item in planned:
        temp_target = item["target"].with_name(f"{item['target'].stem}.tmp.mp3")
        encode_cue(item["source"], temp_target, item["start"], item["duration"], item["gain_db"])
        temp_target.replace(item["target"])

    if not args.keep_wavs:
        for wav in sorted(SOUNDS_DIR.glob("*.wav")):
            destination = ARCHIVE_DIR / wav.name
            if not destination.exists():
                shutil.move(str(wav), str(destination))
            else:
                wav.unlink()

    after_total = sum(
        path.stat().st_size for path in SOUNDS_DIR.iterdir()
        if path.is_file() and path.suffix.lower() in {".mp3", ".wav"}
    )

    manifest = {
        "generated": date.today().isoformat(),
        "cue_seconds": TARGET_SECONDS,
        "bitrate": BITRATE,
        "archive": str(ARCHIVE_DIR),
        "before_bytes": before_total,
        "after_bytes": after_total,
        "cues": [
            {
                "animal": item["animal"],
                "key": item["key"],
                "source": item["source"].name,
                "start": round(item["start"], 3),
                "duration": round(item["duration"], 3),
                "gain_db": round(item["gain_db"], 2),
            }
            for item in planned
        ],
    }
    (ROOT / "audio" / "audio-diet-manifest.json").write_text(
        json.dumps(manifest, indent=2) + "\n", encoding="utf-8"
    )

    print(f"audio after: {after_total/1048576:.2f} MB")
    print(f"originals archived to: {ARCHIVE_DIR}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
