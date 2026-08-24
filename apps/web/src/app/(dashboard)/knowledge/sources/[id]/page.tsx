import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Clock, RefreshCcw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SourceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  // In a real app, fetch source by id
  const source = {
    id: params.id,
    name: "Product Manual.pdf",
    type: "file",
    status: "ready",
    created_at: "2024-03-10T10:00:00Z",
    updated_at: "2024-03-10T10:02:30Z",
    config: {
      fileKey: "org_123/123-Product Manual.pdf",
      contentType: "application/pdf",
    },
  };

  const logs = [
    { id: 1, time: "10:00:00 AM", message: "Upload initiated", type: "info" },
    {
      id: 2,
      time: "10:00:15 AM",
      message: "File uploaded successfully",
      type: "info",
    },
    { id: 3, time: "10:01:00 AM", message: "Parsing started", type: "info" },
    {
      id: 4,
      time: "10:01:30 AM",
      message: "Parsing completed (45 pages)",
      type: "info",
    },
    {
      id: 5,
      time: "10:02:00 AM",
      message: "Embedding chunks generated",
      type: "info",
    },
    {
      id: 6,
      time: "10:02:30 AM",
      message: "Knowledge source ready",
      type: "success",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <Link
              href="/knowledge/sources"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Sources
            </Link>
            <span className="text-gray-600">/</span>
            <span className="text-gray-200">{source.name}</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            {source.name}
            <Badge
              variant="outline"
              className={
                source.status === "ready"
                  ? "border-emerald-500/50 text-emerald-400 bg-emerald-500/10"
                  : source.status === "processing"
                    ? "border-amber-500/50 text-amber-400 bg-amber-500/10"
                    : "border-rose-500/50 text-rose-400 bg-rose-500/10"
              }
            >
              {source.status.charAt(0).toUpperCase() + source.status.slice(1)}
            </Badge>
          </h1>
        </div>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            className="border-[#3F3F5A] hover:bg-[#2A2A3C] text-gray-200"
          >
            <RefreshCcw className="w-4 h-4 mr-2" />
            Re-Sync
          </Button>
          <Button
            variant="destructive"
            className="bg-rose-600 hover:bg-rose-700"
          >
            Delete Source
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-[#2A2A3C] border-[#3F3F5A] text-white md:col-span-1">
          <CardHeader>
            <CardTitle className="text-lg">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-400">Type</p>
              <p className="font-medium capitalize flex items-center mt-1">
                <FileText className="w-4 h-4 mr-2 text-indigo-400" />
                {source.type}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Created At</p>
              <p className="font-medium flex items-center mt-1">
                <Clock className="w-4 h-4 mr-2 text-gray-500" />
                {new Date(source.created_at).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Last Synced</p>
              <p className="font-medium flex items-center mt-1">
                <RefreshCcw className="w-4 h-4 mr-2 text-gray-500" />
                {new Date(source.updated_at).toLocaleString()}
              </p>
            </div>
            {source.config &&
              Object.entries(source.config).map(([k, v]) => (
                <div key={k}>
                  <p className="text-sm text-gray-400 capitalize">
                    {k.replace(/([A-Z])/g, " $1").trim()}
                  </p>
                  <p className="font-medium mt-1 truncate" title={String(v)}>
                    {String(v)}
                  </p>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card className="bg-[#2A2A3C] border-[#3F3F5A] text-white md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Sync Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start gap-4 text-sm">
                  <div className="min-w-[100px] text-gray-500">{log.time}</div>
                  <div className="flex items-center gap-2">
                    {log.type === "info" && (
                      <div className="w-2 h-2 rounded-full bg-blue-400 mt-1.5" />
                    )}
                    {log.type === "success" && (
                      <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5" />
                    )}
                    {log.type === "error" && (
                      <AlertTriangle className="w-4 h-4 text-rose-400" />
                    )}
                    <span
                      className={
                        log.type === "success"
                          ? "text-emerald-400"
                          : log.type === "error"
                            ? "text-rose-400"
                            : "text-gray-300"
                      }
                    >
                      {log.message}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
