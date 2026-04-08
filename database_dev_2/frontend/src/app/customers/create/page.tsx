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

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 border-b border-stone-200 pb-2 text-base font-bold text-slate-900">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

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
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 rounded-xl border border-stone-200 bg-stone-50 p-4">
          <h1 className="brand-serif text-2xl font-bold text-slate-800">Create Customer</h1>
          <p className="mt-1 text-slate-500">Add a customer profile for purchase history and follow-up tracking.</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <SectionCard title="Customer Information">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-slate-700">First name *</span>
                <input
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, firstName: undefined }));
                  }}
                  maxLength={CUSTOMER_MAX_LENGTHS.firstName}
                  className="input mt-1"
                  required
                />
                {fieldErrors.firstName ? <p className="mt-1 text-xs text-red-600">{fieldErrors.firstName}</p> : null}
              </label>

              <label className="block">
                <span className="text-sm font-medium text-slate-700">Last name *</span>
                <input
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setFieldErrors((prev) => ({ ...prev, lastName: undefined }));
                  }}
                  maxLength={CUSTOMER_MAX_LENGTHS.lastName}
                  className="input mt-1"
                  required
                />
                {fieldErrors.lastName ? <p className="mt-1 text-xs text-red-600">{fieldErrors.lastName}</p> : null}
              </label>
            </div>
          </SectionCard>

          <SectionCard title="Contact & Notes">
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
                  className="input mt-1"
                />
                {fieldErrors.email ? <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p> : null}
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
                  className="input mt-1"
                />
                {fieldErrors.phone ? <p className="mt-1 text-xs text-red-600">{fieldErrors.phone}</p> : null}
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
                className="input mt-1 min-h-28 resize-y"
                rows={4}
              />
              <div className="mt-1 flex items-center justify-between">
                {fieldErrors.notes ? (
                  <p className="text-xs text-red-600">{fieldErrors.notes}</p>
                ) : (
                  <span className="text-xs text-slate-400">Optional</span>
                )}
                <span className="text-xs text-slate-400">
                  {notes.length}/{CUSTOMER_MAX_LENGTHS.notes}
                </span>
              </div>
            </label>
          </SectionCard>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={loading} className="btn-primary px-5 py-2.5 disabled:opacity-60">
              {loading ? "Saving…" : "Save customer"}
            </button>
            <button type="button" onClick={() => router.push("/customers")} className="btn-secondary px-5 py-2.5">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
