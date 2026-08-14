'use client';

import { 
  Search, Filter, PenTool
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const T = {
  g:       "#00ff88",
  g2:      "#00cfff",
  bg:      "#040810",
  bg2:     "#070e1a",
  panel:   "#0a1628",
  border:  "rgba(0,255,136,0.18)",
  border2: "rgba(0,207,255,0.18)",
  muted:   "rgba(0,255,136,0.45)",
  muted2:  "rgba(0,207,255,0.45)",
  text:    "#c8ffe8",
  glow2:   "0 0 20px rgba(0,207,255,0.35),0 0 60px rgba(0,207,255,0.12)",
  mono:    "'Share Tech Mono', monospace",
  display: "'Orbitron', sans-serif",
  body:    "'Rajdhani', sans-serif",
  warn:    "#ffaa00",
  red:     "#ff3355"
};

const Corners = () => (
  <>
    {[["tl","1px 0 0 1px","0","0","auto","auto"],
      ["tr","1px 1px 0 0","0","auto","0","auto"],
      ["bl","0 0 1px 1px","auto","0","auto","0"],
      ["br","0 1px 1px 0","auto","auto","0","0"]].map(([k, bw, t, l, b, r]) => (
      <span key={k} style={{
        position:"absolute", width:14, height:14,
        borderColor: T.g2, borderStyle:"solid", borderWidth: bw as number | string, opacity: 0.5,
        top:t==="auto"?undefined:8, left:l==="auto"?undefined:8,
        bottom:b==="auto"?undefined:8, right:r==="auto"?undefined:8,
      }}/>
    ))}
  </>
);

export default function DraftsPage() {
  const [drafts] = useState([
    { id: "DRF-001", lead: "Sarah Chen", company: "Acme Inc", subject: "Congrats on the $45M Series B!", sequence: "SaaS Campaign Q3", status: "Draft", date: "2h ago" },
    { id: "DRF-002", lead: "John Davis", company: "Nova Corp", subject: "Scaling data infrastructure at Nova", sequence: "Enterprise Outbound", status: "Approved", date: "1d ago" },
    { id: "DRF-003", lead: "Mike Smith", company: "TechCorp", subject: "Quick question about your tech stack", sequence: "SaaS Campaign Q3", status: "Sent", date: "2d ago" },
  ]);

  const getStatusColor = (s: string) => {
    if (s === 'Approved') return T.g;
    if (s === 'Draft') return T.warn;
    if (s === 'Sent') return T.g2;
    if (s === 'Rejected') return T.red;
    return T.muted2;
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 1400, margin: "0 auto" }}>
      
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontFamily: T.display, fontSize: "2.2rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <PenTool color={T.g2} size={32} /> Outreach Drafts
        </h1>
        <p style={{ fontFamily: T.mono, fontSize: "0.9rem", color: T.g2, letterSpacing: "0.05em" }}>
          Review and approve AI-generated emails.
        </p>
      </div>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={14} color={T.muted2} style={{ position: "absolute", left: 12, top: 10 }} />
          <input type="text" placeholder="Search by lead or company..." style={{ width: "100%", background: T.panel, border: `1px solid ${T.border2}`, color: T.text, fontFamily: T.mono, fontSize: "0.8rem", padding: "0.5rem 1rem 0.5rem 2.2rem", outline: "none" }} />
        </div>
        <button style={{ background: T.panel, border: `1px solid ${T.border2}`, padding: "0.5rem 1rem", color: T.text, fontFamily: T.mono, fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}><Filter size={14}/> Status: Draft</button>
      </div>

      <div style={{ background: T.panel, border: `1px solid ${T.border2}`, position: "relative" }}>
        <Corners />
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border2}` }}>
              <th style={{ textAlign: "left", padding: "1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted2, textTransform: "uppercase" }}>Lead</th>
              <th style={{ textAlign: "left", padding: "1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted2, textTransform: "uppercase" }}>Company</th>
              <th style={{ textAlign: "left", padding: "1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted2, textTransform: "uppercase" }}>Subject</th>
              <th style={{ textAlign: "left", padding: "1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted2, textTransform: "uppercase" }}>Sequence</th>
              <th style={{ textAlign: "left", padding: "1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted2, textTransform: "uppercase" }}>Status</th>
              <th style={{ textAlign: "left", padding: "1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted2, textTransform: "uppercase" }}>Created</th>
              <th style={{ textAlign: "right", padding: "1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted2, textTransform: "uppercase" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drafts.map((d, i) => (
              <tr key={d.id} style={{ borderBottom: i === drafts.length - 1 ? "none" : `1px solid rgba(0,207,255,0.1)`, transition: "background 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(0,207,255,0.05)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{ padding: "1rem", fontFamily: T.body, fontSize: "1rem", color: "#fff", fontWeight: 600 }}>{d.lead}</td>
                <td style={{ padding: "1rem", fontFamily: T.body, fontSize: "0.9rem", color: T.text }}>{d.company}</td>
                <td style={{ padding: "1rem", fontFamily: T.body, fontSize: "0.9rem", color: T.text, fontStyle: "italic" }}>&quot;{d.subject}&quot;</td>
                <td style={{ padding: "1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted2 }}>{d.sequence}</td>
                <td style={{ padding: "1rem" }}>
                  <span style={{ fontFamily: T.mono, fontSize: "0.7rem", color: getStatusColor(d.status), border: `1px solid ${getStatusColor(d.status)}40`, background: `${getStatusColor(d.status)}10`, padding: "0.2rem 0.5rem", textTransform: "uppercase" }}>
                    {d.status}
                  </span>
                </td>
                <td style={{ padding: "1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted2 }}>{d.date}</td>
                <td style={{ padding: "1rem", textAlign: "right" }}>
                  <Link href={`/sales/drafts/${d.id}`} style={{ textDecoration: "none" }}>
                    <button style={{ background: "transparent", border: `1px solid ${T.g2}`, color: T.g2, fontFamily: T.mono, fontSize: "0.7rem", padding: "0.4rem 0.8rem", cursor: "pointer", textTransform: "uppercase" }}>Review</button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
