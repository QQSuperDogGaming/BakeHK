
### `main.js`:
Define the `GameScene` class in `main.js` and configure the Phaser game.

```javascript
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
        this.load.spritesheet('character1', 'assets/character1.png', { frameWidth: 32, frameHeight: 48 });
        this.load.spritesheet('character2', 'assets/character2.png', { frameWidth: 32, frameHeight: 48 });
        this.load.spritesheet('character3', 'assets/character3.png', { frameWidth: 32, frameHeight: 48 });
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
            console.log('Fullscreen button clicked');
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });

        const reloadButton = this.add.image(this.scale.width - 40, 80, 'reload').setInteractive().setDisplaySize(32, 32);
        reloadButton.on('pointerdown', () => {
            console.log('Reload button clicked');
            this.scene.restart();
        });

        this.createMobileControls();

        // Create animations from the sprite sheet
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNumbers(data.character, { start: 0, end: 7 }), // Adjust the range according to your sprite sheet
            frameRate: 10,
            repeat: -1
        });

        player.anims.play('walk');
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
        if ((cursors.up.isDown || wasd.up.isDown || jumpButton.isDown) && player.body.touching.down) {
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

        leftButton.on('pointerdown', () => {
            leftButton.isDown = true;
            console.log('Left button pressed');
        });
        leftButton.on('pointerup', () => {
            leftButton.isDown = false;
            console.log('Left button released');
        });
        leftButton.on('pointerout', () => {
            leftButton.isDown = false;
            console.log('Left button out');
        });

        rightButton.on('pointerdown', () => {
            rightButton.isDown = true;
            console.log('Right button pressed');
        });
        rightButton.on('pointerup', () => {
            rightButton.isDown = false;
            console.log('Right button released');
        });
        rightButton.on('pointerout', () => {
            rightButton.isDown = false;
            console.log('Right button out');
        });

        jumpButton.on('pointerdown', () => {
            jumpButton.isDown = true;
            console.log('Jump button pressed');
        });
        jumpButton.on('pointerup', () => {
            jumpButton.isDown = false;
            console.log('Jump button released');
        });
        jumpButton.on('pointerout', () => {
            jumpButton.isDown = false;
            console.log('Jump button out');
        });
    }
}

function collectStar(player, star) {
    star.disableBody(true, true);
    score += 10;
    scoreText.setText(`Score: ${score}`);
}

function hitBomb(player, bomb) {
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
    gameOver = true;
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    scene: [MenuScene, GameScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    }
};

const game = new Phaser.Game(config);
