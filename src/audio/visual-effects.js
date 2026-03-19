export function showSoundPlaying(root) {
  const animalEmoji = root.getElementById('animalEmoji');
  if (!animalEmoji) {
    return;
  }

  animalEmoji.classList.add('sound-playing');
  removeSoundWaves(root);
  const waveHost = animalEmoji.parentElement;

  for (let index = 0; index < 3; index += 1) {
    const wave = document.createElement('span');
    wave.className = 'sound-wave';
    wave.style.animationDelay = `${index * 0.2}s`;
    waveHost?.appendChild(wave);
  }
}

export function clearSoundPlaying(root) {
  const animalEmoji = root.getElementById('animalEmoji');
  animalEmoji?.classList.remove('sound-playing');
  removeSoundWaves(root);
}

function removeSoundWaves(root) {
  root.querySelectorAll('.sound-wave').forEach((wave) => wave.remove());
}
