'use client';

import { useState } from "react";
import { Building } from "lucide-react";
import { useUserContext } from "@/contexts/UserContext";

const T = {
  g:       "#00ff88",
  g2:      "#00cfff",
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
const Input = ({ label, value, type = "text", onChange }: any) => (
  <div style={{ marginBottom: "1rem" }}>
    <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>{label}</label>
    <input type={type} value={value} onChange={onChange} style={{
      width: "100%", background: "rgba(0,255,136,0.03)", border: `1px solid ${T.border}`,
      color: T.text, fontFamily: T.mono, fontSize: "0.85rem", padding: "0.8rem", outline: "none"
    }} />
  </div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Select = ({ label, value, onChange, options }: any) => (
  <div style={{ marginBottom: "1rem" }}>
    <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>{label}</label>
    <select value={value} onChange={onChange} style={{
      width: "100%", background: "rgba(0,255,136,0.03)", border: `1px solid ${T.border}`,
      color: T.text, fontFamily: T.mono, fontSize: "0.85rem", padding: "0.8rem", outline: "none", appearance: "none"
    }}>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value} style={{ background: T.panel, color: T.text }}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const TIMEZONES = [
  { value: "America/Los_Angeles", label: "Pacific Time (US & Canada)" },
  { value: "America/Denver", label: "Mountain Time (US & Canada)" },
  { value: "America/Chicago", label: "Central Time (US & Canada)" },
  { value: "America/New_York", label: "Eastern Time (US & Canada)" },
  { value: "Europe/London", label: "Greenwich Mean Time (London)" },
  { value: "Europe/Paris", label: "Central European Time (Paris)" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (Tokyo)" }
];

export default function OrganizationSettingsPage() {
  const { user, updateOrganization } = useUserContext();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }, 800);
  };
  
  if (!user) return null;

  return (
    <div>
      <SettingSection title="Organization" icon={Building}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Input label="Organization Name" value={user.organization.name} onChange={(e: any) => updateOrganization({ name: e.target.value })} />
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Input label="Website" value={user.organization.website} onChange={(e: any) => updateOrganization({ website: e.target.value })} />
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Input label="Industry" value={user.organization.industry} onChange={(e: any) => updateOrganization({ industry: e.target.value })} />
          <Select 
            label="Timezone" 
            value={user.organization.timezone} 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(e: any) => updateOrganization({ timezone: e.target.value })} 
            options={TIMEZONES} 
          />
          <Select 
            label="Language" 
            value={user.organization.language} 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onChange={(e: any) => updateOrganization({ language: e.target.value })} 
            options={[
              { value: "English", label: "English" },
              { value: "Spanish", label: "Spanish" },
              { value: "French", label: "French" },
              { value: "German", label: "German" },
            ]}
          />
        </div>
      </SettingSection>

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "1rem" }}>
        <button 
          onClick={handleSave}
          style={{ 
            background: saved ? T.g2 : T.g, border: "none", padding: "0.8rem 2rem", color: T.bg, 
            fontFamily: T.mono, fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase",
            cursor: "pointer", boxShadow: T.glow, clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
            transition: "background 0.3s"
          }}
        >
          {saving ? "SAVING..." : saved ? "SAVED!" : "SAVE ORGANIZATION"}
        </button>
      </div>
    </div>
  );
}
