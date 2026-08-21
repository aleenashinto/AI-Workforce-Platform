'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { T, Corners, ActionBtn, ModalField } from "../shared";

export default function PreferencesSetupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    userRole: "Admin",
    workforcePreferences: {
      sales: true,
      support: false,
      marketing: false
    },
    aiPreferences: {
      creative: true,
      analytical: false
    },
    requiredConfiguration: ""
  });
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);
    // Call API if necessary, then push
    // We proceed regardless of response for now to allow seamless onboarding
    router.push("/onboarding/complete");
  };

  const textareaStyle = {
    width:"100%", background:"rgba(0,255,136,0.03)",
    border:`1px solid ${T.border}`,
    color:T.text, fontFamily:T.mono, fontSize:"0.82rem",
    padding:"0.7rem 1rem", outline:"none",
    minHeight: "60px", resize: "vertical" as any
  };

  const checkboxStyle = {
    marginRight: "0.5rem",
    cursor: "pointer"
  };

  const labelStyle = {
    fontFamily: T.mono,
    fontSize: "0.8rem",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    marginBottom: "0.5rem"
  };

  return (
    <div style={{ width: "100%", maxWidth: 600, background: T.panel, border: `1px solid ${T.border}`, padding: "3rem", position: "relative", boxShadow: `0 0 60px rgba(0,255,136,0.1), 0 0 0 1px rgba(0,255,136,0.06)` }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${T.g2},${T.g})` }}/>
      <Corners/>
      
      <h1 style={{ fontFamily:T.display, fontSize:"1.6rem", fontWeight:700, color:"#fff", marginBottom:"2rem" }}>
        Role & Preferences
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
        
        <ModalField 
          label="User Role" 
          value={formData.userRole} 
          onChange={(e: any) => setFormData({...formData, userRole: e.target.value})} 
          selectOptions={[
            { label: "Admin", value: "Admin" },
            { label: "Manager", value: "Manager" },
            { label: "Member", value: "Member" }
          ]}
        />

        <div style={{ marginBottom: "1.1rem" }}>
          <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.8rem", display:"block", textTransform:"uppercase" }}>Workforce Preferences</label>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={labelStyle}>
              <input type="checkbox" style={checkboxStyle} checked={formData.workforcePreferences.sales} onChange={(e) => setFormData({...formData, workforcePreferences: {...formData.workforcePreferences, sales: e.target.checked}})} />
              Sales Agents
            </label>
            <label style={labelStyle}>
              <input type="checkbox" style={checkboxStyle} checked={formData.workforcePreferences.support} onChange={(e) => setFormData({...formData, workforcePreferences: {...formData.workforcePreferences, support: e.target.checked}})} />
              Customer Support Agents
            </label>
            <label style={labelStyle}>
              <input type="checkbox" style={checkboxStyle} checked={formData.workforcePreferences.marketing} onChange={(e) => setFormData({...formData, workforcePreferences: {...formData.workforcePreferences, marketing: e.target.checked}})} />
              Marketing Agents
            </label>
          </div>
        </div>

        <div style={{ marginBottom: "1.1rem" }}>
          <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.8rem", display:"block", textTransform:"uppercase" }}>AI Preferences</label>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <label style={labelStyle}>
              <input type="checkbox" style={checkboxStyle} checked={formData.aiPreferences.creative} onChange={(e) => setFormData({...formData, aiPreferences: {...formData.aiPreferences, creative: e.target.checked}})} />
              Creative Tone
            </label>
            <label style={labelStyle}>
              <input type="checkbox" style={checkboxStyle} checked={formData.aiPreferences.analytical} onChange={(e) => setFormData({...formData, aiPreferences: {...formData.aiPreferences, analytical: e.target.checked}})} />
              Analytical / Data-driven
            </label>
          </div>
        </div>

        <div style={{ marginBottom: "1.1rem" }}>
          <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>Required Configuration</label>
          <textarea 
            placeholder="Any specific instructions or configurations needed?" 
            style={textareaStyle}
            value={formData.requiredConfiguration} 
            onChange={(e: any) => setFormData({...formData, requiredConfiguration: e.target.value})} 
          />
        </div>

      </div>

      <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px dashed ${T.border}`, paddingTop: "2rem" }}>
        <ActionBtn onClick={() => router.push("/onboarding/workspace")}>
          BACK
        </ActionBtn>
        <ActionBtn filled onClick={handleNext}>
          {loading ? "SAVING..." : "COMPLETE SETUP ▶"}
        </ActionBtn>
      </div>
    </div>
  );
}
