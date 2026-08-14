'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { T, Corners, ModalField, ActionBtn } from "../shared";

export default function OrganizationPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "", website: "", industry: "tech", size: "1-10", country: "US", timezone: "UTC"
  });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch('http://localhost:3001/onboarding/state', {
      headers: { 'Content-Type': 'application/json' }
    })
    .then(r => r.json())
    .then(data => {
      if (data.success && data.data) {
        setForm({
          name: data.data.name || "",
          website: data.data.settings?.website || "",
          industry: data.data.settings?.industry || "tech",
          size: data.data.settings?.size || "1-10",
          country: data.data.settings?.country || "US",
          timezone: data.data.settings?.timezone || "UTC"
        });
      }
      setInitialLoading(false);
    })
    .catch(() => setInitialLoading(false));
  }, []);

  const handleContinue = async () => {
    setError("");
    
    if (!form.name.trim()) {
      setError("Organization name is required");
      return;
    }
    
    if (form.website && !form.website.match(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/)) {
      setError("Please enter a valid website URL");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/onboarding/organization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      
      if (!data.success) {
        setError(data.error || "Failed to update organization");
      } else {
        router.push('/onboarding/modules');
      }
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div style={{ color: T.g, fontFamily: T.mono }}>Loading organization data...</div>;
  }

  return (
    <div style={{ width: "100%", maxWidth: 600, background: T.panel, border: `1px solid ${T.border}`, padding: "3rem", position: "relative", boxShadow: `0 0 60px rgba(0,255,136,0.1), 0 0 0 1px rgba(0,255,136,0.06)` }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${T.g},${T.g2})` }}/>
      <Corners/>
      
      <div style={{ fontFamily:T.mono, fontSize:"0.75rem", letterSpacing:"0.15em", color:T.g, marginBottom:"0.5rem", textTransform: "uppercase" }}>
        {/* ORGANIZATION SETUP */}
      </div>
      <h1 style={{ fontFamily:T.display, fontSize:"1.8rem", fontWeight:700, color:"#fff", marginBottom:"1rem" }}>
        Set up your organization
      </h1>

      {error && (
        <div style={{ background: "rgba(255,51,85,0.1)", border: `1px solid ${T.red}`, color: T.red, padding: "0.8rem", marginBottom: "1.5rem", fontFamily: T.body, fontSize: "0.95rem" }}>
          {error}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 1.5rem" }}>
        <div style={{ gridColumn: "span 2" }}>
          <ModalField label="Organization Name" placeholder="Acme Corp" value={form.name} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)=>setForm({...form, name: e.target.value})} />
        </div>
        <div style={{ gridColumn: "span 2" }}>
          <ModalField label="Website" placeholder="https://acmecorp.com" value={form.website} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)=>setForm({...form, website: e.target.value})} />
        </div>
        
        <ModalField label="Industry" value={form.industry} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)=>setForm({...form, industry: e.target.value})} selectOptions={[
          {label:"Technology", value:"tech"}, {label:"E-commerce", value:"ecommerce"}, {label:"Healthcare", value:"health"}, {label:"Finance", value:"finance"}
        ]} />
        <ModalField label="Company Size" value={form.size} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)=>setForm({...form, size: e.target.value})} selectOptions={[
          {label:"1-10", value:"1-10"}, {label:"11-50", value:"11-50"}, {label:"51-200", value:"51-200"}, {label:"201+", value:"201+"}
        ]} />
        <ModalField label="Country" value={form.country} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)=>setForm({...form, country: e.target.value})} selectOptions={[
          {label:"United States", value:"US"}, {label:"United Kingdom", value:"UK"}, {label:"Canada", value:"CA"}, {label:"Australia", value:"AU"}
        ]} />
        <ModalField label="Timezone" value={form.timezone} onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>)=>setForm({...form, timezone: e.target.value})} selectOptions={[
          {label:"UTC", value:"UTC"}, {label:"PST", value:"PST"}, {label:"EST", value:"EST"}, {label:"GMT", value:"GMT"}
        ]} />
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem", borderTop: `1px dashed ${T.border}`, paddingTop: "2rem" }}>
        <ActionBtn asLink href="/onboarding">BACK</ActionBtn>
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
