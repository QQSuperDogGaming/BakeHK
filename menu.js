class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('startButton', 'assets/startButton.png');
        this.load.image('leaderboardButton', 'assets/leaderboardButton.png');
        this.load.image('fullscreen', 'assets/fullscreen.png');
        this.load.audio('menuMusic', 'assets/audio/menuMusic.mp3');
    }

    create() {
        this.add.text(this.scale.width / 2, this.scale.height / 2 - 200, 'Game Menu', { fontSize: '48px', fill: '#fff' }).setOrigin(0.5);

        const startButton = this.add.image(this.scale.width / 2, this.scale.height / 2, 'startButton').setInteractive().setDisplaySize(200, 80);
        const leaderboardButton = this.add.image(this.scale.width / 2, this.scale.height / 2 + 100, 'leaderboardButton').setInteractive().setDisplaySize(200, 80);

        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        leaderboardButton.on('pointerdown', () => {
            this.scene.start('LeaderboardScene');
        });

        const fullscreenButton = this.add.image(this.scale.width - 40, 40, 'fullscreen').setInteractive().setDisplaySize(32, 32);
        fullscreenButton.on('pointerdown', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });

        // Play menu music
        this.sound.add('menuMusic', { loop: true }).play();
    }
}

class LeaderboardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LeaderboardScene' });
    }

    create() {
        this.add.text(this.scale.width / 2, 50, 'Leaderboard', { fontSize: '40px', fill: '#fff' }).setOrigin(0.5);

        let scores = JSON.parse(localStorage.getItem('scores')) || [];
        scores = scores.sort((a, b) => b.score - a.score).slice(0, 10);

        for (let i = 0; i < scores.length; i++) {
            let scoreEntry = scores[i];
            this.add.text(this.scale.width / 2, 100 + i * 40, `${i + 1}. ${scoreEntry.name}: ${scoreEntry.score}`, { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        }

        const backButton = this.add.text(this.scale.width / 2, this.scale.height - 50, 'Back', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        backButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: [MenuScene, GameScene, LeaderboardScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    }
};

const game = new Phaser.Game(config);