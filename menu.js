class MenuScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MenuScene' });
    }

    preload() {
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
        this.load.audio('menuMusic', 'assets/menuMusic.mp3'); // Load your music
        this.load.audio('gameMusic', 'assets/gameMusic.mp3'); // Load game music
    }

    create() {
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'menuBackground').setDisplaySize(this.scale.width, this.scale.height);

        const playButton = this.add.image(this.scale.width / 2, this.scale.height / 2, 'playButton').setInteractive().setDisplaySize(200, 80);
        playButton.on('pointerdown', () => {
            this.startGame();
        });

        const fullscreenButton = this.add.image(this.scale.width - 40, 40, 'fullscreen').setInteractive().setDisplaySize(32, 32);
        fullscreenButton.on('pointerdown', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });

        const leaderboardButton = this.add.image(this.scale.width / 2, this.scale.height / 2 + 100, 'leaderboardButton').setInteractive().setDisplaySize(200, 80);
        leaderboardButton.on('pointerdown', () => {
            this.scene.start('LeaderboardScene');
        });

        const character1 = this.add.image(this.scale.width / 2 - 100, this.scale.height / 2 - 200, 'character1').setInteractive().setDisplaySize(50, 50);
        const character2 = this.add.image(this.scale.width / 2, this.scale.height / 2 - 200, 'character2').setInteractive().setDisplaySize(50, 50);
        const character3 = this.add.image(this.scale.width / 2 + 100, this.scale.height / 2 - 200, 'character3').setInteractive().setDisplaySize(50, 50);

        const map1 = this.add.image(this.scale.width / 2 - 100, this.scale.height / 2 - 100, 'map1').setInteractive().setDisplaySize(50, 50);
        const map2 = this.add.image(this.scale.width / 2, this.scale.height / 2 - 100, 'map2').setInteractive().setDisplaySize(50, 50);

        character1.on('pointerdown', () => {
            this.selectedCharacter = 'character1';
        });
        character2.on('pointerdown', () => {
            this.selectedCharacter = 'character2';
        });
        character3.on('pointerdown', () => {
            this.selectedCharacter = 'character3';
        });

        map1.on('pointerdown', () => {
            this.selectedMap = 'map1';
        });
        map2.on('pointerdown', () => {
            this.selectedMap = 'map2';
        });
    }

    startGame() {
        const selectedCharacter = this.selectedCharacter || 'character1';
        const selectedMap = this.selectedMap || 'map1';
        this.scene.start('GameScene', { character: selectedCharacter, map: selectedMap });
    }
}

class LeaderboardScene extends Phaser.Scene {
    constructor() {
        super({ key: 'LeaderboardScene' });
    }

    preload() {
        this.load.image('backButton', 'assets/backButton.png');
    }

    create() {
        const scores = JSON.parse(localStorage.getItem('scores')) || [];
        let leaderboardText = 'Leaderboard\n';
        scores.forEach((entry, index) => {
            leaderboardText += `${index + 1}. ${entry.player}: ${entry.score}\n`;
        });

        this.add.text(this.scale.width / 2, this.scale.height / 2 - 100, leaderboardText, { fontSize: '32px', fill: '#000' }).setOrigin(0.5);

        const backButton = this.add.image(this.scale.width / 2, this.scale.height / 2 + 100, 'backButton').setInteractive().setDisplaySize(200, 80);
        backButton.on('pointerdown', () => {
            this.scene.start('MenuScene');
        });
    }
}

let player;
let cursors, wasd, leftButton, rightButton, jumpButton;
let stars, bombs, platforms;
let scoreText, livesText;
let gameOver = false;
let score = 0;
let lives = 3;
let leaderboard;
let canJump = true; // Cooldown flag

class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
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
    }

    create(data) {
        this.add.image(this.scale.width / 2, this.scale.height / 2, data.map).setDisplaySize(this.scale.width, this.scale.height);

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
        this.physics.add.overlap(player, stars, collectStar, null, this);

        bombs = this.physics.add.group();
        this.physics.add.collider(bombs, platforms);
        this.physics.add.collider(player, bombs, hitBomb, null, this);

        scoreText = this.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });
        livesText = this.add.text(16, 80, `Lives: ${lives}`, { fontSize: '32px', fill: '#000' });

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

        this.scale.on('resize', this.resize, this);

        leaderboard = this.add.text(this.scale.width - 200, 16, 'Leaderboard', { fontSize: '32px', fill: '#000' });
        this.updateLeaderboard();
    }

    update() {
        if (gameOver) return;

        this.handlePlayerMovement(player, cursors, wasd, leftButton, rightButton, jumpButton);
    }

    resize(gameSize, baseSize, displaySize, resolution) {
        const width = gameSize.width;
        const height = gameSize.height;

        if (this.cameras.main) {
            this.cameras.resize(width, height);
            scoreText.setPosition(16, 16);
            livesText.setPosition(16, 80);
            leaderboard.setPosition(width - 200, 16);
        }
    }

    createPlatform(x, y, scaleX = 1) {
        const platform = platforms.create(x, y, 'ground```javascript
');
        platform.setScale(scaleX).refreshBody();

        // Set a timer to destroy the platform after 10 seconds
        this.time.delayedCall(10000, () => {
            platform.destroy();
        });
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
        if ((cursors.up.isDown || wasd.up.isDown || jumpButton.isDown) && canJump) {
            player.setVelocityY(-330);
            canJump = false;
            this.time.delayedCall(200, () => {
                canJump = true;
            });
        }
    }

    initializeControls() {
        cursors = this.input.keyboard.createCursorKeys();
        wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            right: Phaser.Input.Keyboard.KeyCodes.D
        });
    }

    createMobileControls() {
        leftButton = this.add.image(100, this.scale.height - 100, 'leftButton').setInteractive().setDisplaySize(120, 120);
        rightButton = this.add.image(250, this.scale.height - 100, 'rightButton').setInteractive().setDisplaySize(120, 120);
        jumpButton = this.add.image(this.scale.width - 150, this.scale.height - 100, 'jumpButton').setInteractive().setDisplaySize(120, 120);

        leftButton.setScrollFactor(0);
        rightButton.setScrollFactor(0);
        jumpButton.setScrollFactor(0);

        leftButton.on('pointerdown', () => {
            leftButton.isDown = true;
        });
        leftButton.on('pointerup', () => {
            leftButton.isDown = false;
        });
        leftButton.on('pointerout', () => {
            leftButton.isDown = false;
        });

        rightButton.on('pointerdown', () => {
            rightButton.isDown = true;
        });
        rightButton.on('pointerup', () => {
            rightButton.isDown = false;
        });
        rightButton.on('pointerout', () => {
            rightButton.isDown = false;
        });

        jumpButton.on('pointerdown', () => {
            jumpButton.isDown = true;
        });
        jumpButton.on('pointerup', () => {
            jumpButton.isDown = false;
        });
        jumpButton.on('pointerout', () => {
            jumpButton.isDown = false;
        });
    }

    updateLeaderboard() {
        const scores = JSON.parse(localStorage.getItem('scores')) || [];
        scores.push({ player: 'Player', score: score });
        scores.sort((a, b) => b.score - a.score);
        localStorage.setItem('scores', JSON.stringify(scores.slice(0, 5)));

        let leaderboardText = 'Leaderboard\n';
        scores.forEach((entry, index) => {
            leaderboardText += `${index + 1}. ${entry.player}: ${entry.score}\n`;
        });

        leaderboard.setText(leaderboardText);
    }
}

function collectStar(player, star) {
    star.disableBody(true, true);
    score += 10;
    scoreText.setText(`Score: ${score}`);
    this.scene.get('GameScene').updateLeaderboard();
}

function hitBomb(player, bomb) {
    player.setTint(0xff0000);
    this.physics.pause();
    lives -= 1;
    livesText.setText(`Lives: ${lives}`);

    if (lives <= 0) {
        gameOver = true;
        const scores = JSON.parse(localStorage.getItem('scores')) || [];
        scores.push({ player: 'Player', score: score });
        scores.sort((a, b) => b.score - a.score);
        localStorage.setItem('scores', JSON.stringify(scores.slice(0, 5)));

        this.time.delayedCall(1000, () => {
            gameOver = false;
            score = 0;
            lives = 3;
            this.scene.restart();
        });
    } else {
        bomb.disableBody(true, true);
        this.time.delayedCall(1000, () => {
            player.clearTint();
            this.physics.resume();
        });
    }
}

const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    scene: [MenuScene, GameScene, LeaderboardScene],
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);

window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
});

create(data) {
    // Background music for the game
    this.menuMusic = this.sound.add('menuMusic', { loop: true, volume: 0.5 });
    this.menuMusic.play(); // Start playing the game music

    // Rest of your create logic

    const backButton = this.add.image(this.scale.width - 40, 120, 'backButton').setInteractive().setDisplaySize(32, 32);
    backButton.on('pointerdown', () => {
        this.gameMusic.stop(); // Stop game music when returning to the menu
        this.scene.start('MenuScene');
    });
}
create() {
    this.menuMusic = this.sound.add('menuMusic', { loop: true, volume: 0.5 });

    // Other UI elements
    this.playButton = this.add.image(this.scale.width / 2, this.scale.height / 2, 'playButton').setInteractive().setDisplaySize(200, 80);

    this.playButton.on('pointerdown', () => {
        // Check if the music context is suspended and resume it
        if (this.sound.context.state === 'suspended') {
            this.sound.context.resume();
        }

        // Start playing the menu music only after user clicks the play button
        this.menuMusic.play();

        document.getElementById('username-container').style.display = 'block';
    });

    this.fullscreenButton = this.add.image(this.scale.width - 40, 40, 'fullscreen').setInteractive().setDisplaySize(32, 32);
    this.fullscreenButton.on('pointerdown', () => {
        if (this.scale.isFullscreen) {
            this.scale.stopFullscreen();
        } else {
            this.scale.startFullscreen();
        }
    });
}
