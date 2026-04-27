let user = null;
let wallets = [];
let history = [];
let btcPrice = 0;
let chart;

// 🔐 AUTH
function register() {
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;

  auth.createUserWithEmailAndPassword(email, pass)
    .then(() => alert("Conta criada!"))
    .catch(err => alert(err.message));
}

function login() {
  const email = document.getElementById('email').value;
  const pass = document.getElementById('password').value;

  auth.signInWithEmailAndPassword(email, pass)
    .catch(err => alert(err.message));
}

auth.onAuthStateChanged(u => {
  if (u) {
    user = u;
    document.getElementById('auth').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    loadData();
  }
});

// 💰 BTC
async function getBTC() {
  const res = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl');
  const data = await res.json();
  btcPrice = data.bitcoin.brl;
}

// 💾 BANCO
async function saveData() {
  await db.collection('users').doc(user.uid).set({
    wallets,
    history
  });
}

async function loadData() {
  const doc = await db.collection('users').doc(user.uid).get();
  if (doc.exists) {
    wallets = doc.data().wallets || [];
    history = doc.data().history || [];
  }
  render();
}

// ➕ carteira
function createWallet() {
  const name = document.getElementById('walletName').value;
  wallets.push({ name, btc: 0, invested: 0 });
  saveData();
  render();
}

// 💵 compra
function buy(index) {
  const value = parseFloat(prompt('Valor R$'));
  const btc = value / btcPrice;

  wallets[index].btc += btc;
  wallets[index].invested += value;

  history.push(`Comprou R$${value}`);
  saveData();
  render();
}

// 💸 venda
function sell(index) {
  const value = parseFloat(prompt('Valor R$'));
  const btc = value / btcPrice;

  wallets[index].btc -= btc;
  wallets[index].invested -= value;

  history.push(`Vendeu R$${value}`);
  saveData();
  render();
}

// 📊 gráfico
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

// 🧾 histórico
function renderHistory() {
  const ul = document.getElementById('history');
  ul.innerHTML = '';

  history.forEach(h => {
    ul.innerHTML += `<li>${h}</li>`;
  });
}

// 🧠 render
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