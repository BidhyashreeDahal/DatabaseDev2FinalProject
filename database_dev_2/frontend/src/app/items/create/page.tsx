/**
 * Page Purpose:
 * Create a new inventory item.
 *
 * What goes here:
 * - Item form fields (title, category, condition, pricing)
 * - Image upload and provenance input blocks
 * - Submit handler calling src/api/items.ts
 */
"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { createItem } from "@/api/items";

export default function CreateItemPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Other");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [acquisitionDate, setAcquisitionDate] = useState("");
  const [acquisitionCost, setAcquisitionCost] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [provenance, setProvenance] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const acquisitionCostNum = Number(acquisitionCost);
    const sellingPriceNum = Number(sellingPrice);

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!condition.trim()) {
      setError("Condition is required.");
      return;
    }
    if (!acquisitionDate) {
      setError("Acquisition date is required.");
      return;
    }
    if (!Number.isFinite(acquisitionCostNum) || acquisitionCostNum <= 0) {
      setError("Acquisition cost must be a positive number.");
      return;
    }
    if (!Number.isFinite(sellingPriceNum) || sellingPriceNum <= 0) {
      setError("Selling price must be a positive number.");
      return;
    }

    const mergedNote = [note.trim(), provenance.trim() ? `Provenance: ${provenance.trim()}` : ""]
      .filter(Boolean)
      .join("\n");

    try {
      setSaving(true);
      const res = await createItem({
        title: title.trim(),
        condition: condition.trim(),
        acquisitionDate,
        acquisitionCost: acquisitionCostNum,
        sellingPrice: sellingPriceNum,
        description: description.trim() || undefined,
        imageUrl: imageUrl.trim() || undefined,
        note: mergedNote || undefined,
      });

      if (!res.success) {
        throw new Error(res.error || "Failed to create item.");
      }

      setSuccess(`Item "${res.item?.title ?? title.trim()}" created successfully.`);
      setTimeout(() => router.push("/items"), 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create item.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell pageTitle="Create Item" pageDescription="Add a new item to inventory.">
      <form onSubmit={handleSubmit} className="space-y-5">
        <section className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Title *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="The Hobbit"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            >
              <option>Book</option>
              <option>Map</option>
              <option>Magazine</option>
              <option>Other</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              rows={3}
              placeholder="Short item description..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Condition *</label>
            <input
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Good, minor shelf wear"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Acquisition Date *</label>
            <input
              type="date"
              value={acquisitionDate}
              onChange={(e) => setAcquisitionDate(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Acquisition Cost *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={acquisitionCost}
              onChange={(e) => setAcquisitionCost(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="900.00"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Asking Price *</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="1500.00"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Image URL</label>
            <input
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="https://..."
            />
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Provenance</label>
            <textarea
              value={provenance}
              onChange={(e) => setProvenance(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              rows={3}
              placeholder="Previous owner / source notes..."
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Internal Notes</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              rows={3}
              placeholder="Any private catalog notes..."
            />
          </div>
        </section>

        {error ? (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        ) : null}
        {success ? (
          <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {success}
          </p>
        ) : null}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Creating..." : "Create Item"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/items")}
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </AppShell>
  );
}
