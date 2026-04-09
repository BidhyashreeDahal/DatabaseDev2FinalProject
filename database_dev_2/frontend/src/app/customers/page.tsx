"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { apiFetch } from "@/api/api";
import { useAuth } from "@/context/AuthContext";
import { canAccess } from "@/lib/permissions";

type CustomerRow = {
  customerId: number;
  firstName?: string;
  lastName?: string;
  name: string;
  email: string | null;
  phone: string | null;
  purchases: number;
  lastPurchase: string | null;
};

export default function CustomersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const role = String(user?.role || "").toLowerCase();
  const canCreate = canAccess(role, "CREATE_CUSTOMER");
  const canUpdate = canAccess(role, "UPDATE_CUSTOMER");
  const canDelete = canAccess(role, "DELETE_CUSTOMER");

  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [search, setSearch] = useState("");
  const [contact, setContact] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const rawQuery = [search, contact].filter(Boolean).join(" ").trim();
        const query = rawQuery ? `?search=${encodeURIComponent(rawQuery)}` : "";
        const data = await apiFetch<{ success: boolean; customers: CustomerRow[] }>(`/api/customers${query}`);
        if (active) setRows(data.customers ?? []);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load customers");
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [search, contact]);

  async function handleDelete(customerId: number) {
    const confirmed = window.confirm("Delete this customer?");
    if (!confirmed) return;

    try {
      setDeletingId(customerId);
      await apiFetch<{ success: boolean; message?: string }>(`/api/customers/${customerId}`, {
        method: "DELETE",
      });
      setRows((prev) => prev.filter((row) => row.customerId !== customerId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete customer");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AppShell pageTitle="Customers" pageDescription="Track customers and their activity.">
      <section className="space-y-4">
        <div className="rounded-xl border border-stone-200 bg-stone-50/70 p-3 md:p-4">
          <div className="grid gap-3 md:grid-cols-4">
            <input
              placeholder="Search customer by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input text-sm"
            />
            <input
              placeholder="Email or phone"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              className="input text-sm"
            />
            <button
              disabled={!canCreate}
              onClick={() => router.push("/customers/create")}
              className="btn-primary px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
            >
              + New Customer
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Signed in as <span className="font-semibold">{role || "unknown"}</span>. {canDelete ? "You can view, edit, and delete customers." : canUpdate ? "You can view and edit customers." : "You can only view customers."}
        </p>

        <div className="table-shell">
          <table className="min-w-full text-sm">
            <thead className="bg-stone-50 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2 font-medium">Customer ID</th>
                <th className="px-3 py-2 font-medium">First Name</th>
                <th className="px-3 py-2 font-medium">Last Name</th>
                <th className="px-3 py-2 font-medium">Email</th>
                <th className="px-3 py-2 font-medium">Phone</th>
                <th className="px-3 py-2 font-medium">Purchases</th>
                <th className="px-3 py-2 font-medium">Last Purchase</th>
                <th className="px-3 py-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="px-3 py-10 text-center text-slate-500">
                    Loading customers...
                  </td>
                </tr>
              )}
              {!loading && error && (
                <tr>
                  <td colSpan={8} className="px-3 py-10 text-center text-red-600">
                    {error}
                  </td>
                </tr>
              )}
              {!loading && !error && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-10 text-center text-slate-500">
                    No customers found.
                  </td>
                </tr>
              )}
              {!loading &&
                !error &&
                rows.slice((page - 1) * limit, page * limit).map((row) => (
                  <tr key={row.customerId} className="border-t border-slate-100 hover:bg-stone-50/70">
                    <td className="px-3 py-2 font-mono text-xs text-slate-600">{row.customerId}</td>
                    <td className="px-3 py-2">{row.firstName || row.name.split(" ").slice(0, -1).join(" ") || row.name}</td>
                    <td className="px-3 py-2">{row.lastName || row.name.split(" ").slice(-1).join(" ") || "-"}</td>
                    <td className="px-3 py-2">{row.email || "-"}</td>
                    <td className="px-3 py-2">{row.phone || "-"}</td>
                    <td className="px-3 py-2">{row.purchases}</td>
                    <td className="px-3 py-2">{row.lastPurchase ? new Date(row.lastPurchase).toLocaleDateString("en-CA") : "-"}</td>
                    <td className="px-3 py-2 text-slate-500">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => router.push(`/customers/${row.customerId}`)}
                          className="font-medium text-blue-700 hover:underline"
                        >
                          View
                        </button>
                        {canUpdate && (
                          <button
                            onClick={() => router.push(`/customers/${row.customerId}/edit`)}
                            className="text-slate-700 hover:underline"
                          >
                            Edit
                          </button>
                        )}
                        {canDelete && (
                          <button
                            onClick={() => handleDelete(row.customerId)}
                            disabled={deletingId === row.customerId}
                            className="text-red-600 hover:underline disabled:opacity-50"
                          >
                            {deletingId === row.customerId ? "Deleting..." : "Delete"}
                          </button>
                        )}
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
            <span className="font-semibold">{Math.max(1, Math.ceil(rows.length / limit) || 1)}</span> ·{" "}
            <span className="font-semibold">{rows.length}</span> customers
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
              disabled={page >= Math.max(1, Math.ceil(rows.length / limit) || 1)}
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
