"use client";

import React, { useState, useEffect } from "react";

const T = {
  g: "var(--t-g)",
  border: "var(--t-border)",
  muted: "var(--t-muted)",
  text: "var(--t-text)",
  bg: "var(--t-bg)",
  mono: "'Share Tech Mono', monospace",
};

const COUNTRY_CODES = [
  { code: "+1", label: "US/CA (+1)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+91", label: "IN (+91)" },
  { code: "+61", label: "AU (+61)" },
  { code: "+49", label: "DE (+49)" },
  { code: "+33", label: "FR (+33)" },
  { code: "+81", label: "JP (+81)" },
  { code: "+86", label: "CN (+86)" },
  { code: "+55", label: "BR (+55)" },
  { code: "+52", label: "MX (+52)" },
];

export function PhoneField({
  label,
  value,
  onChange,
  readOnly = false,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  readOnly?: boolean;
}) {
  const [focused, setFocused] = useState(false);

  // Parse incoming value "+919876543210" into code and number
  const [countryCode, setCountryCode] = useState("+1");
  const [number, setNumber] = useState("");

  useEffect(() => {
    if (!value) return;
    const sortedCodes = [...COUNTRY_CODES].sort(
      (a, b) => b.code.length - a.code.length,
    );
    const match = sortedCodes.find((c) => value.startsWith(c.code));
    if (match) {
      setCountryCode(match.code);
      setNumber(value.slice(match.code.length));
    } else {
      // fallback
      setNumber(value);
    }
  }, [value]);

  const handleCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (readOnly) return;
    const newCode = e.target.value;
    setCountryCode(newCode);
    onChange(newCode + number);
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (readOnly) return;
    // Allow only digits
    let val = e.target.value.replace(/\D/g, "");

    // Max 15 digits total (E.164)
    const codeLen = countryCode.replace(/\D/g, "").length; // length of digits in code
    if (codeLen + val.length > 15) {
      val = val.slice(0, 15 - codeLen);
    }

    setNumber(val);
    onChange(countryCode + val);
  };

  return (
    <div style={{ marginBottom: "1.1rem" }}>
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

      <div
        style={{
          display: "flex",
          background: "rgba(0,255,136,0.03)",
          border: `1px solid ${focused ? "rgba(0,255,136,0.5)" : T.border}`,
          boxShadow: focused ? "0 0 0 3px rgba(0,255,136,0.08)" : "none",
          transition: "border-color 0.2s, box-shadow 0.2s",
          alignItems: "center",
        }}
      >
        <select
          value={countryCode}
          onChange={handleCodeChange}
          disabled={readOnly}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            background: "transparent",
            color: T.g,
            fontFamily: T.mono,
            fontSize: "0.82rem",
            padding: "0.7rem 0.5rem 0.7rem 1rem",
            border: "none",
            borderRight: `1px dashed ${T.border}`,
            outline: "none",
            cursor: readOnly ? "default" : "pointer",
            appearance: "none", // Will hide the default arrow so we can render our own or just keep it simple
            width: "90px",
          }}
        >
          {COUNTRY_CODES.map((c) => (
            <option
              key={c.code}
              value={c.code}
              style={{ background: T.bg, color: T.text }}
            >
              {c.code} ▼
            </option>
          ))}
        </select>

        <input
          type="tel"
          placeholder="9876543210"
          value={number}
          onChange={handleNumberChange}
          readOnly={readOnly}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            flex: 1,
            background: "transparent",
            color: T.text,
            fontFamily: T.mono,
            fontSize: "0.82rem",
            padding: "0.7rem 1rem",
            border: "none",
            outline: "none",
          }}
        />
      </div>
    </div>
  );
}
