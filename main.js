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
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.image('leftButton', 'assets/leftButton.png');
        this.load.image('rightButton', 'assets/rightButton.png');
        this.load.image('jumpButton', 'assets/jumpButton.png');
    }

    create() {
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'sky').setDisplaySize(this.scale.width, this.scale.height);

        platforms = this.physics.add.staticGroup();
        platforms.create(this.scale.width / 2, this.scale.height - 30, 'ground').setScale(2).refreshBody();

        player = this.physics.add.sprite(100, this.scale.height - 150, 'star');
        player.setBounce(0.2).setCollideWorldBounds(true);

        this.physics.add.collider(player, platforms);

        cursors = this.input.keyboard.createCursorKeys();

        // Create mobile controls
        this.createMobileControls();

        scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
        livesText = this.add.text(16, 80, 'Lives: 3', { fontSize: '32px', fill: '#000' });
    }

    update() {
        if (gameOver) return;

        player.setVelocityX(0);
        if (cursors.left.isDown || (leftButton && leftButton.isDown)) {
            player.setVelocityX(-160);
        } else if (cursors.right.isDown || (rightButton && rightButton.isDown)) {
            player.setVelocityX(160);
        } else {
            player.setVelocityX(0);
        }

        if ((cursors.up.isDown || (jumpButton && jumpButton.isDown)) && player.body.touching.down) {
            player.setVelocityY(-330);
        }
    }

    createMobileControls() {
        leftButton = this.add.image(80, this.scale.height - 80, 'leftButton').setInteractive().setDisplaySize(60, 60);
        rightButton = this.add.image(160, this.scale.height - 80, 'rightButton').setInteractive().setDisplaySize(60, 60);
        jumpButton = this.add.image(this.scale.width - 80, this.scale.height - 80, 'jumpButton').setInteractive().setDisplaySize(60, 60);

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
    player.setTint(0xff0000);
    lives -= 1;
    livesText.setText(`Lives: ${lives}`);
    if (lives <= 0) {
        gameOver = true;
        this.saveHighScore();
        this.time.delayedCall(2000, () => {
            this.scene.start('MenuScene');
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