'use client';

import { Bell } from "lucide-react";
import { useState } from "react";

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
const Toggle = ({ label, description, defaultChecked }: any) => (
  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
    <div>
      <div style={{ fontFamily: T.mono, fontSize: "0.85rem", color: T.text, marginBottom: "0.2rem" }}>{label}</div>
      <div style={{ fontFamily: T.mono, fontSize: "0.7rem", color: T.muted }}>{description}</div>
    </div>
    <label style={{ position: "relative", display: "inline-block", width: 44, height: 24 }}>
      <input type="checkbox" defaultChecked={defaultChecked} style={{ opacity: 0, width: 0, height: 0 }} 
        onChange={(e) => {
          const span = e.target.nextElementSibling as HTMLElement;
          if (e.target.checked) {
            span.style.background = T.g;
            (span.firstChild as HTMLElement).style.transform = "translateX(20px)";
          } else {
            span.style.background = "rgba(0,255,136,0.2)";
            (span.firstChild as HTMLElement).style.transform = "translateX(0)";
          }
        }}
      />
      <span style={{ position: "absolute", cursor: "pointer", top: 0, left: 0, right: 0, bottom: 0, background: defaultChecked ? T.g : "rgba(0,255,136,0.2)", transition: ".4s", borderRadius: 34 }}>
        <span style={{ position: "absolute", height: 16, width: 16, left: 4, bottom: 4, background: "#040810", transition: ".4s", borderRadius: "50%", transform: defaultChecked ? "translateX(20px)" : "translateX(0)" }} />
      </span>
    </label>
  </div>
);

export default function NotificationsSettingsPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaving(true);
    setSaved(false);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  };

  return (
    <div>
      <SettingSection title="Notifications" icon={Bell}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Toggle 
            label="Email Alerts for New Leads" 
            description="Receive an email whenever a new lead is discovered." 
            defaultChecked={true} 
          />
          <Toggle 
            label="Daily Summary Report" 
            description="A daily digest of support conversations and sales performance." 
            defaultChecked={true} 
          />
          <Toggle 
            label="AI Escalation Alerts" 
            description="Immediate notification when the AI cannot confidently answer a customer." 
            defaultChecked={true} 
          />
          <Toggle 
            label="Weekly Marketing Digest" 
            description="Updates on new platform features and industry news." 
            defaultChecked={false} 
          />
        </div>
      </SettingSection>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
        <button 
          onClick={handleSave}
          style={{ 
            background: saved ? T.g2 : T.g, 
            border: "none", padding: "0.8rem 2rem", color: T.bg, 
            fontFamily: T.mono, fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase",
            cursor: "pointer", boxShadow: T.glow, clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
            transition: "background 0.3s"
          }}
        >
          {saving ? "Saving..." : saved ? "Saved!" : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}
