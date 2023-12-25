/*-------------------------------- Constants --------------------------------*/
const baddieTypes = ['baddieA', 'baddieB', 'baddieC']

class Cell {
  constructor(xPos, yPos){
    this.xPos = xPos
    this.yPos = yPos
  }
  fill = null
  locked = false
  
}

const pieceColors = ['#db7800', '#e18695', 'cornflowerblue']


/*---------------------------- Variables (state) ----------------------------*/
let currentPiece, nextPiece, boardCellElements, gameTickInterval, tickCounter
let boardCells = []


/*------------------------ Cached Element References ------------------------*/
const boardElement = document.querySelector('#board')


/*----------------------------- Event Listeners -----------------------------*/
document.addEventListener('keydown', (evt) => {
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
})


/*-------------------------------- Functions --------------------------------*/
init()


function init() {
  generateBoardCells()
  generateBoardCellElements()
  boardCellElements = document.querySelectorAll('.cell')
  addBaddies()
  nextPiece = generatePiece()
  console.log(boardCells)
  startNextPiece()
  renderBoard()
}

function checkForRow() {
}

function checkForColumn() {
}

function gameTick() {
  if (tickCounter >= 14) {
    clearInterval(gameTickInterval)
    // call collision function here 
    return
  }
  checkForCollision()
  pieceFalls()
  renderBoard()
  tickCounter++
  console.log(tickCounter)
}

function pieceFalls() {
  boardCells[currentPiece.color1CellIdx].fill = null
  boardCells[currentPiece.color2CellIdx].fill = null
  currentPiece.color1CellIdx += 1
  currentPiece.color2CellIdx += 1
  boardCells[currentPiece.color1CellIdx].fill = currentPiece.color1
  boardCells[currentPiece.color2CellIdx].fill = currentPiece.color2
}

function generatePiece() {
  let randHeadIdx = Math.floor(Math.random() * pieceColors.length)
  let randTailIdx = Math.floor(Math.random() * pieceColors.length)
  return {color1: pieceColors[randHeadIdx], color2: pieceColors[randTailIdx], color1CellIdx: 49, color2CellIdx: 65}
}

function startNextPiece() {
  currentPiece = nextPiece
  nextPiece = generatePiece()
  currentPiece.orientation = 'horizontal1'
  console.log(currentPiece)
  boardCells[currentPiece.color1CellIdx].fill = currentPiece.color1
  boardCells[currentPiece.color2CellIdx].fill = currentPiece.color2
  tickCounter = 0
  gameTickInterval = setInterval(gameTick, 1000)
}

function checkForCollision() {
  if (currentPiece.orientation === 'vertical1') {
    if (boardCells[currentPiece.color1CellIdx + 1].locked) {
      console.log('collision')
    }
  } else if (currentPiece.orientation === 'vertical2') {
    if (boardCells[currentPiece.color2CellIdx + 1].locked) {
      console.log('collision')
    }
  } else {
    if (boardCells[currentPiece.color2CellIdx + 1].locked || boardCells[currentPiece.color1CellIdx + 1].locked) {
      console.log('collision')
    }
  }
}

function renderBoard() {
  boardCellElements.forEach((cellEl, idx) => {
    if (boardCells[idx].fill === 'baddieA') {
      cellEl.style.backgroundColor = pieceColors[0]
      cellEl.style.backgroundImage = "url('./assets/images/clyde.png')"
      cellEl.style.backgroundSize = "20px"
    }
    if (boardCells[idx].fill === 'baddieB') {
      cellEl.style.backgroundColor = pieceColors[1]
      cellEl.style.backgroundImage = "url('./assets/images/pinky.png')"
      cellEl.style.backgroundSize = "20px"
    }
    if (boardCells[idx].fill === 'baddieC') {
      cellEl.style.backgroundColor = pieceColors[2]
      cellEl.style.backgroundImage = "url('./assets/images/inky.png')"
      cellEl.style.backgroundSize = "20px"
    }
    if (boardCells[idx].fill === pieceColors[0]) {
      cellEl.style.backgroundColor = pieceColors[0]
    }
    if (boardCells[idx].fill === pieceColors[1]) {
      cellEl.style.backgroundColor = pieceColors[1]
    }
    if (boardCells[idx].fill === pieceColors[2]) {
      cellEl.style.backgroundColor = pieceColors[2]
    }
    if (!boardCells[idx].fill) {
      cellEl.style.backgroundColor = null
    }
  })
}

function generateBoardCellElements() {
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
      let newCell = new Cell(x, y)
      boardCells.push(newCell)
    }
  }
}


function rotatePiece() {
  console.log('rotatePiece invoked')
  // Address edge case for flipping a vertical piece on right edge of board
  if ((currentPiece.orientation === 'vertical1' || currentPiece.orientation === 'vertical2') && (currentPiece.color1CellIdx > 112)) {
    boardCells[currentPiece.color1CellIdx].fill = null
    boardCells[currentPiece.color2CellIdx].fill = null
    currentPiece.color1CellIdx -= 16
    currentPiece.color2CellIdx -= 16
    boardCells[currentPiece.color1CellIdx].fill = currentPiece.color1
    boardCells[currentPiece.color2CellIdx].fill = currentPiece.color2
  }
  if (currentPiece.orientation === 'horizontal1') {
  boardCells[currentPiece.color2CellIdx].fill = null
  currentPiece.color2CellIdx = currentPiece.color1CellIdx - 1
  boardCells[currentPiece.color2CellIdx].fill = currentPiece.color2
  currentPiece.orientation = 'vertical1'
  renderBoard()
  } else if (currentPiece.orientation === 'vertical1') {
    let idx1Placeholder = currentPiece.color1CellIdx
    boardCells[currentPiece.color2CellIdx].fill = null
    currentPiece.color2CellIdx = idx1Placeholder
    currentPiece.color1CellIdx = currentPiece.color2CellIdx + 16
    boardCells[currentPiece.color1CellIdx].fill = currentPiece.color1
    boardCells[currentPiece.color2CellIdx].fill = currentPiece.color2
    currentPiece.orientation = 'horizontal2'
    renderBoard()
  } else if (currentPiece.orientation === 'horizontal2') {
    boardCells[currentPiece.color1CellIdx].fill = null
    currentPiece.color1CellIdx = currentPiece.color2CellIdx - 1
    boardCells[currentPiece.color1CellIdx].fill = currentPiece.color1
    currentPiece.orientation = 'vertical2'
    renderBoard()
  } else if (currentPiece.orientation === 'vertical2') {
    let idx2Placeholder = currentPiece.color2CellIdx
    boardCells[currentPiece.color1CellIdx].fill = null
    currentPiece.color1CellIdx = idx2Placeholder
    currentPiece.color2CellIdx = currentPiece.color1CellIdx + 16
    boardCells[currentPiece.color1CellIdx].fill = currentPiece.color1
    boardCells[currentPiece.color2CellIdx].fill = currentPiece.color2
    currentPiece.orientation = 'horizontal1'
    renderBoard()
  }
}

function movePieceLeft() {
  console.log('movePieceLeft invoked')
  if (currentPiece.color1CellIdx - 16 > 0 && currentPiece.color2CellIdx - 16 > 0) {
    boardCells[currentPiece.color1CellIdx].fill = null
    boardCells[currentPiece.color2CellIdx].fill = null
    currentPiece.color1CellIdx -= 16
    currentPiece.color2CellIdx -= 16
    boardCells[currentPiece.color1CellIdx].fill = currentPiece.color1
    boardCells[currentPiece.color2CellIdx].fill = currentPiece.color2
    renderBoard()
  }
}

function movePieceRight() {
  console.log('movePieceRight invoked')
  if (currentPiece.color1CellIdx + 16 < 128 && currentPiece.color2CellIdx + 16 < 127) {
    boardCells[currentPiece.color1CellIdx].fill = null
    boardCells[currentPiece.color2CellIdx].fill = null
    currentPiece.color1CellIdx += 16
    currentPiece.color2CellIdx += 16
    boardCells[currentPiece.color1CellIdx].fill = currentPiece.color1
    boardCells[currentPiece.color2CellIdx].fill = currentPiece.color2
    renderBoard()
  }
}

function movePieceDown() {
  console.log('movePieceDown invoked')
  if (tickCounter < 14) {
    boardCells[currentPiece.color1CellIdx].fill = null
    boardCells[currentPiece.color2CellIdx].fill = null
    currentPiece.color1CellIdx += 1
    currentPiece.color2CellIdx += 1
    boardCells[currentPiece.color1CellIdx].fill = currentPiece.color1
    boardCells[currentPiece.color2CellIdx].fill = currentPiece.color2
    tickCounter++
    console.log(tickCounter)
    renderBoard()
  }
}

function addBaddies() {
  let baddiesToAdd = []
  while (baddiesToAdd.length < 4) {
    let baddieXCoord = Math.ceil(Math.random() * 8)
    let baddieYCoord = Math.ceil(Math.random() * 10)
    if (!baddiesToAdd.some(baddie => baddie.x === baddieXCoord && baddie.y === baddieYCoord)) {
      baddiesToAdd.push({x: baddieXCoord, y: baddieYCoord})
    }
  }
  baddiesToAdd.forEach(baddie => {
    let baddieTypeIdx = Math.floor(Math.random() * baddieTypes.length)
    boardCells.forEach(cell => {
      if (cell.xPos === baddie.x && cell.yPos === baddie.y) {
        cell.fill = baddieTypes[baddieTypeIdx]
        cell.locked = true
      }
    })
  })
}


