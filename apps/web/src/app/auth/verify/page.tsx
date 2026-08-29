"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  g: "var(--t-g)",
  g2: "var(--t-g2)",
  warn: "var(--t-warn)",
  red: "var(--t-red)",
  bg: "var(--t-bg)",
  bg2: "var(--t-bg2)",
  panel: "var(--t-panel)",
  border: "var(--t-border)",
  border2: "var(--t-border2)",
  muted: "var(--t-muted)",
  text: "var(--t-text)",
  glow: "var(--t-glow)",
  glow2: "var(--t-glow2)",
  mono: "var(--t-font-mono)",
  display: "var(--t-font-display)",
  body: "var(--t-font-body)",
};

const Corners = () => (
  <>
    {[
      ["tl", "1px 0 0 1px", "0", "0", "auto", "auto"],
      ["tr", "1px 1px 0 0", "0", "auto", "0", "auto"],
      ["bl", "0 0 1px 1px", "auto", "0", "auto", "0"],
      ["br", "0 1px 1px 0", "auto", "auto", "0", "0"],
    ].map(([k, bw, t, l, b, r]) => (
      <span key={k} className="cyberpunk-corner" style={{
          position: "absolute",
          width: 14,
          height: 14,
          borderColor: T.g,
          borderStyle: "solid",
          borderWidth: bw as number | string,
          opacity: 0.5,
          top: t === "auto" ? undefined : 8,
          left: l === "auto" ? undefined : 8,
          bottom: b === "auto" ? undefined : 8,
          right: r === "auto" ? undefined : 8,
        }}
      />
    ))}
  </>
);

export default function EmailVerificationPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"verifying" | "success" | "error">(
    "verifying",
  );
  const [resent, setResent] = useState(false);

  // Simulate verification on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      // randomly succeed or fail for demo purposes, or just succeed
      setStatus("success");
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleResend = () => {
    setResent(true);
    // Add logic here to re-send the verification email
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        color: T.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage: `linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div
        style={{
          background: T.panel,
          borderRadius: "var(--t-radius)",
          border: `1px solid ${T.border}`,
          width: "100%",
          maxWidth: 420,
          padding: "3rem",
          textAlign: "center",
          position: "relative",
          zIndex: 10,
          boxShadow: `0 0 80px rgba(0,255,136,0.08), 0 0 0 1px rgba(0,255,136,0.06)`,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg,${T.g},${T.g2})`,
          }}
        />
        <Corners />

        <div
          style={{
            fontFamily: T.mono,
            fontSize: "0.65rem",
            letterSpacing: "0.15em",
            color: T.g,
            marginBottom: "1rem",
          }}
        >
          {/* IDENTITY VERIFICATION */}
        </div>

        {status === "verifying" && (
          <>
            <div
              style={{
                width: 64,
                height: 64,
                border: `2px solid rgba(0,207,255,0.2)`,
                borderTopColor: T.g2,
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 2rem auto",
              }}
            />
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>

            <div
              style={{
                fontFamily: T.display,
                fontSize: "1.6rem",
                fontWeight: 700,
                color: "var(--t-heading)",
                marginBottom: "1rem",
              }}
            >
              Verifying Email...
            </div>
            <p
              style={{
                color: "rgba(200,255,232,0.5)",
                fontSize: "0.85rem",
                lineHeight: 1.6,
              }}
            >
              Please wait while we validate your security token.
            </p>
          </>
        )}

        {status === "success" && (
          <>
            <div
              style={{
                width: 64,
                height: 64,
                border: `1px solid ${T.border}`,
                background: "rgba(0,255,136,0.05)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 2rem auto",
                fontSize: "2rem",
                color: T.g,
                boxShadow: T.glow,
              }}
            >
              ✓
            </div>
            <div
              style={{
                fontFamily: T.display,
                fontSize: "1.6rem",
                fontWeight: 700,
                color: "var(--t-heading)",
                marginBottom: "1rem",
              }}
            >
              Identity Confirmed
            </div>
            <p
              style={{
                color: "rgba(200,255,232,0.6)",
                fontSize: "0.85rem",
                lineHeight: 1.6,
                marginBottom: "2.5rem",
              }}
            >
              Your email has been successfully verified. Your clearance level
              has been updated.
            </p>
            <button
              onClick={() => router.push("/onboarding")}
              style={{
                width: "100%",
                fontFamily: T.mono,
                fontSize: "0.85rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: T.bg,
                background: T.g,
                border: "none",
                padding: "1rem",
                cursor: "pointer",
                clipPath:
                  "polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)",
                transition: "box-shadow 0.2s, background 0.2s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = T.glow;
                e.currentTarget.style.background = "var(--t-heading)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "";
                e.currentTarget.style.background = T.g;
              }}
            >
              ▶ CONTINUE TO TERMINAL
            </button>
          </>
        )}

        {status === "error" && (
          <>
            <div
              style={{
                width: 64,
                height: 64,
                border: `1px solid rgba(255,51,85,0.2)`,
                background: "rgba(255,51,85,0.05)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 2rem auto",
                fontSize: "2rem",
                color: T.red,
                boxShadow: `0 0 20px rgba(255,51,85,0.2)`,
              }}
            >
              !
            </div>
            <div
              style={{
                fontFamily: T.display,
                fontSize: "1.6rem",
                fontWeight: 700,
                color: "var(--t-heading)",
                marginBottom: "1rem",
              }}
            >
              Verification Failed
            </div>
            <p
              style={{
                color: "rgba(200,255,232,0.5)",
                fontSize: "0.85rem",
                lineHeight: 1.6,
                marginBottom: "2rem",
              }}
            >
              The verification token is invalid or has expired.
            </p>

            {resent ? (
              <div
                style={{
                  color: T.g,
                  fontFamily: T.mono,
                  fontSize: "0.8rem",
                  padding: "1rem",
                  background: "rgba(0,255,136,0.1)",
                  border: `1px solid ${T.border}`,
                }}
              >
                ✓ New link transmitted to your inbox.
              </div>
            ) : (
              <button
                onClick={handleResend}
                style={{
                  width: "100%",
                  fontFamily: T.mono,
                  fontSize: "0.85rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: T.g2,
                  background: "transparent",
                  border: `1px solid ${T.border2}`,
                  padding: "1rem",
                  cursor: "pointer",
                  transition:
                    "border-color 0.2s, background 0.2s, box-shadow 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = T.g2;
                  e.currentTarget.style.background = "rgba(0,207,255,0.07)";
                  e.currentTarget.style.boxShadow = T.glow2;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = T.border2;
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                Resend Verification Email
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
