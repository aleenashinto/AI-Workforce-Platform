'use client';

import { Bot } from "lucide-react";

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
const SettingSection = ({ title, icon: Icon, children }: any) => (
  <div style={{ background: T.panel, border: `1px solid ${T.border}`, padding: "2rem", position: "relative", marginBottom: "2rem" }}>
    <Corners />
    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "1.5rem" }}>
      <Icon size={18} color={T.g} />
      <div style={{ fontFamily: T.display, fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>{title}</div>
    </div>
    {children}
  </div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Input = ({ label, defaultValue, type = "text" }: any) => (
  <div style={{ marginBottom: "1rem" }}>
    <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>{label}</label>
    <input type={type} defaultValue={defaultValue} style={{
      width: "100%", background: "rgba(0,255,136,0.03)", border: `1px solid ${T.border}`,
      color: T.text, fontFamily: T.mono, fontSize: "0.85rem", padding: "0.8rem", outline: "none"
    }} />
  </div>
);

export default function AISettingsPage() {
  return (
    <div>
      <SettingSection title="AI Settings" icon={Bot}>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <Input label="Brand Voice" defaultValue="Professional and helpful." />
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>Confidence Threshold (For auto-response)</label>
            <input type="range" min="50" max="100" defaultValue="85" style={{ width: "100%", accentColor: T.g }} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "0.3rem", fontFamily: T.mono, fontSize: "0.7rem", color: T.muted }}>
              <span>More responses</span>
              <span>More accurate</span>
            </div>
          </div>
          <Input label="Escalation Topics (Comma separated)" defaultValue="refund, angry, cancel" />
          <Input label="Blocked Topics" defaultValue="politics, religion, stock price" />
        </div>
      </SettingSection>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
        <button style={{ 
          background: T.g, border: "none", padding: "0.8rem 2rem", color: T.bg, 
          fontFamily: T.mono, fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase",
          cursor: "pointer", boxShadow: T.glow, clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)"
        }}>
          Save AI Settings
        </button>
      </div>
    </div>
  );
}
