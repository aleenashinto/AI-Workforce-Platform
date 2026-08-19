"use client";

import { useState } from "react";
import Link from "next/link";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  g:       "#00ff88",
  g2:      "#00cfff",
  warn:    "#ffaa00",
  red:     "#ff3355",
  bg:      "#040810",
  bg2:     "#070e1a",
  panel:   "#0a1628",
  border:  "rgba(0,255,136,0.18)",
  border2: "rgba(0,207,255,0.18)",
  muted:   "rgba(0,255,136,0.45)",
  text:    "#c8ffe8",
  glow:    "0 0 20px rgba(0,255,136,0.35),0 0 60px rgba(0,255,136,0.12)",
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
        borderColor: T.g, borderStyle:"solid", borderWidth: bw as string | number, opacity: 0.5,
        top:t==="auto"?undefined:8, left:l==="auto"?undefined:8,
        bottom:b==="auto"?undefined:8, right:r==="auto"?undefined:8,
      }}/>
    ))}
  </>
);

function ModalField({ label, type, placeholder, value, onChange }: { label: string, type: string, placeholder?: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>{label}</label>
      <input 
        type={type} 
        placeholder={placeholder} 
        value={value}
        onChange={onChange}
        onFocus={()=>setFocused(true)} 
        onBlur={()=>setFocused(false)} 
        style={{
          width:"100%", background:"rgba(0,255,136,0.03)",
          border:`1px solid ${focused ? "rgba(0,255,136,0.5)" : T.border}`,
          boxShadow: focused ? "0 0 0 3px rgba(0,255,136,0.08)" : "none",
          color:T.text, fontFamily:T.mono, fontSize:"0.85rem",
          padding:"0.7rem 1rem", outline:"none",
          transition:"border-color 0.2s, box-shadow 0.2s",
        }}
      />
    </div>
  );
}

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || loading) return;

    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      if (res.ok) {
        setSent(true);
      } else {
        setError("Network error. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: T.bg, color: T.text,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative"
    }}>
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      <div style={{
        background: T.panel, border: `1px solid ${T.border}`,
        width: "100%", maxWidth: 420, padding: "2.5rem 3rem",
        position: "relative", zIndex: 10,
        boxShadow: `0 0 80px rgba(0,255,136,0.08), 0 0 0 1px rgba(0,255,136,0.06)`,
      }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${T.g},${T.g2})` }}/>
        <Corners/>

        <div style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.15em", color:T.g, marginBottom:"0.5rem" }}>
          {/* SYSTEM RECOVERY */}
        </div>
        <div style={{ fontFamily:T.display, fontSize:"1.6rem", fontWeight:700, color:"#fff", marginBottom:"0.5rem" }}>
          Forgot Password
        </div>
        
        {sent ? (
          <div style={{ marginTop: "2rem", textAlign: "center" }}>
            <div style={{ fontSize: "3rem", color: T.g, marginBottom: "1rem" }}>✓</div>
            <p style={{ color: "rgba(200,255,232,0.6)", fontSize: "0.9rem", lineHeight: 1.6, marginBottom: "2rem" }}>
              A password recovery signal has been transmitted to <strong>{email}</strong>. Please check your inbox.
            </p>
            <Link href="/login" style={{
              display: "inline-block", fontFamily: T.mono, fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase",
              color: T.g2, background: "transparent", border: `1px solid ${T.border2}`, padding: "0.8rem 2rem", textDecoration: "none",
              transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
            }}>
              ← Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ color: "rgba(200,255,232,0.5)", fontSize: "0.85rem", lineHeight: 1.6, marginBottom: "1.5rem" }}>
              Enter the email address associated with your terminal access. We&apos;ll send you a secure link to reset your credentials.
            </p>

            <ModalField label="Email Address" type="email" placeholder="agent@yourteam.io" value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} />

            {error && (
              <div style={{ fontFamily: T.mono, fontSize: "0.75rem", color: T.red, marginBottom: "1rem", textAlign: "center", border: `1px dashed ${T.red}40`, padding: "0.5rem", background: `${T.red}10` }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width:"100%", fontFamily:T.mono, fontSize:"0.85rem", letterSpacing:"0.1em", textTransform:"uppercase",
              color: loading ? T.muted : T.bg, background: loading ? "rgba(0,255,136,0.1)" : T.g, border:"none", padding:"1rem", cursor: loading ? "not-allowed" : "pointer", marginBottom:"1.5rem",
              clipPath:"polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)",
              transition:"box-shadow 0.2s, background 0.2s",
            }}
              onMouseEnter={e=>{if(!loading){e.currentTarget.style.boxShadow=T.glow;e.currentTarget.style.background="#fff";}}}
              onMouseLeave={e=>{if(!loading){e.currentTarget.style.boxShadow="";e.currentTarget.style.background=T.g;}}}
            >{loading ? '▶ SENDING...' : '▶ SEND RESET LINK'}</button>
            
            <div style={{ textAlign: "center" }}>
              <Link href="/login" style={{ fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, textDecoration: "none" }}>
                ← Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
