"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { apiFetch } from "@/api/api";

type CustomerDetail = {
  customerId: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  createdDate: string | null;
  purchases: number;
  lastPurchase: string | null;
  sales: Array<{
    salesId: number;
    itemId: number;
    salePrice: number | null;
    salesDate: string | null;
  }>;
};

export default function CustomerDetailsPage() {
  const params = useParams();
  const id = String(params?.id || "");
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCustomer() {
      setLoading(true);
      setError("");
      try {
        if (!id) {
          throw new Error("Missing customer id");
        }

        const result = await apiFetch<{ success: boolean; customer: CustomerDetail }>(`/api/customers/${encodeURIComponent(id)}`);
        if (active) {
          setCustomer(result.customer);
        }
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load customer");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCustomer();

    return () => {
      active = false;
    };
  }, [id]);

  return (
    <AppShell pageTitle={`Customer #${id}`} pageDescription="View customer details and history.">
      <section className="space-y-6">
        {loading && <p className="text-sm text-slate-500">Loading customer details...</p>}
        {!loading && error && <p className="text-sm text-red-600">{error}</p>}
        {!loading && customer && (
          <div className="space-y-6">
            <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Customer profile</h2>
                <p className="text-sm text-slate-600">Name, email, phone and notes.</p>
              </div>
              <div className="space-y-2 text-sm text-slate-700">
                <div>
                  <p className="font-medium">Name</p>
                  <p>{customer.name}</p>
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <p>{customer.email || "—"}</p>
                </div>
                <div>
                  <p className="font-medium">Phone</p>
                  <p>{customer.phone || "—"}</p>
                </div>
                <div>
                  <p className="font-medium">Joined</p>
                  <p>{customer.createdDate ? new Date(customer.createdDate).toLocaleDateString("en-CA") : "—"}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Activity summary</h2>
                <p className="text-sm text-slate-600">Sales and last purchase summary.</p>
              </div>
              <div className="space-y-2 text-sm text-slate-700">
                <div>
                  <p className="font-medium">Purchases</p>
                  <p>{customer.purchases}</p>
                </div>
                <div>
                  <p className="font-medium">Last purchase</p>
                  <p>{customer.lastPurchase ? new Date(customer.lastPurchase).toLocaleDateString("en-CA") : "—"}</p>
                </div>
                <div>
                  <p className="font-medium">Notes</p>
                  <p>{customer.notes || "No notes available."}</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">Sales history</h2>
              {customer.sales.length === 0 ? (
                <p className="mt-3 text-sm text-slate-600">No sales history available for this customer.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-left text-slate-600">
                      <tr>
                        <th className="px-3 py-2 font-medium">Sale ID</th>
                        <th className="px-3 py-2 font-medium">Item ID</th>
                        <th className="px-3 py-2 font-medium">Sale Price</th>
                        <th className="px-3 py-2 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customer.sales.map((sale) => (
                        <tr key={sale.salesId} className="border-t border-slate-100">
                          <td className="px-3 py-2 font-mono text-xs text-slate-600">{sale.salesId}</td>
                          <td className="px-3 py-2">{sale.itemId}</td>
                          <td className="px-3 py-2">{sale.salePrice != null ? sale.salePrice.toFixed(2) : "—"}</td>
                          <td className="px-3 py-2">{sale.salesDate ? new Date(sale.salesDate).toLocaleDateString("en-CA") : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </AppShell>
  );
}
