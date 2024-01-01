const pacmanThemeMusic = new Audio('../assets/audio/pacman.mp3')
const marioThemeMusic = new Audio('../assets/audio/mario.mp3')
const totThemeMusic = new Audio('../assets/audio/totmode.mp3')

const marioTheme = {
  baddieTypes: ['baddie1', 'baddie2', 'baddie3'],
  baddieUrls: ["url('./assets/images/purpshell.gif')", "url('./assets/images/bobomb.gif')", "url('./assets/images/goomba.gif')"],
  pieceColors: ['purple', 'gray', '#bf8b3d'],
}

const pacmanTheme = {
  baddieTypes: ['baddie1', 'baddie2', 'baddie3'],
  baddieUrls: ["url('./assets/images/clyde.gif')", "url('./assets/images/pinky.gif')", "url('./assets/images/inky.gif')"],
  pieceColors: ['#db7800', '#e18695', 'cornflowerblue'],
}

const totTheme = {
  baddieTypes: ['baddie1', 'baddie2', 'baddie3'],
  baddieUrls: ["url('./assets/images/dancingrbtot.gif')", "url('./assets/images/dancingpgtot.gif')", "url('./assets/images/dancingoytot.gif')"],
  pieceColors: ['#db7800', '#e18695', 'cornflowerblue'],
  pieceUrls: ["url('./assets/images/rbbg.gif')", "url('./assets/images/pgbg.gif')", "url('./assets/images/oybg.gif')"]
}

export {
  marioTheme,
  pacmanTheme,
  pacmanThemeMusic,
  marioThemeMusic,
  totTheme,
  totThemeMusic
}