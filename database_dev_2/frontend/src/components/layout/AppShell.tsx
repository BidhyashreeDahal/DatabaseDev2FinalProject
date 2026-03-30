"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { canAccess } from "@/lib/permissions";

type AppShellProps = {
  pageTitle: string;
  pageDescription?: string;
  children: ReactNode;
};

export function AppShell({
  pageTitle,
  pageDescription,
  children,
}: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  const links = [
    { href: "/items", label: "Items" },
    { href: "/customers", label: "Customers" },
    { href: "/sources", label: "Sources" },
    { href: "/acquisitions", label: "Acquisitions" },
    { href: "/sales", label: "Sales" },
    { href: "/price-history", label: "Price History" },
  ];

  const roleLinks = [
    { href: "/users", label: "Users", allowed: canAccess(user?.role, "READ_USER") },
    { href: "/audit-logs", label: "Audit Logs", allowed: canAccess(user?.role, "READ_AUDIT_LOGS") },
  ];

  async function handleLogout() {
    await logout();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <div className="w-full px-4 py-6">
        <header className="rounded-t-lg border border-slate-200 bg-white px-6 py-5 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">Britannicus Reading Room</h1>
              <p className="mt-1 text-sm text-slate-500">Inventory and transaction management</p>
            </div>
            {!loading && user ? (
              <>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-800">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs uppercase text-slate-500">{user.role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </header>

        <nav className="rounded-b-lg border-x border-b border-slate-200 bg-white px-2 py-2 shadow-sm">
          <div className="flex flex-wrap gap-1">
            {links.map((link) => {
              const isActive = pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-md px-3 py-2 text-sm ${
                    isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            {roleLinks
              .filter((link) => link.allowed)
              .map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-md px-3 py-2 text-sm ${
                      isActive ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
          </div>
        </nav>

        <main className="mt-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5">
            <h2 className="text-2xl font-semibold text-zinc-900">{pageTitle}</h2>
            {pageDescription ? <p className="text-zinc-600">{pageDescription}</p> : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}