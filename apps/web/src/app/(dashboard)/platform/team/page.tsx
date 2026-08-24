"use client";

import { useState } from "react";
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  CheckCircle,
  X,
  Search,
  Filter,
} from "lucide-react";
import { useUserContext, MemberRole } from "@/contexts/UserContext";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  g: "#00ff88",
  g2: "#00cfff",
  warn: "#ffaa00",
  red: "#ff3355",
  bg: "#040810",
  bg2: "#070e1a",
  panel: "#0a1628",
  border: "rgba(0,255,136,0.18)",
  border2: "rgba(0,207,255,0.18)",
  muted: "rgba(0,255,136,0.45)",
  text: "#c8ffe8",
  glow: "0 0 20px rgba(0,255,136,0.35),0 0 60px rgba(0,255,136,0.12)",
  mono: "'Share Tech Mono', monospace",
  display: "'Orbitron', sans-serif",
  body: "'Rajdhani', sans-serif",
};

const ROLE_COLORS: Record<
  string,
  { bg: string; border: string; color: string }
> = {
  owner: {
    bg: "rgba(255,200,0,0.12)",
    border: "rgba(255,200,0,0.4)",
    color: "#ffd700",
  },
  admin: {
    bg: "rgba(255,100,0,0.12)",
    border: "rgba(255,100,0,0.4)",
    color: "#ff8c42",
  },
  support_lead: {
    bg: "rgba(0,162,255,0.12)",
    border: "rgba(0,162,255,0.4)",
    color: "#00a2ff",
  },
  support_agent: {
    bg: "rgba(0,200,255,0.12)",
    border: "rgba(0,200,255,0.4)",
    color: "#00c8ff",
  },
  sales_lead: {
    bg: "rgba(180,0,255,0.12)",
    border: "rgba(180,0,255,0.4)",
    color: "#b400ff",
  },
  sales_rep: {
    bg: "rgba(210,80,255,0.12)",
    border: "rgba(210,80,255,0.4)",
    color: "#d250ff",
  },
  viewer: {
    bg: "rgba(150,150,150,0.1)",
    border: "rgba(150,150,150,0.3)",
    color: "#999",
  },
};

const ALL_ROLES: MemberRole[] = [
  "owner",
  "admin",
  "support_lead",
  "support_agent",
  "sales_lead",
  "sales_rep",
  "viewer",
];

const ROLE_LABELS: Record<string, string> = {
  owner: "Owner",
  admin: "Admin",
  support_lead: "Support Lead",
  support_agent: "Support Agent",
  sales_lead: "Sales Lead",
  sales_rep: "Sales Rep",
  viewer: "Viewer",
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

function RoleBadge({ role }: { role: string }) {
  const c = ROLE_COLORS[role] || ROLE_COLORS.viewer;
  return (
    <span
      style={{
        fontFamily: T.mono,
        fontSize: "0.65rem",
        color: c.color,
        background: c.bg,
        padding: "0.3rem 0.6rem",
        border: `1px solid ${c.border}`,
        display: "inline-block",
        marginRight: "0.4rem",
        marginBottom: "0.4rem",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        borderRadius: "2px",
      }}
    >
      {ROLE_LABELS[role] || role}
    </span>
  );
}

type Member = {
  name: string;
  email: string;
  roles: MemberRole[];
  status: string;
  lastActive: string;
};

export default function TeamPage() {
  const { hasRole } = useUserContext();
  const canManageMembers = hasRole("owner", "admin");

  const [members, setMembers] = useState<Member[]>([
    {
      name: "Aleena",
      email: "aleena@company.com",
      roles: ["owner"],
      status: "Active",
      lastActive: "Just now",
    },
    {
      name: "John Doe",
      email: "john@company.com",
      roles: ["admin"],
      status: "Active",
      lastActive: "2h ago",
    },
    {
      name: "Sarah Smith",
      email: "sarah@company.com",
      roles: ["support_agent", "sales_rep"],
      status: "Pending",
      lastActive: "Never",
    },
    {
      name: "Marcus Lee",
      email: "marcus@company.com",
      roles: ["support_lead"],
      status: "Active",
      lastActive: "1h ago",
    },
  ]);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const toggleRole = (memberIdx: number, role: MemberRole) => {
    setMembers((prev) => {
      const updated = [...prev];
      const m = { ...updated[memberIdx] };
      if (m.roles.includes(role)) {
        m.roles = m.roles.filter((r) => r !== role);
      } else {
        m.roles = [...m.roles, role];
      }
      updated[memberIdx] = m;
      return updated;
    });
  };

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: 1100,
        margin: "0 auto",
        minHeight: "100vh",
      }}
    >
      {/* Header Section */}
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
              color: "#fff",
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              textShadow: "0 0 20px rgba(0,255,136,0.2)",
            }}
          >
            <Users color={T.g} size={32} /> Team Members
          </h1>
          <p
            style={{
              fontFamily: T.mono,
              fontSize: "0.9rem",
              color: T.g,
              letterSpacing: "0.05em",
              opacity: 0.8,
            }}
          >
            Manage access and module roles for your organization.
          </p>
        </div>
        {canManageMembers && (
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
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.boxShadow = `0 0 30px rgba(255,255,255,0.4)`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = T.g;
              e.currentTarget.style.boxShadow = T.glow;
            }}
          >
            <UserPlus size={16} /> Invite Member
          </button>
        )}
      </div>

      {/* Toolbar / Search */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ flex: 1, position: "relative" }}>
          <Search
            size={16}
            color={T.muted}
            style={{
              position: "absolute",
              left: 16,
              top: "50%",
              transform: "translateY(-50%)",
            }}
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            style={{
              width: "100%",
              background: "rgba(0,255,136,0.03)",
              border: `1px solid ${T.border}`,
              padding: "0.8rem 1rem 0.8rem 2.8rem",
              color: T.text,
              fontFamily: T.mono,
              fontSize: "0.85rem",
              outline: "none",
              transition: "all 0.2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = T.g;
              e.currentTarget.style.boxShadow = `0 0 0 1px ${T.g}`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = T.border;
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>
        <button
          style={{
            background: "rgba(0,255,136,0.05)",
            border: `1px solid ${T.border}`,
            padding: "0.8rem 1.2rem",
            color: T.g,
            fontFamily: T.mono,
            fontSize: "0.85rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(0,255,136,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(0,255,136,0.05)";
          }}
        >
          <Filter size={16} /> Filters
        </button>
      </div>

      {/* Data Table */}
      <div
        style={{
          background: T.panel,
          border: `1px solid ${T.border}`,
          position: "relative",
          boxShadow: `0 10px 40px rgba(0,0,0,0.4)`,
        }}
      >
        <Corners />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            background: `linear-gradient(90deg,${T.g},transparent)`,
          }}
        />

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr
              style={{
                borderBottom: `1px solid ${T.border}`,
                background: "rgba(0,0,0,0.2)",
              }}
            >
              <th
                style={{
                  textAlign: "left",
                  padding: "1.2rem 1.5rem",
                  fontFamily: T.mono,
                  fontSize: "0.7rem",
                  color: T.g,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                User
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "1.2rem 1.5rem",
                  fontFamily: T.mono,
                  fontSize: "0.7rem",
                  color: T.g,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  width: "40%",
                }}
              >
                Roles
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "1.2rem 1.5rem",
                  fontFamily: T.mono,
                  fontSize: "0.7rem",
                  color: T.g,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                Status
              </th>
              {canManageMembers && (
                <th
                  style={{
                    textAlign: "right",
                    padding: "1.2rem 1.5rem",
                    fontFamily: T.mono,
                    fontSize: "0.7rem",
                    color: T.g,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {members.map((m, i) => (
              <tr
                key={i}
                onMouseEnter={() => setHoveredRow(i)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  borderBottom:
                    i === members.length - 1
                      ? "none"
                      : `1px solid rgba(0,255,136,0.05)`,
                  background:
                    hoveredRow === i ? "rgba(0,255,136,0.02)" : "transparent",
                  transition: "background 0.2s",
                }}
              >
                <td style={{ padding: "1.5rem" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                    }}
                  >
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: `linear-gradient(135deg, ${T.g}22, ${T.g2}22)`,
                        border: `1px solid ${T.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontFamily: T.display,
                        color: "#fff",
                        fontSize: "1.2rem",
                        fontWeight: 700,
                      }}
                    >
                      {m.name.charAt(0)}
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: T.body,
                          fontSize: "1.1rem",
                          color: "#fff",
                          fontWeight: 600,
                          marginBottom: "0.2rem",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {m.name}
                      </div>
                      <div
                        style={{
                          fontFamily: T.mono,
                          fontSize: "0.75rem",
                          color: T.muted,
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                        }}
                      >
                        <Mail size={12} /> {m.email}
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "1.5rem" }}>
                  {editingIndex === i && canManageMembers ? (
                    <div
                      style={{
                        background: "rgba(0,0,0,0.4)",
                        border: `1px solid ${T.border}`,
                        padding: "1rem",
                        borderRadius: "4px",
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.4rem",
                        boxShadow: `inset 0 0 20px rgba(0,0,0,0.5)`,
                      }}
                    >
                      {ALL_ROLES.map((role) => {
                        const assigned = m.roles.includes(role);
                        const c = ROLE_COLORS[role] || ROLE_COLORS.viewer;
                        return (
                          <button
                            key={role}
                            onClick={() => toggleRole(i, role)}
                            style={{
                              fontFamily: T.mono,
                              fontSize: "0.65rem",
                              cursor: "pointer",
                              color: assigned ? c.color : T.muted,
                              background: assigned
                                ? c.bg
                                : "rgba(255,255,255,0.03)",
                              padding: "0.4rem 0.8rem",
                              border: `1px solid ${assigned ? c.border : "rgba(255,255,255,0.1)"}`,
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                              transition: "all 0.2s",
                              borderRadius: "2px",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem",
                            }}
                            onMouseEnter={(e) => {
                              if (!assigned)
                                e.currentTarget.style.background =
                                  "rgba(255,255,255,0.08)";
                            }}
                            onMouseLeave={(e) => {
                              if (!assigned)
                                e.currentTarget.style.background =
                                  "rgba(255,255,255,0.03)";
                            }}
                          >
                            {assigned ? (
                              <CheckCircle size={12} />
                            ) : (
                              <div
                                style={{
                                  width: 12,
                                  height: 12,
                                  borderRadius: "50%",
                                  border: "1px solid rgba(255,255,255,0.3)",
                                }}
                              />
                            )}
                            {ROLE_LABELS[role]}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexWrap: "wrap" }}>
                      {m.roles.length > 0 ? (
                        m.roles.map((r) => <RoleBadge key={r} role={r} />)
                      ) : (
                        <span
                          style={{
                            fontFamily: T.mono,
                            fontSize: "0.75rem",
                            color: T.muted,
                            fontStyle: "italic",
                          }}
                        >
                          No roles assigned
                        </span>
                      )}
                    </div>
                  )}
                </td>
                <td style={{ padding: "1.5rem" }}>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "0.4rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.4rem",
                      }}
                    >
                      {m.status === "Active" ? (
                        <>
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: T.g,
                              boxShadow: `0 0 10px ${T.g}`,
                            }}
                          />
                          <span
                            style={{
                              fontFamily: T.mono,
                              fontSize: "0.8rem",
                              color: T.g,
                            }}
                          >
                            ACTIVE
                          </span>
                        </>
                      ) : (
                        <>
                          <div
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: T.warn,
                              boxShadow: `0 0 10px ${T.warn}`,
                            }}
                          />
                          <span
                            style={{
                              fontFamily: T.mono,
                              fontSize: "0.8rem",
                              color: T.warn,
                            }}
                          >
                            PENDING
                          </span>
                        </>
                      )}
                    </div>
                    <div
                      style={{
                        fontFamily: T.mono,
                        fontSize: "0.65rem",
                        color: T.muted,
                      }}
                    >
                      Last seen: {m.lastActive}
                    </div>
                  </div>
                </td>
                {canManageMembers && (
                  <td style={{ padding: "1.5rem", textAlign: "right" }}>
                    {editingIndex === i ? (
                      <button
                        onClick={() => setEditingIndex(null)}
                        style={{
                          background: T.g,
                          border: "none",
                          color: T.bg,
                          fontFamily: T.mono,
                          fontSize: "0.7rem",
                          padding: "0.5rem 1rem",
                          cursor: "pointer",
                          textTransform: "uppercase",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          fontWeight: "bold",
                          boxShadow: T.glow,
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = T.g;
                        }}
                      >
                        <Shield size={14} /> Save Roles
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingIndex(i)}
                        style={{
                          background: "rgba(0,255,136,0.05)",
                          border: `1px solid ${T.border}`,
                          color: T.text,
                          fontFamily: T.mono,
                          fontSize: "0.7rem",
                          padding: "0.5rem 1rem",
                          cursor: "pointer",
                          textTransform: "uppercase",
                          transition: "all 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(0,255,136,0.15)";
                          e.currentTarget.style.borderColor = T.g;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "rgba(0,255,136,0.05)";
                          e.currentTarget.style.borderColor = T.border;
                        }}
                      >
                        Edit Access
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
