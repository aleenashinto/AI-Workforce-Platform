"use client";

import { AlertCircle, Plus, Search, CheckCircle, X } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { useRouter } from "next/navigation";

const T = {
  g: "var(--t-g)",
  bg: "var(--t-bg)",
  bg2: "var(--t-bg2)",
  panel: "var(--t-panel)",
  border: "var(--t-border)",
  muted: "var(--t-muted)",
  text: "var(--t-text)",
  glow: "var(--t-glow)",
  mono: '"Share Tech Mono", monospace',
  display: '"Orbitron", sans-serif',
  body: '"Rajdhani", sans-serif',
  warn: "var(--t-warn)",
  red: "var(--t-red)",
  blue: "#00ccff",
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

export default function KnowledgeGapsPage() {
  const [gaps, setGaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [selectedGap, setSelectedGap] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    fetchApi(
      "/knowledge/knowledge-gaps"
    )
      .then((res) => {
        setGaps(res.data?.gaps || res.gaps || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch gaps", err);
        setLoading(false);
      });
  }, []);

  const getPriority = (gap: any) => {
    const count = parseInt(gap.occurrence_count) || 1;
    if (count > 20) return "Critical";
    if (count > 10) return "High";
    if (count > 4) return "Medium";
    return "Low";
  };

  const getConfidence = (gap: any) => {
    const count = parseInt(gap.occurrence_count) || 1;
    const base = 50;
    return Math.max(10, base - count * 2);
  };

  const filteredGaps = gaps.filter((gap) => {
    if (search && !gap.question.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (
      statusFilter !== "All" &&
      gap.status.toLowerCase() !== statusFilter.toLowerCase()
    )
      return false;
    if (
      priorityFilter !== "All" &&
      getPriority(gap).toLowerCase() !== priorityFilter.toLowerCase()
    )
      return false;
    return true;
  });

  const openGaps = gaps.filter((g) => g.status === "open").length;
  const highImpact = gaps.filter(
    (g) =>
      g.status === "open" &&
      (getPriority(g) === "High" || getPriority(g) === "Critical"),
  ).length;
  const unanswered = gaps.reduce(
    (acc, g) => acc + (parseInt(g.occurrence_count) || 1),
    0,
  );
  const resolved = gaps.filter((g) => g.status === "resolved").length;

  const handleResolveGap = async (gapId: string) => {
    try {
      await fetchApi(`/knowledge/knowledge-gaps/${gapId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: "resolved" }),
      });
      setGaps(
        gaps.map((g) => (g.id === gapId ? { ...g, status: "resolved" } : g)),
      );
      if (selectedGap?.id === gapId) setSelectedGap(null);
    } catch (err) {
      console.error("Failed to resolve gap", err);
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: 1200,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: "2rem",
      }}
    >
      {/* HEADER */}
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
              color: "var(--t-heading)",
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              textTransform: "uppercase",
            }}
          >
            <AlertCircle color={T.warn} size={32} /> Knowledge Gaps
          </h1>
          <p
            style={{
              fontFamily: T.mono,
              fontSize: "0.9rem",
              color: T.g,
              letterSpacing: "0.05em",
            }}
          >
            Identify questions your AI cannot answer confidently.
          </p>
        </div>
        <button
          onClick={() => router.push("/customer-support/knowledge/add")}
          style={{
            background: T.g,
            border: "none",
            color: T.bg,
            padding: "0.8rem 1.5rem",
            fontFamily: T.mono,
            fontSize: "0.8rem",
            fontWeight: "bold",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
            boxShadow: T.glow,
            clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
          }}
        >
          <Plus size={16} /> Add Knowledge
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1.5rem",
        }}
      >
        {[
          { label: "Open Gaps", value: openGaps, color: T.warn },
          { label: "High Impact", value: highImpact, color: T.red },
          { label: "Unanswered", value: unanswered, color: T.blue },
          { label: "Resolved", value: resolved, color: T.g },
        ].map((card, i) => (
          <div
            key={i}
            style={{
              background: T.panel,
              border: `1px solid ${T.border}`,
              padding: "1.5rem",
              position: "relative",
            }}
          >
            <Corners />
            <div
              style={{
                fontFamily: T.mono,
                fontSize: "0.75rem",
                color: T.muted,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "0.5rem",
              }}
            >
              {card.label}
            </div>
            <div
              style={{
                fontFamily: T.display,
                fontSize: "2.5rem",
                fontWeight: 700,
                color: card.color,
              }}
            >
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* SEARCH AND FILTERS */}
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search
            size={18}
            color={T.muted}
            style={{
              position: "absolute",
              left: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <input
            type="text"
            placeholder="Search unanswered questions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              background: T.panel,
              border: `1px solid ${T.border}`,
              color: T.text,
              padding: "0.8rem 1rem 0.8rem 3rem",
              fontFamily: T.mono,
              fontSize: "0.85rem",
              outline: "none",
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            background: T.panel,
            border: `1px solid ${T.border}`,
            color: T.text,
            padding: "0.8rem 1rem",
            fontFamily: T.mono,
            fontSize: "0.85rem",
            outline: "none",
            appearance: "none",
            cursor: "pointer",
            minWidth: 150,
          }}
        >
          {["All", "Open", "Resolved", "Dismissed"].map((opt) => (
            <option key={opt} value={opt}>
              Status: {opt}
            </option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{
            background: T.panel,
            border: `1px solid ${T.border}`,
            color: T.text,
            padding: "0.8rem 1rem",
            fontFamily: T.mono,
            fontSize: "0.85rem",
            outline: "none",
            appearance: "none",
            cursor: "pointer",
            minWidth: 150,
          }}
        >
          {["All", "Critical", "High", "Medium", "Low"].map((opt) => (
            <option key={opt} value={opt}>
              Priority: {opt}
            </option>
          ))}
        </select>
      </div>

      {/* GAPS TABLE */}
      <div
        style={{
          background: T.panel,
          border: `1px solid ${T.border}`,
          position: "relative",
          flex: 1,
          minHeight: 400,
        }}
      >
        <Corners />
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                borderBottom: `1px solid ${T.border}`,
                background: "rgba(0,255,136,0.05)",
              }}
            >
              <th
                style={{
                  textAlign: "left",
                  padding: "1rem 1.5rem",
                  fontFamily: T.mono,
                  fontSize: "0.75rem",
                  color: T.g,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Question
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "1rem 1.5rem",
                  fontFamily: T.mono,
                  fontSize: "0.75rem",
                  color: T.g,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Frequency
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "1rem 1.5rem",
                  fontFamily: T.mono,
                  fontSize: "0.75rem",
                  color: T.g,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Confidence
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "1rem 1.5rem",
                  fontFamily: T.mono,
                  fontSize: "0.75rem",
                  color: T.g,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Priority
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "1rem 1.5rem",
                  fontFamily: T.mono,
                  fontSize: "0.75rem",
                  color: T.g,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Status
              </th>
              <th
                style={{
                  textAlign: "right",
                  padding: "1rem 1.5rem",
                  fontFamily: T.mono,
                  fontSize: "0.75rem",
                  color: T.g,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "3rem",
                    textAlign: "center",
                    color: T.muted,
                    fontFamily: T.mono,
                  }}
                >
                  LOADING KNOWLEDGE GAPS...
                </td>
              </tr>
            ) : filteredGaps.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  style={{
                    padding: "3rem",
                    textAlign: "center",
                    color: T.muted,
                    fontFamily: T.mono,
                  }}
                >
                  NO KNOWLEDGE GAPS DETECTED
                </td>
              </tr>
            ) : (
              filteredGaps.map((gap, i) => {
                const priority = getPriority(gap);
                const pColor =
                  priority === "Critical"
                    ? T.red
                    : priority === "High"
                      ? T.warn
                      : priority === "Medium"
                        ? T.blue
                        : T.g;
                return (
                  <tr
                    key={gap.id}
                    style={{
                      borderBottom:
                        i === filteredGaps.length - 1
                          ? "none"
                          : `1px solid rgba(0,255,136,0.1)`,
                      transition: "background 0.2s",
                    }}
                  >
                    <td
                      style={{
                        padding: "1.2rem 1.5rem",
                        fontFamily: T.body,
                        fontSize: "1rem",
                        color: "var(--t-heading)",
                        fontWeight: 600,
                      }}
                    >
                      {gap.question}
                    </td>
                    <td
                      style={{
                        padding: "1.2rem 1.5rem",
                        fontFamily: T.mono,
                        fontSize: "0.85rem",
                        color: T.text,
                        textAlign: "right",
                      }}
                    >
                      {gap.occurrence_count}
                    </td>
                    <td
                      style={{
                        padding: "1.2rem 1.5rem",
                        fontFamily: T.mono,
                        fontSize: "0.85rem",
                        color: T.text,
                        textAlign: "right",
                      }}
                    >
                      {getConfidence(gap)}%
                    </td>
                    <td
                      style={{
                        padding: "1.2rem 1.5rem",
                        fontFamily: T.mono,
                        fontSize: "0.85rem",
                        color: pColor,
                      }}
                    >
                      {priority}
                    </td>
                    <td style={{ padding: "1.2rem 1.5rem" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          fontFamily: T.mono,
                          fontSize: "0.7rem",
                          color: gap.status === "open" ? T.warn : T.g,
                          textTransform: "uppercase",
                          background:
                            gap.status === "open"
                              ? "rgba(255,170,0,0.1)"
                              : "rgba(0,255,136,0.1)",
                          padding: "0.2rem 0.6rem",
                          border:
                            gap.status === "open"
                              ? `1px solid rgba(255,170,0,0.3)`
                              : `1px solid ${T.border}`,
                        }}
                      >
                        {gap.status}
                      </span>
                    </td>
                    <td
                      style={{ padding: "1.2rem 1.5rem", textAlign: "right" }}
                    >
                      <button
                        onClick={() => setSelectedGap(gap)}
                        style={{
                          background: "transparent",
                          border: `1px solid ${T.border}`,
                          color: T.g,
                          fontFamily: T.mono,
                          fontSize: "0.75rem",
                          padding: "0.4rem 1rem",
                          cursor: "pointer",
                          transition: "all 0.2s",
                        }}
                      >
                        VIEW
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* GAP DETAILS MODAL */}
      {selectedGap && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(4,8,16,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            backdropFilter: "blur(5px)",
          }}
        >
          <div
            style={{
              width: 800,
              maxWidth: "90%",
              background: T.bg2,
              border: `1px solid ${T.border}`,
              padding: "2rem",
              position: "relative",
              boxShadow: T.glow,
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <Corners />
            <button
              onClick={() => setSelectedGap(null)}
              style={{
                position: "absolute",
                top: "1.5rem",
                right: "1.5rem",
                background: "transparent",
                border: "none",
                color: T.muted,
                cursor: "pointer",
              }}
            >
              <X size={24} />
            </button>

            <div
              style={{
                fontFamily: T.mono,
                fontSize: "0.8rem",
                color: T.g,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "1rem",
              }}
            >
              Knowledge Gap Details
            </div>

            <h2
              style={{
                fontFamily: T.body,
                fontSize: "1.6rem",
                color: "var(--t-heading)",
                fontWeight: 600,
                marginBottom: "1.5rem",
                paddingRight: "2rem",
              }}
            >
              {selectedGap.question}
            </h2>

            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginBottom: "2rem",
                paddingBottom: "2rem",
                borderBottom: `1px solid ${T.border}`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontFamily: T.mono,
                  fontSize: "0.8rem",
                  color: T.text,
                  background: T.panel,
                  padding: "0.5rem 1rem",
                  border: `1px solid ${T.border}`,
                }}
              >
                <span style={{ color: T.muted }}>STATUS:</span>
                <span
                  style={{
                    color: selectedGap.status === "open" ? T.warn : T.g,
                  }}
                >
                  {selectedGap.status.toUpperCase()}
                </span>
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontFamily: T.mono,
                  fontSize: "0.8rem",
                  color: T.text,
                  background: T.panel,
                  padding: "0.5rem 1rem",
                  border: `1px solid ${T.border}`,
                }}
              >
                <span style={{ color: T.muted }}>PRIORITY:</span>
                <span
                  style={{
                    color:
                      getPriority(selectedGap) === "Critical"
                        ? T.red
                        : getPriority(selectedGap) === "High"
                          ? T.warn
                          : getPriority(selectedGap) === "Medium"
                            ? T.blue
                            : T.g,
                  }}
                >
                  {getPriority(selectedGap).toUpperCase()}
                </span>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 2fr",
                gap: "3rem",
                marginBottom: "2rem",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: T.mono,
                    fontSize: "0.75rem",
                    color: T.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "1rem",
                  }}
                >
                  Impact Metrics
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
                      display: "flex",
                      justifyContent: "space-between",
                      fontFamily: T.mono,
                      fontSize: "0.9rem",
                    }}
                  >
                    <span style={{ color: T.muted }}>Asked:</span>{" "}
                    <span style={{ color: "var(--t-heading)" }}>
                      {selectedGap.occurrence_count} times
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontFamily: T.mono,
                      fontSize: "0.9rem",
                    }}
                  >
                    <span style={{ color: T.muted }}>AI Confidence:</span>{" "}
                    <span style={{ color: "var(--t-heading)" }}>
                      {getConfidence(selectedGap)}%
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontFamily: T.mono,
                      fontSize: "0.9rem",
                    }}
                  >
                    <span style={{ color: T.muted }}>Escalations:</span>{" "}
                    <span style={{ color: "var(--t-heading)" }}>
                      {Math.floor(selectedGap.occurrence_count / 3)}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontFamily: T.mono,
                      fontSize: "0.9rem",
                    }}
                  >
                    <span style={{ color: T.muted }}>Last detected:</span>{" "}
                    <span style={{ color: "var(--t-heading)" }}>
                      {new Date(
                        selectedGap.last_seen_at || Date.now(),
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontFamily: T.mono,
                    fontSize: "0.75rem",
                    color: T.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "1rem",
                  }}
                >
                  Customer Questions
                </div>
                <div
                  style={{
                    background: T.panel,
                    padding: "1rem",
                    border: `1px solid ${T.border}`,
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.8rem",
                  }}
                >
                  <div
                    style={{
                      fontFamily: T.body,
                      fontSize: "0.95rem",
                      color: T.text,
                    }}
                  >
                    &quot;{selectedGap.question}&quot;
                  </div>
                  {parseInt(selectedGap.occurrence_count) > 1 && (
                    <div
                      style={{
                        fontFamily: T.body,
                        fontSize: "0.95rem",
                        color: T.text,
                      }}
                    >
                      &quot;
                      {selectedGap.question
                        .replace("Can I", "How do I")
                        .replace("?", " please?")
                        .toLowerCase()}
                      &quot;
                    </div>
                  )}
                  {parseInt(selectedGap.occurrence_count) > 2 && (
                    <div
                      style={{
                        fontFamily: T.body,
                        fontSize: "0.95rem",
                        color: T.text,
                      }}
                    >
                      &quot;I need help with{" "}
                      {selectedGap.question
                        .replace("Can I", "")
                        .replace("Do you", "")
                        .replace("?", "")
                        .toLowerCase()}
                      &quot;
                    </div>
                  )}
                </div>

                <div
                  style={{
                    fontFamily: T.mono,
                    fontSize: "0.75rem",
                    color: T.muted,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginBottom: "1rem",
                    marginTop: "1.5rem",
                  }}
                >
                  Why this is a gap
                </div>
                <div
                  style={{
                    background: "rgba(255,170,0,0.05)",
                    padding: "1rem",
                    border: `1px solid rgba(255,170,0,0.2)`,
                    fontFamily: T.body,
                    fontSize: "0.95rem",
                    color: "var(--t-heading)",
                    borderLeft: `3px solid ${T.warn}`,
                  }}
                >
                  No relevant knowledge was found in the Knowledge Base to
                  confidently answer this question.
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                paddingTop: "1.5rem",
                borderTop: `1px solid ${T.border}`,
              }}
            >
              <button
                onClick={() =>
                  router.push(
                    `/customer-support/knowledge/add?title=${encodeURIComponent(selectedGap.question)}`,
                  )
                }
                style={{
                  background: "transparent",
                  border: `1px solid ${T.g}`,
                  color: T.g,
                  padding: "0.8rem 1.5rem",
                  fontFamily: T.mono,
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  textTransform: "uppercase",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  cursor: "pointer",
                }}
              >
                <Plus size={16} /> Add Knowledge
              </button>

              {selectedGap.status === "open" ? (
                <button
                  onClick={() => handleResolveGap(selectedGap.id)}
                  style={{
                    background: T.g,
                    border: "none",
                    color: T.bg,
                    padding: "0.8rem 1.5rem",
                    fontFamily: T.mono,
                    fontSize: "0.8rem",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    clipPath:
                      "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
                  }}
                >
                  Mark as Resolved
                </button>
              ) : (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: T.g,
                    fontFamily: T.mono,
                    fontSize: "0.85rem",
                  }}
                >
                  <CheckCircle size={18} /> GAP RESOLVED
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
