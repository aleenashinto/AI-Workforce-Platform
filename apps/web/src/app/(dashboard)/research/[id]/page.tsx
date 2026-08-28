"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  FileText,
  Globe,
  Activity,
  CheckCircle,
  Clock,
  Database,
  ExternalLink,
  AlertTriangle,
  Lightbulb,
  FileBarChart,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/button";

const T = {
  g: "#00ff88",
  g2: "#00cfff",
  bg: "#040810",
  bg2: "#070e1a",
  panel: "#0a1628",
  border: "rgba(0,255,136,0.18)",
  muted: "rgba(0,255,136,0.45)",
};

export default function ResearchWorkspace() {
  const { id } = useParams();
  const router = useRouter();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (id === "history") {
      router.replace("/research");
      return;
    }

    // Poll for status if not completed
    const fetchProject = async () => {
      try {
        const res = await apiClient.get(`/research/${id}`);
        setProject(res.data);
        if (res.data.status !== "completed" && res.data.status !== "failed") {
          setTimeout(fetchProject, 2000);
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        setLoading(false);
      }
    };
    fetchProject();
  }, [id, router]);

  if (!project) {
    return (
      <div className="p-8 text-[#00ff88] font-bold animate-pulse">
        Initializing Workspace...
      </div>
    );
  }

  const payload = project.payload || {};
  const isGenerating =
    project.status !== "completed" && project.status !== "failed";

  const tabs = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "plan", label: "Research Plan", icon: Search },
    { id: "sources", label: "Sources", icon: Globe },
    { id: "findings", label: "Findings", icon: Lightbulb },
    { id: "conflicts", label: "Conflicts", icon: AlertTriangle },
    { id: "report", label: "Final Report", icon: FileBarChart },
  ];

  return (
    <div className="flex flex-col h-full bg-[#040810] text-[#c8ffe8] font-mono">
      {/* HEADER */}
      <div className="bg-[#070e1a] border-b border-[#00ff88]/20 p-4 md:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <button
            onClick={() => router.push("/research")}
            className="flex items-center text-gray-400 hover:text-white text-sm mb-2 uppercase tracking-widest font-bold"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-white uppercase">
            {project.title}
          </h1>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <Search className="w-3 h-3" /> {project.type}
            </span>
            <span className="flex items-center gap-1">
              <Activity className="w-3 h-3" /> {project.depth} Depth
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div
            className={
              "flex items-center gap-2 px-3 py-1.5 rounded font-bold uppercase tracking-widest text-xs " +
              (project.status === "completed"
                ? "bg-[#00ff88]/10 text-[#00ff88]"
                : isGenerating
                  ? "bg-[#00cfff]/10 text-[#00cfff]"
                  : "bg-red-500/10 text-red-500")
            }
          >
            {isGenerating ? (
              <Clock className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            Status: {project.status}
          </div>
        </div>
      </div>

      {isGenerating ? (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-16 h-16 border-4 border-[#00ff88]/20 border-t-[#00ff88] rounded-full animate-spin mb-6"></div>
          <h2 className="text-xl font-bold text-white mb-2 uppercase tracking-widest">
            Researching...
          </h2>
          <div className="space-y-3 w-64 mt-4">
            <div className="flex items-center text-[#00ff88]">
              <CheckCircle className="w-4 h-4 mr-2" /> Understanding question
            </div>
            <div className="flex items-center text-[#00ff88]">
              <CheckCircle className="w-4 h-4 mr-2" /> Creating research plan
            </div>
            <div className="flex items-center text-[#00cfff] font-bold">
              <Clock className="w-4 h-4 mr-2 animate-pulse" /> Searching &
              Analyzing sources
            </div>
            <div className="flex items-center text-gray-500">
              <Clock className="w-4 h-4 mr-2" /> Generating report
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-1 overflow-hidden">
          {/* SIDEBAR TABS */}
          <div className="w-64 bg-[#0a1628] border-r border-[#00ff88]/10 p-4 flex flex-col gap-2 overflow-y-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold uppercase tracking-wider text-xs transition-colors ${activeTab === tab.id ? "bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30" : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"}`}
              >
                <tab.icon className="w-4 h-4" /> {tab.label}
              </button>
            ))}
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8 bg-black/20">
            {activeTab === "overview" && (
              <div className="max-w-4xl space-y-8">
                <div className="bg-[#0a1628] border border-[#00ff88]/20 rounded-xl p-6">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">
                    Research Question
                  </h3>
                  <p className="text-lg text-white font-sans">
                    {project.question}
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-[#070e1a] border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-bold text-[#00cfff] mb-2">
                      {payload.sources?.length || 0}
                    </span>
                    <span className="text-xs uppercase text-gray-500 font-bold">
                      Sources Evaluated
                    </span>
                  </div>
                  <div className="bg-[#070e1a] border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-bold text-[#00ff88] mb-2">
                      {payload.findings?.length || 0}
                    </span>
                    <span className="text-xs uppercase text-gray-500 font-bold">
                      Key Findings
                    </span>
                  </div>
                  <div className="bg-[#070e1a] border border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center">
                    <span className="text-4xl font-bold text-[#a78bfa] mb-2">
                      {payload.recommendations?.length || 0}
                    </span>
                    <span className="text-xs uppercase text-gray-500 font-bold">
                      Recommendations
                    </span>
                  </div>
                </div>

                {payload.report?.executiveSummary && (
                  <div className="bg-[#0a1628] border border-[#00ff88]/20 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-[#00ff88] uppercase tracking-widest mb-4">
                      Executive Summary
                    </h3>
                    <div className="text-gray-300 font-sans leading-relaxed whitespace-pre-wrap">
                      {payload.report.executiveSummary}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "plan" && (
              <div className="max-w-4xl space-y-6">
                <h2 className="text-xl font-bold text-white uppercase tracking-widest">
                  Research Plan
                </h2>
                <div className="bg-[#0a1628] border border-[#00ff88]/20 rounded-xl p-6">
                  <h3 className="text-[#00ff88] font-bold uppercase tracking-widest mb-4">
                    Generated Search Queries
                  </h3>
                  <ul className="space-y-3">
                    {payload.plan?.queries?.map((q: string, i: number) => (
                      <li
                        key={i}
                        className="flex items-center gap-3 text-gray-300 font-sans bg-black/40 p-3 rounded border border-white/5"
                      >
                        <Search className="w-4 h-4 text-gray-500" /> {q}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === "sources" && (
              <div className="max-w-5xl space-y-4">
                <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-6">
                  Retrieved Sources
                </h2>
                {payload.sources?.map((s: any, i: number) => (
                  <div
                    key={i}
                    className="bg-[#0a1628] border border-[#00ff88]/20 rounded-xl p-5 flex flex-col md:flex-row gap-4 justify-between items-start"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/10 text-gray-300">
                          {s.domain}
                        </span>
                        {s.title.includes("DEMO DATA") && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-yellow-500/20 text-yellow-500">
                            DEMO DATA
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">
                        {s.title.replace("[DEMO DATA] ", "")}
                      </h3>
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#00cfff] hover:underline text-sm flex items-center gap-1 font-sans"
                      >
                        {s.url} <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="text-right">
                        <div className="text-3xl font-bold text-[#00ff88]">
                          {s.relevanceScore}%
                        </div>
                        <div className="text-[10px] uppercase text-gray-500 font-bold">
                          Relevance
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "findings" && (
              <div className="max-w-4xl space-y-6">
                <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-6">
                  Key Findings & Evidence
                </h2>
                {payload.findings?.map((f: any, i: number) => (
                  <div
                    key={i}
                    className="bg-[#0a1628] border border-[#00ff88]/20 rounded-xl p-6"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold text-[#00ff88]">
                        {f.title}
                      </h3>
                      <span
                        className={
                          "px-2 py-1 rounded text-xs font-bold uppercase " +
                          (f.confidence === "High"
                            ? "bg-[#00ff88]/20 text-[#00ff88]"
                            : "bg-yellow-500/20 text-yellow-500")
                        }
                      >
                        {f.confidence} Confidence
                      </span>
                    </div>
                    <p className="text-gray-300 font-sans mb-4">{f.summary}</p>
                    <div className="bg-black/40 rounded border border-white/5 p-4">
                      <h4 className="text-xs uppercase text-gray-500 font-bold mb-2">
                        Supporting Sources
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {f.sourceIds?.map((sid: string) => {
                          const src = payload.sources?.find(
                            (s: any) => s.id === sid,
                          );
                          return src ? (
                            <span
                              key={sid}
                              className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-300 flex items-center gap-1"
                            >
                              <Globe className="w-3 h-3" /> {src.domain}
                            </span>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "conflicts" && (
              <div className="max-w-4xl space-y-6">
                <h2 className="text-xl font-bold text-white uppercase tracking-widest mb-6">
                  Conflicting Information
                </h2>
                {!payload.conflicts || payload.conflicts.length === 0 ? (
                  <div className="bg-green-500/10 border border-green-500/30 text-green-400 p-6 rounded-xl flex items-center gap-3">
                    <CheckCircle className="w-6 h-6" />
                    <span className="font-bold">
                      No significant conflicts detected in the sources.
                    </span>
                  </div>
                ) : (
                  payload.conflicts.map((c: any, i: number) => (
                    <div
                      key={i}
                      className="bg-red-500/5 border border-red-500/20 rounded-xl p-6"
                    >
                      <h3 className="text-lg font-bold text-red-400 mb-4">
                        {c.claim}
                      </h3>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="bg-black/40 p-4 rounded border border-red-500/10">
                          <span className="text-xs uppercase text-gray-500 font-bold block mb-1">
                            Source A
                          </span>
                          <p className="text-gray-300 font-sans text-sm">
                            {c.sourceA}
                          </p>
                        </div>
                        <div className="bg-black/40 p-4 rounded border border-red-500/10">
                          <span className="text-xs uppercase text-gray-500 font-bold block mb-1">
                            Source B
                          </span>
                          <p className="text-gray-300 font-sans text-sm">
                            {c.sourceB}
                          </p>
                        </div>
                      </div>
                      <div className="bg-[#0a1628] p-4 rounded border border-[#00cfff]/20">
                        <span className="text-xs uppercase text-[#00cfff] font-bold block mb-1">
                          Possible Explanation
                        </span>
                        <p className="text-gray-300 font-sans text-sm">
                          {c.explanation}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === "report" && (
              <div className="max-w-4xl">
                <div className="bg-white text-black p-8 md:p-12 rounded-xl shadow-2xl font-sans">
                  <h1 className="text-4xl font-black mb-4">{project.title}</h1>
                  <p className="text-gray-500 text-lg mb-8">
                    {project.question}
                  </p>

                  <h2 className="text-2xl font-bold mb-4 text-[#0a1628] border-b pb-2">
                    Executive Summary
                  </h2>
                  <div className="prose max-w-none text-gray-800 mb-8 whitespace-pre-wrap">
                    {payload.report?.executiveSummary}
                  </div>

                  <h2 className="text-2xl font-bold mb-4 text-[#0a1628] border-b pb-2">
                    Key Findings
                  </h2>
                  <div className="space-y-6 mb-8">
                    {payload.findings?.map((f: any, i: number) => (
                      <div key={i}>
                        <h3 className="text-lg font-bold">{f.title}</h3>
                        <p className="text-gray-700">{f.summary}</p>
                      </div>
                    ))}
                  </div>

                  <h2 className="text-2xl font-bold mb-4 text-[#0a1628] border-b pb-2">
                    Recommendations
                  </h2>
                  <ul className="list-disc pl-5 space-y-2 mb-8">
                    {payload.recommendations?.map((r: any, i: number) => (
                      <li key={i} className="text-gray-800">
                        <strong>{r.title}:</strong> {r.reason}
                      </li>
                    ))}
                  </ul>

                  <h2 className="text-2xl font-bold mb-4 text-[#0a1628] border-b pb-2">
                    Methodology & Limitations
                  </h2>
                  <div className="prose max-w-none text-gray-600 text-sm whitespace-pre-wrap">
                    <p>
                      <strong>Methodology:</strong>{" "}
                      {payload.report?.methodology}
                    </p>
                    <p>
                      <strong>Limitations:</strong>{" "}
                      {payload.report?.limitations}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
