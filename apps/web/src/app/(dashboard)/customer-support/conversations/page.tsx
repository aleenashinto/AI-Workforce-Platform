"use client";

import { useState, useEffect, useRef } from "react";
import {
  Filter,
  MessageSquare,
  Download,
  Search,
  CheckCircle,
  ShieldAlert,
  ChevronDown,
} from "lucide-react";
import { fetchApi } from "@/lib/api";

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
  muted2: "rgba(0,207,255,0.45)",
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
          width: 8,
          height: 8,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          borderColor: T.g,
          borderStyle: "solid",
          borderWidth: bw as any,
          opacity: 0.5,
          top: t === "auto" ? undefined : 4,
          left: l === "auto" ? undefined : 4,
          bottom: b === "auto" ? undefined : 4,
          right: r === "auto" ? undefined : 4,
        }}
      />
    ))}
  </>
);

export default function ConversationsHistory() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  const filterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setShowFilters(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    fetchApi("/agent/conversations")
      .then((res) => {
        const all = [...(res.unassigned || []), ...(res.assigned || [])];
        setData(all);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch conversations", err);
        setLoading(false);
      });
  }, []);

  const filteredData = data.filter((d) => {
    const q = search.toLowerCase();
    const customerStr = (
      d.end_user?.name ||
      d.end_user?.email ||
      d.end_user?.external_id ||
      ""
    ).toLowerCase();
    const matchesSearch =
      d.id.toLowerCase().includes(q) ||
      customerStr.includes(q) ||
      d.channel?.toLowerCase().includes(q);
    const matchesStatus =
      filterStatus === "all" ||
      d.status === filterStatus ||
      (!d.status && filterStatus === "active");
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    const headers = [
      "TICKET_ID",
      "CUSTOMER",
      "CHANNEL",
      "MSGS",
      "CONFIDENCE",
      "RESOLUTION",
      "DATE",
    ];
    const rows = filteredData.map((d) => {
      const customer = (
        d.end_user?.name ||
        d.end_user?.email ||
        d.end_user?.external_id ||
        "Unknown"
      ).replace(/,/g, "");
      return [
        d.id,
        customer,
        d.channel || "",
        d.messages?.length || 0,
        d.metadata?.confidence || "",
        d.status?.toUpperCase() || "OPEN",
        new Date(d.created_at).toISOString(),
      ].join(",");
    });
    const csvContent = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "conversation_logs.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", paddingBottom: "4rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyItems: "center",
          justifyContent: "space-between",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: T.display,
              fontSize: "1.8rem",
              color: "var(--t-heading)",
              textShadow: T.glow,
            }}
          >
            Global Conversation Logs
          </h2>
          <p
            style={{
              fontFamily: T.mono,
              fontSize: "0.75rem",
              color: T.muted,
              letterSpacing: "0.1em",
              marginTop: "0.4rem",
            }}
          >
            INDEXED_RECORDS:{" "}
            <span style={{ color: T.g }}>{filteredData.length}</span>{" "}
            {"// RETENTION: 365 DAYS"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Search
              size={16}
              color={T.muted}
              style={{ position: "absolute", left: 12 }}
            />
            <input
              type="text"
              placeholder="Query logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: "0.6rem 1rem 0.6rem 2.5rem",
                width: 250,
                background: "rgba(0,0,0,0.3)",
                border: `1px solid ${T.border}`,
                color: T.text,
                fontFamily: T.mono,
                fontSize: "0.8rem",
                outline: "none",
              }}
            />
          </div>
          {/* Filter button & popover */}
          <div style={{ position: "relative" }} ref={filterRef}>
            <button
              style={{
                fontFamily: T.mono,
                fontSize: "0.75rem",
                letterSpacing: "0.1em",
                color: showFilters ? T.g : T.text,
                background: showFilters ? "rgba(var(--t-g-rgb), 0.15)" : "var(--t-bg2)",
                border: `1px solid ${showFilters ? T.g : T.border}`,
                padding: "0.6rem 1.2rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                borderRadius: "var(--t-radius)",
                transition: "all 0.2s",
              }}
              onClick={() => setShowFilters((prev) => !prev)}
            >
              <Filter size={14} color={showFilters ? T.g : "currentColor"} />
              <span>FILTER</span>
              {filterStatus !== "all" && (
                <span
                  style={{
                    background: T.g,
                    color: T.bg,
                    borderRadius: "50%",
                    width: 14,
                    height: 14,
                    fontSize: "0.55rem",
                    fontWeight: "bold",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  1
                </span>
              )}
              <ChevronDown
                size={12}
                style={{
                  transform: showFilters ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s",
                }}
              />
            </button>

            {showFilters && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 0.5rem)",
                  right: 0,
                  background: T.panel,
                  borderRadius: "var(--t-radius)",
                  border: `1px solid ${T.border}`,
                  padding: "0.8rem",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
                  zIndex: 100,
                  minWidth: 200,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{
                    fontFamily: T.mono,
                    fontSize: "0.65rem",
                    color: T.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "0.2rem",
                  }}
                >
                  Status Filter
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
                  {[
                    { label: "All Statuses", value: "all" },
                    { label: "Active / Open", value: "active" },
                    { label: "Resolved", value: "resolved" },
                    { label: "Escalated", value: "escalated" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setFilterStatus(opt.value);
                        setShowFilters(false);
                      }}
                      style={{
                        fontFamily: T.mono,
                        fontSize: "0.75rem",
                        padding: "0.45rem 0.75rem",
                        textAlign: "left",
                        cursor: "pointer",
                        background: filterStatus === opt.value ? "rgba(var(--t-g-rgb), 0.15)" : "transparent",
                        border: `1px solid ${filterStatus === opt.value ? T.g : "transparent"}`,
                        color: filterStatus === opt.value ? T.g : T.text,
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        transition: "all 0.15s",
                      }}
                    >
                      <span>{opt.label}</span>
                      {filterStatus === opt.value && <CheckCircle size={12} color={T.g} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <button
            style={{
              fontFamily: T.mono,
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              color: T.bg,
              background: T.g,
              border: "none",
              padding: "0.6rem 1.2rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)",
              boxShadow: T.glow,
            }}
            onClick={handleExportCSV}
          >
            <Download size={14} /> EXPORT CSV
          </button>
        </div>
      </div>

      <div
        style={{
          background: T.panel,
          borderRadius: "var(--t-radius)",
          border: `1px solid ${T.border}`,
          position: "relative",
        }}
      >
        <Corners />
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            textAlign: "left",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: `1px solid ${T.border}`,
                background: "rgba(0,255,136,0.02)",
              }}
            >
              <th
                style={{
                  padding: "1.2rem 1rem",
                  fontFamily: T.mono,
                  fontSize: "0.75rem",
                  color: T.muted,
                  fontWeight: "normal",
                }}
              >
                TICKET_ID
              </th>
              <th
                style={{
                  padding: "1.2rem 1rem",
                  fontFamily: T.mono,
                  fontSize: "0.75rem",
                  color: T.muted,
                  fontWeight: "normal",
                }}
              >
                CUSTOMER
              </th>
              <th
                style={{
                  padding: "1.2rem 1rem",
                  fontFamily: T.mono,
                  fontSize: "0.75rem",
                  color: T.muted,
                  fontWeight: "normal",
                }}
              >
                CHANNEL
              </th>
              <th
                style={{
                  padding: "1.2rem 1rem",
                  fontFamily: T.mono,
                  fontSize: "0.75rem",
                  color: T.muted,
                  fontWeight: "normal",
                }}
              >
                MSGS
              </th>
              <th
                style={{
                  padding: "1.2rem 1rem",
                  fontFamily: T.mono,
                  fontSize: "0.75rem",
                  color: T.muted,
                  fontWeight: "normal",
                }}
              >
                CITATIONS
              </th>
              <th
                style={{
                  padding: "1.2rem 1rem",
                  fontFamily: T.mono,
                  fontSize: "0.75rem",
                  color: T.muted,
                  fontWeight: "normal",
                }}
              >
                CONFIDENCE
              </th>
              <th
                style={{
                  padding: "1.2rem 1rem",
                  fontFamily: T.mono,
                  fontSize: "0.75rem",
                  color: T.muted,
                  fontWeight: "normal",
                }}
              >
                RESOLUTION
              </th>
              <th
                style={{
                  padding: "1.2rem 1rem",
                  fontFamily: T.mono,
                  fontSize: "0.75rem",
                  color: T.muted,
                  fontWeight: "normal",
                  textAlign: "right",
                }}
              >
                DATE
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={8}
                  style={{
                    padding: "2rem",
                    textAlign: "center",
                    color: T.muted,
                    fontFamily: T.mono,
                  }}
                >
                  LOADING...
                </td>
              </tr>
            ) : (
              filteredData.map((d) => (
                <tr
                  key={d.id}
                  style={{
                    borderBottom: `1px solid rgba(0,255,136,0.05)`,
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(0,255,136,0.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <td
                    style={{
                      padding: "1rem",
                      fontFamily: T.mono,
                      fontSize: "0.85rem",
                      color: "var(--t-heading)",
                    }}
                  >
                    {d.id.substring(0, 8)}
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      fontFamily: T.body,
                      fontSize: "0.95rem",
                      color: "var(--t-heading)",
                      fontWeight: 600,
                    }}
                  >
                    {d.end_user?.name ||
                      d.end_user?.email ||
                      d.end_user?.external_id ||
                      "Unknown"}
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      fontFamily: T.mono,
                      fontSize: "0.75rem",
                      color: T.muted,
                    }}
                  >
                    {d.channel}
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      fontFamily: T.mono,
                      fontSize: "0.85rem",
                      color: "var(--t-heading)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                      }}
                    >
                      <MessageSquare size={14} color={T.muted} />{" "}
                      {d.messages?.length || 0}
                    </div>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        fontFamily: T.mono,
                        fontSize: "0.75rem",
                        padding: "0.2rem 0.5rem",
                        border: `1px dashed ${(d.metadata?.citations?.length || 0) > 0 ? T.g : T.muted}`,
                        color:
                          (d.metadata?.citations?.length || 0) > 0
                            ? T.g
                            : T.muted,
                        borderRadius: 2,
                      }}
                    >
                      [{d.metadata?.citations?.length || 0} REFS]
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        fontFamily: T.mono,
                        fontSize: "0.75rem",
                        color:
                          (d.metadata?.confidence || 0) > 80 ? T.g : T.warn,
                      }}
                    >
                      {d.metadata?.confidence || "--"}%
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      {d.status === "resolved" ? (
                        <CheckCircle size={14} color={T.g} />
                      ) : (
                        <span
                          style={{
                            width: 14,
                            height: 14,
                            borderRadius: "50%",
                            border: `1px solid ${T.muted}`,
                          }}
                        />
                      )}
                      {d.status === "escalated" && (
                        <ShieldAlert size={14} color={T.warn} />
                      )}
                      <span
                        style={{
                          fontFamily: T.mono,
                          fontSize: "0.75rem",
                          color: d.status === "resolved" ? T.g : T.muted,
                        }}
                      >
                        {d.status?.toUpperCase() || "OPEN"}
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "1rem",
                      fontFamily: T.mono,
                      fontSize: "0.75rem",
                      color: T.muted,
                      textAlign: "right",
                    }}
                  >
                    {new Date(d.created_at).toLocaleString()}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
