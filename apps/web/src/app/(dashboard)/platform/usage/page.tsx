'use client';

import { 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Activity, Zap, Target, Mail, Users
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const UsageBar = ({ label, used, total, icon: Icon, unit }: any) => {
  const pct = Math.min((used / total) * 100, 100);
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.border}`, padding: "2rem", position: "relative" }}>
      <Corners />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", fontFamily: T.display, fontSize: "1.2rem", color: "#fff" }}>
          <Icon size={18} color={T.g} /> {label}
        </div>
        <div style={{ fontFamily: T.mono, fontSize: "1rem", color: T.g }}>
          {used.toLocaleString()} <span style={{ color: T.muted }}>/ {total.toLocaleString()} {unit}</span>
        </div>
      </div>
      
      <div style={{ width: "100%", height: 8, background: "rgba(0,255,136,0.1)", borderRadius: 4, overflow: "hidden", marginBottom: "1rem" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: T.g, boxShadow: T.glow }} />
      </div>
      
      <div style={{ fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, textAlign: "right" }}>
        {pct.toFixed(1)}% Utilized
      </div>
    </div>
  );
};

export default function UsagePage() {
  return (
    <div style={{ padding: "2rem", maxWidth: 1000, margin: "0 auto" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
        <div>
          <h1 style={{ fontFamily: T.display, fontSize: "2.2rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <Activity color={T.g} size={32} /> Usage & Limits
          </h1>
          <p style={{ fontFamily: T.mono, fontSize: "0.9rem", color: T.g, letterSpacing: "0.05em" }}>
            Current billing period: Aug 1 - Aug 31
          </p>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginBottom: "2.5rem" }}>
        <UsageBar label="AI Support Messages" used={1248} total={2000} unit="messages" icon={Zap} />
        <UsageBar label="Sales Leads Enriched" used={340} total={500} unit="leads" icon={Target} />
        <UsageBar label="Team Seats" used={2} total={3} unit="seats" icon={Users} />
      </div>

      <div style={{ background: "transparent", border: `1px solid ${T.border}`, padding: "2rem", position: "relative" }}>
        <Corners />
        <div style={{ fontFamily: T.display, fontSize: "1.2rem", color: "#fff", marginBottom: "1.5rem" }}>Additional Metrics</div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "2rem" }}>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, marginBottom: "0.5rem", textTransform: "uppercase" }}>LLM Tokens Processed</div>
            <div style={{ fontFamily: T.body, fontSize: "1.5rem", color: T.text }}>14.2M</div>
          </div>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, marginBottom: "0.5rem", textTransform: "uppercase" }}>Emails Sent</div>
            <div style={{ fontFamily: T.body, fontSize: "1.5rem", color: T.text }}>3,402</div>
          </div>
          <div>
            <div style={{ fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, marginBottom: "0.5rem", textTransform: "uppercase" }}>Est. Next Invoice</div>
            <div style={{ fontFamily: T.body, fontSize: "1.5rem", color: T.g }}>$149.00</div>
          </div>
        </div>
      </div>

    </div>
  );
}
