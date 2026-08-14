'use client';

import { 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  FileText, Search, Filter, Shield
} from "lucide-react";

const T = {
  g:       "#00ff88",
  bg:      "#040810",
  bg2:     "#070e1a",
  panel:   "#0a1628",
  border:  "rgba(0,255,136,0.18)",
  muted:   "rgba(0,255,136,0.45)",
  text:    "#c8ffe8",
  glow:    "0 0 20px rgba(0,255,136,0.35),0 0 60px rgba(0,255,136,0.12)",
  mono:    "'Share Tech Mono', monospace",
  display: "'Orbitron', sans-serif",
  body:    "'Rajdhani', sans-serif",
};

const Corners = () => (
  <>
    {[["tl","1px 0 0 1px","0","0","auto","auto"],
      ["tr","1px 1px 0 0","0","auto","0","auto"],
      ["bl","0 0 1px 1px","auto","0","auto","0"],
      ["br","0 1px 1px 0","auto","auto","0","0"]].map(([k, bw, t, l, b, r]) => (
      <span key={k} style={{
        position:"absolute", width:14, height:14,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        borderColor: T.g, borderStyle:"solid", borderWidth: bw as any, opacity: 0.5,
        top:t==="auto"?undefined:8, left:l==="auto"?undefined:8,
        bottom:b==="auto"?undefined:8, right:r==="auto"?undefined:8,
      }}/>
    ))}
  </>
);

export default function AuditLogsPage() {
  const logs = [
    { date: "Aug 12 14:20", user: "Aleena", action: "Added knowledge source", resource: "Refund Policy.pdf", ip: "192.168.1.1", status: "Success" },
    { date: "Aug 12 13:45", user: "John", action: "Invited team member", resource: "sarah@acme.inc", ip: "10.0.0.5", status: "Success" },
    { date: "Aug 12 12:10", user: "Aleena", action: "Connected Gmail mailbox", resource: "sales@acme.inc", ip: "192.168.1.1", status: "Success" },
    { date: "Aug 12 11:40", user: "Sarah", action: "Activated sequence", resource: "Q3 Outbound", ip: "172.16.0.4", status: "Success" },
  ];

  return (
    <div>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
        <div>
          <h1 style={{ fontFamily: T.display, fontSize: "2.2rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <Shield color={T.g} size={32} /> Audit Logs
          </h1>
          <p style={{ fontFamily: T.mono, fontSize: "0.9rem", color: T.g, letterSpacing: "0.05em" }}>
            Track security and configuration changes across your organization.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={14} color={T.muted} style={{ position: "absolute", left: 12, top: 10 }} />
          <input type="text" placeholder="Search by user, action, resource..." style={{ width: "100%", background: T.panel, border: `1px solid ${T.border}`, color: T.text, fontFamily: T.mono, fontSize: "0.8rem", padding: "0.5rem 1rem 0.5rem 2.2rem", outline: "none" }} />
        </div>
        <button style={{ background: T.panel, border: `1px solid ${T.border}`, padding: "0.5rem 1rem", color: T.text, fontFamily: T.mono, fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}><Filter size={14}/> All Users</button>
        <button style={{ background: T.panel, border: `1px solid ${T.border}`, padding: "0.5rem 1rem", color: T.text, fontFamily: T.mono, fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}><Filter size={14}/> Date Range</button>
      </div>

      <div style={{ background: T.panel, border: `1px solid ${T.border}`, position: "relative" }}>
        <Corners />
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              <th style={{ textAlign: "left", padding: "1.2rem 1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, textTransform: "uppercase" }}>Date</th>
              <th style={{ textAlign: "left", padding: "1.2rem 1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, textTransform: "uppercase" }}>User</th>
              <th style={{ textAlign: "left", padding: "1.2rem 1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, textTransform: "uppercase" }}>Action</th>
              <th style={{ textAlign: "left", padding: "1.2rem 1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, textTransform: "uppercase" }}>Resource</th>
              <th style={{ textAlign: "left", padding: "1.2rem 1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, textTransform: "uppercase" }}>IP Address</th>
              <th style={{ textAlign: "left", padding: "1.2rem 1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, textTransform: "uppercase" }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, i) => (
              <tr key={i} style={{ borderBottom: i === logs.length - 1 ? "none" : `1px solid rgba(0,255,136,0.1)`, transition: "background 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(0,255,136,0.05)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{ padding: "1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.text }}>{log.date}</td>
                <td style={{ padding: "1rem", fontFamily: T.body, fontSize: "0.95rem", color: "#fff", fontWeight: 600 }}>{log.user}</td>
                <td style={{ padding: "1rem", fontFamily: T.body, fontSize: "0.9rem", color: T.text }}>{log.action}</td>
                <td style={{ padding: "1rem", fontFamily: T.mono, fontSize: "0.8rem", color: T.muted }}>{log.resource}</td>
                <td style={{ padding: "1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted }}>{log.ip}</td>
                <td style={{ padding: "1rem" }}>
                  <span style={{ fontFamily: T.mono, fontSize: "0.7rem", color: T.g, background: "rgba(0,255,136,0.1)", padding: "0.2rem 0.5rem", border: `1px solid ${T.border}`, textTransform: "uppercase" }}>{log.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
