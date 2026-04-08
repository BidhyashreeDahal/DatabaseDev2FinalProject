"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { apiFetch } from "@/api/api";

type SourceDetails = {
  sourceId: number;
  name: string;
  type: string;
  email?: string | null;
  phone?: string | null;
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-stone-200 bg-stone-50/70 p-5">
      <h3 className="brand-serif text-2xl text-[#183d35]">{title}</h3>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

export default function EditSourcePage() {
  const params = useParams<{ id: string }>();
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
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const data = await apiFetch<{ success: boolean; source: SourceDetails }>(`/api/sources/${params.id}`);
        if (!active) return;
        setName(data.source.name || "");
        setEmail(data.source.email || "");
        setPhone(data.source.phone || "");
        setType(data.source.type || "Source");
        setSpecialty("");
        setCollectingInterests("");
        setEstateName("");
        setContactPerson("");
        setNotes("");
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Failed to load source");
      } finally {
        if (active) setLoading(false);
      }
    }
    if (params?.id) load();
    return () => {
      active = false;
    };
  }, [params?.id]);

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
      await apiFetch(`/api/sources/${params.id}`, {
        method: "PATCH",
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
      router.push(`/sources/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update source");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell pageTitle={`Edit Source #${params.id}`} pageDescription="Update source details.">
      {loading ? (
        <p className="text-sm text-zinc-600">Loading source...</p>
      ) : (
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-5">
          <SectionCard title="Source Profile">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Source Name *</span>
                <input value={name} onChange={(e) => setName(e.target.value)} className="input" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Source Type</span>
                <select value={type} onChange={(e) => setType(e.target.value)} className="input">
                  <option value="Dealer">Dealer</option>
                  <option value="Collector">Collector</option>
                  <option value="Estate">Estate</option>
                  <option value="Source">Other</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Email</span>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">Phone</span>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className="input" />
              </label>
            </div>
          </SectionCard>

          <SectionCard title="Type-Specific Details">
            {type === "Dealer" ? (
              <>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Specialty</span>
                  <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} className="input" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Relationship Notes</span>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input min-h-24 resize-y" />
                </label>
              </>
            ) : null}

            {type === "Collector" ? (
              <>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Collecting Interests</span>
                  <input value={collectingInterests} onChange={(e) => setCollectingInterests(e.target.value)} className="input" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Collector Notes</span>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input min-h-24 resize-y" />
                </label>
              </>
            ) : null}

            {type === "Estate" ? (
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Estate Name</span>
                  <input value={estateName} onChange={(e) => setEstateName(e.target.value)} className="input" />
                </label>
                <label className="block">
                  <span className="mb-1 block text-sm font-medium">Contact Person</span>
                  <input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="input" />
                </label>
                <label className="block md:col-span-2">
                  <span className="mb-1 block text-sm font-medium">Estate Notes</span>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="input min-h-24 resize-y" />
                </label>
              </div>
            ) : null}
          </SectionCard>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex gap-3">
            <button type="submit" disabled={saving} className="btn-primary px-5 py-2.5 disabled:opacity-60">
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button type="button" onClick={() => router.push(`/sources/${params.id}`)} className="btn-secondary px-5 py-2.5">
              Cancel
            </button>
          </div>
        </form>
      )}
    </AppShell>
  );
}
