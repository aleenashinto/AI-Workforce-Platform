"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { GoogleIcon, MicrosoftIcon } from "@/components/icons/social";

/* ─────────────────────────────────────────────
   DESIGN TOKENS (Copied from landing page)
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

/* ─────────────────────────────────────────────
   CORNER BRACKETS
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   FIELD COMPONENT
───────────────────────────────────────────── */
function ModalField({ label, type, placeholder, value, onChange }: { label: string, type: string, placeholder?: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: "1.1rem" }}>
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

/* ─────────────────────────────────────────────
   SOCIAL BUTTON COMPONENT
───────────────────────────────────────────── */
function SocialBtn({ provider, icon, onClick }: { provider: string, icon: React.ReactNode, onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{
        width:"100%", display:"flex", alignItems:"center", justifyContent:"center", gap:"0.6rem",
        fontFamily:T.mono, fontSize:"0.75rem", letterSpacing:"0.05em",
        padding:"0.75rem", cursor:"pointer", transition:"all 0.2s",
        color:hov ? "#fff" : T.text, 
        background:hov ? "rgba(0,255,136,0.05)" : "rgba(0,0,0,0.2)", 
        border:`1px solid ${hov ? T.g : T.border}`, 
        boxShadow:hov ? T.glow : "none",
        marginBottom: "0.8rem"
      }}>
      <span style={{ fontSize:"1rem" }}>{icon}</span>
      Continue with {provider}
    </button>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE COMPONENT
───────────────────────────────────────────── */
function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const inviteToken = searchParams.get("invite_token");
  
  const [formData, setFormData] = useState({
    fullName: "",
    workEmail: emailParam,
    companyName: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.fullName || !formData.workEmail || !formData.password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (!formData.termsAccepted) {
      setError("Please accept the Terms of Service.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Send auth cookie if backend sets it
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.workEmail,
          companyName: formData.companyName,
          password: formData.password
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register account.");
      }

      if (inviteToken) {
        router.push(`/auth/invite?token=${inviteToken}`);
      } else {
        router.push("/onboarding");
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      color: T.text,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      position: "relative"
    }}>
      {/* Background elements */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      {/* Auth Card */}
      <div style={{
        background: T.panel,
        border: `1px solid ${T.border}`,
        width: "100%", maxWidth: 520,
        padding: "2.5rem 3rem",
        position: "relative", zIndex: 10,
        boxShadow: `0 0 80px rgba(0,255,136,0.08), 0 0 0 1px rgba(0,255,136,0.06)`,
      }}>
        {/* top gradient bar */}
        <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${T.g},${T.g2})` }}/>
        <Corners/>

        <div style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.15em", color:T.g, marginBottom:"0.5rem" }}>
          {/* INITIALIZE AGENT */}
        </div>
        <div style={{ fontFamily:T.display, fontSize:"1.6rem", fontWeight:700, color:"#fff", marginBottom:"1.8rem" }}>
          Create Account
        </div>

        <form onSubmit={handleRegister}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <ModalField label="Full Name" type="text" placeholder="John Doe" value={formData.fullName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, fullName: e.target.value})} />
            <ModalField label="Company Name" type="text" placeholder="Acme Corp" value={formData.companyName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, companyName: e.target.value})} />
          </div>
          
          <ModalField label="Work Email" type="email" placeholder="john@acme.com" value={formData.workEmail} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, workEmail: e.target.value})} />
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <ModalField label="Password" type="password" placeholder="••••••••••••" value={formData.password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, password: e.target.value})} />
            <ModalField label="Confirm Password" type="password" placeholder="••••••••••••" value={formData.confirmPassword} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, confirmPassword: e.target.value})} />
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginTop: "0.5rem", marginBottom: "1.5rem", cursor: "pointer" }}>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input 
                type="checkbox" 
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                style={{ opacity: 0, position: "absolute", width: "100%", height: "100%", cursor: "pointer", zIndex: 2 }} 
              />
              <div style={{ 
                width: 18, height: 18, 
                border: `1px solid ${formData.termsAccepted ? T.g : T.border}`, 
                background: formData.termsAccepted ? "rgba(0,255,136,0.2)" : "rgba(0,255,136,0.03)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s"
              }}>
                {formData.termsAccepted && <span style={{ color: T.g, fontSize: "0.8rem" }}>✓</span>}
              </div>
            </div>
            <span style={{ fontFamily: T.body, fontSize: "0.85rem", color: T.muted }}>
              I agree to the <a href="#" style={{ color: T.g, textDecoration: "none" }}>Terms of Service</a> and <a href="#" style={{ color: T.g, textDecoration: "none" }}>Privacy Policy</a>
            </span>
          </label>

          {error && (
            <div style={{ fontFamily: T.mono, fontSize: "0.85rem", color: T.red, marginBottom: "1.5rem", textAlign: "center" }}>
              [ERROR] {error}
            </div>
          )}

          <button type="submit" 
            disabled={loading}
            style={{
              width:"100%", fontFamily:T.mono, fontSize:"0.85rem", letterSpacing:"0.1em", textTransform:"uppercase",
              color:T.bg, background:loading ? "rgba(0,255,136,0.5)" : T.g, border:"none", padding:"1rem", cursor:loading ? "not-allowed" : "pointer", marginBottom:"1.5rem",
              clipPath:"polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)",
              transition:"box-shadow 0.2s, background 0.2s",
            }}
            onMouseEnter={e=>{if(!loading){e.currentTarget.style.boxShadow=T.glow;e.currentTarget.style.background="#fff";}}}
            onMouseLeave={e=>{if(!loading){e.currentTarget.style.boxShadow="";e.currentTarget.style.background=T.g;}}}
          >
            {loading ? "INITIALIZING..." : "▶ INITIALIZE WORKSPACE"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ flex: 1, height: 1, background: T.border }} />
          <div style={{ fontFamily: T.mono, fontSize: "0.65rem", letterSpacing: "0.1em", color: T.muted }}>OR</div>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>

        <SocialBtn provider="Google" icon={<GoogleIcon size={16} />} onClick={() => window.location.href = "http://localhost:3001/auth/google/login"} />
        <SocialBtn provider="Microsoft" icon={<MicrosoftIcon size={16} />} onClick={() => window.location.href = "http://localhost:3001/auth/microsoft/login"} />

        <div style={{ fontFamily:T.mono, fontSize:"0.7rem", color:"rgba(200,255,232,0.35)", textAlign:"center", marginTop:"1.5rem" }}>
          Already have an account? {" "}
          <Link href="/login" style={{ color:T.g2, textDecoration:"none", transition:"text-shadow 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.textShadow=T.glow2} onMouseLeave={e=>e.currentTarget.style.textShadow=""}>
            Authenticate here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpContent />
    </Suspense>
  );
}
