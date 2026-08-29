"use client";

import { useState, useEffect } from "react";
import {
  Search,
  MapPin,
  Building,
  Users,
  Activity,
  Filter,
  ChevronDown,
  CheckCircle2,
  ChevronRight,
  X,
  Phone,
  Mail,
  FileText,
  Calendar,
  Plus,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const T = {
  g: "var(--t-g)",
  g2: "var(--t-g2)",
  bg: "var(--t-bg)",
  bg2: "var(--t-bg2)",
  panel: "var(--t-panel)",
  border: "var(--t-border)",
  border2: "var(--t-border2)",
  muted: "var(--t-muted)",
  muted2: "rgba(var(--t-g2-rgb), )",
  text: "var(--t-text)",
  mono: "var(--t-font-mono)",
  display: "var(--t-font-display)",
  body: "var(--t-font-body)",
};

export default function LeadsDashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");

  // Selection
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

  // Drawer
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [leadDetail, setLeadDetail] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchSummary();
    fetchLeads();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await apiClient.get("/v1/crm/sales/leads/summary");
      if (res.data) setSummary(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (statusFilter) params.append("status", statusFilter);
      if (sourceFilter) params.append("source", sourceFilter);

      const res = await apiClient.get(
        "/v1/crm/sales/leads?" + params.toString(),
      );
      if (res.data) setLeads(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeads();
    }, 400);
    return () => clearTimeout(timer);
  }, [search, statusFilter, sourceFilter]);

  const loadLeadDetail = async (id: string) => {
    try {
      const res = await apiClient.get("/v1/crm/sales/leads/" + id);
      if (res.data) setLeadDetail(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRowClick = (lead: any) => {
    setSelectedLead(lead);
    setLeadDetail(null);
    setActiveTab("overview");
    loadLeadDetail(lead.id);
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedLeads);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedLeads(newSet);
  };

  const handleBulkAction = async (
    action: "assign" | "change_status" | "archive",
    value?: string,
  ) => {
    if (selectedLeads.size === 0) return;
    try {
      await apiClient.post("/v1/crm/sales/leads/bulk-action", {
        action,
        leadIds: Array.from(selectedLeads),
        value,
      });
      fetchLeads();
      fetchSummary();
      setSelectedLeads(new Set());
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      className="flex flex-col h-[calc(100vh-4rem)] p-4 md:p-6"
      style={{ backgroundColor: T.bg, fontFamily: T.body }}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight uppercase"
            style={{ fontFamily: T.display, color: T.g }}
          >
            Leads
          </h1>
          <p
            className="opacity-70 mt-1 text-[color:var(--t-text)]"
            style={{ fontFamily: T.mono }}
          >
            Manage, qualify, and convert your sales prospects.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-[color:var(--t-g)]/30 text-[color:var(--t-g)] hover:bg-[color:var(--t-g)]/10 h-10 px-6 font-bold uppercase tracking-wider"
          >
            Import
          </Button>
          <Button className="bg-[color:var(--t-g)] hover:bg-[color:var(--t-g)]/80 text-black h-10 px-6 font-bold uppercase tracking-wider">
            <Plus className="w-4 h-4 mr-2" /> Create Lead
          </Button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
        {[
          { label: "Total Leads", value: summary.total || 0, color: "var(--t-heading)" },
          { label: "New Leads", value: summary.new || 0, color: T.g2 },
          { label: "Qualified", value: summary.qualified || 0, color: T.g },
          { label: "Hot Leads", value: summary.hot || 0, color: "#ff3366" },
          {
            label: "Contacted",
            value: summary.contacted || 0,
            color: "#ffaa00",
          },
          {
            label: "Conversion",
            value: (summary.conversionRate || 0) + "%",
            color: "#a78bfa",
          },
        ].map((kpi, i) => (
          <div
            key={i}
            className="bg-[color:var(--t-panel)] border border-[rgba(var(--t-g-rgb), )] rounded-xl p-4 flex flex-col justify-center"
          >
            <span className="text-xs text-gray-400 uppercase tracking-wider mb-1 font-bold">
              {kpi.label}
            </span>
            <span
              className="text-2xl font-bold"
              style={{ color: kpi.color, fontFamily: T.mono }}
            >
              {kpi.value}
            </span>
          </div>
        ))}
      </div>

      {/* TOOLBAR */}
      <div className="flex flex-col md:flex-row gap-4 mb-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search leads, companies, contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[color:var(--t-panel)] border border-[rgba(var(--t-g2-rgb), )] rounded-lg pl-9 pr-4 py-2 text-white outline-none focus:border-[color:var(--t-g2)] transition-colors"
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[color:var(--t-panel)] border border-[rgba(var(--t-g-rgb), )] text-[color:var(--t-g)] rounded-lg px-3 py-2 outline-none font-bold text-sm uppercase tracking-wider"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="converted">Converted</option>
            <option value="disqualified">Disqualified</option>
          </select>
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="bg-[color:var(--t-panel)] border border-[rgba(var(--t-g2-rgb), )] text-[color:var(--t-g2)] rounded-lg px-3 py-2 outline-none font-bold text-sm uppercase tracking-wider"
          >
            <option value="">All Sources</option>
            <option value="AI Lead Discovery">AI Lead Discovery</option>
            <option value="Website">Website</option>
            <option value="Manual Entry">Manual Entry</option>
          </select>
        </div>
      </div>

      {/* BULK ACTIONS */}
      {selectedLeads.size > 0 && (
        <div className="bg-[color:var(--t-g)]/10 border border-[color:var(--t-g)]/30 rounded-lg p-3 mb-4 flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2 text-[color:var(--t-g)] font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            {selectedLeads.size} leads selected
          </div>
          <div className="flex gap-2">
            <select
              onChange={(e) =>
                e.target.value &&
                handleBulkAction("change_status", e.target.value)
              }
              className="bg-black/50 border border-[color:var(--t-g)]/30 text-white rounded text-xs px-2 py-1 outline-none"
            >
              <option value="">Change Status...</option>
              <option value="qualified">Qualified</option>
              <option value="contacted">Contacted</option>
            </select>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleBulkAction("archive")}
              className="h-7 text-xs bg-red-500/20 text-red-400 hover:bg-red-500/30"
            >
              Archive
            </Button>
          </div>
        </div>
      )}

      {/* TABLE */}
      <div className="flex-1 bg-[color:var(--t-panel)] border border-[rgba(var(--t-g-rgb), )] rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left text-sm text-gray-300 whitespace-nowrap">
            <thead className="bg-black/40 text-gray-400 sticky top-0 text-xs uppercase font-bold tracking-wider">
              <tr>
                <th className="p-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedLeads.size === leads.length && leads.length > 0
                    }
                    onChange={(e) =>
                      setSelectedLeads(
                        e.target.checked
                          ? new Set(leads.map((l) => l.id))
                          : new Set(),
                      )
                    }
                    className="accent-[color:var(--t-g)]"
                  />
                </th>
                <th className="p-4">Lead</th>
                <th className="p-4">Company</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-center">Score</th>
                <th className="p-4">Source</th>
                <th className="p-4">Assigned To</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(var(--t-g-rgb), )]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    Loading leads...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-500">
                    No leads found. Try adjusting filters.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr
                    key={lead.id}
                    onClick={(e) => {
                      if ((e.target as any).tagName !== "INPUT")
                        handleRowClick(lead);
                    }}
                    className="hover:bg-[color:var(--t-g)]/5 transition-colors cursor-pointer group"
                  >
                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedLeads.has(lead.id)}
                        onChange={() => toggleSelect(lead.id)}
                        className="accent-[color:var(--t-g)]"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white">
                        {lead.contact_name}
                      </div>
                      <div className="text-xs text-gray-500 truncate max-w-[150px]">
                        {lead.job_title || lead.email}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-gray-200">
                      {lead.company}
                      <div className="text-xs text-[color:var(--t-g2)]">
                        {lead.company_industry}
                      </div>
                    </td>
                    <td className="p-4">
                      <Badge
                        variant="outline"
                        className={
                          (lead.status === "qualified"
                            ? "border-[color:var(--t-g)] text-[color:var(--t-g)]"
                            : lead.status === "contacted"
                              ? "border-amber-400 text-amber-400"
                              : lead.status === "new"
                                ? "border-[color:var(--t-g2)] text-[color:var(--t-g2)]"
                                : "border-gray-500 text-gray-400") +
                          " uppercase text-[10px]"
                        }
                      >
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">
                      {Number(lead.score) > 0 ? (
                        <div
                          className="font-bold"
                          style={{
                            fontFamily: T.mono,
                            color:
                              Number(lead.score) >= 90
                                ? "#ff3366"
                                : Number(lead.score) >= 70
                                  ? "#ffaa00"
                                  : "#888",
                          }}
                        >
                          {lead.score} {Number(lead.score) >= 90 && "🔥"}
                        </div>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-gray-400">{lead.source}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold border border-indigo-500/30">
                          {lead.owner_id ? "AW" : "—"}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* PROSPECT DRAWER */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-full md:w-[600px] h-full bg-[color:var(--t-bg2)] border-l border-[rgba(var(--t-g-rgb), )] shadow-2xl flex flex-col animate-in slide-in-from-right overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-[rgba(var(--t-g-rgb), )] bg-[color:var(--t-panel)] flex-shrink-0">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">
                    {selectedLead.contact_name}
                  </h2>
                  <p className="text-[color:var(--t-g2)] font-medium flex items-center gap-2">
                    {selectedLead.job_title} @ {selectedLead.company}
                  </p>
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedLead.status}
                    onChange={(e) => {
                      const v = e.target.value;
                      apiClient
                        .patch("/v1/crm/sales/leads/" + selectedLead.id, {
                          status: v,
                        })
                        .then(() => {
                          setSelectedLead({ ...selectedLead, status: v });
                          fetchLeads();
                        });
                    }}
                    className="bg-black/50 border border-[color:var(--t-g)]/30 text-[color:var(--t-g)] rounded px-3 py-1 outline-none text-xs uppercase font-bold"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="qualified">Qualified</option>
                    <option value="engaged">Engaged</option>
                    <option value="converted">Converted</option>
                    <option value="disqualified">Disqualified</option>
                  </select>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedLead(null)}
                    className="text-gray-400 hover:text-white hover:bg-white/10 h-7 w-7"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex gap-6 mt-4">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={
                    "text-sm font-bold uppercase tracking-wider pb-2 border-b-2 transition-colors " +
                    (activeTab === "overview"
                      ? "border-[color:var(--t-g)] text-[color:var(--t-g)]"
                      : "border-transparent text-gray-500 hover:text-gray-300")
                  }
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("activity")}
                  className={
                    "text-sm font-bold uppercase tracking-wider pb-2 border-b-2 transition-colors " +
                    (activeTab === "activity"
                      ? "border-[color:var(--t-g)] text-[color:var(--t-g)]"
                      : "border-transparent text-gray-500 hover:text-gray-300")
                  }
                >
                  Activity
                </button>
                <button
                  onClick={() => setActiveTab("notes")}
                  className={
                    "text-sm font-bold uppercase tracking-wider pb-2 border-b-2 transition-colors " +
                    (activeTab === "notes"
                      ? "border-[color:var(--t-g)] text-[color:var(--t-g)]"
                      : "border-transparent text-gray-500 hover:text-gray-300")
                  }
                >
                  Notes
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 text-gray-300 text-sm">
              {!leadDetail ? (
                <div className="flex justify-center items-center h-full text-[color:var(--t-g)] animate-pulse">
                  Loading lead details...
                </div>
              ) : activeTab === "overview" ? (
                <div className="space-y-6">
                  {/* Scores */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-[color:var(--t-panel)] border border-[rgba(var(--t-g-rgb), )] p-4 rounded-xl">
                      <div className="text-xs uppercase text-gray-400 tracking-wider mb-1">
                        AI Lead Score
                      </div>
                      <div
                        className="text-3xl font-bold text-[#ff3366]"
                        style={{ fontFamily: T.mono }}
                      >
                        {leadDetail.score || "0"}
                      </div>
                    </div>
                    <div className="bg-[color:var(--t-panel)] border border-[rgba(var(--t-g2-rgb), )] p-4 rounded-xl">
                      <div className="text-xs uppercase text-gray-400 tracking-wider mb-1">
                        Source
                      </div>
                      <div className="text-lg font-bold text-[color:var(--t-g2)] mt-1">
                        {leadDetail.source}
                      </div>
                    </div>
                  </div>

                  {/* AI Intel */}
                  <div className="bg-[color:var(--t-panel)] border border-white/10 p-4 rounded-xl">
                    <h4 className="font-bold text-white mb-2 uppercase tracking-wider text-xs flex items-center gap-2">
                      <Activity className="w-4 h-4 text-[color:var(--t-g)]" /> AI
                      Intelligence
                    </h4>
                    <p className="text-gray-300 mb-3">
                      Strong fit with Active ICP. The company matches target
                      firmographics and the contact holds a senior technology
                      role.
                    </p>
                    <div className="bg-black/30 p-3 rounded border border-white/5 text-xs text-gray-400">
                      <strong>Recommended Action:</strong> Personalize email
                      mentioning their recent expansion efforts and offer a
                      demo.
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div>
                    <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-xs">
                      Contact Details
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-gray-300">
                        <Mail className="w-4 h-4 text-gray-500" />{" "}
                        {leadDetail.email || "No email"}
                      </div>
                      <div className="flex items-center gap-3 text-gray-300">
                        <Phone className="w-4 h-4 text-gray-500" /> +1 (555)
                        000-0000
                      </div>
                    </div>
                  </div>

                  {/* Company Info */}
                  {leadDetail.company_details && (
                    <div>
                      <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-xs">
                        Company Details
                      </h4>
                      <div className="bg-[color:var(--t-panel)] border border-white/10 rounded-xl p-4 grid grid-cols-2 gap-y-4 text-sm">
                        <div>
                          <span className="text-gray-500 block text-[10px] uppercase">
                            Domain
                          </span>
                          <span className="text-gray-200">
                            {leadDetail.company_details.domain}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[10px] uppercase">
                            Industry
                          </span>
                          <span className="text-gray-200">
                            {leadDetail.company_details.industry}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500 block text-[10px] uppercase">
                            Employees
                          </span>
                          <span className="text-gray-200">
                            {leadDetail.company_details.employee_count}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Buying Signals */}
                  {leadDetail.buying_signals &&
                    leadDetail.buying_signals.length > 0 && (
                      <div>
                        <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-xs text-amber-400">
                          Buying Signals
                        </h4>
                        <div className="space-y-2">
                          {leadDetail.buying_signals.map((sig: any) => (
                            <div
                              key={sig.id}
                              className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg text-amber-200 text-xs"
                            >
                              <strong className="block text-amber-400 text-sm mb-1">
                                {sig.title || sig.type}
                              </strong>
                              {sig.description}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ) : activeTab === "activity" ? (
                <div className="space-y-4">
                  <div className="relative pl-6 border-l border-white/10 pb-4">
                    <div className="absolute w-3 h-3 bg-[color:var(--t-g)] rounded-full -left-[6px] top-1"></div>
                    <div className="text-xs text-gray-500 mb-1">Today</div>
                    <div className="font-bold text-white text-sm">
                      Viewed by Alex
                    </div>
                  </div>
                  <div className="relative pl-6 border-l border-white/10 pb-4">
                    <div className="absolute w-3 h-3 bg-[color:var(--t-g2)] rounded-full -left-[6px] top-1"></div>
                    <div className="text-xs text-gray-500 mb-1">Yesterday</div>
                    <div className="font-bold text-white text-sm">
                      Discovered via AI Search
                    </div>
                  </div>
                  <div className="relative pl-6 pb-4">
                    <div className="absolute w-3 h-3 bg-gray-500 rounded-full -left-[6px] top-1"></div>
                    <div className="text-xs text-gray-500 mb-1">Last Week</div>
                    <div className="font-bold text-white text-sm">
                      Record Created
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea
                    placeholder="Add a note about this lead..."
                    className="w-full h-32 bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[color:var(--t-g)] text-sm resize-none"
                  ></textarea>
                  <Button className="bg-[color:var(--t-g)] text-black w-full font-bold">
                    Save Note
                  </Button>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-[rgba(var(--t-g-rgb), )] bg-[color:var(--t-panel)] flex gap-3">
              <Button className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                <Mail className="w-4 h-4 mr-2" /> Generate Outreach
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-amber-500/50 text-amber-500 hover:bg-amber-500/10"
              >
                <Calendar className="w-4 h-4 mr-2" /> Schedule Follow-up
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
