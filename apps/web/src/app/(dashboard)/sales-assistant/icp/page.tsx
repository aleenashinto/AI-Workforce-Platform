"use client";

import { useState, useEffect } from "react";
import { T } from "@/lib/theme";

export default function ICPBuilder() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [icps, setIcps] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Form State
  const [url, setUrl] = useState("");
  const [domains, setDomains] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<Record<string, any> | null>(null);

  useEffect(() => {
    fetch('/api/v1/icps')
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setIcps(data.data);
        }
        setLoading(false);
      });
  }, []);

  const generateICP = async () => {
    setGenerating(true);
    setResult(null);
    try {
      const res = await fetch('/api/v1/icps/generate', { credentials: "include",
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          customerDomains: domains.split(',').map(d => d.trim())
        })
      });
      const data = await res.json();
      setResult(data.data);
    } catch (e) {
      console.error(e);
    }
    setGenerating(false);
  };

  const saveICP = async () => {
    if (!result) return;
    try {
      const res = await fetch('/api/v1/icps', { credentials: "include",
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: `ICP for ${url}`,
          ...result
        })
      });
      const data = await res.json();
      setIcps([...icps, data.data]);
      setResult(null);
      setUrl("");
      setDomains("");
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontFamily: T.display, fontSize: "2rem", margin: 0 }}>Ideal Customer Profiles</h1>
          <p style={{ fontFamily: T.mono, color: T.muted }}>Manage and generate your target ICPs for discovery.</p>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
        <div style={{ background: T.panel, border: `1px solid ${T.border}`, padding: "1.5rem", borderRadius: "8px" }}>
          <h2 style={{ fontFamily: T.display, fontSize: "1.2rem", marginTop: 0, color: T.g }}>AI-Assisted Builder</h2>
          <p style={{ fontFamily: T.body, color: "#aaa" }}>Enter your website and top 3 customer domains to let the Deep model propose an ICP.</p>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1.5rem" }}>
            <input 
              placeholder="Your Website URL (e.g., https://acme.com)"
              value={url} onChange={e => setUrl(e.target.value)}
              style={{ background: T.bg, border: `1px solid ${T.border}`, color: "#fff", padding: "0.8rem", borderRadius: "4px", fontFamily: T.body }}
            />
            <input 
              placeholder="Customer Domains (comma separated)"
              value={domains} onChange={e => setDomains(e.target.value)}
              style={{ background: T.bg, border: `1px solid ${T.border}`, color: "#fff", padding: "0.8rem", borderRadius: "4px", fontFamily: T.body }}
            />
            <button 
              onClick={generateICP}
              disabled={generating}
              style={{ background: "rgba(0,255,136,0.1)", border: `1px solid ${T.g}`, color: T.g, padding: "0.8rem", cursor: "pointer", fontFamily: T.mono, borderRadius: "4px" }}
            >
              {generating ? "ANALYZING..." : "GENERATE ICP"}
            </button>
          </div>
        </div>

        {result && (
          <div style={{ background: T.panel, border: `1px solid ${T.border}`, padding: "1.5rem", borderRadius: "8px" }}>
            <h2 style={{ fontFamily: T.display, fontSize: "1.2rem", marginTop: 0, color: T.g }}>Generated Profile</h2>
            <div style={{ fontFamily: T.mono, fontSize: "0.85rem", color: "#ccc", whiteSpace: "pre-wrap", background: T.bg, padding: "1rem", borderRadius: "4px" }}>
              {JSON.stringify(result, null, 2)}
            </div>
            <button 
              onClick={saveICP}
              style={{ background: T.g, color: "#000", border: "none", padding: "0.8rem 1.5rem", marginTop: "1rem", cursor: "pointer", fontFamily: T.mono, fontWeight: "bold", borderRadius: "4px", width: "100%" }}
            >
              SAVE PROFILE
            </button>
          </div>
        )}
      </div>

      <div>
        <h2 style={{ fontFamily: T.display, fontSize: "1.5rem" }}>Saved ICPs</h2>
        {loading ? (
          <div style={{ color: T.muted }}>Loading...</div>
        ) : icps.length === 0 ? (
          <div style={{ color: T.muted }}>No ICPs defined yet.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {icps.map(icp => (
              <div key={icp.id} style={{ background: T.panel, border: `1px solid ${T.border}`, padding: "1.5rem", borderRadius: "8px" }}>
                <h3 style={{ margin: "0 0 1rem 0", color: "#fff" }}>{icp.name}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontFamily: T.mono, fontSize: "0.85rem", color: "#aaa" }}>
                  <div><strong>Industries:</strong> {icp.criteria?.industries?.join(', ')}</div>
                  <div><strong>Target Titles:</strong> {icp.criteria?.targetTitles?.join(', ')}</div>
                  <div style={{ gridColumn: "span 2" }}><strong>Value Prop:</strong> {icp.criteria?.valueProp}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
