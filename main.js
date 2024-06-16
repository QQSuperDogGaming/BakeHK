class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    preload() {
        this.load.image('sky', 'assets/sky.png');
        this.load.image('ground', 'assets/platform.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('bomb', 'assets/bomb.png');
        this.load.audio('backgroundMusic1', 'assets/audio/backgroundMusic1.mp3');
        this.load.audio('backgroundMusic2', 'assets/audio/backgroundMusic2.mp3');
        this.load.audio('backgroundMusic3', 'assets/audio/backgroundMusic3.mp3');
        this.load.audio('jumpSound', 'assets/audio/jump.mp3');
        this.load.audio('collectStarSound', 'assets/audio/collectStar.mp3');
        this.load.audio('hitBombSound', 'assets/audio/hitBomb.mp3');
    }

    create() {
        this.add.image(this.scale.width / 2, this.scale.height / 2, 'sky').setDisplaySize(this.scale.width, this.scale.height);

        const platforms = this.physics.add.staticGroup();
        platforms.create(this.scale.width / 2, this.scale.height - 30, 'ground').setScale(2).refreshBody();

        const player = this.physics.add.sprite(100, this.scale.height - 150, 'star');
        player.setBounce(0.2).setCollideWorldBounds(true);

        this.physics.add.collider(player, platforms);

        cursors = this.input.keyboard.createCursorKeys();

        const backgroundMusicKeys = ['backgroundMusic1', 'backgroundMusic2', 'backgroundMusic3'];
        const randomMusicKey = Phaser.Math.RND.pick(backgroundMusicKeys);
        this.sound.add(randomMusicKey, { loop: true }).play();
    }

    update() {
        const player = this.physics.add.sprite(100, this.scale.height - 150, 'star');

        if (cursors.left.isDown) {
            player.setVelocityX(-160);
        } else if (cursors.right.isDown) {
            player.setVelocityX(160);
        } else {
            player.setVelocityX(0);
        }

        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-330);
            this.sound.play('jumpSound');
        }
    }
}

function collectStar(player, star) {
    star.disableBody(true, true);
    this.sound.play('collectStarSound');
}

function hitBomb(player, bomb) {
    this.sound.play('hitBombSound');
    this.physics.pause();
    player.setTint(0xff0000);
    player.anims.play('turn');
}