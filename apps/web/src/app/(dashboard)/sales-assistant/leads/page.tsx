"use client";

import { useState, useEffect } from "react";
import { T } from "@/lib/theme";

export default function LeadsQueue() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch('/api/v1/leads')
      .then(res => res.json())
      .then(data => {
        if (data.data) {
          setLeads(data.data);
        }
        setLoading(false);
      });
  }, []);

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedLeads);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedLeads(newSet);
  };

  const handleBulkAction = async (action: 'approve' | 'reject' | 'suppress') => {
    try {
      await fetch('/api/v1/leads/bulk-action', { credentials: "include",
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, leadIds: Array.from(selectedLeads) })
      });
      // Refresh
      const res = await fetch('/api/v1/leads');
      const data = await res.json();
      if (data.data) setLeads(data.data);
      setSelectedLeads(new Set());
    } catch (e) {
      console.error(e);
    }
  };

  const exportCSV = () => {
    const headers = ["Name,Email,Company,Status,Score"];
    const rows = leads.map(l => `"${l.name}","${l.email}","${l.company}","${l.status}","${l.score}"`);
    const csvContent = "data:text/csv;charset=utf-8," + headers.concat(rows).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "leads_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontFamily: T.display, fontSize: "2rem", margin: 0 }}>Lead Review Queue</h1>
          <p style={{ fontFamily: T.mono, color: T.muted }}>Review discovered leads, scores, and AI research briefs.</p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button 
            onClick={exportCSV}
            style={{ background: "transparent", border: `1px solid ${T.border}`, color: "#fff", padding: "0.5rem 1rem", cursor: "pointer", fontFamily: T.mono }}
          >
            EXPORT CSV
          </button>
        </div>
      </div>

      <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: "8px", overflow: "hidden" }}>
        <div style={{ padding: "1rem", borderBottom: `1px solid ${T.border}`, display: "flex", gap: "1rem", alignItems: "center" }}>
          <span style={{ fontFamily: T.mono, fontSize: "0.8rem", color: T.muted }}>{selectedLeads.size} selected</span>
          <button disabled={selectedLeads.size === 0} onClick={() => handleBulkAction('approve')} style={{ background: "rgba(0,255,136,0.1)", border: `1px solid ${T.g}`, color: T.g, padding: "0.3rem 1rem", cursor: "pointer" }}>APPROVE</button>
          <button disabled={selectedLeads.size === 0} onClick={() => handleBulkAction('reject')} style={{ background: "rgba(255,0,85,0.1)", border: `1px solid #ff0055`, color: "#ff0055", padding: "0.3rem 1rem", cursor: "pointer" }}>REJECT</button>
          <button disabled={selectedLeads.size === 0} onClick={() => handleBulkAction('suppress')} style={{ background: "rgba(255,170,0,0.1)", border: `1px solid #ffaa00`, color: "#ffaa00", padding: "0.3rem 1rem", cursor: "pointer" }}>SUPPRESS</button>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: T.body }}>
          <thead>
            <tr style={{ borderBottom: `1px solid ${T.border}`, textAlign: "left", color: T.muted, fontFamily: T.mono, fontSize: "0.8rem" }}>
              <th style={{ padding: "1rem" }}><input type="checkbox" onChange={(e) => {
                if (e.target.checked) setSelectedLeads(new Set(leads.map(l => l.id)));
                else setSelectedLeads(new Set());
              }} checked={leads.length > 0 && selectedLeads.size === leads.length} /></th>
              <th style={{ padding: "1rem" }}>LEAD</th>
              <th style={{ padding: "1rem" }}>COMPANY</th>
              <th style={{ padding: "1rem" }}>STATUS</th>
              <th style={{ padding: "1rem" }}>SCORE</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: T.muted }}>Loading...</td></tr>
            ) : leads.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: "2rem", textAlign: "center", color: T.muted }}>No leads discovered yet.</td></tr>
            ) : leads.map(lead => (
              <tr key={lead.id} style={{ borderBottom: `1px solid ${T.border}` }}>
                <td style={{ padding: "1rem" }}>
                  <input type="checkbox" checked={selectedLeads.has(lead.id)} onChange={() => toggleSelect(lead.id)} />
                </td>
                <td style={{ padding: "1rem" }}>
                  <div style={{ fontWeight: "bold", color: "#fff" }}>{lead.name}</div>
                  <div style={{ fontSize: "0.85rem", color: T.muted }}>{lead.email}</div>
                </td>
                <td style={{ padding: "1rem", color: "#ddd" }}>{lead.company}</td>
                <td style={{ padding: "1rem" }}>
                  <span style={{ padding: "0.2rem 0.5rem", borderRadius: "4px", fontSize: "0.75rem", fontFamily: T.mono, textTransform: "uppercase", background: lead.status === 'new' ? 'rgba(0,207,255,0.1)' : 'rgba(0,255,136,0.1)', color: lead.status === 'new' ? T.g2 : T.g }}>
                    {lead.status}
                  </span>
                </td>
                <td style={{ padding: "1rem", color: T.g, fontFamily: T.mono, fontWeight: "bold" }}>{lead.score || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
