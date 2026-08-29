"use client";

import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  MessageSquare,
  TrendingUp,
  AlertTriangle,
  Star,
  Users,
  CheckCircle,
  Target,
  Mail,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  MessageCircle,
  Search,
  MailOpen,
  Activity,
  Play,
  Plus,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useUserContext } from "@/contexts/UserContext";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  g: "var(--t-g)",
  g2: "var(--t-g2)",
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
  warn: "var(--t-warn)",
  red: "var(--t-red)",
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
const Card = ({
  title,
  value,
  sub,
  icon: Icon,
  color = T.g,
  border = T.border,
  glow = T.glow,
}: any) => {
  return (
    <div
      style={{
        background: T.panel,
          borderRadius: "var(--t-radius)",
        border: `1px solid ${border}`,
        padding: "1.5rem",
        position: "relative",
        boxShadow: `0 0 30px rgba(var(--t-g-rgb), )`,
      }}
    >
      <Corners />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            fontFamily: T.mono,
            fontSize: "0.75rem",
            color: T.muted,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </div>
        <Icon size={16} color={color} />
      </div>
      <div
        style={{
          fontFamily: T.display,
          fontSize: "2rem",
          fontWeight: 700,
          color: "var(--t-heading)",
          marginBottom: "0.5rem",
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontFamily: T.mono,
          fontSize: "0.7rem",
          color: color,
          letterSpacing: "0.05em",
        }}
      >
        {sub}
      </div>
    </div>
  );
};

export default function DashboardPage() {
  const { user } = useUserContext();
  const [hovAction, setHovAction] = useState("");

  const quickActions = [
    {
      label: "Add Knowledge",
      icon: Plus,
      href: "/support/knowledge",
      color: T.g,
      border: T.border,
      glow: T.glow,
    },
    {
      label: "Open Inbox",
      icon: MailOpen,
      href: "/support/inbox",
      color: T.g,
      border: T.border,
      glow: T.glow,
    },
    {
      label: "Create ICP",
      icon: Target,
      href: "/sales/icp",
      color: T.g2,
      border: T.border2,
      glow: T.glow2,
    },
    {
      label: "Find Leads",
      icon: Search,
      href: "/sales/discovery",
      color: T.g2,
      border: T.border2,
      glow: T.glow2,
    },
  ];

  return (
    <div style={{ padding: "2rem", maxWidth: 1400, margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontFamily: T.display,
            fontSize: "2.2rem",
            fontWeight: 700,
            color: "var(--t-heading)",
            marginBottom: "0.5rem",
          }}
        >
          Good morning, {user?.fullName || "User"}
        </h1>
        <p
          style={{
            fontFamily: T.mono,
            fontSize: "0.9rem",
            color: T.g,
            letterSpacing: "0.05em",
          }}
        >
          Here&apos;s what&apos;s happening with your AI workforce.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gap: "1.5rem",
        }}
      >
        {/* Support Metrics */}
        <div style={{ gridColumn: "span 12" }}>
          <div
            style={{
              fontFamily: T.mono,
              fontSize: "0.8rem",
              color: T.g,
              letterSpacing: "0.15em",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Activity size={14} /> SUPPORT ASSISTANT
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1.5rem",
            }}
          >
            <Card
              title="Conversations"
              value="1,284"
              sub="+12% from last week"
              icon={MessageSquare}
            />
            <Card
              title="AI Resolution Rate"
              value="86%"
              sub="+2% from last week"
              icon={CheckCircle}
            />
            <Card
              title="Escalations"
              value="24"
              sub="-5% from last week"
              icon={AlertTriangle}
              color={T.warn}
            />
            <Card
              title="CSAT"
              value="4.8/5"
              sub="+0.1 from last week"
              icon={Star}
            />
          </div>
        </div>

        {/* Sales Metrics */}
        <div style={{ gridColumn: "span 12", marginTop: "1rem" }}>
          <div
            style={{
              fontFamily: T.mono,
              fontSize: "0.8rem",
              color: T.g2,
              letterSpacing: "0.15em",
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <Target size={14} /> SALES ASSISTANT
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "1.5rem",
            }}
          >
            <Card
              title="Total Leads"
              value="5,420"
              sub="+840 this week"
              icon={Users}
              color={T.g2}
              border={T.border2}
              glow={T.glow2}
            />
            <Card
              title="Qualified Leads"
              value="1,240"
              sub="+120 this week"
              icon={CheckCircle}
              color={T.g2}
              border={T.border2}
              glow={T.glow2}
            />
            <Card
              title="Avg Lead Score"
              value="84"
              sub="+4 this week"
              icon={Star}
              color={T.g2}
              border={T.border2}
              glow={T.glow2}
            />
            <Card
              title="Replies"
              value="342"
              sub="8.4% reply rate"
              icon={Mail}
              color={T.g2}
              border={T.border2}
              glow={T.glow2}
            />
          </div>
        </div>

        {/* Main Content Area */}
        <div
          style={{
            gridColumn: "span 8",
            marginTop: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <div
            style={{
              background: T.panel,
          borderRadius: "var(--t-radius)",
              border: `1px solid ${T.border}`,
              padding: "1.5rem",
              position: "relative",
              height: 320,
            }}
          >
            <Corners />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
              }}
            >
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: "0.8rem",
                  color: T.muted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Support Activity vs Sales Pipeline
              </div>
              <div style={{ display: "flex", gap: "1rem" }}>
                <span
                  style={{
                    fontFamily: T.mono,
                    fontSize: "0.7rem",
                    color: T.g,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <div style={{ width: 8, height: 8, background: T.g }} />{" "}
                  Support
                </span>
                <span
                  style={{
                    fontFamily: T.mono,
                    fontSize: "0.7rem",
                    color: T.g2,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <div style={{ width: 8, height: 8, background: T.g2 }} />{" "}
                  Sales
                </span>
              </div>
            </div>

            {/* Mock Chart Area */}
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                height: "calc(100% - 3rem)",
                gap: "2%",
                padding: "1rem 0",
              }}
            >
              {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "flex-end",
                    gap: "4px",
                    height: "100%",
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: `${h}%`,
                      background: `linear-gradient(0deg, rgba(var(--t-g-rgb), ), ${T.g})`,
                      borderTop: `2px solid ${T.g}`,
                    }}
                  />
                  <div
                    style={{
                      width: "100%",
                      height: `${h * 0.7}%`,
                      background: `linear-gradient(0deg, rgba(var(--t-g2-rgb), ), ${T.g2})`,
                      borderTop: `2px solid ${T.g2}`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Side Content Area */}
        <div
          style={{
            gridColumn: "span 4",
            marginTop: "1rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          {/* Quick Actions */}
          <div
            style={{
              background: T.panel,
          borderRadius: "var(--t-radius)",
              border: `1px solid ${T.border}`,
              padding: "1.5rem",
              position: "relative",
            }}
          >
            <Corners />
            <div
              style={{
                fontFamily: T.mono,
                fontSize: "0.8rem",
                color: T.muted,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "1.5rem",
              }}
            >
              Quick Actions
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              {quickActions.map((action, i) => (
                <Link
                  key={i}
                  href={action.href}
                  style={{ textDecoration: "none" }}
                  onMouseEnter={() => setHovAction(action.label)}
                  onMouseLeave={() => setHovAction("")}
                >
                  <div
                    style={{
                      border: `1px solid ${action.border}`,
                      background: "var(--t-white-02)",
                      padding: "1rem",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "0.8rem",
                      transition: "all 0.2s",
                      boxShadow:
                        hovAction === action.label ? action.glow : "none",
                      borderColor:
                        hovAction === action.label
                          ? action.color
                          : action.border,
                    }}
                  >
                    <action.icon size={24} color={action.color} />
                    <span
                      style={{
                        fontFamily: T.mono,
                        fontSize: "0.7rem",
                        color: "var(--t-heading)",
                        textAlign: "center",
                      }}
                    >
                      {action.label}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Usage Stats */}
          <div
            style={{
              background: T.panel,
          borderRadius: "var(--t-radius)",
              border: `1px solid ${T.border}`,
              padding: "1.5rem",
              position: "relative",
              flex: 1,
            }}
          >
            <Corners />
            <div
              style={{
                fontFamily: T.mono,
                fontSize: "0.8rem",
                color: T.muted,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "1.5rem",
              }}
            >
              System Usage
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.2rem",
              }}
            >
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: T.mono,
                      fontSize: "0.75rem",
                      color: T.text,
                    }}
                  >
                    Messages Used
                  </span>
                  <span
                    style={{
                      fontFamily: T.mono,
                      fontSize: "0.75rem",
                      color: T.g,
                    }}
                  >
                    45k / 100k
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    background: "var(--t-white-10)",
                    borderRadius: 2,
                  }}
                >
                  <div
                    style={{
                      width: "45%",
                      height: "100%",
                      background: T.g,
                      boxShadow: T.glow,
                    }}
                  />
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: T.mono,
                      fontSize: "0.75rem",
                      color: T.text,
                    }}
                  >
                    Leads Enriched
                  </span>
                  <span
                    style={{
                      fontFamily: T.mono,
                      fontSize: "0.75rem",
                      color: T.g2,
                    }}
                  >
                    2.4k / 5k
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    background: "var(--t-white-10)",
                    borderRadius: 2,
                  }}
                >
                  <div
                    style={{
                      width: "48%",
                      height: "100%",
                      background: T.g2,
                      boxShadow: T.glow2,
                    }}
                  />
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: T.mono,
                      fontSize: "0.75rem",
                      color: T.text,
                    }}
                  >
                    Emails Sent
                  </span>
                  <span
                    style={{
                      fontFamily: T.mono,
                      fontSize: "0.75rem",
                      color: T.g2,
                    }}
                  >
                    1.2k / 10k
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    background: "var(--t-white-10)",
                    borderRadius: 2,
                  }}
                >
                  <div
                    style={{
                      width: "12%",
                      height: "100%",
                      background: T.g2,
                      boxShadow: T.glow2,
                    }}
                  />
                </div>
              </div>

              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span
                    style={{
                      fontFamily: T.mono,
                      fontSize: "0.75rem",
                      color: T.text,
                    }}
                  >
                    LLM Tokens
                  </span>
                  <span
                    style={{
                      fontFamily: T.mono,
                      fontSize: "0.75rem",
                      color: T.g,
                    }}
                  >
                    14M / 50M
                  </span>
                </div>
                <div
                  style={{
                    height: 4,
                    background: "var(--t-white-10)",
                    borderRadius: 2,
                  }}
                >
                  <div
                    style={{
                      width: "28%",
                      height: "100%",
                      background: T.g,
                      boxShadow: T.glow,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

