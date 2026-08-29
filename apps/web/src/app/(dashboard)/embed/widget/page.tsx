"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, CheckCircle2 } from "lucide-react";

export default function WidgetConfigPage() {
  const [color, setColor] = useState("#4F46E5");
  const [position, setPosition] = useState("bottom-right");
  const [greeting, setGreeting] = useState(
    "Hi there! How can I help you today?",
  );
  const [copied, setCopied] = useState(false);

  const snippet = `<script 
  src="https://your-domain.com/widget.js" 
  data-org-id="org_123"
  data-color="${color}" 
  data-position="${position}" 
  data-greeting="${greeting}"
></script>`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Widget Configuration
        </h1>
        <p className="text-[color:var(--t-text)] mt-1">
          Customize and install the chat widget on your website.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="bg-[#2A2A3C] border-[#3F3F5A] text-white">
            <CardHeader>
              <CardTitle>Appearance & Behavior</CardTitle>
              <CardDescription className="text-[color:var(--t-text)]">
                Match the widget to your brand.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Brand Color</label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-12 p-1 bg-[#1E1E2E] border-[#3F3F5A]"
                  />
                  <Input
                    type="text"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="bg-[#1E1E2E] border-[#3F3F5A]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Position</label>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={position === "bottom-left" ? "default" : "outline"}
                    className={
                      position === "bottom-left"
                        ? "bg-indigo-600 hover:bg-indigo-700"
                        : "border-[#3F3F5A] hover:bg-[#3F3F5A]"
                    }
                    onClick={() => setPosition("bottom-left")}
                  >
                    Bottom Left
                  </Button>
                  <Button
                    variant={
                      position === "bottom-right" ? "default" : "outline"
                    }
                    className={
                      position === "bottom-right"
                        ? "bg-indigo-600 hover:bg-indigo-700"
                        : "border-[#3F3F5A] hover:bg-[#3F3F5A]"
                    }
                    onClick={() => setPosition("bottom-right")}
                  >
                    Bottom Right
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Initial Greeting</label>
                <Input
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  className="bg-[#1E1E2E] border-[#3F3F5A]"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#2A2A3C] border-[#3F3F5A] text-white">
            <CardHeader>
              <CardTitle>Installation Snippet</CardTitle>
              <CardDescription className="text-[color:var(--t-text)]">
                Paste this before the closing &lt;/body&gt; tag.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <pre className="bg-[#1E1E2E] p-4 rounded-md text-sm text-indigo-300 overflow-x-auto border border-[#3F3F5A]">
                  {snippet}
                </pre>
                <Button
                  size="sm"
                  variant="secondary"
                  className="absolute top-2 right-2 bg-[#3F3F5A] hover:bg-gray-600 text-white"
                  onClick={copyToClipboard}
                >
                  {copied ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-[#2A2A3C] border-[#3F3F5A] text-white h-full min-h-[500px] relative overflow-hidden flex flex-col">
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
              <CardDescription className="text-[color:var(--t-text)]">
                Interact with your configured widget.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 bg-[#1E1E2E] m-4 mt-0 rounded-lg border border-[#3F3F5A] relative">
              {/* Fake Website Content */}
              <div className="p-8 opacity-20 pointer-events-none select-none">
                <div className="h-8 bg-gray-500 w-1/3 rounded mb-4"></div>
                <div className="h-4 bg-gray-500 w-3/4 rounded mb-2"></div>
                <div className="h-4 bg-gray-500 w-1/2 rounded mb-8"></div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-24 bg-gray-500 rounded"></div>
                  <div className="h-24 bg-gray-500 rounded"></div>
                  <div className="h-24 bg-gray-500 rounded"></div>
                </div>
              </div>

              {/* Widget Preview Overlay */}
              <div className="absolute inset-0 z-10 pointer-events-none">
                {/* We can inject the actual compiled widget script here, but for safety in Next.js, we mock the UI */}
                <div
                  className="absolute bottom-6 right-6 w-[60px] h-[60px] rounded-full flex items-center justify-center shadow-lg pointer-events-auto"
                  style={{
                    backgroundColor: color,
                    [position === "bottom-left" ? "left" : "right"]: "24px",
                    right: position === "bottom-right" ? "24px" : "auto",
                  }}
                >
                  <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
