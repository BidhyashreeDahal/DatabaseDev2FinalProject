"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { canAccess } from "@/lib/permissions";
import { ReadingRoomLogo } from "@/components/layout/ReadingRoomLogo";

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

  const navLinkClass = (isActive: boolean) =>
    `group flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm font-medium tracking-wide transition ${
      isActive
        ? "border-[#c9b384] bg-gradient-to-r from-[#eee0bc] to-[#e7d8b1] text-[#123930] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
        : "border-transparent text-[#2a4b43] hover:border-[#dbcba9] hover:bg-[#f3ead4] hover:text-[#163a33]"
    }`;

  return (
    <div className="h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_#faf7ee_0%,_#f2ecdc_42%,_#ebe4d2_100%)] text-slate-900">
      <div className="fixed left-0 right-0 top-0 z-40 px-0 py-0">
          <header className="border-b border-[#1a4b41] bg-gradient-to-r from-[#0f332d] via-[#15473d] to-[#0f332d] px-5 py-4 text-stone-100 shadow-[0_8px_20px_rgba(15,51,45,0.22)] md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <ReadingRoomLogo />
                <div className="min-w-0">
                  <h1 className="hero-title truncate text-[1.75rem] text-[#f1e2ba] md:text-[2rem]">
                    Britannicus Reading Room
                  </h1>
                  <p className="hero-subtitle text-[10px] text-stone-200/90 md:text-xs md:normal-case md:tracking-[0.08em]">
                    Inventory and transaction management
                  </p>
                </div>
              </div>
              {!loading && user ? (
                <div className="flex items-center gap-2 rounded-xl border border-[#2d5f54] bg-[#0f332d]/45 px-2 py-2 backdrop-blur-sm">
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-medium text-stone-100">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-stone-300">{user.role}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="rounded-lg border border-[#d0a95b] bg-[#f6ebd2] px-3 py-1.5 text-sm font-medium text-[#173f36] transition hover:bg-[#efdeb5]"
                  >
                    Logout
                  </button>
                </div>
              ) : null}
            </div>
        </header>
      </div>

      <div className="h-full px-0 pb-0 pt-[86px] md:pt-[96px]">
        <div className="h-full border-t border-[#d6ccb6] bg-[linear-gradient(180deg,#f8f2e2_0%,#f3ead6_100%)] p-3 md:p-4">
          <div className="grid h-full gap-4 lg:grid-cols-[250px_1fr]">
            <aside className="hidden rounded-2xl border border-[#cfbea0] bg-gradient-to-b from-[#f9f2e0] to-[#eee0bd] p-3 shadow-[0_6px_18px_rgba(44,62,56,0.08)] lg:block lg:h-full lg:overflow-y-auto">
            <div className="mb-2 px-2">
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-[#6b7b73]">Navigation</p>
            </div>
            <nav className="space-y-1.5">
              {links.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={navLinkClass(isActive)}
                  >
                    <span>{link.label}</span>
                    <span className={`h-2 w-2 rounded-full ${isActive ? "bg-[#1e564a]" : "bg-transparent group-hover:bg-[#7f968d]"}`} />
                  </Link>
                );
              })}
              <div className="my-3 h-px bg-[#d5c8ab]" />
              {roleLinks
                .filter((link) => link.allowed)
                .map((link) => {
                  const isActive = pathname.startsWith(link.href);
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={navLinkClass(isActive)}
                    >
                      <span>{link.label}</span>
                      <span className={`h-2 w-2 rounded-full ${isActive ? "bg-[#1e564a]" : "bg-transparent group-hover:bg-[#7f968d]"}`} />
                    </Link>
                  );
                })}
            </nav>
            {!loading && user ? (
              <div className="mt-4 rounded-xl border border-[#d5c6a6] bg-[#f7efda] p-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#6a7c75]">Signed in</p>
                <p className="mt-1 text-sm font-semibold text-[#1f3e37]">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-[11px] uppercase tracking-wide text-[#728780]">{user.role}</p>
              </div>
            ) : null}
          </aside>

            <main className="h-full overflow-y-auto rounded-2xl border border-[#d7ccb4] bg-gradient-to-b from-[#fffdf9] to-[#fefaf1] p-5 shadow-[0_8px_24px_rgba(68,79,70,0.08)] md:p-6">
              <div className="mb-5 border-b border-[#e6dcc8] pb-4">
                <h2 className="page-title text-[2rem] md:text-[2.3rem]">{pageTitle}</h2>
                <span className="page-title-accent" />
                {pageDescription ? <p className="mt-1 text-sm text-[#4f655f] md:text-base">{pageDescription}</p> : null}
              </div>
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}