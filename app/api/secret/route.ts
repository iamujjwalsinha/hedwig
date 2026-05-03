import { NextRequest, NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { storeSecret } from "@/lib/db";
import { isValidCipherPayload } from "@/lib/limits";
import { limitPostCreate } from "@/lib/ratelimit";
import { normalizeTtlSeconds } from "@/lib/ttl";

export async function POST(request: NextRequest) {
  const rate = await limitPostCreate(request);
  if (!rate.ok) return rate.response;

  try {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (
      typeof body !== "object" ||
      body === null ||
      Array.isArray(body)
    ) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const rec = body as Record<string, unknown>;
    const ciphertext = rec.ciphertext;
    const iv = rec.iv;
    const burnOnRead = Boolean(rec.burnOnRead);
    const ttlRaw = rec.ttl;

    const ttlSeconds = normalizeTtlSeconds(ttlRaw);
    if (!ttlSeconds) {
      return NextResponse.json({ error: "Invalid or disallowed ttl" }, { status: 400 });
    }

    if (
      typeof ciphertext !== "string" ||
      typeof iv !== "string" ||
      ciphertext.trim() === "" ||
      iv.trim() === "" ||
      !isValidCipherPayload(ciphertext, iv)
    ) {
      return NextResponse.json(
        {
          error:
            "Invalid request: ciphertext and iv are required within size limits",
        },
        { status: 400 }
      );
    }

    const id = nanoid(10);
    const createdAtMs = Date.now();

    await storeSecret(
      id,
      {
        ciphertext,
        iv,
        burnOnRead,
        createdAtMs,
      },
      ttlSeconds
    );

    return NextResponse.json({ id }, { status: 201 });
  } catch (error) {
    console.error("Error storing secret:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
