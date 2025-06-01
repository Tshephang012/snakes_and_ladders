const board = document.getElementById("game-board");
const diceResult = document.getElementById("dice-result");
const turnText = document.getElementById("turn");
const diceDisplay = document.getElementById("dice-display");

let currentPlayer = 1;
const playerPositions = [0, 0];

const snakes = {
  16: 6,
  48: 26,
  64: 60,
  79: 19,
  93: 68,
  95: 24,
  98: 76,
};

const ladders = {
  1: 38,
  4: 14,
  9: 31,
  21: 42,
  28: 84,
  36: 44,
  51: 67,
  71: 91,
  80: 100,
};

// Create cells from 100 down to 1 (serpentine style)
for (let row = 9; row >= 0; row--) {
  const reverse = row % 2 === 1;
  for (let col = 0; col < 10; col++) {
    const cellNum = row * 10 + (reverse ? 9 - col + 1 : col + 1);
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.id = `cell-${cellNum}`;
    cell.innerText = cellNum;
    board.appendChild(cell);
  }
}

function getCellCenter(cellNum) {
  const cell = document.getElementById(`cell-${cellNum}`);
  const rect = cell.getBoundingClientRect();
  const boardRect = board.getBoundingClientRect();
  return {
    x: rect.left - boardRect.left + rect.width / 2,
    y: rect.top - boardRect.top + rect.height / 2,
  };
}

function drawLines() {
  const svg = document.getElementById("svg-lines");
  svg.innerHTML = ""; // Clear previous lines

  // Draw ladders (green)
  for (let start in ladders) {
    drawLine(parseInt(start), ladders[start], "green");
  }

  // Draw snakes (red)
  for (let head in snakes) {
    drawLine(parseInt(head), snakes[head], "red");
  }

  function drawLine(from, to, color) {
    const start = getCellCenter(from);
    const end = getCellCenter(to);
    const line = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "line"
    );
    line.setAttribute("x1", start.x);
    line.setAttribute("y1", start.y);
    line.setAttribute("x2", end.x);
    line.setAttribute("y2", end.y);
    line.setAttribute("stroke", color);
    line.setAttribute("stroke-width", "4");
    line.setAttribute("stroke-linecap", "round");
    svg.appendChild(line);
  }
}

function updateBoard() {
  document.querySelectorAll(".player1, .player2").forEach((p) => p.remove());

  playerPositions.forEach((pos, index) => {
    if (pos === 0) return;
    const player = document.createElement("div");
    player.className = `player${index + 1}`;
    const cell = document.getElementById(`cell-${pos}`);
    cell.appendChild(player);
  });
}

function movePlayerAnimated(playerIdx, steps, callback) {
  let current = playerPositions[playerIdx];
  const target = Math.min(current + steps, 100);

  const move = () => {
    if (current >= target) {
      callback(target);
      return;
    }
    current++;
    playerPositions[playerIdx] = current;
    updateBoard();
    setTimeout(move, 200);
  };

  move();
}

function rollDice() {
  const diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
  let roll = Math.floor(Math.random() * 6) + 1;

  let count = 0;
  const interval = setInterval(() => {
    diceDisplay.textContent = diceFaces[Math.floor(Math.random() * 6)];
    count++;
    if (count >= 10) {
      clearInterval(interval);
      diceDisplay.textContent = diceFaces[roll - 1];
      diceResult.textContent = `Player ${currentPlayer} rolled a ${roll}`;

      movePlayerAnimated(currentPlayer - 1, roll, (newPos) => {
        let finalPos = newPos;
        if (snakes[finalPos]) {
          alert(`Oops! Player ${currentPlayer} hit a snake!`);
          finalPos = snakes[finalPos];
        } else if (ladders[finalPos]) {
          alert(`Yay! Player ${currentPlayer} climbed a ladder!`);
          finalPos = ladders[finalPos];
        }
        playerPositions[currentPlayer - 1] = finalPos;
        updateBoard();

        if (finalPos === 100) {
          alert(`🎉 Player ${currentPlayer} wins!`);
          diceResult.textContent = `Game Over`;
          return;
        }

        currentPlayer = currentPlayer === 1 ? 2 : 1;
        turnText.textContent = `Player ${currentPlayer}'s turn`;
      });
    }
  }, 100);
}

updateBoard();
drawLines();
window.addEventListener("resize", drawLines);
