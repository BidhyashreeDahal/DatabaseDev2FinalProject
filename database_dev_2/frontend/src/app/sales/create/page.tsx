"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { apiFetch } from "@/api/api";

type CustomerOption = {
  customerId: number;
  firstName?: string;
  lastName?: string;
  name?: string;
};

type ItemOption = {
  itemId: number;
  title: string;
  askingPrice: number;
  status: string;
};

type PaymentMethodOption = {
  paymentMethodId: number;
  paymentMethod: string;
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 border-b border-stone-200 pb-2 text-base font-bold text-slate-900">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function CreateSalePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [items, setItems] = useState<ItemOption[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodOption[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [itemId, setItemId] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [salesDate, setSalesDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const [customerRes, itemRes, paymentRes] = await Promise.all([
          apiFetch<{ success: boolean; customers: CustomerOption[] }>("/api/customers"),
          apiFetch<{ success: boolean; items: ItemOption[] }>("/api/items"),
          apiFetch<{ success: boolean; paymentMethods: PaymentMethodOption[] }>("/api/payment-methods"),
        ]);
        if (!active) return;
        setCustomers(customerRes.customers || []);
        setItems((itemRes.items || []).filter((item) => String(item.status || "").toLowerCase() !== "sold"));
        setPaymentMethods(paymentRes.paymentMethods || []);
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load sales form options");
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const selectedItem = items.find((item) => String(item.itemId) === itemId);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const parsedCustomerId = Number(customerId);
    const parsedItemId = Number(itemId);
    const parsedPaymentMethodId = Number(paymentMethodId);
    const parsedSalePrice = Number(salePrice);

    if (!Number.isInteger(parsedCustomerId) || parsedCustomerId <= 0) {
      setError("Please select a customer.");
      return;
    }
    if (!Number.isInteger(parsedItemId) || parsedItemId <= 0) {
      setError("Please select an item.");
      return;
    }
    if (!Number.isInteger(parsedPaymentMethodId) || parsedPaymentMethodId <= 0) {
      setError("Please select a payment method.");
      return;
    }
    if (!Number.isFinite(parsedSalePrice) || parsedSalePrice <= 0) {
      setError("Please enter a valid sale price.");
      return;
    }

    try {
      setSaving(true);
      await apiFetch("/api/sales", {
        method: "POST",
        body: JSON.stringify({
          customerId: parsedCustomerId,
          itemId: parsedItemId,
          paymentMethodId: parsedPaymentMethodId,
          salePrice: parsedSalePrice,
          salesDate: salesDate || undefined,
        }),
      });
      router.push("/sales");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record sale");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell pageTitle="Record Sale" pageDescription="Create a new sale transaction.">
      {loading ? (
        <p className="text-sm text-zinc-600">Loading customers, inventory, and payment methods...</p>
      ) : (
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 rounded-xl border border-stone-200 bg-stone-50 p-4">
            <h1 className="brand-serif text-2xl font-bold text-slate-800">Record Sale</h1>
            <p className="mt-1 text-slate-500">Capture customer purchase details and mark inventory as sold.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <SectionCard title="Sale Details">
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Customer *</span>
                  <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className="input">
                    <option value="">Select customer</option>
                    {customers.map((customer) => (
                      <option key={customer.customerId} value={customer.customerId}>
                        {customer.name || `${customer.firstName || ""} ${customer.lastName || ""}`.trim() || `Customer #${customer.customerId}`}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Item *</span>
                  <select value={itemId} onChange={(e) => setItemId(e.target.value)} className="input">
                    <option value="">Select in-stock item</option>
                    {items.map((item) => (
                      <option key={item.itemId} value={item.itemId}>
                        #{item.itemId} - {item.title}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Payment Method *</span>
                  <select value={paymentMethodId} onChange={(e) => setPaymentMethodId(e.target.value)} className="input">
                    <option value="">Select payment method</option>
                    {paymentMethods.map((method) => (
                      <option key={method.paymentMethodId} value={method.paymentMethodId}>
                        {method.paymentMethod}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Sale Price ($) *</span>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="input"
                    placeholder={selectedItem ? String(selectedItem.askingPrice.toFixed(2)) : "0.00"}
                  />
                </label>

                <label className="block md:col-span-2">
                  <span className="mb-1 block text-sm font-medium">Sale Date (optional)</span>
                  <input type="datetime-local" value={salesDate} onChange={(e) => setSalesDate(e.target.value)} className="input" />
                </label>
              </div>
            </SectionCard>

            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
                {error}
              </div>
            ) : null}

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary px-5 py-2.5 disabled:opacity-60">
                {saving ? "Saving..." : "Record Sale"}
              </button>
              <button type="button" onClick={() => router.push("/sales")} className="btn-secondary px-5 py-2.5">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </AppShell>
  );
}
