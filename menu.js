// menu.js
class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('menu', 'assets/menu.png');
        this.load.image('startButton', 'assets/startButton.png');
    }

    create() {
        this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'sky').setDisplaySize(window.innerWidth, window.innerHeight);

        const startButton = this.add.image(window.innerWidth / 2, window.innerHeight / 2, 'startButton').setInteractive();

        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        this.add.text(window.innerWidth / 2, window.innerHeight / 2 - 100, 'My Phaser Game', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5);
    }
}
