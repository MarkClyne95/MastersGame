let player
let music
let running = false
let key
const window = document.getElementById('content')

const COLOR_MAIN = 0x4e342e
const COLOR_LIGHT = 0x7b5e57
const COLOR_DARK = 0x260e04

let availableActions = ['up', 'down', 'left', 'right', 'z']
let npcArray = []
let game
let playerLoc, npcLocs, tileIndex, currentNpcCoord
let currentNpc
let receivedData = ''
let baseUrl = 'http://127.0.0.1:5000/static'
let assetCatagory = {
  audio: '/Audio/',
  sprites: '/Sprites/PlayerSprites/',
  tilemap: '/Tilemaps/',
}

import TILES from '../Tilemaps/tile-mapping.js'
import CurrentNpc from '../Characters/CurrentNPC.js'

function url_for(category, asset) {
  const fullUrl = baseUrl + assetCatagory[category] + asset
  console.log('Loading URL:', fullUrl)
  return fullUrl
}

export default class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MainScene' })
  }

  preload() {
    this.socket = io('http://127.0.0.1:5000')
    this.socket.on('connect', () => {
      console.log('Connected to server')
      // Send initial data or listen for events
    })
    this.socket.on('my_event', (data) => {
      console.log(data) // This should log 'Hello from the server!'
    })
    this.load.audio('intro', url_for('audio', 'intro.WAV'))
    this.load.audio('hit', url_for('audio', 'hit.wav'))
    this.load.scenePlugin({
      key: 'rexuiplugin',
      url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js',
      sceneKey: 'rexUI',
    })

    //#region NPCs sprites
    this.load.spritesheet('sultanate', url_for('sprites', 'sultanate.png'), {
      frameWidth: 32,
      frameHeight: 32,
      frames: 12,
    }) //this loads sultanate spritesheet
    //#endregion

    //#region World
    this.load.image('base_tiles', url_for('tilemap', '!CL_DEMO_48x48.png'))
    this.load.tilemapTiledJSON(
      'tilemap',
      url_for('tilemap', 'introscene1.json')
    )
    //#endregion

    this.socket.on('action', (data) => {
      console.log('Received action:', data)
      console.log('Data:', data.data) // Access the data property
      receivedData = data
      simKeypress(
        data.data,
        this.specificTile,
        this.player,
        this.map,
        this.tweens
      )
    })
  }

  create() {
    game = this
    //create the camera
    this.camera = this.cameras.main

    setInterval(() => {
      if (this.specificTile != null) {
        this.socket.emit('message', {
          x: this.specificTile.x,
          y: this.specificTile.y,
        })
      }
    }, 1000)

    playerLoc = document.getElementById('playerloc')
    npcLocs = document.getElementById('npclocs')
    tileIndex = document.getElementById('tileindex')

    this.dialogQueue = []

    music = this.sound.add('intro')
    music.play()
    music.setVolume(0.03)

    this.oneHitSound = this.sound.add('hit')
    this.oneHitSound.setVolume(0.03)

    //load the scene
    this.map = this.make.tilemap({ key: 'tilemap' })
    let tileset = this.map.addTilesetImage('!CL_DEMO_48x48', 'base_tiles')

    // Define the grid size based on your tile size
    const gridSize = 48 // Example size, change to match your tile size

    // Function to convert world coordinates to grid coordinates
    this.worldToGrid = function (worldX, worldY) {
      return {
        gridX: Math.floor(worldX / gridSize),
        gridY: Math.floor(worldY / gridSize),
      }
    }

    // Function to convert grid coordinates to world coordinates
    this.gridToWorld = function (gridX, gridY) {
      return {
        worldX: gridX * gridSize,
        worldY: gridY * gridSize,
      }
    }

    //create layers
    this.baseLayer = this.map.createLayer('base', tileset, 0, 0)
    this.furnitureLayer = this.map.createLayer('furniture', tileset, 0, 0)
    this.doorLayer = this.map.createLayer('door', tileset, 0, 0)

    const layerData = this.map.layers[0]
    const tiles = layerData.data

    const tileArray = []

    // Add all the layers to the tile array
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        const tile = tiles[y][x]
        tileArray.push(tile.index - 1)
      }
    }

    //console.log(tileArray);

    this.player = this.physics.add.sprite(480, 220, 'player') //load the player sprite
    this.player.setScale(2) //fit the sprite to the background
    this.player.body.setCollideWorldBounds(true, 1, 1)
    this.player.setBounce(1)

    this.camera.startFollow(this.player)
    this.camera.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)

    //set the world physics fps and bounds
    this.physics.world.setFPS(30)
    this.physics.world.setBounds(0, 0, this.map.x, this.camera.y - this.map.y)

    // Initialize answerButtons
    this.answerButtons = []

    // Create player

    // Create NPCs
    this.npcs = this.physics.add.group({
      immovable: true,
    })

    this.previousX = parseInt(localStorage.getItem('playerX')) || 0
    this.previousY = parseInt(localStorage.getItem('playerY')) || 0

    this.npc = this.physics.add.sprite(400, 400, 'sultanate') //load the player sprite
    this.npc.setScale(2) //fit the sprite to the background
    this.npc.name = 'Sultanate'
    this.npcs.add(this.npc)

    for (const npc in this.npcs) {
      npcArray.push(npc)
    }

    // Add this in your create function
    let grid = this.add.grid(
      0,
      0,
      this.map.widthInPixels,
      this.map.heightInPixels,
      gridSize,
      gridSize,
      0x000000,
      0,
      0xffffff,
      0.2
    )
    grid.setOrigin(0, 0) // Align grid to the top-left corner of the game world

    // Create a textbox with borders in the create method
    this.textBox = this.rexUI.add.textBox({
      x: this.camera.midPoint.x,
      y: this.camera.midPoint.y + 200,
      background: this.rexUI.add.roundRectangle(200, 20, 2, 2, 20, 0x5e81a2),
      title: 'Title'
        ? this.add.text(0, 9, 'Title', { fontSize: '18px' })
        : undefined,

      separator: 'Title'
        ? this.rexUI.add.roundRectangle({ height: 3, color: COLOR_DARK })
        : undefined,

      // Add text and configure the style
      text: this.add.text(0, 0, '', {
        fontSize: '24px',
      }),

      // Set space around the text
      space: {
        left: 20,
        right: 20,
        top: 20,
        bottom: 20,
        text: 10,
        separator: 6,
      },

      align: {
        title: 'center',
      },
    })

    this.textBox.setVisible(false)

    // Setup cursor keys
    this.cursors = this.input.keyboard.createCursorKeys()

    let keycodes = {
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      z: Phaser.Input.Keyboard.KeyCodes.Z,
    }

    document.addEventListener('keypress', function (event) {
      if (event.keyCode == 13) {
        if (running) {
          running = false
        } else {
          running = true
          runBot(keycodes)
        }
      }
    })
    // Setup interaction key (Z)
    this.input.keyboard.on('keydown-Z', () => {
      handleZPress()
    })

    // Check for overlap between player and NPCs
    this.physics.add.overlap(
      this.player,
      this.npcs,
      this.handleNpcOverlap,
      null,
      this
    )

    this.physics.add.collider(this.player, this.npcs)

    // Track player movement
    this.lastPlayerPosition = new Phaser.Geom.Point(
      this.player.x,
      this.player.y
    )

    //we need some physics, can't have everyone overlapping
    this.furnitureLayer.setCollisionByProperty({ collides: true })
    this.baseLayer.setCollisionByProperty({ collides: true })
    //add collision for furniture layer
    let furnCollider = this.physics.add.collider(
      this.player,
      this.furnitureLayer,
      () => {
        this.oneHitSound.play()
      },
      null,
      this
    )
    //add collision for base layer
    this.physics.add.collider(
      this.player,
      this.baseLayer,
      () => {
        this.oneHitSound.play()
      },
      null,
      this
    )

    this.npcs.setActive(true)

    currentNpcCoord = this.map.getTileAtWorldXY(
      this.npc.x,
      this.npc.y,
      true,
      this.camera.main,
      this.baseLayer
    )
  }

  update() {
    // Player movement
    let moved = false

    this.specificTile = this.map.getTileAtWorldXY(
      this.player.x,
      this.player.y,
      true,
      this.camera.main,
      this.baseLayer
    )
    if (this.specificTile != null)
      tileIndex.innerText = `X: ${this.specificTile.x}, Y: ${this.specificTile.y}`

    // Check if dialog is active
    if (this.isDialogActive) {
      // Stop player movement and animations
      this.player.setVelocity(0)
      this.player.anims.stop()

      // Disable input
      this.cursors.left.enabled = false
      this.cursors.right.enabled = false
      this.cursors.up.enabled = false
      this.cursors.down.enabled = false

      this.cursors.up.isDown = false
      this.cursors.down.isDown = false
      this.cursors.left.isDown = false
      this.cursors.right.isDown = false
    } else {
      // Reset player velocity to 0
      this.player.setVelocity(0)

      if (
        !this.cursors.left.isDown &&
        !this.cursors.right.isDown &&
        !this.cursors.up.isDown &&
        !this.cursors.down.isDown
      ) {
        this.player.setVelocity(0, 0)
      }

      // Player movement logic
      if (this.cursors.left.isDown) {
        this.player.body.setVelocityX(-200)
        this.player.anims.play('left', true)
        moved = true
        this.player.anims.msPerFrame = 100
      } else if (this.cursors.right.isDown) {
        this.player.body.setVelocityX(200)
        this.player.anims.play('right', true)
        moved = true
        this.player.anims.msPerFrame = 100
      }

      if (this.cursors.up.isDown) {
        this.player.body.setVelocityY(-200)
        this.player.anims.play('forward', true)
        moved = true
        this.player.anims.msPerFrame = 100
      } else if (this.cursors.down.isDown) {
        this.player.body.setVelocityY(200)
        this.player.anims.play('backward', true)
        moved = true
        this.player.anims.msPerFrame = 100
      }
    }

    // If the player hasn't moved, stop the animations
    if (!moved) {
      this.player.anims.stop()
    }
  }

  handleNpcOverlap(player, npc) {
    this.activeNpc = npc
  }

  startDialog() {
    this.textBox.x = this.camera.midPoint.x
    this.textBox.y = this.camera.midPoint.y + 150
    this.textBox.title = this.activeNpc.name
    switch (this.activeNpc.name) {
      case 'Sultanate':
        this.dialogQueue = [
          'What is your favorite color?',
          'Choose one of the following:',
        ]
        break

      case 'Adil':
        this.dialogQueue = [
          'What is your favorite dog?',
          'Choose one of the following:',
        ]

      case 'Destin':
        this.dialogQueue = [
          'What is your favorite food?',
          'Choose one of the following:',
        ]
    }
    this.isDialogActive = true
    this.progressDialog()
    this.textBox.setVisible(true)
  }

  progressDialog() {
    if (this.dialogQueue.length > 0) {
      const dialog = this.dialogQueue.shift()
      this.textBox.start(dialog, 1)
      switch (this.activeNpc.name) {
        case 'Sultanate':
          this.op1 = 'Red'
          this.op2 = 'Blue'
          this.op3 = 'green'
          break

        case 'Destin':
          this.op1 = 'Husky'
          this.op2 = 'Collie'
          this.op3 = 'Jack Rusell'
          break

        case 'Adil':
          this.op1 = 'Stew'
          this.op2 = 'Spaghetti'
          this.op3 = 'Slime'
          break
      }
      if (dialog === 'Choose one of the following:') {
        this.showAnswerButtons(this.op1, this.op2, this.op3)
      } else {
        this.hideAnswerButtons()
      }
    } else {
      this.endDialog()
    }
  }

  showAnswerButtons(op1, op2, op3) {
    const ans1 = this.createAnswerButton(
      op1,
      this.camera.midPoint.x - 190,
      this.camera.midPoint.y + 250,
      () => this.answerQuestion(op1)
    )
    const ans2 = this.createAnswerButton(
      op2,
      this.camera.midPoint.x,
      this.camera.midPoint.y + 250,
      () => this.answerQuestion(op2)
    )
    const ans3 = this.createAnswerButton(
      op3,
      this.camera.midPoint.x + 180,
      this.camera.midPoint.y + 250,
      () => this.answerQuestion(op3)
    )
  }

  hideAnswerButtons() {
    if (this.answerButtons && this.answerButtons.length > 0) {
      this.answerButtons.forEach((button) => button.destroy())
      this.answerButtons = []
    }
  }

  createAnswerButton(text, x, y, callback) {
    const button = this.add
      .text(x, y, text, {
        fontSize: '20px',
        fill: '#000',
        backgroundColor: '#fff',
        padding: { left: 10, right: 10, top: 5, bottom: 5 },
      })
      .setInteractive()
      .on('pointerdown', callback)
      .setOrigin(0.5, 0.5)

    this.answerButtons.push(button)
  }

  answerQuestion(answer) {
    this.endDialog()
  }

  endDialog() {
    // Set dialog state to inactive
    this.isDialogActive = false

    // Reset player movement and animations
    this.player.setVelocity(0)
    this.player.anims.stop()

    // Re-enable input keys
    this.cursors.up.enabled = true
    this.cursors.down.enabled = true
    this.cursors.left.enabled = true
    this.cursors.right.enabled = true

    // Hide UI elements related to dialog
    this.textBox.setVisible(false)

    // Hide answer buttons if any
    this.hideAnswerButtons()

    // Reset active NPC
    this.activeNpc = null
  }
}

function handleZPress() {
  console.log('Z Pressed')
  if (game.activeNpc) {
    if (game.isDialogActive) {
      game.progressDialog()
    } else {
      game.startDialog()
      currentNpc = new CurrentNpc(game.activeNpc.name, {
        x: game.activeNpc.x,
        y: game.activeNpc.y,
      })
      currentNpc.getRelativeLocation({ x: game.player.x, y: game.player.y })
    }
  }
}

function runBot(keycodes) {
  setInterval(function () {
    simKeypress(game)
  }, 1000)
}

function simKeypress(data, tile, player, world, tweens) {
  // Map the action to a Phaser key code

  let keyCodes = {
    'Action.UP': Phaser.Input.Keyboard.KeyCodes.UP,
    'Action.DOWN': Phaser.Input.Keyboard.KeyCodes.DOWN,
    'Action.LEFT': Phaser.Input.Keyboard.KeyCodes.LEFT,
    'Action.RIGHT': Phaser.Input.Keyboard.KeyCodes.RIGHT,
    z: Phaser.Input.Keyboard.KeyCodes.Z,
  }
  let key = game.input.keyboard.addKey(keyCodes[`${data}`])

  key.isDown = true

  setTimeout(() => {
    key.isDown = false
  }, 250)
}

function findClosestPointInGroup(group, referencePoint) {
  // Check if group exists
  if (!group) {
    console.warn('Group is undefined')
    return null
  }

  // Use getChildren to get active children
  const activeChildren = group.getChildren(true)

  // Check if any active children found
  if (!activeChildren.length) {
    console.warn('Group has no active children with physics bodies')
    return null
  }

  // Initialize variables
  let closestPoint = null
  let closestDistance = Infinity

  // Loop through active children in the Set
  for (const child of activeChildren) {
    const distance = calculateDistance(referencePoint, child)
    if (distance < closestDistance) {
      closestPoint = child
      closestDistance = distance
    }
  }

  // Return the closest object with physics body
  return closestPoint
}

// Function to calculate distance between two points (same as before)
function calculateDistance(point1, point2) {
  const dx = point2.x - point1.x
  const dy = point2.y - point1.y
  return Math.sqrt(dx * dx + dy * dy) // Use Pythagorean theorem
}

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}
