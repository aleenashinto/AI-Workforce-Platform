"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Plus,
  Target,
  Building2,
  TrendingUp,
  Filter,
  Settings,
  Activity,
  ArrowRight,
  Wand2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api/client";
import { useRouter } from "next/navigation";

export default function ICPOverviewPage() {
  const router = useRouter();
  const [icps, setIcps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIcps = async () => {
      try {
        const data = await apiClient.get("/icps");
        setIcps(data.data || data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchIcps();
  }, []);

  const activeIcp = icps.find((i) => i.status === "active") || icps[0];
  const inactiveIcps = icps.filter((i) => i.id !== activeIcp?.id);

  if (loading) {
    return (
      <div className="text-center py-12 text-[color:var(--t-text)]">Loading ICPs...</div>
    );
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Target className="w-8 h-8 text-indigo-400" />
            Ideal Customer Profile
          </h1>
          <p className="text-[color:var(--t-text)] mt-1">
            Define and manage who your AI Sales Assistant targets.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/sales-assistant/icps/create")}
            className="bg-[#1E1E2E] border-[#3F3F5A] text-white hover:bg-[#2A2A3C]"
          >
            <Wand2 className="w-4 h-4 mr-2 text-indigo-400" /> AI Build ICP
          </Button>
          <Button
            onClick={() => router.push("/sales-assistant/icps/create")}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4 mr-2" /> Create ICP
          </Button>
        </div>
      </div>

      {!activeIcp ? (
        <Card className="bg-[#1E1E2E] border-[#3F3F5A] p-12 text-center flex flex-col items-center">
          <Target className="w-16 h-16 text-[#3F3F5A] mb-4" />
          <h2 className="text-2xl font-semibold text-white mb-2">
            No Active ICP
          </h2>
          <p className="text-[color:var(--t-text)] max-w-md mx-auto mb-6">
            Create your first Ideal Customer Profile to start discovering
            high-fit leads automatically.
          </p>
          <Button
            onClick={() => router.push("/sales-assistant/icps/create")}
            className="bg-indigo-600"
          >
            Build your first ICP
          </Button>
        </Card>
      ) : (
        <>
          {/* ACTIVE ICP OVERVIEW */}
          <div className="bg-gradient-to-br from-[#1E1E2E] to-[#252538] border border-indigo-500/20 rounded-xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-[#3F3F5A] flex justify-between items-center bg-black/20">
              <div className="flex items-center gap-4">
                <div className="bg-indigo-500/20 p-3 rounded-lg">
                  <Target className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                      Active ICP
                    </span>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                      LIVE
                    </Badge>
                  </div>
                  <h2 className="text-2xl font-bold text-white">
                    {activeIcp.name}
                  </h2>
                  <p className="text-sm text-[color:var(--t-text)] mt-1">
                    {activeIcp.description || "No description provided."}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="border-[#3F3F5A] text-[color:var(--t-text)] hover:text-white bg-transparent"
                >
                  Edit ICP
                </Button>
                <Button
                  variant="outline"
                  className="border-[#3F3F5A] text-[color:var(--t-text)] hover:text-white bg-transparent"
                >
                  Performance
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-4 divide-x divide-[#3F3F5A] bg-black/10">
              <div className="p-6 text-center">
                <div className="text-sm text-[color:var(--t-text)] mb-1">Match Rate</div>
                <div className="text-3xl font-bold text-emerald-400">
                  {activeIcp.match_rate || "0"}%
                </div>
              </div>
              <div className="p-6 text-center">
                <div className="text-sm text-[color:var(--t-text)] mb-1">
                  Target Companies
                </div>
                <div className="text-3xl font-bold text-white">
                  {(
                    activeIcp.performance_metrics?.companies_discovered || 0
                  ).toLocaleString()}
                </div>
              </div>
              <div className="p-6 text-center">
                <div className="text-sm text-[color:var(--t-text)] mb-1">
                  High-Fit Companies
                </div>
                <div className="text-3xl font-bold text-indigo-400">
                  {(
                    activeIcp.performance_metrics?.matched_companies || 0
                  ).toLocaleString()}
                </div>
              </div>
              <div className="p-6 text-center">
                <div className="text-sm text-[color:var(--t-text)] mb-1">
                  Qualified Leads
                </div>
                <div className="text-3xl font-bold text-amber-400">
                  {(
                    activeIcp.performance_metrics?.qualified_leads || 0
                  ).toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <Card className="bg-[#1E1E2E] border-[#3F3F5A]">
              <CardHeader className="pb-3 border-b border-[#3F3F5A]">
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Building2 className="w-5 h-5 text-[color:var(--t-text)]" />
                  Company Criteria
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-[color:var(--t-text)] uppercase tracking-wider block mb-1">
                      Industries
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {activeIcp.criteria?.industries?.length ? (
                        activeIcp.criteria.industries.map((ind: string) => (
                          <Badge
                            key={ind}
                            variant="secondary"
                            className="bg-[#2A2A3C] text-[color:var(--t-text)]"
                          >
                            {ind}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-[color:var(--t-text)]">Any</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-[color:var(--t-text)] uppercase tracking-wider block mb-1">
                      Locations
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {activeIcp.criteria?.geography?.length ? (
                        activeIcp.criteria.geography.map((loc: string) => (
                          <Badge
                            key={loc}
                            variant="secondary"
                            className="bg-[#2A2A3C] text-[color:var(--t-text)]"
                          >
                            {loc}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-[color:var(--t-text)]">Any</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-[color:var(--t-text)] uppercase tracking-wider block mb-1">
                      Company Size
                    </span>
                    <div className="text-sm text-[color:var(--t-text)]">
                      {activeIcp.criteria?.companySize?.join(", ") || "Any"}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-[color:var(--t-text)] uppercase tracking-wider block mb-1">
                      Revenue
                    </span>
                    <div className="text-sm text-[color:var(--t-text)]">
                      {activeIcp.criteria?.revenue?.join(", ") || "Any"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1E1E2E] border-[#3F3F5A]">
              <CardHeader className="pb-3 border-b border-[#3F3F5A]">
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Users className="w-5 h-5 text-[color:var(--t-text)]" />
                  Contact Criteria
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-[color:var(--t-text)] uppercase tracking-wider block mb-1">
                      Departments
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {activeIcp.persona?.departments?.length ? (
                        activeIcp.persona.departments.map((dep: string) => (
                          <Badge
                            key={dep}
                            variant="secondary"
                            className="bg-[#2A2A3C] text-[color:var(--t-text)]"
                          >
                            {dep}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-[color:var(--t-text)]">Any</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-[color:var(--t-text)] uppercase tracking-wider block mb-1">
                      Seniority
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {activeIcp.persona?.seniority?.length ? (
                        activeIcp.persona.seniority.map((sen: string) => (
                          <Badge
                            key={sen}
                            variant="secondary"
                            className="bg-[#2A2A3C] text-[color:var(--t-text)]"
                          >
                            {sen}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-[color:var(--t-text)]">Any</span>
                      )}
                    </div>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-[color:var(--t-text)] uppercase tracking-wider block mb-1">
                      Job Titles
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {activeIcp.persona?.titles?.length ? (
                        activeIcp.persona.titles.map((title: string) => (
                          <Badge
                            key={title}
                            variant="secondary"
                            className="bg-[#2A2A3C] text-[color:var(--t-text)]"
                          >
                            {title}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-[color:var(--t-text)]">Any</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1E1E2E] border-[#3F3F5A]">
              <CardHeader className="pb-3 border-b border-[#3F3F5A]">
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Activity className="w-5 h-5 text-[color:var(--t-text)]" />
                  Technology & Signals
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-4">
                <div>
                  <span className="text-xs text-[color:var(--t-text)] uppercase tracking-wider block mb-1">
                    Technologies
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeIcp.criteria?.technologies?.length ? (
                      activeIcp.criteria.technologies.map((tech: string) => (
                        <div
                          key={tech}
                          className="bg-[#2A2A3C] px-2 py-1 rounded text-sm text-[color:var(--t-text)] flex items-center gap-2"
                        >
                          <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>{" "}
                          {tech}
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-[color:var(--t-text)]">
                        None specified
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-xs text-[color:var(--t-text)] uppercase tracking-wider block mb-1">
                    Buying Signals
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {activeIcp.criteria?.buyingSignals?.length ? (
                      activeIcp.criteria.buyingSignals.map((sig: string) => (
                        <div
                          key={sig}
                          className="bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded text-sm text-amber-400 flex items-center gap-2"
                        >
                          🔥 {sig}
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-[color:var(--t-text)]">
                        None specified
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#1E1E2E] border-[#3F3F5A]">
              <CardHeader className="pb-3 border-b border-[#3F3F5A]">
                <CardTitle className="text-lg flex items-center gap-2 text-white">
                  <Filter className="w-5 h-5 text-[color:var(--t-text)]" />
                  Exclusion Criteria
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {activeIcp.disqualifiers?.length ? (
                  <ul className="space-y-2">
                    {activeIcp.disqualifiers.map((disq: string) => (
                      <li
                        key={disq}
                        className="flex items-center gap-2 text-sm text-rose-400"
                      >
                        <span className="w-4 h-4 rounded-full bg-rose-500/20 flex items-center justify-center text-xs">
                          ✕
                        </span>
                        {disq}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-[color:var(--t-text)]">
                    No exclusion criteria defined.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* OTHER ICPS */}
      {inactiveIcps.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold text-white mb-4">My ICPs</h3>
          <div className="grid grid-cols-3 gap-4">
            {inactiveIcps.map((icp) => (
              <Card
                key={icp.id}
                className="bg-[#1E1E2E] border-[#3F3F5A] cursor-pointer hover:border-gray-500 transition-colors"
              >
                <CardHeader className="p-4 pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-base text-white">
                      {icp.name}
                    </CardTitle>
                    <Badge
                      variant="outline"
                      className="text-[color:var(--t-text)] border-[#3F3F5A] bg-transparent"
                    >
                      {icp.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="text-sm text-[color:var(--t-text)] mb-3 line-clamp-2">
                    {icp.description || "No description"}
                  </div>
                  <div className="flex items-center justify-between text-sm pt-3 border-t border-[#3F3F5A]">
                    <span className="text-[color:var(--t-text)]">
                      Match Rate:{" "}
                      <span className="text-white font-medium">
                        {icp.match_rate || "0"}%
                      </span>
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10"
                    >
                      View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
