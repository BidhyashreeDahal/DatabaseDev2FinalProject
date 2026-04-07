"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { apiFetch } from "@/api/api";
import { useAuth } from "@/context/AuthContext";

type CustomerRow = {
  customerId: number;
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
  const canCreate = role === "admin" || role === "manager";
  const canUpdate = role === "admin" || role === "manager";
  const canDelete = role === "admin";

  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [search, setSearch] = useState("");
  const [contact, setContact] = useState("");
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
        <div className="grid gap-3 md:grid-cols-4">
          <input
            placeholder="Search customer by name"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            placeholder="Email or phone"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <div className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-500">
            All customer types
          </div>
          <button
            disabled={!canCreate}
            onClick={() => router.push("/customers/create")}
            className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            + New Customer
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Signed in as <span className="font-semibold">{role || "unknown"}</span>. {canDelete ? "You can view, edit, and delete customers." : canUpdate ? "You can view and edit customers." : "You can only view customers."}
        </p>

        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-600">
              <tr>
                <th className="px-3 py-2 font-medium">Customer ID</th>
                <th className="px-3 py-2 font-medium">Name</th>
                <th className="px-3 py-2 font-medium">Type</th>
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
                rows.map((row) => (
                  <tr key={row.customerId} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-mono text-xs text-slate-600">{row.customerId}</td>
                    <td className="px-3 py-2">{row.name}</td>
                    <td className="px-3 py-2">Customer</td>
                    <td className="px-3 py-2">{row.email || "-"}</td>
                    <td className="px-3 py-2">{row.phone || "-"}</td>
                    <td className="px-3 py-2">{row.purchases}</td>
                    <td className="px-3 py-2">{row.lastPurchase ? new Date(row.lastPurchase).toLocaleDateString("en-CA") : "-"}</td>
                    <td className="px-3 py-2 text-slate-500">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => router.push(`/customers/${row.customerId}`)}
                          className="text-blue-700 hover:underline"
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
      </section>
    </AppShell>
  );
}
