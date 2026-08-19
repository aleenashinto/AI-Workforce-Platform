'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { T, Corners, ModalField, ActionBtn } from "../shared";
import { Plus, X } from "lucide-react";

export default function TeamPage() {
  const router = useRouter();
  const [invites, setInvites] = useState([{ email: "", role: "admin", id: 1 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const addInvite = () => {
    setInvites([...invites, { email: "", role: "viewer", id: Date.now() }]);
  };

  const removeInvite = (id: number) => {
    if (invites.length > 1) {
      setInvites(invites.filter(inv => inv.id !== id));
    }
  };

  const updateInvite = (id: number, field: string, value: string) => {
    setInvites(invites.map(inv => inv.id === id ? { ...inv, [field]: value } : inv));
  };

  const handleContinue = async () => {
    setError("");
    setSuccess("");
    
    // Filter out completely empty rows
    const validInvites = invites.filter(inv => inv.email.trim() !== "");
    
    if (validInvites.length > 0) {
      // Validate emails
      for (const inv of validInvites) {
        if (!inv.email.includes('@') || !inv.email.includes('.')) {
          setError(`Please enter a valid email address for ${inv.email}`);
          return;
        }
      }
      
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/onboarding/team`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ invites: validInvites })
        });
        const data = await res.json();
        
        if (!data.success) {
          setError(data.error || "Failed to send invitations");
          setLoading(false);
          return;
        }
      } catch (err) {
        setError("Network error. Please try again.");
        setLoading(false);
        return;
      }
    }
    
    // If no invites, or invites sent successfully, proceed
    router.push('/onboarding/complete');
  };

  return (
    <div style={{ width: "100%", maxWidth: 700, background: T.panel, border: `1px solid ${T.border}`, padding: "3rem", position: "relative", boxShadow: `0 0 60px rgba(0,255,136,0.1), 0 0 0 1px rgba(0,255,136,0.06)` }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${T.g},${T.g2})` }}/>
      <Corners/>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem" }}>
        <div>
          <div style={{ fontFamily:T.mono, fontSize:"0.75rem", letterSpacing:"0.15em", color:T.g, marginBottom:"0.5rem", textTransform: "uppercase" }}>
            {/* TEAM ACCESS */}
          </div>
          <h1 style={{ fontFamily:T.display, fontSize:"1.8rem", fontWeight:700, color:"#fff" }}>
            Invite your team
          </h1>
        </div>
        <button onClick={() => router.push('/onboarding/complete')} style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.text, padding: "0.5rem 1rem", fontFamily: T.mono, fontSize: "0.75rem", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>SKIP FOR NOW</button>
      </div>

      {error && (
        <div style={{ background: "rgba(255,51,85,0.1)", border: `1px solid ${T.red}`, color: T.red, padding: "0.8rem", marginBottom: "1.5rem", fontFamily: T.body, fontSize: "0.95rem" }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ background: "rgba(0,255,136,0.1)", border: `1px solid ${T.g}`, color: T.g, padding: "0.8rem", marginBottom: "1.5rem", fontFamily: T.body, fontSize: "0.95rem" }}>
          {success}
        </div>
      )}

      <div style={{ background: T.bg2, border: `1px solid ${T.border}`, padding: "1.5rem", marginBottom: "2rem" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 150px 40px", gap: "1rem", marginBottom: "1rem" }}>
          <div style={{ fontFamily: T.mono, fontSize: "0.7rem", color: T.muted, letterSpacing: "0.1em" }}>EMAIL ADDRESS</div>
          <div style={{ fontFamily: T.mono, fontSize: "0.7rem", color: T.muted, letterSpacing: "0.1em" }}>ROLE</div>
          <div></div>
        </div>
        
        {invites.map((inv, index) => (
          <div key={inv.id} style={{ display: "grid", gridTemplateColumns: "1fr 150px 40px", gap: "1rem", alignItems: "center", marginBottom: index === invites.length - 1 ? 0 : "1rem" }}>
            <div style={{ marginBottom: "-1.1rem" }}>
              <ModalField label="" placeholder="teammate@company.com" value={inv.email} onChange={(e: any) => updateInvite(inv.id, 'email', e.target.value)} />
            </div>
            <div style={{ marginBottom: "-1.1rem" }}>
              <ModalField label="" value={inv.role} onChange={(e: any) => updateInvite(inv.id, 'role', e.target.value)} selectOptions={[
                {label:"Owner", value:"owner"}, {label:"Admin", value:"admin"}, {label:"Agent", value:"agent"}, {label:"Viewer", value:"viewer"}
              ]} />
            </div>
            {invites.length > 1 ? (
              <button onClick={() => removeInvite(inv.id)} style={{ background: "transparent", border: "none", color: T.red, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", height: "100%", paddingBottom: "1.1rem" }}>
                <X size={20} />
              </button>
            ) : <div />}
          </div>
        ))}

        <div style={{ marginTop: "1.5rem" }}>
          <button onClick={addInvite} style={{ background: "transparent", border: `1px dashed ${T.border}`, color: T.g, fontFamily: T.mono, fontSize: "0.75rem", padding: "0.5rem 1rem", display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", letterSpacing: "0.1em" }}>
            <Plus size={14} /> ADD ANOTHER
          </button>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px dashed ${T.border}`, paddingTop: "2rem" }}>
        <ActionBtn asLink href="/onboarding/modules">BACK</ActionBtn>
        <button 
          onClick={handleContinue}
          disabled={loading}
          style={{ 
            background: T.g, 
            color: T.bg, 
            border: "none", 
            padding: "0.8rem 1.5rem", 
            fontFamily: T.mono, 
            fontWeight: "bold", 
            cursor: loading ? "not-allowed" : "pointer",
            letterSpacing: "0.1em",
            opacity: loading ? 0.7 : 1
          }}>
          {loading ? "SENDING..." : "SEND INVITATIONS ▶"}
        </button>
      </div>
    </div>
  );
}
