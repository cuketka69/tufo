import process from "node:process";
import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";

// Server-only SQLite layer. The `.server.ts` suffix keeps better-sqlite3 (a
// native module) out of the client bundle. A single connection is reused
// across requests via a module-scoped singleton.

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

  const db = new Database(path.join(dataDir, "eshop.db"));
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");

  migrate(db);
  seed(db);

  _db = db;
  return db;
}

function migrate(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      slug       TEXT NOT NULL UNIQUE,
      name       TEXT NOT NULL,
      image      TEXT,
      sort       INTEGER NOT NULL DEFAULT 0,
      group_key  TEXT NOT NULL DEFAULT 'pneu',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS products (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      sku         TEXT NOT NULL UNIQUE,
      name        TEXT NOT NULL,
      type        TEXT NOT NULL,
      category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
      price       INTEGER NOT NULL DEFAULT 0,
      training    INTEGER NOT NULL DEFAULT 0,
      racing      INTEGER NOT NULL DEFAULT 0,
      stock       INTEGER NOT NULL DEFAULT 0,
      image       TEXT,
      description TEXT,
      color       TEXT,
      featured    INTEGER NOT NULL DEFAULT 0,
      active      INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS customers (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      name       TEXT NOT NULL,
      email      TEXT NOT NULL UNIQUE,
      phone      TEXT,
      address    TEXT,
      city       TEXT,
      zip        TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT NOT NULL UNIQUE,
      customer_id  INTEGER REFERENCES customers(id) ON DELETE SET NULL,
      status       TEXT NOT NULL DEFAULT 'nová',
      total        INTEGER NOT NULL DEFAULT 0,
      note         TEXT,
      created_at   TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS order_items (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
      name       TEXT NOT NULL,
      price      INTEGER NOT NULL,
      qty        INTEGER NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
    CREATE INDEX IF NOT EXISTS idx_orders_customer ON orders(customer_id);
    CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
    CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
  `);

  // Lehká migrace: doplnění sloupců do již existujících databází.
  const cols = db.prepare("PRAGMA table_info(products)").all() as { name: string }[];
  if (!cols.some((c) => c.name === "color")) {
    db.exec("ALTER TABLE products ADD COLUMN color TEXT");
  }
  const catCols = db.prepare("PRAGMA table_info(categories)").all() as { name: string }[];
  if (!catCols.some((c) => c.name === "group_key")) {
    db.exec("ALTER TABLE categories ADD COLUMN group_key TEXT NOT NULL DEFAULT 'pneu'");
  }
}

// Sekce → kategorie (musí odpovídat src/lib/taxonomy.ts)
const SEED_CATEGORIES = [
  { slug: "silnice", name: "Silnice", group: "pneu" },
  { slug: "gravel", name: "Gravel", group: "pneu" },
  { slug: "mtb", name: "MTB", group: "pneu" },
  { slug: "cyklokros", name: "Cyklokros", group: "pneu" },
  { slug: "triatlon", name: "Triatlon", group: "pneu" },
  { slug: "draha", name: "Dráha", group: "pneu" },
  { slug: "voziky", name: "Vozíčky", group: "pneu" },
  { slug: "kolova", name: "Kolová / krasojízda", group: "pneu" },
  { slug: "tmely", name: "Tmely a lepení", group: "prislusenstvi" },
  { slug: "ventilky", name: "Ventilky", group: "prislusenstvi" },
  { slug: "duse", name: "Duše", group: "prislusenstvi" },
  { slug: "rafkove-pasky", name: "Ráfkové pásky", group: "prislusenstvi" },
  { slug: "nahradni-dily", name: "Náhradní díly", group: "prislusenstvi" },
];

const SEED_PRODUCTS = [
  { sku: "TUF-S33", name: "Tufo S33 Pro", type: "Galusky", category: "silnice", price: 1490, training: 60, racing: 95, stock: 42, featured: 1, color: "Černá" },
  { sku: "TUF-CAL", name: "Tufo Calibra Plus", type: "Plášťovky", category: "silnice", price: 890, training: 75, racing: 85, stock: 88, featured: 0, color: "Černá" },
  { sku: "TUF-GSP", name: "Tufo Gravel Speedero", type: "Bezdušové TR", category: "gravel", price: 1290, training: 80, racing: 80, stock: 31, featured: 1, color: "Hnědá" },
  { sku: "TUF-XC6", name: "Tufo XC6 TR", type: "Bezdušové TR", category: "mtb", price: 1390, training: 70, racing: 90, stock: 17, featured: 0, color: "Černá" },
  { sku: "TUF-ELR", name: "Tufo Elite Ride", type: "Galusky", category: "silnice", price: 1690, training: 50, racing: 98, stock: 9, featured: 1, color: "Bílá" },
  { sku: "TUF-HIC", name: "Tufo C Hi-Composite", type: "Pláště", category: "cyklokros", price: 990, training: 85, racing: 75, stock: 64, featured: 0, color: "Oranžová" },
  { sku: "TUF-CMD", name: "Tufo Comtura Duo", type: "Plášťovky", category: "triatlon", price: 1190, training: 70, racing: 88, stock: 23, featured: 0, color: "Bílá" },
  { sku: "TUF-LEP", name: "Tufo Lepenka tmel", type: "Příslušenství", category: "tmely", price: 290, training: 90, racing: 60, stock: 120, featured: 0, color: null },
  { sku: "TUF-VENT", name: "Tufo Galuskový ventilek", type: "Příslušenství", category: "ventilky", price: 90, training: 0, racing: 0, stock: 200, featured: 0, color: null },
];

function seed(db: Database.Database) {
  // Kategorie sjednotíme vždy (idempotentně) — i pro existující databáze.
  const insertCat = db.prepare(
    "INSERT OR IGNORE INTO categories (slug, name, sort, group_key) VALUES (@slug, @name, @sort, @group)",
  );
  const updateCat = db.prepare("UPDATE categories SET group_key = @group WHERE slug = @slug");
  const ensureCats = db.transaction(() => {
    SEED_CATEGORIES.forEach((c, i) => {
      insertCat.run({ ...c, sort: i });
      updateCat.run({ slug: c.slug, group: c.group });
    });
  });
  ensureCats();

  // Produkty seedujeme jen při prázdné databázi.
  const count = db.prepare("SELECT COUNT(*) AS n FROM products").get() as { n: number };
  if (count.n > 0) return;

  const insertProd = db.prepare(`
    INSERT INTO products (sku, name, type, category_id, price, training, racing, stock, color, featured, active)
    VALUES (@sku, @name, @type, @category_id, @price, @training, @racing, @stock, @color, @featured, 1)
  `);

  const catBySlug = new Map(
    (db.prepare("SELECT id, slug FROM categories").all() as { id: number; slug: string }[]).map(
      (c) => [c.slug, c.id],
    ),
  );

  const tx = db.transaction(() => {
    for (const p of SEED_PRODUCTS) {
      insertProd.run({
        sku: p.sku,
        name: p.name,
        type: p.type,
        category_id: p.category ? (catBySlug.get(p.category) ?? null) : null,
        price: p.price,
        training: p.training,
        racing: p.racing,
        stock: p.stock,
        color: p.color ?? null,
        featured: p.featured,
      });
    }
  });
  tx();
}
