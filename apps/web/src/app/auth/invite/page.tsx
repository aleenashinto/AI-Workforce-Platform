"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useUserContext } from "@/contexts/UserContext";

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
  mono: "'Share Tech Mono', monospace",
  display: "'Orbitron', sans-serif",
  body: "'Rajdhani', sans-serif",
};

const Corners = () => (
  <>
    {[
      ["tl", "1px 0 0 1px", "0", "0", "auto", "auto"],
      ["tr", "1px 1px 0 0", "0", "auto", "0", "auto"],
      ["bl", "0 0 1px 1px", "auto", "0", "auto", "0"],
      ["br", "0 1px 1px 0", "auto", "auto", "0", "0"],
    ].map(([k, bw, t, l, b, r]) => (
      <span
        key={k}
        style={{
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

function InviteAcceptanceInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { user, loading: userLoading } = useUserContext();

  const [status, setStatus] = useState<
    "loading" | "valid" | "invalid" | "accepted"
  >("loading");
  const [errorMsg, setErrorMsg] = useState("");
  const [orgName, setOrgName] = useState("");
  const [invitedEmail, setInvitedEmail] = useState("");
  const [isAccepting, setIsAccepting] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setErrorMsg("No invitation token provided.");
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/invite/validate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setOrgName(data.orgName);
          setInvitedEmail(data.email);
          setStatus("valid");
        } else {
          setStatus("invalid");
          setErrorMsg(data.error || "Invalid invitation");
        }
      })
      .catch(() => {
        setStatus("invalid");
        setErrorMsg("Network error validating invitation.");
      });
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;

    if (!user) {
      // Unauthenticated user -> redirect to signup with prefilled email and invite token
      router.push(
        `/login?email=${encodeURIComponent(invitedEmail)}&invite_token=${token}`,
      );
      return;
    }

    // Authenticated user -> try to accept directly
    setIsAccepting(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/invite/accept`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
          credentials: "include",
        },
      );
      const data = await res.json();

      if (data.success) {
        setStatus("accepted");
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      } else {
        setStatus("invalid");
        setErrorMsg(data.error || "Failed to accept invitation.");
      }
    } catch (err) {
      setStatus("invalid");
      setErrorMsg("Network error.");
    } finally {
      setIsAccepting(false);
    }
  };

  if (status === "loading" || userLoading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: T.bg,
          color: T.text,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontFamily: T.mono, color: T.g }}>
          VALIDATING INVITATION...
        </div>
      </div>
    );
  }

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
          border: `1px solid ${T.border}`,
          width: "100%",
          maxWidth: 460,
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
            width: 80,
            height: 80,
            border: `1px solid ${T.border}`,
            background: "rgba(0,255,136,0.02)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 2rem auto",
            position: "relative",
          }}
        >
          <div style={{ fontSize: "2.5rem" }}>🏢</div>
        </div>

        {status === "invalid" && (
          <>
            <div
              style={{
                fontFamily: T.display,
                fontSize: "1.5rem",
                fontWeight: 700,
                color: T.warn,
                marginBottom: "1rem",
              }}
            >
              Invitation Error
            </div>
            <p
              style={{
                color: "rgba(200,255,232,0.6)",
                fontSize: "0.95rem",
                lineHeight: 1.6,
                marginBottom: "2rem",
              }}
            >
              {errorMsg}
            </p>
            <Link
              href="/auth/login"
              style={{
                display: "block",
                width: "100%",
                fontFamily: T.mono,
                fontSize: "0.85rem",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                textDecoration: "none",
                color: T.bg,
                background: T.warn,
                border: "none",
                padding: "1rem",
                cursor: "pointer",
                clipPath:
                  "polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)",
              }}
            >
              ▶ RETURN TO LOGIN
            </Link>
          </>
        )}

        {status === "accepted" && (
          <>
            <div
              style={{
                fontFamily: T.display,
                fontSize: "1.5rem",
                fontWeight: 700,
                color: T.g,
                marginBottom: "1rem",
              }}
            >
              Access Granted
            </div>
            <p
              style={{
                color: "rgba(200,255,232,0.6)",
                fontSize: "0.95rem",
                lineHeight: 1.6,
                marginBottom: "2rem",
              }}
            >
              You have successfully joined <strong>{orgName}</strong>.
              Redirecting to your dashboard...
            </p>
          </>
        )}

        {status === "valid" && (
          <>
            <div
              style={{
                fontFamily: T.display,
                fontSize: "1.8rem",
                fontWeight: 700,
                color: "var(--t-heading)",
                marginBottom: "0.5rem",
              }}
            >
              You&apos;ve been invited!
            </div>

            <p
              style={{
                color: "rgba(200,255,232,0.6)",
                fontSize: "0.95rem",
                lineHeight: 1.6,
                marginBottom: "2.5rem",
              }}
            >
              You have been granted access to join{" "}
              <strong style={{ color: "var(--t-heading)" }}>{orgName}</strong> on the AI
              Workforce platform as{" "}
              <strong style={{ color: T.g2 }}>{invitedEmail}</strong>.
            </p>

            {user ? (
              user.email.toLowerCase() === invitedEmail.toLowerCase() ? (
                <button
                  onClick={handleAccept}
                  disabled={isAccepting}
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
                    cursor: isAccepting ? "wait" : "pointer",
                    marginBottom: "1rem",
                    clipPath:
                      "polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)",
                    transition: "box-shadow 0.2s, background 0.2s",
                    opacity: isAccepting ? 0.7 : 1,
                  }}
                >
                  {isAccepting ? "ACCEPTING..." : "▶ ACCEPT INVITATION"}
                </button>
              ) : (
                <div style={{ marginBottom: "1rem" }}>
                  <p
                    style={{
                      color: T.warn,
                      fontSize: "0.85rem",
                      marginBottom: "1rem",
                    }}
                  >
                    You are currently logged in as <strong>{user.email}</strong>
                    , which does not match the invitation email.
                  </p>
                  <button
                    onClick={() => {
                      fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
                        method: "POST",
                        credentials: "include",
                      }).then(() => window.location.reload());
                    }}
                    style={{
                      width: "100%",
                      fontFamily: T.mono,
                      fontSize: "0.85rem",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      color: T.bg,
                      background: T.warn,
                      border: "none",
                      padding: "1rem",
                      cursor: "pointer",
                      clipPath:
                        "polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)",
                    }}
                  >
                    ▶ SWITCH ACCOUNTS
                  </button>
                </div>
              )
            ) : (
              <button
                onClick={handleAccept}
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
                  marginBottom: "1rem",
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
                ▶ CREATE ACCOUNT
              </button>
            )}

            {!user && (
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: "0.7rem",
                  color: "rgba(200,255,232,0.35)",
                  textAlign: "center",
                  marginTop: "1.5rem",
                }}
              >
                Already have an account?{" "}
                <Link
                  href={`/auth/login?redirect=${encodeURIComponent("/auth/invite?token=" + token)}`}
                  style={{
                    color: T.g2,
                    textDecoration: "none",
                    transition: "text-shadow 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.textShadow = T.glow2)
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.textShadow = "")}
                >
                  Log in to accept
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function InviteAcceptancePage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: "100vh",
            background: T.bg,
            color: T.text,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ fontFamily: T.mono, color: T.g }}>
            LOADING INVITATION...
          </div>
        </div>
      }
    >
      <InviteAcceptanceInner />
    </Suspense>
  );
}
