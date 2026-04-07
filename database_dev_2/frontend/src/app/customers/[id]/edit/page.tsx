"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { apiFetch } from "@/api/api";
import {
  CUSTOMER_MAX_LENGTHS,
  normalizeCustomerForm,
  validateCustomerForm,
  type CustomerFormData,
  type CustomerFormErrors,
} from "@/lib/customerValidation";

type CustomerDetail = {
  customerId: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
};

export default function EditCustomerPage() {
  const params = useParams();
  const router = useRouter();
  const id = String(params?.id || "");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [fieldErrors, setFieldErrors] = useState<CustomerFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCustomer() {
      if (!id) {
        setError("Missing customer id");
        setLoadingCustomer(false);
        return;
      }

      try {
        setLoadingCustomer(true);
        setError("");
        const data = await apiFetch<{ success: boolean; customer: CustomerDetail }>(`/api/customers/${encodeURIComponent(id)}`);
        if (!active) return;

        setFirstName(data.customer.firstName || "");
        setLastName(data.customer.lastName || "");
        setEmail(data.customer.email || "");
        setPhone(data.customer.phone || "");
        setNotes(data.customer.notes || "");
      } catch (err) {
        if (active) {
          setError(err instanceof Error ? err.message : "Failed to load customer");
        }
      } finally {
        if (active) {
          setLoadingCustomer(false);
        }
      }
    }

    loadCustomer();
    return () => {
      active = false;
    };
  }, [id]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const formValues: CustomerFormData = { firstName, lastName, email, phone, notes };
    const validationErrors = validateCustomerForm(formValues);
    setFieldErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setLoading(true);

    try {
      const normalizedForm = normalizeCustomerForm(formValues);

      await apiFetch<{ success: boolean; customer: CustomerDetail }>(`/api/customers/${encodeURIComponent(id)}`, {
        method: "PATCH",
        body: JSON.stringify(normalizedForm),
      });

      router.push(`/customers/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell pageTitle={`Edit Customer #${id}`} pageDescription="Update customer profile.">
      <section className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">Edit customer</h2>
          <p className="mt-1 text-sm text-slate-600">Update customer identity, contact information and notes.</p>

          {loadingCustomer ? (
            <p className="mt-6 text-sm text-slate-500">Loading customer...</p>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">First name</span>
                  <input
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, firstName: undefined }));
                    }}
                    maxLength={CUSTOMER_MAX_LENGTHS.firstName}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    required
                  />
                  {fieldErrors.firstName && <p className="mt-1 text-xs text-red-600">{fieldErrors.firstName}</p>}
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Last name</span>
                  <input
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, lastName: undefined }));
                    }}
                    maxLength={CUSTOMER_MAX_LENGTHS.lastName}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                    required
                  />
                  {fieldErrors.lastName && <p className="mt-1 text-xs text-red-600">{fieldErrors.lastName}</p>}
                </label>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Email</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    maxLength={CUSTOMER_MAX_LENGTHS.email}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                  {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
                </label>
                <label className="block">
                  <span className="text-sm font-medium text-slate-700">Phone</span>
                  <input
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      setFieldErrors((prev) => ({ ...prev, phone: undefined }));
                    }}
                    maxLength={CUSTOMER_MAX_LENGTHS.phone}
                    className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  />
                  {fieldErrors.phone && <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p>}
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Notes</span>
                <textarea
                  value={notes}
                  onChange={(e) => {
                    setNotes(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, notes: undefined }));
                  }}
                  maxLength={CUSTOMER_MAX_LENGTHS.notes}
                  className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                  rows={4}
                />
                <div className="mt-1 flex items-center justify-between">
                  {fieldErrors.notes ? (
                    <p className="text-xs text-red-600">{fieldErrors.notes}</p>
                  ) : (
                    <span className="text-xs text-slate-400">Optional</span>
                  )}
                  <span className="text-xs text-slate-400">{notes.length}/{CUSTOMER_MAX_LENGTHS.notes}</span>
                </div>
              </label>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Saving..." : "Save changes"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/customers/${id}`)}
                  className="inline-flex items-center justify-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </AppShell>
  );
}
