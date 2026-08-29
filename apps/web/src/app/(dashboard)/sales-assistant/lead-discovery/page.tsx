"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Target,
  MapPin,
  Building,
  Users,
  PlayCircle,
  Loader,
  X,
  Filter,
  Sparkles,
  Plus,
  Save,
  Download,
  ChevronDown,
  CheckCircle2,
  Factory,
  Monitor,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { apiClient } from "@/lib/api/client";

// Define theme consistent with existing module
const T = {
  g: "var(--t-g)",
  g2: "var(--t-g2)",
  bg: "var(--t-bg)",
  bg2: "var(--t-bg2)",
  panel: "var(--t-panel)",
  border: "var(--t-border)",
  border2: "var(--t-border2)",
  muted: "var(--t-muted)",
  muted2: "rgba(0,207,255,0.45)",
  text: "var(--t-text)",
  mono: "var(--t-font-mono)",
  display: "var(--t-font-display)",
  body: "var(--t-font-body)",
};

export default function LeadDiscoveryPage() {
  const [icps, setIcps] = useState<any[]>([]);
  const [activeIcp, setActiveIcp] = useState<any>(null);
  const [activeIcpId, setActiveIcpId] = useState<string>("");

  // Search State
  const [aiSearchPrompt, setAiSearchPrompt] = useState("");
  const [discovering, setDiscovering] = useState(false);
  const [prospects, setProspects] = useState<any[]>([]);
  const [selectedProspects, setSelectedProspects] = useState<Set<string>>(
    new Set(),
  );

  // Sidebar Filters
  const [industries, setIndustries] = useState<string[]>([]);

  // Modals
  const [selectedProspect, setSelectedProspect] = useState<any>(null);

  useEffect(() => {
    fetchIcps();
  }, []);

  const fetchIcps = async () => {
    try {
      const data = await apiClient.get("/icps");
      if (data && data.length > 0) {
        setIcps(data);
        const active = data.find((i: any) => i.status === "active") || data[0];
        setActiveIcpId(active.id);
        setActiveIcp(active);
      }
    } catch (e) {
      console.error("Failed to fetch ICPs:", e);
    }
  };

  const startDiscovery = async () => {
    setDiscovering(true);
    try {
      const res = await apiClient.post("/lead-discovery/search", {
        prompt: aiSearchPrompt,
        icpId: activeIcpId,
        criteria: {
          industries,
        },
      });
      setProspects(res.data || []);
    } catch (e) {
      console.error("Discovery error:", e);
    } finally {
      setDiscovering(false);
    }
  };

  const toggleProspect = (id: string) => {
    const next = new Set(selectedProspects);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedProspects(next);
  };

  const bulkAdd = async () => {
    if (selectedProspects.size === 0) return;
    try {
      const selectedData = prospects.filter((p) => selectedProspects.has(p.id));
      await apiClient.post("/lead-discovery/add-to-leads", {
        prospects: selectedData,
      });
      alert(
        "Successfully added " + selectedData.length + " prospects to Leads!",
      );
      setSelectedProspects(new Set());
    } catch (e) {
      console.error(e);
    }
  };

  const toggleIndustry = (val: string) => {
    if (industries.includes(val))
      setIndustries(industries.filter((i) => i !== val));
    else setIndustries([...industries, val]);
  };

  return (
    <div
      className="flex flex-col h-[calc(100vh-4rem)] p-4 md:p-6 text-[color:var(--t-text)]"
      style={{ backgroundColor: T.bg, fontFamily: T.body }}
    >
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight uppercase"
            style={{ fontFamily: T.display, color: T.g2 }}
          >
            Lead Discovery
          </h1>
          <p className="opacity-70 mt-1" style={{ fontFamily: T.mono }}>
            Find high-quality prospects using AI and your Ideal Customer
            Profile.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-[color:var(--t-panel)] border border-[rgba(0,207,255,0.18)] px-4 py-2 rounded-lg">
          <Target className="w-5 h-5 text-[#00cfff]" />
          <span className="font-semibold text-sm">Active ICP:</span>
          {icps.length > 0 ? (
            <select
              value={activeIcpId}
              onChange={(e) => {
                setActiveIcpId(e.target.value);
                setActiveIcp(icps.find((i) => i.id === e.target.value));
              }}
              className="bg-transparent border-none text-white focus:ring-0 cursor-pointer outline-none"
            >
              {icps.map((icp) => (
                <option
                  key={icp.id}
                  value={icp.id}
                  style={{ background: "var(--t-bg)" }}
                >
                  {icp.name}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-gray-400">Loading...</span>
          )}
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex flex-1 gap-6 min-h-0 overflow-hidden">
        {/* SIDEBAR FILTERS */}
        <div className="w-64 flex-shrink-0 bg-[color:var(--t-panel)] border border-[rgba(0,207,255,0.18)] rounded-xl flex flex-col overflow-y-auto hidden md:flex">
          <div className="p-4 border-b border-[rgba(0,207,255,0.18)] flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#00cfff]" />
            <h3 className="font-bold tracking-widest text-[#00cfff]">
              FILTERS
            </h3>
          </div>

          <div className="p-4 space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                Industry
              </h4>
              {[
                "SaaS",
                "FinTech",
                "Healthcare",
                "E-commerce",
                "AI",
                "Manufacturing",
              ].map((ind) => (
                <div key={ind} className="flex items-center space-x-2">
                  <Checkbox
                    id={"ind-" + ind}
                    checked={industries.includes(ind)}
                    onCheckedChange={() => toggleIndustry(ind)}
                    className="border-[#00cfff] data-[state=checked]:bg-[#00cfff] data-[state=checked]:text-black"
                  />
                  <label
                    htmlFor={"ind-" + ind}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-300"
                  >
                    {ind}
                  </label>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                Location
              </h4>
              <Input
                placeholder="Search regions..."
                className="bg-black/50 border-[rgba(0,207,255,0.2)] text-white"
              />
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                Company Size
              </h4>
              <select className="bg-black/50 border border-[rgba(0,207,255,0.2)] text-white w-full p-2 rounded-md outline-none">
                <option value="">Select size</option>
                <option value="1-10">1 - 10</option>
                <option value="11-50">11 - 50</option>
                <option value="50-500">50 - 500</option>
                <option value="500+">500+</option>
              </select>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                Job Titles
              </h4>
              <Input
                placeholder="e.g. CTO, Founder"
                className="bg-black/50 border-[rgba(0,207,255,0.2)] text-white"
              />
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider">
                Buying Signals
              </h4>
              {["Recently Funded", "Hiring", "New Executive"].map((sig) => (
                <div key={sig} className="flex items-center space-x-2">
                  <Checkbox
                    id={"sig-" + sig}
                    className="border-[#00ff88] data-[state=checked]:bg-[#00ff88] data-[state=checked]:text-black"
                  />
                  <label
                    htmlFor={"sig-" + sig}
                    className="text-sm font-medium leading-none text-gray-300"
                  >
                    {sig}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* MAIN AREA */}
        <div className="flex-1 flex flex-col gap-6 overflow-hidden">
          {/* AI SEARCH */}
          <div className="bg-gradient-to-r from-[color:var(--t-panel)] to-indigo-900/20 border border-[#00cfff]/30 rounded-xl p-6 relative overflow-hidden flex-shrink-0">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#00cfff] opacity-5 blur-[100px] pointer-events-none"></div>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#00cfff]" /> AI Prospect Search
            </h2>
            <div className="flex gap-3">
              <Input
                placeholder="Find SaaS companies in Europe with 50-500 employees..."
                value={aiSearchPrompt}
                onChange={(e) => setAiSearchPrompt(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && startDiscovery()}
                className="bg-black/40 border-[#00cfff]/40 text-white text-base py-6 focus-visible:ring-[#00cfff]"
              />
              <Button
                onClick={startDiscovery}
                disabled={discovering}
                className="bg-[#00cfff] hover:bg-[#00cfff]/80 text-black px-8 font-bold h-auto"
              >
                {discovering ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  "Discover"
                )}
              </Button>
            </div>
          </div>

          {/* RESULTS AREA */}
          <div className="flex-1 bg-[color:var(--t-panel)] border border-[rgba(0,255,136,0.18)] rounded-xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-[rgba(0,255,136,0.18)] flex justify-between items-center bg-black/20">
              <div className="text-[#00ff88] font-bold tracking-widest text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                {prospects.length} PROSPECTS FOUND
              </div>
              <div className="flex items-center gap-3">
                {selectedProspects.size > 0 && (
                  <Button
                    onClick={bulkAdd}
                    size="sm"
                    className="bg-[#00ff88] text-black hover:bg-[#00ff88]/80 h-8 font-bold"
                  >
                    Add {selectedProspects.size} to Leads
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/10 h-8"
                >
                  <Save className="w-3 h-3 mr-2" /> Save Search
                </Button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {discovering ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 border-4 border-[#00cfff]/20 border-t-[#00cfff] rounded-full animate-spin"></div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-white">
                      AI Engine Running
                    </h3>
                    <p className="text-[#00cfff]/70">
                      Scanning databases and matching against your ICP...
                    </p>
                  </div>
                </div>
              ) : prospects.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <Target className="w-16 h-16 mb-4 text-[#00cfff]" />
                  <h3 className="text-xl font-bold text-white mb-2">
                    Ready to Discover
                  </h3>
                  <p className="max-w-md">
                    Use the AI search bar or filters to find decision makers
                    that match your ICP.
                  </p>
                </div>
              ) : (
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="text-xs uppercase bg-black/40 text-gray-400 sticky top-0">
                    <tr>
                      <th className="p-3 w-10">
                        <Checkbox
                          checked={
                            selectedProspects.size === prospects.length &&
                            prospects.length > 0
                          }
                          onCheckedChange={() =>
                            setSelectedProspects(
                              selectedProspects.size === prospects.length
                                ? new Set()
                                : new Set(prospects.map((p) => p.id)),
                            )
                          }
                        />
                      </th>
                      <th className="p-3">Company</th>
                      <th className="p-3">Contact</th>
                      <th className="p-3">Role</th>
                      <th className="p-3 text-center">ICP Match</th>
                      <th className="p-3 text-center">Lead Score</th>
                      <th className="p-3">Signals</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[rgba(0,255,136,0.1)]">
                    {prospects.map((p) => (
                      <tr
                        key={p.id}
                        className="hover:bg-[#00ff88]/5 transition-colors group cursor-pointer"
                        onClick={(e) => {
                          if ((e.target as any).type !== "button")
                            setSelectedProspect(p);
                        }}
                      >
                        <td
                          className="p-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Checkbox
                            checked={selectedProspects.has(p.id)}
                            onCheckedChange={() => toggleProspect(p.id)}
                          />
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-white">
                            {p.company.name}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {p.company.location}
                          </div>
                        </td>
                        <td className="p-3 font-medium text-gray-200">
                          {p.contact.name}
                        </td>
                        <td className="p-3">
                          <div className="text-gray-300">
                            {p.contact.job_title}
                          </div>
                          <div className="text-xs text-[#00cfff]">
                            {p.company.industry}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <Badge
                            variant="outline"
                            className={
                              p.scores.icpMatch >= 90
                                ? "border-[#00ff88] text-[#00ff88] bg-[#00ff88]/10"
                                : p.scores.icpMatch >= 70
                                  ? "border-amber-400 text-amber-400 bg-amber-400/10"
                                  : "border-gray-500 text-gray-400"
                            }
                          >
                            {p.scores.icpMatch}%
                          </Badge>
                        </td>
                        <td className="p-3 text-center">
                          <div
                            className="font-bold"
                            style={{
                              fontFamily: T.mono,
                              color:
                                p.scores.leadScore >= 90
                                  ? "#ff3366"
                                  : p.scores.leadScore >= 70
                                    ? "#ffaa00"
                                    : "#888",
                            }}
                          >
                            {p.scores.leadScore}{" "}
                            {p.scores.leadScore >= 90 && "🔥"}
                          </div>
                        </td>
                        <td className="p-3">
                          {p.signals?.length > 0 ? (
                            <span className="text-xs px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded border border-indigo-500/30">
                              {p.signals.length} Signal
                              {p.signals.length !== 1 && "s"}
                            </span>
                          ) : (
                            <span className="text-gray-600 text-xs">-</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 border-[#00cfff]/30 text-[#00cfff] hover:bg-[#00cfff]/20 h-7 text-xs transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProspect(p);
                            }}
                          >
                            View
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* PROSPECT DRAWER */}
      {selectedProspect && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="w-[500px] h-full bg-[color:var(--t-bg2)] border-l border-[rgba(0,207,255,0.3)] shadow-2xl flex flex-col animate-in slide-in-from-right overflow-y-auto">
            <div className="p-6 border-b border-[rgba(0,207,255,0.2)] flex justify-between items-start bg-black/20">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">
                  {selectedProspect.contact.name}
                </h2>
                <p className="text-[#00cfff] flex items-center gap-2">
                  {selectedProspect.contact.job_title} @{" "}
                  {selectedProspect.company.name}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedProspect(null)}
                className="text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[color:var(--t-panel)] border border-[rgba(0,255,136,0.2)] p-4 rounded-xl text-center">
                  <div className="text-xs uppercase text-gray-400 tracking-wider mb-1">
                    ICP Match
                  </div>
                  <div className="text-3xl font-bold text-[#00ff88]">
                    {selectedProspect.scores.icpMatch}%
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Highly aligned firmographics
                  </div>
                </div>
                <div className="bg-[color:var(--t-panel)] border border-[rgba(255,51,102,0.2)] p-4 rounded-xl text-center">
                  <div className="text-xs uppercase text-gray-400 tracking-wider mb-1">
                    AI Lead Score
                  </div>
                  <div className="text-3xl font-bold text-[#ff3366]">
                    {selectedProspect.scores.leadScore} 🔥
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    Strong intent indicators
                  </div>
                </div>
              </div>

              <div className="bg-[color:var(--t-panel)] border border-[rgba(0,207,255,0.2)] p-4 rounded-xl">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#00cfff]" /> AI
                  Recommendation
                </h4>
                <p className="text-gray-300 text-sm leading-relaxed">
                  {selectedProspect.aiRecommendation}
                </p>
                <div className="mt-3 p-3 bg-black/40 rounded text-xs text-gray-400 border border-white/5">
                  <strong>Score Explanation:</strong>{" "}
                  {selectedProspect.scores.explanation}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-sm flex items-center gap-2">
                  <Building className="w-4 h-4" /> Company Details
                </h4>
                <div className="bg-[color:var(--t-panel)] border border-white/10 rounded-xl p-4 grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                  <div>
                    <span className="text-gray-500 block text-xs uppercase">
                      Domain
                    </span>
                    <span className="text-gray-200">
                      {selectedProspect.company.domain}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs uppercase">
                      Industry
                    </span>
                    <span className="text-gray-200">
                      {selectedProspect.company.industry}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs uppercase">
                      Location
                    </span>
                    <span className="text-gray-200">
                      {selectedProspect.company.location}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-xs uppercase">
                      Employees
                    </span>
                    <span className="text-gray-200">
                      {selectedProspect.company.employee_count}
                    </span>
                  </div>
                </div>
              </div>

              {selectedProspect.signals?.length > 0 && (
                <div>
                  <h4 className="font-bold text-white mb-3 uppercase tracking-wider text-sm flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-400" /> Buying
                    Signals
                  </h4>
                  <div className="space-y-3">
                    {selectedProspect.signals.map((sig: any, idx: number) => (
                      <div
                        key={idx}
                        className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="font-bold text-amber-400 text-sm">
                            {sig.title}
                          </span>
                          <Badge
                            variant="outline"
                            className="text-xs bg-amber-500/20 text-amber-300 border-none"
                          >
                            {sig.strength}
                          </Badge>
                        </div>
                        <p className="text-xs text-amber-200/70">
                          {sig.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-[rgba(0,207,255,0.2)] bg-black/40 flex gap-3">
              <Button
                onClick={async () => {
                  try {
                    await apiClient.post("/lead-discovery/add-to-leads", {
                      prospects: [selectedProspect],
                    });
                    alert("Added to Leads!");
                    setSelectedProspect(null);
                  } catch (e) {
                    console.error(e);
                  }
                }}
                className="flex-1 bg-[#00ff88] hover:bg-[#00ff88]/80 text-black font-bold"
              >
                Add to Leads
              </Button>
              <Button
                variant="outline"
                className="border-[#00cfff]/30 text-[#00cfff] hover:bg-[#00cfff]/10"
              >
                Generate Outreach
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
