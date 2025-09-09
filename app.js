// Symbols set
const SYMBOLS = ["🍒","🔔","⭐","🍋","💎","7️⃣"];

// Paytable
const PAYTABLE = {
  '⭐,⭐,⭐': 100,
  '🍒,🍒,🍒': 10,
  '🔔,🔔,🔔': 5,
};

let balance = 1000;
let isSpinning = false;
let autoMode = false;

const balanceEl = document.getElementById('balance');
const betInput = document.getElementById('betInput');
const spinBtn = document.getElementById('spinBtn');
const autoBtn = document.getElementById('autoBtn');
const statusEl = document.getElementById('status');
const historyEl = document.getElementById('history');
const lastWinEl = document.getElementById('lastWin');

function formatNumber(n){ return n.toLocaleString('id-ID'); }
function updateUI(){ balanceEl.textContent = formatNumber(balance); }

function populateReel(reel){
  const container = reel.querySelector('.symbols');
  container.innerHTML = '';
  for(let i=0;i<12;i++){
    const s = document.createElement('div');
    s.className = 'symbol';
    s.textContent = SYMBOLS[Math.floor(Math.random()*SYMBOLS.length)];
    container.appendChild(s);
  }
  container.style.top = '0px';
}

const reels = [document.getElementById('reel1'), document.getElementById('reel2'), document.getElementById('reel3')];
reels.forEach(populateReel);
updateUI();

function spinOnce(){
  if(isSpinning) return;
  const bet = Math.max(1, Math.floor(Number(betInput.value) || 1));
  if(bet > balance){ alert('Saldo tidak cukup.'); return; }

  isSpinning = true; statusEl.textContent = 'Berputar...';
  balance -= bet; updateUI();

  const targets = [];
  for(let i=0;i<3;i++){
    const r = Math.random();
    if(r < 0.01) targets.push('⭐');
    else if(r < 0.08) targets.push('7️⃣');
    else if(r < 0.25) targets.push('💎');
    else if(r < 0.45) targets.push('🔔');
    else if(r < 0.70) targets.push('🍒');
    else targets.push('🍋');
  }

  const spinPromises = reels.map((reel, idx) => new Promise(resolve => {
    const symbolsEl = reel.querySelector('.symbols');
    const finalTop = targets[idx];
    const stack = [];
    for(let i=0;i<14;i++){ stack.push(i===8 ? finalTop : SYMBOLS[Math.floor(Math.random()*SYMBOLS.length)]); }
    symbolsEl.innerHTML = '';
    stack.forEach(s => {
      const d = document.createElement('div'); d.className='symbol'; d.textContent = s; symbolsEl.appendChild(d);
    });

    const symbolHeight = symbolsEl.querySelector('.symbol').offsetHeight || 70;
    const targetOffset = -symbolHeight * 8;
    const duration = 900 + idx*220 + Math.floor(Math.random()*200);
    symbolsEl.style.transition = `transform ${duration}ms cubic-bezier(.08,.77,.36,1)`;

    requestAnimationFrame(()=>{ symbolsEl.style.transform = `translateY(${targetOffset}px)`; });

    setTimeout(()=>{
      symbolsEl.style.transition = '';
      symbolsEl.style.transform = '';
      populateReel(reel);
      const first = reel.querySelectorAll('.symbol');
      if(first.length>=3){ first[1].textContent = finalTop; }
      resolve(targets[idx]);
    }, duration + 60);
  }));

  Promise.all(spinPromises).then(results => {
    isSpinning = false; statusEl.textContent = 'Siap';
    const key = results.join(',');
    let multiplier = 0;
    if(PAYTABLE[key]) multiplier = PAYTABLE[key];
    else if(results[0] === results[1] || results[1] === results[2] || results[0] === results[2]) multiplier = 2;

    const winAmount = Math.floor(bet * multiplier);
    if(winAmount>0){
      balance += winAmount; updateUI();
      lastWinEl.textContent = `+${formatNumber(winAmount)}`;
      appendHistory(`Win ${formatNumber(winAmount)} — [${results.join(' ')}]`);
    } else {
      lastWinEl.textContent = '—';
      appendHistory(`Lose — [${results.join(' ')}]`);
    }

    if(autoMode && balance >= Math.max(1, Number(betInput.value))){
      setTimeout(spinOnce, 450);
    } else {
      autoMode = false; autoBtn.textContent = 'AUTO';
    }
  });
}

function appendHistory(text){
  const d = document.createElement('div');
  d.textContent = `${new Date().toLocaleTimeString('id-ID')} · ${text}`;
  historyEl.prepend(d);
  while(historyEl.childElementCount>60) historyEl.removeChild(historyEl.lastChild);
}

spinBtn.addEventListener('click', ()=>{ spinOnce(); });
autoBtn.addEventListener('click', ()=>{
  if(autoMode){ autoMode=false; autoBtn.textContent='AUTO'; }
  else { autoMode=true; autoBtn.textContent='STOP'; spinOnce(); }
});

document.getElementById('addCoins').addEventListener('click', ()=>{ balance += 100; updateUI(); appendHistory('Added +100 coins'); });
document.getElementById('resetBtn').addEventListener('click', ()=>{ if(confirm('Reset saldo ke 1000?')){ balance=1000; updateUI(); historyEl.innerHTML=''; appendHistory('Reset balance'); lastWinEl.textContent='—'; } });
betInput.addEventListener('keydown', e=>{ if(e.key==='Enter'){ spinOnce(); } });

appendHistory('Selamat datang di KenariSlot (demo)');
console.log('KenariSlot demo — tidak memproses pembayaran.');
