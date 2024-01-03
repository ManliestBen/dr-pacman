/*-------------------------------- Constants --------------------------------*/

import { marioTheme, marioThemeMusic, pacmanTheme, pacmanThemeMusic, totTheme, totThemeMusic, zeldaTheme, zeldaThemeMusic, playPauseSound } from "./themes.js"

const edgeIdxValues = {
  top: [0, 16, 32, 48, 64, 80, 96, 112],
  right: [112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127],
  bottom: [15, 31, 47, 63, 79, 95, 111, 127],
  left: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]
}

class Cell {
  constructor(cellIdx){
    this.cellIdx = cellIdx
  }
  fill = null
  locked = false
  linkedTo = null
  lookUp() {
    if (edgeIdxValues.top.includes(this.cellIdx)) return null
    return boardCells[this.cellIdx - 1]
  }
  lookDown() {
    if (edgeIdxValues.bottom.includes(this.cellIdx)) return null
    return boardCells[this.cellIdx + 1]
  }
  lookLeft() {
    if (edgeIdxValues.left.includes(this.cellIdx)) return null
    return boardCells[this.cellIdx - 16]
  }
  lookRight() {
    if (edgeIdxValues.right.includes(this.cellIdx)) return null
    return boardCells[this.cellIdx + 16]
  }
  calcNumMatchesRow() {
    if (this.fill !== null && this.calcIdxOfFillType() === this.lookRight()?.calcIdxOfFillType()){
      return 1 + this.lookRight().calcNumMatchesRow()
    } else {
      return 1
    }
  }
  calcNumMatchesColumn(){
    if (this.fill !== null && this.calcIdxOfFillType() === this.lookUp()?.calcIdxOfFillType()){
      return 1 + this.lookUp().calcNumMatchesColumn()
    } else {
      return 1
    }
  }
  calcIdxOfFillType() {
    return currentTheme.baddieTypes.indexOf(this.fill) !== -1 ? currentTheme.baddieTypes.indexOf(this.fill) : this.fill
  }
}



/*---------------------------- Variables (state) ----------------------------*/
let currentPiece, nextPiece, boardCellElements, gameTickInterval, totMode = false
let score, cascadeActive, highScores, gameIsPaused, level
let currentVolume = 50, previousVolume = 50, audioIsMuted = false, currentAudio, audioIsPlaying = false
let boardCells = []
let currentTheme = {}
let keysPressed = ''

/*------------------------ Cached Element References ------------------------*/
const bodyElement = document.querySelector('body')
const boardElement = document.querySelector('#board')
const menuElement = document.querySelector('#menu')
const menuBtn = document.querySelector('#menu-button')
const resumeBtn = document.querySelector('#resume-button')
const gameplayBtns = document.querySelector('.gameplay-buttons')
const scoreDisplayElement = document.querySelector('#score-display')
const levelDisplayElement = document.querySelector('#level-display')
const levelInfoElement = document.querySelector('.level-info')
const volumeSlider = document.querySelector('#volume-control')
const volumeLabel = document.querySelector('#volume-label')
const muteBtn = document.querySelector('#mute-button')
const resetBtn = document.querySelector('#reset-button')
const openHighScoresBtn = document.querySelector('#high-scores-button')
const closeHighScoresBtn = document.querySelector('#close-high-scores-button')
const highScoresElement = document.querySelector('#high-scores-list')
const scoresContainerElement = document.querySelector('#scores-container')
const messageDisplayElement = document.querySelector('#message-display')
const messageElement = document.querySelector('#message')
const nameInput = document.querySelector('#player-name')
const messageBtn1 = document.querySelector('#message-button-1')
const messageBtn2 = document.querySelector('#message-button-2')
const pacmanThemeBtn = document.querySelector('#pacman-theme-button')
const zeldaThemeBtn = document.querySelector('#zelda-theme-button')
const marioThemeBtn = document.querySelector('#mario-theme-button')
const pacmanMusicBtn = document.querySelector('#pacman-music-button')
const zeldaMusicBtn = document.querySelector('#zelda-music-button')
const marioMusicBtn = document.querySelector('#mario-music-button')
const totLoadingElement = document.querySelector('#tot-loading-display')
const loadingBar = document.querySelector('#loading-bar')
const loadingPercentage = document.querySelector('#loading-percentage')
const leftSharkElement = document.querySelector('#left-shark')
const rightSharkElement = document.querySelector('#right-shark')
const saxistElement = document.querySelector('#saxist')
const carltonElement = document.querySelector('#carlton')
const squeeElement = document.querySelector('#squee')
const meowGuitarElement = document.querySelector('#meow-guitar')
const obnoxiousContainers = document.querySelectorAll('.obnoxious-images-container')

/*----------------------------- Event Listeners -----------------------------*/
document.addEventListener('keydown', (evt) => {
  keysPressed += evt.key
  if (!'totmode'.includes(keysPressed)) {
    keysPressed = ''
  }
  if (keysPressed === 'totmode') {
    changeTheme('totmode')
    keysPressed = ''
  }
  if (!cascadeActive && gameTickInterval && !gameIsPaused) {
    if (evt.key === 's') {
      movePieceDown()
    }
    if (evt.key === 'a') {
      movePieceLeft()
    }
    if (evt.key === 'd') {
      movePieceRight()
    }
    if (evt.key === ' ' || evt.key === 'w') {
      rotatePiece()
    }
  }
})

gameplayBtns.addEventListener('click', handleGameplayClick)

menuBtn.addEventListener('click', handleClickMenuOrResume)
resumeBtn.addEventListener('click', handleClickMenuOrResume)
volumeSlider.addEventListener('change', adjustVolume)
muteBtn.addEventListener('click', toggleAudio)
resetBtn.addEventListener('click', init)
openHighScoresBtn.addEventListener('click', handleOpenCloseHighScores)
closeHighScoresBtn.addEventListener('click', handleOpenCloseHighScores)
messageBtn1.addEventListener('click', handleClickMessageButton1)
messageBtn2.addEventListener('click', handleClickMessageButton2)
pacmanThemeBtn.addEventListener('click', () => changeTheme('pacman'))
pacmanMusicBtn.addEventListener('click', () => changeMusic('pacman'))
marioThemeBtn.addEventListener('click', () => changeTheme('mario'))
marioMusicBtn.addEventListener('click', () => changeMusic('mario'))
zeldaThemeBtn.addEventListener('click', () => changeTheme('zelda'))
zeldaMusicBtn.addEventListener('click', () => changeMusic('zelda'))

/*-------------------------------- Functions --------------------------------*/

currentTheme = pacmanTheme
currentAudio = pacmanThemeMusic
currentAudio.loop = true
currentAudio.volume = currentVolume / 100
init()


async function init() {
  if (!totMode) deactivateObnoxious()
  totLoadingElement.style.display = 'none'
  if (!menuElement.style.display) toggleMenu()
  if (!messageElement.style.display) messageElement.style.display = 'none'
  gameIsPaused = true
  level = 1
  highScoresElement.style.display = 'none'
  if (!boardElement.style.display) toggleBoard()
  volumeLabel.textContent = `Volume: ${currentVolume}%`
  score = 0
  setMessageDisplay('next level')
  highScores = await fetchHighScores()
}


function changeTheme(newTheme) {
  totMode = false
  deactivateObnoxious()
  boardElement.className = 'rainbow-border'
  pacmanThemeBtn.className = ''
  marioThemeBtn.className = ''
  zeldaThemeBtn.className = ''
  // theme3 button class name setting
  if (newTheme === 'pacman') {
    pacmanThemeBtn.className = 'rainbow-border'
    currentTheme = pacmanTheme
  } else if (newTheme === 'mario') {
    marioThemeBtn.className = 'rainbow-border'
    currentTheme = marioTheme
  } else if (newTheme === 'zelda') {
    zeldaThemeBtn.className = 'rainbow-border'
    currentTheme = zeldaTheme
  } else if (newTheme === 'totmode') {
    gameIsPaused = true
    clearInterval(gameTickInterval)
    totMode = true
    boardElement.className = 'rainbow-border-totmode'
    currentTheme = totTheme
    changeMusic('totmode')
    startTotLoadingScreen()
  }
  renderBoard()
}


function activateObnoxious() {
  obnoxiousContainers.forEach(el => el.style.display = '')
  setTimeout(() => {
    squeeElement.style.display = ''
    squeeElement.setAttribute('src', './assets/images/squee.gif')
  }, 500)
  setTimeout(() => {
    carltonElement.style.display = ''
    carltonElement.setAttribute('src', './assets/images/carlton.gif')
  }, 1000)
  setTimeout(() => {
    rightSharkElement.style.display = ''
    rightSharkElement.setAttribute('src', './assets/images/rightshark.gif')
  }, 1500)
  setTimeout(() => {
    leftSharkElement.style.display = ''
    leftSharkElement.setAttribute('src', './assets/images/leftshark.gif')
  }, 2000)
  setTimeout(() => {
    meowGuitarElement.style.display = ''
    meowGuitarElement.setAttribute('src', './assets/images/meowguitar.gif')
  }, 2500)
  setTimeout(() => {
    saxistElement.style.display = ''
    saxistElement.setAttribute('src', './assets/images/saxist.gif')
  }, 3000)
  setTimeout(() => {
    bodyElement.style.backgroundImage = 'url(./assets/images/sparkletot.gif)'
  }, 3500)
  setTimeout(() => {
    confetti.start(2500, currentTheme.pieceColors)
  }, 4000)
}

function deactivateObnoxious() {
  bodyElement.style.backgroundImage = ''
  obnoxiousContainers.forEach(el => el.style.display = 'none')
  leftSharkElement.style.display = 'none'
  leftSharkElement.setAttribute('src', '')
  rightSharkElement.style.display = 'none'
  rightSharkElement.setAttribute('src', '')
  carltonElement.style.display = 'none'
  carltonElement.setAttribute('src', '')
  saxistElement.style.display = 'none'
  saxistElement.setAttribute('src', '')
  squeeElement.style.display = 'none'
  squeeElement.setAttribute('src', '')
  meowGuitarElement.style.display = 'none'
  meowGuitarElement.setAttribute('src', '')
}

function startTotLoadingScreen() {
  setTimeout(activateObnoxious, 2500)
  totLoadingElement.style.display = ''
  menuElement.style.display = 'none'
  menuBtn.style.display = 'none'
  boardElement.style.display = 'none'
  gameplayBtns.style.display = 'none'
  levelInfoElement.style.display = 'none'
  highScoresElement.style.display = 'none'
  messageDisplayElement.style.display = 'none'
  totProgressBarAnimation()
}

function totProgressBarAnimation() {
  let width = 1
  let barInterval = setInterval(increaseWidth, 125)
  function increaseWidth() {
    if (width < 80) {
      width ++
      loadingBar.style.width = `${width}%`
      loadingPercentage.textContent = `${Math.floor(width / 80 * 100)}%`
    } else {
      clearInterval(barInterval)
      totLoadingElement.style.display = 'none'
      score = 0
      setTimeout(() => startNewLevel(1), 500)
    }
  }
}

function changeMusic(newMusic) {
  marioMusicBtn.className = ''
  pacmanMusicBtn.className = ''
  zeldaMusicBtn.className = ''
  currentAudio.pause()
  if (newMusic === 'mario') {
    currentAudio = marioThemeMusic
    marioMusicBtn.className = 'rainbow-border'
  } else if (newMusic === 'pacman') {
    currentAudio = pacmanThemeMusic
    pacmanMusicBtn.className = 'rainbow-border'
  } else if (newMusic === 'zelda') {
    currentAudio = zeldaThemeMusic
    zeldaMusicBtn.className = 'rainbow-border'
  } else if (newMusic === 'totmode') {
    currentAudio = totThemeMusic
    currentAudio.currentTime = 27
  }
  currentAudio.loop = true
  currentAudio.volume = currentVolume / 100
  currentAudio.play()
}

function adjustVolume(evt) {
  volumeLabel.textContent = `Volume: ${evt.target.value}%`
  currentVolume = parseInt(evt.target.value)
  currentAudio.volume = currentVolume / 100
}

function toggleAudio() {
  if (!audioIsMuted) {
    previousVolume = currentVolume
    currentVolume = 0
    audioIsMuted = true
    muteBtn.textContent = 'Unmute Audio'
  } else {
    audioIsMuted = false
    currentVolume = previousVolume
    muteBtn.textContent = 'Mute Audio'
  }
  volumeLabel.textContent = `Volume: ${currentVolume}%`
  volumeSlider.value = currentVolume
  currentAudio.volume = currentVolume / 100
}

function handleClickMessageButton1() {
  if (messageBtn1.textContent === 'Submit Score') {
    if (nameInput.value.length >= 1) {
      submitScore(nameInput.value, score)
    } else {
      nameInput.focus()
    }
  } else {
    if (!audioIsPlaying) currentAudio.play()
    setMessageDisplay('hide')
    if(boardElement.style.display) toggleBoard()
    startNewLevel(level)
  }
}

function handleClickMessageButton2() {
  if(messageBtn2.textContent === 'Play Again') {
    messageElement.textContent = ''
    init()
  }
}

function setMessageDisplay(action) {
  nameInput.style.display = 'none'
  if (action === 'hide') messageDisplayElement.style.display = 'none'
  if (action === 'next level') {
    messageDisplayElement.style.display = ''
    messageBtn1.textContent = `Start Level ${level}`
    messageBtn2.style.display = 'none'
  }
  if (action === 'game over') {
    toggleBoard()
    messageBtn2.style.display = ''
    nameInput.style.display = ''
    messageElement.textContent = 'Game over!'
    messageBtn1.textContent = `Submit Score`
    messageBtn2.textContent = 'Play Again'
    gameplayBtns.style.display = 'none'
    messageDisplayElement.style.display = ''
  }
}

function handleOpenCloseHighScores() {
  toggleMenu()
  toggleHighScoreList()
}

function toggleHighScoreList(optionalScoreData) {
  highScoresElement.style.display = !highScoresElement.style.display ? 'none' : ''
  renderHighScoresList(optionalScoreData)
}

function handleClickMenuOrResume() {
  if (!gameIsPaused && boardElement.style.display === '') playPauseSound(currentVolume / 100)
  toggleBoard()
  toggleMenu()
}

function toggleMenu() {
  menuElement.style.display = !menuElement.style.display ? 'none' : ''
}

function toggleBoard() {
  gameIsPaused = !gameIsPaused ? true : false
  menuBtn.style.display = !menuBtn.style.display ? 'none' : ''
  boardElement.style.display = !boardElement.style.display ? 'none' : ''
  gameplayBtns.style.display = !gameplayBtns.style.display ? 'none' : ''
  levelInfoElement.style.display = !levelInfoElement.style.display ? 'none' : ''
}


function startNewLevel(levelNum) {
  if (currentAudio.paused) currentAudio.play()
  gameplayBtns.style.display = ''
  boardElement.style.display = ''
  levelInfoElement.style.display = ''
  menuBtn.style.display = ''
  gameIsPaused = false
  level = levelNum
  cascadeActive = false
  boardCells = []
  generateBoardCells()
  generateBoardCellElements()
  boardCellElements = document.querySelectorAll('.cell')
  addBaddies()
  nextPiece = generatePiece()
  startNextPiece()
  renderBoard()
}

function countRemainingBaddies() {
  let baddiesLeft = 0
  boardCells.forEach(cell => {
    if (currentTheme.baddieTypes.includes(cell.fill)) {
      baddiesLeft += 1
    }
  })
  return baddiesLeft
}

function handleGameplayClick(evt) {
  if (gameTickInterval && !gameIsPaused) {
    if (evt.target.id === 'left-button') {
      movePieceLeft()
    }
    if (evt.target.id === 'right-button') {
      movePieceRight()
    }
    if (evt.target.id === 'down-button') {
      movePieceDown()
    }
    if (evt.target.id === 'rotate-button') {
      rotatePiece()
    }
  }
}

async function fetchHighScores() {
  return fetch('https://high-score-api.fly.dev/api/scores/?game=tot-drop')
  .then(res => res.json())
}

async function renderHighScoresList(optionalScoreData) {
  scoresContainerElement.innerHTML = ''
  const loadingMessageElement = document.createElement('div')
  loadingMessageElement.className = 'loading-message'
  loadingMessageElement.textContent = 'Loading... Please wait!!!'
  scoresContainerElement.appendChild(loadingMessageElement)
  const data = await fetchHighScores()
  highScores = data
  scoresContainerElement.innerHTML = ''
  const scoreHeaderElement = document.createElement('div')
  scoreHeaderElement.className = 'score-row header'
  const nameHeader = document.createElement('p')
  const scoreHeader = document.createElement('p')
  const dateHeader = document.createElement('p')
  nameHeader.textContent = 'Initials'
  scoreHeader.textContent = 'Score'
  dateHeader.textContent = 'Earned On'
  scoreHeaderElement.appendChild(nameHeader)
  scoreHeaderElement.appendChild(scoreHeader)
  scoreHeaderElement.appendChild(dateHeader)
  scoresContainerElement.appendChild(scoreHeaderElement)
  let scoreInTop10 = false
  for (let i = 0; i <= 9; i++) {
    if (!highScores[i]) break
    if (optionalScoreData && 
      optionalScoreData.player === highScores[i].player && 
      optionalScoreData.score === highScores[i].score
    ) {
      scoreInTop10 = true
    }
    const newScoreElement = document.createElement('div')
    newScoreElement.className = 'score-row'
    const playerNameElement = document.createElement('p')
    const playerScoreElement = document.createElement('p')
    const dateEarnedElement = document.createElement('p')
    playerNameElement.textContent = `${i + 1}) ${highScores[i].player}`
    playerScoreElement.textContent = highScores[i].score
    let date = new Date(highScores[i].createdAt)
    dateEarnedElement.textContent = date.toLocaleDateString()
    newScoreElement.appendChild(playerNameElement)
    newScoreElement.appendChild(playerScoreElement)
    newScoreElement.appendChild(dateEarnedElement)
    scoresContainerElement.appendChild(newScoreElement)
  }
  if (!scoreInTop10 && optionalScoreData) {
    const newScoreElement = document.createElement('div')
    newScoreElement.className = 'score-row'
    const playerNameElement = document.createElement('p')
    const playerScoreElement = document.createElement('p')
    const dateEarnedElement = document.createElement('p')
    let i = highScores.findIndex(scoreObj => {
      return scoreObj.score === optionalScoreData.score && scoreObj.player === optionalScoreData.player
    })
    playerNameElement.textContent = `${i + 1}) ${highScores[i].player}`
    playerScoreElement.textContent = highScores[i].score
    let date = new Date(highScores[i].createdAt)
    dateEarnedElement.textContent = date.toLocaleDateString()
    newScoreElement.appendChild(playerNameElement)
    newScoreElement.appendChild(playerScoreElement)
    newScoreElement.appendChild(dateEarnedElement)
    scoresContainerElement.appendChild(newScoreElement)
  }
}

function submitScore(playerName, newScore) {
  fetch('https://high-score-api.fly.dev/api/scores/', {
    method: 'POST',
    body: JSON.stringify({
      game: 'tot-drop',
      player: playerName,
      score: newScore
    }),
    headers: {'Content-Type': 'application/json'}
  })
  .then(res => res.json())
  .then(data => {
    highScores = data
    setMessageDisplay('hide')
    toggleHighScoreList({player: playerName, score: newScore})
  })
}

function getRowMatchData() {
  let cellMatchData = []
  boardCells.forEach(cell => {
    if (cell.calcNumMatchesRow() >= 4) {
      cellMatchData.push({idx: cell.cellIdx, n: cell.calcNumMatchesRow()})
    }
  })
  return cellMatchData
}

function getColumnMatchData() {
  let cellMatchData = []
  boardCells.forEach(cell => {
    if (cell.calcNumMatchesColumn() >= 4) {
      cellMatchData.push({idx: cell.cellIdx, n: cell.calcNumMatchesColumn()})
    }
  })
  return cellMatchData
}

function gameTick() {
  if (!cascadeActive && !gameIsPaused) {
    if (checkForCollision()) {
      handleCollision()
    } else {
      shiftPiece(1, 1)
      renderBoard()
    }
  }
}

function handleCollision() {
  if ((boardCells[49].fill || boardCells[65].fill) && (!getColumnMatchData().length && !getRowMatchData().length)) {
    clearInterval(gameTickInterval)
    gameTickInterval = null
    currentAudio.pause()
    currentAudio.currentTime = 0
    setTimeout(() => {currentTheme.gameOverSound(currentVolume / 100)}, 200)
    setMessageDisplay('game over')
  } else {
    lockInPlace()
    clearCellsAndCalculatePoints()
    clearInterval(gameTickInterval)
    if (!cascadeActive) {
      startNextPiece()
    }
  }
}

function clearCellsAndCalculatePoints() {
  let rowMatchData = getRowMatchData()
  let columnMatchData = getColumnMatchData()
  if (rowMatchData.length || columnMatchData.length) {
    let cellsToClear = []
    for (let i = 7; i >= 4; i--) {
      rowMatchData.forEach(dataSet => {
        if (dataSet.n === i) {
          let cellToAdd = dataSet.idx
          for (let j = 0; j < i; j++) {
            if (!cellsToClear.includes(cellToAdd)){
              cellsToClear.push(cellToAdd)
            }
            cellToAdd += 16
          }
        }
      })
      columnMatchData.forEach(dataSet => {
        if (dataSet.n === i) {
          let cellToAdd = dataSet.idx
          for (let j = 0; j < i; j++) {
            if (!cellsToClear.includes(cellToAdd)){
              cellsToClear.push(cellToAdd)
            }
            cellToAdd -= 1
          }
        }
      })
    }
    score += calculatePoints(cellsToClear.length)
    currentTheme.clearBlocksSound(currentVolume / 100)
    clearCells(cellsToClear)
    renderBoard()
    cascadeActive = true
    setTimeout(() => {
      cascade()
    }, 200)
  }
}

function cascade() {
  let cascadePossible = false
  let singleCellsToCascade = []
  let linkedCellsToCascade = []
  boardCells.forEach(cell => {
    // If single cell can cascade
    if (!cell.locked && cell.fill !== null && cell.lookDown() && cell.lookDown().fill === null) {
      cascadePossible = true
      let cellData = {}
      cellData.cellIdx = cell.cellIdx
      cellData.linkedTo = null
      singleCellsToCascade.push(cellData)
    }
    // If linked horizontal pair can cascade
      // Conditions:
      // - cell.linkedTo 
      // - cell.lookDown()
      // - !cell.lookDown().fill
      // - boardCells[cell.linkedTo].lookDown() (is this necessary?)
      // - !boardCells[cell.linkedTo].lookDown().fill
      // - !linkedCellsToCascade.includes(cell.cellIdx)
    if (cell.linkedTo && cell.lookDown() && cell.lookDown().fill === null && boardCells[cell.linkedTo].lookDown().fill === null ) {
      cascadePossible = true
      let cellData = {}
      cellData.cellIdx = cell.cellIdx
      cellData.linkedTo= cell.linkedTo
      linkedCellsToCascade.push(cellData)
    }
    // If linked vertical pair can cascade
    if (cell.linkedTo && (cell.linkedTo === cell.cellIdx + 1 || cell.linkedTo === cell.cellIdx - 1) && cell.lookDown() && cell.lookDown().fill === null ) {
      cascadePossible = true
      let cellData = {}
      cellData.cellIdx = cell.cellIdx
      cellData.linkedTo= cell.linkedTo
      linkedCellsToCascade.push(cellData)
    }
  })
  let mixedCellsToCascade = [...singleCellsToCascade, ...linkedCellsToCascade].sort((a, b) => {
    return b.cellIdx - a.cellIdx
  })
  mixedCellsToCascade.forEach(cellObj => {
    slideSingleCellDown(cellObj.cellIdx, cellObj.linkedTo)
  })
  renderBoard()
  if (!cascadePossible) {
    if (getColumnMatchData().length || getRowMatchData().length) {
      setTimeout(()  => {
        clearCellsAndCalculatePoints()
      }, 100)
    } else {
      if (!countRemainingBaddies()) {
        // move to next level
        clearInterval(gameTickInterval)
        level += 1
        gameplayBtns.style.display = 'none'
        currentAudio.pause()
        setTimeout(() => {currentTheme.levelUpSound(currentVolume / 100)}, 100)
        confetti.start(1500, currentTheme.pieceColors)
        setMessageDisplay('next level')
      } else {
        setTimeout(() => {
          cascadeActive = false
          startNextPiece()
        }, 1000)
      }
    }
  } else {
    setTimeout(()=> {
      cascade()
    }, 150)
  }
}

function slideSingleCellDown(cellIdx, linkedTo) {
  let tempLocked = boardCells[cellIdx].locked
  boardCells[cellIdx + 1].locked = tempLocked
  boardCells[cellIdx].locked = false
  boardCells[cellIdx + 1].linkedTo = linkedTo ? linkedTo + 1 : null
  boardCells[cellIdx].linkedTo = null
  let tempCellFill = boardCells[cellIdx].fill
  boardCells[cellIdx + 1].fill = tempCellFill
  boardCells[cellIdx].fill = null
  let tempCellClassName = boardCellElements[cellIdx].className
  boardCellElements[cellIdx + 1].className = tempCellClassName
  boardCellElements[cellIdx].className = 'cell'
}

function clearCells(cellsToClear) {
  cellsToClear.forEach(cell => {
    boardCells[cell].fill = null
    boardCells[cell].locked = false
    boardCellElements[cell].className = 'cell'
    if (boardCells[cell].linkedTo) {
      boardCells[boardCells[cell].linkedTo].locked = false
      boardCellElements[boardCells[cell].linkedTo].className = 'cell fragment'
      boardCells[boardCells[cell].linkedTo].linkedTo = null
      boardCells[cell].linkedTo = null
    }
  })
}

function calculatePoints(numCellsCleared) {
  return (2 ^ numCellsCleared) * level
}

function lockInPlace() {
  boardCells[currentPiece.color1CellIdx].locked = true
  boardCells[currentPiece.color2CellIdx].locked = true
  boardCells[currentPiece.color2CellIdx].linkedTo = currentPiece.color1CellIdx
  boardCells[currentPiece.color1CellIdx].linkedTo = currentPiece.color2CellIdx
}

function generatePiece() {
  let randIdx1 = totMode ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * currentTheme.pieceColors.length)
  let randIdx2 = totMode ? Math.floor(Math.random() * 3) : Math.floor(Math.random() * currentTheme.pieceColors.length)
  return {color1: randIdx1, color2: randIdx2, color1CellIdx: 49, color2CellIdx: 65}
}

function startNextPiece() {
  currentPiece = nextPiece
  nextPiece = generatePiece()
  currentPiece.orientation = 'horizontal1'
  applyFill()
  applyBorderRadius('left', 'right')
  renderBoard()
  clearInterval(gameTickInterval)
  gameTickInterval = setInterval(gameTick, 1000)
}

function checkForCollision() {
  if (currentPiece.orientation === 'vertical1') {
    if (!boardCells[currentPiece.color1CellIdx].lookDown() || boardCells[currentPiece.color1CellIdx + 1].fill !== null) {
      return true
    }
  } else if (currentPiece.orientation === 'vertical2') {
    if (!boardCells[currentPiece.color2CellIdx].lookDown() || boardCells[currentPiece.color2CellIdx + 1].fill !== null ) {
      return true
    }
  } else {
    if (!boardCells[currentPiece.color2CellIdx].lookDown() || boardCells[currentPiece.color2CellIdx + 1].fill !== null || boardCells[currentPiece.color1CellIdx + 1].fill !== null) {
      return true
    }
  }
}

function renderBoard() {
  boardCellElements.forEach((cellEl, idx) => {
    if (currentTheme.baddieTypes.includes(boardCells[idx].fill)){
      let idxForStyling = currentTheme.baddieTypes.indexOf(boardCells[idx].fill)
      cellEl.style.backgroundImage = currentTheme.baddieUrls[idxForStyling]
      cellEl.style.backgroundSize = "3.5vh"
      cellEl.style.borderRadius = '10px'
      cellEl.style.backgroundColor = currentTheme.pieceColors[idxForStyling]
    } else {
      if (totMode) {
        cellEl.style.backgroundImage = currentTheme.pieceUrls[boardCells[idx].fill]
        cellEl.style.backgroundSize = "3.5vh"

      } else {
        cellEl.style.backgroundImage = ''
        cellEl.style.backgroundColor = currentTheme.pieceColors[boardCells[idx].fill]
      }
    }
    if (boardCells[idx].fill === null) {
      cellEl.style.backgroundColor = null
      cellEl.style.backgroundImage = null
      cellEl.style.borderRadius = null
    }
  })
  scoreDisplayElement.textContent = `Score: ${score}`
  levelDisplayElement.textContent = `Level: ${level}`
}

function generateBoardCellElements() {
  boardElement.innerHTML = ''
  for (let x = 1; x <= 8; x++) {
    let newColumn = document.createElement('div')
    for (let y = 16; y >= 1; y--) {
      let newCellElement = document.createElement('div')
      newCellElement.id = `X${x}Y${y}`
      newCellElement.className = 'cell'
      newColumn.appendChild(newCellElement)
    }
    boardElement.appendChild(newColumn)
  }
}

function generateBoardCells() {
  for (let x = 1; x <= 8; x++) {
    for (let y = 16; y >= 1; y--) {
      let cellIdx = 16 * x - y
      let newCell = new Cell(cellIdx)
      boardCells.push(newCell)
    }
  }
}


function rotatePiece() {
  removeBorderRadius()
  removeFill()
  // Address edge case for flipping a vertical piece on right edge of board
  if ((currentPiece.orientation === 'vertical1' || currentPiece.orientation === 'vertical2') && (currentPiece.color1CellIdx > 112)) {
    currentPiece.color1CellIdx -= 16
    currentPiece.color2CellIdx -= 16
  }
  if (currentPiece.orientation === 'horizontal1' && !boardCells[currentPiece.color1CellIdx].lookUp().locked) {
    currentPiece.color2CellIdx = currentPiece.color1CellIdx - 1
    applyBorderRadius('bottom', 'top')
    currentPiece.orientation = 'vertical1'
  } else if (currentPiece.orientation === 'vertical1' && !boardCells[currentPiece.color1CellIdx].lookRight().locked) {
    let idx1Placeholder = currentPiece.color1CellIdx
    currentPiece.color2CellIdx = idx1Placeholder
    currentPiece.color1CellIdx = currentPiece.color2CellIdx + 16
    applyBorderRadius('right', 'left')
    currentPiece.orientation = 'horizontal2'
  } else if (currentPiece.orientation === 'horizontal2' && !boardCells[currentPiece.color2CellIdx].lookUp().locked) {
    currentPiece.color1CellIdx = currentPiece.color2CellIdx - 1
    applyBorderRadius('top', 'bottom')
    currentPiece.orientation = 'vertical2'
  } else if (currentPiece.orientation === 'vertical2' && !boardCells[currentPiece.color2CellIdx].lookRight().locked) {
    let idx2Placeholder = currentPiece.color2CellIdx
    currentPiece.color1CellIdx = idx2Placeholder
    currentPiece.color2CellIdx = currentPiece.color1CellIdx + 16
    applyBorderRadius('left', 'right')
    currentPiece.orientation = 'horizontal1'
  }
  applyFill()
  renderBoard()
}

function applyBorderRadius(colorIdx1BorderPos, colorIdx2BorderPos) {
  boardCellElements[currentPiece.color1CellIdx].className = `cell ${colorIdx1BorderPos}-border-radius`
  boardCellElements[currentPiece.color2CellIdx].className = `cell ${colorIdx2BorderPos}-border-radius`
}

function removeBorderRadius() {
  boardCellElements[currentPiece.color2CellIdx].className = 'cell'
  boardCellElements[currentPiece.color1CellIdx].className = 'cell'
}

function removeFill() {
  boardCells[currentPiece.color1CellIdx].fill = null
  boardCells[currentPiece.color2CellIdx].fill = null
}

function applyFill() {
  boardCells[currentPiece.color1CellIdx].fill = currentPiece.color1
  boardCells[currentPiece.color2CellIdx].fill = currentPiece.color2
}

function shiftPiece(idx1Shift, idx2Shift) {
  let tempClass1 = boardCellElements[currentPiece.color1CellIdx].className
  let tempClass2 = boardCellElements[currentPiece.color2CellIdx].className
  removeBorderRadius()
  removeFill()
  currentPiece.color1CellIdx += idx1Shift
  currentPiece.color2CellIdx += idx2Shift
  boardCellElements[currentPiece.color1CellIdx].className = tempClass1
  boardCellElements[currentPiece.color2CellIdx].className = tempClass2
  applyFill()
}


function movePieceLeft() {
  if (
    // If piece is horizontal and the spot to the left is locked or an edge
    (currentPiece.orientation === 'horizontal1' && 
    (
      !boardCells[currentPiece.color1CellIdx].lookLeft() || 
      boardCells[currentPiece.color1CellIdx].lookLeft().locked
    )) ||
    (currentPiece.orientation === 'horizontal2' && 
    (
      !boardCells[currentPiece.color2CellIdx].lookLeft() || 
      boardCells[currentPiece.color2CellIdx].lookLeft().locked
    )) ||
    // If piece is horizontal and the spot to the left is locked or an edge
    ((currentPiece.orientation === 'vertical1' || currentPiece.orientation === 'vertical2') && 
    (
      !boardCells[currentPiece.color2CellIdx].lookLeft() || 
      boardCells[currentPiece.color1CellIdx].lookLeft().locked ||
      boardCells[currentPiece.color2CellIdx].lookLeft().locked
    ))
  ) {
    return
  }
  shiftPiece(-16, -16)
  renderBoard()
}

function movePieceRight() {
  if (
    // If piece is horizontal and the spot to the right is locked or an edge
    (currentPiece.orientation === 'horizontal1' && 
    (
      !boardCells[currentPiece.color2CellIdx].lookRight() || 
      boardCells[currentPiece.color2CellIdx].lookRight().locked
    )) ||
    (currentPiece.orientation === 'horizontal2' && 
    (
      !boardCells[currentPiece.color1CellIdx].lookRight() || 
      boardCells[currentPiece.color1CellIdx].lookRight().locked
    )) ||
    // If piece is vertical and the spot to the right is locked or an edge
    ((currentPiece.orientation === 'vertical1' || currentPiece.orientation === 'vertical2') && 
    (
      !boardCells[currentPiece.color2CellIdx].lookRight() || 
      boardCells[currentPiece.color1CellIdx].lookRight().locked ||
      boardCells[currentPiece.color2CellIdx].lookRight().locked
    ))
  ) {
    return
  }
  shiftPiece(16, 16)
  renderBoard()
}

function movePieceDown() {
  if (
    // If piece is horizontal and the spot below is locked or an edge
    ((currentPiece.orientation === 'horizontal1' || currentPiece.orientation === 'horizontal2') && 
    (
      !boardCells[currentPiece.color1CellIdx].lookDown() ||
      boardCells[currentPiece.color1CellIdx].lookDown().fill !== null ||
      boardCells[currentPiece.color2CellIdx].lookDown().fill !== null
    )) ||
    // If piece is vertical and the spot below is locked or an edge
    (currentPiece.orientation === 'vertical1' && 
      (!boardCells[currentPiece.color1CellIdx].lookDown() ||
      boardCells[currentPiece.color1CellIdx].lookDown().fill !== null)
    ) ||
    (currentPiece.orientation === 'vertical2' && 
      (!boardCells[currentPiece.color2CellIdx].lookDown() ||
      boardCells[currentPiece.color2CellIdx].lookDown().fill !== null)
    ) 
  ) {
    handleCollision()
    return
  }
  shiftPiece(1, 1)
  renderBoard()
}

function addBaddies() {
  let baddiesToAdd = []
  while (baddiesToAdd.length < level * 4) {
    let baddieXCoord = Math.ceil(Math.random() * 8)
    let baddieYCoord = Math.ceil(Math.random() * 10)
    let baddieIdx = 16 * baddieXCoord - baddieYCoord
    if (!baddiesToAdd.includes(baddieIdx)) {
      baddiesToAdd.push(baddieIdx)
    }
  }
  baddiesToAdd.forEach(baddieIdx => {
    let baddieTypeIdx = Math.floor(Math.random() * currentTheme.baddieTypes.length)
    boardCells[baddieIdx].fill = currentTheme.baddieTypes[baddieTypeIdx]
    boardCells[baddieIdx].locked = true
  })
}
