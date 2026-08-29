"use client";

import {
  Database,
  Plus,
  RefreshCw,
  FileText,
  Globe,
  Type,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
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

export default function KnowledgePage() {
  const [activeTab, setActiveTab] = useState("all");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Org ID will be injected by middleware, but we pass it anyway for the specific implementation
    fetchApi(
      "/knowledge/sources"
    )
      .then((data) => {
        setSources(data?.sources || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch sources", err);
        setLoading(false);
      });
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle size={14} color={T.g} />;
      case "processing":
        return (
          <RefreshCw
            size={14}
            color={T.warn}
            style={{ animation: "spin 2s linear infinite" }}
          />
        );
      case "failed":
        return <AlertTriangle size={14} color={T.red} />;
      case "pending":
        return <Clock size={14} color={T.muted} />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return T.g;
      case "processing":
        return T.warn;
      case "failed":
        return T.red;
      case "pending":
        return T.muted;
      default:
        return T.text;
    }
  };

  const filteredSources =
    activeTab === "all"
      ? sources
      : sources.filter((s) => s.status === activeTab);

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2.5rem",
        }}
      >
        <div>
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
            <Database color={T.g} size={32} /> Knowledge Base
          </h1>
          <p
            style={{
              fontFamily: T.mono,
              fontSize: "0.9rem",
              color: T.g,
              letterSpacing: "0.05em",
            }}
          >
            Manage the information your AI Support Agent uses to answer
            questions.
          </p>
        </div>
        <Link
          href="/customer-support/knowledge/add"
          style={{ textDecoration: "none" }}
        >
          <button
            style={{
              background: T.g,
              border: "none",
              padding: "0.8rem 1.5rem",
              color: T.bg,
              fontFamily: T.mono,
              fontSize: "0.8rem",
              fontWeight: "bold",
              textTransform: "uppercase",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              cursor: "pointer",
              boxShadow: T.glow,
              clipPath:
                "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
            }}
          >
            <Plus size={16} /> Add Source
          </button>
        </Link>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          marginBottom: "1.5rem",
          borderBottom: `1px solid rgba(0,255,136,0.1)`,
        }}
      >
        {["all", "ready", "processing", "failed"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: T.mono,
              fontSize: "0.85rem",
              textTransform: "uppercase",
              color: activeTab === t ? T.g : T.muted,
              borderBottom:
                activeTab === t ? `2px solid ${T.g}` : "2px solid transparent",
              paddingBottom: "0.5rem",
              transition: "all 0.2s",
            }}
          >
            {t}
          </button>
        ))}
      </div>

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

        {loading ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: T.muted,
              fontFamily: T.mono,
            }}
          >
            LOADING_SOURCES...
          </div>
        ) : filteredSources.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: T.muted,
              fontFamily: T.mono,
            }}
          >
            NO_SOURCES_FOUND
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${T.border}` }}>
                <th
                  style={{
                    textAlign: "left",
                    padding: "1rem",
                    fontFamily: T.mono,
                    fontSize: "0.75rem",
                    color: T.muted,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Source
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "1rem",
                    fontFamily: T.mono,
                    fontSize: "0.75rem",
                    color: T.muted,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Type
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "1rem",
                    fontFamily: T.mono,
                    fontSize: "0.75rem",
                    color: T.muted,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "1rem",
                    fontFamily: T.mono,
                    fontSize: "0.75rem",
                    color: T.muted,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Documents
                </th>
                <th
                  style={{
                    textAlign: "left",
                    padding: "1rem",
                    fontFamily: T.mono,
                    fontSize: "0.75rem",
                    color: T.muted,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Last Synced
                </th>
                <th
                  style={{
                    textAlign: "right",
                    padding: "1rem",
                    fontFamily: T.mono,
                    fontSize: "0.75rem",
                    color: T.muted,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredSources.map((src, i) => (
                <tr
                  key={src.id}
                  style={{
                    borderBottom:
                      i === filteredSources.length - 1
                        ? "none"
                        : `1px solid rgba(0,255,136,0.1)`,
                    transition: "background 0.2s",
                  }}
                >
                  <td
                    style={{
                      padding: "1rem",
                      fontFamily: T.body,
                      fontSize: "1rem",
                      color: "var(--t-heading)",
                      fontWeight: 600,
                    }}
                  >
                    {src.name}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        fontFamily: T.mono,
                        fontSize: "0.7rem",
                        color: T.text,
                        background: "var(--t-white-05)",
                        padding: "0.2rem 0.6rem",
                        border: `1px solid ${T.border}`,
                      }}
                    >
                      {src.type === "file" && <FileText size={12} />}
                      {src.type === "Website" && <Globe size={12} />}
                      {src.type === "Sitemap" && <Database size={12} />}
                      {src.type === "Text" && <Type size={12} />}
                      {src.type}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "0.4rem",
                        fontFamily: T.mono,
                        fontSize: "0.7rem",
                        color: getStatusColor(src.status),
                        textTransform: "uppercase",
                      }}
                    >
                      {getStatusIcon(src.status)} {src.status}
                    </span>
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      fontFamily: T.mono,
                      fontSize: "0.85rem",
                      color: T.text,
                    }}
                  >
                    {src.docs || 0}
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      fontFamily: T.mono,
                      fontSize: "0.8rem",
                      color: T.muted,
                    }}
                  >
                    {src.updated_at
                      ? new Date(src.updated_at).toLocaleString()
                      : "N/A"}
                  </td>
                  <td style={{ padding: "1rem", textAlign: "right" }}>
                    <button
                      onClick={() => alert(`Syncing source: ${src.name}...`)}
                      title="Sync Source"
                      style={{
                        background: "transparent",
                        border: "none",
                        color: T.muted,
                        cursor: "pointer",
                      }}
                    >
                      <RefreshCw size={16} />
                    </button>
                    <Link href={`/knowledge/sources/${src.id}`}>
                      <button
                        title="View Source"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: T.muted,
                          cursor: "pointer",
                          marginLeft: "1rem",
                        }}
                      >
                        <ExternalLink size={16} />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
