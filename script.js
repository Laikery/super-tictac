// script.js mit KI und Schwierigkeitsgrad
let currentPlayer = "X";
let superBoard = Array(9).fill(null).map(() => Array(9).fill(null));
let boardsWon = Array(9).fill(null);
let activeBoard = -1;
let gameActive = true;
let aiLevel = 1; // 0 = easy, 1 = normal, 2 = hard

const statusText = document.getElementById("status");
const superBoardElement = document.getElementById("super-board");
const aiSelect = document.getElementById("ai-select");

if (aiSelect) {
  aiSelect.addEventListener("change", () => {
    aiLevel = parseInt(aiSelect.value);
  });
}

function createBoard() {
  superBoardElement.innerHTML = "";
  for (let b = 0; b < 9; b++) {
    const boardDiv = document.createElement("div");
    boardDiv.classList.add("board");
    boardDiv.dataset.board = b;
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement("button");
      cell.classList.add("cell");
      cell.dataset.board = b;
      cell.dataset.cell = c;
      cell.addEventListener("click", handleClick);
      boardDiv.appendChild(cell);
    }
    superBoardElement.appendChild(boardDiv);
  }
}

function handleClick(e) {
  if (!gameActive || currentPlayer !== "X") return;

  const boardIndex = parseInt(e.target.dataset.board);
  const cellIndex = parseInt(e.target.dataset.cell);

  if (activeBoard !== -1 && boardIndex !== activeBoard) return;
  if (superBoard[boardIndex][cellIndex] !== null) return;
  if (boardsWon[boardIndex]) return;

  makeMove(boardIndex, cellIndex);
}

function makeMove(boardIndex, cellIndex) {
  superBoard[boardIndex][cellIndex] = currentPlayer;
  const cellBtn = document.querySelector(`.cell[data-board='${boardIndex}'][data-cell='${cellIndex}']`);
  cellBtn.textContent = currentPlayer;

  if (checkWin(superBoard[boardIndex])) {
    boardsWon[boardIndex] = currentPlayer;
    highlightBoard(boardIndex, currentPlayer);
    if (checkWin(boardsWon)) {
      statusText.textContent = `Spieler ${currentPlayer} gewinnt das Spiel!`;
      gameActive = false;
      return;
    }
  }

  if (superBoard[cellIndex].every(c => c !== null) || boardsWon[cellIndex]) {
    activeBoard = -1;
  } else {
    activeBoard = cellIndex;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  updateBoardState();
  statusText.textContent = `Spieler ${currentPlayer} ist dran`;

  if (currentPlayer === "O") {
    setTimeout(aiMove, 300);
  }
}

function aiMove() {
  if (!gameActive) return;
  let move;

  switch (aiLevel) {
    case 0:
      move = getRandomMove();
      break;
    case 1:
      move = getFirstValidMove();
      break;
    case 2:
      move = getWinningOrBlockingMove() || getFirstValidMove();
      break;
  }

  if (move) makeMove(move.board, move.cell);
}

function getFirstValidMove() {
  let boards = activeBoard === -1 ? [...Array(9).keys()] : [activeBoard];
  for (let b of boards) {
    if (boardsWon[b]) continue;
    for (let c = 0; c < 9; c++) {
      if (superBoard[b][c] === null) return { board: b, cell: c };
    }
  }
  return null;
}

function getRandomMove() {
  let validMoves = [];
  let boards = activeBoard === -1 ? [...Array(9).keys()] : [activeBoard];
  for (let b of boards) {
    if (boardsWon[b]) continue;
    for (let c = 0; c < 9; c++) {
      if (superBoard[b][c] === null) validMoves.push({ board: b, cell: c });
    }
  }
  return validMoves[Math.floor(Math.random() * validMoves.length)] || null;
}

function getWinningOrBlockingMove() {
  let player = "O";
  let enemy = "X";
  let boards = activeBoard === -1 ? [...Array(9).keys()] : [activeBoard];
  for (let b of boards) {
    if (boardsWon[b]) continue;
    for (let [a, c, d] of [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]]) {
      let line = [superBoard[b][a], superBoard[b][c], superBoard[b][d]];
      let indices = [a, c, d];
      if (line.filter(v => v === player).length === 2 && line.includes(null)) {
        return { board: b, cell: indices[line.indexOf(null)] };
      }
      if (line.filter(v => v === enemy).length === 2 && line.includes(null)) {
        return { board: b, cell: indices[line.indexOf(null)] };
      }
    }
  }
  return null;
}

function highlightBoard(index, player) {
  const board = document.querySelectorAll(`.board[data-board='${index}'] .cell`);
  board.forEach(cell => {
    cell.style.backgroundColor = player === "X" ? "#880000" : "#000088";
  });
}

function checkWin(board) {
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  return wins.some(([a,b,c]) => board[a] && board[a] === board[b] && board[a] === board[c]);
}

function updateBoardState() {
  const allCells = document.querySelectorAll(".cell");
  allCells.forEach(cell => {
    const b = parseInt(cell.dataset.board);
    const c = parseInt(cell.dataset.cell);
    const won = boardsWon[b];
    cell.disabled = won || superBoard[b][c] !== null ||
                    (activeBoard !== -1 && activeBoard !== b);
  });
}

function resetGame() {
  currentPlayer = "X";
  superBoard = Array(9).fill(null).map(() => Array(9).fill(null));
  boardsWon = Array(9).fill(null);
  activeBoard = -1;
  gameActive = true;
  statusText.textContent = "Spieler X beginnt";
  createBoard();
  updateBoardState();
}

createBoard();
updateBoardState();