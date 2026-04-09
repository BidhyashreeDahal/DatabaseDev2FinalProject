"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { apiFetch } from "@/api/api";

type UserRow = {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLogin?: string | null;
};

export default function UsersPage() {
  const router = useRouter();
  const [rows, setRows] = useState<UserRow[]>([]);
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
        const data = await apiFetch<{ success: boolean; users: UserRow[] }>("/api/users");
        if (active) setRows(data.users || []);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load users");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  async function handleDeactivate(userId: number) {
    const confirmed = window.confirm("Deactivate this user?");
    if (!confirmed) return;
    try {
      setDeletingId(userId);
      await apiFetch(`/api/users/${userId}`, { method: "DELETE" });
      setRows((prev) => prev.map((row) => (row.userId === userId ? { ...row, isActive: false } : row)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to deactivate user");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AppShell pageTitle="Users" pageDescription="Admin user and role management.">
      <section className="space-y-4">
        <div className="flex justify-end">
          <button type="button" onClick={() => router.push("/users/create")} className="btn-primary px-4 py-2">
            + New User
          </button>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="flex items-center justify-between gap-3 text-sm text-slate-600">
          <div>
            Page <span className="font-semibold">{page}</span> of{" "}
            <span className="font-semibold">{Math.max(1, Math.ceil(rows.length / limit) || 1)}</span> ·{" "}
            <span className="font-semibold">{rows.length}</span> users
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

        <div className="space-y-3 md:hidden">
          {!loading &&
            rows.slice((page - 1) * limit, page * limit).map((row) => (
              <div key={row.userId} className="data-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <p className="data-label">User</p>
                  <p className="font-mono text-xs text-slate-600">#{row.userId}</p>
                </div>
                <p className="data-value font-medium">
                  {row.firstName} {row.lastName}
                </p>
                <p className="mt-1 text-sm text-[#556963]">{row.email}</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <p className="data-label">Role</p>
                    <p className="data-value capitalize">{row.role}</p>
                  </div>
                  <div>
                    <p className="data-label">Status</p>
                    <p className="data-value">{row.isActive ? "Active" : "Inactive"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="data-label">Last Login</p>
                    <p className="data-value">
                      {row.lastLogin ? new Date(row.lastLogin).toLocaleString("en-CA") : "-"}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() => router.push(`/users/${row.userId}/edit`)}
                    className="text-[#184a40] hover:underline"
                  >
                    Edit
                  </button>
                  {row.isActive ? (
                    <button
                      type="button"
                      onClick={() => handleDeactivate(row.userId)}
                      disabled={deletingId === row.userId}
                      className="text-red-600 hover:underline disabled:opacity-50"
                    >
                      {deletingId === row.userId ? "Deactivating..." : "Deactivate"}
                    </button>
                  ) : null}
                </div>
              </div>
            ))}
        </div>

        <div className="table-shell hidden md:block">
          <table className="min-w-full text-sm">
            <thead>
              <tr>
                <th className="px-4 py-3 text-left">User ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Last Login</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">Loading users...</td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">No users found.</td>
                </tr>
              ) : (
                rows.slice((page - 1) * limit, page * limit).map((row) => (
                  <tr key={row.userId} className="border-t border-slate-100">
                    <td className="px-4 py-3">{row.userId}</td>
                    <td className="px-4 py-3">{row.firstName} {row.lastName}</td>
                    <td className="px-4 py-3">{row.email}</td>
                    <td className="px-4 py-3 capitalize">{row.role}</td>
                    <td className="px-4 py-3">{row.isActive ? "Active" : "Inactive"}</td>
                    <td className="px-4 py-3">{row.lastLogin ? new Date(row.lastLogin).toLocaleString("en-CA") : "-"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => router.push(`/users/${row.userId}/edit`)} className="text-[#184a40] hover:underline">
                          Edit
                        </button>
                        {row.isActive ? (
                          <button
                            type="button"
                            onClick={() => handleDeactivate(row.userId)}
                            disabled={deletingId === row.userId}
                            className="text-red-600 hover:underline disabled:opacity-50"
                          >
                            {deletingId === row.userId ? "Deactivating..." : "Deactivate"}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
