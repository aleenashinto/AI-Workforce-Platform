"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Send,
  PauseCircle,
  PlayCircle,
  BarChart,
  Inbox,
  Users,
} from "lucide-react";

export default function SendDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [stats, setStats] = useState({
    sent: 0,
    total: 0,
    opens: 0,
    clicks: 0,
    replies: 0,
    bounces: 0,
  });
  const [status, setStatus] = useState<"sending" | "paused" | "completed">(
    "paused",
  );

  // Mock data for demo since we don't have a real send API yet
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStats({
      total: 120,
      sent: 45,
      opens: 12,
      clicks: 3,
      replies: 1,
      bounces: 0,
    });
    setStatus("sending");
  }, [id]);

  const toggleStatus = () => {
    setStatus(status === "sending" ? "paused" : "sending");
  };

  const progressPercent =
    stats.total > 0 ? (stats.sent / stats.total) * 100 : 0;

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      <div
        className="flex items-center text-sm text-[color:var(--t-text)] mb-4 cursor-pointer hover:text-white"
        onClick={() => router.back()}
      >
        <ArrowLeft className="h-4 w-4 mr-1" /> Back to Sequence
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Send Dashboard
          </h1>
          <p className="text-[color:var(--t-text)] mt-2">
            Monitor delivery and performance in real-time.
          </p>
        </div>
        <Button
          variant={status === "sending" ? "destructive" : "default"}
          onClick={toggleStatus}
          className={
            status === "sending"
              ? "bg-red-600 hover:bg-red-700 text-white"
              : "bg-emerald-600 hover:bg-emerald-700 text-white"
          }
        >
          {status === "sending" ? (
            <>
              <PauseCircle className="h-4 w-4 mr-2" /> Pause Sending
            </>
          ) : (
            <>
              <PlayCircle className="h-4 w-4 mr-2" /> Resume Sending
            </>
          )}
        </Button>
      </div>

      <Card className="shadow-sm bg-[#1E1E2E] border-[#3F3F5A]">
        <CardContent className="p-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-[color:var(--t-text)]">Progress</span>
            <span className="text-sm font-medium text-white">
              {stats.sent} / {stats.total} Emails Sent
            </span>
          </div>
          <Progress
            value={progressPercent}
            className="h-3 mb-2 bg-[#2A2A3C] [&>div]:bg-gradient-to-r [&>div]:from-[#D122E3] [&>div]:to-[#00F2FE]"
          />
          <p className="text-xs text-[color:var(--t-text)] text-right">
            {Math.round(progressPercent)}% completed
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-sm bg-[#1E1E2E] border-[#3F3F5A]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-blue-400 mb-2">
              <Send className="h-5 w-5" />
              <h3 className="font-medium">Sent</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.sent}</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm bg-[#1E1E2E] border-[#3F3F5A]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-emerald-400 mb-2">
              <Inbox className="h-5 w-5" />
              <h3 className="font-medium">Opens</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.opens}</p>
            <p className="text-xs text-[color:var(--t-text)] mt-1">
              {stats.sent ? Math.round((stats.opens / stats.sent) * 100) : 0}%
              open rate
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm bg-[#1E1E2E] border-[#3F3F5A]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-purple-400 mb-2">
              <BarChart className="h-5 w-5" />
              <h3 className="font-medium">Clicks</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.clicks}</p>
            <p className="text-xs text-[color:var(--t-text)] mt-1">
              {stats.opens ? Math.round((stats.clicks / stats.opens) * 100) : 0}
              % click-to-open
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm bg-[#1E1E2E] border-[#3F3F5A]">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2 text-indigo-400 mb-2">
              <Users className="h-5 w-5" />
              <h3 className="font-medium">Replies</h3>
            </div>
            <p className="text-3xl font-bold text-white">{stats.replies}</p>
            <p className="text-xs text-[color:var(--t-text)] mt-1">
              {stats.sent ? Math.round((stats.replies / stats.sent) * 100) : 0}%
              reply rate
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm mt-8 border-amber-900/50 bg-amber-900/20">
        <CardHeader>
          <CardTitle className="text-lg text-amber-500 flex items-center">
            Queue Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-amber-400">
            Currently pacing at 10 emails per hour to maintain deliverability
            across 2 active mailboxes. Estimated time to completion:{" "}
            {Math.ceil((stats.total - stats.sent) / 10)} hours.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
