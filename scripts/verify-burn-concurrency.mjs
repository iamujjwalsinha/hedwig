#!/usr/bin/env node
/**
 * Smoke test: concurrent GETs against a burn-on-read secret must yield at most one 200.
 *
 * Prerequisites:
 *   - Next app running (npm run dev, or npm run dev:5050 if port 5000 is taken, e.g. macOS AirPlay)
 *   - .env or .env.local with NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 *     (same values the server uses: script inserts a row directly, then curls the API)
 *
 * Usage:
 *   TEST_API_URL=http://127.0.0.1:5050 node scripts/verify-burn-concurrency.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync, existsSync } from "fs";
import { resolve } from "path";

function loadEnvFile(name) {
  const p = resolve(process.cwd(), name);
  if (!existsSync(p)) return;
  const raw = readFileSync(p, "utf8");
  for (const line of raw.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnvFile(".env.local");
loadEnvFile(".env");

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const apiBase =
  process.env.TEST_API_URL?.replace(/\/$/, "") || "http://127.0.0.1:5000";

if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY (load .env.local or export)"
  );
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false },
});

const testId =
  process.env.TEST_SECRET_ID ||
  `burncheck_${Math.random().toString(36).slice(2, 12)}`;

const ciphertext = Buffer.from("hedwig-burn-check").toString("base64");
const iv = Buffer.alloc(12, 7).toString("base64");

async function cleanup() {
  await supabase.from("secrets").delete().eq("id", testId);
}

async function main() {
  await cleanup();

  const expires = new Date(Date.now() + 60_000).toISOString();

  const { error: insertError } = await supabase.from("secrets").insert({
    id: testId,
    ciphertext,
    iv,
    burn_on_read: true,
    expires_at: expires,
  });

  if (insertError) {
    console.error("Insert failed:", insertError.message);
    process.exit(1);
  }

  const target = `${apiBase}/api/secret/${testId}`;
  const requests = 20;

  const results = await Promise.all(
    Array.from({ length: requests }, async () => {
      const res = await fetch(target, { headers: { Accept: "application/json" } });
      let bodySnippet = "";
      try {
        const j = await res.json();
        if (j?.ciphertext) bodySnippet = "has-ciphertext";
      } catch {
        bodySnippet = "non-json";
      }
      return { status: res.status, bodySnippet };
    })
  );

  const okCount = results.filter((r) => r.status === 200).length;
  const withPayload = results.filter((r) => r.bodySnippet === "has-ciphertext")
    .length;

  console.log(JSON.stringify({ testId, target, requests, okCount, withPayload }, null, 2));

  await cleanup();

  if (withPayload !== 1) {
    console.error(
      "Expected exactly one successful ciphertext response across concurrent GETs."
    );
    process.exit(1);
  }

  console.log("OK: burn-after-read behaved atomically under parallel GETs.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
