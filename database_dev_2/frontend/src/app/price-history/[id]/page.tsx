/**
 * Page Purpose:
 * Show detailed information for one price history record.
 *
 * What goes here:
 * - Full price history details for one item
 */
import { AppShell } from "@/components/layout/AppShell";

type PriceHistoryDetailsPageProps = {
  params: {
    id: string;
  };
};

export default function PriceHistoryDetailsPage({ params }: PriceHistoryDetailsPageProps) {
  return (
    <AppShell pageTitle={`Price History #${params.id}`} pageDescription="View detailed price history record.">
      <p className="text-sm text-zinc-600">Price history details for #{params.id}.</p>
    </AppShell>
  );
}
