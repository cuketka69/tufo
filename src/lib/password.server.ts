import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import process from "node:process";

// Hashování hesel (scrypt) — bez externích závislostí.
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const hashBuf = Buffer.from(hash, "hex");
  const test = scryptSync(password, salt, 64);
  return hashBuf.length === test.length && timingSafeEqual(hashBuf, test);
}

// Tajný klíč pro šifrovanou session cookie (min. 32 znaků).
export function getSessionPassword(): string {
  return (
    process.env.SESSION_SECRET ??
    "tufo-dev-session-secret-change-me-please-32+chars"
  );
}
