'use client';

import { useState, useEffect } from "react";
import { Filter, MessageSquare, Download, Search, CheckCircle, ShieldAlert } from "lucide-react";
import { fetchApi } from "@/lib/api";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
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
  glow:    "0 0 20px rgba(0,255,136,0.35),0 0 60px rgba(0,255,136,0.12)",
  mono:    "'Share Tech Mono', monospace",
  display: "'Orbitron', sans-serif",
  body:    "'Rajdhani', sans-serif",
  warn:    "#ffaa00",
  red:     "#ff3355",
};

const Corners = () => (
  <>
    {[["tl","1px 0 0 1px","0","0","auto","auto"],
      ["tr","1px 1px 0 0","0","auto","0","auto"],
      ["bl","0 0 1px 1px","auto","0","auto","0"],
      ["br","0 1px 1px 0","auto","auto","0","0"]].map(([k, bw, t, l, b, r]) => (
      <span key={k} style={{
        position:"absolute", width:8, height:8,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        borderColor: T.g, borderStyle:"solid", borderWidth: bw as any, opacity: 0.5,
        top:t==="auto"?undefined:4, left:l==="auto"?undefined:4,
        bottom:b==="auto"?undefined:4, right:r==="auto"?undefined:4,
      }}/>
    ))}
  </>
);

export default function ConversationsHistory() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApi('/agent/conversations')
      .then(res => {
        const all = [...(res.unassigned || []), ...(res.assigned || [])];
        setData(all);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch conversations", err);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: 1400, margin: "0 auto", paddingBottom: "4rem" }}>
      
      <div style={{ display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <h2 style={{ fontFamily: T.display, fontSize: "1.8rem", color: "#fff", textShadow: T.glow }}>Global Conversation Logs</h2>
          <p style={{ fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, letterSpacing: "0.1em", marginTop: "0.4rem" }}>
            INDEXED_RECORDS: <span style={{ color: T.g }}>{data.length}</span> {"// RETENTION: 365 DAYS"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <Search size={16} color={T.muted} style={{ position: "absolute", left: 12 }} />
            <input 
              type="text" 
              placeholder="Query logs..." 
              style={{
                padding: "0.6rem 1rem 0.6rem 2.5rem", width: 250,
                background: "rgba(0,0,0,0.3)", border: `1px solid ${T.border}`,
                color: T.text, fontFamily: T.mono, fontSize: "0.8rem", outline: "none",
              }}
            />
          </div>
          <button style={{
            fontFamily: T.mono, fontSize: "0.75rem", letterSpacing: "0.1em",
            color: T.g, background: "rgba(0,255,136,0.1)", border: `1px solid ${T.g}`, padding: "0.6rem 1.2rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem"
          }}>
            <Filter size={14} /> FILTER
          </button>
          <button style={{
            fontFamily: T.mono, fontSize: "0.75rem", letterSpacing: "0.1em",
            color: T.bg, background: T.g, border: "none", padding: "0.6rem 1.2rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem",
            clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)", boxShadow: T.glow,
          }}>
            <Download size={14} /> EXPORT CSV
          </button>
        </div>
      </div>

      <div style={{ background: T.panel, border: `1px solid ${T.border}`, position: "relative" }}>
        <Corners />
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}`, background: "rgba(0,255,136,0.02)" }}>
              <th style={{ padding: "1.2rem 1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, fontWeight: "normal" }}>TICKET_ID</th>
              <th style={{ padding: "1.2rem 1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, fontWeight: "normal" }}>CUSTOMER</th>
              <th style={{ padding: "1.2rem 1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, fontWeight: "normal" }}>CHANNEL</th>
              <th style={{ padding: "1.2rem 1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, fontWeight: "normal" }}>MSGS</th>
              <th style={{ padding: "1.2rem 1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, fontWeight: "normal" }}>CITATIONS</th>
              <th style={{ padding: "1.2rem 1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, fontWeight: "normal" }}>CONFIDENCE</th>
              <th style={{ padding: "1.2rem 1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, fontWeight: "normal" }}>RESOLUTION</th>
              <th style={{ padding: "1.2rem 1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, fontWeight: "normal", textAlign: "right" }}>DATE</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} style={{ padding: "2rem", textAlign: "center", color: T.muted, fontFamily: T.mono }}>LOADING...</td></tr>
            ) : data.map(d => (
              <tr key={d.id} style={{ borderBottom: `1px solid rgba(0,255,136,0.05)`, cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(0,255,136,0.05)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                <td style={{ padding: "1rem", fontFamily: T.mono, fontSize: "0.85rem", color: "#fff" }}>{d.id.substring(0,8)}</td>
                <td style={{ padding: "1rem", fontFamily: T.body, fontSize: "0.95rem", color: "#fff", fontWeight: 600 }}>{d.end_user?.name || d.end_user?.email || d.end_user?.external_id || 'Unknown'}</td>
                <td style={{ padding: "1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted }}>{d.channel}</td>
                <td style={{ padding: "1rem", fontFamily: T.mono, fontSize: "0.85rem", color: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <MessageSquare size={14} color={T.muted} /> {d.messages?.length || 0}
                  </div>
                </td>
                <td style={{ padding: "1rem" }}>
                  <span style={{ fontFamily: T.mono, fontSize: "0.75rem", padding: "0.2rem 0.5rem", border: `1px dashed ${(d.metadata?.citations?.length || 0) > 0 ? T.g : T.muted}`, color: (d.metadata?.citations?.length || 0) > 0 ? T.g : T.muted, borderRadius: 2 }}>
                    [{d.metadata?.citations?.length || 0} REFS]
                  </span>
                </td>
                <td style={{ padding: "1rem" }}>
                  <span style={{ fontFamily: T.mono, fontSize: "0.75rem", color: (d.metadata?.confidence || 0) > 80 ? T.g : T.warn }}>
                    {d.metadata?.confidence || '--'}%
                  </span>
                </td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {d.status === 'resolved' ? (
                      <CheckCircle size={14} color={T.g} />
                    ) : (
                      <span style={{ width: 14, height: 14, borderRadius: "50%", border: `1px solid ${T.muted}` }} />
                    )}
                    {d.status === 'escalated' && <ShieldAlert size={14} color={T.warn} />}
                    <span style={{ fontFamily: T.mono, fontSize: "0.75rem", color: d.status === 'resolved' ? T.g : T.muted }}>
                      {d.status?.toUpperCase() || "OPEN"}
                    </span>
                  </div>
                </td>
                <td style={{ padding: "1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, textAlign: "right" }}>
                  {new Date(d.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}
