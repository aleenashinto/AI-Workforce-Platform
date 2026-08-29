"use client";

import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  BarChart,
  LineChart as LineChartIcon,
  PieChart,
} from "lucide-react";

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

export default function SupportAnalyticsPage() {
  return (
    <div style={{ padding: "2rem", maxWidth: 1400, margin: "0 auto" }}>
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
          <LineChartIcon color={T.g} size={32} /> Support Analytics
        </h1>
        <p
          style={{
            fontFamily: T.mono,
            fontSize: "0.9rem",
            color: T.g,
            letterSpacing: "0.05em",
          }}
        >
          Detailed metrics and trends for AI Customer Support.
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        {[
          { label: "DEFLECTION RATE", value: "78%", trend: "+2.4%" },
          { label: "CONVERSATION VOLUME", value: "1,240", trend: "+12%" },
          { label: "AVERAGE CSAT", value: "4.8/5", trend: "+0.2" },
          { label: "RESOLUTION TIME", value: "1.2m", trend: "-30s" },
        ].map((kpi, i) => (
          <div
            key={i}
            style={{
              background: T.panel,
          borderRadius: "var(--t-radius)",
              border: `1px solid ${T.border}`,
              padding: "1.5rem",
              position: "relative",
              boxShadow: T.glow,
            }}
          >
            <Corners />
            <div
              style={{
                fontFamily: T.mono,
                fontSize: "0.75rem",
                color: T.muted,
                textTransform: "uppercase",
                marginBottom: "0.5rem",
                letterSpacing: "0.1em",
              }}
            >
              {kpi.label}
            </div>
            <div
              style={{ display: "flex", alignItems: "flex-end", gap: "1rem" }}
            >
              <div
                style={{
                  fontFamily: T.body,
                  fontSize: "2rem",
                  fontWeight: 700,
                  color: "var(--t-heading)",
                }}
              >
                {kpi.value}
              </div>
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: "0.8rem",
                  color:
                    (kpi.trend.startsWith("-") &&
                      kpi.label === "RESOLUTION TIME") ||
                    kpi.trend.startsWith("+")
                      ? T.g
                      : T.red,
                  marginBottom: "0.4rem",
                }}
              >
                {kpi.trend}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Chart 1 */}
        <div
          style={{
            background: T.panel,
          borderRadius: "var(--t-radius)",
            border: `1px solid ${T.border}`,
            padding: "1.5rem",
            position: "relative",
            height: 300,
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
            Conversations by Day
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              height: "calc(100% - 3rem)",
              gap: "4%",
              padding: "1rem 0",
            }}
          >
            {[30, 45, 60, 50, 75, 90, 80].map((h, i) => (
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
                    background: `linear-gradient(0deg, rgba(0,255,136,0.1), ${T.g})`,
                    borderTop: `2px solid ${T.g}`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Chart 2 */}
        <div
          style={{
            background: T.panel,
          borderRadius: "var(--t-radius)",
            border: `1px solid ${T.border}`,
            padding: "1.5rem",
            position: "relative",
            height: 300,
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
            AI vs Human Resolution
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              height: "calc(100% - 3rem)",
              gap: "4%",
              padding: "1rem 0",
            }}
          >
            {[30, 45, 60, 50, 75, 90, 80].map((h, i) => (
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
                    background: `linear-gradient(0deg, rgba(0,255,136,0.1), ${T.g})`,
                    borderTop: `2px solid ${T.g}`,
                  }}
                />
                <div
                  style={{
                    width: "100%",
                    height: `${h * 0.2}%`,
                    background: `linear-gradient(0deg, rgba(255,170,0,0.1), ${T.warn})`,
                    borderTop: `2px solid ${T.warn}`,
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
        }}
      >
        {/* List 1 */}
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
            Thumbs-down Messages
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            <div
              style={{
                borderBottom: `1px solid var(--t-white-05)`,
                paddingBottom: "1rem",
              }}
            >
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              <div
                style={{
                  fontFamily: T.body,
                  fontSize: "0.95rem",
                  color: "var(--t-heading)",
                  marginBottom: "0.5rem",
                }}
              >
                "That didn't help, I want a refund."
              </div>
              <div
                style={{ fontFamily: T.mono, fontSize: "0.7rem", color: T.red }}
              >
                14 downvotes
              </div>
            </div>
            <div
              style={{
                borderBottom: `1px solid var(--t-white-05)`,
                paddingBottom: "1rem",
              }}
            >
              {/* eslint-disable-next-line react/no-unescaped-entities */}
              <div
                style={{
                  fontFamily: T.body,
                  fontSize: "0.95rem",
                  color: "var(--t-heading)",
                  marginBottom: "0.5rem",
                }}
              >
                "Link is broken."
              </div>
              <div
                style={{ fontFamily: T.mono, fontSize: "0.7rem", color: T.red }}
              >
                8 downvotes
              </div>
            </div>
          </div>
        </div>

        {/* Chart 3 */}
        <div
          style={{
            background: T.panel,
          borderRadius: "var(--t-radius)",
            border: `1px solid ${T.border}`,
            padding: "1.5rem",
            position: "relative",
            height: 240,
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
            Conversations by Channel
          </div>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              height: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                border: `12px solid ${T.g}`,
                borderRightColor: T.g2,
                borderBottomColor: T.panel,
                transform: "rotate(25deg)",
                boxShadow: T.glow,
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          background: T.panel,
          borderRadius: "var(--t-radius)",
          border: `1px solid ${T.border}`,
          padding: "1.5rem",
          position: "relative",
          marginTop: "1.5rem",
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
          Top Questions (Clustered)
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid rgba(0,255,136,0.1)` }}>
              <th
                style={{
                  textAlign: "left",
                  padding: "0.8rem",
                  fontFamily: T.mono,
                  fontSize: "0.7rem",
                  color: T.muted,
                  fontWeight: "normal",
                }}
              >
                QUESTION THEME
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "0.8rem",
                  fontFamily: T.mono,
                  fontSize: "0.7rem",
                  color: T.muted,
                  fontWeight: "normal",
                }}
              >
                VOLUME
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "0.8rem",
                  fontFamily: T.mono,
                  fontSize: "0.7rem",
                  color: T.muted,
                  fontWeight: "normal",
                }}
              >
                AI RESOLVED
              </th>
            </tr>
          </thead>
          <tbody>
            {[
              { q: "How do I reset my password?", v: 145, r: "98%" },
              { q: "Where is my order?", v: 112, r: "85%" },
              { q: "How to integrate with Salesforce?", v: 89, r: "45%" },
            ].map((row, i) => (
              <tr
                key={i}
                style={{ borderBottom: `1px solid var(--t-white-05)` }}
              >
                <td
                  style={{
                    padding: "1rem",
                    fontFamily: T.body,
                    fontSize: "0.95rem",
                    color: "var(--t-heading)",
                  }}
                >
                  {row.q}
                </td>
                <td
                  style={{
                    padding: "1rem",
                    fontFamily: T.mono,
                    fontSize: "0.85rem",
                    color: T.text,
                  }}
                >
                  {row.v}
                </td>
                <td
                  style={{
                    padding: "1rem",
                    fontFamily: T.mono,
                    fontSize: "0.85rem",
                    color: T.g,
                  }}
                >
                  {row.r}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
