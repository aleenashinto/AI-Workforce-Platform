'use client';

import { 
  GitMerge, Plus, Calendar, Mail, StopCircle, ArrowRight
} from "lucide-react";
import { useState, useEffect } from "react";
import { fetchApi } from "@/lib/api";

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

export default function SequencesPage() {
  const [view, setView] = useState('list'); // 'list' | 'create'
  const [sequences, setSequences] = useState<{id: string, name: string, steps?: unknown[], status: string}[]>([]);
  const [loading, setLoading] = useState(true);

  // New sequence form
  const [name, setName] = useState("");

  const loadSequences = () => {
    setLoading(true);
    fetchApi('/sequences')
      .then(data => {
        setSequences(data?.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch sequences", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSequences();
  }, []);

  const handleCreateSequence = async () => {
    if (!name) return;
    try {
      const steps = [
        { day_offset: 0, label: "Initial Email", template: "AI Generated Email Template", stop_conditions: {} },
        { day_offset: 3, label: "Follow-up Email", template: "AI Generated Email Template", stop_conditions: {} },
        { day_offset: 7, label: "Value Add Email", template: "AI Generated Email Template", stop_conditions: {} },
        { day_offset: 14, label: "Breakup Email", template: "AI Generated Email Template", stop_conditions: {} }
      ];
      await fetchApi('/sequences', {
        method: "POST",
        body: JSON.stringify({ name, steps })
      });
      setView('list');
      loadSequences();
    } catch (error) {
      console.error("Failed to create sequence", error);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      await fetchApi(`/sequences/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus })
      });
      loadSequences();
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 1000, margin: "0 auto" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
        <div>
          <h1 style={{ fontFamily: T.display, fontSize: "2.2rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <GitMerge color={T.g2} size={32} /> Outreach Sequences
          </h1>
          <p style={{ fontFamily: T.mono, fontSize: "0.9rem", color: T.g2, letterSpacing: "0.05em" }}>
            Automated multi-step engagement cadences.
          </p>
        </div>
        {view === 'list' ? (
          <button onClick={() => setView('create')} style={{ 
            background: T.g2, border: "none", padding: "0.8rem 1.5rem", color: T.bg, 
            fontFamily: T.mono, fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase",
            display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", boxShadow: T.glow2,
            clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)"
          }}>
            <Plus size={16} /> Create Sequence
          </button>
        ) : (
          <button onClick={() => setView('list')} style={{ background: "transparent", border: `1px solid ${T.border2}`, color: T.text, padding: "0.6rem 1rem", fontFamily: T.mono, fontSize: "0.8rem", cursor: "pointer" }}>
            Cancel
          </button>
        )}
      </div>

      {view === 'list' && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {loading ? (
             <div style={{ padding: "3rem", textAlign: "center", color: T.muted2, fontFamily: T.mono }}>LOADING_SEQUENCES...</div>
          ) : sequences.length === 0 ? (
             <div style={{ padding: "3rem", textAlign: "center", color: T.muted2, fontFamily: T.mono }}>NO_SEQUENCES_FOUND</div>
          ) : sequences.map((seq) => (
            <div key={seq.id} style={{ background: T.panel, border: `1px solid ${T.border2}`, padding: "1.5rem 2rem", position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.2s", cursor: "pointer" }} onMouseEnter={e=>e.currentTarget.style.boxShadow=T.glow2} onMouseLeave={e=>e.currentTarget.style.boxShadow="none"}>
              <Corners />
              <div>
                <div style={{ fontFamily: T.display, fontSize: "1.2rem", color: "#fff", marginBottom: "0.5rem" }}>{seq.name}</div>
                <div style={{ display: "flex", gap: "1.5rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.muted2 }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><Calendar size={12}/> {seq.steps?.length || 4} Steps</span>
                </div>
              </div>
              <div 
                onClick={(e) => handleToggleStatus(seq.id, seq.status, e)}
                style={{ fontFamily: T.mono, fontSize: "0.75rem", color: seq.status === 'active' ? T.g : (seq.status === 'paused' ? '#ffaa00' : T.g2), background: seq.status === 'active' ? "rgba(0,255,136,0.1)" : (seq.status === 'paused' ? "rgba(255,170,0,0.1)" : "rgba(0,207,255,0.1)"), padding: "0.3rem 0.6rem", border: `1px solid ${seq.status === 'active' ? 'rgba(0,255,136,0.3)' : (seq.status === 'paused' ? 'rgba(255,170,0,0.3)' : 'rgba(0,207,255,0.3)')}`, textTransform: "uppercase" }}
              >
                {seq.status}
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'create' && (
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          
          <div style={{ background: T.panel, border: `1px solid ${T.border2}`, padding: "2rem", position: "relative" }}>
            <Corners />
            <div style={{ marginBottom: "1rem" }}>
              <label style={{ fontFamily:T.mono, fontSize:"0.75rem", color:T.muted2, marginBottom:"0.5rem", display:"block", textTransform:"uppercase" }}>Sequence Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Q4 Inbound Follow-up" style={{ width: "100%", background: "rgba(0,207,255,0.02)", border: `1px solid ${T.border2}`, color: "#fff", fontFamily: T.body, fontSize: "1.1rem", padding: "1rem", outline: "none" }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: "2rem" }}>
            
            {/* Steps Builder */}
            <div style={{ flex: 2, display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ fontFamily: T.mono, fontSize: "0.8rem", color: T.g2, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Steps</div>
              
              {[
                { day: 0, label: "Initial Email" },
                { day: 3, label: "Follow-up Email" },
                { day: 7, label: "Value Add Email" },
                { day: 14, label: "Breakup Email" },
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", gap: "1.5rem" }}>
                  <div style={{ width: 60, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(0,207,255,0.1)", border: `1px solid ${T.border2}`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: T.mono, fontSize: "0.8rem", color: T.g2, zIndex: 2 }}>{i+1}</div>
                    {i !== 3 && <div style={{ width: 2, height: "100%", background: T.border2, marginTop: -5, marginBottom: -5 }} />}
                  </div>
                  <div style={{ flex: 1, background: T.panel, border: `1px solid ${T.border2}`, padding: "1.5rem", position: "relative", marginBottom: i !== 3 ? "1rem" : 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                      <div style={{ fontFamily: T.body, fontSize: "1.1rem", color: "#fff", fontWeight: 600 }}>{step.label}</div>
                      <div style={{ fontFamily: T.mono, fontSize: "0.75rem", color: T.text, background: "rgba(0,207,255,0.05)", padding: "0.3rem 0.6rem", border: `1px solid ${T.border2}` }}>Day {step.day}</div>
                    </div>
                    <div style={{ background: "rgba(0,207,255,0.02)", border: `1px solid ${T.border2}`, padding: "1rem", fontFamily: T.body, fontSize: "0.9rem", color: T.muted2, display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <Mail size={14} /> AI Generated Email Template
                    </div>
                  </div>
                </div>
              ))}

              <button style={{ alignSelf: "flex-start", marginLeft: 75, background: "transparent", border: `1px dashed ${T.g2}`, color: T.g2, fontFamily: T.mono, fontSize: "0.8rem", padding: "0.8rem 1.5rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "1rem" }}>
                <Plus size={14} /> Add Step
              </button>
            </div>

            {/* Stop Conditions */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ fontFamily: T.mono, fontSize: "0.8rem", color: T.g2, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "0.5rem" }}>Stop Conditions</div>
              <div style={{ background: T.panel, border: `1px solid ${T.border2}`, padding: "1.5rem", position: "relative" }}>
                <Corners />
                <p style={{ fontFamily: T.body, fontSize: "0.9rem", color: T.text, marginBottom: "1.5rem" }}>Sequence will automatically pause for a prospect if:</p>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {[
                    "They reply to an email",
                    "A meeting is booked",
                    "They unsubscribe",
                    "Email bounces"
                  ].map((cond, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.8rem", fontFamily: T.mono, fontSize: "0.85rem", color: T.muted2 }}>
                      <StopCircle size={16} color={T.g2} /> {cond}
                    </div>
                  ))}
                </div>
              </div>

              <button onClick={handleCreateSequence} style={{ 
                background: T.g2, border: "none", padding: "1rem", color: T.bg, 
                fontFamily: T.mono, fontSize: "0.9rem", fontWeight: "bold", textTransform: "uppercase",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", cursor: "pointer", boxShadow: T.glow2,
                marginTop: "2rem"
              }}>
                Save Sequence <ArrowRight size={16} />
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
