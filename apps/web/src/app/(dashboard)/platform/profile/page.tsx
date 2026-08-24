"use client";

import { useState, useRef, useEffect } from "react";
import { User, Camera, Eye, EyeOff } from "lucide-react";
import { useUserContext } from "@/contexts/UserContext";
import { PhoneField } from "@/components/ui/PhoneField";

const T = {
  g: "#00ff88",
  bg: "#040810",
  panel: "#0a1628",
  border: "rgba(0,255,136,0.18)",
  muted: "rgba(0,255,136,0.45)",
  text: "#c8ffe8",
  glow: "0 0 20px rgba(0,255,136,0.35),0 0 60px rgba(0,255,136,0.12)",
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

const Input = ({ label, value, type = "text", onChange, readOnly }: any) => {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  const currentType = isPassword && show ? "text" : type;

  return (
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
      <div style={{ position: "relative" }}>
        <input
          type={currentType}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
          style={{
            width: "100%",
            background: readOnly
              ? "rgba(0,255,136,0.02)"
              : "rgba(0,255,136,0.03)",
            border: `1px solid ${readOnly ? "rgba(0,255,136,0.08)" : T.border}`,
            color: readOnly ? T.muted : T.text,
            fontFamily: T.mono,
            fontSize: "0.85rem",
            padding: "0.8rem",
            outline: "none",
            boxSizing: "border-box",
            cursor: readOnly ? "not-allowed" : "text",
            transition: "border-color 0.2s",
            paddingRight: isPassword ? "2.5rem" : "0.8rem",
          }}
        />
        {isPassword && !readOnly && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            style={{
              position: "absolute",
              right: "0.8rem",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              color: T.g,
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default function ProfilePage() {
  const { user, updateUser } = useUserContext();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States
  const [isEditing, setIsEditing] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Initialize from context on load
  useEffect(() => {
    if (user && !isEditing) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setPhoneNumber(user.phoneNumber || "");
      setJobTitle(user.jobTitle || "");
      setAvatarUrl(user.avatarUrl || "");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }, [user, isEditing]);

  if (!user) return null;
  const initials = fullName
    ? fullName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "?";

  const handleCancel = () => {
    setIsEditing(false);
    setError("");
    setSuccess(false);
    // Reset forms
    setFullName(user.fullName || "");
    setEmail(user.email || "");
    setPhoneNumber(user.phoneNumber || "");
    setJobTitle(user.jobTitle || "");
    setAvatarUrl(user.avatarUrl || "");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Only JPEG and PNG files are allowed.");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Image must be less than 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setAvatarUrl(ev.target.result as string);
        setError(""); // clear previous errors
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setError("");
    setSuccess(false);

    if (!fullName.trim()) {
      setError("Full Name is required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Invalid email format.");
      return;
    }

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setError("New passwords do not match.");
        return;
      }
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(newPassword)) {
        setError(
          "Password must be at least 8 characters long and include an uppercase letter, a lowercase letter, a number, and a special character.",
        );
        return;
      }
    }

    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/profile/update`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            fullName,
            email,
            phoneNumber,
            jobTitle,
            avatarUrl,
            currentPassword,
            newPassword,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setSuccess(true);

      // Update global context
      updateUser({
        fullName: data.user.name,
        email: data.user.email,
        phoneNumber: data.user.phoneNumber,
        jobTitle: data.user.jobTitle,
        avatarUrl: data.user.avatarUrl,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsEditing(false); // Drop out of edit mode on save

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 800, margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          marginBottom: "2.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: T.display,
              fontSize: "2.2rem",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <User color={T.g} size={32} /> Profile
          </h1>
          <p
            style={{
              fontFamily: T.mono,
              fontSize: "0.9rem",
              color: T.g,
              letterSpacing: "0.05em",
            }}
          >
            Manage your personal account details.
          </p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            style={{
              background: "transparent",
              border: `1px solid ${T.g}`,
              padding: "0.6rem 1.5rem",
              color: T.g,
              fontFamily: T.mono,
              fontSize: "0.8rem",
              textTransform: "uppercase",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Edit Profile
          </button>
        )}
      </div>

      {/* Avatar */}
      <div
        style={{
          background: T.panel,
          border: `1px solid ${T.border}`,
          padding: "2rem",
          position: "relative",
          marginBottom: "1.5rem",
        }}
      >
        <Corners />
        <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
          <div style={{ position: "relative" }}>
            <div
              style={{
                width: 96,
                height: 96,
                borderRadius: "50%",
                background: avatarUrl
                  ? `url(${avatarUrl}) center/cover`
                  : "rgba(0,255,136,0.08)",
                border: `2px solid ${T.g}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: T.glow,
                overflow: "hidden",
              }}
            >
              {!avatarUrl && (
                <span
                  style={{
                    fontFamily: T.display,
                    fontSize: "2rem",
                    color: T.g,
                  }}
                >
                  {initials}
                </span>
              )}
            </div>
            {isEditing && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: "absolute",
                    bottom: 0,
                    right: 0,
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: T.g,
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Camera size={14} color={T.bg} />
                </button>
                <input
                  type="file"
                  accept="image/jpeg, image/png"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </>
            )}
          </div>
          <div>
            <div
              style={{
                fontFamily: T.display,
                fontSize: "1.3rem",
                color: "#fff",
                fontWeight: 700,
              }}
            >
              {user.fullName}
            </div>
            <div
              style={{
                fontFamily: T.mono,
                fontSize: "0.8rem",
                color: T.g,
                marginTop: "0.3rem",
              }}
            >
              {user.email}
            </div>
            <div
              style={{
                fontFamily: T.mono,
                fontSize: "0.7rem",
                color: T.muted,
                marginTop: "0.2rem",
                textTransform: "uppercase",
              }}
            >
              {user.roles.join(" · ")}
            </div>
          </div>
        </div>
      </div>

      {/* Personal Info */}
      <div
        style={{
          background: T.panel,
          border: `1px solid ${T.border}`,
          padding: "2rem",
          position: "relative",
          marginBottom: "1.5rem",
        }}
      >
        <Corners />
        <div
          style={{
            fontFamily: T.mono,
            fontSize: "0.7rem",
            color: T.muted,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "1.5rem",
          }}
        >
          Personal Information
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem",
          }}
        >
          <Input
            label="Full Name"
            value={fullName}
            onChange={(e: any) => setFullName(e.target.value)}
            readOnly={!isEditing}
          />
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e: any) => setEmail(e.target.value)}
            readOnly={true}
          />
          <Input
            label="Job Title"
            value={jobTitle}
            onChange={(e: any) => setJobTitle(e.target.value)}
            readOnly={!isEditing}
          />
          <PhoneField
            label="Phone Number"
            value={phoneNumber}
            onChange={(val: string) => setPhoneNumber(val)}
            readOnly={!isEditing}
          />
        </div>
      </div>

      {/* Password - Only shown if editing */}
      {isEditing && (
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
              fontFamily: T.mono,
              fontSize: "0.7rem",
              color: T.muted,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: "1.5rem",
            }}
          >
            Change Password
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
            }}
          >
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e: any) => setCurrentPassword(e.target.value)}
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e: any) => setNewPassword(e.target.value)}
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e: any) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
      )}

      {/* Messages */}
      {error && (
        <div
          style={{
            fontFamily: T.mono,
            fontSize: "0.85rem",
            color: "#ff3355",
            marginBottom: "1rem",
            textAlign: "right",
          }}
        >
          [ERROR] {error}
        </div>
      )}
      {success && (
        <div
          style={{
            fontFamily: T.mono,
            fontSize: "0.85rem",
            color: T.g,
            marginBottom: "1rem",
            textAlign: "right",
          }}
        >
          Profile updated successfully!
        </div>
      )}

      {/* Actions */}
      {isEditing && (
        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}
        >
          <button
            onClick={handleCancel}
            disabled={loading}
            style={{
              background: "transparent",
              border: `1px solid ${T.muted}`,
              padding: "0.8rem 2rem",
              color: T.muted,
              fontFamily: T.mono,
              fontSize: "0.8rem",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              background: loading ? "#00ff8880" : T.g,
              border: "none",
              padding: "0.8rem 2rem",
              color: T.bg,
              fontFamily: T.mono,
              fontSize: "0.8rem",
              fontWeight: "bold",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : T.glow,
              clipPath:
                "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
              transition: "all 0.2s",
            }}
          >
            {loading ? "SAVING..." : "Save Profile"}
          </button>
        </div>
      )}
    </div>
  );
}
