"use client";

import {
  Puzzle,
  MessageSquare,
  Mail,
  Link as LinkIcon,
  Briefcase,
  Database,
  Search,
} from "lucide-react";
import { useState, useEffect } from "react";

const T = {
  g: "var(--t-g)",
  g2: "var(--t-g2)",
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          borderColor: T.g,
          borderStyle: "solid",
          borderWidth: bw as any,
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

const integrations = [
  {
    category: "CRM",
    items: [
      {
        name: "HubSpot",
        desc: "Two-way CRM synchronization",
        icon: Briefcase,
        status: "Connected",
      },
      {
        name: "Salesforce",
        desc: "Enterprise CRM synchronization",
        icon: Briefcase,
        status: "Connect",
      },
    ],
  },
  {
    category: "Support",
    items: [
      {
        name: "Zendesk",
        desc: "Import tickets and macros",
        icon: MessageSquare,
        status: "Connect",
      },
      {
        name: "Intercom",
        desc: "Live chat and knowledge base sync",
        icon: MessageSquare,
        status: "Connect",
      },
    ],
  },
  {
    category: "Communication",
    items: [
      {
        name: "Slack",
        desc: "Alerts, notifications, and commands",
        icon: MessageSquare,
        status: "Connect",
      },
      {
        name: "WhatsApp",
        desc: "Customer support via WhatsApp",
        icon: MessageSquare,
        status: "Connect",
      },
    ],
  },
  {
    category: "Email",
    items: [
      {
        name: "Gmail",
        desc: "Connect Google Workspace mailboxes",
        icon: Mail,
        status: "Connected",
      },
      {
        name: "Outlook",
        desc: "Connect Microsoft 365 mailboxes",
        icon: Mail,
        status: "Connect",
      },
      {
        name: "SMTP",
        desc: "Connect custom email providers",
        icon: Mail,
        status: "Connect",
      },
    ],
  },
  {
    category: "Lead Data",
    items: [
      {
        name: "Apollo",
        desc: "Contact and company enrichment",
        icon: Database,
        status: "Connect",
      },
      {
        name: "People Data Labs",
        desc: "Deep contact enrichment",
        icon: Database,
        status: "Connect",
      },
    ],
  },
  {
    category: "Research",
    items: [
      {
        name: "Exa",
        desc: "Neural search for deep company research",
        icon: Search,
        status: "Connected",
      },
      {
        name: "Serper",
        desc: "Google Search API for real-time data",
        icon: Search,
        status: "Connect",
      },
    ],
  },
];

export default function IntegrationsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/crm/settings");
        if (res.ok) {
          const json = await res.json();
          setData(json.data ?? json);
        }
      } catch {
        // API offline in dev — render page with defaults
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1
          style={{
            fontFamily: T.display,
            fontSize: "2.2rem",
            fontWeight: 700,
            color: "var(--t-heading)",
            marginBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <Puzzle color={T.g} size={32} /> Integrations
        </h1>
        <p
          style={{
            fontFamily: T.mono,
            fontSize: "0.9rem",
            color: T.g,
            letterSpacing: "0.05em",
          }}
        >
          Connect your AI workforce to external tools and data sources.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
        {integrations.map((section, idx) => (
          <div key={idx}>
            <div
              style={{
                fontFamily: T.mono,
                fontSize: "0.85rem",
                color: T.muted,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                marginBottom: "1.5rem",
                borderBottom: `1px solid ${T.border}`,
                paddingBottom: "0.5rem",
              }}
            >
              {section.category}
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "1.5rem",
              }}
            >
              {section.items.map((item, i) => (
                <div
                  key={i}
                  style={{
                    background: T.panel,
          borderRadius: "var(--t-radius)",
                    border: `1px solid ${T.border}`,
                    padding: "2rem",
                    position: "relative",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <Corners />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        background: "rgba(0,255,136,0.05)",
                        border: `1px solid ${T.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <item.icon size={20} color={T.text} />
                    </div>
                    <div
                      style={{
                        fontFamily: T.display,
                        fontSize: "1.2rem",
                        color: "var(--t-heading)",
                      }}
                    >
                      {item.name}
                    </div>
                  </div>
                  <p
                    style={{
                      fontFamily: T.body,
                      fontSize: "0.9rem",
                      color: T.muted,
                      lineHeight: 1.5,
                      flex: 1,
                    }}
                  >
                    {item.desc}
                  </p>

                  <div style={{ marginTop: "1.5rem" }}>
                    <button
                      style={{
                        width: "100%",
                        background:
                          item.status === "Connected"
                            ? "rgba(0,255,136,0.1)"
                            : "transparent",
                        border: `1px solid ${item.status === "Connected" ? T.g : T.border}`,
                        color: item.status === "Connected" ? T.g : T.text,
                        fontFamily: T.mono,
                        fontSize: "0.75rem",
                        fontWeight: "bold",
                        textTransform: "uppercase",
                        padding: "0.8rem",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "0.5rem",
                      }}
                    >
                      {item.status === "Connected" ? (
                        <>
                          <LinkIcon size={14} /> Connected
                        </>
                      ) : (
                        "Connect"
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
