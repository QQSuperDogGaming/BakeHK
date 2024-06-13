let player;
let cursors, wasd, leftButton, rightButton, jumpButton;
let stars, bombs, platforms;
let scoreText, livesText;
let gameOver = false;
let score = 0;
let lives = 3;

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        // Preload map images
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
        this.load.spritesheet('character', 'assets/character1.png', { frameWidth: 64, frameHeight: 64 });
    }

    create(data) {
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

        player = this.physics.add.sprite(100, this.scale.height - 150, 'character');

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

        // Create animations from the sprite sheet
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers('character', { start: 0, end: 7 }), // Adjust the range according to your sprite sheet
            frameRate: 10,
            repeat: -1
        });

        player.anims.play('walk');
    }

    update() {
        if (gameOver) return;

        this.handlePlayerMovement(player, cursors, wasd, leftButton, rightButton, jumpButton);

        platforms.children.iterate(function (platform) {
            if (platform.y >= this.scale.height - 30) {
                platform.setVelocityY(-50);
            } else if (platform.y <= 100) {
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
        bomb.destroy();
        platforms.children.iterate(platform => {
            if (Phaser.Math.Distance.Between(bomb.x, bomb.y, platform.x, platform.y) < 100) {
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
        if ((cursors.up.isDown || wasd.up.isDown || jumpButton.isDown)) {
            player.setVelocityY(-330);
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
    star.disableBody(true, true);
    score += 10;
    scoreText.setText(`Score: ${score}`);
}

function hitBomb(player, bomb) {
    bomb.disableBody(true, true);
    lives -= 1;
    livesText.setText(`Lives: ${lives}`);
    if (lives <= 0) endGame('Game Over!');
}

function endGame(message) {
    this.physics.pause();
    player.setTint(0xff0000);
    gameOver = true;
    this.add.text(this.scale.width / 2, this.scale.height / 2, message, { fontSize: '64px', fill: '#fff' }).setOrigin(0.5);
}

// Ensure to define the game configuration in menu.js or main.js

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [MenuScene, GameScene]
};

const game = new Phaser.Game(config);
