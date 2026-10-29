/**
 * Audio payload guard.
 *
 * A kindergarten tap must never fetch a 34 MB field recording. These tests fail
 * the build if a large file is reintroduced, if any animal loses its playable
 * cue, or if uncompressed WAVs creep back into the deployed folder.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const soundsDirectory = path.join(projectRoot, 'audio', 'sounds');
const loaderPath = path.join(projectRoot, 'audio', 'sound-loader.js');

const MAX_CUE_BYTES = 200 * 1024;
const MAX_TOTAL_BYTES = 3 * 1024 * 1024;

const readSoundMap = () => {
  const source = fs.readFileSync(loaderPath, 'utf8');
  const block = source.split('this.animalSoundMap = {')[1].split('};')[0];
  return [...block.matchAll(/([A-Za-z]+):\s*"([^"]+)"/g)].map((match) => ({
    animal: match[1],
    soundKey: match[2],
  }));
};

describe('audio payload', () => {
  const soundMap = readSoundMap();

  it('maps all 30 animals to a sound key', () => {
    expect(soundMap).toHaveLength(30);
  });

  it('has a playable MP3 for every animal', () => {
    const missing = soundMap
      .map(({ animal, soundKey }) => ({ animal, file: path.join(soundsDirectory, `${soundKey}.mp3`) }))
      .filter(({ file }) => !fs.existsSync(file));

    expect(missing).toEqual([]);
  });

  it('keeps every cue under 200 KB', () => {
    const oversized = soundMap
      .map(({ animal, soundKey }) => {
        const file = path.join(soundsDirectory, `${soundKey}.mp3`);
        return { animal, bytes: fs.existsSync(file) ? fs.statSync(file).size : 0 };
      })
      .filter(({ bytes }) => bytes > MAX_CUE_BYTES);

    expect(oversized).toEqual([]);
  });

  it('keeps the total deployed cue set under 3 MB', () => {
    const totalBytes = fs.readdirSync(soundsDirectory)
      .filter((file) => file.endsWith('.mp3'))
      .reduce((total, file) => total + fs.statSync(path.join(soundsDirectory, file)).size, 0);

    expect(totalBytes).toBeLessThan(MAX_TOTAL_BYTES);
  });

  it('ships no uncompressed WAV files', () => {
    const wavFiles = fs.readdirSync(soundsDirectory).filter((file) => file.endsWith('.wav'));
    expect(wavFiles).toEqual([]);
  });
});
