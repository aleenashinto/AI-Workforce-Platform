"use client";

import { T, Corners, ActionBtn } from "./shared";

export default function WelcomePage() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 500,
        background: T.panel,
        border: `1px solid ${T.border}`,
        padding: "3rem",
        position: "relative",
        boxShadow: `0 0 60px rgba(0,255,136,0.1), 0 0 0 1px rgba(0,255,136,0.06)`,
        textAlign: "center",
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
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "rgba(0,255,136,0.1)",
          border: `1px solid ${T.border}`,
          marginBottom: "2rem",
          boxShadow: T.glow,
        }}
      >
        <span style={{ fontFamily: T.display, fontSize: "1.5rem", color: T.g }}>
          AI
        </span>
      </div>

      <div
        style={{
          fontFamily: T.mono,
          fontSize: "0.75rem",
          letterSpacing: "0.15em",
          color: T.g,
          marginBottom: "0.8rem",
          textTransform: "uppercase",
        }}
      >
        {/* INITIALIZATION */}
      </div>

      <h1
        style={{
          fontFamily: T.display,
          fontSize: "2.2rem",
          fontWeight: 700,
          color: "var(--t-heading)",
          marginBottom: "1rem",
          lineHeight: 1.2,
        }}
      >
        Welcome to
        <br />
        AI Workforce
      </h1>

      <p
        style={{
          fontFamily: T.body,
          fontSize: "1.1rem",
          color: "rgba(200,255,232,0.6)",
          marginBottom: "2.5rem",
          lineHeight: 1.6,
        }}
      >
        Let&apos;s build your AI workforce.
        <br />
        <span style={{ fontSize: "0.95rem", color: T.muted }}>
          This will only take a few minutes.
        </span>
      </p>

      <ActionBtn
        asLink
        href="/onboarding/profile"
        filled
        style={{ width: "100%" }}
      >
        ▶ GET STARTED
      </ActionBtn>
    </div>
  );
}
