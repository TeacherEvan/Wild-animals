export const animalSoundMap = {
  Lion: 'roar',
  Tiger: 'roar',
  Elephant: 'trumpet',
  Giraffe: 'hum',
  Bear: 'growl',
  Zebra: 'neigh',
  Wolf: 'howl',
  Fox: 'yip yip',
  Leopard: 'growl',
  Monkey: 'ooh ooh ah ah',
  Gorilla: 'hoo hoo',
  Parrot: 'squawk',
  Owl: 'hoot',
  Penguin: 'honk',
  Dolphin: 'click click',
  Shark: 'whoosh',
  Octopus: 'whoosh',
  Turtle: 'swish',
  Crocodile: 'snap',
  Hippo: 'grunt',
  Rhino: 'snort',
  Koala: 'snore'
};

export function getAnimalSound(name) {
  return animalSoundMap[name] ?? 'animal sound';
}
