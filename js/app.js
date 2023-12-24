/*-------------------------------- Constants --------------------------------*/
const baddieTypes = ['baddieA', 'baddieB', 'baddieC']

class Cell {
  constructor(xPos, yPos){
    this.xPos = xPos
    this.yPos = yPos
  }
  baddie = null
}

const pieceColors = ['#db7800', '#e18695', 'cornflowerblue']


/*---------------------------- Variables (state) ----------------------------*/
let currentPiece, nextPiece, boardCellElements
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
  renderBoard()
  console.log(boardCells)
}

function checkForRow() {
}

function checkForColumn() {
}

function pieceFalls() {
}

function generatePiece() {
  let randHeadIdx = Math.floor(Math.random() * pieceColors.length)
  let randTailIdx = Math.floor(Math.random() * pieceColors.length)
  return {head: pieceColors[randHeadIdx], tail: pieceColors[randTailIdx]}
}

function checkForCollision() {
}

function renderBoard() {
  boardCellElements.forEach((cellEl, idx) => {
    if (boardCells[idx].baddie === 'baddieA') {
      cellEl.style.backgroundColor = pieceColors[0]
      cellEl.style.backgroundImage = "url('./assets/images/clyde.png')"
      cellEl.style.backgroundSize = "20px"
      // cellEl.textContent = '👾'
    }
    if (boardCells[idx].baddie === 'baddieB') {
      cellEl.style.backgroundColor = pieceColors[1]
      cellEl.style.backgroundImage = "url('./assets/images/pinky.png')"
      cellEl.style.backgroundSize = "20px"
    }
    if (boardCells[idx].baddie === 'baddieC') {
      cellEl.style.backgroundColor = pieceColors[2]
      cellEl.style.backgroundImage = "url('./assets/images/inky.png')"
      cellEl.style.backgroundSize = "20px"
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
}

function movePieceLeft() {
  console.log('movePieceLeft invoked')
}

function movePieceRight() {
  console.log('movePieceRight invoked')
}

function movePieceDown() {
  console.log('movePieceDown invoked')
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
        cell.baddie = baddieTypes[baddieTypeIdx]
      }
    })
  })
}


