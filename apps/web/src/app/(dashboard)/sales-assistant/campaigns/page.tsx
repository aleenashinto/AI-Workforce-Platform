"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Play,
  Pause,
  Search,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
  Mail,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { apiClient } from "@/lib/api/client";

export default function CampaignsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newCampaignName, setNewCampaignName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchCampaigns = async () => {
    try {
      const data = await apiClient.get("/campaigns");
      setCampaigns(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    fetchCampaigns();
  }, []);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCampaignName.trim()) return;
    try {
      const res = await apiClient.post("/campaigns", {
        name: newCampaignName,
        status: "draft",
        sent: 0,
        replied: 0,
        clickRate: "0%",
      });
      setCampaigns([...campaigns, res]);
      setShowNewForm(false);
      setNewCampaignName("");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Outreach Campaigns
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor automated AI email campaigns.
          </p>
        </div>
        <Button
          onClick={() => setShowNewForm(true)}
          className="bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="w-4 h-4 mr-2" /> New Campaign
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-[#2A2A3C] border-[#3F3F5A] text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Emails Sent
            </CardTitle>
            <Mail className="w-4 h-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">465</div>
            <p className="text-xs text-emerald-400 flex items-center mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              +12.5% from last week
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#2A2A3C] border-[#3F3F5A] text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-400">
              Average Reply Rate
            </CardTitle>
            <Mail className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.3%</div>
            <p className="text-xs text-emerald-400 flex items-center mt-1">
              <ArrowUpRight className="w-3 h-3 mr-1" />
              +1.2% from last week
            </p>
          </CardContent>
        </Card>
        <Card className="bg-[#2A2A3C] border-[#3F3F5A] text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-400">
              Meetings Booked
            </CardTitle>
            <Mail className="w-4 h-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-rose-400 flex items-center mt-1">
              <ArrowDownRight className="w-3 h-3 mr-1" />
              -2 from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center bg-[#1E1E2E] p-4 rounded-xl border border-[#3F3F5A]">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search campaigns..."
            className="pl-9 bg-[#2A2A3C] border-[#3F3F5A] text-white"
          />
        </div>
      </div>

      {showNewForm && (
        <Card className="bg-[#2A2A3C] border-[#3F3F5A] text-white mb-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Create New Campaign</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowNewForm(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleCreateCampaign}
              className="flex gap-4 items-center"
            >
              <Input
                value={newCampaignName}
                onChange={(e) => setNewCampaignName(e.target.value)}
                placeholder="Campaign Name..."
                className="bg-[#1E1E2E] border-[#3F3F5A] text-white"
                autoFocus
              />
              <Button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                Create
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-400">
          Loading campaigns...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          No campaigns found. Create one to get started!
        </div>
      ) : (
        <div className="grid gap-4">
          {campaigns
            .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
            .map((campaign) => (
            <Card
              key={campaign.id}
              className="bg-[#1E1E2E] border-[#3F3F5A] text-white hover:bg-[#2A2A3C]/50 transition-colors"
            >
              <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{campaign.name}</h3>
                    <Badge
                      variant="outline"
                      className={
                        campaign.status === "active"
                          ? "text-emerald-400 border-emerald-500/50 bg-emerald-500/10"
                          : campaign.status === "draft"
                            ? "text-gray-400 border-gray-500/50 bg-gray-500/10"
                            : "text-blue-400 border-blue-500/50 bg-blue-500/10"
                      }
                    >
                      {(campaign.status || "draft").toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400">
                    Targeting enriched leads based on AI prompt template.
                  </p>
                </div>

                <div className="flex items-center gap-8 px-8 py-2 bg-[#2A2A3C] rounded-lg border border-[#3F3F5A]/50">
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-200">
                      {campaign.sent || 0}
                    </p>
                    <p className="text-xs text-gray-500 uppercase">Sent</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-gray-200">
                      {campaign.replied || 0}
                    </p>
                    <p className="text-xs text-gray-500 uppercase">Replied</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-emerald-400">
                      {campaign.clickRate || "0%"}
                    </p>
                    <p className="text-xs text-gray-500 uppercase">
                      Reply Rate
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-[#3F3F5A] text-gray-300 hover:text-white hover:bg-[#3F3F5A]"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                  {campaign.status === "active" ? (
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10"
                    >
                      <Pause className="w-4 h-4" />
                    </Button>
                  ) : !campaign.status || campaign.status === "draft" ? (
                    <Button
                      variant="outline"
                      size="icon"
                      className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                    >
                      <Play className="w-4 h-4" />
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
