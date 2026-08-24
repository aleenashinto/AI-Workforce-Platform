"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  ArrowDownRight,
  ArrowUpRight,
  MessageSquare,
  Bot,
  Users,
  ThumbsUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/api/client";

export default function SupportAnalyticsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await apiClient.get("/analytics/support");
        if (res) setData(res);
      } catch (err) {
        console.error(err);
      }
    };
    fetchAnalytics();
  }, []);

  const volumeData = data?.volumeData || [
    { name: "Mon", total: 120, ai: 95 },
    { name: "Tue", total: 150, ai: 120 },
    { name: "Wed", total: 180, ai: 150 },
    { name: "Thu", total: 140, ai: 110 },
    { name: "Fri", total: 160, ai: 135 },
    { name: "Sat", total: 90, ai: 85 },
    { name: "Sun", total: 70, ai: 65 },
  ];

  const csatData = data?.csatData || [
    { name: "1 Star", count: 5 },
    { name: "2 Stars", count: 12 },
    { name: "3 Stars", count: 25 },
    { name: "4 Stars", count: 85 },
    { name: "5 Stars", count: 210 },
  ];

  const gapsData = data?.gapsData || [
    { topic: "API Rate Limits", count: 45, status: "unanswered" },
    { topic: "SSO Configuration", count: 32, status: "unanswered" },
    { topic: "Billing History PDF", count: 28, status: "unanswered" },
  ];

  const stats = data?.stats || {
    deflectionRate: "82.4%",
    deflectionChange: "+4.1%",
    totalConversations: 910,
    conversationsChange: "-2.5%",
    escalated: 160,
    escalatedChange: "-12%",
    avgCsat: "4.6/5",
    avgCsatChange: "+0.2",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Support Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Monitor the performance and impact of your AI support agent.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-[#2A2A3C] border-[#3F3F5A] text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-400">
              Deflection Rate
            </CardTitle>
            <Bot className="w-4 h-4 text-emerald-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.deflectionRate}</div>
            <p className="text-xs text-emerald-400 flex items-center mt-1">
              {stats.deflectionChange.startsWith("+") ? (
                <ArrowUpRight className="w-3 h-3 mr-1" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-1" />
              )}
              {stats.deflectionChange} from last week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#2A2A3C] border-[#3F3F5A] text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-400">
              Total Conversations
            </CardTitle>
            <MessageSquare className="w-4 h-4 text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversations}</div>
            <p className="text-xs text-rose-400 flex items-center mt-1">
              {stats.conversationsChange.startsWith("+") ? (
                <ArrowUpRight className="w-3 h-3 mr-1" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-1" />
              )}
              {stats.conversationsChange} from last week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#2A2A3C] border-[#3F3F5A] text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-400">
              Escalated to Human
            </CardTitle>
            <Users className="w-4 h-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.escalated}</div>
            <p className="text-xs text-emerald-400 flex items-center mt-1">
              {stats.escalatedChange.startsWith("+") ? (
                <ArrowUpRight className="w-3 h-3 mr-1" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-1" />
              )}
              {stats.escalatedChange} from last week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#2A2A3C] border-[#3F3F5A] text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium text-gray-400">
              Avg CSAT
            </CardTitle>
            <ThumbsUp className="w-4 h-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgCsat}</div>
            <p className="text-xs text-emerald-400 flex items-center mt-1">
              {stats.avgCsatChange.startsWith("+") ? (
                <ArrowUpRight className="w-3 h-3 mr-1" />
              ) : (
                <ArrowDownRight className="w-3 h-3 mr-1" />
              )}
              {stats.avgCsatChange} from last week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="bg-[#2A2A3C] border-[#3F3F5A] text-white col-span-4">
          <CardHeader>
            <CardTitle>Conversation Volume</CardTitle>
            <CardDescription className="text-gray-400">
              AI handled vs Total conversations over time
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={volumeData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#3F3F5A"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E1E2E",
                    border: "1px solid #3F3F5A",
                    borderRadius: "8px",
                  }}
                  itemStyle={{ color: "#E5E7EB" }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#6B7280"
                  strokeWidth={2}
                  dot={false}
                  name="Total"
                />
                <Line
                  type="monotone"
                  dataKey="ai"
                  stroke="#4F46E5"
                  strokeWidth={3}
                  dot={false}
                  name="AI Handled"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-[#2A2A3C] border-[#3F3F5A] text-white col-span-3">
          <CardHeader>
            <CardTitle>CSAT Distribution</CardTitle>
            <CardDescription className="text-gray-400">
              Customer satisfaction scores
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={csatData}
                layout="vertical"
                margin={{ top: 0, right: 0, left: 20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#3F3F5A"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  hide
                />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="#9CA3AF"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#3F3F5A", opacity: 0.4 }}
                  contentStyle={{
                    backgroundColor: "#1E1E2E",
                    border: "1px solid #3F3F5A",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#2A2A3C] border-[#3F3F5A] text-white">
        <CardHeader>
          <CardTitle>Knowledge Gaps</CardTitle>
          <CardDescription className="text-gray-400">
            Most frequent topics the AI failed to answer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {gapsData.map((gap: any, i: number) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-[#1E1E2E] rounded-lg border border-[#3F3F5A]"
              >
                <div>
                  <h4 className="font-medium text-gray-200">{gap.topic}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {gap.count} failed queries
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="border-indigo-500 text-indigo-400 hover:bg-indigo-500/10"
                >
                  Add to Knowledge Base
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
