// One-off: ensure the storage buckets Looksy needs exist.
//   selfies      — private (persisted user selfies)
//   public-looks — public  (shared/public look pages)
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

const admin = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } },
);

async function ensureBucket(name, isPublic) {
  const { error } = await admin.storage.createBucket(name, { public: isPublic });
  if (!error) return console.log(`${name}: created (public=${isPublic})`);
  if (/exist/i.test(error.message)) {
    await admin.storage.updateBucket(name, { public: isPublic });
    return console.log(`${name}: already exists (public=${isPublic})`);
  }
  console.log(`${name}: ERROR ${error.message}`);
}

await ensureBucket("selfies", false);
await ensureBucket("public-looks", true);
