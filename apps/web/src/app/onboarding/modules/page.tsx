'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { T, Corners, ActionBtn } from "../shared";
import { Headphones, Target } from "lucide-react";

export default function ModulesPage() {
  const router = useRouter();
  const [enabled, setEnabled] = useState({ support: true, sales: false });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/onboarding/state`, {
      headers: { 'Content-Type': 'application/json' }
    })
    .then(r => r.json())
    .then(data => {
      if (data.success && data.data?.settings?.modules) {
        setEnabled({
          support: data.data.settings.modules.support ?? true,
          sales: data.data.settings.modules.sales ?? false
        });
      }
      setInitialLoading(false);
    })
    .catch(() => setInitialLoading(false));
  }, []);

  const handleContinue = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/onboarding/modules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(enabled)
      });
      const data = await res.json();
      
      if (!data.success) {
        setError(data.error || "Failed to update modules");
      } else {
        router.push('/onboarding/team');
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div style={{ color: T.g, fontFamily: T.mono }}>Loading module data...</div>;
  }

  return (
    <div style={{ width: "100%", maxWidth: 800, background: T.panel, border: `1px solid ${T.border}`, padding: "3rem", position: "relative", boxShadow: `0 0 60px rgba(0,255,136,0.1), 0 0 0 1px rgba(0,255,136,0.06)` }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${T.g},${T.g2})` }}/>
      <Corners/>
      
      <div style={{ fontFamily:T.mono, fontSize:"0.75rem", letterSpacing:"0.15em", color:T.g, marginBottom:"0.5rem", textTransform: "uppercase" }}>
        {/* MODULE SELECTION */}
      </div>
      <h1 style={{ fontFamily:T.display, fontSize:"1.8rem", fontWeight:700, color:"#fff", marginBottom:"1rem" }}>
        Select your AI modules
      </h1>

      {error && (
        <div style={{ background: "rgba(255,51,85,0.1)", border: `1px solid ${T.red}`, color: T.red, padding: "0.8rem", marginBottom: "1.5rem", fontFamily: T.body, fontSize: "0.95rem" }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "2.5rem" }}>
        
        {/* Support Card */}
        <div style={{ border: `1px solid ${enabled.support ? T.g : T.border}`, background: enabled.support ? "rgba(0,255,136,0.05)" : T.bg2, padding: "1.5rem", position: "relative", transition: "all 0.3s", cursor: "pointer" }} onClick={() => setEnabled(prev => ({...prev, support: !prev.support}))}>
          {enabled.support && <div style={{ position: "absolute", top: 0, right: 0, padding: "0.4rem 0.8rem", background: T.g, color: T.bg, fontFamily: T.mono, fontSize: "0.7rem", fontWeight: "bold" }}>ENABLED</div>}
          <div style={{ marginBottom: "1rem" }}>
            <Headphones size={32} color={enabled.support ? T.g : T.muted} />
          </div>
          <h3 style={{ fontFamily: T.display, fontSize: "1.2rem", color: "#fff", marginBottom: "0.5rem" }}>AI Customer Support</h3>
          <p style={{ fontFamily: T.body, fontSize: "0.95rem", color: "rgba(200,255,232,0.6)", marginBottom: "1.5rem", lineHeight: 1.5 }}>
            Answer customer questions 24/7 using your business knowledge.
          </p>
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: "1rem" }}>
            <div style={{ fontFamily: T.mono, fontSize: "0.7rem", color: T.g, marginBottom: "0.5rem", letterSpacing: "0.1em" }}>FEATURES //</div>
            {["Knowledge base", "AI answers", "Citations", "Human takeover"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, marginBottom: "0.3rem" }}>
                <span style={{ color: T.g }}>›</span> {f}
              </div>
            ))}
          </div>
        </div>

        {/* Sales Card */}
        <div style={{ border: `1px solid ${enabled.sales ? T.g2 : T.border2}`, background: enabled.sales ? "rgba(0,207,255,0.05)" : T.bg2, padding: "1.5rem", position: "relative", transition: "all 0.3s", cursor: "pointer" }} onClick={() => setEnabled(prev => ({...prev, sales: !prev.sales}))}>
          {enabled.sales && <div style={{ position: "absolute", top: 0, right: 0, padding: "0.4rem 0.8rem", background: T.g2, color: T.bg, fontFamily: T.mono, fontSize: "0.7rem", fontWeight: "bold" }}>ENABLED</div>}
          <div style={{ marginBottom: "1rem" }}>
            <Target size={32} color={enabled.sales ? T.g2 : T.muted} />
          </div>
          <h3 style={{ fontFamily: T.display, fontSize: "1.2rem", color: "#fff", marginBottom: "0.5rem" }}>AI Sales Assistant</h3>
          <p style={{ fontFamily: T.body, fontSize: "0.95rem", color: "rgba(200,255,232,0.6)", marginBottom: "1.5rem", lineHeight: 1.5 }}>
            Find, research and contact qualified prospects automatically.
          </p>
          <div style={{ borderTop: `1px solid ${T.border2}`, paddingTop: "1rem" }}>
            <div style={{ fontFamily: T.mono, fontSize: "0.7rem", color: T.g2, marginBottom: "0.5rem", letterSpacing: "0.1em" }}>FEATURES //</div>
            {["ICP matching", "Lead discovery", "Research", "Automated outreach"].map(f => (
              <div key={f} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, marginBottom: "0.3rem" }}>
                <span style={{ color: T.g2 }}>›</span> {f}
              </div>
            ))}
          </div>
        </div>

      </div>

      <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px dashed ${T.border}`, paddingTop: "2rem" }}>
        <ActionBtn asLink href="/onboarding/organization">BACK</ActionBtn>
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
          {loading ? "SAVING..." : "CONTINUE ▶"}
        </button>
      </div>
    </div>
  );
}
