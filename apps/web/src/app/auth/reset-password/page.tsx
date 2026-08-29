"use client";

import { useState } from "react";
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

function ModalField({
  label,
  type,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  type: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "1.1rem" }}>
      <label
        style={{
          fontFamily: T.mono,
          fontSize: "0.65rem",
          letterSpacing: "0.12em",
          color: T.muted,
          marginBottom: "0.4rem",
          display: "block",
          textTransform: "uppercase",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: "100%",
          background: "rgba(var(--t-g-rgb), )",
          border: `1px solid ${focused ? "rgba(var(--t-g-rgb), )" : T.border}`,
          boxShadow: focused ? "0 0 0 3px rgba(var(--t-g-rgb), )" : "none",
          color: T.text,
          fontFamily: T.mono,
          fontSize: "0.85rem",
          padding: "0.7rem 1rem",
          outline: "none",
          transition: "border-color 0.2s, box-shadow 0.2s",
        }}
      />
    </div>
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const reqs = {
    length: formData.password.length >= 8,
    upper: /[A-Z]/.test(formData.password),
    number: /[0-9]/.test(formData.password),
  };

  const allReqsMet = reqs.length && reqs.upper && reqs.number;
  const match =
    formData.password === formData.confirmPassword &&
    formData.password.length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allReqsMet || !match) return;
    console.log("Password reset successful");
    router.push("/auth/login");
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
          backgroundImage: `linear-gradient(rgba(var(--t-g-rgb), ) 1px, transparent 1px), linear-gradient(90deg, rgba(var(--t-g-rgb), ) 1px, transparent 1px)`,
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
          padding: "2.5rem 3rem",
          position: "relative",
          zIndex: 10,
          boxShadow: `0 0 80px rgba(var(--t-g-rgb), ), 0 0 0 1px rgba(var(--t-g-rgb), )`,
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
            marginBottom: "0.5rem",
          }}
        >
          {/* CREDENTIAL UPDATE */}
        </div>
        <div
          style={{
            fontFamily: T.display,
            fontSize: "1.6rem",
            fontWeight: 700,
            color: "var(--t-heading)",
            marginBottom: "1.8rem",
          }}
        >
          Reset Password
        </div>

        <form onSubmit={handleSubmit}>
          <ModalField
            label="New Password"
            type="password"
            placeholder="••••••••••••"
            value={formData.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, password: e.target.value })
            }
          />

          <div
            style={{
              marginBottom: "1.5rem",
              background: "rgba(0,0,0,0.2)",
              padding: "1rem",
              borderRadius: "4px",
              border: `1px solid rgba(var(--t-g-rgb), )`,
            }}
          >
            <div
              style={{
                fontFamily: T.mono,
                fontSize: "0.65rem",
                textTransform: "uppercase",
                color: T.muted,
                marginBottom: "0.8rem",
              }}
            >
              Password Requirements:
            </div>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "0.4rem",
              }}
            >
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.8rem",
                  color: reqs.length ? T.g : "rgba(200,255,232,0.4)",
                }}
              >
                <span style={{ fontFamily: T.mono }}>
                  {reqs.length ? "✓" : "○"}
                </span>{" "}
                At least 8 characters
              </li>
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.8rem",
                  color: reqs.upper ? T.g : "rgba(200,255,232,0.4)",
                }}
              >
                <span style={{ fontFamily: T.mono }}>
                  {reqs.upper ? "✓" : "○"}
                </span>{" "}
                One uppercase letter
              </li>
              <li
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.8rem",
                  color: reqs.number ? T.g : "rgba(200,255,232,0.4)",
                }}
              >
                <span style={{ fontFamily: T.mono }}>
                  {reqs.number ? "✓" : "○"}
                </span>{" "}
                One number
              </li>
            </ul>
          </div>

          <ModalField
            label="Confirm Password"
            type="password"
            placeholder="••••••••••••"
            value={formData.confirmPassword}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
          />

          <button
            type="submit"
            disabled={!allReqsMet || !match}
            style={{
              width: "100%",
              fontFamily: T.mono,
              fontSize: "0.85rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: !allReqsMet || !match ? "var(--t-white-20)" : T.bg,
              background: !allReqsMet || !match ? "rgba(var(--t-g-rgb), )" : T.g,
              border: "none",
              padding: "1rem",
              cursor: !allReqsMet || !match ? "not-allowed" : "pointer",
              marginBottom: "1.5rem",
              marginTop: "0.5rem",
              clipPath:
                "polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)",
              transition: "box-shadow 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => {
              if (allReqsMet && match) {
                e.currentTarget.style.boxShadow = T.glow;
                e.currentTarget.style.background = "var(--t-heading)";
              }
            }}
            onMouseLeave={(e) => {
              if (allReqsMet && match) {
                e.currentTarget.style.boxShadow = "";
                e.currentTarget.style.background = T.g;
              }
            }}
          >
            ▶ UPDATE PASSWORD
          </button>
        </form>
      </div>
    </div>
  );
}
