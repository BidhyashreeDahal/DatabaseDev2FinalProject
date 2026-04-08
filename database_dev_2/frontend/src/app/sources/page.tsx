"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { API_BASE_URL } from "@/api/api";
import { useAuth } from "@/context/AuthContext";
import { canAccess } from "@/lib/permissions";

type SourceRow = {
  sourceId: number;
  name: string;
  type: string;
  email?: string | null;
  phone?: string | null;
  acquisitionCount: number;
};

export default function SourcesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [rows, setRows] = useState<SourceRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const query = search ? `?search=${encodeURIComponent(search)}` : "";
        const res = await fetch(`${API_BASE_URL}/api/sources${query}`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load sources");
        if (active) setRows(data.sources ?? []);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load sources");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [search]);

  const visibleRows = useMemo(() => rows.slice(0, 50), [rows]);

  const role = String(user?.role || "").toLowerCase();
  const canCreate = canAccess(role, "CREATE_SOURCE");
  const canUpdate = canAccess(role, "UPDATE_SOURCE");
  const canDelete = canAccess(role, "DELETE_SOURCE");

  async function handleDelete(sourceId: number) {
    const confirmed = window.confirm("Delete this source?");
    if (!confirmed) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/sources/${sourceId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete source");
      setRows((prev) => prev.filter((row) => row.sourceId !== sourceId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete source");
    }
  }

  return (
    <AppShell pageTitle="Sources" pageDescription="Manage dealers, collectors, and other sources.">
      <section className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            placeholder="Search source name/email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input md:col-span-2"
          />
          <button
            type="button"
            disabled={!canCreate}
            onClick={() => router.push("/sources/create")}
            className="btn-primary px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50 md:col-start-4"
          >
            + New Source
          </button>
        </div>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2 font-medium">Source ID</th>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Type</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Phone</th>
                <th className="px-3 py-2 font-medium">Acquisitions</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                    Loading sources...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && visibleRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-8 text-center text-slate-500">
                    No sources found.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                visibleRows.map((row) => (
                  <tr key={row.sourceId} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs text-slate-600">{row.sourceId}</td>
                    <td className="px-3 py-2">{row.name}</td>
                    <td className="px-3 py-2">{row.type}</td>
                    <td className="px-3 py-2">{row.email || "-"}</td>
                    <td className="px-3 py-2">{row.phone || "-"}</td>
                    <td className="px-3 py-2">{row.acquisitionCount}</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => router.push(`/sources/${row.sourceId}`)}
                          className="text-blue-700 hover:underline"
                        >
                          View
                        </button>
                        {canUpdate ? (
                          <button
                            type="button"
                            onClick={() => router.push(`/sources/${row.sourceId}/edit`)}
                            className="text-slate-700 hover:underline"
                          >
                            Edit
                          </button>
                        ) : null}
                        {canDelete ? (
                          <button
                            type="button"
                            onClick={() => handleDelete(row.sourceId)}
                            className="text-red-600 hover:underline"
                          >
                            Delete
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
