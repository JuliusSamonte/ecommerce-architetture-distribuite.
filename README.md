# E-Commerce Distribuito - Compito Architetture Distribuite

## 1. Architettura
Il frontend realizzato è un **Thin Client**.

Motivazione:
- il browser si occupa solo di interfaccia e chiamate `fetch()`;
- tutta la logica critica è sul server;
- il backend controlla disponibilità prodotto, crediti utente e aggiornamenti del database;
- il client non può forzare acquisti invalidi perché il controllo finale è lato server.

## 2. Endpoint API
- `GET /api/health` -> verifica stato server e database
- `GET /api/products` -> ritorna catalogo prodotti
- `GET /api/users` -> ritorna utenti demo
- `GET /api/users/:id` -> ritorna dati del singolo utente
- `GET /api/purchases` -> ritorna cronologia acquisti
- `POST /api/purchase` -> esegue un acquisto
- `POST /api/products` -> aggiunge un nuovo prodotto
- `PATCH /api/products/:id/stock` -> modifica lo stock di un prodotto
- `PATCH /api/users/:id/credits` -> assegna bonus crediti a un utente

## 3. Sicurezza
Controlli implementati lato server:
- blocco dell'acquisto se il prodotto non esiste (`404`)
- blocco dell'acquisto se l'utente non esiste (`404`)
- blocco dell'acquisto se lo stock è uguale o inferiore a zero (`409`)
- blocco dell'acquisto se i crediti dell'utente sono insufficienti (`409`)
- transazione SQL con `BEGIN / COMMIT / ROLLBACK`
- lock delle righe con `FOR UPDATE` durante l'acquisto
- validazione dei payload JSON nelle rotte admin
- CORS configurato per consentire solo il frontend autorizzato

## 4. Uso dell'IA
L'IA è stata usata per:
- progettazione iniziale della struttura client/server
- scrittura e revisione del codice Express e JavaScript vanilla
- supporto nella definizione delle API REST
- verifica dei controlli lato server
- supporto nella stesura del README

## 5. Link
Da completare dopo il deploy:
- Backend Render: `https://TUO-SERVIZIO.onrender.com`
- Frontend GitHub Pages: `https://TUO-USERNAME.github.io/TUO-REPO/frontend/`

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
