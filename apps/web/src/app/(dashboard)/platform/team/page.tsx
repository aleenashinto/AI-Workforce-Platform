"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  CheckCircle,
  X,
  Search,
  Filter,
  ChevronDown,
  XCircle,
  Send,
} from "lucide-react";
import { useUserContext, MemberRole } from "@/contexts/UserContext";

/* ─── Design Tokens ───────────────────────────────────────────────────────── */
const T = {
  g: "var(--t-g)",
  g2: "var(--t-g2)",
  warn: "var(--t-warn)",
  red: "var(--t-red)",
  bg: "var(--t-bg)",
  bg2: "var(--t-bg2)",
  panel: "var(--t-panel)",
  border: "var(--t-border)",
  border2: "var(--t-border2)",
  muted: "var(--t-muted)",
  text: "var(--t-text)",
  glow: "var(--t-glow)",
  mono: "var(--t-font-mono)",
  display: "var(--t-font-display)",
  body: "var(--t-font-body)",
};

const ROLE_COLORS: Record<string, { bg: string; border: string; color: string }> = {
  owner:         { bg: "rgba(255,200,0,0.12)",  border: "var(--t-border)",  color: "#ffd700" },
  admin:         { bg: "rgba(255,100,0,0.12)",  border: "var(--t-border)",  color: "#ff8c42" },
  support_lead:  { bg: "rgba(0,162,255,0.12)",  border: "var(--t-border)",  color: "#00a2ff" },
  support_agent: { bg: "rgba(0,200,255,0.12)",  border: "var(--t-border)",  color: "#00c8ff" },
  sales_lead:    { bg: "rgba(180,0,255,0.12)",  border: "var(--t-border)",  color: "#b400ff" },
  sales_rep:     { bg: "rgba(210,80,255,0.12)", border: "var(--t-border)", color: "#d250ff" },
  viewer:        { bg: "rgba(150,150,150,0.1)", border: "var(--t-border)",color: "#999" },
};

const ALL_ROLES: MemberRole[] = [
  "owner", "admin", "support_lead", "support_agent", "sales_lead", "sales_rep", "viewer",
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

const STATUS_OPTIONS = ["All", "Active", "Pending"];

/* ─── Sub-components ──────────────────────────────────────────────────────── */
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

/* ─── Page ────────────────────────────────────────────────────────────────── */
export default function TeamPage() {
  const { hasRole } = useUserContext();
  const canManageMembers = hasRole("owner", "admin");

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/team')
      .then(res => res.json())
      .then(data => {
        if (data && data.members) {
          const mappedMembers = [
            ...data.members.map((m: any) => ({
              name: m.name || m.email,
              email: m.email,
              roles: [m.role],
              status: m.status === 'active' ? 'Active' : 'Pending',
              lastActive: 'Unknown'
            })),
            ...(data.invitations || []).map((i: any) => ({
              name: i.email,
              email: i.email,
              roles: [i.role],
              status: 'Pending',
              lastActive: 'Never'
            }))
          ];
          setMembers(mappedMembers);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow]   = useState<number | null>(null);

  /* ── Search & Filter state ─────────────────────────────────────────────── */
  const [searchTerm,   setSearchTerm]   = useState("");
  const [showFilter,   setShowFilter]   = useState(false);
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterRole,   setFilterRole]   = useState("All");

  /* ── Invite Member modal state ─────────────────────────────────────────── */
  const [showInvite,     setShowInvite]     = useState(false);
  const [inviteName,     setInviteName]     = useState("");
  const [inviteEmail,    setInviteEmail]    = useState("");
  const [inviteRole,     setInviteRole]     = useState<MemberRole>("viewer");
  const [inviteSuccess,  setInviteSuccess]  = useState(false);
  const [inviteError,    setInviteError]    = useState("");

  /* ── Filtered members ──────────────────────────────────────────────────── */
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        !search ||
        m.name.toLowerCase().includes(search) ||
        m.email.toLowerCase().includes(search);

      const matchesStatus =
        filterStatus === "All" || m.status === filterStatus;

      const matchesRole =
        filterRole === "All" || m.roles.includes(filterRole as MemberRole);

      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [members, searchTerm, filterStatus, filterRole]);

  const hasActiveFilters =
    searchTerm !== "" || filterStatus !== "All" || filterRole !== "All";

  const clearFilters = () => {
    setSearchTerm("");
    setFilterStatus("All");
    setFilterRole("All");
    setShowFilter(false);
  };

  /* ── Role toggle ───────────────────────────────────────────────────────── */
  const toggleRole = (memberIdx: number, role: MemberRole) => {
    setMembers((prev) => {
      const updated = [...prev];
      const m = { ...updated[memberIdx] };
      m.roles = m.roles.includes(role)
        ? m.roles.filter((r) => r !== role)
        : [...m.roles, role];
      updated[memberIdx] = m;
      return updated;
    });
  };

  /* ── Invite submit ─────────────────────────────────────────────────────── */
  const handleInvite = () => {
    setInviteError("");
    if (!inviteName.trim()) { setInviteError("Name is required."); return; }
    if (!inviteEmail.trim() || !inviteEmail.includes("@")) {
      setInviteError("A valid email is required."); return;
    }
    if (members.some((m) => m.email.toLowerCase() === inviteEmail.toLowerCase())) {
      setInviteError("A member with this email already exists."); return;
    }

    setMembers((prev) => [
      ...prev,
      { name: inviteName.trim(), email: inviteEmail.trim(), roles: [inviteRole], status: "Pending", lastActive: "Never" },
    ]);
    setInviteSuccess(true);

    setTimeout(() => {
      setShowInvite(false);
      setInviteSuccess(false);
      setInviteName("");
      setInviteEmail("");
      setInviteRole("viewer");
    }, 1800);
  };

  /* ─────────────────────────────────────────────────────────────────────── */
  return (
    <div style={{ padding: "2rem", maxWidth: 1100, margin: "0 auto", minHeight: "100vh" }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem", marginBottom: "2.5rem" }}>
        <div>
          <h1 style={{ fontFamily: T.display, fontSize: "2.2rem", fontWeight: 700, color: "var(--t-heading)", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "1rem", textShadow: "0 0 20px rgba(0,255,136,0.2)" }}>
            <Users color={T.g} size={32} /> Team Members
          </h1>
          <p style={{ fontFamily: T.mono, fontSize: "0.9rem", color: T.g, letterSpacing: "0.05em", opacity: 0.8 }}>
            Manage access and module roles for your organization.
          </p>
        </div>

        {/* Invite Member button — always visible, opens modal */}
        <button
          onClick={() => { setShowInvite(true); setInviteSuccess(false); setInviteError(""); }}
          style={{
            background: T.g, border: "none", padding: "0.8rem 1.5rem", color: T.bg,
            fontFamily: T.mono, fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer",
            boxShadow: T.glow, clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "var(--t-heading)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = T.g; }}
        >
          <UserPlus size={16} /> Invite Member
        </button>
      </div>

      {/* ── Search + Filter toolbar ─────────────────────────────────────── */}
      <div style={{ display: "flex", gap: "1rem", marginBottom: "0.75rem" }}>
        {/* Search */}
        <div style={{ flex: 1, position: "relative" }}>
          <Search size={16} color={T.muted} style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            style={{
              width: "100%", background: "rgba(0,255,136,0.03)", border: `1px solid ${T.border}`,
              padding: "0.8rem 2.8rem 0.8rem 2.8rem", color: T.text, fontFamily: T.mono,
              fontSize: "0.85rem", outline: "none", boxSizing: "border-box",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = T.g; e.currentTarget.style.boxShadow = `0 0 0 1px ${T.g}`; }}
            onBlur={(e)  => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.boxShadow = "none"; }}
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm("")} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: T.muted, padding: 0, display: "flex" }}>
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters toggle button */}
        <button
          onClick={() => setShowFilter((v) => !v)}
          style={{
            background: showFilter ? "rgba(0,255,136,0.12)" : "rgba(0,255,136,0.05)",
            border: `1px solid ${showFilter ? T.g : T.border}`,
            padding: "0.8rem 1.2rem", color: showFilter ? T.g : T.muted,
            fontFamily: T.mono, fontSize: "0.85rem",
            display: "flex", alignItems: "center", gap: "0.5rem",
            cursor: "pointer", transition: "all 0.2s", position: "relative",
          }}
        >
          <Filter size={16} />
          Filters
          {hasActiveFilters && (
            <span style={{ background: T.g, color: T.bg, borderRadius: "50%", width: 16, height: 16, fontSize: "0.6rem", fontWeight: "bold", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {(filterStatus !== "All" ? 1 : 0) + (filterRole !== "All" ? 1 : 0)}
            </span>
          )}
          <ChevronDown size={14} style={{ transform: showFilter ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
        </button>
      </div>

      {/* ── Filter panel (dropdown) ─────────────────────────────────────── */}
      {showFilter && (
        <div style={{
          background: T.panel,
          borderRadius: "var(--t-radius)", border: `1px solid ${T.border}`, padding: "1.25rem 1.5rem",
          marginBottom: "1rem", display: "flex", gap: "2rem", alignItems: "flex-end", flexWrap: "wrap",
          boxShadow: "0 8px 30px rgba(0,0,0,0.4)",
        }}>
          {/* Status filter */}
          <div>
            <div style={{ fontFamily: T.mono, fontSize: "0.65rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Status</div>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  style={{
                    fontFamily: T.mono, fontSize: "0.7rem", cursor: "pointer",
                    padding: "0.4rem 0.9rem", textTransform: "uppercase",
                    background: filterStatus === s ? "rgba(0,255,136,0.15)" : "rgba(0,255,136,0.03)",
                    border: `1px solid ${filterStatus === s ? T.g : T.border}`,
                    color: filterStatus === s ? T.g : T.muted,
                    transition: "all 0.15s",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Role filter */}
          <div>
            <div style={{ fontFamily: T.mono, fontSize: "0.65rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>Role</div>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {["All", ...ALL_ROLES].map((r) => {
                const c = ROLE_COLORS[r];
                const active = filterRole === r;
                return (
                  <button
                    key={r}
                    onClick={() => setFilterRole(r)}
                    style={{
                      fontFamily: T.mono, fontSize: "0.65rem", cursor: "pointer",
                      padding: "0.4rem 0.9rem", textTransform: "uppercase",
                      background: active ? (c?.bg ?? "rgba(0,255,136,0.15)") : "rgba(0,255,136,0.03)",
                      border: `1px solid ${active ? (c?.border ?? T.g) : T.border}`,
                      color: active ? (c?.color ?? T.g) : T.muted,
                      transition: "all 0.15s",
                    }}
                  >
                    {r === "All" ? "All Roles" : ROLE_LABELS[r]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Clear */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, fontFamily: T.mono, fontSize: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem", textDecoration: "underline", padding: "0.4rem 0" }}
            >
              <XCircle size={14} /> Clear all
            </button>
          )}

          <div style={{ marginLeft: "auto", fontFamily: T.mono, fontSize: "0.72rem", color: T.muted, alignSelf: "center" }}>
            {filteredMembers.length} of {members.length} member{members.length !== 1 ? "s" : ""}
          </div>
        </div>
      )}

      {/* ── Data Table ─────────────────────────────────────────────────── */}
      <div style={{ background: T.panel,
          borderRadius: "var(--t-radius)", border: `1px solid ${T.border}`, position: "relative", boxShadow: "0 10px 40px rgba(0,0,0,0.4)", overflow: "hidden" }}>
        <Corners />
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,${T.g},transparent)` }} />

        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={{ width: "100%", minWidth: 680, borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}`, background: "rgba(0,0,0,0.2)" }}>
              {["User", "Roles", "Status"].map((h, idx) => (
                <th key={h} style={{ textAlign: "left", padding: "1.2rem 1.5rem", fontFamily: T.mono, fontSize: "0.7rem", color: T.g, textTransform: "uppercase", letterSpacing: "0.1em", width: idx === 1 ? "40%" : undefined }}>
                  {h}
                </th>
              ))}
              {canManageMembers && (
                <th style={{ textAlign: "right", padding: "1.2rem 1.5rem", fontFamily: T.mono, fontSize: "0.7rem", color: T.g, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {filteredMembers.length === 0 ? (
              <tr>
                <td colSpan={canManageMembers ? 4 : 3} style={{ padding: "3rem", textAlign: "center", fontFamily: T.mono, fontSize: "0.85rem", color: T.muted }}>
                  {hasActiveFilters ? "No members match the current filters." : "No team members found."}
                </td>
              </tr>
            ) : (
              filteredMembers.map((m, i) => {
                // find the real index in original members array for editing
                const realIdx = members.findIndex((mm) => mm.email === m.email);
                return (
                  <tr
                    key={m.email}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      borderBottom: i === filteredMembers.length - 1 ? "none" : `1px solid rgba(0,255,136,0.05)`,
                      background: hoveredRow === i ? "rgba(0,255,136,0.02)" : "transparent",
                      transition: "background 0.2s",
                    }}
                  >
                    {/* User cell */}
                    <td style={{ padding: "1.5rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                        <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg,${T.g}22,${T.g2}22)`, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.display, color: "var(--t-heading)", fontSize: "1.2rem", fontWeight: 700 }}>
                          {m.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontFamily: T.body, fontSize: "1.1rem", color: "var(--t-heading)", fontWeight: 600, marginBottom: "0.2rem" }}>{m.name}</div>
                          <div style={{ fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                            <Mail size={12} /> {m.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Roles cell */}
                    <td style={{ padding: "1.5rem" }}>
                      {editingIndex === realIdx && canManageMembers ? (
                        <div style={{ background: "rgba(0,0,0,0.4)", border: `1px solid ${T.border}`, padding: "1rem", borderRadius: "4px", display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                          {ALL_ROLES.map((role) => {
                            const assigned = m.roles.includes(role);
                            const c = ROLE_COLORS[role] || ROLE_COLORS.viewer;
                            return (
                              <button
                                key={role}
                                onClick={() => toggleRole(realIdx, role)}
                                style={{
                                  fontFamily: T.mono, fontSize: "0.65rem", cursor: "pointer",
                                  color: assigned ? c.color : T.muted,
                                  background: assigned ? c.bg : "var(--t-white-03)",
                                  padding: "0.4rem 0.8rem",
                                  border: `1px solid ${assigned ? c.border : "var(--t-white-10)"}`,
                                  textTransform: "uppercase", letterSpacing: "0.05em",
                                  transition: "all 0.2s", borderRadius: "2px",
                                  display: "flex", alignItems: "center", gap: "0.4rem",
                                }}
                              >
                                {assigned ? <CheckCircle size={12} /> : <div style={{ width: 12, height: 12, borderRadius: "50%", border: "1px solid var(--t-white-30)" }} />}
                                {ROLE_LABELS[role]}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{ display: "flex", flexWrap: "wrap" }}>
                          {m.roles.length > 0
                            ? m.roles.map((r) => <RoleBadge key={r} role={r} />)
                            : <span style={{ fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, fontStyle: "italic" }}>No roles assigned</span>}
                        </div>
                      )}
                    </td>

                    {/* Status cell */}
                    <td style={{ padding: "1.5rem" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <div style={{ width: 8, height: 8, borderRadius: "50%", background: m.status === "Active" ? T.g : T.warn, boxShadow: `0 0 10px ${m.status === "Active" ? T.g : T.warn}` }} />
                          <span style={{ fontFamily: T.mono, fontSize: "0.8rem", color: m.status === "Active" ? T.g : T.warn }}>{m.status.toUpperCase()}</span>
                        </div>
                        <div style={{ fontFamily: T.mono, fontSize: "0.65rem", color: T.muted }}>Last seen: {m.lastActive}</div>
                      </div>
                    </td>

                    {/* Actions cell */}
                    {canManageMembers && (
                      <td style={{ padding: "1.5rem", textAlign: "right" }}>
                        {editingIndex === realIdx ? (
                          <button
                            onClick={() => setEditingIndex(null)}
                            style={{ background: T.g, border: "none", color: T.bg, fontFamily: T.mono, fontSize: "0.7rem", padding: "0.5rem 1rem", cursor: "pointer", textTransform: "uppercase", display: "inline-flex", alignItems: "center", gap: "0.4rem", fontWeight: "bold", boxShadow: T.glow, transition: "all 0.2s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--t-heading)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = T.g; }}
                          >
                            <Shield size={14} /> Save Roles
                          </button>
                        ) : (
                          <button
                            onClick={() => setEditingIndex(realIdx)}
                            style={{ background: "rgba(0,255,136,0.05)", border: `1px solid ${T.border}`, color: T.text, fontFamily: T.mono, fontSize: "0.7rem", padding: "0.5rem 1rem", cursor: "pointer", textTransform: "uppercase", transition: "all 0.2s" }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(0,255,136,0.15)"; e.currentTarget.style.borderColor = T.g; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,255,136,0.05)"; e.currentTarget.style.borderColor = T.border; }}
                          >
                            Edit Access
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
          </table>
        </div>
      </div>

      {/* ── Invite Member Modal ─────────────────────────────────────────── */}
      {showInvite && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: "1rem" }}>
          <div style={{ background: T.panel,
          borderRadius: "var(--t-radius)", border: `1px solid ${T.border}`, width: "100%", maxWidth: 480, padding: "2rem", position: "relative", boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}>
            <Corners />
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 1, background: `linear-gradient(90deg,${T.g},transparent)` }} />

            {/* Modal header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <h2 style={{ fontFamily: T.display, fontSize: "1.2rem", color: "var(--t-heading)", margin: 0, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <UserPlus size={20} color={T.g} /> Invite Member
              </h2>
              <button onClick={() => setShowInvite(false)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, padding: 4, display: "flex" }}>
                <X size={20} />
              </button>
            </div>

            {inviteSuccess ? (
              <div style={{ textAlign: "center", padding: "2rem 0" }}>
                <CheckCircle size={48} color={T.g} style={{ margin: "0 auto 1rem" }} />
                <div style={{ fontFamily: T.mono, color: T.g, fontSize: "1rem" }}>Invitation sent!</div>
                <div style={{ fontFamily: T.mono, color: T.muted, fontSize: "0.8rem", marginTop: "0.5rem" }}>{inviteEmail}</div>
              </div>
            ) : (
              <>
                {inviteError && (
                  <div style={{ background: "rgba(255,51,85,0.08)", border: "1px solid rgba(255,51,85,0.4)", padding: "0.75rem 1rem", marginBottom: "1rem", fontFamily: T.mono, fontSize: "0.8rem", color: "#ff3355", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <X size={14} /> {inviteError}
                  </div>
                )}

                {/* Name */}
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ fontFamily: T.mono, fontSize: "0.7rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "0.4rem" }}>Full Name</label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Jane Smith"
                    style={{ width: "100%", background: "rgba(0,255,136,0.03)", border: `1px solid ${T.border}`, padding: "0.75rem 1rem", color: T.text, fontFamily: T.mono, fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = T.g; }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor = T.border; }}
                  />
                </div>

                {/* Email */}
                <div style={{ marginBottom: "1rem" }}>
                  <label style={{ fontFamily: T.mono, fontSize: "0.7rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "0.4rem" }}>Email Address</label>
                  <input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="jane@company.com"
                    style={{ width: "100%", background: "rgba(0,255,136,0.03)", border: `1px solid ${T.border}`, padding: "0.75rem 1rem", color: T.text, fontFamily: T.mono, fontSize: "0.85rem", outline: "none", boxSizing: "border-box" }}
                    onFocus={(e) => { e.currentTarget.style.borderColor = T.g; }}
                    onBlur={(e)  => { e.currentTarget.style.borderColor = T.border; }}
                    onKeyDown={(e) => e.key === "Enter" && handleInvite()}
                  />
                </div>

                {/* Role */}
                <div style={{ marginBottom: "1.5rem" }}>
                  <label style={{ fontFamily: T.mono, fontSize: "0.7rem", color: T.muted, textTransform: "uppercase", letterSpacing: "0.1em", display: "block", marginBottom: "0.6rem" }}>Initial Role</label>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                    {ALL_ROLES.filter((r) => r !== "owner").map((role) => {
                      const c = ROLE_COLORS[role];
                      const active = inviteRole === role;
                      return (
                        <button
                          key={role}
                          onClick={() => setInviteRole(role)}
                          style={{
                            fontFamily: T.mono, fontSize: "0.65rem", cursor: "pointer",
                            padding: "0.4rem 0.8rem", textTransform: "uppercase",
                            background: active ? c.bg : "var(--t-white-03)",
                            border: `1px solid ${active ? c.border : "var(--t-white-10)"}`,
                            color: active ? c.color : T.muted, transition: "all 0.15s", borderRadius: "2px",
                          }}
                        >
                          {ROLE_LABELS[role]}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "0.75rem" }}>
                  <button
                    onClick={handleInvite}
                    style={{ flex: 1, background: T.g, border: "none", color: T.bg, fontFamily: T.mono, fontSize: "0.8rem", fontWeight: "bold", padding: "0.9rem", cursor: "pointer", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", boxShadow: T.glow, transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--t-heading)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = T.g; }}
                  >
                    <Send size={16} /> Send Invitation
                  </button>
                  <button
                    onClick={() => setShowInvite(false)}
                    style={{ padding: "0.9rem 1.2rem", background: "transparent", border: `1px solid ${T.border}`, color: T.muted, fontFamily: T.mono, fontSize: "0.8rem", cursor: "pointer", transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.g; e.currentTarget.style.color = T.g; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.muted; }}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
