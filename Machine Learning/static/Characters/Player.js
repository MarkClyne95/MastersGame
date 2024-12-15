let actionEnum = { 'None': 0, 'Up': 1, 'Down': 2, 'Left': 3, 'Right': 4, 'z': 5 };

let game = {
    action: {
        up: function () {
            if (lastAction != actionEnum.Down) {
                this.setVelocityX(0);
                this.setVelocityY(-200)
            }
        },
        down: function () {
            if (lastAction != actionEnum.Up) {
                this.setVelocityX(0);
                this.setVelocityY(200)
            }
        },
        left: function () {
            if (lastAction != actionEnum.Right) {
                this.setVelocityX(-200);
                this.setVelocityY(0)
            }
        },
        right: function () {
            if (lastAction != actionEnum.Left) {
                this.setVelocityX(200);
                this.setVelocityY(0)
            }
        },
        z: function () {
            this.input.keyboard.emit('keydown-Z')
        }
    }
}

class Player extends Phaser.Physics.Arcade.Sprite {
    constructor() {
        super("Player");
    }

    start() {

    }


}