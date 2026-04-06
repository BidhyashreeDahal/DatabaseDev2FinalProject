"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { createItem } from "@/api/items";
import { apiFetch } from "@/api/api";

// ─── tiny helpers ────────────────────────────────────────────────────────────

type DropdownOption = { id: number; name: string };
type AuthorsResponse = { authors: DropdownOption[] };
type PublishersResponse = { publishers: DropdownOption[] };
type CartographersResponse = { cartographers: DropdownOption[] };
type AuthorCreateResponse = { author: DropdownOption };
type PublisherCreateResponse = { publisher: DropdownOption };
type CartographerCreateResponse = { cartographer: DropdownOption };

function Label({
  children,
  required,
}: {
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block text-sm font-semibold text-slate-700 mb-1">
      {children}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
  );
}

function Field({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col">{children}</div>;
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">
        {title}
      </h3>
      <div className="grid md:grid-cols-2 gap-5">{children}</div>
    </div>
  );
}

// ─── Dropdown with "Add New" option ──────────────────────────────────────────

function SelectWithAdd({
  label,
  required,
  options,
  value,
  onChange,
  addLabel,
  onAdd,
  adding,
  addingLabel,
}: {
  label: string;
  required?: boolean;
  options: DropdownOption[];
  value: string;
  onChange: (v: string) => void;
  addLabel: string;
  onAdd: (name: string) => Promise<void>;
  adding: boolean;
  addingLabel: string;
}) {
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState("");

  async function handleAdd() {
    if (!newName.trim()) return;
    await onAdd(newName.trim());
    setNewName("");
    setShowAdd(false);
  }

  return (
    <Field>
      <Label required={required}>{label}</Label>
      <select
        value={value}
        onChange={(e) => {
          if (e.target.value === "__add__") {
            setShowAdd(true);
          } else {
            onChange(e.target.value);
          }
        }}
        className="input text-base"
      >
        <option value="">— Select {label} —</option>
        {options.map((o) => (
          <option key={o.id} value={String(o.id)}>
            {o.name}
          </option>
        ))}
        <option value="__add__"> {addLabel}</option>
      </select>

      {showAdd && (
        <div className="mt-2 p-3 bg-white border border-slate-300 rounded-lg flex gap-2 items-center">
          <input
            className="input flex-1 text-sm"
            placeholder={`Enter ${addingLabel} name…`}
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd();
              }
            }}
            autoFocus
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={adding || !newName.trim()}
            className="bg-slate-900 text-white text-sm px-3 py-2 rounded-lg hover:bg-slate-800 disabled:opacity-50 whitespace-nowrap"
          >
            {adding ? "Saving…" : "Add"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowAdd(false);
              setNewName("");
            }}
            className="text-slate-400 hover:text-slate-700 text-lg leading-none px-1"
          >
            ✕
          </button>
        </div>
      )}
    </Field>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function CreateItemPage() {
  const router = useRouter();

  // ── dropdown data ──
  const [authors, setAuthors] = useState<DropdownOption[]>([]);
  const [publishers, setPublishers] = useState<DropdownOption[]>([]);
  const [cartographers, setCartographers] = useState<DropdownOption[]>([]);
  const [addingAuthor, setAddingAuthor] = useState(false);
  const [addingPublisher, setAddingPublisher] = useState(false);
  const [addingCartographer, setAddingCartographer] = useState(false);

  // ── common fields ──
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Book");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [acquisitionDate, setAcquisitionDate] = useState("");
  const [acquisitionCost, setAcquisitionCost] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [note, setNote] = useState("");

  // ── book fields ──
  const [authorId, setAuthorId] = useState("");
  const [publisherId, setPublisherId] = useState("");
  const [publishingYear, setPublishingYear] = useState("");
  const [edition, setEdition] = useState("");
  const [isbn, setIsbn] = useState("");
  const [bindingType, setBindingType] = useState("");
  const [genre, setGenre] = useState("");

  // ── map fields ──
  const [cartographerId, setCartographerId] = useState("");
  const [mapPublisherId, setMapPublisherId] = useState("");
  const [mapYear, setMapYear] = useState("");
  const [scale, setScale] = useState("");
  const [mapType, setMapType] = useState("");

  // ── periodical fields ──
  const [periodicalPublisherId, setPeriodicalPublisherId] = useState("");
  const [issueDate, setIssueDate] = useState("");
  const [issueNumber, setIssueNumber] = useState("");
  const [subjectCoverage, setSubjectCoverage] = useState("");

  // ── system ──
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadLookups() {
      try {
        const [authorsRes, publishersRes, cartographersRes] = await Promise.all([
          apiFetch<AuthorsResponse>("/api/authors"),
          apiFetch<PublishersResponse>("/api/publishers"),
          apiFetch<CartographersResponse>("/api/cartographers"),
        ]);

        if (!active) return;
        setAuthors(authorsRes.authors ?? []);
        setPublishers(publishersRes.publishers ?? []);
        setCartographers(cartographersRes.cartographers ?? []);
      } catch (err) {
        if (!active) return;
        const message = err instanceof Error ? err.message : "Failed to load form options";
        setError(message);
      }
    }

    loadLookups();
    return () => {
      active = false;
    };
  }, []);

  // ─── Add-new helpers ───────────────────────────────────────────────────────
  async function addAuthor(name: string) {
    setAddingAuthor(true);
    try {
      const data = await apiFetch<AuthorCreateResponse>("/api/authors", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      if (data.author) {
        setAuthors((prev) => [...prev, data.author].sort((a, b) => a.name.localeCompare(b.name)));
        setAuthorId(String(data.author.id));
      }
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add author");
    } finally {
      setAddingAuthor(false);
    }
  }

  async function addPublisher(name: string) {
    setAddingPublisher(true);
    try {
      const data = await apiFetch<PublisherCreateResponse>("/api/publishers", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      if (data.publisher) {
        setPublishers((prev) => [...prev, data.publisher].sort((a, b) => a.name.localeCompare(b.name)));
        setPublisherId(String(data.publisher.id));
        setMapPublisherId(String(data.publisher.id));
        setPeriodicalPublisherId(String(data.publisher.id));
      }
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add publisher");
    } finally {
      setAddingPublisher(false);
    }
  }

  async function addCartographer(name: string) {
    setAddingCartographer(true);
    try {
      const data = await apiFetch<CartographerCreateResponse>("/api/cartographers", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      if (data.cartographer) {
        setCartographers((prev) => [...prev, data.cartographer].sort((a, b) => a.name.localeCompare(b.name)));
        setCartographerId(String(data.cartographer.id));
      }
      setError("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add cartographer");
    } finally {
      setAddingCartographer(false);
    }
  }

  // ─── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    const acquisitionCostNum = Number(acquisitionCost);
    const sellingPriceNum = Number(sellingPrice);

    if (!title.trim()) return setError("Please enter the item title.");
    if (!condition.trim()) return setError("Please describe the item condition.");
    if (!acquisitionDate) return setError("Please enter the date this item was acquired.");
    if (!Number.isFinite(acquisitionCostNum) || acquisitionCostNum <= 0)
      return setError("Please enter a valid acquisition cost (e.g. 150.00).");
    if (!Number.isFinite(sellingPriceNum) || sellingPriceNum <= 0)
      return setError("Please enter a valid selling price (e.g. 250.00).");

    if (category === "Book") {
      if (!authorId) return setError("Please select an author for this book.");
      if (!publisherId) return setError("Please select a publisher for this book.");
      if (!publishingYear) return setError("Please enter publishing year for this book.");
      if (!edition.trim()) return setError("Please enter edition for this book.");
      if (!isbn.trim()) return setError("Please enter ISBN for this book.");
      if (!bindingType.trim()) return setError("Please select binding type for this book.");
    }
    if (category === "Map") {
      if (!mapType) return setError("Please enter the map type.");
    }
    if (category === "Magazine") {
      if (!issueDate) return setError("Please enter the issue date for this magazine.");
    }

    const payload: any = {
      title: title.trim(),
      condition: condition.trim(),
      acquisitionDate,
      acquisitionCost: acquisitionCostNum,
      sellingPrice: sellingPriceNum,
      description: description.trim() || undefined,
      imageUrl: imageUrl.trim() || undefined,
      note: note.trim() || undefined,
      category,
    };

    if (category === "Book") {
      payload.book = {
        authorId: Number(authorId),
        publisherId: Number(publisherId),
        publishingYear: publishingYear || undefined,
        edition: edition || undefined,
        isbn: isbn || undefined,
        bindingType: bindingType || undefined,
        genre: genre || undefined,
      };
    }

    if (category === "Map") {
      payload.map = {
        cartographerId: cartographerId ? Number(cartographerId) : undefined,
        publisherId: mapPublisherId ? Number(mapPublisherId) : undefined,
        publishingYear: mapYear || undefined,
        scale: scale || undefined,
        mapType,
      };
    }

    if (category === "Magazine") {
      payload.periodical = {
        publisherId: periodicalPublisherId
          ? Number(periodicalPublisherId)
          : undefined,
        issueDate,
        issueNumber: issueNumber || undefined,
        subjectCoverage: subjectCoverage || undefined,
      };
    }

    try {
      setSaving(true);
      const res = await createItem(payload);
      if (!res.success) throw new Error(res.error);
      setSuccess(" Item added to inventory successfully!");
      setTimeout(() => router.push("/items"), 1200);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  // ─── UI ───────────────────────────────────────────────────────────────────
  return (
    <AppShell pageTitle="Add Item" pageDescription="Add a new item to your inventory">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-800">Add Item</h1>
          <p className="text-slate-500 mt-1">
            Fill in the details below. Fields marked with{" "}
            <span className="text-red-500 font-bold">*</span> are required.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── SECTION 1: Basic Info ── */}
          <SectionCard title=" Basic Information">

            <Field>
              <Label required>Item Title</Label>
              <input
                placeholder="e.g. The Hobbit, First Edition"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="input text-base"
              />
            </Field>

            <Field>
              <Label required>Category</Label>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  // reset category-specific IDs
                  setAuthorId("");
                  setPublisherId("");
                  setMapPublisherId("");
                  setPeriodicalPublisherId("");
                  setCartographerId("");
                }}
                className="input text-base"
              >
                <option value="Book">  Book</option>
                <option value="Map"> Map</option>
                <option value="Magazine">  Magazine / Periodical</option>
              </select>
            </Field>

            <Field>
              <Label required>Condition</Label>
              <input
                placeholder="e.g. Good — minor shelf wear, tight binding"
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="input text-base"
              />
            </Field>

            <Field>
              <Label required>Date Acquired</Label>
              <input
                type="date"
                value={acquisitionDate}
                onChange={(e) => setAcquisitionDate(e.target.value)}
                className="input text-base"
              />
            </Field>

            <Field>
              <Label required>Acquisition Cost ($)</Label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={acquisitionCost}
                onChange={(e) => setAcquisitionCost(e.target.value)}
                className="input text-base"
              />
            </Field>

            <Field>
              <Label required>Selling Price ($)</Label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                className="input text-base"
              />
            </Field>

            <div className="col-span-2">
              <Field>
                <Label>Description</Label>
                <textarea
                  placeholder="Brief description of the item, its history, or notable features…"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="input text-base resize-none"
                />
              </Field>
            </div>

            <Field>
              <Label>Image URL</Label>
              <input
                placeholder="https://…"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="input text-base"
              />
            </Field>

            <Field>
              <Label>Internal Notes</Label>
              <textarea
                placeholder="Private notes for staff only (e.g. storage location, special handling)…"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="input text-base resize-none"
              />
            </Field>

          </SectionCard>

          {/* ── SECTION 2: Book Details ── */}
          {category === "Book" && (
            <SectionCard title="Book Details">

              <SelectWithAdd
                label="Author"
                required
                options={authors}
                value={authorId}
                onChange={setAuthorId}
                addLabel="Add a new author"
                addingLabel="author"
                onAdd={addAuthor}
                adding={addingAuthor}
              />

              <SelectWithAdd
                label="Publisher"
                required
                options={publishers}
                value={publisherId}
                onChange={setPublisherId}
                addLabel="Add a new publisher"
                addingLabel="publisher"
                onAdd={addPublisher}
                adding={addingPublisher}
              />

              <Field>
                <Label required>Publishing Year</Label>
                <input
                  type="date"
                  value={publishingYear}
                  onChange={(e) => setPublishingYear(e.target.value)}
                  className="input text-base"
                />
              </Field>

              <Field>
                <Label required>Edition</Label>
                <input
                  placeholder="e.g. 1st Edition, 3rd Revised"
                  value={edition}
                  onChange={(e) => setEdition(e.target.value)}
                  className="input text-base"
                />
              </Field>

              <Field>
                <Label required>ISBN</Label>
                <input
                  placeholder="e.g. 978-0-00-000000-0"
                  value={isbn}
                  onChange={(e) => setIsbn(e.target.value)}
                  className="input text-base"
                />
              </Field>

              <Field>
                <Label required>Binding Type</Label>
                <select
                  value={bindingType}
                  onChange={(e) => setBindingType(e.target.value)}
                  className="input text-base"
                >
                  <option value="">— Select binding —</option>
                  <option>Hardcover</option>
                  <option>Softcover / Paperback</option>
                  <option>Leather Bound</option>
                  <option>Quarter Bound</option>
                  <option>Half Bound</option>
                  <option>Vellum</option>
                  <option>Other</option>
                </select>
              </Field>

              <Field>
                <Label>Genre</Label>
                <input
                  placeholder="e.g. Fantasy, Historical Fiction, Science"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="input text-base"
                />
              </Field>

            </SectionCard>
          )}

          {/* ── SECTION 3: Map Details ── */}
          {category === "Map" && (
            <SectionCard title="🗺️  Map Details">

              <SelectWithAdd
                label="Cartographer"
                options={cartographers}
                value={cartographerId}
                onChange={setCartographerId}
                addLabel="Add a new cartographer"
                addingLabel="cartographer"
                onAdd={addCartographer}
                adding={addingCartographer}
              />

              <SelectWithAdd
                label="Publisher"
                options={publishers}
                value={mapPublisherId}
                onChange={setMapPublisherId}
                addLabel="Add a new publisher"
                addingLabel="publisher"
                onAdd={addPublisher}
                adding={addingPublisher}
              />

              <Field>
                <Label>Year Published</Label>
                <input
                  type="date"
                  value={mapYear}
                  onChange={(e) => setMapYear(e.target.value)}
                  className="input text-base"
                />
              </Field>

              <Field>
                <Label>Scale</Label>
                <input
                  placeholder="e.g. 1 inch = 50 miles"
                  value={scale}
                  onChange={(e) => setScale(e.target.value)}
                  className="input text-base"
                />
              </Field>

              <Field>
                <Label required>Map Type</Label>
                <select
                  value={mapType}
                  onChange={(e) => setMapType(e.target.value)}
                  className="input text-base"
                >
                  <option value="">— Select map type —</option>
                  <option>Political</option>
                  <option>Physical / Topographic</option>
                  <option>World</option>
                  <option>Nautical / Sea Chart</option>
                  <option>City Plan</option>
                  <option>Road Map</option>
                  <option>Battle Map</option>
                  <option>Celestial</option>
                  <option>Other</option>
                </select>
              </Field>

            </SectionCard>
          )}

          {/* ── SECTION 4: Magazine / Periodical Details ── */}
          {category === "Magazine" && (
            <SectionCard title=" Magazine / Periodical Details">

              <SelectWithAdd
                label="Publisher"
                options={publishers}
                value={periodicalPublisherId}
                onChange={setPeriodicalPublisherId}
                addLabel="Add a new publisher"
                addingLabel="publisher"
                onAdd={addPublisher}
                adding={addingPublisher}
              />

              <Field>
                <Label required>Issue Date</Label>
                <input
                  type="date"
                  value={issueDate}
                  onChange={(e) => setIssueDate(e.target.value)}
                  className="input text-base"
                />
              </Field>

              <Field>
                <Label>Issue Number / Volume</Label>
                <input
                  placeholder="e.g. Vol. 12, No. 3"
                  value={issueNumber}
                  onChange={(e) => setIssueNumber(e.target.value)}
                  className="input text-base"
                />
              </Field>

              <Field>
                <Label>Subject Coverage</Label>
                <textarea
                  placeholder="e.g. Politics, satire, Victorian life and culture"
                  value={subjectCoverage}
                  onChange={(e) => setSubjectCoverage(e.target.value)}
                  rows={2}
                  className="input text-base resize-none"
                />
              </Field>

            </SectionCard>
          )}

          {/* ── Feedback ── */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-red-700 font-medium text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 text-green-700 font-medium text-sm">
              {success}
            </div>
          )}

          {/* ── Actions ── */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-slate-900 text-white text-base font-semibold px-8 py-3 rounded-xl hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : "Add Item to Inventory"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="bg-white border border-slate-300 text-slate-700 text-base font-medium px-6 py-3 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
          </div>

        </form>
      </div>
    </AppShell>
  );
}