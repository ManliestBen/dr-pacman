/*-------------------------------- Constants --------------------------------*/
const baddieTypes = ['baddieA', 'baddieB', 'baddieC']

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
    return baddieTypes.indexOf(this.fill) !== -1 ? baddieTypes.indexOf(this.fill) : pieceColors.indexOf(this.fill)
  }
}

const pieceColors = ['#db7800', '#e18695', 'cornflowerblue']


/*---------------------------- Variables (state) ----------------------------*/
let currentPiece, nextPiece, boardCellElements, gameTickInterval, score
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
  score = 0
  generateBoardCells()
  generateBoardCellElements()
  boardCellElements = document.querySelectorAll('.cell')
  addBaddies()
  nextPiece = generatePiece()
  console.log(boardCells)
  startNextPiece()
  renderBoard()
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
  if(checkForCollision()) {
    handleCollision()
  } else {
    pieceFalls()
    renderBoard()
  }
}

function handleCollision() {
  // check for complete rows/columns
  // if yes, clear and check for cascades
  // if no
  if (boardCells[49].fill || boardCells[65].fill) {
    clearInterval(gameTickInterval)
    console.log('game over')
  } else {
    lockInPlace()
    clearCellsAndCalculatePoints()
      startNextPiece()
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
  }
}

function clearCells(cellsToClear) {
  cellsToClear.forEach(cell => {
    boardCells[cell].fill = null
    boardCells[cell].locked = false
  })
}

function calculatePoints(numCellsCleared) {
  return 2 ^ numCellsCleared
}

function lockInPlace() {
  boardCells[currentPiece.color1CellIdx].locked = true
  boardCells[currentPiece.color2CellIdx].locked = true
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
  let randIdx1 = Math.floor(Math.random() * pieceColors.length)
  let randIdx2 = Math.floor(Math.random() * pieceColors.length)
  return {color1: pieceColors[randIdx1], color2: pieceColors[randIdx2], color1CellIdx: 49, color2CellIdx: 65}
}

function startNextPiece() {
  currentPiece = nextPiece
  nextPiece = generatePiece()
  currentPiece.orientation = 'horizontal1'
  boardCells[currentPiece.color1CellIdx].fill = currentPiece.color1
  boardCells[currentPiece.color2CellIdx].fill = currentPiece.color2
  clearInterval(gameTickInterval)
  gameTickInterval = setInterval(gameTick, 1000)
}

function checkForCollision() {
  if (currentPiece.orientation === 'vertical1') {
    if (!boardCells[currentPiece.color1CellIdx].lookDown() || boardCells[currentPiece.color1CellIdx + 1].locked) {
      console.log('collision')
      return true
    }
  } else if (currentPiece.orientation === 'vertical2') {
    if (!boardCells[currentPiece.color2CellIdx].lookDown() || boardCells[currentPiece.color2CellIdx + 1].locked ) {
      console.log('collision')
      return true
    }
  } else {
    if (!boardCells[currentPiece.color2CellIdx].lookDown() || boardCells[currentPiece.color2CellIdx + 1].locked || boardCells[currentPiece.color1CellIdx + 1].locked) {
      console.log('collisionaaa')
      return true
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
      cellEl.style.backgroundImage = null
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
      let cellIdx = 16 * x - y
      let newCell = new Cell(cellIdx)
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
  if (currentPiece.orientation === 'horizontal1' && !boardCells[currentPiece.color1CellIdx].lookUp().locked) {
    boardCells[currentPiece.color2CellIdx].fill = null
    currentPiece.color2CellIdx = currentPiece.color1CellIdx - 1
    boardCells[currentPiece.color2CellIdx].fill = currentPiece.color2
    currentPiece.orientation = 'vertical1'
    renderBoard()
  } else if (currentPiece.orientation === 'vertical1' && !boardCells[currentPiece.color1CellIdx].lookRight().locked) {
    let idx1Placeholder = currentPiece.color1CellIdx
    boardCells[currentPiece.color2CellIdx].fill = null
    currentPiece.color2CellIdx = idx1Placeholder
    currentPiece.color1CellIdx = currentPiece.color2CellIdx + 16
    boardCells[currentPiece.color1CellIdx].fill = currentPiece.color1
    boardCells[currentPiece.color2CellIdx].fill = currentPiece.color2
    currentPiece.orientation = 'horizontal2'
    renderBoard()
  } else if (currentPiece.orientation === 'horizontal2' && !boardCells[currentPiece.color2CellIdx].lookUp().locked) {
    boardCells[currentPiece.color1CellIdx].fill = null
    currentPiece.color1CellIdx = currentPiece.color2CellIdx - 1
    boardCells[currentPiece.color1CellIdx].fill = currentPiece.color1
    currentPiece.orientation = 'vertical2'
    renderBoard()
  } else if (currentPiece.orientation === 'vertical2' && !boardCells[currentPiece.color2CellIdx].lookRight().locked) {
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
  boardCells[currentPiece.color1CellIdx].fill = null
  boardCells[currentPiece.color2CellIdx].fill = null
  currentPiece.color1CellIdx -= 16
  currentPiece.color2CellIdx -= 16
  boardCells[currentPiece.color1CellIdx].fill = currentPiece.color1
  boardCells[currentPiece.color2CellIdx].fill = currentPiece.color2
  renderBoard()
}

function movePieceRight() {
  console.log('movePieceRight invoked')
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
  boardCells[currentPiece.color1CellIdx].fill = null
  boardCells[currentPiece.color2CellIdx].fill = null
  currentPiece.color1CellIdx += 16
  currentPiece.color2CellIdx += 16
  boardCells[currentPiece.color1CellIdx].fill = currentPiece.color1
  boardCells[currentPiece.color2CellIdx].fill = currentPiece.color2
  renderBoard()
}

function movePieceDown() {
  console.log('movePieceDown invoked')
  if (
    // If piece is horizontal and the spot below is locked or an edge
    ((currentPiece.orientation === 'horizontal1' || currentPiece.orientation === 'horizontal2') && 
    (
      !boardCells[currentPiece.color1CellIdx].lookDown() ||
      boardCells[currentPiece.color1CellIdx].lookDown().locked ||
      boardCells[currentPiece.color2CellIdx].lookDown().locked
    )) ||
    // If piece is vertical and the spot below is locked or an edge
    (currentPiece.orientation === 'vertical1' && 
      (!boardCells[currentPiece.color1CellIdx].lookDown() ||
      boardCells[currentPiece.color1CellIdx].lookDown().locked)
    ) ||
    (currentPiece.orientation === 'vertical2' && 
      (!boardCells[currentPiece.color2CellIdx].lookDown() ||
      boardCells[currentPiece.color2CellIdx].lookDown().locked)
    ) 
  ) {
    handleCollision()
    return
  }
    boardCells[currentPiece.color1CellIdx].fill = null
    boardCells[currentPiece.color2CellIdx].fill = null
    currentPiece.color1CellIdx += 1
    currentPiece.color2CellIdx += 1
    boardCells[currentPiece.color1CellIdx].fill = currentPiece.color1
    boardCells[currentPiece.color2CellIdx].fill = currentPiece.color2
    renderBoard()
}

function addBaddies() {
  let baddiesToAdd = []
  while (baddiesToAdd.length < 4) {
    let baddieXCoord = Math.ceil(Math.random() * 8)
    let baddieYCoord = Math.ceil(Math.random() * 10)
    let baddieIdx = 16 * baddieXCoord - baddieYCoord
    if (!baddiesToAdd.includes(baddieIdx)) {
      baddiesToAdd.push(baddieIdx)
    }
  }
  baddiesToAdd.forEach(baddieIdx => {
    let baddieTypeIdx = Math.floor(Math.random() * baddieTypes.length)
    boardCells[baddieIdx].fill = baddieTypes[baddieTypeIdx]
    boardCells[baddieIdx].locked = true
  })
}

