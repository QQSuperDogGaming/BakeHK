window.addEventListener('load', () => {
    class MenuScene extends Phaser.Scene {
        constructor() {
            super({ key: 'MenuScene' });
        }

        preload() {
            // Preload assets
            this.load.audio('backgroundMusic', 'assets/background.mp3'); // Menu music
            this.load.image('fullscreen', 'assets/fullscreen.png');
            this.load.image('playButton', 'assets/playButton.png');
            this.load.image('leaderboardButton', 'assets/leaderboardButton.png');
            this.load.image('backButton', 'assets/backButton.png');
            this.load.image('menuBackground', 'assets/menuBackground.png');
            this.load.image('character1', 'assets/character1.png');
            this.load.image('character2', 'assets/character2.png');
            this.load.image('character3', 'assets/character3.png');
            this.load.image('map1', 'assets/map1.png');
            this.load.image('map2', 'assets/map2.png');
            this.load.image('leaderboardBackground', 'assets/leaderboardBackground.png');
            this.load.image('title', 'assets/title.png');
        }

        create() {
            // Play background music and loop it
            this.backgroundMusic = this.sound.add('backgroundMusic', { loop: true, volume: 0.5 });
            this.backgroundMusic.play();

            // Add the background and make it responsive
            this.menuBackground = this.add.image(this.scale.width / 2, this.scale.height / 2, 'menuBackground')
                .setDisplaySize(this.scale.width, this.scale.height);

            // Dynamic title
            const titleScaleFactor = 0.4;
            const titleYPositionFactor = 0.15;
            const titleWidth = this.scale.width * titleScaleFactor;
            const titleHeight = titleWidth / 2;

            this.title = this.add.image(this.scale.width / 2, this.scale.height * titleYPositionFactor, 'title')
                .setDisplaySize(titleWidth, titleHeight);

            // Add play button, fullscreen button, and leaderboard button
            this.playButton = this.add.image(this.scale.width / 2, this.scale.height / 2, 'playButton').setInteractive().setDisplaySize(200, 80);
            this.fullscreenButton = this.add.image(this.scale.width - 40, 40, 'fullscreen').setInteractive().setDisplaySize(32, 32);
            this.leaderboardButton = this.add.image(this.scale.width / 2, this.scale.height / 2 + 100, 'leaderboardButton').setInteractive().setDisplaySize(200, 80);

            // Mute/Unmute button
            this.muteButton = this.add.text(10, 10, 'Mute', { fontSize: '16px', fill: '#fff' }).setInteractive();
            this.muteButton.on('pointerdown', () => {
                if (this.sound.mute) {
                    this.sound.mute = false;
                    this.muteButton.setText('Mute');
                } else {
                    this.sound.mute = true;
                    this.muteButton.setText('Unmute');
                }
            });

            // Handle play button interaction
            this.playButton.on('pointerdown', () => {
                document.getElementById('username-container').style.display = 'block';
            });

            // Fullscreen handling
            this.fullscreenButton.on('pointerdown', () => {
                if (this.scale.isFullscreen) {
                    this.scale.stopFullscreen();
                } else {
                    this.scale.startFullscreen();
                }
            });

            // Leaderboard button interaction
            this.leaderboardButton.on('pointerdown', () => {
                this.scene.start('LeaderboardScene');
            });

            // Handle screen resizing
            this.scale.on('resize', this.resize, this);
            this.resize();
        }

        resize() {
            // Adjust title and background
            const titleScaleFactor = 0.4;
            const titleYPositionFactor = 0.15;
            const titleWidth = this.scale.width * titleScaleFactor;
            const titleHeight = titleWidth / 2;

            this.title.setPosition(this.scale.width / 2, this.scale.height * titleYPositionFactor)
                .setDisplaySize(titleWidth, titleHeight);
            this.menuBackground.setDisplaySize(this.scale.width, this.scale.height);
            this.playButton.setPosition(this.scale.width / 2, this.scale.height / 2);
            this.fullscreenButton.setPosition(this.scale.width - 40, 40);
            this.leaderboardButton.setPosition(this.scale.width / 2, this.scale.height / 2 + 100);
        }

        // Stop music when leaving the scene
        shutdown() {
            this.backgroundMusic.stop();
        }
    }

    class LeaderboardScene extends Phaser.Scene {
        constructor() {
            super({ key: 'LeaderboardScene' });
        }

        preload() {
            this.load.image('backButton', 'assets/backButton.png');
        }

        async create() {
            // Add leaderboard background
            this.leaderboardBackground = this.add.image(this.scale.width / 2, this.scale.height / 2, 'leaderboardBackground')
                .setDisplaySize(this.scale.width, this.scale.height);

            // Fetch scores from online leaderboard
            const scores = await this.fetchScores();
            let leaderboardText = 'Leaderboard\n';
            scores.forEach((entry, index) => {
                leaderboardText += `${index + 1}. ${entry.player}: ${entry.score}\n`;
            });

            // Display leaderboard
            this.leaderboardText = this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, leaderboardText, { fontSize: '32px', fill: '#000' }).setOrigin(0.5);
            this.backButton = this.add.image(this.scale.width / 2, this.scale.height / 2 + 100, 'backButton').setInteractive().setDisplaySize(200, 80);

            this.backButton.on('pointerdown', () => {
                this.scene.start('MenuScene');
            });

            // Handle resizing
            this.scale.on('resize', this.resize, this);
            this.resize();
        }

        resize() {
            this.leaderboardBackground.setDisplaySize(this.scale.width, this.scale.height);
            this.leaderboardText.setPosition(this.scale.width / 2, this.scale.height / 2 - 100);
            this.backButton.setPosition(this.scale.width / 2, this.scale.height / 2 + 100);
        }

        async fetchScores() {
            try {
                const response = await axios.get('http://localhost:3000/scores');
                return response.data;
            } catch (error) {
                console.error('Error fetching scores:', error);
                return [];
            }
        }
    }

    let player;
    let cursors, wasd, leftButton, rightButton, jumpButton;
    let stars, bombs, platforms;
    let scoreText, livesText;
    let gameOver = false;
    let score = 0;
    let lives = 3;
    let canJump = true; // Cooldown flag

    class GameScene extends Phaser.Scene {
        constructor() {
            super({ key: 'GameScene' });
        }

        preload() {
            // Preload any additional music or sounds here if needed
            this.load.audio('gameMusic', 'assets/gameMusic.mp3');  // Game scene music
            this.load.image('map1', 'assets/map1.png');
            this.load.image('map2', 'assets/map2.png');
            this.load.image('ground', 'assets/platform.png');
            this.load.image('star', 'assets/star.png');
            this.load.image('bomb', 'assets/bomb.png');
            this.load.image('leftButton', 'assets/leftButton.png');
            this.load.image('rightButton', 'assets/rightButton.png');
            this.load.image('jumpButton', 'assets/jumpButton.png');
            this.load.image('fullscreen', 'assets/fullscreen.png');
            this.load.image('reload', 'assets/reload.png');
            this.load.image('backButton', 'assets/backButton.png'); // New back button
        }

        create(data) {
            // If you want different music for the game scene, stop menu music and play game music
            this.backgroundMusic = this.sound.add('gameMusic', { loop: true, volume: 0.5 });
            this.backgroundMusic.play();

            // Game creation logic (platforms, player, stars, bombs, etc.)
            this.background = this.add.image(this.scale.width / 2, this.scale.height / 2, data.map)
                .setDisplaySize(this.scale.width, this.scale.height);

            platforms = this.physics.add.staticGroup();

            this.createPlatform(this.scale.width / 2, this.scale.height - 30, 2);
            this.createPlatform(this.scale.width - 200, this.scale.height - 200, 1);
            this.createPlatform(50, this.scale.height - 350, 1);
            this.createPlatform(this.scale.width - 100, this.scale.height - 400, 1);

            player = this.physics.add.sprite(100, this.scale.height - 150, data.character);
            player.setBounce(0.2).setCollideWorldBounds(true);

            this.physics.add.collider(player, platforms);

            this.initializeControls();

            stars = this.physics.add.group();
            this.physics.add.collider(stars, platforms);
            this.physics
