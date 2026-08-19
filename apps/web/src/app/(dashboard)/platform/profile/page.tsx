'use client';

import { useState } from "react";
import { User, Camera } from "lucide-react";
import { useUserContext } from "@/contexts/UserContext";

const T = {
  g:       "#00ff88",
  bg:      "#040810",
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
const Input = ({ label, value, type = "text", onChange, readOnly }: any) => (
  <div style={{ marginBottom: "1rem" }}>
    <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>{label}</label>
    <input
      type={type} value={value} onChange={onChange} readOnly={readOnly}
      style={{
        width: "100%", background: readOnly ? "rgba(0,255,136,0.02)" : "rgba(0,255,136,0.03)",
        border: `1px solid ${T.border}`, color: readOnly ? T.muted : T.text,
        fontFamily: T.mono, fontSize: "0.85rem", padding: "0.8rem", outline: "none",
        boxSizing: "border-box", cursor: readOnly ? "not-allowed" : "text"
      }}
    />
  </div>
);

export default function ProfilePage() {
  const { user, updateUser } = useUserContext();
  if (!user) return null;

  const initials = user.fullName.split(' ').map((n: string) => n[0]).join('');

  const [fullName, setFullName] = useState(user.fullName);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSave = async () => {
    setError("");
    setSuccess(false);

    if (newPassword && newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/auth/profile/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Send auth cookie
        body: JSON.stringify({
          fullName,
          email,
          currentPassword,
          newPassword
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess(true);
      
      // Update global context so header/sidebar update immediately
      updateUser({
        fullName: data.user.name,
        email: data.user.email
      });

      // Clear password fields on success
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>

      {/* Header */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h1 style={{ fontFamily: T.display, fontSize: "2.2rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <User color={T.g} size={32} /> Profile
        </h1>
        <p style={{ fontFamily: T.mono, fontSize: "0.9rem", color: T.g, letterSpacing: "0.05em" }}>
          Manage your personal account details.
        </p>
      </div>

      {/* Avatar */}
      <div style={{ background: T.panel, border: `1px solid ${T.border}`, padding: "2rem", position: "relative", marginBottom: "1.5rem" }}>
        <Corners />
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <div style={{ position: "relative" }}>
            <div style={{
              width: 96, height: 96, borderRadius: "50%",
              background: "rgba(0,255,136,0.08)", border: `2px solid ${T.g}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: T.glow
            }}>
              <span style={{ fontFamily: T.display, fontSize: "2rem", color: T.g }}>{initials}</span>
            </div>
            <button style={{
              position: "absolute", bottom: 0, right: 0,
              width: 28, height: 28, borderRadius: "50%",
              background: T.g, border: "none", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center"
            }}>
              <Camera size={14} color={T.bg} />
            </button>
          </div>
          <div>
            <div style={{ fontFamily: T.display, fontSize: "1.3rem", color: "#fff", fontWeight: 700 }}>{user.fullName}</div>
            <div style={{ fontFamily: T.mono, fontSize: "0.8rem", color: T.g, marginTop: "0.3rem" }}>{user.email}</div>
            <div style={{ fontFamily: T.mono, fontSize: "0.7rem", color: T.muted, marginTop: "0.2rem", textTransform: "uppercase" }}>
              {user.roles.join(' · ')}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div style={{ background: T.panel, border: `1px solid ${T.border}`, padding: "2rem", position: "relative", marginBottom: "1.5rem" }}>
        <Corners />
        <div style={{ fontFamily: T.mono, fontSize: "0.7rem", color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
          Personal Information
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Input label="Full Name" value={fullName} onChange={(e: any) => setFullName(e.target.value)} />
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          <Input label="Email Address" type="email" value={email} onChange={(e: any) => setEmail(e.target.value)} />
        </div>
      </div>

      {/* Password */}
      <div style={{ background: T.panel, border: `1px solid ${T.border}`, padding: "2rem", position: "relative", marginBottom: "2rem" }}>
        <Corners />
        <div style={{ fontFamily: T.mono, fontSize: "0.7rem", color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "1.5rem" }}>
          Change Password
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <Input label="Current Password" type="password" value={currentPassword} onChange={(e: any) => setCurrentPassword(e.target.value)} />
          <Input label="New Password" type="password" value={newPassword} onChange={(e: any) => setNewPassword(e.target.value)} />
          <Input label="Confirm New Password" type="password" value={confirmPassword} onChange={(e: any) => setConfirmPassword(e.target.value)} />
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div style={{ fontFamily: T.mono, fontSize: "0.85rem", color: '#ff3355', marginBottom: "1rem", textAlign: "right" }}>
          [ERROR] {error}
        </div>
      )}
      {success && (
        <div style={{ fontFamily: T.mono, fontSize: "0.85rem", color: T.g, marginBottom: "1rem", textAlign: "right" }}>
          Profile updated successfully!
        </div>
      )}

      {/* Save */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button 
          onClick={handleSave}
          disabled={loading}
          style={{
            background: loading ? "#00ff8880" : T.g, border: "none", padding: "0.8rem 2rem", color: T.bg,
            fontFamily: T.mono, fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase",
            cursor: loading ? "not-allowed" : "pointer", boxShadow: loading ? "none" : T.glow,
            clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
            transition: "all 0.2s"
          }}>
          {loading ? "SAVING..." : "Save Profile"}
        </button>
      </div>
    </div>
  );
}
