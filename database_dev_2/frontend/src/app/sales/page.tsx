/**
 * Page Purpose:
 * List sales transactions.
 *
 * What goes here:
 * - Sales table
 * - Date/customer/item filters
 * - Link to create sale
 */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { API_BASE_URL } from "@/api/api";
import { useAuth } from "@/context/AuthContext";
import { canAccess } from "@/lib/permissions";

type SaleRow = {
  salesId: number;
  date: string;
  customer: string;
  item: string;
  salePrice: number;
  paymentMethod?: string | null;
  soldBy: string;
};

export default function SalesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [rows, setRows] = useState<SaleRow[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const role = String(user?.role || "").toLowerCase();
  const canCreate = canAccess(role, "CREATE_SALE");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/api/sales`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to load sales");
        if (active) setRows(data.sales ?? []);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load sales");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <AppShell pageTitle="Sales" pageDescription="Track sold items and sale details.">
      <section className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          <input
            placeholder="Search sale / customer / item"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input text-sm"
          />
          <div className="md:col-span-2" />
          <button
            type="button"
            disabled={!canCreate}
            onClick={() => router.push("/sales/create")}
            className="btn-primary px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            + Record Sale
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2 font-medium">Sales ID</th>
                <th className="px-3 py-2 font-medium">Date/Time</th>
                <th className="px-3 py-2 font-medium">Customer</th>
                <th className="px-3 py-2 font-medium">Item</th>
                <th className="px-3 py-2 font-medium">Sale Price</th>
                <th className="px-3 py-2 font-medium">Payment Method</th>
                <th className="px-3 py-2 font-medium">Sold By</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-slate-500">
                    Loading sales...
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
              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-3 py-10 text-center text-slate-500">
                    No sales found.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                rows
                  .filter((row) => {
                    const q = search.trim().toLowerCase();
                    if (!q) return true;
                    return (
                      String(row.salesId).includes(q) ||
                      row.customer.toLowerCase().includes(q) ||
                      row.item.toLowerCase().includes(q) ||
                      row.soldBy.toLowerCase().includes(q)
                    );
                  })
                  .map((row) => (
                  <tr key={row.salesId} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs text-slate-600">{row.salesId}</td>
                    <td className="px-3 py-2">{new Date(row.date).toLocaleString("en-CA")}</td>
                    <td className="px-3 py-2">{row.customer}</td>
                    <td className="px-3 py-2">{row.item}</td>
                    <td className="px-3 py-2">${row.salePrice.toFixed(2)}</td>
                    <td className="px-3 py-2">{row.paymentMethod || "-"}</td>
                    <td className="px-3 py-2">{row.soldBy}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
