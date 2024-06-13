let player;
let stars;
let bombs;
let platforms;
let cursors;
let wasd;
let spacebar;
let score = 0;
let lives = 3;
let gameOver = false;
let scoreText;
let livesText;
let starTimer;
let platformTimer;
let bombTimer;
let inactivityTimer;
let lastMovementTime = 0;
let leftButton;
let rightButton;
let jumpButton;
let isMovingLeft = false;
let isMovingRight = false;
let isJumping = false;

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
        this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 64, frameHeight: 64 });
    }

    create() {
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'sky').setDisplaySize(this.scale.width, this.scale.height);

        platforms = this.physics.add.group({
            immovable: true,
            allowGravity: false
        });

        createPlatform(this.scale.width / 2, this.scale.height - 30, 2);
        createPlatform(this.scale.width - 200, this.scale.height - 200, 1);
        createPlatform(50, this.scale.height - 350, 1);
        createPlatform(this.scale.width - 100, this.scale.height - 400, 1);

        player = this.physics.add.sprite(100, this.scale.height - 150, 'dude');
        player.setBounce(0.2);
        player.setCollideWorldBounds(true);
        this.physics.add.collider(player, platforms);

        cursors = this.input.keyboard.createCursorKeys();
        wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
        spacebar = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        stars = this.physics.add.group();
        this.physics.add.collider(stars, platforms);
        this.physics.add.overlap(player, stars, collectStar, null, this);

        bombs = this.physics.add.group();
        this.physics.add.collider(bombs, platforms);
        this.physics.add.collider(player, bombs, hitBomb, null, this);

        scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
        livesText = this.add.text(16, 50, 'Lives: 3', { fontSize: '32px', fill: '#000' });

        score = 0;
        lives = 3;

        starTimer = this.time.addEvent({
            delay: 1000,
            callback: createStar,
            callbackScope: this,
            loop: true
        });

        platformTimer = this.time.addEvent({
            delay: 2000,
            callback: () => createPlatform(Phaser.Math.Between(0, this.scale.width), 0, Phaser.Math.FloatBetween(0.5, 1.5)),
            callbackScope: this,
            loop: true
        });

        bombTimer = this.time.addEvent({
            delay: 5000,
            callback: createBomb,
            callbackScope: this,
            loop: true
        });

        inactivityTimer = this.time.addEvent({
            delay: 30000,
            callback: checkInactivity,
            callbackScope: this,
            loop: true
        });

        // Create touch controls
        createTouchControls(this);

        // Generate and display the QR code
        generateQRCode('https://qqsuperdoggaming.github.io/BakeHK/');
    }

    update(time, delta) {
        if (gameOver) {
            return;
        }

        let isMoving = false;

        if (cursors.left.isDown || wasd.left.isDown || isMovingLeft) {
            player.setVelocityX(-160);
            isMoving = true;
        } else if (cursors.right.isDown || wasd.right.isDown || isMovingRight) {
            player.setVelocityX(160);
            isMoving = true;
        } else {
            player.setVelocityX(0);
        }

        if (cursors.up.isDown || wasd.up.isDown || spacebar.isDown || isJumping) {
            player.setVelocityY(-330);
            isMoving = true;
        }

        if (isMoving) {
            lastMovementTime = time;
        }

        platforms.children.iterate(function (platform) {
            if (platform && platform.y > this.scale.height) {
                platform.destroy();
            }
        }, this);
    }
}

class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
        this.load.image('menu', 'assets/menu.png');
        this.load.image('startButton', 'assets/startButton.png');
    }

    create() {
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'menu').setDisplaySize(this.scale.width, this.scale.height);

        const startButton = this.add.image(this.scale.width / 2, this.scale.height / 2, 'startButton').setInteractive().setDisplaySize(150, 50);

        startButton.on('pointerdown', () => {
            this.scene.start('GameScene');
        });

        this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, 'My Phaser Game', { fontSize: '64px', fill: '#fff' }).setOrigin(0.5);
    }
}

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

function createPlatform(x, y, scaleX = 1) {
    const platform = platforms.create(x, y, 'ground');
    platform.setScale(scaleX).refreshBody();
    platform.body.updateFromGameObject();
    platform.setVelocityY(50);
}

function createStar() {
    const x = Phaser.Math.Between(0, game.scale.width);
    const y = 0;
    const star = stars.create(x, y, 'star');
    star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
    star.setCollideWorldBounds(true);
    star.setVelocityY(Phaser.Math.Between(50, 100));
    
    this.time.addEvent({
        delay: 5000,
        callback: () => star.destroy(),
        callbackScope: this
    });
}

function createBomb() {
    const x = Phaser.Math.Between(0, game.scale.width);
    const bomb = bombs.create(x, 16, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
    
    this.time.addEvent({
        delay: 8000,
        callback: () => explodeBomb(bomb),
        callbackScope: this
    });
}

function collectStar(player, star) {
    star.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);

    if (score >= 400) {
        winGame();
        return;
    }

    if (stars.countActive(true) === 0) {
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });

        createBomb();
    }
}

function hitBomb(player, bomb) {
    bomb.disableBody(true, true);
    lives -= 1;
    livesText.setText('Lives: ' + lives);

    if (lives <= 0) {
        this.physics.pause();
        player.setTint(0xff0000);
        gameOver = true;
        scoreText.setText('Game Over!');
    }
}

function checkInactivity() {
    const currentTime = this.time.now;
    if (currentTime - lastMovementTime >= 30000) {
        gameOver = true;
        this.physics.pause();
        player.setTint(0xff0000);
        scoreText.setText('You lost due to inactivity!');
    }
}

function winGame() {
    this.physics.pause();
    player.setTint(0x00ff00);
    gameOver = true;
    scoreText.setText('You Win!');
}

function explodeBomb(bomb) {
    if (!bomb.active) return;

    bomb.destroy();

    platforms.children.iterate(function (platform) {
        if (Phaser.Math.Distance.Between(bomb.x, bomb.y, platform.x, platform.y) < 100) {
            platform.destroy();
        }
    });
}

function createTouchControls(scene) {
    const buttonSize = 80;
    const buttonMargin = 20;

    leftButton = scene.add.image(buttonMargin + buttonSize / 2, game.scale.height - buttonMargin - buttonSize / 2, 'leftButton').setInteractive().setDisplaySize(buttonSize, buttonSize);
    rightButton = scene.add.image(buttonMargin * 2 + buttonSize + buttonSize / 2, game.scale.height - buttonMargin - buttonSize / 2, 'rightButton').setInteractive().setDisplaySize(buttonSize, buttonSize);
    jumpButton = scene.add.image(game.scale.width - buttonMargin - buttonSize / 2, game.scale.height - buttonMargin - buttonSize / 2, 'jumpButton').setInteractive().setDisplaySize(buttonSize, buttonSize);

    leftButton.on('pointerdown', function () {
        isMovingLeft = true;
    });
    leftButton.on('pointerup', function () {
        isMovingLeft = false;
    });
    leftButton.on('pointerout', function () {
        isMovingLeft = false;
    });

    rightButton.on('pointerdown', function () {
        isMovingRight = true;
    });
    rightButton.on('pointerup', function () {
        isMovingRight = false;
    });
    rightButton.on('pointerout', function () {
        isMovingRight = false;
    });

    jumpButton.on('pointerdown', function () {
        isJumping = true;
    });
    jumpButton.on('pointerup', function () {
        isJumping = false;
    });
    jumpButton.on('pointerout', function () {
        isJumping = false;
    });
}

function generateQRCode(url) {
    const qrCodeElement = document.getElementById('qrcode');
    qrCodeElement.innerHTML = '';
    const qr = qrcode(4, 'L');
    qr.addData(url);
    qr.make();
    qrCodeElement.innerHTML = qr.createImgTag();
}