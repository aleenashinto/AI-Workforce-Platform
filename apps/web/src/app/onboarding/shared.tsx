"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export const T = {
  g: "var(--t-g)",
  g2: "var(--t-g2)",
  warn: "var(--t-warn)",
  red: "var(--t-red)",
  bg: "var(--t-bg)",
  bg2: "var(--t-bg2)",
  panel: "var(--t-panel)",
  border: "var(--t-border)",
  border2: "var(--t-border2)",
  muted: "var(--t-muted)",
  text: "var(--t-text)",
  glow: "var(--t-glow)",
  glow2: "var(--t-glow2)",
  mono: "var(--t-font-mono)",
  display: "var(--t-font-display)",
  body: "var(--t-font-body)",
};

export const Corners = () => (
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
          borderColor: T.g,
          borderStyle: "solid",
          borderWidth: bw as string | number,
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

export function ModalField({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  selectOptions,
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  selectOptions?: { label: string; value: string }[];
}) {
  const [focused, setFocused] = useState(false);
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
      {selectOptions ? (
        <select
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            background: "rgba(0,255,136,0.03)",
            border: `1px solid ${focused ? "rgba(0,255,136,0.5)" : T.border}`,
            boxShadow: focused ? "0 0 0 3px rgba(0,255,136,0.08)" : "none",
            color: T.text,
            fontFamily: T.mono,
            fontSize: "0.82rem",
            padding: "0.7rem 1rem",
            outline: "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
            appearance: "none",
          }}
        >
          {selectOptions.map((o: { label: string; value: string }) => (
            <option
              key={o.value}
              value={o.value}
              style={{ background: T.bg, color: T.text }}
            >
              {o.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            background: "rgba(0,255,136,0.03)",
            border: `1px solid ${focused ? "rgba(0,255,136,0.5)" : T.border}`,
            boxShadow: focused ? "0 0 0 3px rgba(0,255,136,0.08)" : "none",
            color: T.text,
            fontFamily: T.mono,
            fontSize: "0.82rem",
            padding: "0.7rem 1rem",
            outline: "none",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
        />
      )}
    </div>
  );
}

export function ActionBtn({
  children,
  filled,
  onClick,
  asLink,
  href,
  style,
}: {
  children: React.ReactNode;
  filled?: boolean;
  onClick?: () => void;
  asLink?: boolean;
  href?: string;
  style?: React.CSSProperties;
}) {
  const [hov, setHov] = useState(false);

  const btnStyle = {
    fontFamily: T.mono,
    fontSize: "0.82rem",
    letterSpacing: "0.1em",
    textTransform: "uppercase" as const,
    color: filled ? T.bg : T.g2,
    background: filled ? T.g : "transparent",
    border: filled ? "none" : `1px solid ${T.border2}`,
    padding: "0.85rem 1.5rem",
    cursor: "pointer",
    clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
    transition: "all 0.2s",
    display: "inline-block",
    textDecoration: "none",
    textAlign: "center" as const,
    boxShadow: hov && filled ? T.glow : hov && !filled ? T.glow2 : "none",
    ...style,
  };

  const handleEnter = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => {
    setHov(true);
    if (filled) {
      (e.currentTarget as HTMLElement).style.background = "var(--t-heading)";
    } else {
      (e.currentTarget as HTMLElement).style.borderColor = T.g2;
      (e.currentTarget as HTMLElement).style.background =
        "rgba(0,207,255,0.07)";
    }
  };
  const handleLeave = (
    e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
  ) => {
    setHov(false);
    if (filled) {
      (e.currentTarget as HTMLElement).style.background = T.g;
    } else {
      (e.currentTarget as HTMLElement).style.borderColor = T.border2;
      (e.currentTarget as HTMLElement).style.background = "transparent";
    }
  };

  if (asLink) {
    return (
      <Link
        href={href || "#"}
        style={btnStyle}
        onMouseEnter={handleEnter}
        onMouseLeave={handleLeave}
      >
        {children}
      </Link>
    );
  }
  return (
    <button
      onClick={onClick}
      style={btnStyle}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {children}
    </button>
  );
}

export function ProgressBar() {
  const path = usePathname();
  let step = 1;
  if (path === "/onboarding/profile") step = 1;
  if (path === "/onboarding/workspace") step = 2;
  if (path === "/onboarding/complete") step = 3;

  const pct = (step / 3) * 100;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: T.bg2,
        borderBottom: `1px solid ${T.border}`,
        padding: "1rem",
      }}
    >
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          gap: "1.5rem",
        }}
      >
        <div
          style={{
            fontFamily: T.display,
            fontSize: "1.1rem",
            fontWeight: 700,
            color: T.g,
            letterSpacing: "0.1em",
            textShadow: T.glow,
          }}
        >
          AI<span style={{ color: T.g2, textShadow: T.glow2 }}>PM</span>
        </div>
        <div
          style={{
            flex: 1,
            height: 4,
            background: "rgba(0,255,136,0.1)",
            borderRadius: 2,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              bottom: 0,
              width: `${pct}%`,
              background: `linear-gradient(90deg,${T.g2},${T.g})`,
              transition: "width 0.4s ease",
              boxShadow: T.glow,
            }}
          />
        </div>
        <div
          style={{
            fontFamily: T.mono,
            fontSize: "0.7rem",
            color: T.g,
            letterSpacing: "0.15em",
          }}
        >
          STEP {step}/3
        </div>
      </div>
    </div>
  );
}
