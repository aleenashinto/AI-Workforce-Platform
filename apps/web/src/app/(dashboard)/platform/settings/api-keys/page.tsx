'use client';

import { 
  Key, Plus, Copy, Trash2
} from "lucide-react";
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        borderColor: T.g, borderStyle:"solid", borderWidth: bw as any, opacity: 0.5,
        top:t==="auto"?undefined:8, left:l==="auto"?undefined:8,
        bottom:b==="auto"?undefined:8, right:r==="auto"?undefined:8,
      }}/>
    ))}
  </>
);

export default function ApiKeysPage() {
  const [keys] = useState([
    { id: 1, name: "Production", prefix: "aw_prod_****", created: "Aug 12", lastUsed: "Today", scopes: ["Read", "Write"] },
    { id: 2, name: "Development", prefix: "aw_dev_****", created: "Aug 01", lastUsed: "Never", scopes: ["Read"] },
  ]);

  return (
    <div>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
        <div>
          <h1 style={{ fontFamily: T.display, fontSize: "2.2rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <Key color={T.g} size={32} /> API Keys
          </h1>
          <p style={{ fontFamily: T.mono, fontSize: "0.9rem", color: T.g, letterSpacing: "0.05em" }}>
            Manage programmatic access to your AI Workforce platform.
          </p>
        </div>
      </div>

      <div style={{ display: "flex", gap: "2rem" }}>
        
        {/* Keys List */}
        <div style={{ flex: 2 }}>
          {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
          {keys.map((k, i) => (
            <div key={k.id} style={{ background: T.panel, border: `1px solid ${T.border}`, padding: "2rem", position: "relative", marginBottom: "1.5rem" }}>
              <Corners />
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
                <div>
                  <div style={{ fontFamily: T.display, fontSize: "1.2rem", color: "#fff", marginBottom: "0.5rem" }}>{k.name}</div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    {k.scopes.map(s => (
                      <span key={s} style={{ fontFamily: T.mono, fontSize: "0.65rem", background: "rgba(0,255,136,0.1)", color: T.g, padding: "0.2rem 0.5rem", border: `1px solid ${T.border}` }}>{s}</span>
                    ))}
                  </div>
                </div>
                <button style={{ background: "transparent", border: `1px solid rgba(255,51,85,0.3)`, color: T.red, fontFamily: T.mono, fontSize: "0.7rem", padding: "0.5rem 1rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Trash2 size={12} /> Revoke
                </button>
              </div>

              <div style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${T.border}`, padding: "1rem", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <span style={{ fontFamily: T.mono, fontSize: "1rem", color: "#fff" }}>{k.prefix}</span>
                <Copy size={16} color={T.muted} style={{ cursor: "pointer" }} />
              </div>

              <div style={{ display: "flex", gap: "2rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted }}>
                <span>Created: {k.created}</span>
                <span>Last used: {k.lastUsed}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Create Key Sidebar */}
        <div style={{ flex: 1 }}>
          <div style={{ background: T.panel, border: `1px dashed ${T.g}`, padding: "2rem", position: "sticky", top: "100px" }}>
            <div style={{ fontFamily: T.display, fontSize: "1.2rem", color: "#fff", marginBottom: "1.5rem" }}>Create API Key</div>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontFamily:T.mono, fontSize:"0.65rem", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>Name</label>
              <input type="text" placeholder="e.g. Production" style={{ width: "100%", background: "rgba(0,255,136,0.03)", border: `1px solid ${T.border}`, color: T.text, fontFamily: T.mono, fontSize: "0.85rem", padding: "0.8rem", outline: "none" }} />
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <label style={{ fontFamily:T.mono, fontSize:"0.65rem", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>Scopes</label>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                {["Read", "Write", "Admin"].map(scope => (
                  <label key={scope} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: T.mono, fontSize: "0.8rem", color: T.text, cursor: "pointer" }}>
                    <input type="checkbox" style={{ accentColor: T.g }} defaultChecked={scope !== 'Admin'} /> {scope}
                  </label>
                ))}
              </div>
            </div>

            <button style={{ 
              width: "100%", background: T.g, border: "none", padding: "0.8rem", color: T.bg, 
              fontFamily: T.mono, fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: "pointer", boxShadow: T.glow,
              clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)"
            }}>
              <Plus size={16} /> Create Key
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
