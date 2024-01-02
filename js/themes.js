const pacmanThemeMusic = new Audio('../assets/audio/pacman.mp3')
const marioThemeMusic = new Audio('../assets/audio/mario.mp3')
const totThemeMusic = new Audio('../assets/audio/totmode.mp3')
const zeldaThemeMusic = new Audio('../assets/audio/zelda.mp3')
const pacmanLevelUp = new Audio('../assets/audio/pacman1.mp3')
const pacmanClearBlocks = new Audio('../assets/audio/pacman2.mp3')
const pacmanGameOver = new Audio('../assets/audio/pacman3.mp3')
const marioLevelUp = new Audio('../assets/audio/mario1.mp3')
const marioClearBlocks = new Audio('../assets/audio/mario2.mp3')
const marioGameOver = new Audio('../assets/audio/mario3.mp3')
const zeldaLevelUp = new Audio('../assets/audio/zelda1.wav')
const zeldaClearBlocks = new Audio('../assets/audio/zelda2.wav')
const zeldaGameOver = new Audio('../assets/audio/zelda3.wav')

const marioTheme = {
  baddieTypes: ['baddie1', 'baddie2', 'baddie3'],
  baddieUrls: ["url('./assets/images/purpshell.gif')", "url('./assets/images/bobomb.gif')", "url('./assets/images/goomba.gif')"],
  pieceColors: ['purple', 'gray', '#bf8b3d'],
  levelUpSound: function(volume) {
    marioLevelUp.volume = volume
    marioLevelUp.play()
  },
  clearBlocksSound: function(volume) {
    marioClearBlocks.volume = volume
    marioClearBlocks.play()
  },
  gameOverSound: function(volume) {
    marioGameOver.volume = volume
    marioGameOver.play()
  },

}

const pacmanTheme = {
  baddieTypes: ['baddie1', 'baddie2', 'baddie3'],
  baddieUrls: ["url('./assets/images/clyde.gif')", "url('./assets/images/pinky.gif')", "url('./assets/images/inky.gif')"],
  pieceColors: ['#db7800', '#e18695', 'cornflowerblue'],
  levelUpSound: function(volume) {
    pacmanLevelUp.volume = volume
    pacmanLevelUp.play()
  },
  clearBlocksSound: function(volume) {
    pacmanClearBlocks.volume = volume
    pacmanClearBlocks.play()
  },
  gameOverSound: function(volume) {
    pacmanGameOver.volume = volume
    pacmanGameOver.play()
  },
}

const zeldaTheme = {
  baddieTypes: ['baddie1', 'baddie2', 'baddie3'],
  baddieUrls: ["url('./assets/images/octorock.gif')", "url('./assets/images/moblin.gif')", "url('./assets/images/wizzrobe.gif')"],
  pieceColors: ['#3c4bd2', '#16504a', '#906526'],
  levelUpSound: function(volume) {
    zeldaLevelUp.volume = volume
    zeldaLevelUp.play()
  },
  clearBlocksSound: function(volume) {
    zeldaClearBlocks.volume = volume
    zeldaClearBlocks.play()
  },
  gameOverSound: function(volume) {
    zeldaGameOver.volume = volume
    zeldaGameOver.play()
  },

}

const totTheme = {
  baddieTypes: ['baddie1', 'baddie2', 'baddie3'],
  baddieUrls: ["url('./assets/images/dancingrbtot.gif')", "url('./assets/images/dancingpgtot.gif')", "url('./assets/images/dancingoytot.gif')"],
  pieceColors: ['#fb0094', '#0000ff', '#00ff00','#ffff00', '#ff0000', '#fb0094','#0000ff', '#00ff00','#ffff00', '#ff0000'],
  pieceUrls: ["url('./assets/images/rbbg.gif')", "url('./assets/images/pgbg.gif')", "url('./assets/images/oybg.gif')"]
}

export {
  marioTheme,
  pacmanTheme,
  pacmanThemeMusic,
  marioThemeMusic,
  totTheme,
  totThemeMusic,
  zeldaTheme,
  zeldaThemeMusic
}