"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  AlertTriangle,
  Star,
  CheckCircle,
  Clock,
  DollarSign,
  Activity,
  MessagesSquare,
  RefreshCcw,
  ArrowRight,
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import { formatDistanceToNow, format } from "date-fns";

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
      <span
        key={k}
        style={{
          position: "absolute",
          width: 14,
          height: 14,
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

const Card = ({
  title,
  value,
  sub,
  icon: Icon,
  color = T.g,
  border = T.border,
}: any) => {
  return (
    <div
      style={{
        background: T.panel,
          borderRadius: "var(--t-radius)",
        border: `1px solid ${border}`,
        padding: "1.5rem",
        position: "relative",
        boxShadow: `0 0 30px rgba(0,255,136,0.03)`,
      }}
    >
      <Corners className="corners" />
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

export default function SupportOverviewPage() {
  const [dateRange, setDateRange] = useState("this_week"); // 'today', 'this_week', 'this_month'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);
  const [knowledgeGaps, setKnowledgeGaps] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      let start_date = new Date();
      start_date.setHours(0, 0, 0, 0);
      let end_date = new Date();

      if (dateRange === "this_week") {
        const day = start_date.getDay();
        const diff = start_date.getDate() - day + (day === 0 ? -6 : 1);
        start_date.setDate(diff);
      } else if (dateRange === "this_month") {
        start_date.setDate(1);
      }

      const res = await fetchApi(
        `/analytics/support-overview?start_date=${start_date.toISOString()}&end_date=${end_date.toISOString()}`,
      );
      if (res && res.success) {
        setData(res.data);
      } else {
        throw new Error("Failed to fetch overview data");
      }

      const gapsRes = await fetchApi(`/analytics/knowledge-gaps`);
      if (gapsRes && gapsRes.success) {
        setKnowledgeGaps(gapsRes.data);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [dateRange]);

  const formatSeconds = (seconds: number) => {
    if (!seconds) return "0s";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  const capitalize = (s: string) => s && s.charAt(0).toUpperCase() + s.slice(1);

  return (
    <div style={{ padding: "2rem", maxWidth: 1400, margin: "0 auto" }}>
      <div
        style={{
          marginBottom: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
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
            <Activity color={T.g} size={32} /> Support Overview
          </h1>
          <p
            style={{
              fontFamily: T.mono,
              fontSize: "0.9rem",
              color: T.g,
              letterSpacing: "0.05em",
            }}
          >
            AI Customer Support performance and metrics.
          </p>
        </div>

        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            disabled={loading}
            style={{
              background: T.panel,
          borderRadius: "var(--t-radius)",
              border: `1px solid ${T.border}`,
              color: T.text,
              padding: "0.5rem 1rem",
              fontFamily: T.mono,
              fontSize: "0.85rem",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <option value="today">Today</option>
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
          </select>
          <button
            onClick={fetchData}
            disabled={loading}
            style={{
              background: "transparent",
              border: `1px solid ${T.border}`,
              color: T.text,
              padding: "0.5rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              opacity: loading ? 0.5 : 1,
            }}
          >
            <RefreshCcw size={16} />
          </button>
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "rgba(255,51,85,0.1)",
            border: `1px solid ${T.red}`,
            color: T.red,
            padding: "1rem",
            marginBottom: "2rem",
            fontFamily: T.body,
            fontSize: "1rem",
          }}
        >
          {error}
          <button
            onClick={fetchData}
            style={{
              marginLeft: "1rem",
              background: "transparent",
              border: `1px solid ${T.red}`,
              color: T.red,
              padding: "0.2rem 0.5rem",
              cursor: "pointer",
            }}
          >
            Retry
          </button>
        </div>
      )}

      {loading && !data && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "1.5rem",
          }}
        >
          <div
            style={{
              gridColumn: "span 12",
              display: "flex",
              justifyContent: "center",
              padding: "4rem",
              color: T.g,
              fontFamily: T.mono,
            }}
          >
            Loading Dashboard...
          </div>
        </div>
      )}

      {!loading && data && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(12, 1fr)",
            gap: "1.5rem",
          }}
        >
          {/* KPI Cards */}
          <div style={{ gridColumn: "span 12" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(6, 1fr)",
                gap: "1rem",
              }}
            >
              <Card
                title="Conversations"
                value={data.overview.totalConversations}
                sub=""
                icon={MessageSquare}
              />
              <Card
                title="Deflection Rate"
                value={`${data.overview.deflectionRate.toFixed(1)}%`}
                sub={`${data.overview.aiResolved} AI Resolved`}
                icon={CheckCircle}
              />
              <Card
                title="Escalations"
                value={data.overview.escalated}
                sub=""
                icon={AlertTriangle}
                color={T.warn}
                border={`rgba(255,170,0,0.3)`}
              />
              <Card
                title="CSAT"
                value={
                  data.overview.csat
                    ? `${Number(data.overview.csat).toFixed(1)}/5`
                    : "N/A"
                }
                sub=""
                icon={Star}
              />
              <Card
                title="Resolution Time"
                value={formatSeconds(data.overview.avgResolutionTime)}
                sub=""
                icon={Clock}
              />
              <Card
                title="Cost / Conv."
                value={
                  data.overview.costPerConversation !== null
                    ? `$${data.overview.costPerConversation}`
                    : "N/A"
                }
                sub=""
                icon={DollarSign}
              />
            </div>
          </div>

          {/* Main Content Area - Charts & Tables */}
          <div
            style={{
              gridColumn: "span 8",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            {/* Volume Chart */}
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
              <Corners className="corners" />
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
                  Conversation Volume
                </div>
              </div>

              <div style={{ height: "calc(100% - 3rem)" }}>
                {data.conversationVolume.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.conversationVolume}>
                      <XAxis
                        dataKey="date"
                        stroke={T.muted}
                        fontSize={12}
                        fontFamily={T.mono}
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis
                        stroke={T.muted}
                        fontSize={12}
                        fontFamily={T.mono}
                        tickLine={false}
                        axisLine={false}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(0,255,136,0.1)" }}
                        contentStyle={{
                          background: T.panel,
          borderRadius: "var(--t-radius)",
                          border: `1px solid ${T.border}`,
                          color: "var(--t-heading)",
                          fontFamily: T.mono,
                        }}
                      />
                      <Bar dataKey="count" fill={T.g} radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      color: T.muted,
                      fontFamily: T.mono,
                    }}
                  >
                    No conversation volume data
                  </div>
                )}
              </div>
            </div>

            {/* Recent Conversations */}
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
              <Corners className="corners" />
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
                  Recent Conversations
                </div>
                <Link
                  href="/customer-support/conversations"
                  style={{
                    color: T.g,
                    fontFamily: T.mono,
                    fontSize: "0.8rem",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  View All <ArrowRight size={14} />
                </Link>
              </div>

              {data.recentConversations.length > 0 ? (
                <div style={{ width: "100%", overflowX: "auto" }}>
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      textAlign: "left",
                      fontFamily: T.body,
                    }}
                  >
                    <thead>
                      <tr
                        style={{
                          borderBottom: `1px solid ${T.border}`,
                          color: T.muted,
                          fontFamily: T.mono,
                          fontSize: "0.75rem",
                          letterSpacing: "0.05em",
                        }}
                      >
                        <th style={{ padding: "0.75rem 0.5rem" }}>CUSTOMER</th>
                        <th style={{ padding: "0.75rem 0.5rem" }}>CHANNEL</th>
                        <th style={{ padding: "0.75rem 0.5rem" }}>STATUS</th>
                        <th style={{ padding: "0.75rem 0.5rem" }}>TIME</th>
                        <th style={{ padding: "0.75rem 0.5rem" }}>AGENT</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.recentConversations.map((c: any) => (
                        <tr
                          key={c.id}
                          style={{
                            borderBottom: `1px solid rgba(0,255,136,0.05)`,
                            color: "var(--t-heading)",
                            fontSize: "0.95rem",
                          }}
                        >
                          <td
                            style={{
                              padding: "0.75rem 0.5rem",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              maxWidth: "150px",
                            }}
                          >
                            {c.customer}
                          </td>
                          <td style={{ padding: "0.75rem 0.5rem", color: T.g }}>
                            {capitalize(c.channel)}
                          </td>
                          <td style={{ padding: "0.75rem 0.5rem" }}>
                            <span
                              style={{
                                padding: "0.2rem 0.5rem",
                                borderRadius: "2px",
                                fontSize: "0.75rem",
                                fontFamily: T.mono,
                                textTransform: "uppercase",
                                background:
                                  c.status === "resolved"
                                    ? "rgba(0,255,136,0.1)"
                                    : c.status === "escalated"
                                      ? "rgba(255,170,0,0.1)"
                                      : "var(--t-white-05)",
                                color:
                                  c.status === "resolved"
                                    ? T.g
                                    : c.status === "escalated"
                                      ? T.warn
                                      : "var(--t-heading)",
                                border: `1px solid ${c.status === "resolved" ? T.g : c.status === "escalated" ? T.warn : "var(--t-white-10)"}`,
                              }}
                            >
                              {c.status}
                            </span>
                          </td>
                          <td
                            style={{
                              padding: "0.75rem 0.5rem",
                              color: T.muted,
                              fontSize: "0.85rem",
                            }}
                          >
                            {formatDistanceToNow(new Date(c.time), {
                              addSuffix: true,
                            })}
                          </td>
                          <td
                            style={{
                              padding: "0.75rem 0.5rem",
                              color: c.agent.includes("AI") ? T.g : "var(--t-heading)",
                            }}
                          >
                            {c.agent}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    height: "100px",
                    alignItems: "center",
                    justifyContent: "center",
                    color: T.muted,
                    fontFamily: T.mono,
                  }}
                >
                  No recent conversations
                </div>
              )}
            </div>
          </div>

          {/* Side Content Area */}
          <div
            style={{
              gridColumn: "span 4",
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            {/* Channel Distribution */}
            <div
              style={{
                background: T.panel,
          borderRadius: "var(--t-radius)",
                border: `1px solid ${T.border}`,
                padding: "1.5rem",
                position: "relative",
                height: 260,
              }}
            >
              <Corners className="corners" />
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: "0.8rem",
                  color: T.muted,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "1rem",
                }}
              >
                Channel Distribution
              </div>

              <div style={{ height: "calc(100% - 2rem)" }}>
                {data.channelDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.channelDistribution}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        stroke="none"
                      >
                        {data.channelDistribution.map(
                          (entry: any, index: number) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                index === 0
                                  ? T.g
                                  : index === 1
                                    ? "#00cfff"
                                    : index === 2
                                      ? "var(--t-heading)"
                                      : T.muted
                              }
                            />
                          ),
                        )}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          background: T.panel,
          borderRadius: "var(--t-radius)",
                          border: `1px solid ${T.border}`,
                          color: "var(--t-heading)",
                          fontFamily: T.mono,
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      height: "100%",
                      alignItems: "center",
                      justifyContent: "center",
                      color: T.muted,
                      fontFamily: T.mono,
                    }}
                  >
                    No channel data available
                  </div>
                )}
              </div>
            </div>

            {/* Top Questions */}
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
              <Corners className="corners" />
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
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <MessagesSquare size={14} /> Knowledge Gaps
                </div>
                <Link
                  href="/customer-support/knowledge-gaps"
                  style={{
                    color: T.g,
                    fontFamily: T.mono,
                    fontSize: "0.8rem",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  View All <ArrowRight size={14} />
                </Link>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {knowledgeGaps.length > 0 ? (
                  knowledgeGaps.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        borderBottom: `1px solid var(--t-white-05)`,
                        paddingBottom: "1rem",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: T.body,
                          fontSize: "0.95rem",
                          color: "var(--t-heading)",
                          marginBottom: "0.5rem",
                        }}
                      >
                        "{item.question}"
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <div
                          style={{
                            flex: 1,
                            height: 4,
                            background: "var(--t-white-05)",
                            borderRadius: 2,
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(100, (Number(item.occurrence_count) / 10) * 100)}%`,
                              height: "100%",
                              background: T.warn,
                            }}
                          />
                        </div>
                        <span
                          style={{
                            fontFamily: T.mono,
                            fontSize: "0.7rem",
                            color: T.muted,
                          }}
                        >
                          {item.occurrence_count} asks
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      display: "flex",
                      padding: "2rem",
                      alignItems: "center",
                      justifyContent: "center",
                      color: T.muted,
                      fontFamily: T.mono,
                    }}
                  >
                    No knowledge gaps found
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
