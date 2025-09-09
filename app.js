const symbols = ["💎","🔮","💠","💰","👑","⭐","🔔","🍇","🍒","⚡"]; 
let balance = 1000;

const balanceEl = document.getElementById("balance");
const gridEl = document.getElementById("slotGrid");
const messageEl = document.getElementById("message");
const spinBtn = document.getElementById("spinBtn");

// audio
const spinSound = document.getElementById("spinSound");
const winSound = document.getElementById("winSound");
const scatterSound = document.getElementById("scatterSound");

// ukuran grid 6x5
const rows = 5;
const cols = 6;
let grid = [];

// daftar multiplier
const multipliers = [2, 3, 5, 10, 25, 50, 100];

// state free spin
let freeSpins = 0;

// Buat grid acak
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

// Render ke HTML
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

// Cari kombinasi menang (≥8 sama, selain scatter)
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

  // scatter check
  if (scatterCount >= 4) {
    return { scatter: scatterCount };
  }

  // simbol normal
  let winners = null;
  for (let sym in counts) {
    if (counts[sym].length >= 8) {
      winners = { symbol: sym, cells: counts[sym] };
      break;
    }
  }
  return winners;
}

// Hilangkan simbol menang + tumble
function applyTumble(winners) {
  return new Promise(resolve => {
    // highlight dulu
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

      // tumble
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
  let tumbleCount = 0;

  while (true) {
    const winners = findWins();
    if (!winners) break;

    // scatter trigger
    if (winners.scatter) {
      scatterSound.play();
      if (freeSpins === 0) {
        freeSpins = 10;
        messageEl.textContent = `⚡ SCATTER ${winners.scatter}x! Free Spin dimulai (10)`;
      } else {
        freeSpins += 5;
        messageEl.textContent = `⚡ Retrigger! Tambah +5 Free Spin (${freeSpins})`;
      }
      break;
    }

    tumbleCount++;
    const multi = multipliers[Math.floor(Math.random() * multipliers.length)];
    const winAmount = bet * winners.cells.length * multi;
    totalWin += winAmount;

    messageEl.textContent = `⚡ Tumble ${tumbleCount}: ${winners.symbol} ×${winners.cells.length} ×${multi} → +${winAmount} KN`;
    winSound.play();

    await applyTumble(winners);
  }

  if (totalWin > 0) {
    balance += totalWin;
    balanceEl.textContent = balance;
    messageEl.textContent += ` 🎉 Total Menang: ${totalWin} KN`;
  }

  if (freeSpins > 0) {
    setTimeout(spin, 1200); // auto jalan kalau free spin masih ada
  }
}

spinBtn.addEventListener("click", spin);

// tampilkan awal
generateGrid();
renderGrid();
