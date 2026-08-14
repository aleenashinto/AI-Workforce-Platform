'use client';

import { 
  FileText, Globe, Database, Type, UploadCloud
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

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

export default function AddKnowledgePage() {
  const [activeType, setActiveType] = useState('file');

  const sources = [
    { id: 'file', label: 'Upload File', icon: FileText },
    { id: 'website', label: 'Website URL', icon: Globe },
    { id: 'sitemap', label: 'Sitemap', icon: Database },
    { id: 'text', label: 'Paste Text', icon: Type }
  ];

  return (
    <div style={{ padding: "2rem", maxWidth: 1000, margin: "0 auto" }}>
      
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontFamily: T.display, fontSize: "2.2rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>
          Add Knowledge Source
        </h1>
        <p style={{ fontFamily: T.mono, fontSize: "0.9rem", color: T.g, letterSpacing: "0.05em" }}>
          <Link href="/customer-support/knowledge" style={{ color: T.muted, textDecoration: "none" }}>Knowledge</Link> <span style={{ color: T.muted }}>/</span> Add Source
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "2.5rem" }}>
        {sources.map(s => (
          <div key={s.id} onClick={() => setActiveType(s.id)} style={{
            background: activeType === s.id ? "rgba(0,255,136,0.1)" : T.panel,
            border: `1px solid ${activeType === s.id ? T.g : T.border}`,
            padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem",
            cursor: "pointer", transition: "all 0.2s", boxShadow: activeType === s.id ? T.glow : "none"
          }}>
            <s.icon size={24} color={activeType === s.id ? T.g : T.muted} />
            <span style={{ fontFamily: T.mono, fontSize: "0.8rem", color: activeType === s.id ? "#fff" : T.muted, textTransform: "uppercase" }}>{s.label}</span>
          </div>
        ))}
      </div>

      <div style={{ background: T.panel, border: `1px solid ${T.border}`, padding: "2rem", position: "relative" }}>
        <Corners />
        
        {activeType === 'file' && (
          <div>
            <div style={{ fontFamily: T.mono, fontSize: "0.8rem", color: T.g, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.5rem" }}>{"// File Upload"}</div>
            <div style={{ 
              border: `2px dashed ${T.border}`, background: "rgba(0,255,136,0.02)", padding: "3rem 2rem",
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1rem",
              cursor: "pointer"
            }}>
              <UploadCloud size={48} color={T.muted} />
              <div style={{ fontFamily: T.body, fontSize: "1.1rem", color: "#fff" }}>Drag and drop or click to upload</div>
              <div style={{ fontFamily: T.mono, fontSize: "0.75rem", color: T.muted }}>Supports PDF, DOCX, TXT, MD, CSV, HTML (Max 50MB)</div>
            </div>
          </div>
        )}

        {activeType === 'website' && (
          <div>
            <div style={{ fontFamily: T.mono, fontSize: "0.8rem", color: T.g, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.5rem" }}>{"// Website Crawl"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>URL</label>
                <input type="text" placeholder="https://example.com" style={{ width: "100%", background: "rgba(0,255,136,0.03)", border: `1px solid ${T.border}`, color: T.text, fontFamily: T.mono, fontSize: "0.82rem", padding: "0.7rem 1rem", outline: "none" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                <div>
                  <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>Crawl Depth</label>
                  <select style={{ width: "100%", background: "rgba(0,255,136,0.03)", border: `1px solid ${T.border}`, color: T.text, fontFamily: T.mono, fontSize: "0.82rem", padding: "0.7rem 1rem", outline: "none", appearance: "none" }}>
                    <option>1 (Single Page)</option>
                    <option>2 (Subpages)</option>
                    <option>3 (Deep)</option>
                  </select>
                </div>
                <div />
              </div>
              <div>
                <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>Include Paths (Optional)</label>
                <input type="text" placeholder="/docs/*, /blog/*" style={{ width: "100%", background: "rgba(0,255,136,0.03)", border: `1px solid ${T.border}`, color: T.text, fontFamily: T.mono, fontSize: "0.82rem", padding: "0.7rem 1rem", outline: "none" }} />
              </div>
              <div>
                <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>Exclude Paths (Optional)</label>
                <input type="text" placeholder="/login, /cart" style={{ width: "100%", background: "rgba(0,255,136,0.03)", border: `1px solid ${T.border}`, color: T.text, fontFamily: T.mono, fontSize: "0.82rem", padding: "0.7rem 1rem", outline: "none" }} />
              </div>
            </div>
          </div>
        )}

        {activeType === 'sitemap' && (
          <div>
            <div style={{ fontFamily: T.mono, fontSize: "0.8rem", color: T.g, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.5rem" }}>{"// Sitemap Crawl"}</div>
            <div>
              <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>SITEMAP URL</label>
              <input type="text" placeholder="https://example.com/sitemap.xml" style={{ width: "100%", background: "rgba(0,255,136,0.03)", border: `1px solid ${T.border}`, color: T.text, fontFamily: T.mono, fontSize: "0.82rem", padding: "0.7rem 1rem", outline: "none" }} />
            </div>
          </div>
        )}

        {activeType === 'text' && (
          <div>
            <div style={{ fontFamily: T.mono, fontSize: "0.8rem", color: T.g, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.5rem" }}>{"// Plain Text Import"}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <div>
                <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>TITLE</label>
                <input type="text" placeholder="e.g. Return Policy" style={{ width: "100%", background: "rgba(0,255,136,0.03)", border: `1px solid ${T.border}`, color: T.text, fontFamily: T.mono, fontSize: "0.82rem", padding: "0.7rem 1rem", outline: "none" }} />
              </div>
              <div>
                <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>CONTENT</label>
                <textarea placeholder="Paste your text content here..." style={{ width: "100%", height: 200, background: "rgba(0,255,136,0.03)", border: `1px solid ${T.border}`, color: T.text, fontFamily: T.body, fontSize: "0.95rem", padding: "0.7rem 1rem", outline: "none", resize: "vertical" }} />
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: "2rem", display: "flex", justifyContent: "flex-end" }}>
          <button style={{ 
            background: T.g, border: "none", padding: "0.8rem 2rem", color: T.bg, 
            fontFamily: T.mono, fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase",
            cursor: "pointer", boxShadow: T.glow, clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)"
          }}>
            START IMPORT ▶
          </button>
        </div>
      </div>

    </div>
  );
}
