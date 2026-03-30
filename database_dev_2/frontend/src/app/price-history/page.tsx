/**
 * Page Purpose:
 * List the price history of items.
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { API_BASE_URL } from "@/api/api";

type PriceHistoryRow = {
  priceHistoryId: number;
  title: string;
  marketValue: number;
  recordedDate: string;
  source: string;
};

export default function PriceHistoryPage() {
  const [rows, setRows] = useState<PriceHistoryRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const query = search ? `?search=${encodeURIComponent(search)}` : "";
        const res = await fetch(`${API_BASE_URL}/api/price-history${query}`, { credentials: "include" });
        const data = await res.json();
        await console.log("Fetched price history data:", data);
        if (!res.ok) throw new Error(data.error || "Failed to load price history");
        if (active) setRows(data.items ?? []);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load price history");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [search]);

  const visibleRows = useMemo(() => rows.slice(0, 30), [rows]);

  return (
    <AppShell pageTitle="Price History" pageDescription="Browse the price history of items.">
      <section className="space-y-4">
        <div className="grid gap-3 md:grid-cols-5">
          <input
            placeholder="Search title / ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2 font-medium">Price History ID</th>
                <th className="px-3 py-2 font-medium">Item Name</th>
                <th className="px-3 py-2 font-medium">Market Value</th>
                <th className="px-3 py-2 font-medium">Recorded Date</th>
                <th className="px-3 py-2 font-medium">Source</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-slate-500">
                    Loading price history...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && visibleRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-slate-500">
                    No price history found.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                visibleRows.map((row) => (
                  <tr key={row.priceHistoryId} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs text-slate-600">{row.priceHistoryId}</td>
                    <td className="px-3 py-2">{row.title}</td>
                    <td className="px-3 py-2">${row.marketValue.toFixed(2)}</td>
                    <td className="px-3 py-2">{row.recordedDate}</td>
                    <td className="px-3 py-2">{row.source}</td>
                    <td className="px-3 py-2 text-slate-500">View Details</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
