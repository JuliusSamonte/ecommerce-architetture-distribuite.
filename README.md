# E-Commerce Distribuito - Compito Architetture Distribuite

## 1. Architettura
Thin Client: il frontend invia richieste API al backend,
mentre tutta la logica di business e sicurezza è implementata nel server Node.js.

## 2. Endpoint API
GET /api/products -> ritorna il catalogo prodotti

GET /api/users -> ritorna gli utenti

POST /api/purchase -> acquista un prodotto

POST /api/admin/product -> aggiunge un prodotto

POST /api/admin/credits -> aggiunge crediti ad un utente

## 3. Sicurezza
Il backend verifica che:

- l'utente abbia crediti sufficienti
- il prodotto abbia stock disponibile
- le transazioni vengano eseguite atomicamente

In caso contrario l'API restituisce errori HTTP appropriati.
## 4. Uso dell'IA
L'IA è stata utilizzata per supporto nella scrittura del codice,
debug delle API e configurazione dei servizi cloud
(Render, Supabase e GitHub Pages).
## 5. Link
Backend:
https://ecommerce-backend-h83g.onrender.com

Frontend:
https://juliussamonte.github.io/ecommerce-architetture-distribuite.

## Avvio locale backend
```bash
cd backend
npm install
cp .env.example .env
# modifica DATABASE_URL e FRONTEND_URL
npm start
```

## Avvio frontend
Apri `frontend/index.html` e `frontend/admin.html` con Live Server oppure un server statico locale.

## Setup database
Apri Supabase > SQL Editor e incolla il contenuto di `backend/schema.sql`.
