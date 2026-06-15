import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import { getDb } from "@/lib/db.server";
import { hashPassword, verifyPassword } from "@/lib/password.server";
import { setUserSession, getSessionUserId, clearUserSession } from "@/lib/auth-session.server";
import type { User, Customer, Order } from "@/lib/eshop-types";

type UserRow = User & { password_hash: string };

/* ================================================================ AUTH === */

export const login = createServerFn({ method: "POST" })
  .validator(z.object({ email: z.string().email(), password: z.string().min(1) }))
  .handler(async ({ data }) => {
    const user = getDb()
      .prepare("SELECT * FROM users WHERE email = ?")
      .get(data.email.toLowerCase().trim()) as UserRow | undefined;

    if (!user || !user.active || !verifyPassword(data.password, user.password_hash)) {
      throw new Error("Neplatný e-mail nebo heslo.");
    }
    await setUserSession(user.id);
    return { ok: true };
  });

export const logout = createServerFn({ method: "POST" }).handler(async () => {
  await clearUserSession();
  return { ok: true };
});

export const getCurrentUser = createServerFn({ method: "GET" }).handler(
  async (): Promise<Pick<User, "id" | "email" | "name" | "company"> | null> => {
    try {
      const userId = await getSessionUserId();
      if (!userId) return null;
      const user = getDb()
        .prepare("SELECT id, email, name, company, active FROM users WHERE id = ?")
        .get(userId) as User | undefined;
      if (!user || !user.active) return null;
      return { id: user.id, email: user.email, name: user.name, company: user.company };
    } catch {
      return null;
    }
  },
);

export const getMyAccount = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const userId = await getSessionUserId();
    if (!userId) return null;
    const db = getDb();
    const user = db
      .prepare("SELECT id, email, name, company, active FROM users WHERE id = ?")
      .get(userId) as User | undefined;
    if (!user || !user.active) return null;

    const customer = db.prepare("SELECT * FROM customers WHERE email = ?").get(user.email) as
      | Customer
      | undefined;

    const orders = customer
      ? (db
          .prepare(
            `SELECT o.*, (SELECT COALESCE(SUM(oi.qty),0) FROM order_items oi WHERE oi.order_id = o.id) AS items_count
             FROM orders o WHERE o.customer_id = ? ORDER BY o.created_at DESC, o.id DESC`,
          )
          .all(customer.id) as Order[])
      : [];

    return {
      user: { id: user.id, email: user.email, name: user.name, company: user.company },
      customer: customer ?? null,
      orders,
    };
  } catch {
    return null;
  }
});

/* ===================================================== ADMIN: ÚČTY B2B === */

export const listUsers = createServerFn({ method: "GET" }).handler(async (): Promise<User[]> => {
  return getDb()
    .prepare("SELECT id, email, name, company, active, created_at FROM users ORDER BY created_at DESC, id DESC")
    .all() as User[];
});

export const createUser = createServerFn({ method: "POST" })
  .validator(
    z.object({
      email: z.string().email(),
      password: z.string().min(4),
      name: z.string().optional(),
      company: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const info = getDb()
      .prepare(
        "INSERT INTO users (email, password_hash, name, company, active) VALUES (@email, @hash, @name, @company, 1)",
      )
      .run({
        email: data.email.toLowerCase().trim(),
        hash: hashPassword(data.password),
        name: data.name ?? null,
        company: data.company ?? null,
      });
    return { id: Number(info.lastInsertRowid) };
  });

export const setUserActive = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int(), active: z.boolean() }))
  .handler(async ({ data }) => {
    getDb().prepare("UPDATE users SET active = ? WHERE id = ?").run(data.active ? 1 : 0, data.id);
    return { ok: true };
  });

export const resetUserPassword = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int(), password: z.string().min(4) }))
  .handler(async ({ data }) => {
    getDb()
      .prepare("UPDATE users SET password_hash = ? WHERE id = ?")
      .run(hashPassword(data.password), data.id);
    return { ok: true };
  });

export const deleteUser = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.number().int() }))
  .handler(async ({ data }) => {
    getDb().prepare("DELETE FROM users WHERE id = ?").run(data.id);
    return { ok: true };
  });
