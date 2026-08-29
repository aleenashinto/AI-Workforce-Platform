"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { T, Corners, ActionBtn, ModalField } from "../shared";

export default function WorkspaceSetupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    companyName: "",
    companyUrl: "",
    teamSize: "1-10",
    industry: "Technology",
    userRole: "owner",
  });
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    setLoading(true);
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/onboarding/organization`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.companyName,
            website: formData.companyUrl,
            size: formData.teamSize,
            industry: formData.industry,
          }),
        },
      );

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/onboarding/preferences`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: formData.userRole,
        }),
      });
    } catch (e) {
      console.error(e);
    }
    router.push("/onboarding/complete");
  };

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 600,
        background: T.panel,
          borderRadius: "var(--t-radius)",
        border: `1px solid ${T.border}`,
        padding: "3rem",
        position: "relative",
        boxShadow: `0 0 60px rgba(0,255,136,0.1), 0 0 0 1px rgba(0,255,136,0.06)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: `linear-gradient(90deg,${T.g2},${T.g})`,
        }}
      />
      <Corners className="corners" />

      <h1
        style={{
          fontFamily: T.display,
          fontSize: "1.6rem",
          fontWeight: 700,
          color: "var(--t-heading)",
          marginBottom: "2rem",
        }}
      >
        Company & Role Setup
      </h1>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          marginBottom: "2rem",
        }}
      >
        <ModalField
          label="Company Name"
          placeholder="Acme Corp"
          value={formData.companyName}
          onChange={(e: any) =>
            setFormData({ ...formData, companyName: e.target.value })
          }
        />

        <ModalField
          label="Company URL"
          placeholder="https://example.com"
          value={formData.companyUrl}
          onChange={(e: any) =>
            setFormData({ ...formData, companyUrl: e.target.value })
          }
        />

        <ModalField
          label="Team Member Number"
          value={formData.teamSize}
          onChange={(e: any) =>
            setFormData({ ...formData, teamSize: e.target.value })
          }
          selectOptions={[
            { label: "1 - 10", value: "1-10" },
            { label: "11 - 50", value: "11-50" },
            { label: "51 - 250", value: "51-250" },
            { label: "251+", value: "251+" },
          ]}
        />

        <ModalField
          label="Industry"
          value={formData.industry}
          onChange={(e: any) =>
            setFormData({ ...formData, industry: e.target.value })
          }
          selectOptions={[
            { label: "Technology", value: "Technology" },
            { label: "Healthcare", value: "Healthcare" },
            { label: "Finance", value: "Finance" },
            { label: "Retail", value: "Retail" },
            { label: "Other", value: "Other" },
          ]}
        />

        <ModalField
          label="User Role"
          value={formData.userRole}
          onChange={(e: any) =>
            setFormData({ ...formData, userRole: e.target.value })
          }
          selectOptions={[
            { label: "Owner (Full Access)", value: "owner" },
            { label: "Customer Support Manager", value: "support_lead" },
            { label: "Customer Support Agent", value: "support_agent" },
            { label: "Sales Manager", value: "sales_lead" },
            { label: "Sales Representative", value: "sales_rep" },
            { label: "Viewer", value: "viewer" },
          ]}
        />
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: `1px dashed ${T.border}`,
          paddingTop: "2rem",
        }}
      >
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
