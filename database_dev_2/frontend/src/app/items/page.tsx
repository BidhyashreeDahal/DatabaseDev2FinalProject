"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { API_BASE_URL } from "@/api/api";
import { useAuth } from "@/context/AuthContext";

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
  const { user } = useAuth();
  const [rows, setRows] = useState<ItemRow[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [conditionFilter, setConditionFilter] = useState("All");
  const [minPrice, setMinPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError("");
        const query = search ? `?search=${encodeURIComponent(search)}` : "";
        const res = await fetch(`${API_BASE_URL}/api/items${query}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Failed to load items");
        }
        if (active) {
          setRows(data.items ?? []);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load items");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [search]);

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesCategory = categoryFilter === "All" || row.category === categoryFilter;
      const matchesCondition = conditionFilter === "All" || row.condition === conditionFilter;
      const minPriceNumber = minPrice.trim() === "" ? null : Number(minPrice);
      const matchesMinPrice =
        minPriceNumber === null || Number.isNaN(minPriceNumber) ? true : row.askingPrice >= minPriceNumber;
      return matchesCategory && matchesCondition && matchesMinPrice;
    });
  }, [rows, categoryFilter, conditionFilter, minPrice]);

  const visibleRows = useMemo(() => filteredRows.slice(0, 30), [filteredRows]);
  const role = String(user?.role || "").toLowerCase();
  const canCreate = role === "admin" || role === "manager";
  const canUpdate = role === "admin" || role === "manager";
  const canDelete = role === "admin";

  async function handleDelete(itemId: number) {
    const confirmed = window.confirm("Delete this item?");
    if (!confirmed) return;

    try {
      setDeletingId(itemId);
      const res = await fetch(`${API_BASE_URL}/api/items/${itemId}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to delete item");
      }
      setRows((prev) => prev.filter((row) => row.itemId !== itemId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete item");
    } finally {
      setDeletingId(null);
    }
  }

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
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="All">All Categories</option>
            <option value="Book">Book</option>
            <option value="Map">Map</option>
            <option value="Magazine">Magazine</option>
            <option value="Other">Other</option>
          </select>
          <select
            value={conditionFilter}
            onChange={(e) => setConditionFilter(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="All">All Conditions</option>
            <option>Excellent</option>
            <option>Very Good</option>
            <option>Good</option>
            <option>Fair</option>
          </select>
          <input
            type="number"
            placeholder="Min price"
            min="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            disabled={!canCreate}
            onClick={() => router.push("/items/create")}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Add Item
          </button>
        </div>
        <p className="text-xs text-slate-500">
          Signed in as <span className="font-semibold">{role || "unknown"}</span>.{" "}
          {canDelete ? "You can view, edit, and delete items." : canUpdate ? "You can view and edit items." : "You can only view items."}
        </p>

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
                    <td className="px-3 py-2">
                      <button
                        onClick={() => router.push(`/items/${row.itemId}`)}
                        className="text-left text-blue-700 hover:underline"
                      >
                        {row.title}
                      </button>
                    </td>
                    <td className="px-3 py-2">{row.category}</td>
                    <td className="px-3 py-2">{row.condition}</td>
                    <td className="px-3 py-2">{row.status === "Sold" ? 0 : 1}</td>
                    <td className="px-3 py-2">${row.askingPrice.toFixed(2)}</td>
                    <td className="px-3 py-2 text-slate-500">
                      <div className="flex items-center gap-3">
                        <button onClick={() => router.push(`/items/${row.itemId}`)} className="text-blue-700 hover:underline">
                          View
                        </button>
                        {canUpdate && (
                          <button onClick={() => router.push(`/items/${row.itemId}/edit`)} className="text-slate-700 hover:underline">
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(row.itemId)}
                            disabled={deletingId === row.itemId}
                            className="text-red-600 hover:underline disabled:opacity-50"
                          >
                            {deletingId === row.itemId ? "Deleting..." : "Delete"}
                          </button>
                        )}
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