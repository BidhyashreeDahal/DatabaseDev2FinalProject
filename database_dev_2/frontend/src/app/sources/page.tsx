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
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
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

  const visibleRows = useMemo(() => rows, [rows]);

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
        <div className="rounded-2xl border border-[#ded8c8] bg-[#faf8f1] p-3 md:p-4">
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
        </div>
        <div className="space-y-3 md:hidden">
          {!loading &&
            !error &&
            visibleRows.map((row) => (
              <div key={row.sourceId} className="data-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="data-label">Source</p>
                  <p className="font-mono text-xs text-slate-600">#{row.sourceId}</p>
                </div>
                <p className="data-value font-medium">{row.name}</p>
                <p className="mt-1 text-sm text-[#556963] capitalize">{row.type}</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="data-label">Email</p>
                    <p className="data-value">{row.email || "-"}</p>
                  </div>
                  <div>
                    <p className="data-label">Phone</p>
                    <p className="data-value">{row.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="data-label">Acquisitions</p>
                    <p className="data-value">{row.acquisitionCount}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-sm">
                  <button type="button" onClick={() => router.push(`/sources/${row.sourceId}`)} className="text-[#184a40] hover:underline">
                    View
                  </button>
                  {canUpdate ? (
                    <button type="button" onClick={() => router.push(`/sources/${row.sourceId}/edit`)} className="text-slate-700 hover:underline">
                      Edit
                    </button>
                  ) : null}
                  {canDelete ? (
                    <button type="button" onClick={() => handleDelete(row.sourceId)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
        </div>
        <div className="table-shell hidden md:block">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Source ID</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Acquisitions</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    Loading sources...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && visibleRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    No sources found.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                visibleRows.slice((page - 1) * limit, page * limit).map((row) => (
                  <tr key={row.sourceId} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{row.sourceId}</td>
                    <td className="px-4 py-3">{row.name}</td>
                    <td className="px-4 py-3">{row.type}</td>
                    <td className="px-4 py-3">{row.email || "-"}</td>
                    <td className="px-4 py-3">{row.phone || "-"}</td>
                    <td className="px-4 py-3">{row.acquisitionCount}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => router.push(`/sources/${row.sourceId}`)}
                          className="text-[#184a40] hover:underline"
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
        <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
          <div>
            Page <span className="font-semibold">{page}</span> of{" "}
            <span className="font-semibold">{Math.max(1, Math.ceil(visibleRows.length / limit) || 1)}</span> ·{" "}
            <span className="font-semibold">{visibleRows.length}</span> sources
          </div>
          <div className="flex items-center gap-2">
            <select
              value={limit}
              onChange={(e) => { setPage(1); setLimit(Number(e.target.value)); }}
              className="input w-[92px] px-2 py-1 text-xs"
            >
              <option value={10}>10 / page</option>
              <option value={20}>20 / page</option>
              <option value={50}>50 / page</option>
            </select>
            <button
              className="btn-secondary px-3 py-1 text-xs disabled:opacity-50"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              type="button"
            >
              Prev
            </button>
            <button
              className="btn-primary px-3 py-1 text-xs disabled:opacity-50"
              disabled={page >= Math.max(1, Math.ceil(visibleRows.length / limit) || 1)}
              onClick={() => setPage((p) => p + 1)}
              type="button"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </AppShell>
  );
}
