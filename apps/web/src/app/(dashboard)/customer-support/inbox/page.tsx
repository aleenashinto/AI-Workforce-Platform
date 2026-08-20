'use client';
import { MessageSquare } from "lucide-react";
import { T } from "@/lib/theme";

export default function InboxPlaceholder() {
  return (
    <div className="flex-1 flex items-center justify-center h-full bg-[#040810]">
      <div className="text-center text-[rgba(0,255,136,0.45)]">
        <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
        <div className="font-mono text-xs tracking-widest uppercase">SELECT_CONVERSATION</div>
      </div>
    </div>
  );
}
