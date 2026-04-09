"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ReadingRoomLogo } from "@/components/layout/ReadingRoomLogo";

export default function LoginPage() {
  const router = useRouter();
  const { login, user, loading } = useAuth();
  const [email, setEmail] = useState("connor@britannicus.local");
  const [password, setPassword] = useState("Connor123!");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/items");
    }
  }, [loading, user, router]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/items");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#0f302a] text-[#f6edd7]">
      <div className="mx-auto grid min-h-screen w-full max-w-[1320px] gap-6 px-5 py-8 lg:grid-cols-[1fr_1.05fr] lg:gap-8 lg:px-8">
        <section className="order-2 relative self-center rounded-3xl border border-[#cfac59]/30 bg-[#133f36] p-7 shadow-xl shadow-black/20 md:p-8 lg:order-1 overflow-hidden">
          <div className="paper-grain absolute inset-0 rounded-3xl opacity-20" />
          <div className="absolute inset-0 rounded-3xl bg-[radial-gradient(circle_at_20%_15%,rgba(221,184,91,0.11),transparent_45%)]" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <ReadingRoomLogo size={56} />
              <div>
                <p className="hero-title text-4xl leading-none text-[#f8ebc8]">Britannicus</p>
                <p className="hero-subtitle mt-1 text-sm text-[#ecd9a6]">Reading Room</p>
              </div>
            </div>

            <p className="hero-subtitle mt-4 text-xs text-[#e6d59f]/90">
              Welcome to the Britannicus Reading Room
            </p>

            <h1 className="hero-title mt-10 text-[2.6rem] text-[#f9edce]">
              Curated inventory,
              <br />
              modern control.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-relaxed text-[#f1e1ba]">
              Built for rare books and antique maps. Manage acquisitions, provenance, and
              pricing in one secure workspace.
            </p>

            <div className="mt-8 rounded-2xl border border-[#d6b768]/30 bg-[#0f352e]/55 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[#ddc27c]">Collection Focus</p>
              <p className="mt-2 brand-serif text-xl text-[#f5e7c1]">
                Rare books, antique maps, and documented provenance.
              </p>
            </div>
          </div>
        </section>

        <section className="order-1 flex items-center lg:order-2">
          <div className="w-full rounded-3xl border border-[#d8c79e] bg-[#fffaf0] p-7 shadow-xl shadow-black/30 md:p-9">
            <div className="mb-2 flex items-center justify-between">
              <p className="hero-subtitle text-[11px] text-[#5f7570]">Staff Access Portal</p>
              <span className="rounded-md border border-[#d8c79e] bg-[#f7f0dd] px-2 py-1 text-xs font-semibold tracking-wide text-[#35544c]">
                BRR
              </span>
            </div>
            <h2 className="page-title mt-2 text-4xl text-[#173b33]">Sign In</h2>
            <span className="page-title-accent" />
            <p className="mt-2 text-sm text-[#556963]">
              Access inventory, customers, acquisitions, and pricing history.
            </p>
            <div className="mt-4">
              <Link
                href="/"
                className="inline-flex items-center rounded-lg border border-[#d8c79e] bg-[#f7f0dd] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] text-[#35544c] transition hover:bg-[#efe2c2]"
              >
                Back to Landing Page
              </Link>
            </div>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5">
              <label className="block space-y-1">
                <span className="text-sm font-bold uppercase tracking-wide text-[#22453d]">Email</span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input mt-1 text-base"
                  autoComplete="email"
                  placeholder="connor@britannicus.local"
                />
              </label>

              <label className="block space-y-1">
                <span className="text-sm font-bold uppercase tracking-wide text-[#22453d]">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input mt-1 text-base"
                  autoComplete="current-password"
                  placeholder="Enter password"
                />
                <p className="pt-1 text-xs text-[#6d817b]">Use your assigned staff credentials.</p>
              </label>

              {error ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full px-4 py-3 text-base tracking-[0.1em] shadow-md shadow-[#0f302a]/20 disabled:opacity-60"
              >
                {submitting ? "SIGNING IN..." : "ENTER READING ROOM"}
              </button>

              <p className="text-center text-xs text-[#7b8f89]">Authorized staff only.</p>
            </form>
          </div>
        </section>
      </div>
      <footer className="pb-5 text-center text-xs tracking-wide text-[#dbc88d]">
        © Britannicus Reading Room — Staff Access Only
      </footer>
    </main>
  );
}
