"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { T, Corners, ActionBtn } from "../shared";
import { Check } from "lucide-react";

export default function CompletePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");
  const [modules, setModules] = useState({ support: true, sales: false });

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/onboarding/state`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data?.settings?.modules) {
          setModules({
            support: data.data.settings.modules.support ?? true,
            sales: data.data.settings.modules.sales ?? false,
          });
        }
        setInitialLoading(false);
      })
      .catch(() => setInitialLoading(false));
  }, []);

  const handleFinish = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/onboarding/complete`,
        { credentials: "include", method: "POST" },
      );
      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Failed to complete onboarding");
        setLoading(false);
      } else {
        // Force a full page reload so UserContext refetches the updated user.roles from backend
        window.location.href = "/dashboard";
      }
    } catch (err) {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div style={{ color: T.g, fontFamily: T.mono }}>
        Loading finalization...
      </div>
    );
  }

  const configuredModules = [];
  if (modules.support) configuredModules.push("Customer Support Agent");
  if (modules.sales) configuredModules.push("Sales Assistant");

  const checklist = [
    "Profile setup completed",
    "Workspace configured",
    "Role & Preferences saved",
  ];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 500,
        background: T.panel,
          borderRadius: "var(--t-radius)",
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
        <Check size={32} color={T.g} />
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
        {/* ONBOARDING COMPLETE */}
      </div>

      <h1
        style={{
          fontFamily: T.display,
          fontSize: "2.2rem",
          fontWeight: 700,
          color: "var(--t-heading)",
          marginBottom: "2rem",
          lineHeight: 1.2,
        }}
      >
        Your AI Workforce
        <br />
        is Ready
      </h1>

      {error && (
        <div
          style={{
            background: "rgba(255,51,85,0.1)",
            border: `1px solid ${T.red}`,
            color: T.red,
            padding: "0.8rem",
            marginBottom: "1.5rem",
            fontFamily: T.body,
            fontSize: "0.95rem",
          }}
        >
          {error}
        </div>
      )}

      <div
        style={{
          background: "rgba(0,255,136,0.02)",
          border: `1px solid ${T.border}`,
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          marginBottom: "2.5rem",
          textAlign: "left",
        }}
      >
        {checklist.map((item, index) => (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.8rem",
              fontFamily: T.mono,
              fontSize: "0.85rem",
              color: T.text,
            }}
          >
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "rgba(0,255,136,0.1)",
                border: `1px solid ${T.border}`,
              }}
            >
              <Check size={12} color={T.g} />
            </span>
            {item}
          </div>
        ))}
      </div>

      <button
        onClick={handleFinish}
        disabled={loading}
        style={{
          width: "100%",
          background: T.g,
          color: T.bg,
          border: "none",
          padding: "1rem 1.5rem",
          fontFamily: T.mono,
          fontWeight: "bold",
          cursor: loading ? "not-allowed" : "pointer",
          letterSpacing: "0.1em",
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "FINALIZING..." : "▶ GO TO DASHBOARD"}
      </button>
    </div>
  );
}
