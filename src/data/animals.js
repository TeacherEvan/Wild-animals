export const animals = [
  { name: 'Lion', emoji: '🦁', habitat: 'Savanna', diet: 'Carnivore', sound: 'roar', fact: 'This animal is often called the king of the jungle.' },
  { name: 'Tiger', emoji: '🐯', habitat: 'Jungle', diet: 'Carnivore', sound: 'roar', fact: 'This striped cat loves hiding in tall grass.' },
  { name: 'Elephant', emoji: '🐘', habitat: 'Savanna', diet: 'Herbivore', sound: 'trumpet', fact: 'This giant animal uses its trunk to drink and spray water.' },
  { name: 'Giraffe', emoji: '🦒', habitat: 'Savanna', diet: 'Herbivore', sound: 'hum', fact: 'This tall animal can reach leaves high in the trees.' },
  { name: 'Bear', emoji: '🐻', habitat: 'Forest', diet: 'Omnivore', sound: 'growl', fact: 'This furry animal loves honey and long naps.' },
  { name: 'Zebra', emoji: '🦓', habitat: 'Savanna', diet: 'Herbivore', sound: 'neigh', fact: 'This animal has black and white stripes.' },
  { name: 'Wolf', emoji: '🐺', habitat: 'Forest', diet: 'Carnivore', sound: 'howl', fact: 'This animal howls to talk with its pack.' },
  { name: 'Fox', emoji: '🦊', habitat: 'Forest', diet: 'Omnivore', sound: 'yip', fact: 'This clever animal has a fluffy tail.' },
  { name: 'Leopard', emoji: '🐆', habitat: 'Jungle', diet: 'Carnivore', sound: 'growl', fact: 'This spotted cat climbs trees with ease.' },
  { name: 'Monkey', emoji: '🐵', habitat: 'Jungle', diet: 'Omnivore', sound: 'chatter', fact: 'This playful animal swings from branch to branch.' },
  { name: 'Gorilla', emoji: '🦍', habitat: 'Jungle', diet: 'Herbivore', sound: 'hoo hoo', fact: 'This strong primate beats its chest to communicate.' },
  { name: 'Parrot', emoji: '🦜', habitat: 'Jungle', diet: 'Omnivore', sound: 'squawk', fact: 'This colorful bird can copy words it hears.' },
  { name: 'Owl', emoji: '🦉', habitat: 'Forest', diet: 'Carnivore', sound: 'hoot', fact: 'This bird hunts best at night.' },
  { name: 'Squirrel', emoji: '🐿️', habitat: 'Forest', diet: 'Omnivore', sound: 'chatter', fact: 'This small climber hides nuts for later.' },
  { name: 'Penguin', emoji: '🐧', habitat: 'Ocean', diet: 'Carnivore', sound: 'honk', fact: 'This bird cannot fly but swims very well.' },
  { name: 'Dolphin', emoji: '🐬', habitat: 'Ocean', diet: 'Carnivore', sound: 'click click', fact: 'This smart swimmer uses clicks to communicate.' },
  { name: 'Shark', emoji: '🦈', habitat: 'Ocean', diet: 'Carnivore', sound: 'whoosh', fact: 'This fish has rows of sharp teeth.' },
  { name: 'Octopus', emoji: '🐙', habitat: 'Ocean', diet: 'Carnivore', sound: 'whoosh', fact: 'This ocean animal has eight arms.' },
  { name: 'Turtle', emoji: '🐢', habitat: 'Ocean', diet: 'Omnivore', sound: 'swish', fact: 'This slow swimmer carries a shell on its back.' },
  { name: 'Seal', emoji: '🦭', habitat: 'Ocean', diet: 'Carnivore', sound: 'arf', fact: 'This playful swimmer loves to slide and splash.' },
  { name: 'Crocodile', emoji: '🐊', habitat: 'Jungle', diet: 'Carnivore', sound: 'snap', fact: 'This reptile has a long body and strong jaws.' },
  { name: 'Hippo', emoji: '🦛', habitat: 'Savanna', diet: 'Herbivore', sound: 'grunt', fact: 'This huge animal spends much of the day in water.' },
  { name: 'Rhino', emoji: '🦏', habitat: 'Savanna', diet: 'Herbivore', sound: 'snort', fact: 'This sturdy animal has a horn on its nose.' },
  { name: 'Koala', emoji: '🐨', habitat: 'Forest', diet: 'Herbivore', sound: 'snore', fact: 'This sleepy animal loves eucalyptus leaves.' }
];

export const habitatZones = ['Savanna', 'Forest', 'Ocean', 'Jungle'];

export const habitatMatchAnimals = animals.filter(({ habitat }) => habitatZones.includes(habitat)).slice(0, 18);

export const soundGameAnimals = animals.slice(0, 12);

export function findAnimalByName(name) {
  return animals.find((animal) => animal.name === name) ?? null;
}
