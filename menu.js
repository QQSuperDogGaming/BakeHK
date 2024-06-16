class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        console.log('Preloading menu assets...');
        this.load.image('sky', 'assets/sky.png');
        this.load.image('startButton', 'assets/startButton.png');
        this.load.image('leaderboardButton', 'assets/leaderboardButton.png'); // Add leaderboard button
        this.load.image('character1', 'assets/character1.png');
        this.load.image('character2', 'assets/character2.png');
        this.load.image('character3', 'assets/character3.png');
        this.load.image('map1', 'assets/map1.png');
        this.load.image('map2', 'assets/map2.png');
        this.load.image('fullscreen', 'assets/fullscreen.png');
        this.load.audio('menuMusic', 'assets/audio/menuMusic.mp3');
    }

    create() {
        console.log('Creating menu scene...');
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'sky').setDisplaySize(this.scale.width, this.scale.height);

        const character1Button = this.add.image(this.scale.width / 2 - 150, this.scale.height / 2, 'character1').setInteractive().setDisplaySize(80, 80);
        const character2Button = this.add.image(this.scale.width / 2, this.scale.height / 2, 'character2').setInteractive().setDisplaySize(80, 80);
        const character3Button = this.add.image(this.scale.width / 2 + 150, this.scale.height / 2, 'character3').setInteractive().setDisplaySize(80, 80);
        
        const map1Button = this.add.image(this.scale.width / 2 - 100, this.scale.height / 2 + 100, 'map1').setInteractive().setDisplaySize(80, 80);
        const map2Button = this.add.image(this.scale.width / 2 + 100, this.scale.height / 2 + 100, 'map2').setInteractive().setDisplaySize(80, 80);

        const startButton = this.add.image(this.scale.width / 2, this.scale.height / 2 + 200, 'startButton').setInteractive().setDisplaySize(150, 50);
        const leaderboardButton = this.add.image(this.scale.width / 2, this.scale.height / 2 + 300, 'leaderboardButton').setInteractive().setDisplaySize(150, 50); // Add leaderboard button

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

        character1Button.on('pointerdown', () => { 
            console.log('Selected character1');
            selectedCharacter = 'character1'; 
        });
        character2Button.on('pointerdown', () => { 
            console.log('Selected character2');
            selectedCharacter = 'character2'; 
        });
        character3Button.on('pointerdown', () => { 
            console.log('Selected character3');
            selectedCharacter = 'character3'; 
        });
        
        map1Button.on('pointerdown', () => { 
            console.log('Selected map1');
            selectedMap = 'map1'; 
        });
        map2Button.on('pointerdown', () => { 
            console.log('Selected map2');
            selectedMap = 'map2'; 
        });

        startButton.on('pointerdown', () => {
            console.log('Start button clicked');
            if (selectedCharacter && selectedMap) {
                console.log('Starting game with selected character and map');
                this.scene.start('GameScene', { character: selectedCharacter, map: selectedMap });
            } else {
                alert('Please select a character and a map!');
            }
        });

        leaderboardButton.on('pointerdown', () => {
            console.log('Leaderboard button clicked');
            this.scene.start('LeaderboardScene');
        });

        this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, 'Select Character and Map', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);

        // Play menu music
        console.log('Playing menu music');
        let menuMusic = this.sound.add('menuMusic', { loop: true });
        menuMusic.play();
    }
}

class LeaderboardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LeaderboardScene' });
    }

    create() {
        console.log('Creating leaderboard scene...');
        this.add.text(this.scale.width / 2, 50, 'Leaderboard', { fontSize: '40px', fill: '#fff' }).setOrigin(0.5);

        let scores = JSON.parse(localStorage.getItem('scores')) || [];
        scores = scores.sort((a, b) => b.score - a.score).slice(0, 10);

        for (let i = 0; i < scores.length; i++) {
            let scoreEntry = scores[i];
            this.add.text(this.scale.width / 2, 100 + i * 40, `${i + 1}. ${scoreEntry.name}: ${scoreEntry.score}`, { fontSize: '32px', fill: '#fff' }).setOrigin(0.5);
        }

        const backButton = this.add.text(this.scale.width / 2, this.scale.height - 50, 'Back', { fontSize: '32px', fill: '#fff' }).setOrigin(0.5).setInteractive();
        backButton.on('pointerdown', () => {
            console.log('Back button clicked');
            this.scene.start('MenuScene');
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: [MenuScene, GameScene, LeaderboardScene], // Add LeaderboardScene here
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    }
};

const game = new Phaser.Game(config);