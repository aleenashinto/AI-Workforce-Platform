'use client';

import { 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Monitor, MessageSquare, Plus, Save
} from "lucide-react";
import { useState } from "react";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
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

export default function WidgetConfigPage() {
  const [activeTab, setActiveTab] = useState('appearance');
  
  // Widget Configuration State
  const [brandColor, setBrandColor] = useState('#00ff88');
  const [position, setPosition] = useState('Bottom Right');
  const [launcherIcon, setLauncherIcon] = useState('Chat Bubble');
  const [greeting, setGreeting] = useState('Hi there! How can I help you today?');
  const [suggestedQuestions, setSuggestedQuestions] = useState('Where is my order?\nHow do I get a refund?');
  const [primaryLanguage, setPrimaryLanguage] = useState('English');
  const [escalationBehavior, setEscalationBehavior] = useState('Transfer to Human Agent (Live)');

  return (
    <div style={{ padding: "2rem", maxWidth: 1400, margin: "0 auto", display: "flex", gap: "2rem" }}>
      
      {/* Settings Form */}
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontFamily: T.display, fontSize: "2.2rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <Monitor color={T.g} size={32} /> Widget Config
          </h1>
          <p style={{ fontFamily: T.mono, fontSize: "0.9rem", color: T.g, letterSpacing: "0.05em" }}>
            Customize the chat widget appearance and behavior.
          </p>
        </div>

        <div style={{ background: T.panel, border: `1px solid ${T.border}`, padding: "2rem", position: "relative" }}>
          <Corners />
          
          <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", borderBottom: `1px solid ${T.border}` }}>
            {["appearance", "greeting", "behavior"].map(t => (
              <button key={t} onClick={() => setActiveTab(t)} style={{
                background: "none", border: "none", cursor: "pointer",
                fontFamily: T.mono, fontSize: "0.8rem", textTransform: "uppercase",
                color: activeTab === t ? T.g : T.muted,
                borderBottom: activeTab === t ? `2px solid ${T.g}` : "2px solid transparent",
                paddingBottom: "0.5rem", transition: "all 0.2s"
              }}>{t}</button>
            ))}
          </div>

          {activeTab === 'appearance' && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>Brand Color</label>
                <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                  <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)} style={{ width: 40, height: 40, background: "transparent", border: "none", cursor: "pointer", padding: 0 }} />
                  <input type="text" value={brandColor} onChange={e => setBrandColor(e.target.value)} style={{ flex: 1, background: "rgba(0,255,136,0.03)", border: `1px solid ${T.border}`, color: T.text, fontFamily: T.mono, fontSize: "0.82rem", padding: "0.7rem 1rem", outline: "none" }} />
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div>
                  <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>Position</label>
                  <select value={position} onChange={e => setPosition(e.target.value)} style={{ width: "100%", background: "rgba(0,255,136,0.03)", border: `1px solid ${T.border}`, color: T.text, fontFamily: T.mono, fontSize: "0.82rem", padding: "0.7rem 1rem", outline: "none", appearance: "none" }}>
                    <option>Bottom Right</option>
                    <option>Bottom Left</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>Launcher Icon</label>
                  <select value={launcherIcon} onChange={e => setLauncherIcon(e.target.value)} style={{ width: "100%", background: "rgba(0,255,136,0.03)", border: `1px solid ${T.border}`, color: T.text, fontFamily: T.mono, fontSize: "0.82rem", padding: "0.7rem 1rem", outline: "none", appearance: "none" }}>
                    <option>Chat Bubble</option>
                    <option>Robot</option>
                    <option>Custom Logo</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'greeting' && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>Welcome Message</label>
                <textarea value={greeting} onChange={e => setGreeting(e.target.value)} style={{ width: "100%", height: 80, background: "rgba(0,255,136,0.03)", border: `1px solid ${T.border}`, color: T.text, fontFamily: T.mono, fontSize: "0.82rem", padding: "0.7rem 1rem", outline: "none", resize: "none" }} />
              </div>
              <div>
                <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>Suggested Questions (One per line)</label>
                <textarea value={suggestedQuestions} onChange={e => setSuggestedQuestions(e.target.value)} style={{ width: "100%", height: 100, background: "rgba(0,255,136,0.03)", border: `1px solid ${T.border}`, color: T.text, fontFamily: T.mono, fontSize: "0.82rem", padding: "0.7rem 1rem", outline: "none", resize: "none", whiteSpace: "pre-wrap" }} />
              </div>
            </div>
          )}

          {activeTab === 'behavior' && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>Primary Language</label>
                <select value={primaryLanguage} onChange={e => setPrimaryLanguage(e.target.value)} style={{ width: "100%", background: "rgba(0,255,136,0.03)", border: `1px solid ${T.border}`, color: T.text, fontFamily: T.mono, fontSize: "0.82rem", padding: "0.7rem 1rem", outline: "none", appearance: "none" }}>
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
              <div>
                <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>Escalation Behavior</label>
                <select value={escalationBehavior} onChange={e => setEscalationBehavior(e.target.value)} style={{ width: "100%", background: "rgba(0,255,136,0.03)", border: `1px solid ${T.border}`, color: T.text, fontFamily: T.mono, fontSize: "0.82rem", padding: "0.7rem 1rem", outline: "none", appearance: "none" }}>
                  <option>Transfer to Human Agent (Live)</option>
                  <option>Create Email Ticket</option>
                </select>
              </div>
            </div>
          )}

          <div style={{ marginTop: "2.5rem", display: "flex", justifyContent: "flex-end" }}>
            <button style={{ 
              background: T.g, border: "none", padding: "0.8rem 2rem", color: T.bg, 
              fontFamily: T.mono, fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase",
              display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", boxShadow: T.glow,
              clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)"
            }}>
              <Save size={16} /> Save Changes
            </button>
          </div>

        </div>
      </div>

      {/* Live Preview */}
      <div style={{ width: 380, display: "flex", flexDirection: "column" }}>
        <div style={{ fontFamily: T.mono, fontSize: "0.8rem", color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.5rem" }}>{"// Live Preview"}</div>
        
        <div style={{ flex: 1, background: T.bg2, border: `1px solid ${T.border}`, position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "1.5rem" }}>
          
          {/* Widget Mockup */}
          <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden", boxShadow: `0 10px 40px ${brandColor}22`, display: "flex", flexDirection: "column", height: 400, alignSelf: position === 'Bottom Left' ? 'flex-start' : 'flex-end', width: "100%" }}>
            {/* Header */}
            <div style={{ background: brandColor, padding: "1rem", color: T.bg, display: "flex", alignItems: "center", gap: "0.8rem" }}>
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <MessageSquare size={16} color={brandColor} />
              </div>
              <div>
                <div style={{ fontFamily: T.display, fontSize: "1rem", fontWeight: 700 }}>Support Agent</div>
                <div style={{ fontFamily: T.body, fontSize: "0.75rem", opacity: 0.8 }}>Usually replies instantly</div>
              </div>
            </div>
            
            {/* Chat area */}
            <div style={{ flex: 1, background: T.bg2, padding: "1rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ background: T.panel, border: `1px solid ${T.border}`, padding: "0.8rem", borderRadius: "0 12px 12px 12px", fontFamily: T.body, fontSize: "0.9rem", color: "#fff", alignSelf: "flex-start", maxWidth: "85%" }}>
                {greeting}
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "auto" }}>
                {suggestedQuestions.split('\n').filter(q => q.trim()).map((q, i) => (
                  <button key={i} style={{ background: "transparent", border: `1px solid ${T.border}`, padding: "0.6rem", borderRadius: 20, color: T.g, fontFamily: T.mono, fontSize: "0.7rem", textAlign: "left", cursor: "pointer" }}>{q}</button>
                ))}
              </div>
            </div>

            {/* Input area */}
            <div style={{ background: T.panel, borderTop: `1px solid ${T.border}`, padding: "0.8rem" }}>
              <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 20, padding: "0.6rem 1rem", fontFamily: T.mono, fontSize: "0.8rem", color: T.muted }}>
                Type a message...
              </div>
            </div>
          </div>

          {/* Launcher */}
          <div style={{ width: 56, height: 56, borderRadius: "50%", background: T.g, display: "flex", alignItems: "center", justifyContent: "center", alignSelf: "flex-end", marginTop: "1.5rem", boxShadow: T.glow, cursor: "pointer" }}>
            <MessageSquare size={24} color={T.bg} />
          </div>

        </div>
      </div>

    </div>
  );
}
