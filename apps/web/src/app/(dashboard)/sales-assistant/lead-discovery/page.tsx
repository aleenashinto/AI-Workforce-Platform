'use client';

import { 
  Search, Target, MapPin, Building, Users, PlayCircle, Loader
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

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

export default function LeadDiscoveryPage() {
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(0);

  const startDiscovery = () => {
    setProcessing(true);
    let s = 1;
    const interval = setInterval(() => {
      setStep(s);
      s++;
      if (s > 5) {
        clearInterval(interval);
      }
    }, 1000);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 900, margin: "0 auto" }}>
      
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontFamily: T.display, fontSize: "2.2rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <Search color={T.g2} size={32} /> Lead Discovery
        </h1>
        <p style={{ fontFamily: T.mono, fontSize: "0.9rem", color: T.g2, letterSpacing: "0.05em" }}>
          Find new qualified prospects matching your ICP.
        </p>
      </div>

      <div style={{ background: T.panel, border: `1px solid ${T.border2}`, padding: "2.5rem", position: "relative", marginBottom: "2rem" }}>
        <Corners />
        
        <div style={{ display: "flex", gap: "2rem" }}>
          
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: T.mono, fontSize: "0.8rem", color: T.g2, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.5rem" }}>Step 1: Select ICP</div>
            <select style={{ width: "100%", background: "rgba(0,207,255,0.03)", border: `1px solid ${T.border2}`, color: T.text, fontFamily: T.mono, fontSize: "0.9rem", padding: "1rem", outline: "none", appearance: "none", cursor: "pointer", marginBottom: "2.5rem" }}>
              <option>SaaS Companies</option>
              <option>Enterprise Retail</option>
            </select>

            <div style={{ fontFamily: T.mono, fontSize: "0.8rem", color: T.g2, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.5rem" }}>Step 2: Narrow Search (Optional)</div>
            
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={{ position: "relative" }}>
                <MapPin size={14} color={T.muted2} style={{ position: "absolute", left: 12, top: 12 }} />
                <input type="text" placeholder="Geography" style={{ width: "100%", background: "rgba(0,207,255,0.03)", border: `1px solid ${T.border2}`, color: T.text, fontFamily: T.mono, fontSize: "0.85rem", padding: "0.6rem 1rem 0.6rem 2rem", outline: "none" }} />
              </div>
              <div style={{ position: "relative" }}>
                <Building size={14} color={T.muted2} style={{ position: "absolute", left: 12, top: 12 }} />
                <input type="text" placeholder="Industry" style={{ width: "100%", background: "rgba(0,207,255,0.03)", border: `1px solid ${T.border2}`, color: T.text, fontFamily: T.mono, fontSize: "0.85rem", padding: "0.6rem 1rem 0.6rem 2rem", outline: "none" }} />
              </div>
              <div style={{ position: "relative" }}>
                <Users size={14} color={T.muted2} style={{ position: "absolute", left: 12, top: 12 }} />
                <input type="text" placeholder="Company Size" style={{ width: "100%", background: "rgba(0,207,255,0.03)", border: `1px solid ${T.border2}`, color: T.text, fontFamily: T.mono, fontSize: "0.85rem", padding: "0.6rem 1rem 0.6rem 2rem", outline: "none" }} />
              </div>
              <div style={{ position: "relative" }}>
                <Target size={14} color={T.muted2} style={{ position: "absolute", left: 12, top: 12 }} />
                <input type="text" placeholder="Persona" style={{ width: "100%", background: "rgba(0,207,255,0.03)", border: `1px solid ${T.border2}`, color: T.text, fontFamily: T.mono, fontSize: "0.85rem", padding: "0.6rem 1rem 0.6rem 2rem", outline: "none" }} />
              </div>
            </div>

            <div style={{ marginTop: "3rem" }}>
              <button onClick={startDiscovery} disabled={processing} style={{ 
                background: processing ? T.panel : T.g2, border: processing ? `1px solid ${T.border2}` : "none", 
                padding: "1rem 2rem", color: processing ? T.muted2 : T.bg, width: "100%",
                fontFamily: T.mono, fontSize: "0.9rem", fontWeight: "bold", textTransform: "uppercase",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: processing ? "not-allowed" : "pointer", boxShadow: processing ? "none" : T.glow2,
                clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)"
              }}>
                {processing ? <Loader className="animate-spin" size={18} /> : <PlayCircle size={18} />}
                {processing ? "PROCESSING..." : "FIND LEADS"}
              </button>
            </div>
          </div>
          
          {/* Status Panel */}
          {processing && (
            <div style={{ width: 300, background: "rgba(0,207,255,0.05)", border: `1px solid ${T.border2}`, padding: "2rem" }}>
              <div style={{ fontFamily: T.mono, fontSize: "0.75rem", color: T.g2, letterSpacing: "0.15em", marginBottom: "1.5rem", textTransform: "uppercase" }}>{"// JOB STATUS"}</div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {[
                  { id: 1, label: "Finding companies" },
                  { id: 2, label: "Deduplicating" },
                  { id: 3, label: "Finding contacts" },
                  { id: 4, label: "Verifying emails" },
                  { id: 5, label: "Scoring" },
                ].map(s => (
                  <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "0.8rem", opacity: step >= s.id ? 1 : 0.3 }}>
                    {step > s.id ? (
                      <span style={{ color: T.g }}>✓</span>
                    ) : step === s.id ? (
                      <span style={{ color: T.g2 }}>●</span>
                    ) : (
                      <span style={{ color: T.muted2 }}>○</span>
                    )}
                    <span style={{ fontFamily: T.mono, fontSize: "0.8rem", color: step >= s.id ? "#fff" : T.muted2 }}>{s.label}</span>
                  </div>
                ))}
              </div>

              {step > 5 && (
                <div style={{ marginTop: "2rem", borderTop: `1px solid ${T.border2}`, paddingTop: "1rem" }}>
                  <div style={{ fontFamily: T.display, fontSize: "1.5rem", color: T.g, marginBottom: "0.5rem" }}>+124 Leads Found</div>
                  <Link href="/sales/leads" style={{ color: T.g2, fontFamily: T.mono, fontSize: "0.8rem", textDecoration: "none" }}>View in Leads →</Link>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

    </div>
  );
}
