'use client';

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, CheckCircle, AlertTriangle, RefreshCw } from "lucide-react";

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

function VerifyContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"waiting" | "verified" | "expired">("waiting");
  const [userEmail, setUserEmail] = useState("");
  const [isResending, setIsResending] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!token) return;
    if (hasFetched) return;
    
    setHasFetched(true);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        setStatus("verified");
      } else {
        setStatus("expired");
      }
    })
    .catch(() => setStatus("expired"));
  }, [token, hasFetched]);

  const handleResend = async () => {
    let targetEmail = userEmail;
    if (!targetEmail) {
      const input = prompt("Please enter your registered email address:");
      if (!input) return;
      targetEmail = input;
      setUserEmail(input);
    }
    
    setIsResending(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail })
      });
      alert("If an unverified account exists, a new verification email has been sent.");
    } catch (e) {
      alert("Failed to send verification email. Please try again later.");
    } finally {
      setIsResending(false);
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
        <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${T.g},${T.g2})` }}/>
        <Corners />
        
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: "50%", background: "rgba(0,255,136,0.05)", border: `1px solid ${T.border}`, marginBottom: "1rem", boxShadow: T.glow }}>
            {status === "waiting" && <Mail size={24} color={T.g} />}
            {status === "verified" && <CheckCircle size={24} color={T.g} />}
            {status === "expired" && <AlertTriangle size={24} color={T.warn} />}
          </div>
          
          <div style={{ fontFamily:T.display, fontSize:"1.4rem", fontWeight:700, color:"#fff", marginBottom:"0.5rem" }}>
            {status === "waiting" && (token ? "Verifying..." : "Verify your email")}
            {status === "verified" && "Email Verified"}
            {status === "expired" && "Link Expired"}
          </div>
          
          <div style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.15em", color:T.muted, textTransform: "uppercase" }}>
            STATUS // {status}
          </div>
        </div>

        {status === "waiting" && (
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ fontFamily: T.body, fontSize: "0.95rem", color: "rgba(200,255,232,0.6)", lineHeight: 1.6 }}>
              {token ? "Please wait while we verify your email address..." : "We've sent a verification link to your email address. Please check your inbox."}
            </div>
            
            <button 
              onClick={handleResend}
              disabled={isResending}
              style={{
                width:"100%", fontFamily:T.mono, fontSize:"0.82rem", letterSpacing:"0.1em", textTransform:"uppercase",
                color:T.g2, background:"transparent", border:`1px solid ${T.border2}`, padding:"0.85rem", cursor: isResending ? "not-allowed" : "pointer",
                clipPath:"polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                transition:"box-shadow 0.2s, background 0.2s, border-color 0.2s",
                opacity: isResending ? 0.5 : 1
              }}
              onMouseEnter={(e)=>{ if(!isResending) {e.currentTarget.style.borderColor=T.g2;e.currentTarget.style.background="rgba(0,207,255,0.07)";e.currentTarget.style.boxShadow=T.glow2;} }}
              onMouseLeave={(e)=>{ if(!isResending) {e.currentTarget.style.borderColor=T.border2;e.currentTarget.style.background="transparent";e.currentTarget.style.boxShadow="";} }}
            >
              <RefreshCw size={14} className={isResending ? "animate-spin" : ""} /> {isResending ? "SENDING..." : "Resend Email"}
            </button>
            
            <div style={{ fontFamily:T.mono, fontSize:"0.7rem", color:"rgba(200,255,232,0.35)", textAlign:"center", marginTop:"0.5rem" }}>
              <Link href="/login" style={{ color:T.g2, cursor:"pointer", textDecoration:"none" }}
                onMouseEnter={(e)=>e.currentTarget.style.textShadow=T.glow2} onMouseLeave={(e)=>e.currentTarget.style.textShadow=""}>
                Back to Login
              </Link>
            </div>
          </div>
        )}

        {status === "verified" && (
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ fontFamily: T.body, fontSize: "0.95rem", color: "rgba(200,255,232,0.6)", lineHeight: 1.6 }}>
              Your email has been successfully verified. Your account is now fully active.
            </div>
            <Link href="/platform/dashboard" style={{
              width:"100%", fontFamily:T.mono, fontSize:"0.82rem", letterSpacing:"0.1em", textTransform:"uppercase",
              color:T.bg, background:T.g, border:"none", padding:"0.85rem", cursor:"pointer",
              clipPath:"polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
              transition:"box-shadow 0.2s, background 0.2s", display: "inline-block", textDecoration: "none",
            }}
            onMouseEnter={(e)=>{ e.currentTarget.style.boxShadow=T.glow;e.currentTarget.style.background="#fff"; }}
            onMouseLeave={(e)=>{ e.currentTarget.style.boxShadow="";e.currentTarget.style.background=T.g; }}>
              ▶ INITIALIZE DASHBOARD
            </Link>
          </div>
        )}

        {status === "expired" && (
          <div style={{ textAlign: "center", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
            <div style={{ fontFamily: T.body, fontSize: "0.95rem", color: "rgba(200,255,232,0.6)", lineHeight: 1.6 }}>
              The verification link has expired or is invalid. Please request a new one.
            </div>
            <button 
              onClick={handleResend}
              disabled={isResending}
              style={{
                width:"100%", fontFamily:T.mono, fontSize:"0.82rem", letterSpacing:"0.1em", textTransform:"uppercase",
                color:T.bg, background:T.warn, border:"none", padding:"0.85rem", cursor: isResending ? "not-allowed" : "pointer",
                clipPath:"polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
                transition:"box-shadow 0.2s, background 0.2s",
                opacity: isResending ? 0.5 : 1
              }}
              onMouseEnter={(e)=>{ if(!isResending) {e.currentTarget.style.boxShadow=`0 0 20px ${T.warn}55`;e.currentTarget.style.background="#ffcc33";} }}
              onMouseLeave={(e)=>{ if(!isResending) {e.currentTarget.style.boxShadow="";e.currentTarget.style.background=T.warn;} }}
            >
              <RefreshCw size={14} className={isResending ? "animate-spin" : ""} /> {isResending ? "REQUESTING..." : "Request New Link"}
            </button>
            <div style={{ fontFamily:T.mono, fontSize:"0.7rem", color:"rgba(200,255,232,0.35)", textAlign:"center", marginTop:"0.5rem" }}>
              <Link href="/login" style={{ color:T.warn, cursor:"pointer", textDecoration:"none" }}>
                Back to Login
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg, color: T.g, fontFamily: T.mono }}>LOADING...</div>}>
      <VerifyContent />
    </Suspense>
  );
}
