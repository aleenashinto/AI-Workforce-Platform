"use client";
import { MessageSquare } from "lucide-react";
import { T } from "@/lib/theme";

export default function InboxPlaceholder() {
  return (
    <div className="flex-1 flex items-center justify-center h-full bg-[color:var(--t-bg)]">
      <div className="text-center text-[rgba(var(--t-g-rgb), )]">
        <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
        <div className="font-mono text-xs tracking-widest uppercase">
          SELECT_CONVERSATION
        </div>
      </div>
    </div>
  );
}
