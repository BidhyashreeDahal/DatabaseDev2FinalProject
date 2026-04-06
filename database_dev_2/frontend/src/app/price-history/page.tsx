/**
 * Page Purpose:
 * List the price history of items.
 */
"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { API_BASE_URL } from "@/api/api";

type PriceHistoryRow = {
  priceHistoryId: number;
  itemId?: number;
  title: string;
  marketValue: number;
  recordedDate: string;
  source: string;
};

type ItemOption = {
  itemId: number;
  title: string;
};

export default function PriceHistoryPage() {
  const [rows, setRows] = useState<PriceHistoryRow[]>([]);
  const [items, setItems] = useState<ItemOption[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [itemId, setItemId] = useState("");
  const [marketValue, setMarketValue] = useState("");
  const [recordedDate, setRecordedDate] = useState("");
  const [source, setSource] = useState("Manual entry");

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

  useEffect(() => {
    let active = true;
    async function loadItems() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/items`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load items");
        if (active) {
          setItems(
            (data.items ?? []).map((item: { itemId: number; title: string }) => ({
              itemId: item.itemId,
              title: item.title,
            }))
          );
        }
      } catch {
        // Keep manual add usable even if item list fails.
      }
    }
    loadItems();
    return () => {
      active = false;
    };
  }, []);

  async function handleManualAdd(e: FormEvent) {
    e.preventDefault();
    setError("");
    const parsedItemId = Number(itemId);
    const parsedValue = Number(marketValue);
    if (!Number.isInteger(parsedItemId) || parsedItemId <= 0) {
      return setError("Select a valid item.");
    }
    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
      return setError("Enter a valid market value.");
    }
    if (!source.trim()) {
      return setError("Source is required.");
    }

    try {
      setAdding(true);
      const res = await fetch(`${API_BASE_URL}/api/price-history`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: parsedItemId,
          marketValue: parsedValue,
          recordedDate: recordedDate || undefined,
          source: source.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add price history");

      setMarketValue("");
      setRecordedDate("");
      setSource("Manual entry");
      setSearch("");

      const refresh = await fetch(`${API_BASE_URL}/api/price-history`, { credentials: "include" });
      const refreshed = await refresh.json();
      if (refresh.ok) {
        setRows(refreshed.items ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add price history");
    } finally {
      setAdding(false);
    }
  }

  const visibleRows = useMemo(() => rows.slice(0, 30), [rows]);

  return (
    <AppShell pageTitle="Price History" pageDescription="Browse the price history of items.">
      <section className="space-y-4">
        <form onSubmit={handleManualAdd} className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-5">
          <select
            value={itemId}
            onChange={(e) => setItemId(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            required
          >
            <option value="">Select item</option>
            {items.map((item) => (
              <option key={item.itemId} value={item.itemId}>
                #{item.itemId} - {item.title}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="Market value"
            value={marketValue}
            onChange={(e) => setMarketValue(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            required
          />
          <input
            type="date"
            value={recordedDate}
            onChange={(e) => setRecordedDate(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            required
          />
          <button
            type="submit"
            disabled={adding}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {adding ? "Adding..." : "+ Add History"}
          </button>
        </form>

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
