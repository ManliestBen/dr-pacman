/*-------------------------------- Constants --------------------------------*/



/*---------------------------- Variables (state) ----------------------------*/
let currentPiece, nextPiece


/*------------------------ Cached Element References ------------------------*/
const board = document.querySelector('#board')


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


