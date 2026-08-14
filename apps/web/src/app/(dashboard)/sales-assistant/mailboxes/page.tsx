'use client';

import { 
  Inbox, Activity, AlertCircle, Plus, Mail
} from "lucide-react";
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

const Stat = ({ label, value }: { label: string, value: string | number }) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
    <span style={{ fontFamily: T.mono, fontSize: "0.75rem", color: T.muted2 }}>{label}</span>
    <span style={{ fontFamily: T.mono, fontSize: "0.85rem", color: "#fff" }}>{value}</span>
  </div>
);

export default function MailboxesPage() {
  const [mailboxes] = useState([
    { email: "sales@acme.inc", provider: "Google Workspace", health: 82, status: "Healthy" },
    { email: "outreach@acme.inc", provider: "Microsoft 365", health: 54, status: "Warning" },
  ]);

  return (
    <div style={{ padding: "2rem", maxWidth: 1000, margin: "0 auto" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
        <div>
          <h1 style={{ fontFamily: T.display, fontSize: "2.2rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <Inbox color={T.g2} size={32} /> Mailboxes
          </h1>
          <p style={{ fontFamily: T.mono, fontSize: "0.9rem", color: T.g2, letterSpacing: "0.05em" }}>
            Manage email sending accounts and monitor deliverability.
          </p>
        </div>
        <button style={{ 
          background: T.g2, border: "none", padding: "0.8rem 1.5rem", color: T.bg, 
          fontFamily: T.mono, fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase",
          display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", boxShadow: T.glow2,
          clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)"
        }}>
          <Plus size={16} /> Connect Mailbox
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        {mailboxes.map((mb, i) => (
          <div key={i} style={{ background: T.panel, border: `1px solid ${mb.status === 'Warning' ? T.warn : T.border2}`, padding: "2rem", position: "relative" }}>
            <Corners />
            
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: 40, height: 40, background: "rgba(0,207,255,0.05)", border: `1px solid ${T.border2}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Mail size={20} color={T.text} />
                </div>
                <div>
                  <div style={{ fontFamily: T.display, fontSize: "1.2rem", color: "#fff", marginBottom: "0.2rem" }}>{mb.email}</div>
                  <div style={{ fontFamily: T.mono, fontSize: "0.75rem", color: T.muted2 }}>{mb.provider}</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "2rem", padding: "1.5rem", background: "rgba(0,0,0,0.2)", border: `1px solid ${T.border2}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <span style={{ fontFamily: T.mono, fontSize: "0.8rem", color: T.text, display: "flex", alignItems: "center", gap: "0.5rem" }}><Activity size={14} color={mb.status === 'Warning' ? T.warn : T.g2} /> Health Score</span>
                <span style={{ fontFamily: T.display, fontSize: "1.4rem", color: mb.status === 'Warning' ? T.warn : T.g2, fontWeight: 700 }}>{mb.health}<span style={{ fontSize: "0.8rem", color: T.muted2 }}>/100</span></span>
              </div>
              
              <div style={{ width: "100%", height: 4, background: "rgba(0,207,255,0.1)", borderRadius: 2, marginBottom: "0.5rem" }}>
                <div style={{ height: "100%", background: mb.status === 'Warning' ? T.warn : T.g2, width: `${mb.health}%`, borderRadius: 2, boxShadow: mb.status === 'Warning' ? "none" : T.glow2 }} />
              </div>

              {mb.status === 'Warning' && (
                <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.warn, alignItems: "flex-start" }}>
                  <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
                  High bounce rate detected. Sending volume has been automatically reduced.
                </div>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <Stat label="Daily Cap" value="150 emails" />
              <Stat label="Warmup Stage" value="Completed" />
              <Stat label="Bounce Rate" value={mb.status === 'Warning' ? '4.2%' : '0.8%'} />
              <Stat label="Open Rate" value="48%" />
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: "2rem", paddingTop: "1.5rem", borderTop: `1px solid ${T.border2}` }}>
              <button style={{ flex: 1, background: "transparent", border: `1px solid ${T.border2}`, color: T.text, fontFamily: T.mono, fontSize: "0.75rem", padding: "0.6rem", cursor: "pointer" }}>View Analytics</button>
              <button style={{ background: "transparent", border: `1px solid rgba(255,51,85,0.3)`, color: T.red, fontFamily: T.mono, fontSize: "0.75rem", padding: "0.6rem 1rem", cursor: "pointer" }}>Disconnect</button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
