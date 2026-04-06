"use client";

import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { API_BASE_URL } from "@/api/api";

type AuditRow = {
  id: string;
  action: string;
  actor: string;
  resourceType: string;
  resourceId: number;
  summary: string;
  timestamp?: string | null;
};

export default function AuditLogsPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE_URL}/api/audit-logs`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load audit logs");
        if (active) setRows(data.auditLogs ?? []);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load audit logs");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const visibleRows = useMemo(() => rows.slice(0, 80), [rows]);

  return (
    <AppShell pageTitle="Audit Logs" pageDescription="Track critical system actions.">
      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-slate-600">
            <tr>
              <th className="px-3 py-2 font-medium">Timestamp</th>
              <th className="px-3 py-2 font-medium">Action</th>
              <th className="px-3 py-2 font-medium">Actor</th>
              <th className="px-3 py-2 font-medium">Resource</th>
              <th className="px-3 py-2 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                  Loading audit logs...
                </td>
              </tr>
            )}
            {!loading && error && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-red-600">
                  {error}
                </td>
              </tr>
            )}
            {!loading && !error && visibleRows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-8 text-center text-slate-500">
                  No audit logs found.
                </td>
              </tr>
            )}
            {!loading &&
              !error &&
              visibleRows.map((row) => (
                <tr key={row.id} className="border-t border-slate-100">
                  <td className="px-3 py-2">{row.timestamp ? new Date(row.timestamp).toLocaleString() : "-"}</td>
                  <td className="px-3 py-2 font-medium">{row.action}</td>
                  <td className="px-3 py-2">{row.actor}</td>
                  <td className="px-3 py-2">{row.resourceType} #{row.resourceId}</td>
                  <td className="px-3 py-2">{row.summary}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </AppShell>
  );
}
