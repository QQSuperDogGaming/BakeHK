let player;
let cursors, wasd, leftButton, rightButton, jumpButton;
let stars, bombs, platforms;
let scoreText, livesText;
let gameOver = false;
let score = 0;
let lives = 3;
let backgroundMusic;

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        console.log('Preloading assets...');
        // Preload map images and audio files
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
        this.load.image('character1', 'assets/character1.png');
        this.load.image('character2', 'assets/character2.png');
        this.load.image('character3', 'assets/character3.png');

        this.load.audio('backgroundMusic1', 'assets/audio/backgroundMusic1.mp3');
        this.load.audio('backgroundMusic2', 'assets/audio/backgroundMusic2.mp3');
        this.load.audio('backgroundMusic3', 'assets/audio/backgroundMusic3.mp3');
        this.load.audio('jumpSound', 'assets/audio/jump.mp3');
        this.load.audio('collectStarSound', 'assets/audio/collectStar.mp3');
        this.load.audio('hitBombSound', 'assets/audio/hitBomb.mp3');
    }

    create(data) {
        console.log('Creating game scene...');
        // Initialize variables
        gameOver = false;
        score = 0;
        lives = 3;

        // Play random background music
        const backgroundMusicKeys = ['backgroundMusic1', 'backgroundMusic2', 'backgroundMusic3'];
        const randomMusicKey = Phaser.Math.RND.pick(backgroundMusicKeys);
        console.log(`Playing background music: ${randomMusicKey}`);
        backgroundMusic = this.sound.add(randomMusicKey, { loop: true });
        backgroundMusic.play();

        // Use the selected map
        this.add.image(this.scale.width / 2, this.scale.height / 2, data.map).setDisplaySize(this.scale.width, this.scale.height);

        platforms = this.physics.add.group({
            immovable: true,
            allowGravity: false
        });

        this.createPlatform(this.scale.width / 2, this.scale.height - 30, 2);
        this.createPlatform(this.scale.width - 200, this.scale.height - 200, 1);
        this.createPlatform(50, this.scale.height - 350, 1);
        this.createPlatform(this.scale.width - 100, this.scale.height - 400, 1);

        player = this.physics.add.sprite(100, this.scale.height - 150, data.character);
        player.setBounce(0.2).setCollideWorldBounds(true);

        this.physics.add.collider(player, platforms);

        cursors = this.input.keyboard.createCursorKeys();
        wasd = this.input.keyboard.addKeys({ 
            up: Phaser.Input.Keyboard.KeyCodes.W, 
            left: Phaser.Input.Keyboard.KeyCodes.A, 
            down: Phaser.Input.Keyboard.KeyCodes.S, 
            right: Phaser.Input.Keyboard.KeyCodes.D 
        });

        stars = this.physics.add.group();
        this.physics.add.collider(stars, platforms);
        this.physics.add.overlap(player, stars, collectStar, null, this);

        bombs = this.physics.add.group();
        this.physics.add.collider(bombs, platforms);
        this.physics.add.collider(player, bombs, hitBomb, null, this);

        scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
        livesText = this.add.text(16, 80, 'Lives: 3', { fontSize: '32px', fill: '#000' });

        this.createStar();
        this.time.addEvent({ delay: 1000, callback: () => this.createStar(), callbackScope: this, loop: true });

        this.createBomb();
        this.time.addEvent({ delay: 5000, callback: () => this.createBomb(), callbackScope: this, loop: true });

        this.time.addEvent({ delay: 2000, callback: () => this.createRandomPlatform(), callbackScope: this, loop: true });

        const fullscreenButton = this.add.image(this.scale.width - 40, 40, 'fullscreen').setInteractive().setDisplaySize(32, 32);
        fullscreenButton.on('pointerdown', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });

        const reloadButton = this.add.image(this.scale.width - 40, 80, 'reload').setInteractive().setDisplaySize(32, 32);
        reloadButton.on('pointerdown', () => {
            this.scene.restart();
        });

        this.createMobileControls();
    }

    update() {
        if (gameOver) return;

        this.handlePlayerMovement(player, cursors, wasd, leftButton, rightButton, jumpButton);

        platforms.children.iterate(function (platform) {
            if (platform && platform.y >= this.scale.height - 30) {
                platform.setVelocityY(-50);
            } else if (platform && platform.y <= 100) {
                platform.setVelocityY(50);
            }
        }, this);
    }

    createPlatform(x, y, scaleX = 1) {
        const platform = platforms.create(x, y, 'ground');
        platform.setScale(scaleX).refreshBody();
        platform.setVelocityY(50);  // Add vertical movement
    }

    createRandomPlatform() {
        if (platforms.getChildren().length < 10) {
            const x = Phaser.Math.Between(50, this.scale.width - 50);
            const y = Phaser.Math.Between(100, this.scale.height - 100);
            this.createPlatform(x, y, Phaser.Math.FloatBetween(0.5, 1.5));
        }
    }

    createStar() {
        const x = Phaser.Math.Between(0, this.scale.width);
        const star = stars.create(x, 0, 'star');
        star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        star.setCollideWorldBounds(true);
        star.setVelocityY(Phaser.Math.Between(50, 100));

        this.time.addEvent({ delay: 5000, callback: () => star.destroy(), callbackScope: this });
    }

    createBomb() {
        const x = Phaser.Math.Between(0, this.scale.width);
        const bomb = bombs.create(x, 16, 'bomb');
        bomb.setBounce(1);
        bomb.setCollideWorldBounds(true);
        bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);

        this.time.addEvent({ delay: 8000, callback: () => this.explodeBomb(bomb), callbackScope: this });
    }

    explodeBomb(bomb) {
        if (!bomb.active) return;
        const bombX = bomb.x;
        const bombY = bomb.y;
        bomb.destroy();

        platforms.getChildren().forEach(platform => {
            if (platform && platform.active && Phaser.Math.Distance.Between(bombX, bombY, platform.x, platform.y) < 100) {
                platform.destroy();
            }
        });
    }

    handlePlayerMovement(player, cursors, wasd, leftButton, rightButton, jumpButton) {
        player.setVelocityX(0);
        if (cursors.left.isDown || wasd.left.isDown || leftButton.isDown) {
            player.setVelocityX(-160);
        } else if (cursors.right.isDown || wasd.right.isDown || rightButton.isDown) {
            player.setVelocityX(160);
        }
        if ((cursors.up.isDown || wasd.up.isDown || jumpButton.isDown) && (player.body.touching.down || player.body.onFloor())) {
            player.setVelocityY(-500);  // Increase jump height
            this.sound.play('jumpSound');
        }
    }

    createMobileControls() {
        leftButton = this.add.image(100, this.scale.height - 100, 'leftButton').setInteractive().setDisplaySize(80, 80);
        rightButton = this.add.image(200, this.scale.height - 100, 'rightButton').setInteractive().setDisplaySize(80, 80);
        jumpButton = this.add.image(this.scale.width - 100, this.scale.height - 100, 'jumpButton').setInteractive().setDisplaySize(80, 80);

        leftButton.setScrollFactor(0);
        rightButton.setScrollFactor(0);
        jumpButton.setScrollFactor(0);

        leftButton.on('pointerdown', () => leftButton.isDown = true);
        leftButton.on('pointerup', () => leftButton.isDown = false);
        leftButton.on('pointerout', () => leftButton.isDown = false);

        rightButton.on('pointerdown', () => rightButton.isDown = true);
        rightButton.on('pointerup', () => rightButton.isDown = false);
        rightButton.on('pointerout', () => rightButton.isDown = false);

        jumpButton.on('pointerdown', () => jumpButton.isDown = true);
        jumpButton.on('pointerup', () => jumpButton.isDown = false);
        jumpButton.on('pointerout', () => jumpButton.isDown = false);
    }
}

function collectStar(player, star) {
    console.log('Collected a star!');
    star.disableBody(true, true);
    score += 10;
    scoreText.setText(`Score: ${score}`);
    this.sound.play('collectStarSound');
}

function hitBomb(player, bomb) {
    console.log('Hit by a bomb!');
    bomb.disableBody(true, true);
    player.setTint(0xff0000);
    lives -= 1;
    livesText.setText(`Lives: ${lives}`);
    this.sound.play('hitBombSound');
    if (lives <= 0) {
        gameOver = true;
        this.saveHighScore();
        backgroundMusic.stop();
        this.time.delayedCall(2000, () => {
            this.scene.start('MenuScene'); // Go back to the menu
        });
    } else {
        this.time.delayedCall(1000, () => {
            bomb.enableBody(true, bomb.x, bomb.y, true, true);
            player.clearTint();
        });
    }
}

GameScene.prototype.saveHighScore = function() {
    let name = prompt('Game Over! Enter your name:');
    if (name) {
        let scores = JSON.parse(localStorage.getItem('scores')) || [];
        scores.push({ name: name, score: score });
        localStorage.setItem('scores', JSON.stringify(scores));
    }
}