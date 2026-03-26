/**
 * Page Purpose:
 * Access denied page shown when a user lacks permission.
 *
 * What goes here:
 * - Clear explanation of denied access
 * - Safe navigation options (Back/Home)
 *
 * What should NOT go here:
 * - Permission decision logic (keep in middleware/lib)
 */
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16 text-center">
      <h1 className="text-2xl font-semibold text-zinc-900">Unauthorized</h1>
      <p className="mt-3 text-zinc-600">
        You do not have permission to access this page.
      </p>
      <Link href="/items" className="mt-6 inline-block underline">
        Back to items
      </Link>
    </main>
  );
}
