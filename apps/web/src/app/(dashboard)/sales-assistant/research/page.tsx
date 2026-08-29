"use client";

import { SearchCode, CheckCircle, Clock, ExternalLink } from "lucide-react";
import { useState } from "react";

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
  glow2: "var(--t-glow2)",
  mono: "'Share Tech Mono', monospace",
  display: "'Orbitron', sans-serif",
  body: "'Rajdhani', sans-serif",
  warn: "var(--t-warn)",
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
          borderColor: T.g2,
          borderStyle: "solid",
          borderWidth: bw as number | string,
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

export default function ResearchPage() {
  const [activeLead, setActiveLead] = useState(1);

  const queue = [
    { id: 1, name: "Sarah Chen", company: "Acme Inc", status: "Complete" },
    { id: 2, name: "John Davis", company: "Nova Corp", status: "Researching" },
    { id: 3, name: "Mike Smith", company: "TechCorp", status: "Waiting" },
  ];

  return (
    <div
      style={{
        height: "calc(100vh - 80px)",
        display: "flex",
        overflow: "hidden",
      }}
    >
      {/* Queue Sidebar */}
      <div
        style={{
          width: 320,
          borderRight: `1px solid ${T.border2}`,
          background: T.bg2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{ padding: "1.5rem", borderBottom: `1px solid ${T.border2}` }}
        >
          <h2
            style={{
              fontFamily: T.display,
              fontSize: "1.2rem",
              color: "var(--t-heading)",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              margin: 0,
            }}
          >
            <SearchCode size={18} color={T.g2} /> Research Queue
          </h2>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {queue.map((item) => (
            <div
              key={item.id}
              onClick={() => setActiveLead(item.id)}
              style={{
                padding: "1.2rem",
                borderBottom: `1px solid ${T.border2}`,
                cursor: "pointer",
                background:
                  activeLead === item.id
                    ? "rgba(0,207,255,0.05)"
                    : "transparent",
                transition: "background 0.2s",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                }}
              >
                <span
                  style={{
                    fontFamily: T.body,
                    fontSize: "1rem",
                    color: "var(--t-heading)",
                    fontWeight: 600,
                  }}
                >
                  {item.name}
                </span>
                {item.status === "Complete" && (
                  <CheckCircle size={14} color={T.g} />
                )}
                {item.status === "Researching" && (
                  <Loader size={14} color={T.g2} className="animate-spin" />
                )}
                {item.status === "Waiting" && (
                  <Clock size={14} color={T.muted2} />
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: T.body,
                    fontSize: "0.85rem",
                    color: T.text,
                  }}
                >
                  {item.company}
                </span>
                <span
                  style={{
                    fontFamily: T.mono,
                    fontSize: "0.65rem",
                    color:
                      item.status === "Complete"
                        ? T.g
                        : item.status === "Researching"
                          ? T.g2
                          : T.muted2,
                    textTransform: "uppercase",
                  }}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Research View */}
      <div
        style={{
          flex: 1,
          padding: "2.5rem",
          overflowY: "auto",
          background: T.bg,
        }}
      >
        {activeLead === 1 && (
          <div style={{ maxWidth: 800, margin: "0 auto" }}>
            <div style={{ marginBottom: "2.5rem" }}>
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: "0.8rem",
                  color: T.g2,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  marginBottom: "0.5rem",
                }}
              >
                Company Research
              </div>
              <h1
                style={{
                  fontFamily: T.display,
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  color: "var(--t-heading)",
                  margin: 0,
                }}
              >
                Acme Inc
              </h1>
            </div>

            <div
              style={{
                background: T.panel,
                border: `1px solid ${T.border2}`,
                padding: "2.5rem",
                position: "relative",
                marginBottom: "2rem",
              }}
            >
              <Corners />
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: "0.8rem",
                  color: T.muted2,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "1rem",
                }}
              >
                Summary
              </div>
              <p
                style={{
                  fontFamily: T.body,
                  fontSize: "1rem",
                  color: T.text,
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                Acme Inc is an enterprise SaaS platform specializing in supply
                chain analytics. They recently closed a $45M Series B round led
                by Sequoia. The engineering team is scaling rapidly, and they
                have recently adopted a modern data stack (Snowflake, dbt) to
                handle increased volume.
              </p>
            </div>

            <div
              style={{
                background: T.panel,
                border: `1px solid ${T.border2}`,
                padding: "2.5rem",
                position: "relative",
                marginBottom: "2rem",
              }}
            >
              <Corners />
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: "0.8rem",
                  color: T.muted2,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "1.5rem",
                }}
              >
                Signals
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    background: "rgba(0,207,255,0.03)",
                    border: `1px solid ${T.border2}`,
                    padding: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span>🔥</span>
                    <span
                      style={{
                        fontFamily: T.mono,
                        fontSize: "0.9rem",
                        color: "var(--t-heading)",
                        fontWeight: "bold",
                      }}
                    >
                      Hiring Surge (Engineering)
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: T.body,
                      fontSize: "0.9rem",
                      color: T.text,
                    }}
                  >
                    12 open roles on Careers page including Data Engineers and
                    Backend (Go).
                  </div>
                </div>

                <div
                  style={{
                    background: "rgba(0,207,255,0.03)",
                    border: `1px solid ${T.border2}`,
                    padding: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span>🚀</span>
                    <span
                      style={{
                        fontFamily: T.mono,
                        fontSize: "0.9rem",
                        color: "var(--t-heading)",
                        fontWeight: "bold",
                      }}
                    >
                      Series B Funding
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: T.body,
                      fontSize: "0.9rem",
                      color: T.text,
                    }}
                  >
                    Announced $45M Series B two weeks ago on TechCrunch.
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                background: T.panel,
                border: `1px solid ${T.border2}`,
                padding: "2.5rem",
                position: "relative",
                marginBottom: "2rem",
              }}
            >
              <Corners />
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: "0.8rem",
                  color: T.muted2,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "1.5rem",
                }}
              >
                Personalization Hooks
              </div>
              <ol
                style={{
                  margin: 0,
                  paddingLeft: "1.5rem",
                  fontFamily: T.body,
                  fontSize: "1rem",
                  color: "var(--t-heading)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <li>
                  &quot;Noticed the recent $45M Series B and the heavy push for
                  engineering talent...&quot;
                </li>
                <li>
                  &quot;Saw you&apos;re adopting Snowflake to scale your
                  analytics backend...&quot;
                </li>
                <li>
                  &quot;Loved your recent LinkedIn post regarding AI-driven data
                  pipelines...&quot;
                </li>
              </ol>
            </div>

            <div
              style={{
                background: T.panel,
                border: `1px solid ${T.border2}`,
                padding: "2.5rem",
                position: "relative",
              }}
            >
              <Corners />
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: "0.8rem",
                  color: T.muted2,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  marginBottom: "1rem",
                }}
              >
                Sources
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <a
                  href="#"
                  style={{
                    fontFamily: T.mono,
                    fontSize: "0.8rem",
                    color: T.g2,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <ExternalLink size={12} /> acme.inc/careers
                </a>
                <a
                  href="#"
                  style={{
                    fontFamily: T.mono,
                    fontSize: "0.8rem",
                    color: T.g2,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <ExternalLink size={12} /> techcrunch.com/acme-series-b
                </a>
                <a
                  href="#"
                  style={{
                    fontFamily: T.mono,
                    fontSize: "0.8rem",
                    color: T.g2,
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <ExternalLink size={12} /> linkedin.com/in/sarahchen
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Simple loader component
function Loader({
  size,
  color,
  className,
}: {
  size: number;
  color: string;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
    </svg>
  );
}
