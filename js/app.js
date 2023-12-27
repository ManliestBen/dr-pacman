/*-------------------------------- Constants --------------------------------*/

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
    if (this.fill && this.calcIdxOfFillType() === this.lookRight()?.calcIdxOfFillType()){
      return 1 + this.lookRight().calcNumMatchesRow()
    } else {
      return 1
    }
  }
  calcNumMatchesColumn(){
    if (this.fill && this.calcIdxOfFillType() === this.lookUp()?.calcIdxOfFillType()){
      return 1 + this.lookUp().calcNumMatchesColumn()
    } else {
      return 1
    }
  }
  calcIdxOfFillType() {
    return currentTheme.baddieTypes.indexOf(this.fill) !== -1 ? currentTheme.baddieTypes.indexOf(this.fill) : currentTheme.pieceColors.indexOf(this.fill)
  }
}



/*---------------------------- Variables (state) ----------------------------*/
let currentPiece, nextPiece, boardCellElements, gameTickInterval
let score, cascadeActive, highScores, playerName, gameIsPaused, level
let boardCells = []
let currentTheme = {
  baddieTypes: ['baddie1', 'baddie2', 'baddie3'],
  baddieUrls: ["url('./assets/images/clyde.png')", "url('./assets/images/pinky.png')", "url('./assets/images/inky.png')"],
  pieceColors: ['#db7800', '#e18695', 'cornflowerblue'],
}

/*------------------------ Cached Element References ------------------------*/
const boardElement = document.querySelector('#board')
const menuBtn = document.querySelector('#menu-button')
const gameplayBtns = document.querySelector('.gameplay-buttons')
const scoreDisplayElement = document.querySelector('#score-display')
const levelDisplayElement = document.querySelector('#level-display')


/*----------------------------- Event Listeners -----------------------------*/
document.addEventListener('keydown', (evt) => {
  if (!cascadeActive && gameTickInterval) {
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

menuBtn.addEventListener('click', init)



/*-------------------------------- Functions --------------------------------*/
init()


function init() {
  fetchHighScores()
  level = 1
  score = 0
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

function startNewLevel(levelNum) {
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
  if (gameTickInterval) {
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

function fetchHighScores() {
  fetch('https://high-score-api.fly.dev/api/scores/?game=tbd')
  .then(res => res.json())
  .then(data => highScores = data)
}

function submitScore(playerName, newScore) {
  fetch('https://high-score-api.fly.dev/api/scores/', {
    method: 'POST',
    body: JSON.stringify({
      game: 'tbd',
      player: playerName,
      score: newScore
    }),
    headers: {'Content-Type': 'application/json'}
  })
  .then(res => res.json())
  .then(data => highScores = data)
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
  if (!cascadeActive) {
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
    console.log('game over')
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
    if (!cell.locked && cell.fill && cell.lookDown() && !cell.lookDown().fill) {
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
    if (cell.linkedTo && cell.lookDown() && !cell.lookDown().fill && !boardCells[cell.linkedTo].lookDown().fill ) {
      cascadePossible = true
      let cellData = {}
      cellData.cellIdx = cell.cellIdx
      cellData.linkedTo= cell.linkedTo
      linkedCellsToCascade.push(cellData)
    }
    // If linked vertical pair can cascade
    if (cell.linkedTo && (cell.linkedTo === cell.cellIdx + 1 || cell.linkedTo === cell.cellIdx - 1) && cell.lookDown() && !cell.lookDown().fill ) {
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
        console.log('next level!')
        startNewLevel(level + 1)
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
    }, 300)
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
  let randIdx1 = Math.floor(Math.random() * currentTheme.pieceColors.length)
  let randIdx2 = Math.floor(Math.random() * currentTheme.pieceColors.length)
  return {color1: currentTheme.pieceColors[randIdx1], color2: currentTheme.pieceColors[randIdx2], color1CellIdx: 49, color2CellIdx: 65}
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
    if (!boardCells[currentPiece.color1CellIdx].lookDown() || boardCells[currentPiece.color1CellIdx + 1].fill) {
      return true
    }
  } else if (currentPiece.orientation === 'vertical2') {
    if (!boardCells[currentPiece.color2CellIdx].lookDown() || boardCells[currentPiece.color2CellIdx + 1].fill ) {
      return true
    }
  } else {
    if (!boardCells[currentPiece.color2CellIdx].lookDown() || boardCells[currentPiece.color2CellIdx + 1].fill || boardCells[currentPiece.color1CellIdx + 1].fill) {
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
      cellEl.style.backgroundColor = currentTheme.pieceColors[currentTheme.pieceColors.indexOf(boardCells[idx].fill)]
    }
    if (!boardCells[idx].fill) {
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
      boardCells[currentPiece.color1CellIdx].lookDown().fill ||
      boardCells[currentPiece.color2CellIdx].lookDown().fill
    )) ||
    // If piece is vertical and the spot below is locked or an edge
    (currentPiece.orientation === 'vertical1' && 
      (!boardCells[currentPiece.color1CellIdx].lookDown() ||
      boardCells[currentPiece.color1CellIdx].lookDown().fill)
    ) ||
    (currentPiece.orientation === 'vertical2' && 
      (!boardCells[currentPiece.color2CellIdx].lookDown() ||
      boardCells[currentPiece.color2CellIdx].lookDown().fill)
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

