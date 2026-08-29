import { ReactNode } from "react";
import { ProgressBar } from "./shared";

export default function OnboardingLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div
      style={{ minHeight: "100vh", background: "var(--t-bg)", color: "#c8ffe8" }}
    >
      <ProgressBar />
      <div
        style={{
          paddingTop: "8rem",
          paddingBottom: "4rem",
          display: "flex",
          justifyContent: "center",
        }}
      >
        {children}
      </div>
    </div>
  );
}
