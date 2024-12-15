// Define the MainScene class
import MainScene from "./MainScene.js";
import RandomEncounter from "./RandomEncounter.js"
import Town from "./Town.js"

let baseUrl = "http://127.0.0.1:5000/static"
let assetCatagory = {
    'audio': "/Audio/",
    'sprites': "/Sprites/PlayerSprites/"
}

function url_for(category, asset) {
    return baseUrl + assetCatagory[category] + asset
}


class Begin extends Phaser.Scene {
    constructor() {
        super()
    }

    preload() {
        this.load.spritesheet('player', url_for('sprites', 'player.png'), {
            frameWidth: 32,
            frameHeight: 32,
            frames: 12
        });

        
    }

    create() {
        //move forward animation
        this.anims.create({
            key: 'forward',
            frames: this.anims.generateFrameNumbers('player', { frames: [9, 10, 11, 10] })
        })

        //move back animation
        this.anims.create({
            key: 'backward',
            frames: this.anims.generateFrameNumbers('player', { frames: [0, 1, 2, 1] })
        })

        //move left animation
        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('player', { frames: [3, 4, 5, 4] })
        })

        //move right animation
        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('player', { frames: [6, 7, 8, 7] })
        })
        //#endregion

        

        this.scene.start('MainScene')

        
    }
}

// Configuration for the Phaser game
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            debug: false
        }
    },
    scene: [Begin, MainScene, RandomEncounter, Town]
};

const game = new Phaser.Game(config);
