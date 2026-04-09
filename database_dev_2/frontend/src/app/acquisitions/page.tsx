"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { API_BASE_URL } from "@/api/api";
import { useAuth } from "@/context/AuthContext";
import { canAccess } from "@/lib/permissions";

type AcquisitionRow = {
  acquisitionId: number;
  itemId: number;
  itemTitle: string;
  sourceId: number;
  sourceName: string;
  sourceType: string;
  acquisitionCost: number;
  acquisitionDate?: string | null;
};

export default function AcquisitionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [rows, setRows] = useState<AcquisitionRow[]>([]);
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
        const res = await fetch(`${API_BASE_URL}/api/acquisitions${query}`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load acquisitions");
        if (active) setRows(data.acquisitions ?? []);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load acquisitions");
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
  const canCreate = canAccess(role, "CREATE_ACQUISITION");

  return (
    <AppShell pageTitle="Acquisitions" pageDescription="Track inventory purchases and source records.">
      <section className="space-y-4">
        <div className="rounded-2xl border border-[#ded8c8] bg-[#faf8f1] p-3 md:p-4">
          <div className="grid gap-3 md:grid-cols-4">
          <input
            placeholder="Search source or item"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input md:col-span-2"
          />
          <button
            type="button"
            disabled={!canCreate}
            onClick={() => router.push("/acquisitions/create")}
            className="btn-primary px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50 md:col-start-4"
          >
            + Record Acquisition
          </button>
          </div>
        </div>
        <div className="space-y-3 md:hidden">
          {!loading &&
            !error &&
            visibleRows.map((row) => (
              <div key={row.acquisitionId} className="data-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="data-label">Acquisition</p>
                  <p className="font-mono text-xs text-slate-600">#{row.acquisitionId}</p>
                </div>
                <p className="data-value font-medium">{row.itemTitle}</p>
                <p className="mt-1 text-sm text-[#556963]">{row.sourceName}</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="data-label">Source Type</p>
                    <p className="data-value">{row.sourceType}</p>
                  </div>
                  <div>
                    <p className="data-label">Cost</p>
                    <p className="data-value">${Number(row.acquisitionCost).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="data-label">Date</p>
                    <p className="data-value">
                      {row.acquisitionDate ? new Date(row.acquisitionDate).toLocaleDateString() : "-"}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
        <div className="table-shell hidden md:block">
          <table className="min-w-full text-sm">
            <thead className="text-left text-slate-600">
              <tr>
                <th className="px-4 py-3 font-medium">Acquisition ID</th>
                <th className="px-4 py-3 font-medium">Item</th>
                <th className="px-4 py-3 font-medium">Source</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Cost</th>
                <th className="px-4 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Loading acquisitions...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && visibleRows.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No acquisitions found.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                visibleRows.slice((page - 1) * limit, page * limit).map((row) => (
                  <tr key={row.acquisitionId} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{row.acquisitionId}</td>
                    <td className="px-4 py-3">{row.itemTitle}</td>
                    <td className="px-4 py-3">{row.sourceName}</td>
                    <td className="px-4 py-3">{row.sourceType}</td>
                    <td className="px-4 py-3">${Number(row.acquisitionCost).toFixed(2)}</td>
                    <td className="px-4 py-3">{row.acquisitionDate ? new Date(row.acquisitionDate).toLocaleDateString() : "-"}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 flex items-center justify-between text-sm text-slate-600">
          <div>
            Page <span className="font-semibold">{page}</span> of{" "}
            <span className="font-semibold">{Math.max(1, Math.ceil(visibleRows.length / limit) || 1)}</span> ·{" "}
            <span className="font-semibold">{visibleRows.length}</span> acquisitions
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
