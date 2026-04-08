"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { apiFetch } from "@/api/api";

type SourceDetails = {
  sourceId: number;
  name: string;
  type: string;
  email?: string | null;
  phone?: string | null;
  acquisitionCount: number;
  acquisitions: Array<{
    acquisitionId: number;
    itemId: number;
    itemTitle: string;
    acquisitionCost: number;
    acquisitionDate?: string | null;
  }>;
};

export default function SourceDetailsPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [source, setSource] = useState<SourceDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await apiFetch<{ success: boolean; source: SourceDetails }>(`/api/sources/${params.id}`);
        if (active) setSource(data.source);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load source");
      } finally {
        if (active) setLoading(false);
      }
    }
    if (params?.id) load();
    return () => {
      active = false;
    };
  }, [params?.id]);

  return (
    <AppShell pageTitle={`Source #${params.id}`} pageDescription="View source profile and activity.">
      {loading ? <p className="text-sm text-zinc-600">Loading source...</p> : null}
      {!loading && error ? <p className="text-sm text-red-600">{error}</p> : null}
      {!loading && !error && source ? (
        <div className="space-y-5">
          <div className="grid gap-4 rounded-xl border border-stone-200 bg-stone-50 p-4 md:grid-cols-2">
            <p><span className="font-medium">Name:</span> {source.name}</p>
            <p><span className="font-medium">Type:</span> {source.type}</p>
            <p><span className="font-medium">Email:</span> {source.email || "-"}</p>
            <p><span className="font-medium">Phone:</span> {source.phone || "-"}</p>
            <p><span className="font-medium">Acquisitions:</span> {source.acquisitionCount}</p>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-semibold">Recent Acquisitions</h3>
            <div className="table-shell table-scroll">
              <table className="min-w-full text-sm">
                <thead>
                  <tr>
                    <th className="px-3 py-2 text-left">Acquisition ID</th>
                    <th className="px-3 py-2 text-left">Item</th>
                    <th className="px-3 py-2 text-left">Cost</th>
                    <th className="px-3 py-2 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {source.acquisitions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-3 py-6 text-center text-slate-500">No acquisitions yet.</td>
                    </tr>
                  ) : (
                    source.acquisitions.map((a) => (
                      <tr key={a.acquisitionId} className="border-t border-slate-100">
                        <td className="px-3 py-2">{a.acquisitionId}</td>
                        <td className="px-3 py-2">{a.itemTitle}</td>
                        <td className="px-3 py-2">${Number(a.acquisitionCost).toFixed(2)}</td>
                        <td className="px-3 py-2">
                          {a.acquisitionDate ? new Date(a.acquisitionDate).toLocaleDateString("en-CA") : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={() => router.push(`/sources/${params.id}/edit`)} className="btn-primary px-4 py-2">
              Edit Source
            </button>
            <button type="button" onClick={() => router.push("/sources")} className="btn-secondary px-4 py-2">
              Back
            </button>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
