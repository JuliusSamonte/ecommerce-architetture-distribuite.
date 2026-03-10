const addProductForm = document.getElementById('addProductForm');
const bonusForm = document.getElementById('bonusForm');
const bonusUserSelect = document.getElementById('bonusUserSelect');
const stockTableBody = document.getElementById('stockTableBody');
const purchasesTableBody = document.getElementById('purchasesTableBody');
const adminMessage = document.getElementById('adminMessage');

async function fetchJSON(url, options = {}) {
  const response = await fetch(url, options);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Errore richiesta');
  return data;
}

async function loadUsers() {
  const users = await fetchJSON(`${API_BASE_URL}/api/users`);
  bonusUserSelect.innerHTML = users.map(user => `
    <option value="${user.id}">${user.name} (${user.credits} crediti)</option>
  `).join('');
}

async function loadProducts() {
  const products = await fetchJSON(`${API_BASE_URL}/api/products`);
  stockTableBody.innerHTML = products.map(product => `
    <tr>
      <td>${product.id}</td>
      <td>${product.name}</td>
      <td>${product.stock}</td>
      <td><input type="number" min="0" id="stock-${product.id}" value="${product.stock}" /></td>
      <td><button onclick="updateStock(${product.id})">Salva</button></td>
    </tr>
  `).join('');
}

async function loadPurchases() {
  const purchases = await fetchJSON(`${API_BASE_URL}/api/purchases`);
  purchasesTableBody.innerHTML = purchases.map(item => `
    <tr>
      <td>${item.user_name}</td>
      <td>${item.product_name}</td>
      <td>${item.quantity}</td>
      <td>${item.total_price}</td>
    </tr>
  `).join('');
}

async function updateStock(productId) {
  const stock = document.getElementById(`stock-${productId}`).value;
  try {
    const result = await fetchJSON(`${API_BASE_URL}/api/products/${productId}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: Number(stock) })
    });
    adminMessage.className = 'success';
    adminMessage.textContent = `Stock aggiornato: ${result.name} -> ${result.stock}`;
    await loadProducts();
  } catch (error) {
    adminMessage.className = 'error';
    adminMessage.textContent = error.message;
  }
}

addProductForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    await fetchJSON(`${API_BASE_URL}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        priceCredits: Number(document.getElementById('productPrice').value),
        stock: Number(document.getElementById('productStock').value)
      })
    });
    adminMessage.className = 'success';
    adminMessage.textContent = 'Prodotto aggiunto con successo';
    addProductForm.reset();
    await loadProducts();
  } catch (error) {
    adminMessage.className = 'error';
    adminMessage.textContent = error.message;
  }
});

bonusForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const userId = bonusUserSelect.value;
    const bonus = Number(document.getElementById('bonusCredits').value);
    const result = await fetchJSON(`${API_BASE_URL}/api/users/${userId}/credits`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bonus })
    });
    adminMessage.className = 'success';
    adminMessage.textContent = `Bonus assegnato. ${result.name} ora ha ${result.credits} crediti.`;
    bonusForm.reset();
    await loadUsers();
  } catch (error) {
    adminMessage.className = 'error';
    adminMessage.textContent = error.message;
  }
});

async function init() {
  try {
    await loadUsers();
    await loadProducts();
    await loadPurchases();
  } catch (error) {
    adminMessage.className = 'error';
    adminMessage.textContent = error.message;
  }
}

init();
