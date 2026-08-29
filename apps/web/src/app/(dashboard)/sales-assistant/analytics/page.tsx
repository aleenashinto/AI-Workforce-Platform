"use client";

import {
  BarChart2,
  Users,
  Target,
  Mail,
  MessageSquare,
  Calendar,
  RefreshCw,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { apiClient } from "@/lib/api/client";

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
  muted2: "rgba(var(--t-g2-rgb), )",
  text: "var(--t-text)",
  glow2: "var(--t-glow2)",
  mono: "var(--t-font-mono)",
  display: "var(--t-font-display)",
  body: "var(--t-font-body)",
};

/* ── Corner decoration ──────────────────────────────────────────────── */
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
          borderColor: T.g2,
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

/* ── Skeleton placeholder ───────────────────────────────────────────── */
const Skeleton = ({
  height = "2rem",
  width = "100%",
}: {
  height?: string;
  width?: string;
}) => (
  <div
    style={{
      height,
      width,
      background: "rgba(var(--t-g2-rgb), )",
      borderRadius: 4,
      animation: "pulse 1.5s ease-in-out infinite",
    }}
  />
);

/* ── KPI Card ───────────────────────────────────────────────────────── */
const StatCard = ({
  title,
  value,
  icon: Icon,
  sub,
  loading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  sub?: string;
  loading?: boolean;
}) => (
  <div
    style={{
      background: T.panel,
          borderRadius: "var(--t-radius)",
      border: `1px solid ${T.border2}`,
      padding: "1.5rem",
      position: "relative",
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
          color: T.muted2,
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {title}
      </div>
      <Icon size={16} color={T.g2} />
    </div>
    {loading ? (
      <Skeleton height="2.5rem" width="70%" />
    ) : (
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
    )}
    {sub && (
      <div
        style={{
          fontFamily: T.mono,
          fontSize: "0.7rem",
          color: T.muted2,
        }}
      >
        {sub}
      </div>
    )}
  </div>
);

/* ── Panel wrapper ──────────────────────────────────────────────────── */
const Panel = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div
    style={{
      background: T.panel,
          borderRadius: "var(--t-radius)",
      border: `1px solid ${T.border2}`,
      padding: "2rem",
      position: "relative",
    }}
  >
    <Corners />
    <div
      style={{
        fontFamily: T.mono,
        fontSize: "0.85rem",
        color: T.g2,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        marginBottom: "1.5rem",
      }}
    >
      {title}
    </div>
    {children}
  </div>
);

/* ─────────────────────────────────────────────
   TYPES
───────────────────────────────────────────── */
interface Overview {
  totalLeads: number;
  qualified: number;
  contacted: number;
  replied: number;
  emailsSent: number;
  meetingsBooked: number;
  pipelineValue: number;
  winRate: number;
  replyRate: number;
}

interface FunnelRow {
  stage: string;
  count: number;
  pct: number;
}

interface OutreachRow {
  date: string;
  sent: number;
  replied: number;
}

interface SeqRow {
  id: string;
  name: string;
  status: string;
  enrolled: number;
  sent: number;
  replied: number;
  replyRate: number;
  meetings: number;
}

interface MbRow {
  id: string;
  email: string;
  displayName: string | null;
  status: string;
  healthScore: number;
  sent: number;
  delivered: number;
  replied: number;
  bounced: number;
  replyRate: number;
}

/* ─────────────────────────────────────────────
   PAGE
───────────────────────────────────────────── */
export default function AnalyticsPage() {
  const [days, setDays] = useState<number>(30);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [funnel, setFunnel] = useState<FunnelRow[]>([]);
  const [outreach, setOutreach] = useState<OutreachRow[]>([]);
  const [seqStats, setSeqStats] = useState<SeqRow[]>([]);
  const [mbStats, setMbStats] = useState<MbRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async (d: number) => {
    setLoading(true);
    setError(null);
    try {
      const qs = `?days=${d}`;
      const [ovRes, fnRes, orRes, sqRes, mbRes] = await Promise.all([
        apiClient.get(`/sales/analytics${qs}`) as Promise<{
          success: boolean;
          data: Overview;
        }>,
        apiClient.get(`/sales/analytics/funnel${qs}`) as Promise<{
          success: boolean;
          data: FunnelRow[];
        }>,
        apiClient.get(`/sales/analytics/outreach${qs}`) as Promise<{
          success: boolean;
          data: OutreachRow[];
        }>,
        apiClient.get(`/sales/analytics/sequences${qs}`) as Promise<{
          success: boolean;
          data: SeqRow[];
        }>,
        apiClient.get(`/sales/analytics/mailboxes${qs}`) as Promise<{
          success: boolean;
          data: MbRow[];
        }>,
      ]);
      if (ovRes.success) setOverview(ovRes.data);
      if (fnRes.success) setFunnel(fnRes.data);
      if (orRes.success) setOutreach(orRes.data);
      if (sqRes.success) setSeqStats(sqRes.data);
      if (mbRes.success) setMbStats(mbRes.data);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll(days);
  }, [days, fetchAll]);

  const fmt = (n: number) => n.toLocaleString();

  return (
    <div style={{ padding: "2rem", maxWidth: 1400, margin: "0 auto" }}>
      {/* ── HEADER ───────────────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2.5rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: T.display,
              fontSize: "2rem",
              fontWeight: 700,
              color: "var(--t-heading)",
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <BarChart2 color={T.g2} size={32} /> Sales Analytics
          </h1>
          <p
            style={{
              fontFamily: T.mono,
              fontSize: "0.85rem",
              color: T.g2,
              letterSpacing: "0.05em",
            }}
          >
            Performance metrics across your AI sales pipeline.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {/* Date range selector */}
          {[7, 30, 90].map((d) => (
            <button
              key={d}
              onClick={() => setDays(d)}
              style={{
                background: days === d ? T.g2 : "transparent",
                border: `1px solid ${T.border2}`,
                color: days === d ? "var(--t-bg)" : T.text,
                fontFamily: T.mono,
                fontSize: "0.75rem",
                padding: "0.5rem 1rem",
                cursor: "pointer",
                fontWeight: days === d ? 700 : 400,
                transition: "all 0.2s",
              }}
            >
              {d}d
            </button>
          ))}

          <button
            onClick={() => fetchAll(days)}
            style={{
              background: "transparent",
              border: `1px solid ${T.border2}`,
              color: T.g2,
              padding: "0.5rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* ── ERROR ────────────────────────────────────────────────── */}
      {error && (
        <div
          style={{
            background: "rgba(255,51,85,0.07)",
            border: "1px solid rgba(255,51,85,0.4)",
            padding: "1.5rem",
            marginBottom: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            fontFamily: T.mono,
            fontSize: "0.85rem",
            color: "#ff3355",
          }}
        >
          <AlertCircle size={20} /> {error}
        </div>
      )}

      {/* ── KPI CARDS ────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <StatCard
          title="Total Leads"
          value={overview ? fmt(overview.totalLeads) : "—"}
          icon={Users}
          sub={`Last ${days} days`}
          loading={loading}
        />
        <StatCard
          title="Qualified"
          value={overview ? fmt(overview.qualified) : "—"}
          icon={Target}
          sub="Qualified status"
          loading={loading}
        />
        <StatCard
          title="Emails Sent"
          value={overview ? fmt(overview.emailsSent) : "—"}
          icon={Mail}
          sub={`${overview?.replyRate ?? 0}% reply rate`}
          loading={loading}
        />
        <StatCard
          title="Replied"
          value={overview ? fmt(overview.replied) : "—"}
          icon={MessageSquare}
          sub="Unique leads replied"
          loading={loading}
        />
        <StatCard
          title="Meetings Booked"
          value={overview ? fmt(overview.meetingsBooked) : "—"}
          icon={Calendar}
          loading={loading}
        />
        <StatCard
          title="Pipeline Value"
          value={
            overview
              ? `$${(overview.pipelineValue / 1000).toFixed(1)}K`
              : "—"
          }
          icon={DollarSign}
          sub={`Win rate: ${overview?.winRate ?? 0}%`}
          loading={loading}
        />
      </div>

      {/* ── FUNNEL + OUTREACH TREND ───────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.6fr",
          gap: "2rem",
          marginBottom: "2rem",
        }}
      >
        {/* Sales Funnel */}
        <Panel title="Conversion Funnel">
          {loading ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} height="2.5rem" />
              ))}
            </div>
          ) : funnel.length === 0 ? (
            <div
              style={{
                fontFamily: T.mono,
                color: T.muted2,
                fontSize: "0.85rem",
              }}
            >
              No funnel data yet — seed data or add leads.
            </div>
          ) : (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "0.9rem" }}
            >
              {funnel.map((stage, i) => {
                const colors = [
                  "rgba(var(--t-g2-rgb), )",
                  "rgba(var(--t-g2-rgb), )",
                  "rgba(var(--t-g2-rgb), )",
                  "rgba(var(--t-g2-rgb), )",
                  "rgba(var(--t-g2-rgb), )",
                  "rgba(var(--t-g2-rgb), )",
                  T.g2,
                ];
                return (
                  <div
                    key={stage.stage}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                    }}
                  >
                    <div
                      style={{
                        width: 120,
                        fontFamily: T.mono,
                        fontSize: "0.78rem",
                        color: T.muted2,
                        textAlign: "right",
                        flexShrink: 0,
                      }}
                    >
                      {stage.stage}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        height: 34,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.max(stage.pct, 2)}%`,
                          height: "100%",
                          background: colors[Math.min(i, colors.length - 1)],
                          border: `1px solid ${T.border2}`,
                          display: "flex",
                          alignItems: "center",
                          paddingLeft: "0.75rem",
                          fontFamily: T.body,
                          fontSize: "0.9rem",
                          color: "var(--t-heading)",
                          fontWeight: 600,
                          transition: "width 0.8s ease-out",
                        }}
                      >
                        {stage.count > 0 ? fmt(stage.count) : ""}
                      </div>
                    </div>
                    <div
                      style={{
                        width: 44,
                        fontFamily: T.mono,
                        fontSize: "0.78rem",
                        color: T.text,
                        flexShrink: 0,
                      }}
                    >
                      {stage.pct}%
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        {/* Outreach Trend */}
        <Panel title={`Outreach Trend — Last ${days} Days`}>
          {loading ? (
            <Skeleton height="220px" />
          ) : outreach.length === 0 ? (
            <div
              style={{
                fontFamily: T.mono,
                color: T.muted2,
                fontSize: "0.85rem",
                textAlign: "center",
                paddingTop: "3rem",
              }}
            >
              No outreach data in this window.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart
                data={outreach}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(var(--t-g2-rgb), )"
                />
                <XAxis
                  dataKey="date"
                  tick={{
                    fill: T.muted2,
                    fontSize: 10,
                    fontFamily: T.mono,
                  }}
                  tickFormatter={(v: string) => v.slice(5)} // show MM-DD
                />
                <YAxis
                  tick={{
                    fill: T.muted2,
                    fontSize: 10,
                    fontFamily: T.mono,
                  }}
                />
                <Tooltip
                  contentStyle={{
                    background: T.panel,
          borderRadius: "var(--t-radius)",
                    border: `1px solid ${T.border2}`,
                    fontFamily: T.mono,
                    fontSize: 12,
                  }}
                  labelStyle={{ color: T.g2 }}
                  itemStyle={{ color: "var(--t-heading)" }}
                />
                <Legend
                  wrapperStyle={{
                    fontFamily: T.mono,
                    fontSize: 11,
                    color: T.muted2,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sent"
                  stroke={T.g2}
                  strokeWidth={2}
                  dot={false}
                  name="Sent"
                />
                <Line
                  type="monotone"
                  dataKey="replied"
                  stroke={T.g}
                  strokeWidth={2}
                  dot={false}
                  name="Replied"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Panel>
      </div>

      {/* ── SEQUENCES TABLE ───────────────────────────────────────── */}
      <Panel title="Sequence Performance">
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} height="2.5rem" />
            ))}
          </div>
        ) : seqStats.length === 0 ? (
          <div
            style={{
              fontFamily: T.mono,
              color: T.muted2,
              fontSize: "0.85rem",
            }}
          >
            No sequences found. Run seed_sequences_final.cjs to add demo data.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontFamily: T.mono,
                fontSize: "0.82rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: `1px solid ${T.border2}`,
                    color: T.muted2,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                  }}
                >
                  {[
                    "Sequence",
                    "Status",
                    "Enrolled",
                    "Sent",
                    "Replied",
                    "Reply Rate",
                    "Meetings",
                  ].map((h) => (
                    <th
                      key={h}
                      style={{
                        padding: "0.75rem 1rem",
                        fontWeight: 400,
                        textAlign: h === "Sequence" ? "left" : "right",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {seqStats.map((s) => (
                  <tr
                    key={s.id}
                    style={{
                      borderBottom: `1px solid rgba(var(--t-g2-rgb), )`,
                    }}
                  >
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        color: "var(--t-heading)",
                        fontWeight: 600,
                      }}
                    >
                      {s.name}
                      <div
                        style={{
                          fontSize: "0.7rem",
                          color: T.muted2,
                          marginTop: 2,
                        }}
                      >
                        {s.status}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "right",
                        color:
                          s.status === "active"
                            ? T.g
                            : s.status === "paused"
                              ? "#ffaa00"
                              : T.muted2,
                      }}
                    >
                      {s.status}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "right",
                        color: "var(--t-heading)",
                      }}
                    >
                      {fmt(s.enrolled)}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "right",
                        color: T.text,
                      }}
                    >
                      {fmt(s.sent)}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "right",
                        color: T.text,
                      }}
                    >
                      {fmt(s.replied)}
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "right",
                        color: T.g2,
                        fontWeight: 700,
                      }}
                    >
                      {s.replyRate}%
                    </td>
                    <td
                      style={{
                        padding: "0.75rem 1rem",
                        textAlign: "right",
                        color: T.text,
                      }}
                    >
                      {s.meetings}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {/* ── MAILBOXES TABLE ───────────────────────────────────────── */}
      <div style={{ marginTop: "2rem" }}>
        <Panel title="Mailbox Performance">
          {loading ? (
            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height="2.5rem" />
              ))}
            </div>
          ) : mbStats.length === 0 ? (
            <div
              style={{
                fontFamily: T.mono,
                color: T.muted2,
                fontSize: "0.85rem",
              }}
            >
              No mailboxes found. Run seed_mailboxes.cjs to add demo data.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontFamily: T.mono,
                  fontSize: "0.82rem",
                }}
              >
                <thead>
                  <tr
                    style={{
                      borderBottom: `1px solid ${T.border2}`,
                      color: T.muted2,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {[
                      "Mailbox",
                      "Status",
                      "Health",
                      "Sent",
                      "Delivered",
                      "Replied",
                      "Bounced",
                      "Reply Rate",
                    ].map((h) => (
                      <th
                        key={h}
                        style={{
                          padding: "0.75rem 1rem",
                          fontWeight: 400,
                          textAlign: h === "Mailbox" ? "left" : "right",
                        }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {mbStats.map((mb) => {
                    const statusColor =
                      mb.status === "active" || mb.status === "healthy"
                        ? T.g
                        : mb.status === "paused"
                          ? "#ffaa00"
                          : mb.status === "error"
                            ? "#ff3355"
                            : T.muted2;
                    return (
                      <tr
                        key={mb.id}
                        style={{
                          borderBottom: `1px solid rgba(var(--t-g2-rgb), )`,
                        }}
                      >
                        <td
                          style={{
                            padding: "0.75rem 1rem",
                            color: "var(--t-heading)",
                            fontWeight: 600,
                          }}
                        >
                          {mb.displayName || mb.email.split("@")[0]}
                          <div
                            style={{
                              fontSize: "0.7rem",
                              color: T.muted2,
                              marginTop: 2,
                            }}
                          >
                            {mb.email}
                          </div>
                        </td>
                        <td
                          style={{
                            padding: "0.75rem 1rem",
                            textAlign: "right",
                            color: statusColor,
                            textTransform: "capitalize",
                          }}
                        >
                          {mb.status}
                        </td>
                        <td
                          style={{
                            padding: "0.75rem 1rem",
                            textAlign: "right",
                            color:
                              mb.healthScore >= 90
                                ? T.g
                                : mb.healthScore >= 70
                                  ? "#ffaa00"
                                  : "#ff3355",
                          }}
                        >
                          {mb.healthScore}
                        </td>
                        <td
                          style={{
                            padding: "0.75rem 1rem",
                            textAlign: "right",
                            color: T.text,
                          }}
                        >
                          {fmt(mb.sent)}
                        </td>
                        <td
                          style={{
                            padding: "0.75rem 1rem",
                            textAlign: "right",
                            color: T.text,
                          }}
                        >
                          {fmt(mb.delivered)}
                        </td>
                        <td
                          style={{
                            padding: "0.75rem 1rem",
                            textAlign: "right",
                            color: T.text,
                          }}
                        >
                          {fmt(mb.replied)}
                        </td>
                        <td
                          style={{
                            padding: "0.75rem 1rem",
                            textAlign: "right",
                            color: mb.bounced > 0 ? "#ff3355" : T.muted2,
                          }}
                        >
                          {mb.bounced}
                        </td>
                        <td
                          style={{
                            padding: "0.75rem 1rem",
                            textAlign: "right",
                            color: T.g2,
                            fontWeight: 700,
                          }}
                        >
                          {mb.replyRate}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
