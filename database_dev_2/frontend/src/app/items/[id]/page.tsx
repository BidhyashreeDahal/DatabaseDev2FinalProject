"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { API_BASE_URL } from "@/api/api";

export default function ItemDetailsPage() {
  const { id } = useParams();
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/items/${id}`, {
          credentials: "include",
        });

        const data = await res.json();
        setItem(data.item);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (id) load();
  }, [id]);

  function formatCurrency(value: unknown) {
    const amount = Number(value);
    if (!Number.isFinite(amount)) return "N/A";
    return `$${amount.toFixed(2)}`;
  }

  function formatDate(value: unknown) {
    if (!value) return "N/A";
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString();
  }

  // -----------------------------
  // LOADING
  // -----------------------------
  if (loading) {
    return (
      <AppShell pageTitle="Loading...">
        <div className="p-6 text-sm text-slate-500">Loading item...</div>
      </AppShell>
    );
  }

  // -----------------------------
  // NOT FOUND
  // -----------------------------
  if (!item) {
    return (
      <AppShell pageTitle="Item not found">
        <div className="p-6 text-red-500">Item not found</div>
      </AppShell>
    );
  }

  // -----------------------------
  // MAIN UI
  // -----------------------------
  return (
    <AppShell pageTitle={item.title} pageDescription="Item details">
      <div className="space-y-6">

        {/* HEADER */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-2xl font-semibold text-slate-900">
            {item.title}
          </h2>
          <p className="text-sm text-slate-500">{item.category} • {item.status}</p>
        </div>

        {/* BASIC INFO */}
        <div className="grid md:grid-cols-2 gap-4 bg-white p-4 rounded border">
          <p><b>Item ID:</b> {item.item_id}</p>
          <p><b>Condition:</b> {item.condition}</p>
          <p><b>Acquisition Cost:</b> {formatCurrency(item.acquisition_cost)}</p>
          <p><b>Selling Price:</b> {formatCurrency(item.selling_price)}</p>
          <p><b>Acquired:</b> {formatDate(item.acquisition_date)}</p>
          <p><b>Status:</b> {item.status}</p>
          <p className="md:col-span-2"><b>Description:</b> {item.description || "N/A"}</p>
          <p className="md:col-span-2"><b>Internal Note:</b> {item.note || "N/A"}</p>
          {item.image_url && (
            <div className="md:col-span-2">
              <p className="mb-2"><b>Image:</b></p>
              <img src={item.image_url} alt={item.title} className="max-h-64 rounded border border-slate-200 object-contain" />
            </div>
          )}
        </div>

        {/* BOOK DETAILS */}
        {item.book && (
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold mb-2">Book Details</h3>
            <p><b>Author:</b> {item.book.author?.name || `ID ${item.book.author_id}`}</p>
            <p><b>Publisher:</b> {item.book.publisher?.name || `ID ${item.book.publisher_id}`}</p>
            <p><b>Publishing Year:</b> {formatDate(item.book.publishing_year)}</p>
            <p><b>ISBN:</b> {item.book.isbn}</p>
            <p><b>Edition:</b> {item.book.edition}</p>
            <p><b>Binding Type:</b> {item.book.binding_type}</p>
            <p><b>Genre:</b> {item.book.genre || "N/A"}</p>
          </div>
        )}

        {/* MAP DETAILS */}
        {item.map && (
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold mb-2">Map Details</h3>
            <p><b>Cartographer:</b> {item.map.cartographer?.name || "N/A"}</p>
            <p><b>Publisher:</b> {item.map.publisher?.name || "N/A"}</p>
            <p><b>Publishing Year:</b> {formatDate(item.map.publishing_year)}</p>
            <p><b>Type:</b> {item.map.map_type}</p>
            <p><b>Scale:</b> {item.map.scale || "N/A"}</p>
          </div>
        )}

        {/* PERIODICAL DETAILS */}
        {item.periodical && (
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold mb-2">Magazine Details</h3>
            <p><b>Publisher:</b> {item.periodical.publisher?.name || "N/A"}</p>
            <p><b>Issue:</b> {item.periodical.issue_number || "N/A"}</p>
            <p><b>Date:</b> {formatDate(item.periodical.issue_date)}</p>
            <p><b>Subject Coverage:</b> {item.periodical.subject_coverage || "N/A"}</p>
          </div>
        )}

        {Array.isArray(item.provenance) && item.provenance.length > 0 && (
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold mb-2">Recent Provenance</h3>
            <div className="space-y-2 text-sm">
              {item.provenance.map((entry: any) => (
                <p key={entry.provenance_id}>
                  <b>{entry.previous_owner}</b> ({formatDate(entry.start_date)} - {entry.end_date ? formatDate(entry.end_date) : "Present"})
                </p>
              ))}
            </div>
          </div>
        )}

        {Array.isArray(item.price_history) && item.price_history.length > 0 && (
          <div className="bg-white p-4 rounded border">
            <h3 className="font-semibold mb-2">Recent Price History</h3>
            <div className="space-y-2 text-sm">
              {item.price_history.map((entry: any) => (
                <p key={entry.price_history_id}>
                  {formatDate(entry.recorded_date)} - {formatCurrency(entry.market_value)} ({entry.source})
                </p>
              ))}
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}