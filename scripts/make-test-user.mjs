// One-off: create a pre-confirmed demo user so the Studio can be previewed.
// Reads .env.local for the Supabase URL + service-role key. Prints no secrets.
import { readFile } from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const raw = await readFile(new URL("../.env.local", import.meta.url), "utf8");
const env = Object.fromEntries(
  raw
    .split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim().replace(/^["']|["']$/g, "")];
    }),
);

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.log("missing env:", { url: !!url, serviceKey: !!key });
  process.exit(1);
}

const admin = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const email = "demo@looksy.app";
const password = "Looksy-demo-1234";

// Find an existing demo user (so we can reset its password) or create fresh.
const { data: list } = await admin.auth.admin.listUsers();
const existing = list?.users?.find((u) => u.email === email);

if (existing) {
  const { error } = await admin.auth.admin.updateUserById(existing.id, {
    password,
    email_confirm: true,
  });
  console.log(error ? `update ERROR: ${error.message}` : "demo user updated");
} else {
  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: "Demo User" },
  });
  console.log(error ? `create ERROR: ${error.message}` : "demo user created");
}

// Verify the password actually works via the anon client.
const anon = createClient(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const { data: signIn, error: signErr } = await anon.auth.signInWithPassword({
  email,
  password,
});
console.log(
  signErr ? `sign-in FAILED: ${signErr.message}` : `sign-in OK: ${signIn.user?.email}`,
);
