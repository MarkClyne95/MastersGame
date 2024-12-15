export default class RandomEncounter extends Phaser.Scene {
    constructor() {
        super({ key: 'RandomEncounter' });
    }

    preload() {
        // Preload assets for battle if any
    }

    create() {
        // Create battle scene elements
        this.add.text(400, 300, 'Random Encounter!', { fontSize: '40px', fill: '#fff' }).setOrigin(0.5);

        // Setup interaction to end the battle
        this.input.keyboard.on('keydown-Z', () => {
            this.scene.stop('RandomEncounter');
            this.scene.setVisible(true, 'MainScene');
            this.scene.resume('MainScene');
        });
    }
}