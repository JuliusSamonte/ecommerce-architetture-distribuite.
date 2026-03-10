const express = require('express');
const cors = require('cors');
require('dotenv').config();
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || '*';

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || FRONTEND_URL === '*') return callback(null, true);
    const allowed = FRONTEND_URL.split(',').map(v => v.trim());
    if (allowed.includes(origin)) return callback(null, true);
    return callback(new Error('Origin non consentita da CORS'));
  }
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'E-Commerce API online' });
});

app.get('/api/health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', dbTime: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ error: 'Database non raggiungibile' });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, description, price_credits, stock FROM products ORDER BY id ASC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero prodotti' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query("SELECT id, name, credits FROM users ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero utenti' });
  }
});

app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT id, name, credits FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero utente' });
  }
});

app.get('/api/purchases', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, u.name AS user_name, pr.name AS product_name, p.quantity, p.total_price, p.created_at
      FROM purchases p
      JOIN users u ON p.user_id = u.id
      JOIN products pr ON p.product_id = pr.id
      ORDER BY p.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Errore nel recupero acquisti' });
  }
});

app.post('/api/purchase', async (req, res) => {
  const { userId, productId } = req.body;

  if (!userId || !productId) {
    return res.status(400).json({ error: 'userId e productId sono obbligatori' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const userResult = await client.query('SELECT id, name, credits FROM users WHERE id = $1 FOR UPDATE', [userId]);
    const productResult = await client.query('SELECT id, name, price_credits, stock FROM products WHERE id = $1 FOR UPDATE', [productId]);

    if (userResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    if (productResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Prodotto non trovato' });
    }

    const user = userResult.rows[0];
    const product = productResult.rows[0];

    if (product.stock <= 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Prodotto esaurito' });
    }

    if (user.credits < product.price_credits) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Crediti insufficienti' });
    }

    const newCredits = user.credits - product.price_credits;
    const newStock = product.stock - 1;

    await client.query('UPDATE users SET credits = $1 WHERE id = $2', [newCredits, userId]);
    await client.query('UPDATE products SET stock = $1 WHERE id = $2', [newStock, productId]);
    await client.query(
      'INSERT INTO purchases (user_id, product_id, quantity, total_price) VALUES ($1, $2, $3, $4)',
      [userId, productId, 1, product.price_credits]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Acquisto completato',
      user: { id: user.id, name: user.name, credits: newCredits },
      product: { id: product.id, name: product.name, stock: newStock }
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Errore durante l\'acquisto' });
  } finally {
    client.release();
  }
});

app.post('/api/products', async (req, res) => {
  const { name, description, priceCredits, stock } = req.body;

  if (!name || !description || priceCredits === undefined || stock === undefined) {
    return res.status(400).json({ error: 'Tutti i campi sono obbligatori' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO products (name, description, price_credits, stock) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, description, Number(priceCredits), Number(stock)]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Errore durante la creazione del prodotto' });
  }
});

app.patch('/api/products/:id/stock', async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;

  if (stock === undefined || Number(stock) < 0) {
    return res.status(400).json({ error: 'Stock non valido' });
  }

  try {
    const result = await pool.query(
      'UPDATE products SET stock = $1 WHERE id = $2 RETURNING id, name, stock',
      [Number(stock), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Prodotto non trovato' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Errore nell\'aggiornamento stock' });
  }
});

app.patch('/api/users/:id/credits', async (req, res) => {
  const { id } = req.params;
  const { bonus } = req.body;

  if (bonus === undefined || Number.isNaN(Number(bonus))) {
    return res.status(400).json({ error: 'Bonus non valido' });
  }

  try {
    const result = await pool.query(
      'UPDATE users SET credits = credits + $1 WHERE id = $2 RETURNING id, name, credits',
      [Number(bonus), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utente non trovato' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Errore nell\'aggiornamento crediti' });
  }
});

app.use((err, req, res, next) => {
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({ error: err.message });
  }
  res.status(500).json({ error: 'Errore interno del server' });
});

app.listen(PORT, () => {
  console.log(`Server attivo sulla porta ${PORT}`);
});
