"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GoogleIcon } from "@/components/icons/social";

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

function ModalField({ id, name, label, type, placeholder, value, onChange }: { id?: string, name?: string, label: string, type: string, placeholder?: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || name || label.replace(/\s+/g, '-').toLowerCase();
  
  const isPassword = type === 'password';
  const currentType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div style={{ marginBottom: "1.1rem" }}>
      <label htmlFor={inputId} style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <input 
          id={inputId}
          name={name}
          type={currentType} 
          placeholder={placeholder} 
          value={value}
          onChange={onChange}
          autoComplete={isPassword ? 'current-password' : 'off'}
          onFocus={()=>setFocused(true)} 
          onBlur={()=>setFocused(false)} 
          style={{
            width: "100%",
            background: "rgba(0,255,136,0.03)",
            border: `1px solid ${focused ? "rgba(0,255,136,0.5)" : T.border}`,
            boxShadow: focused ? "0 0 0 3px rgba(0,255,136,0.08)" : "none",
            padding: "0.8rem 1rem",
            paddingRight: isPassword ? "2.5rem" : "1rem",
            color: T.text,
            fontFamily: currentType === 'password' ? 'sans-serif' : T.mono,
            fontSize: "0.85rem",
            outline: "none",
            transition: "all 0.2s"
          }}
        />
        {isPassword && (
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "0.8rem",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: T.muted,
              cursor: "pointer",
              fontFamily: T.mono,
              fontSize: "0.7rem",
              outline: "none"
            }}
          >
            {showPassword ? "HIDE" : "SHOW"}
          </button>
        )}
      </div>
    </div>
  );
}

function SocialBtn({ provider, icon, onClick }: { provider: string, icon: React.ReactNode, onClick: () => void }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} type="button" onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
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

export default function LoginPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const focusField = (name: string) => {
      document.getElementById(name)?.focus();
    };

    if (!formData.email) {
      setError("Please enter your email.");
      focusField("email");
      return;
    }
    if (!formData.password) {
      setError("Please enter your password.");
      focusField("password");
      return;
    }
    
    const passwordComplexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordComplexityRegex.test(formData.password)) {
      setError("Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.");
      focusField("password");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          rememberMe: formData.rememberMe
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to authenticate.");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", background: T.bg, color: T.text,
      display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem", position: "relative"
    }}>
      <style dangerouslySetInnerHTML={{__html: `
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px #0a1628 inset !important;
            -webkit-text-fill-color: #c8ffe8 !important;
            transition: background-color 5000s ease-in-out 0s;
        }
      `}} />
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
          {/* AUTHENTICATE */}
        </div>
        <div style={{ fontFamily:T.display, fontSize:"1.6rem", fontWeight:700, color:"#fff", marginBottom:"1.8rem" }}>
          Access Terminal
        </div>

        <form onSubmit={handleLogin} id="login-form">
          <ModalField id="email" name="email" label="Email" type="email" placeholder="agent@yourteam.io" value={formData.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})} />
          <ModalField id="password" name="password" label="Password" type="password" placeholder="••••••••••••" value={formData.password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, password: e.target.value})} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.5rem", marginBottom: "1.5rem" }}>
            <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer" }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <input 
                  type="checkbox" name="rememberMe" checked={formData.rememberMe} onChange={handleChange}
                  style={{ opacity: 0, position: "absolute", width: "100%", height: "100%", cursor: "pointer", zIndex: 2 }} 
                />
                <div style={{ 
                  width: 16, height: 16, 
                  border: `1px solid ${formData.rememberMe ? T.g : T.border}`, 
                  background: formData.rememberMe ? "rgba(0,255,136,0.2)" : "rgba(0,255,136,0.03)",
                  display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s"
                }}>
                  {formData.rememberMe && <span style={{ color: T.g, fontSize: "0.7rem" }}>✓</span>}
                </div>
              </div>
              <span style={{ fontFamily: T.body, fontSize: "0.85rem", color: T.muted }}>Remember me</span>
            </label>
            
            <Link href="/forgot-password" style={{ fontFamily: T.mono, fontSize: "0.75rem", color: T.g2, textDecoration: "none" }}>
              Forgot password?
            </Link>
          </div>

          {error && (
            <div style={{ padding:"0.75rem", background:"rgba(255,51,85,0.1)", border:`1px solid ${T.red}`, color:T.red, fontSize:"0.8rem", fontFamily:T.mono, marginBottom:"1.2rem", textAlign:"center" }}>
              {error}
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
            {loading ? "AUTHENTICATING..." : "▶ LOGIN"}
          </button>
        </form>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
          <div style={{ flex: 1, height: 1, background: T.border }} />
          <div style={{ fontFamily: T.mono, fontSize: "0.65rem", letterSpacing: "0.1em", color: T.muted }}>OR</div>
          <div style={{ flex: 1, height: 1, background: T.border }} />
        </div>

        <SocialBtn provider="Google" icon={<GoogleIcon size={16} />} onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/login`} />

        <div style={{ fontFamily:T.mono, fontSize:"0.7rem", color:"rgba(200,255,232,0.35)", textAlign:"center", marginTop:"1.5rem" }}>
          No account? {" "}
          <Link href="/signup" style={{ color:T.g2, textDecoration:"none", transition:"text-shadow 0.2s" }}
            onMouseEnter={e=>e.currentTarget.style.textShadow=T.glow2} onMouseLeave={e=>e.currentTarget.style.textShadow=""}>
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
