"use client";

import { useState, useEffect } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  Search,
  Filter,
  MessageSquare,
  Clock,
  User,
  Reply,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";

const T = {
  g: "#00ff88",
  g2: "#00cfff",
  bg: "#040810",
  bg2: "#070e1a",
  panel: "#0a1628",
  border: "rgba(0,255,136,0.18)",
  muted: "rgba(0,255,136,0.45)",
  text: "#c8ffe8",
  glow: "0 0 20px rgba(0,255,136,0.35),0 0 60px rgba(0,255,136,0.12)",
  mono: "'Share Tech Mono', monospace",
  display: "'Orbitron', sans-serif",
  body: "'Rajdhani', sans-serif",
  warn: "#ffaa00",
  red: "#ff3355",
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
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

export default function InboxLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState("open");
  const [conversations, setConversations] = useState<{
    all: any[];
    unassigned: any[];
    assigned: any[];
  }>({ all: [], unassigned: [], assigned: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const loadConvs = () => {
    fetchApi("/agent/conversations?search=" + encodeURIComponent(searchQuery))
      .then((data) => {
        setConversations(data || { all: [], unassigned: [], assigned: [] });
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch conversations", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadConvs();
    const interval = setInterval(loadConvs, 5000); // Poll every 5 seconds for real-time emulation
    return () => clearInterval(interval);
  }, [searchQuery]); // Re-run effect when search query changes

  const getFilteredList = () => {
    const list = conversations.all || [];
    return list.filter((c) => {
      if (activeTab === "open") return c.status === "active";
      return c.status === activeTab;
    });
  };

  const list = getFilteredList();

  return (
    <div
      style={{
        height: "calc(100vh - 80px)",
        display: "flex",
        overflow: "hidden",
      }}
    >
      {/* 1. Conversations List (Left Column) */}
      <div
        style={{
          width: 320,
          borderRight: `1px solid ${T.border}`,
          background: T.bg2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Filters Header */}
        <div
          style={{ padding: "1.5rem", borderBottom: `1px solid ${T.border}` }}
        >
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            {["open", "escalated", "resolved"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: T.mono,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  color: activeTab === t ? T.g : T.muted,
                  borderBottom:
                    activeTab === t
                      ? `2px solid ${T.g}`
                      : "2px solid transparent",
                  paddingBottom: "0.3rem",
                  transition: "all 0.2s",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ position: "relative" }}>
            <Search
              size={14}
              color={T.muted}
              style={{ position: "absolute", left: 10, top: 10 }}
            />
            <input
              type="text"
              placeholder="Search by name, tag, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                background: T.panel,
                border: `1px solid ${T.border}`,
                color: T.text,
                fontFamily: T.mono,
                fontSize: "0.75rem",
                padding: "0.5rem 1rem 0.5rem 2rem",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loading ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: T.muted,
                fontFamily: T.mono,
                fontSize: "0.8rem",
              }}
            >
              LOADING_CONVERSATIONS...
            </div>
          ) : list.length === 0 ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: T.muted,
                fontFamily: T.mono,
                fontSize: "0.8rem",
              }}
            >
              NO_CONVERSATIONS_FOUND
            </div>
          ) : (
            list.map((c, i) => (
              <Link
                key={c.id}
                href={`/customer-support/inbox/${c.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    padding: "1.2rem",
                    borderBottom: `1px solid ${T.border}`,
                    cursor: "pointer",
                    transition: "background 0.2s",
                    background: "transparent",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(0,255,136,0.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: T.body,
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        color: "#fff",
                      }}
                    >
                      {c.end_user?.name ||
                        c.end_user?.email ||
                        c.end_user?.external_id ||
                        "Anonymous User"}
                    </span>
                    <span
                      style={{
                        fontFamily: T.mono,
                        fontSize: "0.7rem",
                        color: T.muted,
                      }}
                    >
                      {new Date(c.updated_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: T.body,
                      fontSize: "0.85rem",
                      color: T.muted,
                      marginBottom: "0.8rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {c.status.toUpperCase()}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <span
                      style={{
                        fontFamily: T.mono,
                        fontSize: "0.6rem",
                        padding: "0.2rem 0.4rem",
                        background: "rgba(0,255,136,0.1)",
                        border: `1px solid ${T.border}`,
                        color: T.g,
                      }}
                    >
                      {c.channel}
                    </span>
                    {c.csat_score && (
                      <span
                        style={{
                          fontFamily: T.mono,
                          fontSize: "0.6rem",
                          padding: "0.2rem 0.4rem",
                          background: "rgba(0,207,255,0.1)",
                          border: `1px solid rgba(0,207,255,0.3)`,
                          color: T.g2,
                        }}
                      >
                        CSAT: {c.csat_score}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* 2. Conversation View / Details */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: T.bg,
          position: "relative",
        }}
      >
        {children}
      </div>
    </div>
  );
}
