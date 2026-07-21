"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/app/components/shared/StatusBadge";
import { api } from "@/app/lib/api/client";
import { fmt } from "@/app/lib/format";
import type { AuditLog } from "@/app/types";

export function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.auditLogs()
      .then(setLogs)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="bg-card border border-border rounded-xl p-12 animate-pulse h-48" />;
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold">Audit Logs</h3>
        <p className="text-xs text-muted-foreground mt-1">Recent admin actions across the platform.</p>
      </div>
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {logs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-12">No audit logs yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Time", "Actor", "Action", "Entity", "ID"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs text-muted-foreground font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} className="border-b border-border last:border-0 hover:bg-secondary/30">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(l.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-xs">{l.actor}</td>
                    <td className="px-4 py-3"><StatusBadge status={l.action} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{l.entityType}</td>
                    <td className="px-4 py-3 font-mono text-xs truncate max-w-[120px]">{l.entityId ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
