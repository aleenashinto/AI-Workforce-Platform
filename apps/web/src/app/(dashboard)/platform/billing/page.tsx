"use client";

import { CreditCard, Check } from "lucide-react";

const T = {
  g: "#00ff88",
  bg: "#040810",
  bg2: "#070e1a",
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
const PlanCard = ({
  name,
  price,
  msg,
  leads,
  seats,
  isCurrent,
  custom,
}: any) => (
  <div
    style={{
      background: isCurrent ? "rgba(0,255,136,0.05)" : T.panel,
      border: `1px solid ${isCurrent ? T.g : T.border}`,
      padding: "2rem",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      boxShadow: isCurrent ? T.glow : "none",
    }}
  >
    {isCurrent && <Corners />}

    <div
      style={{
        fontFamily: T.display,
        fontSize: "1.4rem",
        color: "#fff",
        marginBottom: "1rem",
      }}
    >
      {name}
    </div>
    <div
      style={{
        display: "flex",
        alignItems: "flex-end",
        gap: "0.2rem",
        marginBottom: "2rem",
      }}
    >
      <span
        style={{
          fontFamily: T.mono,
          fontSize: "2rem",
          color: T.g,
          fontWeight: "bold",
          lineHeight: 1,
        }}
      >
        {price}
      </span>
      {!custom && (
        <span
          style={{ fontFamily: T.mono, fontSize: "0.8rem", color: T.muted }}
        >
          /mo
        </span>
      )}
    </div>

    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        marginBottom: "2.5rem",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.8rem",
          fontFamily: T.body,
          fontSize: "0.95rem",
          color: T.text,
        }}
      >
        <Check size={16} color={T.g} /> {msg} Messages
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.8rem",
          fontFamily: T.body,
          fontSize: "0.95rem",
          color: T.text,
        }}
      >
        <Check size={16} color={T.g} /> {leads} Leads Enriched
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.8rem",
          fontFamily: T.body,
          fontSize: "0.95rem",
          color: T.text,
        }}
      >
        <Check size={16} color={T.g} /> {seats} Seats
      </div>
    </div>

    <button
      style={{
        width: "100%",
        background: isCurrent ? T.g : "transparent",
        border: isCurrent ? "none" : `1px solid ${T.border}`,
        color: isCurrent ? T.bg : T.text,
        fontFamily: T.mono,
        fontSize: "0.8rem",
        fontWeight: "bold",
        textTransform: "uppercase",
        padding: "0.8rem",
        cursor: "pointer",
      }}
    >
      {isCurrent ? "Current Plan" : custom ? "Contact Sales" : "Upgrade"}
    </button>
  </div>
);

export default function BillingPage() {
  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2.5rem",
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
            <CreditCard color={T.g} size={32} /> Billing & Plans
          </h1>
          <p
            style={{
              fontFamily: T.mono,
              fontSize: "0.9rem",
              color: T.g,
              letterSpacing: "0.05em",
            }}
          >
            Manage your subscription and billing details.
          </p>
        </div>
        <button
          style={{
            background: "transparent",
            border: `1px solid ${T.border}`,
            color: T.text,
            padding: "0.8rem 1.5rem",
            fontFamily: T.mono,
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          Billing History
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1.5rem",
          marginBottom: "3rem",
        }}
      >
        <PlanCard name="Free" price="$0" msg="100" leads="25" seats="1" />
        <PlanCard
          name="Starter"
          price="$49"
          msg="2,000"
          leads="500"
          seats="3"
        />
        <PlanCard
          name="Growth"
          price="$149"
          msg="10,000"
          leads="3,000"
          seats="10"
          isCurrent={true}
        />
        <PlanCard
          name="Enterprise"
          price="Custom"
          msg="Unlimited"
          leads="Unlimited"
          seats="Unlimited"
          custom={true}
        />
      </div>

      <div
        style={{
          background: T.panel,
          border: `1px solid ${T.border}`,
          padding: "2rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: T.display,
              fontSize: "1.1rem",
              color: "#fff",
              marginBottom: "0.5rem",
            }}
          >
            Payment Method
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              fontFamily: T.mono,
              fontSize: "0.9rem",
              color: T.muted,
            }}
          >
            <span
              style={{
                border: `1px solid ${T.border}`,
                padding: "0.2rem 0.5rem",
                color: T.text,
              }}
            >
              VISA
            </span>{" "}
            ending in 4242 • Expires 12/28
          </div>
        </div>
        <button
          style={{
            background: "transparent",
            border: `1px solid ${T.border}`,
            color: T.text,
            padding: "0.8rem 1.5rem",
            fontFamily: T.mono,
            fontSize: "0.8rem",
            cursor: "pointer",
          }}
        >
          Update Method
        </button>
      </div>
    </div>
  );
}
