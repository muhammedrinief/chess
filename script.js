import p from "./pieces.js";

const pieces = p.map((x) => {
  return {
    name: x.name,
    color: x.color,
    white: x.color === "white",
    black: x.color === "black",
    initialpos: x.initialpos,
    icon: x.icon,
    currentpos: x.initialpos,
    moved: false,
    dead: false,
    possibleMoves: [],
  };
});

let dragged;
let whiteToMove = true;
function main() {
  loadChessBoard();
}

function loadChessBoard() {
  const board = document.getElementById("chess-board");
  board.innerHTML = "";
  for (let i = 1; i <= 64; i++) {
    const row = Math.ceil(i / 8);
    const column = i % 8 || 8;
    const firstSquareIsWhite = row % 2 == 0;
    const odd = firstSquareIsWhite ? "white" : "black";
    const even = !firstSquareIsWhite ? "white" : "black";
    const pos = `${row}-${column}`;
    const gridElement = `<div
        id="board-${pos}"
        class="grid-item chess-square ${i % 2 == 0 ? odd : even}">
        </div>`;
    board.innerHTML += gridElement;
  }
  loadPieces();
  generatePossibleMoves(pieces);
}

function loadPieces() {
  const board = document.getElementById("chess-board");
  const squares = board.getElementsByClassName("chess-square");
  for (let i of squares) {
    const [, row, column] = i.id.split("-");
    const pos = row + "-" + column;
    loadPiecetoPos(pos);
    i.addEventListener("dragover", (event) => {
      event.preventDefault();
    });
    i.addEventListener("drop", (event) => {
      console.log(dragged);
      const piece = getPieceByPos(pieces, dragged.id);
      console.log(piece);
      const [, row, column] = i.id.split("-");
      const pos = row + "-" + column;
      const canMove =
        ((piece.white && whiteToMove) || (piece.black && !whiteToMove)) &&
        piece.possibleMoves.includes(pos);
      for (let sq of squares) {
        sq.classList.remove("movable-square");
      }
      event.preventDefault();
      if (!canMove) return;
      tryMove(dragged, i);
    });
  }
}

function movePiecetoPos(initialPos, finalPos) {
  const initialPiece = getPieceByPos(pieces, initialPos);
  const finalPiece = getPieceByPos(pieces, finalPos);
  if (finalPiece) {
    finalPiece.dead = true;
  }
  initialPiece.moved = true;
  initialPiece.currentpos = finalPos;
}

function loadPiecetoPos(pos) {
  const destSquare = getSquareByPos(pos);
  const piece = getPieceByPos(pieces, pos);
  if (!piece) return;
  const hex = piece.color === "white" ? "fffaf1" : "545355";
  destSquare.innerHTML = `<img id=${piece.currentpos}
    src="https://img.icons8.com/fluency-systems-filled/256/${hex}/${piece.name}.png"
    class="piece"
    draggable="true">`;
  const [pieceElement] = destSquare.children;
  if (!pieceElement) return false;
  pieceElement.addEventListener("dragstart", (event) => {
    dragged = event.target;
    const piece = getPieceByPos(pieces, dragged.id);
    const canMove = ((piece.white && whiteToMove) || (piece.black && !whiteToMove));
    if (!canMove) return;
    piece.possibleMoves.forEach(move => {
      const square = getSquareByPos(move);
      square.classList.add("movable-square");
    })
  });
}

function unloadPieceFromPos(pos) {
  const square = getSquareByPos(pos);
  square.innerHTML = "";
}

function getPieceByPos(pieces, pos) {
  return pieces.find((el) => !el.dead && el.currentpos === pos) ?? null;
}

function getSquareByPos(pos) {
  const [row, column] = pos.split("-");
  const board = document.getElementById("chess-board");
  const index = (parseInt(row) - 1) * 8 + parseInt(column) - 1;
  const square = board.children.item(index);
  if (!square) throw Error("Wrong square index");
  return square;
}

function generatePossibleMoves(pieces) {
  // pawns
  const pawns = pieces.filter((x) => x.name === "pawn");
  clearPossibleMoves(pawns);
  pawns.forEach((pawn) => {
    if (pawn.white) {
      const [row, column] = pawn.currentpos.split("-").map((x) => parseInt(x));
      pawn.possibleMoves.push(row + 1 + "-" + column);
      if (!pawn.moved) pawn.possibleMoves.push(row + 2 + "-" + column);
      const captureRow = row + 1;
      const captureColumns = [column + 1, column - 1];
      captureColumns.forEach((c) => {
        const pos = captureRow + "-" + c;
        const piece = getPieceByPos(pieces, pos);
        if (piece && piece.color !== pawn.color) {
          pawn.possibleMoves.push(pos);
        }
      });
    } else if (pawn.black) {
      const [row, column] = pawn.currentpos.split("-").map((x) => parseInt(x));
      pawn.possibleMoves.push(row - 1 + "-" + column);
      if (!pawn.moved) pawn.possibleMoves.push(row - 2 + "-" + column);
      const captureRow = row - 1;
      const captureColumns = [column + 1, column - 1];
      captureColumns.forEach((c) => {
        const pos = captureRow + "-" + c;
        const piece = getPieceByPos(pieces, pos);
        if (piece && piece.color !== pawn.color) {
          pawn.possibleMoves.push(pos);
        }
      });
    }
  });
  // knight
  const knights = pieces.filter((x) => x.name === "knight");
  clearPossibleMoves(knights);
  knights.forEach((knight) => {
    const [row, column] = knight.currentpos.split("-").map((x) => parseInt(x));
    let moves = [
      [row + 2, column + 1],
      [row + 2, column - 1],
      [row - 2, column + 1],
      [row - 2, column - 1],
      [row + 1, column + 2],
      [row + 1, column - 2],
      [row - 1, column + 2],
      [row - 1, column - 2],
    ]
      .filter((x) => x.every((v) => v <= 8 && v > 0))
      .map((x) => x.join("-"));
    moves.forEach((pos) => {
      const obPiece = getPieceByPos(pieces, pos);
      if (!obPiece) {
        knight.possibleMoves.push(pos);
      } else {
        if (knight.color === obPiece.color) return;
        knight.possibleMoves.push(pos);
        return;
      }
    });
  });
  // rook
  const rooks = pieces.filter((x) => x.name === "rook");
  clearPossibleMoves(rooks);
  setRookLikeMovements(rooks);
  // bishop
  const bishops = pieces.filter((x) => x.name === "bishop");
  clearPossibleMoves(bishops);
  setBishopLikeMovements(bishops);
  // queen
  const queens = pieces.filter((x) => x.name === "queen");
  clearPossibleMoves(queens);
  setRookLikeMovements(queens);
  setBishopLikeMovements(queens);
  // king
  const kings = pieces.filter((x) => x.name === "king");
  clearPossibleMoves(kings);
  kings.forEach((king) => {
    const [row, column] = king.currentpos.split("-").map((x) => parseInt(x));
    let moves = [];
    for (let i = row - 1; i <= row + 1; i++) {
      for (let j = column - 1; j <= column + 1; j++) {
        if (i < 1 || i > 8 || j < 1 || j > 8) continue;
        moves.push(i + "-" + j);
      }
    }
    moves.forEach((pos) => {
      const obPiece = getPieceByPos(pieces, pos);
      if (!obPiece) {
        king.possibleMoves.push(pos);
      } else {
        if (king.color === obPiece.color) return;
        king.possibleMoves.push(pos);
        return;
      }
    });
  });
}

function clearPossibleMoves(pieces) {
  pieces.forEach((piece) => (piece.possibleMoves = []));
}

function setRookLikeMovements(rooks) {
  rooks.forEach((piece) => {
    const [row, column] = piece.currentpos.split("-").map((x) => parseInt(x));
    for (let i = row + 1; i <= 8; i++) {
      const pos = i + "-" + column;
      const obPiece = getPieceByPos(pieces, pos);
      if (!obPiece) {
        piece.possibleMoves.push(pos);
      } else {
        if (piece.color === obPiece.color) break;
        piece.possibleMoves.push(pos);
        break;
      }
    }
    for (let i = row - 1; i >= 1; i--) {
      const pos = i + "-" + column;
      const obPiece = getPieceByPos(pieces, pos);
      if (!obPiece) {
        piece.possibleMoves.push(pos);
      } else {
        if (piece.color === obPiece.color) break;
        piece.possibleMoves.push(pos);
        break;
      }
    }
    for (let i = column + 1; i <= 8; i++) {
      const pos = row + "-" + i;
      const obPiece = getPieceByPos(pieces, pos);
      if (!obPiece) {
        piece.possibleMoves.push(pos);
      } else {
        if (piece.color === obPiece.color) break;
        piece.possibleMoves.push(pos);
        break;
      }
    }
    for (let i = column - 1; i >= 1; i--) {
      const pos = row + "-" + i;
      const obPiece = getPieceByPos(pieces, pos);
      if (!obPiece) {
        piece.possibleMoves.push(pos);
      } else {
        if (piece.color === obPiece.color) break;
        piece.possibleMoves.push(pos);
        break;
      }
    }
  });
}

function setBishopLikeMovements(bishops) {
  bishops.forEach((piece) => {
    const [row, column] = piece.currentpos.split("-").map((x) => parseInt(x));
    for (let i = row + 1; i <= 8; i++) {
      let breakOut = false;
      for (let j = column + 1; j <= 8; j++) {
        if (Math.abs(row - i) !== Math.abs(column - j)) continue;
        const pos = i + "-" + j;
        const obPiece = getPieceByPos(pieces, pos);
        if (!obPiece) {
          piece.possibleMoves.push(pos);
        } else {
          breakOut = true;
          if (piece.color === obPiece.color) break;
          piece.possibleMoves.push(pos);
          break;
        }
        if (breakOut) break;
      }
      if (breakOut) break;
    }
    for (let i = row - 1; i >= 1; i--) {
      let breakOut = false;
      for (let j = column - 1; j >= 1; j--) {
        if (Math.abs(row - i) !== Math.abs(column - j)) continue;
        const pos = i + "-" + j;
        const obPiece = getPieceByPos(pieces, pos);
        if (!obPiece) {
          piece.possibleMoves.push(pos);
        } else {
          breakOut = true;
          if (piece.color === obPiece.color) {
            break;
          }
          piece.possibleMoves.push(pos);
          break;
        }
      }
      if (breakOut) break;
    }
    for (let i = row - 1; i >= 1; i--) {
      let breakOut = false;
      for (let j = column + 1; j <= 8; j++) {
        if (Math.abs(row - i) !== Math.abs(column - j)) continue;
        const pos = i + "-" + j;
        const obPiece = getPieceByPos(pieces, pos);
        if (!obPiece) {
          piece.possibleMoves.push(pos);
        } else {
          breakOut = true;
          if (piece.color === obPiece.color) break;
          piece.possibleMoves.push(pos);
          break;
        }
      }
      if (breakOut) break;
    }
    for (let i = row + 1; i <= 8; i++) {
      let breakOut = false;
      for (let j = column - 1; j >= 1; j--) {
        if (Math.abs(row - i) !== Math.abs(column - j)) continue;
        const pos = i + "-" + j;
        const obPiece = getPieceByPos(pieces, pos);
        if (!obPiece) {
          piece.possibleMoves.push(pos);
        } else {
          breakOut = true;
          if (piece.color === obPiece.color) break;
          piece.possibleMoves.push(pos);
          break;
        }
      }
      if (breakOut) break;
    }
  });
}

function tryMove(piece, square) {
  whiteToMove = !whiteToMove;
  const [, row, column] = square.id.split("-");
  const pos = row + "-" + column;
  movePiecetoPos(piece.id, pos);
  unloadPieceFromPos(piece.id);
  loadPiecetoPos(pos);
  generatePossibleMoves(pieces);
  return true;
}

if (document.readyState == "loading") {
  document.addEventListener("DOMContentLoaded", main);
} else {
  main();
}