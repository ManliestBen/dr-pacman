/*-------------------------------- Constants --------------------------------*/
class Cell {
  constructor(xPos, yPos){
    this.xPos = xPos
    this.yPos = yPos
  }
}


/*---------------------------- Variables (state) ----------------------------*/
let currentPiece, nextPiece
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
  console.log(boardCells)
  generateBoardCellElements()
}

function checkForRow() {
}

function checkForColumn() {
}

function pieceFalls() {
}

function generatePiece() {
}

function checkForCollision() {
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
    for (let y = 1; y <= 16; y++) {
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
}


