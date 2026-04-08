"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { apiFetch } from "@/api/api";

type SourceOption = {
  sourceId: number;
  name: string;
  type: string;
};

type ItemOption = {
  itemId: number;
  title: string;
  condition?: string;
  category?: string;
  askingPrice?: number;
  status?: string;
};

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 border-b border-stone-200 pb-2 text-base font-bold text-slate-900">{title}</h3>
      {subtitle ? <p className="mb-4 text-sm text-slate-600">{subtitle}</p> : null}
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function CreateAcquisitionPage() {
  const router = useRouter();
  const [sources, setSources] = useState<SourceOption[]>([]);
  const [items, setItems] = useState<ItemOption[]>([]);
  const [sourceId, setSourceId] = useState("");
  const [itemId, setItemId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const [sourceRes, itemRes] = await Promise.all([
          apiFetch<{ success: boolean; sources: SourceOption[] }>("/api/sources"),
          apiFetch<{ success: boolean; items: ItemOption[] }>("/api/items"),
        ]);
        if (!active) return;
        setSources(sourceRes.sources || []);
        setItems(itemRes.items || []);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load options");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const parsedSourceId = Number(sourceId);
    const parsedItemId = Number(itemId);
    if (!Number.isInteger(parsedSourceId) || parsedSourceId <= 0) {
      setError("Please select a source.");
      return;
    }
    if (!Number.isInteger(parsedItemId) || parsedItemId <= 0) {
      setError("Please select an item.");
      return;
    }

    try {
      setSaving(true);
      await apiFetch("/api/acquisitions", {
        method: "POST",
        body: JSON.stringify({ sourceId: parsedSourceId, itemId: parsedItemId }),
      });
      router.push("/acquisitions");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record acquisition");
    } finally {
      setSaving(false);
    }
  }

  const selectedSource = sources.find((source) => String(source.sourceId) === sourceId);
  const selectedItem = items.find((item) => String(item.itemId) === itemId);

  return (
    <AppShell pageTitle="Record Acquisition" pageDescription="Create a new acquisition link between source and inventory item.">
      {loading ? (
        <p className="text-sm text-zinc-600">Loading sources and items...</p>
      ) : (
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 rounded-xl border border-stone-200 bg-stone-50 p-4">
            <h1 className="brand-serif text-2xl font-bold text-slate-800">Record Acquisition</h1>
            <p className="mt-1 text-slate-500">Connect an item to a source for inventory and provenance tracking.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <SectionCard
              title="Acquisition Link"
              subtitle="Choose the source and inventory item for this acquisition record."
            >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Source *</span>
                <select value={sourceId} onChange={(e) => setSourceId(e.target.value)} className="input">
                  <option value="">Select source</option>
                  {sources.map((source) => (
                    <option key={source.sourceId} value={source.sourceId}>
                      {source.name} ({source.type})
                    </option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="mb-1 block text-sm font-medium">Item *</span>
                <select value={itemId} onChange={(e) => setItemId(e.target.value)} className="input">
                  <option value="">Select item</option>
                  {items.map((item) => (
                    <option key={item.itemId} value={item.itemId}>
                      #{item.itemId} - {item.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            </SectionCard>

            <SectionCard title="Review Selection" subtitle="Confirm details before saving.">
            <div className="grid gap-3 md:grid-cols-2">
              <p className="text-sm">
                <span className="font-medium">Selected Source:</span>{" "}
                {selectedSource ? `${selectedSource.name} (${selectedSource.type})` : "Not selected"}
              </p>
              <p className="text-sm">
                <span className="font-medium">Selected Item:</span>{" "}
                {selectedItem ? `#${selectedItem.itemId} - ${selectedItem.title}` : "Not selected"}
              </p>
            </div>
            </SectionCard>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary px-5 py-2.5 disabled:opacity-60">
                {saving ? "Saving..." : "Record Acquisition"}
              </button>
              <button type="button" onClick={() => router.push("/acquisitions")} className="btn-secondary px-5 py-2.5">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}
