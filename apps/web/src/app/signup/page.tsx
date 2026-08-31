"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";


/* ─────────────────────────────────────────────
   DESIGN TOKENS (Copied from landing page)
───────────────────────────────────────────── */
const T = {
  g: "#00ff88",
  g2: "#00cfff",
  warn: "#ffaa00",
  red: "#ff3355",
  bg: "#040810",
  bg2: "#070e1a",
  panel: "#0a1628",
  border: "rgba(0,255,136,0.18)",
  border2: "rgba(0,207,255,0.18)",
  muted: "rgba(0,255,136,0.45)",
  text: "#c8ffe8",
  glow: "0 0 20px rgba(0,255,136,0.35),0 0 60px rgba(0,255,136,0.12)",
  glow2: "0 0 20px rgba(0,207,255,0.35),0 0 60px rgba(0,207,255,0.12)",
  mono: "'Share Tech Mono', monospace",
  display: "'Orbitron', sans-serif",
  body: "'Rajdhani', sans-serif",
};

/* ─────────────────────────────────────────────
   CORNER BRACKETS
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   FIELD COMPONENT
───────────────────────────────────────────── */
function ModalField({
  id,
  name,
  label,
  type,
  placeholder,
  value,
  onChange,
}: {
  id?: string;
  name?: string;
  label: string;
  type: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || name || label.replace(/\s+/g, "-").toLowerCase();

  const isPassword = type === "password";
  const currentType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div style={{ marginBottom: "1.1rem" }}>
      <label
        htmlFor={inputId}
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
      <div style={{ position: "relative" }}>
        <input
          id={inputId}
          name={name}
          type={currentType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={isPassword ? "new-password" : "off"}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: "100%",
            background: "rgba(0,255,136,0.03)",
            border: `1px solid ${focused ? "rgba(0,255,136,0.5)" : T.border}`,
            boxShadow: focused ? "0 0 0 3px rgba(0,255,136,0.08)" : "none",
            padding: "0.8rem 1rem",
            paddingRight: isPassword ? "2.5rem" : "1rem",
            color: T.text,
            fontFamily: currentType === "password" ? "sans-serif" : T.mono,
            fontSize: "0.85rem",
            outline: "none",
            transition: "all 0.2s",
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "0.8rem",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              color: T.muted,
              cursor: "pointer",
              fontFamily: T.mono,
              fontSize: "0.7rem",
              outline: "none",
            }}
          >
            {showPassword ? "HIDE" : "SHOW"}
          </button>
        )}
      </div>
    </div>
  );
}



/* ─────────────────────────────────────────────
   MAIN PAGE COMPONENT
───────────────────────────────────────────── */
function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const inviteToken = searchParams.get("invite_token");

  const [formData, setFormData] = useState({
    fullName: "",
    workEmail: "",
    companyName: "",
    password: "",
    confirmPassword: "",
    termsAccepted: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Force clear form on mount to defeat browser state restoration
    setFormData({
      fullName: "",
      workEmail: "",
      companyName: "",
      password: "",
      confirmPassword: "",
      termsAccepted: false,
    });

    // Also explicitly reset the form element
    const form = document.getElementById("signup-form") as HTMLFormElement;
    if (form) form.reset();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const focusField = (name: string) => {
      document.getElementById(name)?.focus();
    };

    if (!formData.fullName.trim()) {
      setError("Please enter your full name.");
      focusField("fullName");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.workEmail)) {
      setError("Please enter a valid email address.");
      focusField("workEmail");
      return;
    }

    const passwordComplexityRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (
      !formData.password ||
      !passwordComplexityRegex.test(formData.password)
    ) {
      setError(
        "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.",
      );
      focusField("password");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      focusField("confirmPassword");
      return;
    }
    if (!formData.termsAccepted) {
      setError("Please accept the Terms of Service.");
      focusField("termsAccepted");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include", // Send auth cookie if backend sets it
          body: JSON.stringify({
            fullName: formData.fullName,
            email: formData.workEmail,
            companyName: formData.companyName,
            password: formData.password,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to register account.");
      }

      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }

      if (inviteToken) {
        router.push(`/auth/invite?token=${inviteToken}`);
      } else {
        router.push("/onboarding");
      }
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: T.bg,
        color: T.text,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        position: "relative",
      }}
    >
      {/* Background elements */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage: `linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Auth Card */}
      <div
        style={{
          background: T.panel,
          border: `1px solid ${T.border}`,
          width: "100%",
          maxWidth: 520,
          padding: "2.5rem 3rem",
          position: "relative",
          zIndex: 10,
          boxShadow: `0 0 80px rgba(0,255,136,0.08), 0 0 0 1px rgba(0,255,136,0.06)`,
        }}
      >
        {/* top gradient bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 2,
            background: `linear-gradient(90deg,${T.g},${T.g2})`,
          }}
        />
        <Corners />

        <div
          style={{
            fontFamily: T.mono,
            fontSize: "0.65rem",
            letterSpacing: "0.15em",
            color: T.g,
            marginBottom: "0.5rem",
          }}
        >
          {/* INITIALIZE AGENT */}
        </div>
        <div
          style={{
            fontFamily: T.display,
            fontSize: "1.6rem",
            fontWeight: 700,
            color: "#fff",
            marginBottom: "1.8rem",
          }}
        >
          Create Account
        </div>

        <form id="signup-form" onSubmit={handleRegister} autoComplete="off">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              gap: "1rem",
            }}
          >
            <ModalField
              name="fullName"
              label="Full Name"
              type="text"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
            />
            <ModalField
              name="companyName"
              label="Company Name"
              type="text"
              placeholder="Acme Corp"
              value={formData.companyName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, companyName: e.target.value })
              }
            />
          </div>

          <ModalField
            name="workEmail"
            label="Email Address"
            type="email"
            placeholder="john@example.com"
            value={formData.workEmail}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, workEmail: e.target.value })
            }
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              gap: "1rem",
            }}
          >
            <ModalField
              name="password"
              label="Password"
              type="password"
              placeholder="••••••••••••"
              value={formData.password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
            <ModalField
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="••••••••••••"
              value={formData.confirmPassword}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setFormData({ ...formData, confirmPassword: e.target.value })
              }
            />
          </div>

          <label
            htmlFor="termsAccepted"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.8rem",
              marginTop: "0.5rem",
              marginBottom: "1.5rem",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
              }}
            >
              <input
                id="termsAccepted"
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
                style={{
                  opacity: 0,
                  position: "absolute",
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                  zIndex: 2,
                }}
              />
              <div
                style={{
                  width: 18,
                  height: 18,
                  border: `1px solid ${formData.termsAccepted ? T.g : T.border}`,
                  background: formData.termsAccepted
                    ? "rgba(0,255,136,0.2)"
                    : "rgba(0,255,136,0.03)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
              >
                {formData.termsAccepted && (
                  <span style={{ color: T.g, fontSize: "0.8rem" }}>✓</span>
                )}
              </div>
            </div>
            <span
              style={{
                fontFamily: T.body,
                fontSize: "0.85rem",
                color: T.muted,
              }}
            >
              I agree to the{" "}
              <a href="#" style={{ color: T.g, textDecoration: "none" }}>
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" style={{ color: T.g, textDecoration: "none" }}>
                Privacy Policy
              </a>
            </span>
          </label>

          {error && (
            <div
              style={{
                fontFamily: T.mono,
                fontSize: "0.85rem",
                color: T.red,
                marginBottom: "1.5rem",
                textAlign: "center",
              }}
            >
              [ERROR] {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              fontFamily: T.mono,
              fontSize: "0.85rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: T.bg,
              background: loading ? "rgba(0,255,136,0.5)" : T.g,
              border: "none",
              padding: "1rem",
              cursor: loading ? "not-allowed" : "pointer",
              marginBottom: "1.5rem",
              clipPath:
                "polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)",
              transition: "box-shadow 0.2s, background 0.2s",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.boxShadow = T.glow;
                e.currentTarget.style.background = "#fff";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.boxShadow = "";
                e.currentTarget.style.background = T.g;
              }
            }}
          >
            {loading ? "INITIALIZING..." : "▶ INITIALIZE WORKSPACE"}
          </button>
        </form>


        <div
          style={{
            fontFamily: T.mono,
            fontSize: "0.7rem",
            color: "rgba(200,255,232,0.35)",
            textAlign: "center",
            marginTop: "1.5rem",
          }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            style={{
              color: T.g2,
              textDecoration: "none",
              transition: "text-shadow 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.textShadow = T.glow2)}
            onMouseLeave={(e) => (e.currentTarget.style.textShadow = "")}
          >
            Authenticate here
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        input:-webkit-autofill,
        input:-webkit-autofill:hover, 
        input:-webkit-autofill:focus, 
        input:-webkit-autofill:active{
            -webkit-box-shadow: 0 0 0 30px #0a1628 inset !important;
            -webkit-text-fill-color: #c8ffe8 !important;
            transition: background-color 5000s ease-in-out 0s;
        }
      `,
        }}
      />
      <SignUpContent />
    </Suspense>
  );
}
