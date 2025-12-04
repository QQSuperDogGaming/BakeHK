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

export default LeaderboardScene;
