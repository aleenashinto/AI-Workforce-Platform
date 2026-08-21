'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { T, Corners, ActionBtn, ModalField } from "../shared";

export default function WorkspaceSetupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: "",
    companyInfo: "",
    workspaceInfo: "",
    industry: "Technology",
    teamInfo: ""
  });
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);
    // Call API if necessary, then push
    // We proceed regardless of response for now to allow seamless onboarding
    router.push("/onboarding/preferences");
  };

  const textareaStyle = {
    width:"100%", background:"rgba(0,255,136,0.03)",
    border:`1px solid ${T.border}`,
    color:T.text, fontFamily:T.mono, fontSize:"0.82rem",
    padding:"0.7rem 1rem", outline:"none",
    minHeight: "60px", resize: "vertical" as any
  };

  return (
    <div style={{ width: "100%", maxWidth: 600, background: T.panel, border: `1px solid ${T.border}`, padding: "3rem", position: "relative", boxShadow: `0 0 60px rgba(0,255,136,0.1), 0 0 0 1px rgba(0,255,136,0.06)` }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${T.g2},${T.g})` }}/>
      <Corners/>
      
      <h1 style={{ fontFamily:T.display, fontSize:"1.6rem", fontWeight:700, color:"#fff", marginBottom:"2rem" }}>
        Company / Workspace Setup
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "2rem" }}>
        
        <ModalField 
          label="Company Name" 
          placeholder="Acme Corp" 
          value={formData.companyName} 
          onChange={(e: any) => setFormData({...formData, companyName: e.target.value})} 
        />
        
        <div style={{ marginBottom: "1.1rem" }}>
          <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>Company Information</label>
          <textarea 
            placeholder="Brief description of what your company does" 
            style={textareaStyle}
            value={formData.companyInfo} 
            onChange={(e: any) => setFormData({...formData, companyInfo: e.target.value})} 
          />
        </div>

        <div style={{ marginBottom: "1.1rem" }}>
          <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>Workspace Information</label>
          <textarea 
            placeholder="What is the primary purpose of this workspace?" 
            style={textareaStyle}
            value={formData.workspaceInfo} 
            onChange={(e: any) => setFormData({...formData, workspaceInfo: e.target.value})} 
          />
        </div>

        <ModalField 
          label="Industry" 
          value={formData.industry} 
          onChange={(e: any) => setFormData({...formData, industry: e.target.value})} 
          selectOptions={[
            { label: "Technology", value: "Technology" },
            { label: "Healthcare", value: "Healthcare" },
            { label: "Finance", value: "Finance" },
            { label: "Retail", value: "Retail" },
            { label: "Other", value: "Other" }
          ]}
        />

        <div style={{ marginBottom: "1.1rem" }}>
          <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>Team Information</label>
          <textarea 
            placeholder="Who will be using this workspace?" 
            style={textareaStyle}
            value={formData.teamInfo} 
            onChange={(e: any) => setFormData({...formData, teamInfo: e.target.value})} 
          />
        </div>

      </div>

      <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px dashed ${T.border}`, paddingTop: "2rem" }}>
        <ActionBtn onClick={() => router.push("/onboarding/profile")}>
          BACK
        </ActionBtn>
        <ActionBtn filled onClick={handleNext}>
          {loading ? "SAVING..." : "CONTINUE ▶"}
        </ActionBtn>
      </div>
    </div>
  );
}
