class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('fullscreen', 'assets/fullscreen.png');
        this.load.image('playButton', 'assets/playButton.png');
        this.load.image('character1', 'assets/character1.png');
        this.load.image('character2', 'assets/character2.png');
        this.load.image('character3', 'assets/character3.png');
        this.load.image('map1', 'assets/map1.png');
        this.load.image('map2', 'assets/map2.png');
    }

    create() {
        const playButton = this.add.image(this.scale.width / 2, this.scale.height / 2, 'playButton').setInteractive().setDisplaySize(200, 80);
        playButton.on('pointerdown', () => {
            console.log('Play button clicked');
            this.startGame();
        });

        const fullscreenButton = this.add.image(this.scale.width - 40, 40, 'fullscreen').setInteractive().setDisplaySize(32, 32);
        fullscreenButton.on('pointerdown', () => {
            console.log('Fullscreen button clicked in menu');
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });

        // Add character selection and map selection elements
        const character1 = this.add.image(this.scale.width / 2 - 100, this.scale.height / 2 - 200, 'character1').setInteractive().setDisplaySize(50, 50);
        const character2 = this.add.image(this.scale.width / 2, this.scale.height / 2 - 200, 'character2').setInteractive().setDisplaySize(50, 50);
        const character3 = this.add.image(this.scale.width / 2 + 100, this.scale.height / 2 - 200, 'character3').setInteractive().setDisplaySize(50, 50);

        const map1 = this.add.image(this.scale.width / 2 - 100, this.scale.height / 2 - 100, 'map1').setInteractive().setDisplaySize(50, 50);
        const map2 = this.add.image(this.scale.width / 2, this.scale.height / 2 - 100, 'map2').setInteractive().setDisplaySize(50, 50);

        character1.on('pointerdown', () => {
            console.log('Character 1 selected');
            this.selectedCharacter = 'character1';
        });
        character2.on('pointerdown', () => {
            console.log('Character 2 selected');
            this.selectedCharacter = 'character2';
        });
        character3.on('pointerdown', () => {
            console.log('Character 3 selected');
            this.selectedCharacter = 'character3';
        });

        map1.on('pointerdown', () => {
            console.log('Map 1 selected');
            this.selectedMap = 'map1';
        });
        map2.on('pointerdown', () => {
            console.log('Map 2 selected');
            this.selectedMap = 'map2';
        });
    }

    startGame() {
        const selectedCharacter = this.selectedCharacter || 'character1'; // Default to character1 if not selected
        const selectedMap = this.selectedMap || 'map1'; // Default to
