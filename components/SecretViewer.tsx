"use client";

import { useEffect, useRef, useState } from "react";
import { importKeyFromFragment, decryptSecret } from "@/lib/crypto";
import { BRAND, fontDisplay } from "@/lib/brand";

const GREEN = BRAND.accent;
const BG = BRAND.background;
const CARD_BG = BRAND.cardBg;
const BORDER = BRAND.border;
const TEXT = BRAND.text;

type State =
  | { status: "loading" }
  | { status: "missing_key" }
  | { status: "not_found" }
  | { status: "error"; message: string }
  | { status: "success"; plaintext: string; burned: boolean };

export default function SecretViewer({ id }: { id: string }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [copied, setCopied] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function fetchAndDecrypt() {
      const fragment = window.location.hash.slice(1);
      if (!fragment) { setState({ status: "missing_key" }); return; }

      try {
        const res = await fetch(`/api/secret/${id}`);
        if (res.status === 404) { setState({ status: "not_found" }); return; }
        if (!res.ok) throw new Error(`Server error: ${res.status}`);

        const { ciphertext, iv, burnOnRead } = await res.json();
        const key = await importKeyFromFragment(fragment);
        const plaintext = await decryptSecret(ciphertext, iv, key);
        setState({ status: "success", plaintext, burned: Boolean(burnOnRead) });
      } catch (err: unknown) {
        if ((err as { status?: number })?.status === 404) {
          setState({ status: "not_found" });
        } else {
          setState({ status: "error", message: err instanceof Error ? err.message : "Decryption failed" });
        }
      }
    }
    fetchAndDecrypt();
  }, [id]);

  async function copyPlaintext() {
    if (state.status !== "success") return;
    try {
      await navigator.clipboard.writeText(state.plaintext);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* silent */ }
  }

  const cardStyle = {
    backgroundColor: CARD_BG,
    border: `1px solid ${BORDER}`,
    borderRadius: "16px",
    padding: "28px",
    textAlign: "center" as const,
  };

  if (state.status === "loading") {
    return (
      <div style={cardStyle}>
        <div className="text-3xl mb-3 animate-pulse">🔐</div>
        <p className="text-sm" style={{ color: TEXT, opacity: 0.55 }}>Decrypting secret…</p>
      </div>
    );
  }

  if (state.status === "missing_key") {
    return (
      <div style={{ ...cardStyle, border: `1px solid #FCA5A5`, backgroundColor: "#FFF5F5" }}>
        <div className="text-3xl mb-3">🔑</div>
        <h2 className="font-semibold mb-2" style={{ fontFamily: fontDisplay(), color: TEXT }}>
          Missing decryption key
        </h2>
        <p className="text-sm" style={{ color: TEXT, opacity: 0.6 }}>
          The decryption key is missing from the URL. Make sure you copied the
          full link including the <code style={{ color: GREEN }}>#</code> part.
        </p>
      </div>
    );
  }

  if (state.status === "not_found") {
    return (
      <div style={cardStyle}>
        <div className="text-3xl mb-3">💨</div>
        <h2 className="font-semibold mb-2" style={{ fontFamily: fontDisplay(), color: TEXT }}>
          Secret not found
        </h2>
        <p className="text-sm mb-4" style={{ color: TEXT, opacity: 0.55 }}>
          This secret may have expired or already been read.
        </p>
        <a href="/" style={{ color: GREEN, fontSize: "14px", fontWeight: 500, textDecoration: "none" }}>
          Create a new secret →
        </a>
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div style={{ ...cardStyle, border: `1px solid #FCA5A5`, backgroundColor: "#FFF5F5" }}>
        <div className="text-3xl mb-3">⚠️</div>
        <h2 className="font-semibold mb-2" style={{ fontFamily: fontDisplay(), color: TEXT }}>
          Decryption failed
        </h2>
        <p className="text-sm" style={{ color: TEXT, opacity: 0.6 }}>{state.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {state.burned && (
        <div style={{
          backgroundColor: `${GREEN}10`, border: `1px solid ${GREEN}30`,
          borderRadius: "10px", padding: "12px 16px",
          display: "flex", alignItems: "flex-start", gap: "10px",
        }}>
          <span style={{ fontSize: "16px", flexShrink: 0 }}>🔥</span>
          <p style={{ fontSize: "13px", color: GREEN, margin: 0, lineHeight: 1.5 }}>
            This secret has been permanently deleted after viewing. No one can access it again.
          </p>
        </div>
      )}

      <div style={{ backgroundColor: CARD_BG, border: `1px solid ${BORDER}`, borderRadius: "16px", padding: "24px" }}>
        <div className="flex items-start justify-between gap-4 mb-4">
          <h2 className="text-sm font-medium shrink-0" style={{ color: TEXT, opacity: 0.5 }}>
            Decrypted message
          </h2>
          <div className="flex flex-col items-end gap-1 min-w-0">
            <button
              type="button"
              onClick={copyPlaintext}
              style={{
                padding: "6px 14px", backgroundColor: GREEN, color: "#FFFFEB",
                fontSize: "12px", fontWeight: 600, borderRadius: "8px",
                border: "none", cursor: "pointer", transition: "opacity 0.15s",
                flexShrink: 0,
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = "0.85")}
              onMouseOut={(e) => (e.currentTarget.style.opacity = "1")}
              aria-live="polite"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            {copied && (
              <p
                className="text-xs text-right leading-snug m-0"
                style={{ color: TEXT, opacity: 0.6, maxWidth: "14rem" }}
              >
                Clear clipboard when you&apos;re finished if others use this device.
              </p>
            )}
          </div>
        </div>
        <pre style={{
          fontFamily: "'JetBrains Mono', 'Courier New', monospace",
          fontSize: "13px", color: TEXT, whiteSpace: "pre-wrap",
          wordBreak: "break-word", lineHeight: "1.7",
          backgroundColor: BG, border: `1px solid ${BORDER}`,
          borderRadius: "10px", padding: "16px",
          maxHeight: "380px", overflowY: "auto", margin: 0,
        }}>
          {state.plaintext}
        </pre>
      </div>

      <a
        href="/"
        className="block text-center text-sm"
        style={{ color: TEXT, opacity: 0.45, textDecoration: "none", transition: "opacity 0.15s" }}
        onMouseOver={(e) => (e.currentTarget.style.opacity = "0.75")}
        onMouseOut={(e) => (e.currentTarget.style.opacity = "0.45")}
      >
        Share a secret with hedwig →
      </a>
    </div>
  );
}
