import { promises as fs } from "fs";
import path from "path";
import { scryptSync, randomBytes, timingSafeEqual } from "crypto";

/**
 * Minimal file-backed user store. Good enough for local dev / a single server.
 * NOTE: a JSON file does NOT persist on serverless hosts (read-only FS) — swap
 * this module for a real database (Postgres, Supabase, etc.) before deploying.
 */
const DATA_DIR = path.join(process.cwd(), "data");
const USERS_FILE = path.join(DATA_DIR, "users.json");

export interface StoredUser {
  email: string;
  name?: string;
  passwordHash: string;
  createdAt: number;
}

async function readAll(): Promise<StoredUser[]> {
  try {
    const raw = await fs.readFile(USERS_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeAll(users: StoredUser[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
}

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const candidate = scryptSync(password, salt, 64);
  const original = Buffer.from(hash, "hex");
  return (
    candidate.length === original.length &&
    timingSafeEqual(candidate, original)
  );
}

export async function findUser(email: string): Promise<StoredUser | undefined> {
  const users = await readAll();
  return users.find((u) => u.email === email.toLowerCase());
}

export async function createUser(
  email: string,
  password: string,
  name?: string,
): Promise<StoredUser> {
  const users = await readAll();
  const normalized = email.toLowerCase();
  if (users.some((u) => u.email === normalized)) {
    throw new Error("EXISTS");
  }
  const user: StoredUser = {
    email: normalized,
    name,
    passwordHash: hashPassword(password),
    createdAt: Date.now(),
  };
  users.push(user);
  await writeAll(users);
  return user;
}
