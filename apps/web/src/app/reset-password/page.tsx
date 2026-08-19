'use client';

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div style={{ marginBottom: "1.1rem" }}>
      <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>{label}</label>
      <div style={{ position: "relative" }}>
        <input type={inputType} placeholder={placeholder} value={value} onChange={onChange} onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)} style={{
          width:"100%", background:"rgba(0,255,136,0.03)",
          border:`1px solid ${focused ? "rgba(0,255,136,0.5)" : T.border}`,
          boxShadow: focused ? "0 0 0 3px rgba(0,255,136,0.08)" : "none",
          color:T.text, fontFamily:T.mono, fontSize:"0.82rem",
          padding:"0.7rem 1rem", paddingRight: isPassword ? "2.5rem" : "1rem", outline:"none",
          transition:"border-color 0.2s, box-shadow 0.2s",
        }}/>
        {isPassword && (
          <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
            position: "absolute", right: "0.8rem", top: "50%", transform: "translateY(-50%)",
            background: "transparent", border: "none", color: T.muted, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 0
          }}
          onMouseEnter={(e)=>e.currentTarget.style.color = T.g}
          onMouseLeave={(e)=>e.currentTarget.style.color = T.muted}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
}

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reqs = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password)
  };

  const allReqsMet = reqs.length && reqs.upper && reqs.number && reqs.special && password === confirmPassword && password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allReqsMet || loading) return;
    
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password })
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to reset password");
      }
    } catch (e: any) {
      setError(e.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center", background: T.bg, padding: "1.5rem" }}>
      <div style={{
        background: T.panel,
        border: `1px solid ${T.border}`,
        width: "100%", maxWidth: 420,
        padding: "2.5rem",
        position: "relative",
        boxShadow: `0 0 60px rgba(0,255,136,0.1), 0 0 0 1px rgba(0,255,136,0.06)`,
      }}>
        {/* top gradient bar */}
        <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${T.g},${T.g2})` }}/>
        <Corners/>
        
        <div style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.15em", color:T.g, marginBottom:"0.5rem", textTransform: "uppercase" }}>
          {/* SECURITY */}
        </div>
        <div style={{ fontFamily:T.display, fontSize:"1.4rem", fontWeight:700, color:"#fff", marginBottom:"1.8rem" }}>
          Reset Password
        </div>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <ModalField 
              label="New Password" 
              type="password" 
              placeholder="••••••••••••" 
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            />
            
            <ModalField 
              label="Confirm Password" 
              type="password" 
              placeholder="••••••••••••" 
              value={confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
            />

            <div style={{ background: "rgba(0,255,136,0.02)", border: `1px solid ${T.border}`, padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "1.1rem" }}>
              <div style={{ fontFamily: T.mono, fontSize: "0.65rem", letterSpacing: "0.12em", color: T.text, marginBottom: "0.2rem", textTransform: "uppercase" }}>PASSWORD REQUIREMENTS:</div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: T.mono, fontSize: "0.75rem", color: reqs.length ? T.g : T.muted }}>
                <Check size={14} /> 8+ characters
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: T.mono, fontSize: "0.75rem", color: reqs.upper ? T.g : T.muted }}>
                <Check size={14} /> Uppercase
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: T.mono, fontSize: "0.75rem", color: reqs.number ? T.g : T.muted }}>
                <Check size={14} /> Number
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: T.mono, fontSize: "0.75rem", color: reqs.special ? T.g : T.muted }}>
                <Check size={14} /> Special character
              </div>
            </div>

            {error && (
              <div style={{ fontFamily: T.mono, fontSize: "0.75rem", color: T.red, marginBottom: "1.1rem", textAlign: "center", border: `1px dashed ${T.red}40`, padding: "0.5rem", background: `${T.red}10` }}>
                {error}
              </div>
            )}

            <button 
              type="submit"
              disabled={!allReqsMet || loading}
              style={{
                width:"100%", fontFamily:T.mono, fontSize:"0.82rem", letterSpacing:"0.1em", textTransform:"uppercase",
                color: (allReqsMet && !loading) ? T.bg : T.muted, background: (allReqsMet && !loading) ? T.g : "rgba(0,255,136,0.1)", 
                border:"none", padding:"0.85rem", cursor: (allReqsMet && !loading) ? "pointer" : "not-allowed", marginTop:"0.5rem",
                clipPath:"polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
                transition:"box-shadow 0.2s, background 0.2s",
              }}
              onMouseEnter={(e)=>{ if(allReqsMet && !loading) { e.currentTarget.style.boxShadow=T.glow;e.currentTarget.style.background="#fff"; } }}
              onMouseLeave={(e)=>{ if(allReqsMet && !loading) { e.currentTarget.style.boxShadow="";e.currentTarget.style.background=T.g; } }}
            >
              {loading ? '▶ PROCESSING...' : '▶ RESET PASSWORD'}
            </button>
            
            <div style={{ fontFamily:T.mono, fontSize:"0.7rem", color:"rgba(200,255,232,0.35)", textAlign:"center", marginTop:"1.2rem" }}>
              <Link href="/login" style={{ color:T.g2, cursor:"pointer", textDecoration:"none" }}
                onMouseEnter={(e)=>e.currentTarget.style.textShadow=T.glow2} onMouseLeave={(e)=>e.currentTarget.style.textShadow=""}>
                Back to Login
              </Link>
            </div>
          </form>
        ) : (
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ fontFamily: T.mono, fontSize: "0.75rem", lineHeight: 1.6, color: "#fff", background: "rgba(0,255,136,0.05)", border: `1px dashed ${T.border}`, padding: "1.5rem" }}>
              CREDENTIALS_UPDATED // PROCEED_TO_AUTH
            </div>
            <Link href="/login" style={{
              width:"100%", fontFamily:T.mono, fontSize:"0.82rem", letterSpacing:"0.1em", textTransform:"uppercase",
              color:T.bg, background:T.g, border:"none", padding:"0.85rem", cursor:"pointer",
              clipPath:"polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
              transition:"box-shadow 0.2s, background 0.2s", display: "inline-block", textDecoration: "none",
            }}
            onMouseEnter={(e)=>{ e.currentTarget.style.boxShadow=T.glow;e.currentTarget.style.background="#fff"; }}
            onMouseLeave={(e)=>{ e.currentTarget.style.boxShadow="";e.currentTarget.style.background=T.g; }}>
              ▶ RETURN TO LOGIN
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: T.bg, color: T.g }}>Loading...</div>}>
      <ResetForm />
    </Suspense>
  );
}
