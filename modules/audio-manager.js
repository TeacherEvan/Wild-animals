/**
 * Audio Manager Module - Production-Grade Audio System
 * Manages text-to-speech, sound effects, and audio state
 * 
 * @module AudioManager
 * @version 2.0.0
 */

export class AudioManager {
    constructor() {
        this.CONFIG = {
            SPEECH_RATE: 0.8,
            SPEECH_PITCH: 1.1,
            SPEECH_VOLUME: 0.8
        };

        this.isAudioEnabled = true;
        this.speechSynthesis = window.speechSynthesis;
        this.currentUtterance = null;
    }

    async pronounceAnimalName(animalName) {
        if (!this.isAudioEnabled || !animalName) return;

        const soundEffect = this.getAnimalSoundEffect(animalName);
        const textToSpeak = `${animalName} says ${soundEffect}`;

        return this.speakText(textToSpeak);
    }

    speakText(text) {
        return new Promise((resolve) => {
            if (!this.speechSynthesis) {
                resolve();
                return;
            }

            this.stopCurrentSpeech();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = this.CONFIG.SPEECH_RATE;
            utterance.pitch = this.CONFIG.SPEECH_PITCH;
            utterance.volume = this.CONFIG.SPEECH_VOLUME;

            utterance.onend = () => {
                this.currentUtterance = null;
                resolve();
            };

            this.speechSynthesis.speak(utterance);
        });
    }

    getAnimalSoundEffect(animalName) {
        const soundEffects = {
            'Lion': 'roar', 'Tiger': 'roar', 'Elephant': 'trumpet',
            'Monkey': 'ooh ooh ah ah', 'Wolf': 'howl', 'Bear': 'growl',
            'Dolphin': 'click click', 'Frog': 'ribbit', 'Eagle': 'screech',
            'Penguin': 'waddle', 'Giraffe': 'hum', 'Zebra': 'neigh',
            'Rhino': 'snort', 'Fox': 'yip', 'Leopard': 'growl',
            'Kangaroo': 'grunt', 'Koala': 'snore', 'Gorilla': 'hoo hoo',
            'Shark': 'splash', 'Octopus': 'whoosh', 'Camel': 'groan'
        };
        return soundEffects[animalName] || 'sound';
    }

    stopCurrentSpeech() {
        if (this.speechSynthesis && this.currentUtterance) {
            this.speechSynthesis.cancel();
        }
    }

    toggleAudio() {
        this.isAudioEnabled = !this.isAudioEnabled;
        if (!this.isAudioEnabled) {
            this.stopCurrentSpeech();
        }
        return this.isAudioEnabled;
    }
}

export const audioManager = new AudioManager();
