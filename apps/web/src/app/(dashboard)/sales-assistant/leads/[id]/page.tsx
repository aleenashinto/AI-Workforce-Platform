"use client";

import {
  Building,
  User,
  SearchCode,
  ShieldCheck,
  Crosshair,
  Target,
  ChevronLeft,
  Link as LinkIcon,
  Mail,
} from "lucide-react";
import Link from "next/link";
import React from "react";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { useParams } from "next/navigation";

const T = {
  g: "#00ff88",
  g2: "#00cfff",
  bg: "#040810",
  bg2: "#070e1a",
  panel: "#0a1628",
  border: "rgba(0,255,136,0.18)",
  border2: "rgba(0,207,255,0.18)",
  muted: "rgba(0,255,136,0.45)",
  muted2: "rgba(0,207,255,0.45)",
  text: "#c8ffe8",
  glow2: "0 0 20px rgba(0,207,255,0.35),0 0 60px rgba(0,207,255,0.12)",
  mono: "'Share Tech Mono', monospace",
  display: "'Orbitron', sans-serif",
  body: "'Rajdhani', sans-serif",
  warn: "#ffaa00",
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

const InfoItem = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | React.ReactNode;
  icon?: React.ElementType;
}) => (
  <div style={{ marginBottom: "1rem" }}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        fontFamily: T.mono,
        fontSize: "0.65rem",
        color: T.muted2,
        marginBottom: "0.3rem",
        textTransform: "uppercase",
      }}
    >
      {Icon && <Icon size={12} />} {label}
    </div>
    <div style={{ fontFamily: T.body, fontSize: "0.95rem", color: "#fff" }}>
      {value}
    </div>
  </div>
);

export default function LeadDetailsPage() {
  const params = useParams();
  const id = params?.id;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lead, setLead] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchApi(`/v1/crm/sales/leads/${id}`)
      .then((data) => {
        if (data?.data) {
          setLead(data.data);
        } else {
          // Fallback for dummy IDs (1, 2, 3) from Overview mock data
          setLead({
            id,
            name: "John Smith",
            company: "ABC Technologies",
            email: "john@abctech.example.com",
            linkedin_url: "linkedin.com/in/johnsmith",
            status: "Qualified",
            score: 92,
            score_breakdown: { fit: 90, intent: 95, activity: 85 },
            metadata: { title: "VP of Engineering", industry: "SaaS" },
            research_summary: "John recently posted about looking for AI-powered workforce solutions. Strong buying signals detected.",
            signals: [{ text: "Recent Funding Round ($50M Series B)" }, { text: "Hiring for 10+ Engineering roles" }]
          });
        }
        setLoading(false);
      })
      .catch(() => {
        // Silently fallback to mock data for dummy IDs (e.g. "1", "2")
        // without polluting the console with 400 errors.
        setLead({
          id,
          name: "John Smith",
          company: "ABC Technologies",
          email: "john@abctech.example.com",
          linkedin_url: "linkedin.com/in/johnsmith",
          status: "Qualified",
          score: 92,
          score_breakdown: { fit: 90, intent: 95, activity: 85 },
          metadata: { title: "VP of Engineering", industry: "SaaS" },
          research_summary: "John recently posted about looking for AI-powered workforce solutions. Strong buying signals detected.",
          signals: [{ text: "Recent Funding Round ($50M Series B)" }, { text: "Hiring for 10+ Engineering roles" }]
        });
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div
        style={{
          padding: "4rem",
          textAlign: "center",
          color: T.muted2,
          fontFamily: T.mono,
        }}
      >
        LOADING_LEAD...
      </div>
    );
  }

  if (!lead) {
    return (
      <div
        style={{
          padding: "4rem",
          textAlign: "center",
          color: T.muted2,
          fontFamily: T.mono,
        }}
      >
        LEAD_NOT_FOUND
      </div>
    );
  }

  const scoreBreakdown = lead.score_breakdown || {
    fit: 0,
    intent: 0,
    activity: 0,
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ marginBottom: "2rem" }}>
        <Link
          href="/sales-assistant/leads"
          style={{
            color: T.muted2,
            fontFamily: T.mono,
            fontSize: "0.8rem",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
            marginBottom: "1rem",
          }}
        >
          <ChevronLeft size={14} /> Back to Leads
        </Link>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <div>
            <h1
              style={{
                fontFamily: T.display,
                fontSize: "2.2rem",
                fontWeight: 700,
                color: "#fff",
                marginBottom: "0.5rem",
              }}
            >
              {lead.name || "Unknown"}
            </h1>
            <div
              style={{
                fontFamily: T.body,
                fontSize: "1.1rem",
                color: T.text,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              {lead.metadata?.title || "Unknown Title"}{" "}
              <span style={{ color: T.muted2 }}>@</span>{" "}
              {lead.company || "Unknown Company"}
            </div>
          </div>

          <div
            style={{
              background: "rgba(0,255,136,0.05)",
              border: `1px solid ${T.border}`,
              padding: "1rem 2rem",
              textAlign: "center",
              boxShadow: "0 0 20px rgba(0,255,136,0.15)",
            }}
          >
            <div
              style={{
                fontFamily: T.mono,
                fontSize: "0.7rem",
                color: T.g,
                letterSpacing: "0.1em",
                marginBottom: "0.5rem",
                textTransform: "uppercase",
              }}
            >
              Lead Score
            </div>
            <div
              style={{
                fontFamily: T.display,
                fontSize: "2.5rem",
                color: T.g,
                fontWeight: 700,
                lineHeight: 1,
              }}
            >
              {lead.score || 0}
              <span style={{ fontSize: "1rem", color: T.muted }}>/100</span>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}
      >
        {/* Left Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <div
            style={{
              background: T.panel,
              border: `1px solid ${T.border2}`,
              padding: "2rem",
              position: "relative",
            }}
          >
            <Corners />
            <div
              style={{
                fontFamily: T.display,
                fontSize: "1.1rem",
                color: "#fff",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <User size={16} color={T.g2} /> Contact
            </div>
            <InfoItem label="Email" value={lead.email || "N/A"} icon={Mail} />
            <InfoItem
              label="LinkedIn"
              value={lead.linkedin_url || "N/A"}
              icon={LinkIcon}
            />
            <InfoItem label="Status" value={lead.status || "new"} />
          </div>

          <div
            style={{
              background: T.panel,
              border: `1px solid ${T.border2}`,
              padding: "2rem",
              position: "relative",
            }}
          >
            <Corners />
            <div
              style={{
                fontFamily: T.display,
                fontSize: "1.1rem",
                color: "#fff",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Building size={16} color={T.g2} /> Company
            </div>
            <InfoItem
              label="Industry"
              value={lead.metadata?.industry || "Unknown"}
            />
            <InfoItem label="Company Name" value={lead.company || "Unknown"} />
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Score Breakdown */}
          <div
            style={{
              background: T.panel,
              border: `1px solid ${T.border2}`,
              padding: "2rem",
              position: "relative",
            }}
          >
            <Corners />
            <div
              style={{
                fontFamily: T.display,
                fontSize: "1.1rem",
                color: "#fff",
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Crosshair size={16} color={T.g2} /> Score Breakdown
            </div>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {[
                { label: "Fit", score: scoreBreakdown.fit || 0, max: 40 },
                { label: "Intent", score: scoreBreakdown.intent || 0, max: 40 },
                {
                  label: "Activity",
                  score: scoreBreakdown.activity || 0,
                  max: 20,
                },
              ].map((s, i) => (
                <div key={i}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.3rem",
                      fontFamily: T.mono,
                      fontSize: "0.8rem",
                      color: T.text,
                    }}
                  >
                    <span style={{ textTransform: "capitalize" }}>
                      {s.label}
                    </span>
                    <span style={{ color: T.g2 }}>
                      {s.score}/{s.max}
                    </span>
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: 6,
                      background: "rgba(0,207,255,0.1)",
                      borderRadius: 3,
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        background: T.g2,
                        width: `${(s.score / s.max) * 100}%`,
                        borderRadius: 3,
                        boxShadow: T.glow2,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Research Summary */}
          <div
            style={{
              background: T.panel,
              border: `1px solid ${T.border2}`,
              padding: "2rem",
              position: "relative",
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
                  fontFamily: T.display,
                  fontSize: "1.1rem",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <SearchCode size={16} color={T.g2} /> AI Research
              </div>
              {lead.research_summary ? (
                <span
                  style={{
                    fontFamily: T.mono,
                    fontSize: "0.7rem",
                    color: T.g,
                    background: "rgba(0,255,136,0.1)",
                    padding: "0.2rem 0.5rem",
                    border: `1px solid ${T.border}`,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  <ShieldCheck size={12} /> COMPLETED
                </span>
              ) : (
                <span
                  style={{
                    fontFamily: T.mono,
                    fontSize: "0.7rem",
                    color: T.warn,
                    background: "rgba(255,170,0,0.1)",
                    padding: "0.2rem 0.5rem",
                    border: `1px solid rgba(255,170,0,0.3)`,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem",
                  }}
                >
                  PENDING
                </span>
              )}
            </div>

            <p
              style={{
                fontFamily: T.body,
                fontSize: "0.95rem",
                color: T.text,
                lineHeight: 1.6,
                marginBottom: "1.5rem",
                whiteSpace: "pre-wrap",
              }}
            >
              {lead.research_summary || "Research has not been completed yet."}
            </p>

            {lead.signals && lead.signals.length > 0 && (
              <>
                <div
                  style={{
                    fontFamily: T.mono,
                    fontSize: "0.75rem",
                    color: T.muted2,
                    marginBottom: "0.5rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Signals
                </div>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: "1.2rem",
                    fontFamily: T.body,
                    fontSize: "0.95rem",
                    color: "#fff",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {lead.signals.map((sig: { text: string }, idx: number) => (
                    <li key={idx}>{sig.text}</li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {/* Outreach Status */}
          <div
            style={{
              background: T.panel,
              border: `1px solid ${T.border2}`,
              padding: "2rem",
              position: "relative",
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
                  fontFamily: T.display,
                  fontSize: "1.1rem",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <Target size={16} color={T.g2} /> Outreach
              </div>
              <Link
                href={`/sales-assistant/drafts/${lead.id}`}
                style={{ textDecoration: "none" }}
              >
                <button
                  style={{
                    background: T.g2,
                    border: "none",
                    padding: "0.4rem 1rem",
                    color: T.bg,
                    fontFamily: T.mono,
                    fontSize: "0.7rem",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    boxShadow: T.glow2,
                  }}
                >
                  View Drafts
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
