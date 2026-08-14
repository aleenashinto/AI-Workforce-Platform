'use client';

import { 
  ChevronLeft, CheckCircle, RefreshCcw, Save, ThumbsDown, ThumbsUp
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";
import { useRouter } from "next/navigation";

const T = {
  g:       "#00ff88",
  g2:      "#00cfff",
  bg:      "#040810",
  bg2:     "#070e1a",
  panel:   "#0a1628",
  border:  "rgba(0,255,136,0.18)",
  border2: "rgba(0,207,255,0.18)",
  muted:   "rgba(0,255,136,0.45)",
  muted2:  "rgba(0,207,255,0.45)",
  text:    "#c8ffe8",
  glow2:   "0 0 20px rgba(0,207,255,0.35),0 0 60px rgba(0,207,255,0.12)",
  mono:    "'Share Tech Mono', monospace",
  display: "'Orbitron', sans-serif",
  body:    "'Rajdhani', sans-serif",
  warn:    "#ffaa00",
  red:     "#ff3355"
};

const Corners = () => (
  <>
    {[["tl","1px 0 0 1px","0","0","auto","auto"],
      ["tr","1px 1px 0 0","0","auto","0","auto"],
      ["bl","0 0 1px 1px","auto","0","auto","0"],
      ["br","0 1px 1px 0","auto","auto","0","0"]].map(([k, bw, t, l, b, r]) => (
      <span key={k} style={{
        position:"absolute", width:14, height:14,
        borderColor: T.g2, borderStyle:"solid", borderWidth: bw as number | string, opacity: 0.5,
        top:t==="auto"?undefined:8, left:l==="auto"?undefined:8,
        bottom:b==="auto"?undefined:8, right:r==="auto"?undefined:8,
      }}/>
    ))}
  </>
);

export default function DraftEditorPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [draft, setDraft] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  useEffect(() => {
    fetchApi(`/drafts/${params.id}`)
      .then(data => {
        setDraft(data?.data);
        setSubject(data?.data?.subject || "");
        setBody(data?.data?.body || "");
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch draft", err);
        setLoading(false);
      });
  }, [params.id]);

  const handleUpdate = async (status?: string) => {
    try {
      const updates: Record<string, string> = { subject, body };
      if (status) updates.status = status;
      await fetchApi(`/drafts/${params.id}`, {
        method: "PATCH",
        body: JSON.stringify(updates)
      });
      if (status === 'approved' || status === 'rejected') {
        router.push("/sales/drafts");
      }
    } catch (error) {
      console.error("Failed to update draft", error);
    }
  };

  if (loading) {
    return <div style={{ padding: "4rem", textAlign: "center", color: T.muted2, fontFamily: T.mono }}>LOADING_DRAFT...</div>;
  }

  if (!draft) {
    return <div style={{ padding: "4rem", textAlign: "center", color: T.muted2, fontFamily: T.mono }}>DRAFT_NOT_FOUND</div>;
  }

  const validationResults = draft.validation_results || {
    length_ok: true, subject_length_ok: true, specific_opener: true, single_cta: true, no_hallucinations: true, personalization_ok: true
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 1400, margin: "0 auto" }}>
      
      <div style={{ marginBottom: "2rem" }}>
        <Link href="/sales/drafts" style={{ color: T.muted2, fontFamily: T.mono, fontSize: "0.8rem", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "1rem" }}>
          <ChevronLeft size={14} /> Back to Drafts
        </Link>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontFamily: T.display, fontSize: "2.2rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>Draft Review</h1>
            <div style={{ fontFamily: T.body, fontSize: "1.1rem", color: T.text }}>
              {draft.lead_id} {/* In real app we'd fetch lead details too */}
            </div>
          </div>
          <div style={{ fontFamily: T.mono, fontSize: "0.8rem", color: draft.status === 'approved' ? T.g : T.warn, border: `1px solid ${draft.status === 'approved' ? T.g : T.warn}40`, background: `${draft.status === 'approved' ? T.g : T.warn}10`, padding: "0.4rem 1rem", textTransform: "uppercase" }}>
            {draft.status}
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "2rem" }}>
        
        {/* Research Context */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <div style={{ background: "rgba(0,207,255,0.03)", border: `1px solid ${T.border2}`, padding: "2rem", position: "relative" }}>
            <Corners />
            <div style={{ fontFamily: T.display, fontSize: "1.1rem", color: "#fff", marginBottom: "1.5rem" }}>Research Context</div>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <div style={{ fontFamily: T.mono, fontSize: "0.7rem", color: T.muted2, marginBottom: "0.5rem", textTransform: "uppercase" }}>Signals Used</div>
              <div style={{ background: T.panel, border: `1px solid ${T.border2}`, padding: "0.8rem", fontFamily: T.body, fontSize: "0.9rem", color: T.text, marginBottom: "0.5rem" }}>🔥 Based on recent activity</div>
            </div>

            <div>
              <div style={{ fontFamily: T.mono, fontSize: "0.7rem", color: T.muted2, marginBottom: "0.5rem", textTransform: "uppercase" }}>Proof Point</div>
              <div style={{ background: T.panel, border: `1px solid ${T.border2}`, padding: "0.8rem", fontFamily: T.body, fontSize: "0.9rem", color: T.text }}>Saves time for teams.</div>
            </div>
          </div>

          {/* Validation Checklist */}
          <div style={{ background: "rgba(0,207,255,0.03)", border: `1px solid ${T.border2}`, padding: "2rem", position: "relative" }}>
            <Corners />
            <div style={{ fontFamily: T.display, fontSize: "1.1rem", color: "#fff", marginBottom: "1.5rem" }}>AI Validation</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
              {[
                { label: "Under 120 words", pass: validationResults.length_ok },
                { label: "Subject under 60 characters", pass: validationResults.subject_length_ok },
                { label: "Specific opener", pass: validationResults.specific_opener },
                { label: "Exactly one CTA", pass: validationResults.single_cta },
                { label: "No unsupported claims", pass: validationResults.no_hallucinations },
                { label: "Personalization verified", pass: validationResults.personalization_ok }
              ].map((rule, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: T.mono, fontSize: "0.8rem", color: rule.pass !== false ? T.g : T.red }}>
                  <CheckCircle size={14} /> {rule.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Editor */}
        <div style={{ background: T.panel, border: `1px solid ${T.border2}`, padding: "2rem", position: "relative", display: "flex", flexDirection: "column" }}>
          <Corners />
          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ fontFamily:T.mono, fontSize:"0.75rem", color:T.muted2, marginBottom:"0.5rem", display:"block", textTransform:"uppercase" }}>Subject Line</label>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)} style={{ width: "100%", background: "rgba(0,207,255,0.02)", border: `1px solid ${T.border2}`, color: "#fff", fontFamily: T.body, fontSize: "1.1rem", padding: "1rem", outline: "none", fontWeight: 600 }} />
          </div>

          <div style={{ flex: 1, marginBottom: "2rem" }}>
            <label style={{ fontFamily:T.mono, fontSize:"0.75rem", color:T.muted2, marginBottom:"0.5rem", display:"block", textTransform:"uppercase" }}>Email Body</label>
            <textarea value={body} onChange={e => setBody(e.target.value)} style={{ width: "100%", height: 300, background: "rgba(0,207,255,0.02)", border: `1px solid ${T.border2}`, color: T.text, fontFamily: T.body, fontSize: "1rem", padding: "1.5rem", outline: "none", resize: "none", lineHeight: 1.6 }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `1px solid ${T.border2}`, paddingTop: "1.5rem" }}>
            <button style={{ background: "transparent", border: `1px solid ${T.border2}`, padding: "0.8rem 1.5rem", color: T.text, fontFamily: T.mono, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", textTransform: "uppercase" }}>
              <RefreshCcw size={14} /> Regenerate
            </button>
            
            <div style={{ display: "flex", gap: "1rem" }}>
              <button onClick={() => handleUpdate()} style={{ background: "transparent", border: `1px solid ${T.border2}`, padding: "0.8rem 1.5rem", color: T.text, fontFamily: T.mono, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", textTransform: "uppercase" }}>
                <Save size={14} /> Save Draft
              </button>
              <button onClick={() => handleUpdate('rejected')} style={{ background: "rgba(255,51,85,0.1)", border: `1px solid rgba(255,51,85,0.5)`, padding: "0.8rem 1.5rem", color: T.red, fontFamily: T.mono, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", textTransform: "uppercase" }}>
                <ThumbsDown size={14} /> Reject
              </button>
              <button onClick={() => handleUpdate('approved')} style={{ background: T.g2, border: "none", padding: "0.8rem 2rem", color: T.bg, fontFamily: T.mono, fontSize: "0.8rem", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", textTransform: "uppercase", boxShadow: T.glow2 }}>
                <ThumbsUp size={14} /> Approve
              </button>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
