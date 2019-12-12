var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 500 },
            debug: false
        }
    },
    scene: {
        key: 'main',
        preload: preload,
        create: create,
        update: update
    }
};



var game = new Phaser.Game(config);

var map;
var player;
var cursors;
var groundLayer, coinLayer;
var text;
var score = 0;

function preload ()
{
    //makes the map
    this.load.tilemapTiledJSON('map', 'assets/map.json');
    //tiles in spritesheet
    this.load.spritesheet('tiles', 'assets/tiles.png', {frameWidth: 70, frameHeight: 70});
    //the necessary coin image
    this.load.image('coin', 'assets/coinGold.png');
    // player animations
    this.load.atlas('player', 'assets/player.png', 'assets/player.json');
}

function create ()
{
    // load the map
    var map = this.make.tilemap({key: 'map'});
    // tiles for the ground layer
    var groundTiles = map.addTilesetImage('tiles');
    // create the ground layer
    groundLayer = map.createDynamicLayer('World', groundTiles, 0, 0);
    // the player will collide with this layer
    groundLayer.setCollisionByExclusion([-1]);
    //Makes the coin image a tileset
    var coinTiles = map.addTilesetImage('coin');
    //adds the coins as tiles
    coinLayer = map.createDynamicLayer('Coins', coinTiles, 0, 0);





    // set the boundaries of our game world
    this.physics.world.bounds.width = groundLayer.width;
    this.physics.world.bounds.height = groundLayer.height;

    //creates the player sprite
    player = this.physics.add.sprite(200, 200, 'player');
    player.setBounce(0.2); //makes our guy bounce
    player.setCollideWorldBounds(true); //won't got outside of the map

    this.physics.add.collider(groundLayer, player);//player won't fall through map
    //The coin will be collected at a specified index (17) when the player overlaps with the coin layer
    coinLayer.setTileIndexCallback(17, collectCoin, this);
    this.physics.add.overlap(player, coinLayer);

    //animates our guy walking
    this.anims.create({
        key: 'walk',
        frames: this.anims.generateFrameNames('player', {prefix: 'p1_walk', start: 1, end: 11, zeroPad: 2}),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'idle',
        frames: [{key: 'player', frame: 'p1_stand'}],
        frameRate: 10,
    });

    cursors = this.input.keyboard.createCursorKeys();

    //set bounds on camera to stay inside game world
    this.cameras.main.setBounds(0, 0, map.widthInPixels, map.heightInPixels);
    //makes camera follow player
    this.cameras.main.startFollow(player);

    //creates a text game object that can have code applied to it (for keeping track of the score)
    text = this.add.text(20, 570, '0', {
        fontSize: '20px',
        fill: '#ffffff'
    });
    text.setScrollFactor(0);

}

function collectCoin(sprite, tile){
    //removes the tile
    coinLayer.removeTileAt(tile.x, tile.y);
    score++;
    text.setText(score);
    return false;
}


//Player controls
function update(time, delta)
{
    if (cursors.left.isDown)
    {
        player.body.setVelocityX(-200);
        player.anims.play('walk', true); // walk left
        player.flipX = true; // flip the sprite to the left
    }
    else if (cursors.right.isDown)
    {
        player.body.setVelocityX(200);
        player.anims.play('walk', true);
        player.flipX = false; // use the original sprite looking to the right
    } else {
        player.body.setVelocityX(0);
        player.anims.play('idle', true);
    }
    // jump
    if (cursors.up.isDown && player.body.onFloor())
    {
        player.body.setVelocityY(-500);
    }
}

