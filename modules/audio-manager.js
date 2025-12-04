/**
 * Audio Manager Module - Production-Grade Audio System
 * Manages text-to-speech with proper error handling
 * 
 * @module AudioManager
 * @version 2.0.0
 */

export class AudioManager {
    constructor() {
        this.CONFIG = {
            SPEECH_RATE: 0.8,
            SPEECH_PITCH: 1.1,
            SPEECH_VOLUME: 0.8,
            TIMEOUT_MS: 5000
        };

        this.isAudioEnabled = true;
        this.speechSynthesis = window.speechSynthesis;
        this.currentUtterance = null;
    }

    async pronounceAnimalName(animalName) {
        if (!this.isAudioEnabled || !animalName) return Promise.resolve();

        try {
            const soundEffect = this.getAnimalSoundEffect(animalName);
            const textToSpeak = `${animalName} says ${soundEffect}`;
            return await this.speakText(textToSpeak);
        } catch (error) {
            console.warn('[AudioManager] Speech failed:', error);
            return Promise.resolve();
        }
    }

    speakText(text) {
        return new Promise((resolve) => {
            if (!this.speechSynthesis) {
                console.warn('[AudioManager] Speech synthesis not available');
                resolve();
                return;
            }

            this.stopCurrentSpeech();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = this.CONFIG.SPEECH_RATE;
            utterance.pitch = this.CONFIG.SPEECH_PITCH;
            utterance.volume = this.CONFIG.SPEECH_VOLUME;

            const timeoutId = setTimeout(() => {
                this.stopCurrentSpeech();
                resolve();
            }, this.CONFIG.TIMEOUT_MS);

            utterance.onstart = () => {
                this.currentUtterance = utterance;
            };

            utterance.onend = () => {
                clearTimeout(timeoutId);
                this.currentUtterance = null;
                resolve();
            };

            utterance.onerror = (error) => {
                clearTimeout(timeoutId);
                console.warn('[AudioManager] Speech error:', error);
                this.currentUtterance = null;
                resolve();
            };

            try {
                this.speechSynthesis.speak(utterance);
            } catch (error) {
                clearTimeout(timeoutId);
                console.warn('[AudioManager] Failed to speak:', error);
                resolve();
            }
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
            'Shark': 'splash', 'Octopus': 'whoosh', 'Camel': 'groan',
            'Crocodile': 'snap', 'Turtle': 'snap'
        };
        return soundEffects[animalName] || 'sound';
    }

    stopCurrentSpeech() {
        if (this.speechSynthesis && this.currentUtterance && this.speechSynthesis.speaking) {
            this.speechSynthesis.cancel();
        }
        this.currentUtterance = null;
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
