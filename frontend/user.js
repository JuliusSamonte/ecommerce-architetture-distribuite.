const userSelect = document.getElementById('userSelect');
const userCredits = document.getElementById('userCredits');
const userMessage = document.getElementById('userMessage');
const productList = document.getElementById('productList');
const statusMessage = document.getElementById('statusMessage');

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Errore richiesta');
  return data;
}

async function loadUsers() {
  const users = await fetchJSON(`${API_BASE_URL}/api/users`);
  userSelect.innerHTML = users.map(user => `
    <option value="${user.id}">${user.name}</option>
  `).join('');
  await loadSelectedUser();
}

async function loadSelectedUser() {
  const userId = userSelect.value;
  if (!userId) return;
  const user = await fetchJSON(`${API_BASE_URL}/api/users/${userId}`);
  userCredits.textContent = `${user.credits} crediti`;
  userMessage.textContent = `Utente selezionato: ${user.name}`;
}

async function loadProducts() {
  const products = await fetchJSON(`${API_BASE_URL}/api/products`);
  productList.innerHTML = products.map(product => `
    <div class="card">
      <h3>${product.name}</h3>
      <p>${product.description}</p>
      <p><strong>Prezzo:</strong> ${product.price_credits} crediti</p>
      <p><strong>Stock:</strong> ${product.stock}</p>
      <button onclick="buyProduct(${product.id})">Acquista</button>
    </div>
  `).join('');
}

async function buyProduct(productId) {
  const userId = userSelect.value;
  statusMessage.className = '';
  statusMessage.textContent = 'Acquisto in corso...';

  try {
    const result = await fetchJSON(`${API_BASE_URL}/api/purchase`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: Number(userId), productId })
    });

    statusMessage.className = 'success';
    statusMessage.textContent = result.message;
    await loadSelectedUser();
    await loadProducts();
  } catch (error) {
    statusMessage.className = 'error';
    statusMessage.textContent = error.message;
  }
}

userSelect.addEventListener('change', loadSelectedUser);

async function init() {
  try {
    await loadUsers();
    await loadProducts();
  } catch (error) {
    statusMessage.className = 'error';
    statusMessage.textContent = error.message;
  }
}

init();
