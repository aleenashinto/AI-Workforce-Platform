"use client";

import { Shield, Download } from "lucide-react";
import { useState } from "react";

const T = {
  g: "var(--t-g)",
  bg: "var(--t-bg)",
  bg2: "var(--t-bg2)",
  panel: "var(--t-panel)",
  border: "var(--t-border)",
  muted: "var(--t-muted)",
  text: "var(--t-text)",
  glow: "var(--t-glow)",
  mono: "'Share Tech Mono', monospace",
  display: "'Orbitron', sans-serif",
  body: "'Rajdhani', sans-serif",
};

const Corners = () => (
  <>
    {[
      ["tl", "1px 0 0 1px", "0", "0", "auto", "auto"],
      ["tr", "1px 1px 0 0", "0", "auto", "0", "auto"],
      ["bl", "0 0 1px 1px", "auto", "0", "auto", "0"],
      ["br", "0 1px 1px 0", "auto", "auto", "0", "0"],
    ].map(([k, bw, t, l, b, r]) => (
      <span
        key={k}
        style={{
          position: "absolute",
          width: 14,
          height: 14,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          borderColor: T.g,
          borderStyle: "solid",
          borderWidth: bw as any,
          opacity: 0.5,
          top: t === "auto" ? undefined : 8,
          left: l === "auto" ? undefined : 8,
          bottom: b === "auto" ? undefined : 8,
          right: r === "auto" ? undefined : 8,
        }}
      />
    ))}
  </>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SettingSection = ({ title, icon: Icon, children }: any) => (
  <div
    style={{
      background: T.panel,
      border: `1px solid ${T.border}`,
      padding: "2rem",
      position: "relative",
      marginBottom: "2rem",
    }}
  >
    <Corners />
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.8rem",
        marginBottom: "1.5rem",
      }}
    >
      <Icon size={18} color={T.g} />
      <div
        style={{
          fontFamily: T.display,
          fontSize: "1.2rem",
          fontWeight: 700,
          color: "var(--t-heading)",
        }}
      >
        {title}
      </div>
    </div>
    {children}
  </div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Select = ({ label, value, onChange, options }: any) => (
  <div style={{ marginBottom: "1rem" }}>
    <label
      style={{
        fontFamily: T.mono,
        fontSize: "0.65rem",
        letterSpacing: "0.12em",
        color: T.muted,
        marginBottom: "0.4rem",
        display: "block",
        textTransform: "uppercase",
      }}
    >
      {label}
    </label>
    <select
      value={value}
      onChange={onChange}
      style={{
        width: "100%",
        background: "rgba(0,255,136,0.03)",
        border: `1px solid ${T.border}`,
        color: T.text,
        fontFamily: T.mono,
        fontSize: "0.85rem",
        padding: "0.8rem",
        outline: "none",
        appearance: "none",
      }}
    >
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {options.map((opt: any) => (
        <option
          key={opt.value}
          value={opt.value}
          style={{ background: T.panel, color: T.text }}
        >
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default function SecuritySettingsPage() {
  const [policySaving, setPolicySaving] = useState(false);
  const [policySaved, setPolicySaved] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);

  const handleUpdatePolicy = () => {
    setPolicySaving(true);
    setTimeout(() => {
      setPolicySaving(false);
      setPolicySaved(true);
      setTimeout(() => setPolicySaved(false), 2000);
    }, 800);
  };

  const handleExport = () => {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    }, 1200);
  };

  return (
    <div>
      <SettingSection title="Data Retention" icon={Shield}>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <p
            style={{ fontFamily: T.mono, fontSize: "0.85rem", color: T.muted }}
          >
            Configure GDPR/DPDP deletion policies. Hard deletion runs daily.
            Data deleted via retention policy cannot be recovered.
          </p>
          <div style={{ width: "50%" }}>
            <Select
              label="Retention Period"
              defaultValue="90"
              options={[
                { value: "30", label: "30 Days" },
                { value: "60", label: "60 Days" },
                { value: "90", label: "90 Days" },
                { value: "180", label: "180 Days" },
                { value: "never", label: "Retain Forever (Not Recommended)" },
              ]}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <button
              onClick={handleUpdatePolicy}
              style={{
                background: policySaved ? T.g : "rgba(0,255,136,0.1)",
                border: `1px solid ${T.g}`,
                padding: "0.8rem 2rem",
                color: policySaved ? T.bg : T.g,
                fontFamily: T.mono,
                fontSize: "0.8rem",
                fontWeight: "bold",
                textTransform: "uppercase",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {policySaving
                ? "UPDATING..."
                : policySaved
                  ? "POLICY UPDATED"
                  : "UPDATE POLICY"}
            </button>
          </div>
        </div>
      </SettingSection>

      <SettingSection title="Data Export" icon={Download}>
        <div
          style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          <p
            style={{
              fontFamily: T.mono,
              fontSize: "0.85rem",
              color: T.muted,
              lineHeight: 1.5,
            }}
          >
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            Request an export of all your organization&apos;s data in JSON
            format. The export process may take up to 24 hours depending on the
            size of your dataset. We will email you when it&apos;s ready.
          </p>
          <div style={{ display: "flex", justifyContent: "flex-start" }}>
            <button
              onClick={handleExport}
              style={{
                background: exported ? "rgba(0,255,136,0.15)" : "transparent",
                border: `1px solid ${exported ? T.g : T.muted}`,
                padding: "0.8rem 2rem",
                color: exported ? T.g : T.text,
                fontFamily: T.mono,
                fontSize: "0.8rem",
                fontWeight: "bold",
                textTransform: "uppercase",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.2s",
              }}
            >
              <Download size={14} />
              {exporting
                ? "REQUESTING EXPORT..."
                : exported
                  ? "EXPORT REQUESTED"
                  : "REQUEST DATA EXPORT"}
            </button>
          </div>
        </div>
      </SettingSection>
    </div>
  );
}
