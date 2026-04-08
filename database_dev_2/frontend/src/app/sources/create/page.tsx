"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { apiFetch } from "@/api/api";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 border-b border-stone-200 pb-2 text-base font-bold text-slate-900">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export default function CreateSourcePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState("Dealer");
  const [specialty, setSpecialty] = useState("");
  const [collectingInterests, setCollectingInterests] = useState("");
  const [estateName, setEstateName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Source name is required.");
      return;
    }

    try {
      setSaving(true);
      await apiFetch("/api/sources", {
        method: "POST",
        body: JSON.stringify({
          name: trimmedName,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          type,
          specialty: type === "Dealer" ? specialty.trim() || undefined : undefined,
          collectingInterests: type === "Collector" ? collectingInterests.trim() || undefined : undefined,
          estateName: type === "Estate" ? estateName.trim() || undefined : undefined,
          contactPerson: type === "Estate" ? contactPerson.trim() || undefined : undefined,
          dealerNotes: type === "Dealer" ? notes.trim() || undefined : undefined,
          collectorNotes: type === "Collector" ? notes.trim() || undefined : undefined,
          estateNotes: type === "Estate" ? notes.trim() || undefined : undefined,
        }),
      });
      router.push("/sources");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create source");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell pageTitle="Create Source" pageDescription="Add dealers, collectors, estates, and other source contacts.">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 rounded-xl border border-stone-200 bg-stone-50 p-4">
          <h1 className="brand-serif text-2xl font-bold text-slate-800">Create Source</h1>
          <p className="mt-1 text-slate-500">Create a source profile for acquisition and provenance tracking.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <SectionCard title="Source Profile">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Source Name *</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="e.g. Northbound Antiquarian" />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Source Type *</span>
              <select value={type} onChange={(e) => setType(e.target.value)} className="input">
                <option value="Dealer">Dealer</option>
                <option value="Collector">Collector</option>
                <option value="Estate">Estate</option>
                <option value="Source">Other</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="source@example.com"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Phone</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder="416-555-0000" />
            </label>
          </div>
          </SectionCard>

          <SectionCard title="Type-Specific Details">
          {type === "Dealer" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-medium">Specialty</span>
                <input
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  className="input"
                  placeholder="e.g. Early Canadian atlases, 19th-century travel books"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-medium">Relationship Notes</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input min-h-24 resize-y"
                  placeholder="Negotiation style, reliability, preferred communication, pricing range..."
                />
              </label>
            </div>
          ) : null}

          {type === "Collector" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-medium">Collecting Interests</span>
                <input
                  value={collectingInterests}
                  onChange={(e) => setCollectingInterests(e.target.value)}
                  className="input"
                  placeholder="e.g. First editions, wartime maps, National Geographic sets"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-medium">Collector Notes</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input min-h-24 resize-y"
                  placeholder="Collection background, preferred categories, follow-up notes..."
                />
              </label>
            </div>
          ) : null}

          {type === "Estate" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Estate Name</span>
                <input
                  value={estateName}
                  onChange={(e) => setEstateName(e.target.value)}
                  className="input"
                  placeholder="e.g. Whitmore Estate"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Contact Person</span>
                <input
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="input"
                  placeholder="Executor or family contact"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1 block text-sm font-medium">Estate Notes</span>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="input min-h-24 resize-y"
                  placeholder="Collection condition summary, pickup details, donation split..."
                />
              </label>
            </div>
          ) : null}

          {type === "Source" ? (
            <label className="block">
              <span className="mb-1 block text-sm font-medium">Notes</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="input min-h-24 resize-y"
                placeholder="General notes for this source."
              />
            </label>
          ) : null}
          </SectionCard>

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-700">
              {error}
            </div>
          ) : null}

          <div className="flex items-center gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary px-5 py-2.5 disabled:opacity-60">
              {saving ? "Saving..." : "Create Source"}
            </button>
            <button type="button" onClick={() => router.push("/sources")} className="btn-secondary px-5 py-2.5">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AppShell>
  );
}
