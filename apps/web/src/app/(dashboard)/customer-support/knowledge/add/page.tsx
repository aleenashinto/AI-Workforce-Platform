"use client";

import { FileText, Globe, Database, Type, UploadCloud } from "lucide-react";
import { useState, useRef, useEffect, Suspense } from "react";
import Link from "next/link";
import { useUserContext } from "@/contexts/UserContext";
import { API_BASE } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  g: "var(--t-g)",
  bg: "var(--t-bg)",
  bg2: "var(--t-bg2)",
  panel: "var(--t-panel)",
  border: "var(--t-border)",
  muted: "var(--t-muted)",
  text: "var(--t-text)",
  glow: "var(--t-glow)",
  mono: "var(--t-font-mono)",
  display: "var(--t-font-display)",
  body: "var(--t-font-body)",
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

function AddKnowledgeContent() {
  const [activeType, setActiveType] = useState("file");
  const currentOrgId = "00000000-0000-0000-0000-000000000001";
  const router = useRouter();
  const searchParams = useSearchParams();

  // Common State
  const [isImporting, setIsImporting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // File State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Website State
  const [url, setUrl] = useState("");
  const [depth, setDepth] = useState("1");
  const [includePaths, setIncludePaths] = useState("");
  const [excludePaths, setExcludePaths] = useState("");

  // Sitemap State
  const [sitemapUrl, setSitemapUrl] = useState("");

  // Text State
  const [textTitle, setTextTitle] = useState("");
  const [textContent, setTextContent] = useState("");

  useEffect(() => {
    const title = searchParams.get("title");
    if (title) {
      setActiveType("text");
      setTextTitle(title);
    }
  }, [searchParams]);

  const sources = [
    { id: "file", label: "Upload File", icon: FileText },
    { id: "website", label: "Website URL", icon: Globe },
    { id: "sitemap", label: "Sitemap", icon: Database },
    { id: "text", label: "Paste Text", icon: Type },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 50 * 1024 * 1024) {
        setErrorMsg("File size exceeds the 50 MB limit.");
        return;
      }
      setSelectedFile(file);
      setErrorMsg("");
    }
  };

  const submitImport = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    if (!currentOrgId) {
      setErrorMsg("Authentication required.");
      return;
    }

    try {
      setIsImporting(true);
      let payload: any = { org_id: currentOrgId, type: activeType };

      if (activeType === "file") {
        if (!selectedFile) {
          throw new Error("Please select a file.");
        }
        payload.name = selectedFile.name;
        payload.config = {
          filename: selectedFile.name,
          contentType: selectedFile.type || "application/octet-stream",
        };
      } else if (activeType === "website") {
        if (!url) throw new Error("URL is required.");
        try {
          new URL(url);
        } catch {
          throw new Error("Invalid URL format.");
        }
        payload.name = url;
        payload.config = {
          url,
          depth: parseInt(depth, 10),
          includePaths,
          excludePaths,
        };
      } else if (activeType === "sitemap") {
        if (!sitemapUrl) throw new Error("Sitemap URL is required.");
        try {
          new URL(sitemapUrl);
        } catch {
          throw new Error("Invalid URL format.");
        }
        payload.name = sitemapUrl;
        payload.config = { url: sitemapUrl };
      } else if (activeType === "text") {
        if (!textTitle.trim() || !textContent.trim())
          throw new Error("Title and Content are required.");
        payload.name = textTitle.trim();
        payload.config = { text: textContent.trim() };
      }

      // 1. Create source
      const res = await fetch(`${API_BASE}/knowledge/sources`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to create knowledge source.");
      const data = await res.json();

      // 2. Handle File Upload if type is file
      if (activeType === "file") {
        const uploadUrl = data.uploadUrl;
        if (!uploadUrl) throw new Error("Did not receive upload URL.");

        const base64Data = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(selectedFile!);
          reader.onload = () => {
            const resultStr = reader.result as string;
            const base64 = resultStr.split(",")[1];
            resolve(base64);
          };
          reader.onerror = (error) => reject(error);
        });

        const uploadRes = await fetch(`${API_BASE}/knowledge/sources/proxy-upload`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uploadUrl,
            contentType: selectedFile!.type || "application/octet-stream",
            base64Data,
          }),
        });

        if (!uploadRes.ok) throw new Error("Failed to upload file to storage via proxy.");

        const confirmRes = await fetch(
          `${API_BASE}/knowledge/sources/confirm-upload`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ source_id: data.source.id }),
          },
        );
        if (!confirmRes.ok) throw new Error("Failed to confirm file upload.");
      }

      setSuccessMsg("Knowledge source added successfully.");
      setSelectedFile(null);
      setUrl("");
      setSitemapUrl("");
      setTextTitle("");
      setTextContent("");
    } catch (err: any) {
      setErrorMsg(err.message || "An error occurred.");
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 1000, margin: "0 auto" }}>
      <div style={{ marginBottom: "2.5rem" }}>
        <h1
          style={{
            fontFamily: T.display,
            fontSize: "2.2rem",
            fontWeight: 700,
            color: "var(--t-heading)",
            marginBottom: "0.5rem",
          }}
        >
          Add Knowledge Source
        </h1>
        <p
          style={{
            fontFamily: T.mono,
            fontSize: "0.9rem",
            color: T.g,
            letterSpacing: "0.05em",
          }}
        >
          <Link
            href="/customer-support/knowledge"
            style={{ color: T.muted, textDecoration: "none" }}
          >
            Knowledge
          </Link>{" "}
          <span style={{ color: T.muted }}>/</span> Add Source
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "1rem",
          marginBottom: "2.5rem",
        }}
      >
        {sources.map((s) => (
          <div
            key={s.id}
            onClick={() => {
              setActiveType(s.id);
              setErrorMsg("");
              setSuccessMsg("");
            }}
            style={{
              background: activeType === s.id ? "rgba(0,255,136,0.1)" : T.panel,
              border: `1px solid ${activeType === s.id ? T.g : T.border}`,
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1rem",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: activeType === s.id ? T.glow : "none",
            }}
          >
            <s.icon size={24} color={activeType === s.id ? T.g : T.muted} />
            <span
              style={{
                fontFamily: T.mono,
                fontSize: "0.8rem",
                color: activeType === s.id ? "var(--t-heading)" : T.muted,
                textTransform: "uppercase",
              }}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      <div
        style={{
          background: T.panel,
          borderRadius: "var(--t-radius)",
          border: `1px solid ${T.border}`,
          padding: "2rem",
          position: "relative",
        }}
      >
        <Corners className="corners" />

        {activeType === "file" && (
          <div>
            <div
              style={{
                fontFamily: T.mono,
                fontSize: "0.8rem",
                color: T.g,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "1.5rem",
              }}
            >
              {"// File Upload"}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              style={{ display: "none" }}
              accept=".pdf,.docx,.txt,.md,.csv,.html"
              onChange={handleFileChange}
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              style={{
                border: `2px dashed ${T.border}`,
                background: "rgba(0,255,136,0.02)",
                padding: "3rem 2rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "1rem",
                cursor: "pointer",
              }}
            >
              <UploadCloud size={48} color={T.muted} />
              <div
                style={{
                  fontFamily: T.body,
                  fontSize: "1.1rem",
                  color: "var(--t-heading)",
                }}
              >
                {selectedFile
                  ? selectedFile.name
                  : "Drag and drop or click to upload"}
              </div>
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: "0.75rem",
                  color: T.muted,
                }}
              >
                {selectedFile
                  ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                  : "Supports PDF, DOCX, TXT, MD, CSV, HTML (Max 50MB)"}
              </div>
            </div>
          </div>
        )}

        {activeType === "website" && (
          <div>
            <div
              style={{
                fontFamily: T.mono,
                fontSize: "0.8rem",
                color: T.g,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "1.5rem",
              }}
            >
              {"// Website Crawl"}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div>
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
                  URL
                </label>
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://example.com"
                  style={{
                    width: "100%",
                    background: "rgba(0,255,136,0.03)",
                    border: `1px solid ${T.border}`,
                    color: T.text,
                    fontFamily: T.mono,
                    fontSize: "0.82rem",
                    padding: "0.7rem 1rem",
                    outline: "none",
                  }}
                />
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1.5rem",
                }}
              >
                <div>
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
                    Crawl Depth
                  </label>
                  <select
                    value={depth}
                    onChange={(e) => setDepth(e.target.value)}
                    style={{
                      width: "100%",
                      background: "rgba(0,255,136,0.03)",
                      border: `1px solid ${T.border}`,
                      color: T.text,
                      fontFamily: T.mono,
                      fontSize: "0.82rem",
                      padding: "0.7rem 1rem",
                      outline: "none",
                      appearance: "none",
                    }}
                  >
                    <option value="1">1 (Single Page)</option>
                    <option value="2">2 (Subpages)</option>
                    <option value="3">3 (Deep)</option>
                  </select>
                </div>
                <div />
              </div>
              <div>
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
                  Include Paths (Optional)
                </label>
                <input
                  type="text"
                  value={includePaths}
                  onChange={(e) => setIncludePaths(e.target.value)}
                  placeholder="/docs/*, /blog/*"
                  style={{
                    width: "100%",
                    background: "rgba(0,255,136,0.03)",
                    border: `1px solid ${T.border}`,
                    color: T.text,
                    fontFamily: T.mono,
                    fontSize: "0.82rem",
                    padding: "0.7rem 1rem",
                    outline: "none",
                  }}
                />
              </div>
              <div>
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
                  Exclude Paths (Optional)
                </label>
                <input
                  type="text"
                  value={excludePaths}
                  onChange={(e) => setExcludePaths(e.target.value)}
                  placeholder="/login, /cart"
                  style={{
                    width: "100%",
                    background: "rgba(0,255,136,0.03)",
                    border: `1px solid ${T.border}`,
                    color: T.text,
                    fontFamily: T.mono,
                    fontSize: "0.82rem",
                    padding: "0.7rem 1rem",
                    outline: "none",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {activeType === "sitemap" && (
          <div>
            <div
              style={{
                fontFamily: T.mono,
                fontSize: "0.8rem",
                color: T.g,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "1.5rem",
              }}
            >
              {"// Sitemap Crawl"}
            </div>
            <div>
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
                SITEMAP URL
              </label>
              <input
                type="text"
                value={sitemapUrl}
                onChange={(e) => setSitemapUrl(e.target.value)}
                placeholder="https://example.com/sitemap.xml"
                style={{
                  width: "100%",
                  background: "rgba(0,255,136,0.03)",
                  border: `1px solid ${T.border}`,
                  color: T.text,
                  fontFamily: T.mono,
                  fontSize: "0.82rem",
                  padding: "0.7rem 1rem",
                  outline: "none",
                }}
              />
            </div>
          </div>
        )}

        {activeType === "text" && (
          <div>
            <div
              style={{
                fontFamily: T.mono,
                fontSize: "0.8rem",
                color: T.g,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "1.5rem",
              }}
            >
              {"// Plain Text Import"}
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div>
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
                  TITLE
                </label>
                <input
                  type="text"
                  value={textTitle}
                  onChange={(e) => setTextTitle(e.target.value)}
                  placeholder="e.g. Return Policy"
                  style={{
                    width: "100%",
                    background: "rgba(0,255,136,0.03)",
                    border: `1px solid ${T.border}`,
                    color: T.text,
                    fontFamily: T.mono,
                    fontSize: "0.82rem",
                    padding: "0.7rem 1rem",
                    outline: "none",
                  }}
                />
              </div>
              <div>
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
                  CONTENT
                </label>
                <textarea
                  value={textContent}
                  onChange={(e) => setTextContent(e.target.value)}
                  placeholder="Paste your text content here..."
                  style={{
                    width: "100%",
                    height: 200,
                    background: "rgba(0,255,136,0.03)",
                    border: `1px solid ${T.border}`,
                    color: T.text,
                    fontFamily: T.body,
                    fontSize: "0.95rem",
                    padding: "0.7rem 1rem",
                    outline: "none",
                    resize: "vertical",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div
            style={{
              marginTop: "1rem",
              color: "#ff4444",
              fontFamily: T.mono,
              fontSize: "0.85rem",
            }}
          >
            ⚠ {errorMsg}
          </div>
        )}
        {successMsg && (
          <div
            style={{
              marginTop: "1rem",
              color: T.g,
              fontFamily: T.mono,
              fontSize: "0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            ✓ {successMsg}
            <button
              onClick={() => router.push("/customer-support/knowledge")}
              style={{
                background: "transparent",
                border: `1px solid ${T.g}`,
                color: T.g,
                padding: "0.3rem 0.8rem",
                cursor: "pointer",
                fontFamily: T.mono,
                fontSize: "0.75rem",
              }}
            >
              View Knowledge Base
            </button>
          </div>
        )}

        <div
          style={{
            marginTop: "2rem",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <button
            onClick={submitImport}
            disabled={isImporting}
            style={{
              background: T.g,
              border: "none",
              padding: "0.8rem 2rem",
              color: T.bg,
              fontFamily: T.mono,
              fontSize: "0.8rem",
              fontWeight: "bold",
              textTransform: "uppercase",
              cursor: isImporting ? "not-allowed" : "pointer",
              boxShadow: isImporting ? "none" : T.glow,
              clipPath:
                "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
              opacity: isImporting ? 0.7 : 1,
            }}
          >
            {isImporting ? "IMPORTING..." : "START IMPORT ▶"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AddKnowledgePage() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            padding: "2rem",
            color: "#00ff88",
            fontFamily: '"Share Tech Mono", monospace',
          }}
        >
          Loading...
        </div>
      }
    >
      <AddKnowledgeContent />
    </Suspense>
  );
}
