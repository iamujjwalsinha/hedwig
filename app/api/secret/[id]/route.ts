import { NextRequest, NextResponse } from "next/server";
import { fetchAndConsumeSecret } from "@/lib/db";
import { limitSecretGet } from "@/lib/ratelimit";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const rate = await limitSecretGet(request);
  if (!rate.ok) return rate.response;

  try {
    const { id } = params;

    if (!id || typeof id !== "string" || id.length > 64) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const secret = await fetchAndConsumeSecret(id);

    if (!secret) {
      return NextResponse.json(
        { error: "Secret not found or expired" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ciphertext: secret.ciphertext,
      iv: secret.iv,
      burnOnRead: secret.burnOnRead,
    });
  } catch (error) {
    console.error("Error retrieving secret:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
