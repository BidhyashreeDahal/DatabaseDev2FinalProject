"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { API_BASE_URL } from "@/api/api";
import { useAuth } from "@/context/AuthContext";
import { canUpdatePricing } from "@/lib/permissions";

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
  const router = useRouter();
  const { user } = useAuth();
  const canAddHistory = canUpdatePricing(user?.role);
  const [rows, setRows] = useState<PriceHistoryRow[]>([]);
  const [items, setItems] = useState<ItemOption[]>([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [itemId, setItemId] = useState("");
  const [marketValue, setMarketValue] = useState("");
  const [recordedDate, setRecordedDate] = useState("");
  const [source, setSource] = useState("Manual entry");
  const totalPages = Math.max(1, Math.ceil(total / limit) || 1);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        params.set("page", String(page));
        params.set("limit", String(limit));

        const res = await fetch(
          `${API_BASE_URL}/api/price-history?${params.toString()}`,
          { credentials: "include" }
        );

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load price history");

        if (active) {
          setError("");
          setRows(data.items ?? []);
          setTotal(Number(data.total || 0));
          setPage(Number(data.page || 1));
          setLimit(Number(data.limit || limit));
        }
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
  }, [search, page, limit]);

  useEffect(() => {
    let active = true;

    async function loadItems() {
      if (!canAddHistory) return;
      try {
        const res = await fetch(`${API_BASE_URL}/api/items`, {
          credentials: "include",
        });

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
        // ignore
      }
    }

    loadItems();
    return () => {
      active = false;
    };
  }, [canAddHistory]);

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
      setPage(1);

      const refresh = await fetch(`${API_BASE_URL}/api/price-history`, {
        credentials: "include",
      });

      const refreshed = await refresh.json();
      if (refresh.ok) {
        setRows(refreshed.items ?? []);
        setTotal(Number(refreshed.total || 0));
        setPage(Number(refreshed.page || 1));
        setLimit(Number(refreshed.limit || limit));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add price history");
    } finally {
      setAdding(false);
    }
  }

  const visibleRows = useMemo(() => rows, [rows]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

  const formatDate = (value: string) => {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleDateString();
  };

  return (
    <AppShell
      pageTitle="Price History"
      pageDescription="Browse the price history of items."
    >
      <section className="space-y-4">

        {canAddHistory && (
          <form
            onSubmit={handleManualAdd}
            className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 md:grid-cols-5"
          >
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
        )}

        {/* Search */}
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <input
            placeholder="Search by item title"
            value={search}
            onChange={(e) => {
              setPage(1);
              setSearch(e.target.value);
            }}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between text-sm text-slate-600">
          <div>
            Page <b>{page}</b> of{" "}
            <b>{totalPages}</b> · <b>{total}</b> records
          </div>

          <div className="flex gap-2">
            <button
              className="btn-secondary px-3 py-1 text-xs"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>

            <button
              className="btn-primary px-3 py-1 text-xs"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => p + 1)}   
            >
              Next
            </button>
          </div>
        </div>

        {loading && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
            Loading price history...
          </div>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
        )}

        {!loading && !error && visibleRows.length === 0 && (
          <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-500">
            No price history records found.
          </div>
        )}

        {!loading && !error && visibleRows.length > 0 && (
          <>
            <div className="space-y-3 md:hidden">
              {visibleRows.map((row) => (
                <div key={row.priceHistoryId} className="data-card p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="data-label">Record #{row.priceHistoryId}</p>
                    <p className="text-xs text-slate-500">{formatDate(row.recordedDate)}</p>
                  </div>
                  <p className="data-value font-medium">{row.title}</p>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <p className="data-label">Market Value</p>
                      <p className="data-value">{formatCurrency(row.marketValue)}</p>
                    </div>
                    <div>
                      <p className="data-label">Source</p>
                      <p className="data-value">{row.source}</p>
                    </div>
                  </div>
                  <button
                    className="btn-secondary mt-3 px-3 py-1 text-xs"
                    onClick={() => router.push(`/price-history/${row.priceHistoryId}`)}
                  >
                    View details
                  </button>
                </div>
              ))}
            </div>

            <div className="table-shell table-scroll hidden md:block">
              <table className="min-w-full text-sm">
                <thead className="text-left text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Item</th>
                    <th className="px-4 py-3 font-medium">Value</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Source</th>
                    <th className="px-4 py-3 font-medium">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {visibleRows.map((row) => (
                    <tr key={row.priceHistoryId} className="border-t border-slate-100">
                      <td className="px-4 py-3">{row.priceHistoryId}</td>
                      <td className="px-4 py-3">{row.title}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(row.marketValue)}</td>
                      <td className="px-4 py-3">{formatDate(row.recordedDate)}</td>
                      <td className="px-4 py-3">{row.source}</td>
                      <td className="px-4 py-3">
                        <button
                          className="btn-secondary px-3 py-1 text-xs"
                          onClick={() => router.push(`/price-history/${row.priceHistoryId}`)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

      </section>
    </AppShell>
  );
}