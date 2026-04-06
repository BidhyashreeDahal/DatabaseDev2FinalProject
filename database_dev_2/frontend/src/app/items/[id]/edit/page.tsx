"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { API_BASE_URL } from "@/api/api";
import { updateItem } from "@/api/items";

type ItemResponse = {
  success: boolean;
  item?: {
    item_id: number;
    title: string;
    description?: string | null;
    condition: string;
    acquisition_date: string;
    acquisition_cost: number | string;
    selling_price: number | string;
    image_url?: string | null;
    note?: string | null;
  };
  error?: string;
};

function toDateInput(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export default function EditItemPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const itemId = Number(params?.id);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [title, setTitle] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [acquisitionDate, setAcquisitionDate] = useState("");
  const [acquisitionCost, setAcquisitionCost] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [note, setNote] = useState("");

  useEffect(() => {
    let active = true;

    async function loadItem() {
      if (!Number.isInteger(itemId) || itemId <= 0) {
        setError("Invalid item id");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");
        const res = await fetch(`${API_BASE_URL}/api/items/${itemId}`, {
          credentials: "include",
        });
        const data = (await res.json()) as ItemResponse;
        if (!res.ok || !data.item) {
          throw new Error(data.error || "Failed to load item");
        }
        if (!active) return;

        setTitle(data.item.title ?? "");
        setCondition(data.item.condition ?? "");
        setDescription(data.item.description ?? "");
        setAcquisitionDate(toDateInput(data.item.acquisition_date));
        setAcquisitionCost(String(data.item.acquisition_cost ?? ""));
        setSellingPrice(String(data.item.selling_price ?? ""));
        setImageUrl(data.item.image_url ?? "");
        setNote(data.item.note ?? "");
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : "Failed to load item");
      } finally {
        if (active) setLoading(false);
      }
    }

    loadItem();
    return () => {
      active = false;
    };
  }, [itemId]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim()) return setError("Title is required.");
    if (!condition.trim()) return setError("Condition is required.");
    if (!acquisitionDate) return setError("Acquisition date is required.");

    const acquisitionCostNum = Number(acquisitionCost);
    const sellingPriceNum = Number(sellingPrice);

    if (!Number.isFinite(acquisitionCostNum) || acquisitionCostNum <= 0) {
      return setError("Acquisition cost must be a positive number.");
    }
    if (!Number.isFinite(sellingPriceNum) || sellingPriceNum <= 0) {
      return setError("Selling price must be a positive number.");
    }

    try {
      setSaving(true);
      const result = await updateItem(itemId, {
        title: title.trim(),
        description: description.trim() || null,
        condition: condition.trim(),
        acquisition_date: new Date(acquisitionDate).toISOString(),
        acquisition_cost: acquisitionCostNum,
        selling_price: sellingPriceNum,
        image_url: imageUrl.trim() || null,
        note: note.trim() || null,
      });
      if (!result.success) {
        throw new Error(result.error || "Failed to update item");
      }
      setSuccess("Item updated successfully.");
      setTimeout(() => router.push(`/items/${itemId}`), 900);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update item");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell pageTitle={`Edit Item #${params?.id ?? ""}`} pageDescription="Update item details.">
      <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-slate-600">Loading item...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="text-sm font-medium text-slate-700">
                Title
                <input value={title} onChange={(e) => setTitle(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Condition
                <input value={condition} onChange={(e) => setCondition(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Acquisition Date
                <input type="date" value={acquisitionDate} onChange={(e) => setAcquisitionDate(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Acquisition Cost
                <input type="number" min="0" step="0.01" value={acquisitionCost} onChange={(e) => setAcquisitionCost(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Selling Price
                <input type="number" min="0" step="0.01" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              </label>
              <label className="text-sm font-medium text-slate-700">
                Image URL
                <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Description
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>

            <label className="block text-sm font-medium text-slate-700">
              Note
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
            </label>

            {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {success && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{success}</p>}

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </AppShell>
  );
}
