const symbols = ["💎","🔮","💠","💰","👑","⭐","🔔","🍇","🍒","⚡"]; 
let balance = 1000;

const balanceEl = document.getElementById("balance");
const gridEl = document.getElementById("slotGrid");
const messageEl = document.getElementById("message");
const spinBtn = document.getElementById("spinBtn");

const spinSound = document.getElementById("spinSound");
const winSound = document.getElementById("winSound");
const scatterSound = document.getElementById("scatterSound");

const rows = 5;
const cols = 6;
let grid = [];

let freeSpins = 0;

function generateGrid() {
  grid = [];
  for (let r = 0; r < rows; r++) {
    let row = [];
    for (let c = 0; c < cols; c++) {
      row.push(symbols[Math.floor(Math.random() * symbols.length)]);
    }
    grid.push(row);
  }
}

function renderGrid() {
  gridEl.innerHTML = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const div = document.createElement("div");
      div.classList.add("symbol");
      div.textContent = grid[r][c];
      if (grid[r][c] === "⚡") div.classList.add("scatter");
      gridEl.appendChild(div);
    }
  }
}

function findWins() {
  const counts = {};
  let scatterCount = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const sym = grid[r][c];
      if (sym === "⚡") {
        scatterCount++;
        continue;
      }
      counts[sym] = (counts[sym] || []);
      counts[sym].push({r, c});
    }
  }

  if (scatterCount >= 4) return { scatter: scatterCount };

  for (let sym in counts) {
    if (counts[sym].length >= 8) {
      return { symbol: sym, cells: counts[sym] };
    }
  }
  return null;
}

function applyTumble(winners) {
  return new Promise(resolve => {
    const cells = document.querySelectorAll(".symbol");
    if (winners.cells) {
      winners.cells.forEach(({r, c}) => {
        const idx = r * cols + c;
        cells[idx].classList.add("win");
      });
    }

    setTimeout(() => {
      if (winners.cells) {
        winners.cells.forEach(({r, c}) => {
          grid[r][c] = null;
        });
      }
      for (let c = 0; c < cols; c++) {
        let colSymbols = [];
        for (let r = rows-1; r >= 0; r--) {
          if (grid[r][c]) colSymbols.push(grid[r][c]);
        }
        while (colSymbols.length < rows) {
          colSymbols.push(symbols[Math.floor(Math.random() * symbols.length)]);
        }
        for (let r = rows-1; r >= 0; r--) {
          grid[r][c] = colSymbols[rows-1-r];
        }
      }
      renderGrid();
      resolve();
    }, 600);
  });
}

async function spin() {
  const bet = parseInt(document.getElementById("bet").value);

  if (freeSpins === 0) {
    if (bet > balance || bet <= 0) {
      messageEl.textContent = "❌ Bet tidak valid!";
      return;
    }
    balance -= bet;
    balanceEl.textContent = balance;
    messageEl.textContent = "🎰 Memutar...";
    spinSound.play();
  } else {
    messageEl.textContent = `🎁 Free Spin tersisa: ${freeSpins}`;
    freeSpins--;
  }

  generateGrid();
  renderGrid();

  let totalWin = 0;

  while (true) {
    const winners = findWins();
    if (!winners) break;

    if (winners.scatter) {
      scatterSound.play();
      freeSpins += (freeSpins === 0 ? 10 : 5);
      messageEl.textContent = `⚡ Scatter! Free Spin = ${freeSpins}`;
      break;
    }

    const multi = [2,3,5,10,25,50,100][Math.floor(Math.random()*7)];
    const winAmount = bet * winners.cells.length * multi;
    totalWin += winAmount;
    winSound.play();

    messageEl.textContent = `⚡ ${winners.symbol} ×${winners.cells.length} ×${multi} → +${winAmount} KN`;

    await applyTumble(winners);
  }

  if (totalWin > 0) {
    balance += totalWin;
    balanceEl.textContent = balance;
    messageEl.textContent += ` 🎉 Total Menang: ${totalWin} KN`;
  }

  if (freeSpins > 0) {
    setTimeout(spin, 1200);
  }
}

spinBtn.addEventListener("click", spin);

// tampilkan grid pertama kali
generateGrid();
renderGrid();
