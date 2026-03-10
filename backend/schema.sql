DROP TABLE IF EXISTS purchases;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  credits INTEGER NOT NULL DEFAULT 0 CHECK (credits >= 0)
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT NOT NULL,
  price_credits INTEGER NOT NULL CHECK (price_credits >= 0),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0)
);

CREATE TABLE purchases (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  total_price INTEGER NOT NULL CHECK (total_price >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO users (name, credits) VALUES
('Mario Rossi', 120),
('Luigi Bianchi', 80),
('Giulia Verdi', 200);

INSERT INTO products (name, description, price_credits, stock) VALUES
('Cuffie Wireless', 'Cuffie bluetooth base per lo studio', 60, 5),
('Mouse Gaming', 'Mouse con sensore ottico', 40, 8),
('Tastiera Meccanica', 'Tastiera meccanica compatta', 90, 3),
('Webcam HD', 'Webcam 1080p per videochiamate', 70, 4);
