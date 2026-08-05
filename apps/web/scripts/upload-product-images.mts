/**
 * Uploads apps/web/public/products/*.jpg to a public Supabase Storage bucket
 * ("product-images"). One-time-ish infra script; re-runnable (upsert).
 * Reads Supabase URL + service role key from apps/web/.env.local.
 *
 * Run (Node < 22 needs the flag for supabase-js realtime init):
 *   NODE_OPTIONS='--experimental-websocket' npx tsx apps/web/scripts/upload-product-images.mts
 */
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createClient } from "@supabase/supabase-js";

const here = dirname(fileURLToPath(import.meta.url));
const webDir = join(here, "..");
const productsDir = join(webDir, "public", "products");

const env: Record<string, string> = {};
for (const line of readFileSync(join(webDir, ".env.local"), "utf8").split("\n")) {
  const i = line.indexOf("=");
  if (i > 0) env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
}

const url = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) throw new Error("Missing URL / service role key in apps/web/.env.local");

const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
const BUCKET = "product-images";

const { error: bucketErr } = await supabase.storage.createBucket(BUCKET, {
  public: true,
});
if (bucketErr && !/already exists/i.test(bucketErr.message)) throw bucketErr;
console.log(bucketErr ? "bucket already exists" : "bucket created (public)");

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const files = readdirSync(productsDir).filter((f) => f.endsWith(".jpg"));
let ok = 0;
for (const file of files) {
  const buf = readFileSync(join(productsDir, file));
  let lastErr = "";
  for (let attempt = 1; attempt <= 4; attempt++) {
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(file, buf, { contentType: "image/jpeg", upsert: true });
    if (!error) {
      ok++;
      lastErr = "";
      break;
    }
    lastErr = error.message;
    await sleep(300 * attempt);
  }
  if (lastErr) console.error("FAIL", file, lastErr);
  await sleep(120);
}
console.log(
  `uploaded ${ok}/${files.length} → ${url}/storage/v1/object/public/${BUCKET}/`,
);
