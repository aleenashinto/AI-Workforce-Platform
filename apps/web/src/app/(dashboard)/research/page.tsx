"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  FileText,
  Plus,
  Database,
  Globe,
  Play,
  ChevronRight,
  Activity,
  Calendar,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import { Button } from "@/components/ui/button";

const T = {
  g: "var(--t-g)",
  g2: "var(--t-g2)",
  bg: "var(--t-bg)",
  bg2: "var(--t-bg2)",
  panel: "var(--t-panel)",
  border: "var(--t-border)",
  muted: "var(--t-muted)",
  mono: "var(--t-font-mono)",
  display: "var(--t-font-display)",
  body: "var(--t-font-body)",
};

export default function ResearchDashboard() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({});
  const [loading, setLoading] = useState(true);

  // Create Modal State
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newQuestion, setNewQuestion] = useState("");
  const [newObj, setNewObj] = useState("");
  const [newType, setNewType] = useState("Market Research");
  const [newDepth, setNewDepth] = useState("Standard");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [sumRes, histRes] = await Promise.all([
        apiClient.get("/research/summary"),
        apiClient.get("/research"),
      ]);
      if (sumRes.data) setSummary(sumRes.data);
      if (histRes.data) setHistory(histRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const res = await apiClient.post("/research", {
        title: newTitle,
        question: newQuestion,
        objective: newObj,
        type: newType,
        depth: newDepth,
      });
      if (res.data && res.data.id) {
        // Kick off execution
        apiClient.post("/research/" + res.data.id + "/execute", {});
        router.push("/research/" + res.data.id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      className="flex flex-col h-full p-4 md:p-6 relative"
      style={{ backgroundColor: T.bg, fontFamily: T.body }}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight uppercase"
            style={{ fontFamily: T.display, color: T.g }}
          >
            Research
          </h1>
          <p
            className="opacity-70 mt-1 text-[color:var(--t-text)]"
            style={{ fontFamily: T.mono }}
          >
            Investigate questions, analyze evidence, generate reports.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => setShowCreate(true)}
            className="bg-[color:var(--t-g)] hover:bg-[color:var(--t-g)]/80 text-black h-10 px-6 font-bold uppercase tracking-wider"
          >
            <Plus className="w-4 h-4 mr-2" /> New Research
          </Button>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Research Projects",
            value: summary.total || 0,
            color: "var(--t-heading)",
          },
          { label: "Active Research", value: summary.active || 0, color: T.g2 },
          { label: "Completed", value: summary.completed || 0, color: T.g },
          {
            label: "Saved Reports",
            value: summary.completed || 0,
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

      <h2
        className="text-lg font-bold text-white mb-4 uppercase tracking-wider"
        style={{ fontFamily: T.mono }}
      >
        Recent Research
      </h2>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="text-[color:var(--t-g)] animate-pulse p-4">
            Loading research history...
          </div>
        ) : history.length === 0 ? (
          <div className="col-span-full bg-[color:var(--t-panel)] border border-dashed border-[color:var(--t-g)]/30 rounded-xl p-8 flex flex-col items-center justify-center text-center">
            <Search className="w-12 h-12 text-[color:var(--t-g)]/50 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">
              Research Smarter with AI
            </h3>
            <p className="text-gray-400 mb-6 max-w-md">
              Investigate questions, compare evidence, and generate
              source-backed research reports.
            </p>
            <Button
              onClick={() => setShowCreate(true)}
              className="bg-transparent border border-[color:var(--t-g)] text-[color:var(--t-g)] hover:bg-[color:var(--t-g)]/10 font-bold uppercase"
            >
              Start New Research
            </Button>
          </div>
        ) : (
          history.map((item) => (
            <div
              key={item.id}
              className="bg-[color:var(--t-panel)] border border-[rgba(var(--t-g-rgb), )] hover:border-[color:var(--t-g)]/50 transition-colors rounded-xl p-5 flex flex-col relative group"
            >
              <div className="flex justify-between items-start mb-3">
                <h3 className="text-lg font-bold text-white line-clamp-2">
                  {item.title}
                </h3>
                <div
                  className={
                    "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider " +
                    (item.status === "completed"
                      ? "bg-[color:var(--t-g)]/10 text-[color:var(--t-g)]"
                      : item.status === "failed"
                        ? "bg-red-500/10 text-red-400"
                        : "bg-[color:var(--t-g2)]/10 text-[color:var(--t-g2)]")
                  }
                >
                  {item.status}
                </div>
              </div>

              <p className="text-gray-400 text-sm line-clamp-2 mb-4 flex-1">
                {item.question}
              </p>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
                <div className="flex items-center text-xs text-gray-500 gap-1">
                  <Calendar className="w-3 h-3" />{" "}
                  {new Date(item.created_at).toLocaleDateString()}
                </div>
                <Button
                  onClick={() => router.push("/research/" + item.id)}
                  variant="ghost"
                  size="sm"
                  className="text-[color:var(--t-g)] hover:bg-[color:var(--t-g)]/10 p-0 h-auto font-bold uppercase tracking-wider text-xs flex items-center"
                >
                  {item.status === "completed" ? "Open Research" : "Continue"}{" "}
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[600px] bg-[color:var(--t-bg2)] border border-[color:var(--t-g)]/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-[color:var(--t-g)]/20 bg-[color:var(--t-panel)]">
              <h2 className="text-2xl font-bold text-white uppercase tracking-wider">
                New Research
              </h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs uppercase text-gray-400 font-bold mb-1">
                  Research Title *
                </label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. AI Support Market Analysis"
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[color:var(--t-g)] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-400 font-bold mb-1">
                  Research Question *
                </label>
                <textarea
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  placeholder="What are the major trends..."
                  className="w-full h-24 bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[color:var(--t-g)] text-sm resize-none"
                />
              </div>
              <div>
                <label className="block text-xs uppercase text-gray-400 font-bold mb-1">
                  Objective
                </label>
                <input
                  value={newObj}
                  onChange={(e) => setNewObj(e.target.value)}
                  placeholder="Understand market trends..."
                  className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[color:var(--t-g)] text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase text-gray-400 font-bold mb-1">
                    Research Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[color:var(--t-g)] text-sm"
                  >
                    <option value="Market Research">Market Research</option>
                    <option value="Competitor Research">
                      Competitor Research
                    </option>
                    <option value="Product Research">Product Research</option>
                    <option value="Technical Research">
                      Technical Research
                    </option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs uppercase text-gray-400 font-bold mb-1">
                    Depth
                  </label>
                  <select
                    value={newDepth}
                    onChange={(e) => setNewDepth(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white outline-none focus:border-[color:var(--t-g)] text-sm"
                  >
                    <option value="Quick">Quick</option>
                    <option value="Standard">Standard</option>
                    <option value="Deep">Deep</option>
                    <option value="Comprehensive">Comprehensive</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[color:var(--t-g)]/20 bg-[color:var(--t-panel)] flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowCreate(false)}
                className="border-gray-500 text-gray-300 hover:bg-white/5"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!newTitle || !newQuestion}
                className="bg-[color:var(--t-g)] hover:bg-[color:var(--t-g)]/80 text-black font-bold uppercase"
              >
                <Play className="w-4 h-4 mr-2" /> Start Research
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
