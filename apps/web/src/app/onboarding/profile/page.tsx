'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { T, Corners, ActionBtn, ModalField } from "../shared";
import { PhoneField } from "../../../components/ui/PhoneField";

export default function ProfileSetupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    jobTitle: "",
    phone: "",
    profilePicUrl: ""
  });
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);
    // Usually you'd call an API to save here. e.g. /auth/profile/update
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/profile/update`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          fullName: formData.name, 
          jobTitle: formData.jobTitle, 
          phoneNumber: formData.phone,
          avatarUrl: formData.profilePicUrl
        })
      });
      // We proceed regardless of response for now to allow seamless onboarding
    } catch (e) {
      console.error(e);
    }
    
    router.push("/onboarding/workspace");
  };

  return (
    <div style={{ width: "100%", maxWidth: 500, background: T.panel, border: `1px solid ${T.border}`, padding: "3rem", position: "relative", boxShadow: `0 0 60px rgba(0,255,136,0.1), 0 0 0 1px rgba(0,255,136,0.06)` }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, height:2, background:`linear-gradient(90deg,${T.g2},${T.g})` }}/>
      <Corners/>
      
      <h1 style={{ fontFamily:T.display, fontSize:"1.6rem", fontWeight:700, color:"#fff", marginBottom:"2rem" }}>
        Profile Setup
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "2rem" }}>
        
        <ModalField 
          label="Full Name" 
          placeholder="Jane Doe" 
          value={formData.name} 
          onChange={(e: any) => setFormData({...formData, name: e.target.value})} 
        />
        
        <ModalField 
          label="Job Title" 
          placeholder="e.g. Head of Support" 
          value={formData.jobTitle} 
          onChange={(e: any) => setFormData({...formData, jobTitle: e.target.value})} 
        />
        
        <PhoneField 
          label="Contact Information (Phone)" 
          value={formData.phone} 
          onChange={(val: string) => setFormData({...formData, phone: val})} 
        />

        <ModalField 
          label="Profile Picture URL" 
          placeholder="https://example.com/avatar.png" 
          value={formData.profilePicUrl} 
          onChange={(e: any) => setFormData({...formData, profilePicUrl: e.target.value})} 
        />

      </div>

      <div style={{ display: "flex", justifyContent: "space-between", borderTop: `1px dashed ${T.border}`, paddingTop: "2rem" }}>
        <ActionBtn onClick={() => router.push("/onboarding")}>
          BACK
        </ActionBtn>
        <ActionBtn filled onClick={handleNext}>
          {loading ? "SAVING..." : "SAVE & CONTINUE ▶"}
        </ActionBtn>
      </div>
    </div>
  );
}
