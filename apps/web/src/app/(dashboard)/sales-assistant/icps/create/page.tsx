"use client";

import { useState } from "react";
import { ArrowLeft, Wand2, Plus, Target, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api/client";
import { useRouter } from "next/navigation";

export default function CreateICPPage() {
  const router = useRouter();
  const [method, setMethod] = useState<"select" | "manual" | "ai">("select");

  // AI State
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  // Form State
  const [icpName, setIcpName] = useState("");
  const [description, setDescription] = useState("");

  // Criteria State (Simple arrays for this demo)
  const [industries, setIndustries] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [companySize, setCompanySize] = useState<string[]>([]);
  const [revenue, setRevenue] = useState<string[]>([]);
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [buyingSignals, setBuyingSignals] = useState<string[]>([]);

  // Persona State
  const [jobTitles, setJobTitles] = useState<string[]>([]);
  const [seniority, setSeniority] = useState<string[]>([]);

  // Input States for Arrays
  const [inputState, setInputState] = useState({
    ind: "",
    loc: "",
    size: "",
    rev: "",
    tech: "",
    sig: "",
    title: "",
    sen: "",
  });

  const addTag = (
    field: string,
    value: string,
    setter: any,
    stateArr: string[],
  ) => {
    if (value.trim() && !stateArr.includes(value.trim())) {
      setter([...stateArr, value.trim()]);
      setInputState((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const removeTag = (value: string, setter: any, stateArr: string[]) => {
    setter(stateArr.filter((i) => i !== value));
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return;
    setGenerating(true);
    try {
      const res = await apiClient.post("/icps/generate", { prompt: aiPrompt });
      const { criteria, persona } = res.data;

      setIcpName("AI Generated ICP");
      setDescription("Generated from: " + aiPrompt.slice(0, 50) + "...");
      setIndustries(criteria.industries || []);
      setLocations(criteria.geography || []);
      setCompanySize(criteria.companySize || []);
      setRevenue(criteria.revenue || []);
      setTechnologies(criteria.technologies || []);
      setBuyingSignals(criteria.buyingSignals || []);
      setJobTitles(persona.titles || []);
      setSeniority(persona.seniority || []);

      setMethod("manual"); // Move to manual edit mode
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    try {
      await apiClient.post("/icps", {
        name: icpName || "Untitled ICP",
        description,
        status: "active",
        match_rate: "92", // Mock value for demo
        criteria: {
          industries,
          geography: locations,
          companySize,
          revenue,
          technologies,
          buyingSignals,
        },
        persona: {
          titles: jobTitles,
          seniority,
          departments: [],
        },
      });
      router.push("/sales-assistant/icps");
    } catch (err) {
      console.error(err);
    }
  };

  if (method === "select") {
    return (
      <div className="space-y-6 max-w-4xl mx-auto mt-8">
        <Button
          variant="ghost"
          onClick={() => router.push("/sales-assistant/icps")}
          className="text-[color:var(--t-text)] hover:text-white px-0"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to ICPs
        </Button>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Create Ideal Customer Profile
        </h1>
        <p className="text-[color:var(--t-text)]">
          How would you like to define your target customer?
        </p>

        <div className="grid md:grid-cols-2 gap-6 mt-8">
          <Card
            className="bg-[#1E1E2E] border-[#3F3F5A] cursor-pointer hover:border-indigo-500 transition-all hover:-translate-y-1 group"
            onClick={() => setMethod("ai")}
          >
            <CardHeader>
              <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-500/30">
                <Wand2 className="w-6 h-6 text-indigo-400" />
              </div>
              <CardTitle className="text-white">AI ICP Builder</CardTitle>
              <CardDescription className="text-[color:var(--t-text)] mt-2">
                Describe your ideal customer in plain English and let our AI
                generate the perfect profile criteria, job titles, and buying
                signals.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card
            className="bg-[#1E1E2E] border-[#3F3F5A] cursor-pointer hover:border-gray-400 transition-all hover:-translate-y-1 group"
            onClick={() => setMethod("manual")}
          >
            <CardHeader>
              <div className="w-12 h-12 bg-[#2A2A3C] rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#3F3F5A]">
                <Target className="w-6 h-6 text-[color:var(--t-text)]" />
              </div>
              <CardTitle className="text-white">Manual Builder</CardTitle>
              <CardDescription className="text-[color:var(--t-text)] mt-2">
                Manually specify exactly which industries, company sizes,
                locations, and decision-makers you want to target.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (method === "ai") {
    return (
      <div className="space-y-6 max-w-3xl mx-auto mt-8">
        <Button
          variant="ghost"
          onClick={() => setMethod("select")}
          className="text-[color:var(--t-text)] hover:text-white px-0"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <Card className="bg-[#1E1E2E] border-[#3F3F5A] shadow-xl">
          <CardHeader className="border-b border-[#3F3F5A] pb-6 bg-indigo-900/10">
            <div className="flex items-center gap-3 mb-2">
              <Wand2 className="w-6 h-6 text-indigo-400" />
              <CardTitle className="text-2xl text-white">
                Describe your ideal customer
              </CardTitle>
            </div>
            <CardDescription className="text-[color:var(--t-text)] text-base">
              Example: "I want to sell our AI customer support platform to SaaS
              companies in Europe with 50-500 employees, growing quickly, using
              AWS, and hiring customer-support employees."
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <Textarea
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="Describe who you want to sell to..."
              className="min-h-[150px] bg-[#0a0a0f] border-[#3F3F5A] text-white text-lg p-4"
            />
            <div className="flex justify-end pt-2">
              <Button
                onClick={generateWithAI}
                disabled={generating || !aiPrompt.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-indigo-900/20"
              >
                {generating
                  ? "Analyzing & Generating..."
                  : "Generate ICP Profile"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto mt-8 pb-20">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => setMethod("select")}
            className="text-[color:var(--t-text)] hover:text-white px-2"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Create Ideal Customer Profile
            </h1>
            <p className="text-[color:var(--t-text)] text-sm">
              Define the firmographic and technographic criteria.
            </p>
          </div>
        </div>
        <Button
          onClick={handleSave}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-8"
        >
          Save ICP
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 space-y-6">
          <Card className="bg-[#1E1E2E] border-[#3F3F5A]">
            <CardHeader className="pb-4 border-b border-[#3F3F5A]">
              <CardTitle className="text-lg text-white">
                General Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="text-sm text-[color:var(--t-text)] mb-1 block">
                  ICP Name
                </label>
                <Input
                  value={icpName}
                  onChange={(e) => setIcpName(e.target.value)}
                  placeholder="e.g. European SaaS Growth Companies"
                  className="bg-[#0a0a0f] border-[#3F3F5A] text-white"
                />
              </div>
              <div>
                <label className="text-sm text-[color:var(--t-text)] mb-1 block">
                  Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is the goal of this ICP?"
                  className="bg-[#0a0a0f] border-[#3F3F5A] text-white"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1E1E2E] border-[#3F3F5A]">
            <CardHeader className="pb-4 border-b border-[#3F3F5A]">
              <CardTitle className="text-lg text-white">
                Company Fit Criteria
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Industries */}
              <div>
                <label className="text-sm font-medium text-[color:var(--t-text)] block mb-2">
                  Industry
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={inputState.ind}
                    onChange={(e) =>
                      setInputState({ ...inputState, ind: e.target.value })
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      addTag("ind", inputState.ind, setIndustries, industries)
                    }
                    className="bg-[#0a0a0f] border-[#3F3F5A] text-white"
                    placeholder="Add industry (e.g. SaaS)"
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      addTag("ind", inputState.ind, setIndustries, industries)
                    }
                    className="border-[#3F3F5A] bg-[#2A2A3C] text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {industries.map((i) => (
                    <Badge
                      key={i}
                      className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 pl-3 pr-1 py-1 flex items-center gap-1"
                    >
                      {i}{" "}
                      <XIcon
                        onClick={() => removeTag(i, setIndustries, industries)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Locations */}
              <div>
                <label className="text-sm font-medium text-[color:var(--t-text)] block mb-2">
                  Location
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={inputState.loc}
                    onChange={(e) =>
                      setInputState({ ...inputState, loc: e.target.value })
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      addTag("loc", inputState.loc, setLocations, locations)
                    }
                    className="bg-[#0a0a0f] border-[#3F3F5A] text-white"
                    placeholder="Add location (e.g. Europe, Germany)"
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      addTag("loc", inputState.loc, setLocations, locations)
                    }
                    className="border-[#3F3F5A] bg-[#2A2A3C] text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {locations.map((i) => (
                    <Badge
                      key={i}
                      className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 pl-3 pr-1 py-1 flex items-center gap-1"
                    >
                      {i}{" "}
                      <XIcon
                        onClick={() => removeTag(i, setLocations, locations)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Grid for Size and Rev */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-[color:var(--t-text)] block mb-2">
                    Company Size
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={inputState.size}
                      onChange={(e) =>
                        setInputState({ ...inputState, size: e.target.value })
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        addTag(
                          "size",
                          inputState.size,
                          setCompanySize,
                          companySize,
                        )
                      }
                      className="bg-[#0a0a0f] border-[#3F3F5A] text-white"
                      placeholder="e.g. 50-500"
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        addTag(
                          "size",
                          inputState.size,
                          setCompanySize,
                          companySize,
                        )
                      }
                      className="border-[#3F3F5A] bg-[#2A2A3C] text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {companySize.map((i) => (
                      <Badge
                        key={i}
                        className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 pl-3 pr-1 py-1 flex items-center gap-1"
                      >
                        {i}{" "}
                        <XIcon
                          onClick={() =>
                            removeTag(i, setCompanySize, companySize)
                          }
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[color:var(--t-text)] block mb-2">
                    Annual Revenue
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={inputState.rev}
                      onChange={(e) =>
                        setInputState({ ...inputState, rev: e.target.value })
                      }
                      onKeyDown={(e) =>
                        e.key === "Enter" &&
                        addTag("rev", inputState.rev, setRevenue, revenue)
                      }
                      className="bg-[#0a0a0f] border-[#3F3F5A] text-white"
                      placeholder="e.g. -"
                    />
                    <Button
                      variant="outline"
                      onClick={() =>
                        addTag("rev", inputState.rev, setRevenue, revenue)
                      }
                      className="border-[#3F3F5A] bg-[#2A2A3C] text-white"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {revenue.map((i) => (
                      <Badge
                        key={i}
                        className="bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 pl-3 pr-1 py-1 flex items-center gap-1"
                      >
                        {i}{" "}
                        <XIcon
                          onClick={() => removeTag(i, setRevenue, revenue)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-[#1E1E2E] border-[#3F3F5A]">
            <CardHeader className="pb-4 border-b border-[#3F3F5A]">
              <CardTitle className="text-lg text-white">
                Decision-Maker Criteria
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <label className="text-sm font-medium text-[color:var(--t-text)] block mb-2">
                  Job Titles
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={inputState.title}
                    onChange={(e) =>
                      setInputState({ ...inputState, title: e.target.value })
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      addTag("title", inputState.title, setJobTitles, jobTitles)
                    }
                    className="bg-[#0a0a0f] border-[#3F3F5A] text-white"
                    placeholder="e.g. CTO, VP Engineering"
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      addTag("title", inputState.title, setJobTitles, jobTitles)
                    }
                    className="border-[#3F3F5A] bg-[#2A2A3C] px-3"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {jobTitles.map((i) => (
                    <Badge
                      key={i}
                      className="bg-blue-500/20 text-blue-300 border border-blue-500/30 pl-3 pr-1 py-1 flex items-center gap-1"
                    >
                      {i}{" "}
                      <XIcon
                        onClick={() => removeTag(i, setJobTitles, jobTitles)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[color:var(--t-text)] block mb-2">
                  Seniority
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={inputState.sen}
                    onChange={(e) =>
                      setInputState({ ...inputState, sen: e.target.value })
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      addTag("sen", inputState.sen, setSeniority, seniority)
                    }
                    className="bg-[#0a0a0f] border-[#3F3F5A] text-white"
                    placeholder="e.g. C-Level, VP"
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      addTag("sen", inputState.sen, setSeniority, seniority)
                    }
                    className="border-[#3F3F5A] bg-[#2A2A3C] px-3"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {seniority.map((i) => (
                    <Badge
                      key={i}
                      className="bg-blue-500/20 text-blue-300 border border-blue-500/30 pl-3 pr-1 py-1 flex items-center gap-1"
                    >
                      {i}{" "}
                      <XIcon
                        onClick={() => removeTag(i, setSeniority, seniority)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1E1E2E] border-[#3F3F5A]">
            <CardHeader className="pb-4 border-b border-[#3F3F5A]">
              <CardTitle className="text-lg text-white">
                Technology & Signals
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div>
                <label className="text-sm font-medium text-[color:var(--t-text)] block mb-2">
                  Technologies
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={inputState.tech}
                    onChange={(e) =>
                      setInputState({ ...inputState, tech: e.target.value })
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      addTag(
                        "tech",
                        inputState.tech,
                        setTechnologies,
                        technologies,
                      )
                    }
                    className="bg-[#0a0a0f] border-[#3F3F5A] text-white"
                    placeholder="e.g. AWS, React"
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      addTag(
                        "tech",
                        inputState.tech,
                        setTechnologies,
                        technologies,
                      )
                    }
                    className="border-[#3F3F5A] bg-[#2A2A3C] px-3"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {technologies.map((i) => (
                    <Badge
                      key={i}
                      className="bg-gray-700 text-gray-200 border border-gray-600 pl-3 pr-1 py-1 flex items-center gap-1"
                    >
                      {i}{" "}
                      <XIcon
                        onClick={() =>
                          removeTag(i, setTechnologies, technologies)
                        }
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-[color:var(--t-text)] block mb-2">
                  Buying Signals
                </label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={inputState.sig}
                    onChange={(e) =>
                      setInputState({ ...inputState, sig: e.target.value })
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" &&
                      addTag(
                        "sig",
                        inputState.sig,
                        setBuyingSignals,
                        buyingSignals,
                      )
                    }
                    className="bg-[#0a0a0f] border-[#3F3F5A] text-white"
                    placeholder="e.g. Recently Funded"
                  />
                  <Button
                    variant="outline"
                    onClick={() =>
                      addTag(
                        "sig",
                        inputState.sig,
                        setBuyingSignals,
                        buyingSignals,
                      )
                    }
                    className="border-[#3F3F5A] bg-[#2A2A3C] px-3"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {buyingSignals.map((i) => (
                    <Badge
                      key={i}
                      className="bg-amber-500/10 text-amber-400 border border-amber-500/20 pl-3 pr-1 py-1 flex items-center gap-1"
                    >
                      🔥 {i}{" "}
                      <XIcon
                        onClick={() =>
                          removeTag(i, setBuyingSignals, buyingSignals)
                        }
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function XIcon({ onClick }: { onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="w-4 h-4 hover:bg-black/20 rounded-full flex items-center justify-center cursor-pointer opacity-70 hover:opacity-100 transition-all"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </svg>
    </div>
  );
}
