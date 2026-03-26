/**
 * Page Purpose:
 * List and search all inventory items.
 */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { API_BASE_URL } from "@/api/api";

type ItemRow = {
  itemId: number;
  title: string;
  category: string;
  condition: string;
  askingPrice: number;
  status: string;
};

export default function ItemsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ItemRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const query = search ? `?search=${encodeURIComponent(search)}` : "";
        const res = await fetch(`${API_BASE_URL}/api/items${query}`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load items");
        if (active) setRows(data.items ?? []);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load items");
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
    <AppShell pageTitle="Items" pageDescription="Browse and manage inventory items.">
      <section className="space-y-4">
        <div className="grid gap-3 md:grid-cols-5">
          <input
            placeholder="Search title / ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <select className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option>All Categories</option>
            <option>Books</option>
            <option>Maps</option>
            <option>Magazines</option>
            <option>Other</option>
          </select>
          <select className="rounded-md border border-slate-300 px-3 py-2 text-sm">
            <option>All Conditions</option>
            <option>Excellent</option>
            <option>Very Good</option>
            <option>Good</option>
            <option>Fair</option>
          </select>
          <input type="number" placeholder="Min price" className="rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <button
            type="button"
            onClick={() => router.push("/items/create")}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            + Add Item
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2 font-medium">Item ID</th>
                <th className="px-3 py-2 font-medium">Title</th>
                <th className="px-3 py-2 font-medium">Category</th>
                <th className="px-3 py-2 font-medium">Condition</th>
                <th className="px-3 py-2 font-medium">Qty</th>
                <th className="px-3 py-2 font-medium">Asking Price</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-slate-500">
                    Loading items...
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
                    No items found.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                visibleRows.map((row) => (
                  <tr key={row.itemId} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs text-slate-600">{row.itemId}</td>
                    <td className="px-3 py-2">{row.title}</td>
                    <td className="px-3 py-2">{row.category}</td>
                    <td className="px-3 py-2">{row.condition}</td>
                    <td className="px-3 py-2">{row.status === "Sold" ? 0 : 1}</td>
                    <td className="px-3 py-2">${row.askingPrice.toFixed(2)}</td>
                    <td className="px-3 py-2 text-slate-500">View / Edit</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
