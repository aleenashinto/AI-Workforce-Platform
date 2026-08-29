"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

type Reply = {
  id: string;
  classification: string;
  content: string;
  status: string;
  created_at: string;
  lead_name: string;
  company: string;
};

export default function RepliesPage() {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/replies`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          // Mock some data if empty for demo purposes
          if (data.data.length === 0) {
            setReplies([
              {
                id: "1",
                classification: "interested",
                content:
                  "Hi, this sounds interesting. Can we jump on a call next Tuesday?",
                status: "new",
                created_at: new Date().toISOString(),
                lead_name: "John Doe",
                company: "Acme Corp",
              },
              {
                id: "2",
                classification: "not_now",
                content:
                  "Thanks for reaching out, but we just signed with a competitor. Check back in 6 months.",
                status: "processed",
                created_at: new Date(Date.now() - 86400000).toISOString(),
                lead_name: "Jane Smith",
                company: "TechNova",
              },
              {
                id: "3",
                classification: "out_of_office",
                content:
                  "I am out of the office until the 15th with limited access to email.",
                status: "new",
                created_at: new Date(Date.now() - 3600000).toISOString(),
                lead_name: "Bob Johnson",
                company: "Global Solutions",
              },
            ]);
          } else {
            setReplies(data.data);
          }
        }
        setLoading(false);
      });
  }, []);

  const markProcessed = async (id: string) => {
    // Optimistic update
    setReplies(
      replies.map((r) => (r.id === id ? { ...r, status: "processed" } : r)),
    );

    // In a real app, we'd hit the API here
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/replies/${id}/status`, {
      credentials: "include",
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "processed" }),
    });
  };

  const filteredReplies =
    filter === "all"
      ? replies
      : filter === "action_needed"
        ? replies.filter(
            (r) =>
              r.status === "new" &&
              ["interested", "not_now", "wrong_person"].includes(
                r.classification,
              ),
          )
        : replies.filter((r) => r.classification === filter);

  const getClassificationBadge = (classification: string) => {
    switch (classification) {
      case "interested":
        return (
          <Badge className="bg-green-900/30 text-green-400 hover:bg-green-900/40 border-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Interested
          </Badge>
        );
      case "not_interested":
        return (
          <Badge className="bg-red-900/30 text-red-400 hover:bg-red-900/40 border-red-800">
            <XCircle className="w-3 h-3 mr-1" /> Not Interested
          </Badge>
        );
      case "not_now":
        return (
          <Badge className="bg-yellow-900/30 text-yellow-400 hover:bg-yellow-900/40 border-yellow-800">
            <Clock className="w-3 h-3 mr-1" /> Not Now
          </Badge>
        );
      case "out_of_office":
        return (
          <Badge className="bg-[#2A2A3C] text-[color:var(--t-text)] hover:bg-[#3F3F5A] border-[#3F3F5A]">
            OOO
          </Badge>
        );
      case "wrong_person":
        return (
          <Badge className="bg-blue-900/30 text-blue-400 hover:bg-blue-900/40 border-blue-800">
            Wrong Person
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="capitalize border-[#3F3F5A] text-[color:var(--t-text)]"
          >
            {classification.replace("_", " ")}
          </Badge>
        );
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto flex h-[calc(100vh-4rem)]">
      {/* Sidebar Filters */}
      <div className="w-64 shrink-0 pr-6 border-r border-[#3F3F5A] space-y-1">
        <h2 className="font-semibold text-white mb-4 px-3 flex items-center">
          <Inbox className="w-4 h-4 mr-2" /> Inbox
        </h2>

        <button
          onClick={() => setFilter("all")}
          className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${filter === "all" ? "bg-[#2A2A3C] text-indigo-400" : "text-[color:var(--t-text)] hover:bg-[#2A2A3C]/50"}`}
        >
          All Replies
          <span className="float-right text-xs bg-[#1E1E2E] border border-[#3F3F5A] px-2 py-0.5 rounded-full">
            {replies.length}
          </span>
        </button>
        <button
          onClick={() => setFilter("action_needed")}
          className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${filter === "action_needed" ? "bg-[#2A2A3C] text-indigo-400" : "text-[color:var(--t-text)] hover:bg-[#2A2A3C]/50"}`}
        >
          Action Needed
          <span className="float-right text-xs bg-red-900/30 text-red-400 px-2 py-0.5 rounded-full border border-red-800">
            {
              replies.filter(
                (r) =>
                  r.status === "new" &&
                  ["interested", "not_now", "wrong_person"].includes(
                    r.classification,
                  ),
              ).length
            }
          </span>
        </button>

        <div className="pt-4 pb-2 px-3">
          <p className="text-xs font-semibold text-[color:var(--t-text)] uppercase tracking-wider">
            By Category
          </p>
        </div>

        {["interested", "not_interested", "not_now", "out_of_office"].map(
          (cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${filter === cat ? "bg-[#2A2A3C] text-indigo-400 font-medium" : "text-[color:var(--t-text)] hover:bg-[#2A2A3C]/50"}`}
            >
              <span className="capitalize">{cat.replace("_", " ")}</span>
              <span className="float-right text-xs text-[color:var(--t-text)]">
                {replies.filter((r) => r.classification === cat).length}
              </span>
            </button>
          ),
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 pl-6 overflow-y-auto">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {filter === "all"
              ? "All Replies"
              : filter === "action_needed"
                ? "Action Needed"
                : filter
                    .replace("_", " ")
                    .replace(/\b\w/g, (l) => l.toUpperCase())}
          </h1>
        </div>

        {loading ? (
          <div className="text-center py-12 text-[color:var(--t-text)]">
            Loading replies...
          </div>
        ) : filteredReplies.length === 0 ? (
          <div className="text-center py-12 bg-[#1E1E2E] rounded-lg border border-dashed border-[#3F3F5A]">
            <MessageSquare className="w-12 h-12 text-[#3F3F5A] mx-auto mb-3" />
            <h3 className="text-lg font-medium text-white">No replies found</h3>
            <p className="text-[color:var(--t-text)]">
              You&apos;re all caught up in this view.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pb-8">
            {filteredReplies.map((reply) => (
              <Card
                key={reply.id}
                className={`shadow-sm bg-[#1E1E2E] border-[#3F3F5A] transition-shadow hover:shadow-md ${reply.status === "new" ? "border-l-4 border-l-indigo-500" : ""}`}
              >
                <CardHeader className="pb-3 flex flex-row items-start justify-between bg-[#2A2A3C] rounded-t-lg border-b border-[#3F3F5A]">
                  <div>
                    <div className="flex items-center space-x-2">
                      <CardTitle className="text-base text-white">
                        {reply.lead_name}
                      </CardTitle>
                      <span className="text-sm text-[color:var(--t-text)]">
                        at {reply.company}
                      </span>
                    </div>
                    <div className="text-xs text-[color:var(--t-text)] mt-1">
                      Received{" "}
                      {formatDistanceToNow(new Date(reply.created_at), {
                        addSuffix: true,
                      })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getClassificationBadge(reply.classification)}
                  </div>
                </CardHeader>
                <CardContent className="pt-4 text-[color:var(--t-text)] whitespace-pre-wrap text-sm">
                  {reply.content}
                </CardContent>
                <CardFooter className="bg-[#2A2A3C] rounded-b-lg border-t border-[#3F3F5A] py-3 flex justify-end space-x-2">
                  {reply.status === "new" && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => markProcessed(reply.id)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Mark Processed
                    </Button>
                  )}
                  {reply.classification === "interested" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[#1E1E2E] text-indigo-400 border-indigo-900 hover:bg-[#3F3F5A]"
                    >
                      Reply in CRM
                    </Button>
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
