"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { apiFetch } from "@/api/api";
import {
  CUSTOMER_MAX_LENGTHS,
  normalizeCustomerForm,
  validateCustomerForm,
  type CustomerFormData,
  type CustomerFormErrors,
} from "@/lib/customerValidation";

export default function CreateCustomerPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [fieldErrors, setFieldErrors] = useState<CustomerFormErrors>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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

      const result = await apiFetch<{ success: boolean; customer: { customerId: number } }>("/api/customers", {
        method: "POST",
        body: JSON.stringify(normalizedForm),
      });

      router.push(`/customers/${result.customer.customerId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppShell pageTitle="Create Customer" pageDescription="Add a new customer profile.">
      <section className="space-y-6">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-900">New customer</h2>
          <p className="mt-1 text-sm text-slate-600">Create a new customer record for tracking purchase history.</p>

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

            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save customer"}
            </button>
          </form>
        </div>
      </section>
    </AppShell>
  );
}
