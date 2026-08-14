'use client';

import { 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  AlertCircle, MessageSquare
} from "lucide-react";
import { useState, useEffect } from "react";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  g:       "#00ff88",
  bg:      "#040810",
  bg2:     "#070e1a",
  panel:   "#0a1628",
  border:  "rgba(0,255,136,0.18)",
  muted:   "rgba(0,255,136,0.45)",
  text:    "#c8ffe8",
  glow:    "0 0 20px rgba(0,255,136,0.35),0 0 60px rgba(0,255,136,0.12)",
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        borderColor: T.g, borderStyle:"solid", borderWidth: bw as any, opacity: 0.5,
        top:t==="auto"?undefined:8, left:l==="auto"?undefined:8,
        bottom:b==="auto"?undefined:8, right:r==="auto"?undefined:8,
      }}/>
    ))}
  </>
);

import { fetchApi } from "@/lib/api";

export default function KnowledgeGapsPage() {
  const [gaps, setGaps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGap, setSelectedGap] = useState<any>(null);
  const [answerText, setAnswerText] = useState("");
  const [savingAnswer, setSavingAnswer] = useState(false);

  useEffect(() => {
    fetchApi('/analytics/knowledge-gaps')
      .then(res => {
        setGaps(res.data || res.gaps || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch gaps", err);
        setLoading(false);
      });
  }, []);

  const handleSaveAnswer = async () => {
    setSavingAnswer(true);
    try {
      // In a real app, this would create a text source and mark gap as resolved
      await fetchApi(`/knowledge/v1/sources`, {
        method: 'POST',
        body: JSON.stringify({ type: 'text', title: selectedGap.question, content: answerText })
      });
      // Mock local update
      setGaps(gaps.map(g => g.id === selectedGap.id ? { ...g, status: 'answered' } : g));
      setSelectedGap(null);
      setAnswerText("");
    } catch (err) {
      console.error(err);
    }
    setSavingAnswer(false);
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 1200, margin: "0 auto" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
        <div>
          <h1 style={{ fontFamily: T.display, fontSize: "2.2rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <AlertCircle color={T.warn} size={32} /> Knowledge Gaps
          </h1>
          <p style={{ fontFamily: T.mono, fontSize: "0.9rem", color: T.g, letterSpacing: "0.05em" }}>
            Questions the AI cannot confidently answer with current knowledge.
          </p>
        </div>
      </div>

      <div style={{ background: T.panel, border: `1px solid ${T.border}`, padding: "1.5rem", position: "relative" }}>
        <Corners />
        
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}` }}>
              <th style={{ textAlign: "left", padding: "1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Question</th>
              <th style={{ textAlign: "left", padding: "1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Occurrences</th>
              <th style={{ textAlign: "left", padding: "1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Last Seen</th>
              <th style={{ textAlign: "left", padding: "1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Status</th>
              <th style={{ textAlign: "right", padding: "1rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, letterSpacing: "0.1em", textTransform: "uppercase" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: T.muted, fontFamily: T.mono }}>LOADING...</td></tr>
            ) : gaps.map((gap, i) => (
              <tr key={gap.id} style={{ borderBottom: i === gaps.length - 1 ? "none" : `1px solid rgba(0,255,136,0.1)`, transition: "background 0.2s" }}>
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                {/* eslint-disable-next-line react/no-unescaped-entities */}
                <td style={{ padding: "1rem", fontFamily: T.body, fontSize: "1rem", color: "#fff", fontWeight: 600 }}>"{gap.question}"</td>
                <td style={{ padding: "1rem", fontFamily: T.mono, fontSize: "0.85rem", color: T.text }}>{gap.occurrence_count}</td>
                <td style={{ padding: "1rem", fontFamily: T.mono, fontSize: "0.8rem", color: T.muted }}>{new Date(gap.last_seen_at).toLocaleDateString()}</td>
                <td style={{ padding: "1rem" }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", fontFamily: T.mono, fontSize: "0.7rem", color: gap.status === 'open' ? T.warn : T.g, textTransform: "uppercase", background: gap.status === 'open' ? "rgba(255,170,0,0.1)" : "rgba(0,255,136,0.1)", padding: "0.2rem 0.6rem", border: gap.status === 'open' ? `1px solid rgba(255,170,0,0.3)` : `1px solid ${T.border}` }}>
                    {gap.status}
                  </span>
                </td>
                <td style={{ padding: "1rem", textAlign: "right" }}>
                  {gap.status === 'open' && (
                    <>
                      <button style={{ background: "transparent", border: `1px solid ${T.border}`, color: T.g, fontFamily: T.mono, fontSize: "0.7rem", padding: "0.4rem 0.8rem", cursor: "pointer", marginRight: "0.5rem" }}>DISMISS</button>
                      <button onClick={() => setSelectedGap(gap)} style={{ background: T.g, border: "none", color: T.bg, fontFamily: T.mono, fontSize: "0.7rem", fontWeight: "bold", padding: "0.4rem 0.8rem", cursor: "pointer" }}>WRITE ANSWER</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedGap && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(4,8,16,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ width: 600, background: T.bg2, border: `1px solid ${T.border}`, padding: "2rem", position: "relative", boxShadow: T.glow }}>
            <Corners />
            <h2 style={{ fontFamily: T.display, fontSize: "1.5rem", color: "#fff", marginBottom: "1rem" }}>Write Answer</h2>
            <div style={{ fontFamily: T.body, fontSize: "1rem", color: T.text, marginBottom: "1.5rem", padding: "1rem", background: "rgba(0,255,136,0.05)", borderLeft: `4px solid ${T.g}` }}>
              "{selectedGap.question}"
            </div>
            
            <div style={{ marginBottom: "1.5rem" }}>
              <label style={{ fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, display: "block", marginBottom: "0.5rem", letterSpacing: "0.1em" }}>ANSWER CONTENT (PLAIN TEXT SOURCE)</label>
              <textarea 
                value={answerText}
                onChange={e => setAnswerText(e.target.value)}
                placeholder="Write the official answer here..."
                style={{ width: "100%", height: 150, padding: "1rem", background: T.panel, border: `1px solid ${T.border}`, color: T.text, fontFamily: T.body, fontSize: "0.95rem", outline: "none", resize: "none" }}
              />
            </div>
            
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
              <button onClick={() => { setSelectedGap(null); setAnswerText(""); }} style={{ background: "transparent", border: `1px solid ${T.muted}`, color: T.muted, padding: "0.6rem 1.2rem", fontFamily: T.mono, fontSize: "0.75rem", cursor: "pointer" }}>CANCEL</button>
              <button onClick={handleSaveAnswer} disabled={!answerText.trim() || savingAnswer} style={{ background: T.g, border: "none", color: T.bg, padding: "0.6rem 1.2rem", fontFamily: T.mono, fontSize: "0.75rem", fontWeight: "bold", cursor: !answerText.trim() || savingAnswer ? "not-allowed" : "pointer" }}>
                {savingAnswer ? "SAVING..." : "SAVE & ADD TO KNOWLEDGE"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
