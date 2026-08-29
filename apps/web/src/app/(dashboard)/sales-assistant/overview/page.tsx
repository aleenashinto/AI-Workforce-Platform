"use client";

import {
  Users,
  CheckCircle,
  TrendingUp,
  Search,
  Calendar,
  Target,
  DollarSign,
  Activity,
  AlertCircle,
  Sparkles,
  Filter,
  ChevronDown,
  RefreshCw,
  Download,
  Plus,
  Mail,
  ArrowRight,
  PieChart,
  BarChart2,
  Briefcase,
  FileText,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getMockSalesOverview,
  SalesOverviewData,
} from "@/lib/salesOverview.mock";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
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
  text2: "#c8f2ff",
  glow: "var(--t-glow)",
  glow2: "var(--t-glow2)",
  mono: "'Share Tech Mono', monospace",
  display: "'Orbitron', sans-serif",
  body: "'Rajdhani', sans-serif",
  warn: "var(--t-warn)",
  red: "var(--t-red)",
  blue: "#0066ff",
};

const Corners = ({ color = T.g2 }: { color?: string }) => (
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
          borderColor: color,
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

const Card = ({
  title,
  value,
  sub,
  icon: Icon,
  change,
}: {
  title: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  change?: number;
}) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;
  return (
    <div
      style={{
        background: T.panel,
        border: `1px solid ${T.border2}`,
        padding: "1.5rem",
        position: "relative",
        boxShadow: `0 0 30px rgba(0,207,255,0.03)`,
      }}
    >
      <Corners />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "1rem",
        }}
      >
        <div
          style={{
            fontFamily: T.mono,
            fontSize: "0.75rem",
            color: T.muted2,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {title}
        </div>
        <Icon size={16} color={T.g2} />
      </div>
      <div
        style={{
          fontFamily: T.display,
          fontSize: "2rem",
          fontWeight: 700,
          color: "#fff",
          marginBottom: "0.5rem",
        }}
      >
        {value}
      </div>
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        {change !== undefined && (
          <span
            style={{
              fontFamily: T.mono,
              fontSize: "0.75rem",
              color: isPositive ? T.g : isNegative ? T.red : T.muted,
            }}
          >
            {isPositive ? "↑" : isNegative ? "↓" : ""} {Math.abs(change)}%
          </span>
        )}
        <span
          style={{
            fontFamily: T.mono,
            fontSize: "0.7rem",
            color: T.muted2,
            letterSpacing: "0.05em",
          }}
        >
          {sub}
        </span>
      </div>
    </div>
  );
};

export default function SalesOverviewPage() {
  const router = useRouter();
  const [data, setData] = useState<SalesOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [dateRange, setDateRange] = useState("This Month");
  const [chartFilter, setChartFilter] = useState("Revenue");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const loadData = async () => {
    setLoading(true);
    setError(false);
    try {
      // Simulate real API latency of 400ms for user interface feedback
      await new Promise((resolve) => setTimeout(resolve, 400));
      const result = await getMockSalesOverview(dateRange);
      setData(result);
    } catch (e) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!data) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", jsonString);
    downloadAnchor.setAttribute("download", `sales_overview_${dateRange.toLowerCase().replace(/\s+/g, "_")}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

  return (
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto w-full min-h-screen">
      {/* HEADER */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Target color={T.g2} className="w-6 h-6 md:w-8 md:h-8" /> Sales
            Overview
          </h1>
          <p className="font-mono text-sm text-[rgba(0,207,255,0.7)] tracking-wide">
            Monitor your sales performance, pipeline, leads, and AI-powered
            recommendations.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 items-center">
          {/* Date Selector */}
          <div className="relative">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none bg-[#0a1628] border border-[rgba(0,207,255,0.3)] text-[#c8f2ff] font-mono text-xs px-4 py-2 pr-8 outline-none cursor-pointer hover:border-[#00cfff] transition-colors"
            >
              {[
                "Today",
                "Yesterday",
                "Last 7 Days",
                "Last 30 Days",
                "This Month",
                "Last Month",
                "This Quarter",
                "Custom Range",
              ].map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <ChevronDown
              size={14}
              color={T.g2}
              className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
          </div>

          <button
            onClick={loadData}
            className="p-2 border border-[rgba(0,207,255,0.3)] text-[#00cfff] hover:bg-[rgba(0,207,255,0.1)] transition-colors"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={handleDownload}
            className="p-2 border border-[rgba(0,207,255,0.3)] text-[#00cfff] hover:bg-[rgba(0,207,255,0.1)] transition-colors"
          >
            <Download size={16} />
          </button>

          <button
            onClick={() => router.push("/sales-assistant/leads")}
            className="flex items-center gap-2 bg-transparent border border-[#00ff88] text-[#00ff88] font-mono text-xs px-4 py-2 uppercase font-bold hover:bg-[rgba(0,255,136,0.1)] transition-colors"
          >
            <Plus size={14} /> Add Lead
          </button>
          <button
            onClick={() => router.push("/sales-assistant/leads")}
            className="flex items-center gap-2 bg-[#00cfff] text-[#040810] border-none font-mono text-xs px-4 py-2 uppercase font-bold"
            style={{
              clipPath:
                "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
            }}
          >
            <Plus size={14} /> Create Opportunity
          </button>
        </div>
      </div>

      {error ? (
        <div className="p-8 border border-[#ff3355] bg-[rgba(255,51,85,0.05)] flex flex-col items-center justify-center text-center">
          <AlertCircle color="#ff3355" size={48} className="mb-4" />
          <h2 className="font-body text-xl text-white mb-2">
            Unable to load sales insights
          </h2>
          <p className="font-mono text-sm text-[rgba(255,51,85,0.8)] mb-6">
            Something went wrong while retrieving your AI recommendations.
          </p>
          <button
            onClick={loadData}
            className="px-6 py-2 border border-[#ff3355] text-[#ff3355] font-mono text-xs hover:bg-[rgba(255,51,85,0.1)] uppercase tracking-wider"
          >
            Try Again
          </button>
        </div>
      ) : loading ? (
        <div className="p-8 text-center font-mono text-[#00cfff] animate-pulse flex flex-col items-center justify-center min-h-[400px]">
          <RefreshCw size={32} className="animate-spin mb-4" />
          LOADING_SALES_DATA...
        </div>
      ) : !data ? (
        <div className="p-8 border border-[#00cfff] text-center font-mono text-[rgba(0,207,255,0.6)]">
          NO_DATA_AVAILABLE
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* KPI CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <Card
              title="Total Revenue"
              value={data.kpis.totalRevenue.value}
              change={data.kpis.totalRevenue.percentChange}
              sub={data.kpis.totalRevenue.description}
              icon={DollarSign}
            />
            <Card
              title="Pipeline Value"
              value={data.kpis.pipelineValue.value}
              change={data.kpis.pipelineValue.percentChange}
              sub={data.kpis.pipelineValue.description}
              icon={TrendingUp}
            />
            <Card
              title="Total Leads"
              value={data.kpis.totalLeads.value}
              change={data.kpis.totalLeads.percentChange}
              sub={data.kpis.totalLeads.description}
              icon={Users}
            />
            <Card
              title="Qualified Leads"
              value={data.kpis.qualifiedLeads.value}
              change={data.kpis.qualifiedLeads.percentChange}
              sub={data.kpis.qualifiedLeads.description}
              icon={CheckCircle}
            />
            <Card
              title="Conversion Rate"
              value={data.kpis.conversionRate.value}
              change={data.kpis.conversionRate.percentChange}
              sub={data.kpis.conversionRate.description}
              icon={Target}
            />
            <Card
              title="Sales Activities"
              value={data.kpis.salesActivities.value}
              change={data.kpis.salesActivities.percentChange}
              sub={data.kpis.salesActivities.description}
              icon={Activity}
            />
          </div>

          {/* PERFORMANCE & AI INSIGHTS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 relative bg-[#0a1628] border border-[rgba(0,207,255,0.18)] p-6">
              <Corners />
              <div className="flex justify-between items-start mb-6">
                <div className="font-mono text-sm text-[rgba(0,207,255,0.5)] tracking-widest uppercase">
                  Sales Performance
                </div>
                <div className="flex gap-2">
                  {["Revenue", "Deals", "Opportunities", "Conversion"].map(
                    (f) => (
                      <button
                        key={f}
                        onClick={() => setChartFilter(f)}
                        className={`font-mono text-xs px-3 py-1 border ${chartFilter === f ? "border-[#00cfff] text-[#00cfff] bg-[rgba(0,207,255,0.1)]" : "border-[rgba(0,207,255,0.2)] text-[rgba(0,207,255,0.6)] hover:border-[#00cfff]"}`}
                      >
                        {f}
                      </button>
                    ),
                  )}
                </div>
              </div>
              <div className="h-[250px] flex items-end justify-between gap-2 border-b border-[rgba(0,207,255,0.2)] pb-2 relative">
                {/* Simple Bar Chart Mockup */}
                {data.performance.map((d, i) => {
                  const val =
                    chartFilter === "Revenue"
                      ? d.revenue
                      : chartFilter === "Deals"
                        ? d.deals
                        : chartFilter === "Opportunities"
                          ? d.opportunities
                          : d.conversion;
                  const max =
                    chartFilter === "Revenue"
                      ? 6
                      : chartFilter === "Deals"
                        ? 5
                        : chartFilter === "Opportunities"
                          ? 10
                          : 25;
                  const height = `${(val / max) * 100}%`;
                  return (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center justify-end h-full relative group"
                    >
                      <div
                        className="w-full max-w-[40px] bg-[rgba(0,207,255,0.2)] border-t-2 border-[#00cfff] transition-all duration-500 hover:bg-[rgba(0,207,255,0.4)] relative"
                        style={{ height }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 font-mono text-xs text-[#00cfff] bg-[#040810] border border-[#00cfff] px-2 py-1 z-10 whitespace-nowrap pointer-events-none transition-opacity">
                          {val} {chartFilter}
                        </div>
                      </div>
                      <div className="absolute -bottom-6 font-mono text-xs text-[rgba(0,207,255,0.6)]">
                        {d.date}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="lg:col-span-1 relative bg-[#0a1628] border border-[rgba(0,255,136,0.3)] p-6 shadow-[0_0_15px_rgba(0,255,136,0.05)]">
              <Corners color={T.g} />
              <div className="font-mono text-sm text-[#00ff88] tracking-widest uppercase mb-6 flex items-center gap-2">
                <Sparkles size={16} /> AI Sales Insights
              </div>

              <div className="flex flex-col gap-4 overflow-y-auto max-h-[250px] pr-2">
                {data.insights.length === 0 ? (
                  <div className="text-[rgba(0,255,136,0.5)] font-mono text-xs">
                    No AI insights available. Continue adding sales activity and
                    leads.
                  </div>
                ) : (
                  data.insights.map((insight, i) => (
                    <div
                      key={insight.id}
                      className={`p-4 border-l-2 ${insight.priority === "high" ? "border-[#ffaa00] bg-[rgba(255,170,0,0.05)]" : "border-[#00ff88] bg-[rgba(0,255,136,0.05)]"}`}
                    >
                      <div className="font-body text-white font-semibold mb-1 flex items-center justify-between">
                        {insight.title}
                        {insight.priority === "high" && (
                          <AlertCircle size={14} color={T.warn} />
                        )}
                      </div>
                      <p className="font-mono text-[11px] text-[rgba(255,255,255,0.7)] mb-3 leading-relaxed">
                        {insight.description}
                      </p>
                      <div className="font-mono text-[10px] text-[rgba(0,255,136,0.8)] mb-2 uppercase tracking-wide">
                        Recommended: {insight.action}
                      </div>
                      <button
                        onClick={() => router.push(insight.cta.toLowerCase().includes("email") || insight.cta.toLowerCase().includes("sequence") ? "/sales-assistant/sequences" : "/sales-assistant/leads")}
                        className="text-xs font-mono text-[#00cfff] hover:text-white underline decoration-[rgba(0,207,255,0.3)] underline-offset-4"
                      >
                        {insight.cta} →
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* PIPELINE & FUNNEL */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Pipeline Stages */}
            <div className="relative bg-[#0a1628] border border-[rgba(0,207,255,0.18)] p-6 overflow-hidden">
              <Corners />
              <div className="font-mono text-sm text-[rgba(0,207,255,0.5)] tracking-widest uppercase mb-6">
                Sales Pipeline
              </div>
              <div className="flex flex-col gap-2">
                {data.pipeline.map((stage, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 text-sm font-mono relative py-2"
                  >
                    <div className="w-24 text-[rgba(0,207,255,0.8)]">
                      {stage.stage}
                    </div>
                    <div className="flex-1 bg-[rgba(0,207,255,0.1)] h-6 relative group overflow-hidden border border-[rgba(0,207,255,0.2)]">
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-[rgba(0,207,255,0.3)] transition-all duration-500"
                        style={{ width: `${stage.percent}%` }}
                      ></div>
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-white z-10">
                        {stage.opportunities} opps
                      </div>
                    </div>
                    <div className="w-20 text-right text-white font-bold">
                      {stage.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lead Funnel */}
            <div className="relative bg-[#0a1628] border border-[rgba(0,207,255,0.18)] p-6">
              <Corners />
              <div className="font-mono text-sm text-[rgba(0,207,255,0.5)] tracking-widest uppercase mb-6">
                Lead Funnel
              </div>
              <div className="flex items-stretch justify-center h-[280px] gap-1 px-4">
                {data.funnel.map((s, i, arr) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div
                      className="font-body text-xs md:text-sm text-white mb-2 whitespace-nowrap overflow-hidden text-ellipsis w-full text-center"
                      title={s.stage}
                    >
                      {s.stage}
                    </div>
                    <div className="font-mono text-[10px] md:text-xs text-[#00cfff] mb-2">
                      {s.count}
                    </div>

                    <div
                      style={{
                        width: "100%",
                        flex: 1,
                        background: `rgba(0,207,255,${0.1 + i * 0.05})`,
                        borderTop: `2px solid ${T.g2}`,
                        borderBottom: `2px solid rgba(0,207,255,0.2)`,
                        position: "relative",
                        clipPath: `polygon(
                        ${(100 - s.conversionPercent) / 2}% 0%,
                        ${100 - (100 - s.conversionPercent) / 2}% 0%,
                        ${100 - (100 - (arr[i + 1]?.conversionPercent || 5)) / 2}% 100%,
                        ${(100 - (arr[i + 1]?.conversionPercent || 5)) / 2}% 100%
                      )`,
                      }}
                    >
                      {i < arr.length - 1 && (
                        <div className="absolute -right-3 top-1/2 -translate-y-1/2 text-[rgba(0,207,255,0.5)] z-10 text-[10px] bg-[#040810] border border-[rgba(0,207,255,0.3)] rounded-full w-6 h-6 flex items-center justify-center">
                          {s.dropoffPercent}%
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* THREE COLUMN WIDGETS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Follow-ups */}
            <div className="relative bg-[#0a1628] border border-[rgba(0,207,255,0.18)] p-6">
              <Corners />
              <div className="font-mono text-sm text-[rgba(0,207,255,0.5)] tracking-widest uppercase mb-6 flex justify-between">
                <span>Today's Follow-ups</span>
                <span className="text-[#00cfff]">{data.followUps.length}</span>
              </div>
              <div className="flex flex-col gap-3">
                {data.followUps.map((f) => (
                  <div
                    key={f.id}
                    className="p-3 border border-[rgba(0,207,255,0.1)] bg-[rgba(0,207,255,0.02)] hover:bg-[rgba(0,207,255,0.05)] transition-colors"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <div className="font-body text-white font-bold">
                        {f.name}
                      </div>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 uppercase ${f.status === "overdue" ? "bg-[rgba(255,51,85,0.1)] text-[#ff3355] border border-[rgba(255,51,85,0.3)]" : f.status === "today" ? "bg-[rgba(255,170,0,0.1)] text-[#ffaa00] border border-[rgba(255,170,0,0.3)]" : "bg-[rgba(0,255,136,0.1)] text-[#00ff88] border border-[rgba(0,255,136,0.3)]"}`}
                      >
                        {f.status}
                      </span>
                    </div>
                    <div className="font-mono text-[10px] text-[rgba(255,255,255,0.5)] mb-2">
                      {f.company}
                    </div>
                    <div className="font-mono text-[11px] text-[#00cfff] mb-3">
                      {f.description}
                    </div>
                    <button
                      onClick={() => router.push(f.cta.toLowerCase().includes("email") || f.cta.toLowerCase().includes("sequence") ? "/sales-assistant/sequences" : f.cta.toLowerCase().includes("mailbox") ? "/sales-assistant/mailboxes" : "/sales-assistant/leads")}
                      className="text-[10px] font-mono border border-[rgba(0,207,255,0.3)] text-[#00cfff] px-3 py-1 hover:bg-[rgba(0,207,255,0.1)] uppercase w-full"
                    >
                      {f.cta}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Meetings */}
            <div className="relative bg-[#0a1628] border border-[rgba(0,207,255,0.18)] p-6">
              <Corners />
              <div className="font-mono text-sm text-[rgba(0,207,255,0.5)] tracking-widest uppercase mb-6 flex justify-between">
                <span>Upcoming Meetings</span>
                <Calendar size={16} color={T.g2} />
              </div>
              <div className="flex flex-col gap-3">
                {data.meetings.map((m) => (
                  <div
                    key={m.id}
                    className="p-3 border border-[rgba(0,207,255,0.1)] bg-[rgba(0,207,255,0.02)] flex gap-4 items-center group cursor-pointer hover:border-[#00cfff] transition-colors"
                  >
                    <div className="font-mono text-xs text-[#00cfff] bg-[rgba(0,207,255,0.1)] p-2 text-center w-16 shrink-0">
                      {m.time}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-body text-white font-bold truncate">
                        {m.contact}
                      </div>
                      <div className="font-mono text-[10px] text-[rgba(255,255,255,0.5)] truncate">
                        {m.company} • {m.type}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push("/sales-assistant/leads");
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[10px] bg-[rgba(0,255,136,0.1)] text-[#00ff88] border border-[#00ff88] px-2 py-1 flex items-center gap-1 shrink-0 whitespace-nowrap"
                    >
                      <Sparkles size={10} /> Prepare
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommended Actions */}
            <div className="relative bg-[#0a1628] border border-[rgba(0,255,136,0.3)] p-6 shadow-[0_0_15px_rgba(0,255,136,0.05)]">
              <Corners color={T.g} />
              <div className="font-mono text-sm text-[#00ff88] tracking-widest uppercase mb-6 flex items-center gap-2">
                <Target size={16} /> Recommended Actions
              </div>
              <div className="flex flex-col gap-3">
                {data.recommendedActions.map((a) => (
                  <div
                    key={a.id}
                    className="p-3 border border-[rgba(0,255,136,0.2)] bg-[rgba(0,255,136,0.02)] hover:bg-[rgba(0,255,136,0.05)] transition-colors"
                  >
                    <div className="font-body text-white font-bold mb-1">
                      {a.title}
                    </div>
                    <div className="font-mono text-[10px] text-[rgba(255,255,255,0.6)] mb-3 leading-relaxed">
                      {a.description}
                    </div>
                    <button
                      onClick={() => router.push(a.cta.toLowerCase().includes("campaign") || a.cta.toLowerCase().includes("sequence") ? "/sales-assistant/sequences" : "/sales-assistant/leads")}
                      className="text-[10px] font-mono text-[#00ff88] flex items-center gap-1 hover:underline underline-offset-4 uppercase"
                    >
                      {a.cta} <ArrowRight size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RECENT LEADS TABLE */}
          <div className="relative bg-[#0a1628] border border-[rgba(0,207,255,0.18)] p-6 overflow-x-auto">
            <Corners />
            <div className="flex justify-between items-center mb-6 min-w-[700px]">
              <div className="font-mono text-sm text-[rgba(0,207,255,0.5)] tracking-widest uppercase">
                Recent Leads
              </div>
              <div className="flex gap-2">
                <div className="relative">
                  <Search
                    size={14}
                    color={T.g2}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search leads..."
                    className="bg-[rgba(0,207,255,0.05)] border border-[rgba(0,207,255,0.2)] text-[#c8f2ff] font-mono text-xs pl-8 pr-3 py-1.5 outline-none focus:border-[#00cfff] w-48"
                  />
                </div>
                <div className="relative">
                  <Filter
                    size={14}
                    color={T.g2}
                    className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none bg-[rgba(0,207,255,0.05)] border border-[rgba(0,207,255,0.2)] text-[#00cfff] font-mono text-xs pl-8 pr-8 py-1.5 outline-none cursor-pointer hover:border-[#00cfff] transition-colors"
                  >
                    <option value="all">All Stages</option>
                    <option value="Lead Discovered">Discovered</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Sequence Active">Active</option>
                    <option value="Demo Scheduled">Scheduled</option>
                    <option value="Closed Won">Closed Won</option>
                  </select>
                  <ChevronDown
                    size={12}
                    color={T.g2}
                    className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            <table className="w-full min-w-[700px] text-left border-collapse">
              <thead>
                <tr className="border-b border-[rgba(0,207,255,0.2)]">
                  <th className="font-mono text-[10px] text-[rgba(0,207,255,0.5)] uppercase tracking-wider py-3 px-4">
                    Lead
                  </th>
                  <th className="font-mono text-[10px] text-[rgba(0,207,255,0.5)] uppercase tracking-wider py-3 px-4">
                    Company
                  </th>
                  <th className="font-mono text-[10px] text-[rgba(0,207,255,0.5)] uppercase tracking-wider py-3 px-4 text-center">
                    Score
                  </th>
                  <th className="font-mono text-[10px] text-[rgba(0,207,255,0.5)] uppercase tracking-wider py-3 px-4">
                    Stage
                  </th>
                  <th className="font-mono text-[10px] text-[rgba(0,207,255,0.5)] uppercase tracking-wider py-3 px-4">
                    Owner
                  </th>
                  <th className="font-mono text-[10px] text-[rgba(0,207,255,0.5)] uppercase tracking-wider py-3 px-4">
                    Activity
                  </th>
                  <th className="font-mono text-[10px] text-[rgba(0,207,255,0.5)] uppercase tracking-wider py-3 px-4 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  const filteredLeads = (data?.recentLeads || []).filter((lead) => {
                    const matchesSearch =
                      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      lead.owner.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesStatus =
                      statusFilter === "all" || lead.stage === statusFilter;
                    return matchesSearch && matchesStatus;
                  });
                  if (filteredLeads.length === 0) {
                    return (
                      <tr>
                        <td colSpan={7} className="py-8 text-center font-mono text-xs text-[rgba(0,207,255,0.5)]">
                          NO_LEADS_MATCH_FILTER
                        </td>
                      </tr>
                    );
                  }
                  return filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-[rgba(0,207,255,0.1)] hover:bg-[rgba(0,207,255,0.02)] transition-colors"
                  >
                    <td className="py-3 px-4 font-body text-white font-semibold">
                      {lead.name}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-[rgba(255,255,255,0.7)]">
                      {lead.company}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`font-mono text-xs px-2 py-0.5 rounded-sm ${lead.score >= 80 ? "bg-[rgba(255,51,85,0.15)] text-[#ff3355]" : lead.score >= 60 ? "bg-[rgba(255,170,0,0.15)] text-[#ffaa00]" : "bg-[rgba(0,207,255,0.15)] text-[#00cfff]"}`}
                      >
                        {lead.score}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-[rgba(255,255,255,0.7)]">
                      {lead.stage}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-[rgba(255,255,255,0.7)] flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-[rgba(0,207,255,0.2)] flex items-center justify-center text-[10px] text-[#00cfff] border border-[#00cfff]">
                        {lead.owner.charAt(0)}
                      </div>
                      {lead.owner}
                    </td>
                    <td className="py-3 px-4 font-mono text-xs text-[rgba(255,255,255,0.5)]">
                      {lead.lastActivity}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => router.push(`/sales-assistant/leads/${lead.id}`)}
                        className="font-mono text-[10px] text-[#00cfff] hover:text-white uppercase tracking-wider"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ));
                })()}
              </tbody>
            </table>
          </div>

          {/* LOWER DASHBOARD WIDGETS */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Lead Discovery Summary */}
            <div className="relative bg-[#0a1628] border border-[rgba(0,207,255,0.18)] p-5 flex flex-col">
              <Corners />
              <div className="font-mono text-sm text-[rgba(0,207,255,0.5)] tracking-widest uppercase mb-4 flex items-center gap-2">
                <Sparkles size={14} /> Discovery
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6 flex-1">
                <div>
                  <div className="font-display text-xl text-white">
                    {data.discoverySummary.discovered}
                  </div>
                  <div className="font-mono text-[10px] text-[rgba(255,255,255,0.5)]">
                    Discovered
                  </div>
                </div>
                <div>
                  <div className="font-display text-xl text-[#00ff88]">
                    {data.discoverySummary.aiQualified}
                  </div>
                  <div className="font-mono text-[10px] text-[rgba(255,255,255,0.5)]">
                    AI Qualified
                  </div>
                </div>
                <div>
                  <div className="font-display text-xl text-[#ffaa00]">
                    {data.discoverySummary.highQuality}
                  </div>
                  <div className="font-mono text-[10px] text-[rgba(255,255,255,0.5)]">
                    High Quality
                  </div>
                </div>
                <div>
                  <div className="font-display text-xl text-[#00cfff]">
                    {data.discoverySummary.opportunitiesCreated}
                  </div>
                  <div className="font-mono text-[10px] text-[rgba(255,255,255,0.5)]">
                    Opportunities
                  </div>
                </div>
              </div>
              <button
                onClick={() => router.push("/sales-assistant/lead-discovery")}
                className="w-full text-center border border-[rgba(0,207,255,0.3)] text-[#00cfff] font-mono text-xs py-2 uppercase hover:bg-[rgba(0,207,255,0.1)]"
              >
                Discover More Leads
              </button>
            </div>

            {/* Sales Forecast */}
            <div className="relative bg-[#0a1628] border border-[rgba(0,207,255,0.18)] p-5 flex flex-col">
              <Corners />
              <div className="font-mono text-sm text-[rgba(0,207,255,0.5)] tracking-widest uppercase mb-4 flex items-center gap-2">
                <TrendingUp size={14} /> Forecast
              </div>
              <div className="flex justify-between items-end mb-4">
                <div>
                  <div className="font-mono text-[10px] text-[rgba(255,255,255,0.5)] mb-1">
                    Expected Revenue
                  </div>
                  <div className="font-display text-2xl text-white">
                    {data.forecast.expectedRevenue}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-[10px] text-[rgba(255,255,255,0.5)] mb-1">
                    Confidence
                  </div>
                  <div className="font-mono text-lg text-[#00ff88]">
                    {data.forecast.confidence}%
                  </div>
                </div>
              </div>
              <p className="font-mono text-[10px] text-[rgba(255,255,255,0.5)] leading-relaxed flex-1">
                {data.forecast.explanation}
              </p>
            </div>

            {/* Lead Sources */}
            <div className="relative bg-[#0a1628] border border-[rgba(0,207,255,0.18)] p-5">
              <Corners />
              <div className="font-mono text-sm text-[rgba(0,207,255,0.5)] tracking-widest uppercase mb-4 flex items-center gap-2">
                <PieChart size={14} /> Sources
              </div>
              <div className="flex flex-col gap-2">
                {data.leadSources.map((ls, i) => (
                  <div key={i}>
                    <div className="flex justify-between font-mono text-[11px] mb-1">
                      <span className="text-[rgba(255,255,255,0.7)]">
                        {ls.source}
                      </span>
                      <span className="text-[#00cfff]">{ls.percentage}%</span>
                    </div>
                    <div className="w-full bg-[rgba(0,207,255,0.1)] h-1.5">
                      <div
                        className="bg-[#00cfff] h-full"
                        style={{ width: `${ls.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="relative bg-[#0a1628] border border-[rgba(0,207,255,0.18)] p-5 overflow-y-auto max-h-[220px]">
              <Corners />
              <div className="font-mono text-sm text-[rgba(0,207,255,0.5)] tracking-widest uppercase mb-4 flex items-center gap-2">
                <Activity size={14} /> Activity
              </div>
              <div className="flex flex-col gap-4 relative">
                <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[rgba(0,207,255,0.1)]"></div>
                {data.recentActivity.map((act) => (
                  <div key={act.id} className="flex gap-3 relative z-10">
                    <div className="w-[15px] h-[15px] rounded-full bg-[#0a1628] border-2 border-[#00cfff] shrink-0 mt-0.5"></div>
                    <div>
                      <div className="font-body text-xs text-white mb-0.5">
                        {act.description}
                      </div>
                      <div className="font-mono text-[9px] text-[rgba(255,255,255,0.4)]">
                        {act.timeAgo}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
