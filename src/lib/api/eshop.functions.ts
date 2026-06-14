import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getDb } from "@/lib/db.server";
import type { Category, Customer, DashboardStats, Order, OrderItem, Product } from "@/lib/eshop-types";
import { ORDER_STATUSES } from "@/lib/eshop-types";

/* ============================================================= PRODUCTS === */

export const listProducts = createServerFn({ method: "GET" }).handler(async (): Promise<Product[]> => {
  return getDb()
    .prepare(
      `SELECT p.*, c.name AS category_name
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
       ORDER BY p.created_at DESC, p.id DESC`,
    )
    .all() as Product[];
});

export const listActiveProducts = createServerFn({ method: "GET" }).handler(
  async (): Promise<Product[]> => {
    return getDb()
      .prepare(
        `SELECT p.*, c.name AS category_name
         FROM products p LEFT JOIN categories c ON c.id = p.category_id
         WHERE p.active = 1 ORDER BY p.featured DESC, p.id ASC`,
      )
      .all() as Product[];
  },
);

const productInput = z.object({
  sku: z.string().min(1),
  name: z.string().min(1),
  type: z.string().min(1),
  category_id: z.number().int().nullable().optional(),
  price: z.number().int().min(0),
  training: z.number().int().min(0).max(100),
  racing: z.number().int().min(0).max(100),
  stock: z.number().int().min(0),
  image: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  featured: z.boolean().optional(),
  active: z.boolean().optional(),
});

export const createProduct = createServerFn({ method: "POST" })
  .validator(productInput)
  .handler(async ({ data }) => {
    const info = getDb()
      .prepare(
        `INSERT INTO products (sku, name, type, category_id, price, training, racing, stock, image, description, color, featured, active)
         VALUES (@sku, @name, @type, @category_id, @price, @training, @racing, @stock, @image, @description, @color, @featured, @active)`,
      )
      .run({
        sku: data.sku,
        name: data.name,
        type: data.type,
        category_id: data.category_id ?? null,
        price: data.price,
        training: data.training,
        racing: data.racing,
        stock: data.stock,
        image: data.image ?? null,
        description: data.description ?? null,
        color: data.color ?? null,
        featured: data.featured ? 1 : 0,
        active: data.active === false ? 0 : 1,
      });
    return { id: Number(info.lastInsertRowid) };
  });

export const updateProduct = createServerFn({ method: "POST" })
  .validator(productInput.extend({ id: z.number().int() }))
  .handler(async ({ data }) => {
    getDb()
      .prepare(
        `UPDATE products SET sku=@sku, name=@name, type=@type, category_id=@category_id,
           price=@price, training=@training, racing=@racing, stock=@stock,
           image=@image, description=@description, color=@color, featured=@featured, active=@active
         WHERE id=@id`,
      )
      .run({
        id: data.id,
        sku: data.sku,
        name: data.name,
        type: data.type,
        category_id: data.category_id ?? null,
        price: data.price,
        training: data.training,
        racing: data.racing,
        stock: data.stock,
        image: data.image ?? null,
        description: data.description ?? null,
        color: data.color ?? null,
        featured: data.featured ? 1 : 0,
        active: data.active === false ? 0 : 1,
      });
    return { ok: true };
  });

export const deleteProduct = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ data }) => {
    getDb().prepare("DELETE FROM products WHERE id = ?").run(data.id);
    return { ok: true };
  });

/* =========================================================== CATEGORIES === */

export const listCategories = createServerFn({ method: "GET" }).handler(
  async (): Promise<Category[]> => {
    return getDb()
      .prepare(
        `SELECT c.*, (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count
         FROM categories c ORDER BY c.sort ASC, c.id ASC`,
      )
      .all() as Category[];
  },
);

const categoryInput = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  image: z.string().nullable().optional(),
  sort: z.number().int().optional(),
});

export const createCategory = createServerFn({ method: "POST" })
  .validator(categoryInput)
  .handler(async ({ data }) => {
    const info = getDb()
      .prepare("INSERT INTO categories (slug, name, image, sort) VALUES (@slug, @name, @image, @sort)")
      .run({ slug: data.slug, name: data.name, image: data.image ?? null, sort: data.sort ?? 0 });
    return { id: Number(info.lastInsertRowid) };
  });

export const updateCategory = createServerFn({ method: "POST" })
  .validator(categoryInput.extend({ id: z.number().int() }))
  .handler(async ({ data }) => {
    getDb()
      .prepare("UPDATE categories SET slug=@slug, name=@name, image=@image, sort=@sort WHERE id=@id")
      .run({ id: data.id, slug: data.slug, name: data.name, image: data.image ?? null, sort: data.sort ?? 0 });
    return { ok: true };
  });

export const deleteCategory = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ data }) => {
    getDb().prepare("DELETE FROM categories WHERE id = ?").run(data.id);
    return { ok: true };
  });

/* ============================================================ CUSTOMERS === */

export const listCustomers = createServerFn({ method: "GET" }).handler(
  async (): Promise<Customer[]> => {
    return getDb()
      .prepare(
        `SELECT c.*,
           (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) AS order_count,
           (SELECT COALESCE(SUM(o.total),0) FROM orders o WHERE o.customer_id = c.id AND o.status != 'zrušená') AS total_spent
         FROM customers c ORDER BY c.created_at DESC, c.id DESC`,
      )
      .all() as Customer[];
  },
);

export const getCustomer = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ data }) => {
    const db = getDb();
    const customer = db.prepare("SELECT * FROM customers WHERE id = ?").get(data.id) as
      | Customer
      | undefined;
    if (!customer) return null;
    const orders = db
      .prepare("SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC")
      .all(data.id) as Order[];
    return { ...customer, orders };
  });

export const deleteCustomer = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ data }) => {
    getDb().prepare("DELETE FROM customers WHERE id = ?").run(data.id);
    return { ok: true };
  });

/* =============================================================== ORDERS === */

export const listOrders = createServerFn({ method: "GET" }).handler(async (): Promise<Order[]> => {
  return getDb()
    .prepare(
      `SELECT o.*, c.name AS customer_name, c.email AS customer_email,
         (SELECT COALESCE(SUM(oi.qty),0) FROM order_items oi WHERE oi.order_id = o.id) AS items_count
       FROM orders o LEFT JOIN customers c ON c.id = o.customer_id
       ORDER BY o.created_at DESC, o.id DESC`,
    )
    .all() as Order[];
});

export const getOrder = createServerFn({ method: "GET" })
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ data }) => {
    const db = getDb();
    const order = db
      .prepare(
        `SELECT o.*, c.name AS customer_name, c.email AS customer_email, c.phone, c.address, c.city, c.zip
         FROM orders o LEFT JOIN customers c ON c.id = o.customer_id WHERE o.id = ?`,
      )
      .get(data.id) as (Order & Record<string, unknown>) | undefined;
    if (!order) return null;
    const items = db.prepare("SELECT * FROM order_items WHERE order_id = ?").all(data.id) as OrderItem[];
    return { ...order, items };
  });

export const updateOrderStatus = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int(), status: z.enum(ORDER_STATUSES) }))
  .handler(async ({ data }) => {
    getDb().prepare("UPDATE orders SET status = ? WHERE id = ?").run(data.status, data.id);
    return { ok: true };
  });

export const deleteOrder = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ data }) => {
    getDb().prepare("DELETE FROM orders WHERE id = ?").run(data.id);
    return { ok: true };
  });

export const createOrder = createServerFn({ method: "POST" })
  .validator(
    z.object({
      customer: z.object({
        name: z.string().min(1),
        email: z.string().email(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        zip: z.string().optional(),
      }),
      items: z
        .array(z.object({ product_id: z.number().int(), qty: z.number().int().min(1) }))
        .min(1),
      note: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const db = getDb();

    const tx = db.transaction(() => {
      // upsert customer by email
      const existing = db
        .prepare("SELECT id FROM customers WHERE email = ?")
        .get(data.customer.email) as { id: number } | undefined;
      let customerId: number;
      if (existing) {
        customerId = existing.id;
        db.prepare(
          `UPDATE customers SET name=@name, phone=@phone, address=@address, city=@city, zip=@zip WHERE id=@id`,
        ).run({
          id: customerId,
          name: data.customer.name,
          phone: data.customer.phone ?? null,
          address: data.customer.address ?? null,
          city: data.customer.city ?? null,
          zip: data.customer.zip ?? null,
        });
      } else {
        const info = db
          .prepare(
            `INSERT INTO customers (name, email, phone, address, city, zip)
             VALUES (@name, @email, @phone, @address, @city, @zip)`,
          )
          .run({
            name: data.customer.name,
            email: data.customer.email,
            phone: data.customer.phone ?? null,
            address: data.customer.address ?? null,
            city: data.customer.city ?? null,
            zip: data.customer.zip ?? null,
          });
        customerId = Number(info.lastInsertRowid);
      }

      // create order shell
      const orderInfo = db
        .prepare("INSERT INTO orders (order_number, customer_id, status, total, note) VALUES (?, ?, 'nová', 0, ?)")
        .run("TMP", customerId, data.note ?? null);
      const orderId = Number(orderInfo.lastInsertRowid);
      const orderNumber = "OBJ" + String(10000 + orderId);
      db.prepare("UPDATE orders SET order_number = ? WHERE id = ?").run(orderNumber, orderId);

      // items — price taken from DB (authoritative), decrement stock
      const getProduct = db.prepare("SELECT id, name, price, stock FROM products WHERE id = ?");
      const insItem = db.prepare(
        "INSERT INTO order_items (order_id, product_id, name, price, qty) VALUES (?, ?, ?, ?, ?)",
      );
      const decStock = db.prepare("UPDATE products SET stock = MAX(stock - ?, 0) WHERE id = ?");

      let total = 0;
      for (const it of data.items) {
        const prod = getProduct.get(it.product_id) as
          | { id: number; name: string; price: number; stock: number }
          | undefined;
        if (!prod) throw new Error(`Produkt ${it.product_id} neexistuje`);
        total += prod.price * it.qty;
        insItem.run(orderId, prod.id, prod.name, prod.price, it.qty);
        decStock.run(it.qty, prod.id);
      }

      db.prepare("UPDATE orders SET total = ? WHERE id = ?").run(total, orderId);
      return { id: orderId, order_number: orderNumber, total };
    });

    return tx();
  });

/* ============================================================ DASHBOARD === */

export const getDashboardStats = createServerFn({ method: "GET" }).handler(
  async (): Promise<DashboardStats> => {
    const db = getDb();
    const paid = "status != 'zrušená'";

    const totals = db
      .prepare(
        `SELECT COALESCE(SUM(total),0) AS revenue, COUNT(*) AS orderCount FROM orders WHERE ${paid}`,
      )
      .get() as { revenue: number; orderCount: number };

    const customerCount = (db.prepare("SELECT COUNT(*) AS n FROM customers").get() as { n: number }).n;
    const productCount = (db.prepare("SELECT COUNT(*) AS n FROM products").get() as { n: number }).n;
    const pendingOrders = (
      db.prepare("SELECT COUNT(*) AS n FROM orders WHERE status = 'nová'").get() as { n: number }
    ).n;
    const lowStockCount = (
      db.prepare("SELECT COUNT(*) AS n FROM products WHERE stock <= 10 AND active = 1").get() as {
        n: number;
      }
    ).n;

    const statusCounts = db
      .prepare("SELECT status, COUNT(*) AS count FROM orders GROUP BY status")
      .all() as { status: DashboardStats["statusCounts"][number]["status"]; count: number }[];

    const revenueByDay = db
      .prepare(
        `SELECT date(created_at) AS day, COALESCE(SUM(total),0) AS revenue, COUNT(*) AS orders
         FROM orders WHERE ${paid} AND created_at >= date('now','-29 days')
         GROUP BY day ORDER BY day ASC`,
      )
      .all() as { day: string; revenue: number; orders: number }[];

    const topProducts = db
      .prepare(
        `SELECT oi.name, SUM(oi.qty) AS qty, SUM(oi.qty * oi.price) AS revenue
         FROM order_items oi JOIN orders o ON o.id = oi.order_id
         WHERE o.${paid}
         GROUP BY oi.name ORDER BY qty DESC LIMIT 5`,
      )
      .all() as { name: string; qty: number; revenue: number }[];

    const revenueByType = db
      .prepare(
        `SELECT p.type AS type, COALESCE(SUM(oi.qty * oi.price),0) AS revenue
         FROM order_items oi
         JOIN orders o ON o.id = oi.order_id
         JOIN products p ON p.id = oi.product_id
         WHERE o.${paid}
         GROUP BY p.type ORDER BY revenue DESC`,
      )
      .all() as { type: string; revenue: number }[];

    const lowStock = db
      .prepare(
        "SELECT id, name, sku, stock FROM products WHERE active = 1 ORDER BY stock ASC LIMIT 6",
      )
      .all() as { id: number; name: string; sku: string; stock: number }[];

    const recentOrders = db
      .prepare(
        `SELECT o.*, c.name AS customer_name FROM orders o
         LEFT JOIN customers c ON c.id = o.customer_id
         ORDER BY o.created_at DESC, o.id DESC LIMIT 6`,
      )
      .all() as Order[];

    return {
      revenue: totals.revenue,
      orderCount: totals.orderCount,
      customerCount,
      productCount,
      avgOrderValue: totals.orderCount ? Math.round(totals.revenue / totals.orderCount) : 0,
      pendingOrders,
      lowStockCount,
      statusCounts,
      revenueByDay,
      topProducts,
      revenueByType,
      lowStock,
      recentOrders,
    };
  },
);
