class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('menu', 'assets/menu.png');
        this.load.image('startButton', 'assets/startButton.png');
        this.load.image('character1', 'assets/character1.png');
        this.load.image('character2', 'assets/character2.png');
        this.load.image('map1', 'assets/map1.png');
        this.load.image('map2', 'assets/map2.png');
        this.load.image('fullscreen', 'assets/fullscreen.png');
    }

    create() {
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'menu').setDisplaySize(this.scale.width, this.scale.height);

        const character1Button = this.add.image(this.scale.width / 2 - 100, this.scale.height / 2, 'character1').setInteractive().setDisplaySize(80, 80);
        const character2Button = this.add.image(this.scale.width / 2 + 100, this.scale.height / 2, 'character2').setInteractive().setDisplaySize(80, 80);
        
        const map1Button = this.add.image(this.scale.width / 2 - 100, this.scale.height / 2 + 100, 'map1').setInteractive().setDisplaySize(80, 80);
        const map2Button = this.add.image(this.scale.width / 2 + 100, this.scale.height / 2 + 100, 'map2').setInteractive().setDisplaySize(80, 80);

        const startButton = this.add.image(this.scale.width / 2, this.scale.height / 2 + 200, 'startButton').setInteractive().setDisplaySize(150, 50);

        const fullscreenButton = this.add.image(this.scale.width - 40, 40, 'fullscreen').setInteractive().setDisplaySize(32, 32);
        fullscreenButton.on('pointerdown', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });

        let selectedCharacter = null;
        let selectedMap = null;

        character1Button.on('pointerdown', () => { selectedCharacter = 'character1'; });
        character2Button.on('pointerdown', () => { selectedCharacter = 'character2'; });
        
        map1Button.on('pointerdown', () => { selectedMap = 'map1'; });
        map2Button.on('pointerdown', () => { selectedMap = 'map2'; });

        startButton.on('pointerdown', () => {
            if (selectedCharacter && selectedMap) {
                this.scene.start('GameScene', { character: selectedCharacter, map: selectedMap });
            } else {
                alert('Please select a character and a map!');
            }
        });

        this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, 'Select Character and Map', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
    }
}

