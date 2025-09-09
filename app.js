const symbols = ["💎","💍","👑","⭐","🍇","🍒","🔔"];
const rows = 5;
const cols = 6;
let balance = 1000;
let bet = 10;

const gridEl = document.getElementById("grid");
const balanceEl = document.getElementById("balance");
const spinBtn = document.getElementById("spinBtn");
const lightning = document.querySelector(".lightning");

const soundSpin = document.getElementById("sound-spin");
const soundThunder = document.getElementById("sound-thunder");

let grid = [];

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

function renderGrid(withDrop = true) {
  gridEl.innerHTML = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const div = document.createElement("div");
      div.classList.add("symbol");
      if (withDrop) div.classList.add("drop");
      div.textContent = grid[r][c];
      gridEl.appendChild(div);
    }
  }
}

function spin() {
  if (balance < bet) {
    alert("Saldo tidak cukup!");
    return;
  }
  balance -= bet;
  balanceEl.textContent = balance;

  // mainkan suara spin
  soundSpin.currentTime = 0;
  soundSpin.play();

  // generate baru
  generateGrid();
  renderGrid(true);

  // cek menang
  setTimeout(() => checkWin(), 600);
}

function checkWin() {
  let win = 0;
  let cells = document.querySelectorAll(".symbol");

  for (let r = 0; r < rows; r++) {
    let first = grid[r][0];
    if (grid[r].every(sym => sym === first)) {
      win += bet * 5;

      // animasi pecah
      for (let c = 0; c < cols; c++) {
        let idx = r * cols + c;
        cells[idx].classList.add("explode");
      }

      // efek petir
      lightning.classList.add("flash");
      setTimeout(() => lightning.classList.remove("flash"), 400);

      // suara thunder
      setTimeout(() => {
        soundThunder.currentTime = 0;
        soundThunder.play();
      }, 200);
    }
  }

  if (win > 0) {
    balance += win;
    setTimeout(() => {
      balanceEl.textContent = balance;
    }, 600);
  }
}

spinBtn.addEventListener("click", spin);

// awal
generateGrid();
renderGrid(false);
