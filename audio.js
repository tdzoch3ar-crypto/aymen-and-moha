class AudioManager {
    constructor() {
        this.sounds = {
            // استخدام أصوات مجانية من الإنترنت
            punch: new Howl({
                src: ['https://assets.mixkit.co/sfx/preview/mixkit-boxing-punch-2051.mp3'],
                volume: 0.6
            }),
            energy: new Howl({
                src: ['https://assets.mixkit.co/sfx/preview/mixkit-magic-spell-raise-1676.mp3'],
                volume: 0.7
            }),
            explosion: new Howl({
                src: ['https://assets.mixkit.co/sfx/preview/mixkit-explosion-1694.mp3'],
                volume: 0.8
            }),
            transform: new Howl({
                src: ['https://assets.mixkit.co/sfx/preview/mixkit-power-up-energy-2571.mp3'],
                volume: 0.7
            }),
            kamehameha: new Howl({
                src: ['https://assets.mixkit.co/sfx/preview/mixkit-woosh-1531.mp3'],
                volume: 0.8
            }),
            victory: new Howl({
                src: ['https://assets.mixkit.co/sfx/preview/mixkit-video-game-win-2016.mp3'],
                volume: 0.6
            })
        };

        this.backgroundMusic = new Howl({
            src: ['https://assets.mixkit.co/music/preview/mixkit-game-show-suspense-waiting-667.mp3'],
            volume: 0.3,
            loop: true
        });
    }

    playSound(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName].play();
        }
    }

    playBackgroundMusic() {
        this.backgroundMusic.play();
    }

    stopBackgroundMusic() {
        this.backgroundMusic.stop();
    }

    setMusicVolume(volume) {
        this.backgroundMusic.volume(volume);
    }
}

// إنشاء مدير الصوت العالمي
const audioManager = new AudioManager();