'use client';
import { MessageSquare } from "lucide-react";
import { T } from "@/lib/theme";

export default function InboxPlaceholder() {
  return (
    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", background: T.bg, height: "100%" }}>
      <div style={{ textAlign: "center", color: T.muted }}>
        <MessageSquare size={48} style={{ margin: "0 auto 1rem", opacity: 0.2 }} />
        <div style={{ fontFamily: T.mono, fontSize: "0.8rem", letterSpacing: "0.1em" }}>SELECT_CONVERSATION</div>
      </div>
    </div>
  );
}
