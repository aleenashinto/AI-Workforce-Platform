"use client";

import { Settings, User, Building, Bell, Shield, FileText } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const T = {
  g: "var(--t-g)",
  bg: "var(--t-bg)",
  bg2: "var(--t-bg2)",
  panel: "var(--t-panel)",
  border: "var(--t-border)",
  muted: "var(--t-muted)",
  text: "var(--t-text)",
  glow: "var(--t-glow)",
  mono: "var(--t-font-mono)",
  display: "var(--t-font-display)",
  body: "var(--t-font-body)",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navGroups = [
    {
      title: "ACCOUNT",
      items: [
        {
          label: "Notifications",
          path: "/platform/settings/notifications",
          icon: Bell,
        },
        {
          label: "Security",
          path: "/platform/settings/security",
          icon: Shield,
        },
      ],
    },
    {
      title: "ORGANIZATION",
      items: [
        {
          label: "Organization",
          path: "/platform/settings/organization",
          icon: Building,
        },
      ],
    },
    {
      title: "DEVELOPER",
      items: [
        {
          label: "Audit Logs",
          path: "/platform/settings/audit-logs",
          icon: FileText,
        },
      ],
    },
  ];

  return (
    <div
      style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: "3rem" }}
    >
      {/* Settings Navigation Sidebar */}
      <div
        style={{
          width: 220,
          flexShrink: 0,
          position: "sticky",
          top: "2rem",
          alignSelf: "flex-start",
          height: "fit-content",
        }}
      >
        <h1
          style={{
            fontFamily: T.display,
            fontSize: "2.2rem",
            fontWeight: 700,
            color: "var(--t-heading)",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <Settings color={T.g} size={32} /> Settings
        </h1>

        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {navGroups.map((group, gIdx) => (
            <div key={gIdx}>
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: "0.65rem",
                  letterSpacing: "0.1em",
                  color: T.muted,
                  marginBottom: "0.8rem",
                  textTransform: "uppercase",
                }}
              >
                {group.title}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.2rem",
                }}
              >
                {group.items.map((nav, i) => {
                  const active = pathname === nav.path;
                  return (
                    <Link
                      key={i}
                      href={nav.path}
                      style={{ textDecoration: "none" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.8rem",
                          padding: "0.6rem 1rem",
                          background: active
                            ? "rgba(var(--t-g-rgb), )"
                            : "transparent",
                          borderLeft: active
                            ? `2px solid ${T.g}`
                            : "2px solid transparent",
                          cursor: "pointer",
                          color: active ? T.g : T.text,
                          fontFamily: T.mono,
                          fontSize: "0.85rem",
                          transition: "all 0.2s",
                        }}
                      >
                        <nav.icon size={16} /> {nav.label}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Settings Content */}
      <div style={{ flex: 1, paddingBottom: "4rem" }}>{children}</div>
    </div>
  );
}
