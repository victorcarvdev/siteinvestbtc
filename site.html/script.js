let user = null;
let wallets = [];
let history = [];
let btcPrice = 0;
let chart;

// =====================
// 🔐 LOGIN LOCAL
// =====================
function register() {
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;

  if (!email || !pass) return alert("Preencha tudo");

  localStorage.setItem("user", JSON.stringify({ email, pass }));
  alert("Conta criada!");
}

function login() {
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;

  const saved = JSON.parse(localStorage.getItem("user"));

  if (saved && saved.email === email && saved.pass === pass) {
    user = saved;

    document.getElementById('auth').style.display = 'none';
    document.getElementById('app').style.display = 'block';

    loadData();
  } else {
    alert("Login inválido");
  }
}

function logout() {
  user = null;
  document.getElementById('auth').style.display = 'block';
  document.getElementById('app').style.display = 'none';
}

// =====================
// 💰 BTC API
// =====================
async function getBTC() {
  const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl');
  const data = await res.json();
  btcPrice = data.bitcoin.brl;
}

// =====================
// 💾 STORAGE LOCAL
// =====================
function saveData() {
  if (!user) return;

  localStorage.setItem(user.email + "_wallets", JSON.stringify(wallets));
  localStorage.setItem(user.email + "_history", JSON.stringify(history));
}

function loadData() {
  wallets = JSON.parse(localStorage.getItem(user.email + "_wallets")) || [];
  history = JSON.parse(localStorage.getItem(user.email + "_history")) || [];

  render();
}

// =====================
// ➕ CARTEIRA
// =====================
function createWallet() {
  const name = document.getElementById('walletName').value;

  if (!name) return alert("Nome obrigatório");

  wallets.push({
    name,
    btc: 0,
    invested: 0
  });

  saveData();
  render();
}

// =====================
// 💵 COMPRA
// =====================
function buy(index) {
  const value = parseFloat(prompt('Valor R$'));

  if (!value || value <= 0) return;

  const btc = value / btcPrice;

  wallets[index].btc += btc;
  wallets[index].invested += value;

  history.push(`Comprou R$${value.toFixed(2)}`);

  saveData();
  render();
}

// =====================
// 💸 VENDA
// =====================
function sell(index) {
  const value = parseFloat(prompt('Valor R$'));

  if (!value || value <= 0) return;

  const btc = value / btcPrice;

  wallets[index].btc -= btc;
  wallets[index].invested -= value;

  history.push(`Vendeu R$${value.toFixed(2)}`);

  saveData();
  render();
}

// =====================
// 📊 GRÁFICO
// =====================
function renderChart() {
  const ctx = document.getElementById('chart');

  const data = wallets.map(w => w.btc * btcPrice);
  const labels = wallets.map(w => w.name);

  if (chart) chart.destroy();

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Valor em R$',
        data
      }]
    }
  });
}

// =====================
// 🧾 HISTÓRICO
// =====================
function renderHistory() {
  const ul = document.getElementById('history');
  ul.innerHTML = '';

  history.forEach(h => {
    ul.innerHTML += `<li>${h}</li>`;
  });
}

// =====================
// 🧠 RENDER GERAL
// =====================
async function render() {
  await getBTC();

  const div = document.getElementById('wallets');
  div.innerHTML = '';

  wallets.forEach((w, i) => {
    const avg = w.invested / w.btc || 0;

    div.innerHTML += `
      <div class="card">
        <h3>${w.name}</h3>
        <p>BTC: ${w.btc.toFixed(6)}</p>
        <p>R$: ${(w.btc * btcPrice).toFixed(2)}</p>
        <p>Preço médio: R$ ${avg.toFixed(2)}</p>

        <button onclick="buy(${i})">Comprar</button>
        <button onclick="sell(${i})">Vender</button>
      </div>
    `;
  });

  renderChart();
  renderHistory();
}